import os
import math
import random
from PIL import Image, ImageDraw, ImageFilter

def smoothstep(edge0, edge1, x):
    t = max(0.0, min(1.0, (x - edge0) / (edge1 - edge0)))
    return t * t * (3.0 - 2.0 * t)

def lerp(a, b, t):
    return a + (b - a) * t

def rotate_y(x, z, angle):
    cos_a = math.cos(angle)
    sin_a = math.sin(angle)
    return x * cos_a + z * sin_a, -x * sin_a + z * cos_a

def rotate_x(y, z, angle):
    cos_a = math.cos(angle)
    sin_a = math.sin(angle)
    return y * cos_a - z * sin_a, y * sin_a + z * cos_a

def project(x, y, z, width, height, fov=450, cam_z=600):
    denom = z + cam_z
    if denom <= 1:
        denom = 1
    scale = fov / denom
    sx = width / 2.0 + x * scale
    sy = height / 2.0 + y * scale
    return sx, sy, scale

def render_frame(index, total_frames, width, height, is_mobile=False):
    t = index / float(total_frames - 1)  # 0.0 to 1.0
    
    # Base image - dark navy vignette
    img = Image.new("RGBA", (width, height), (3, 7, 18, 255))
    draw = ImageDraw.Draw(img)

    # 1. Perspective Grid on floor
    horizon_y = height * 0.62
    grid_lines = 12
    for i in range(-grid_lines, grid_lines + 1):
        x_top = width / 2.0 + (i * width / 28.0)
        x_bot = width / 2.0 + (i * width / 4.5)
        alpha = int(max(0, min(70, 70 - abs(i) * 5)))
        draw.line([(x_top, horizon_y), (x_bot, height)], fill=(16, 185, 129, alpha), width=1)
    
    for row in range(1, 8):
        frac = (row / 8.0) ** 2.2
        y_pos = horizon_y + frac * (height - horizon_y)
        alpha = int(40 * frac)
        draw.line([(0, y_pos), (width, y_pos)], fill=(6, 182, 212, alpha), width=1)

    # Rotation angles based on scroll progress
    angle_y = t * math.pi * 1.8 + 0.3
    angle_x = math.sin(t * math.pi) * 0.25 - 0.1

    # Stage weights
    # Stage 1: [0.0 - 0.22]
    # Stage 2: [0.22 - 0.45]
    # Stage 3: [0.45 - 0.68]
    # Stage 4: [0.68 - 0.88]
    # Stage 5: [0.88 - 1.0]
    w1 = 1.0 - smoothstep(0.15, 0.25, t)
    w2 = smoothstep(0.18, 0.28, t) * (1.0 - smoothstep(0.40, 0.48, t))
    w3 = smoothstep(0.42, 0.50, t) * (1.0 - smoothstep(0.65, 0.72, t))
    w4 = smoothstep(0.68, 0.75, t) * (1.0 - smoothstep(0.85, 0.90, t))
    w5 = smoothstep(0.86, 0.94, t)

    # Particle count
    num_particles = 90 if is_mobile else 140
    random.seed(42)  # Deterministic particle positions

    particles_2d = []

    for i in range(num_particles):
        # Stage 1: Chaotic dispersed cloud
        u = random.random()
        v = random.random()
        theta = u * 2.0 * math.pi
        phi = math.acos(2.0 * v - 1.0)
        r1 = 180 * (random.random() ** 0.5)
        p1_x = r1 * math.sin(phi) * math.cos(theta)
        p1_y = r1 * math.sin(phi) * math.sin(theta)
        p1_z = r1 * math.cos(phi)

        # Stage 2: Dual Wave ribbons
        frac_wave = (i / float(num_particles)) * 4.0 * math.pi
        p2_x = (i - num_particles / 2.0) * (380.0 / num_particles)
        p2_y = math.sin(frac_wave + t * 4) * 55 + (20 if i % 2 == 0 else -20)
        p2_z = math.cos(frac_wave * 0.5) * 60

        # Stage 3: 4 Orbital clusters + core
        orbit_idx = i % 5
        if orbit_idx == 0:  # Central Core
            r3 = 30 * random.random()
            th3 = random.random() * 2 * math.pi
            p3_x = r3 * math.cos(th3)
            p3_y = r3 * math.sin(th3)
            p3_z = (random.random() - 0.5) * 40
        else:  # 4 Satellites (S&P, NASDAQ, VIX, XLK)
            sat_angle = (orbit_idx - 1) * (math.pi / 2.0) + angle_y * 0.7
            sat_dist = 140.0
            p3_x = math.cos(sat_angle) * sat_dist + (random.random() - 0.5) * 30
            p3_y = (orbit_idx - 2.5) * 35 + math.sin(sat_angle) * 20
            p3_z = math.sin(sat_angle) * sat_dist + (random.random() - 0.5) * 30

        # Stage 4: XGBoost Decision Tree Lattice
        depth = i % 4
        level_y = -100 + depth * 60
        branches = 2 ** depth
        branch_idx = (i // 4) % branches
        spacing = 300 / max(1, branches)
        p4_x = (branch_idx - branches / 2.0 + 0.5) * spacing + (random.random() - 0.5) * 15
        p4_y = level_y + (random.random() - 0.5) * 10
        p4_z = (random.random() - 0.5) * 50

        # Stage 5: Prediction Target Core / Focus Beam
        if i % 3 == 0: # Outer pulse ring
            th5 = (i / float(num_particles)) * 2 * math.pi
            r5 = 85 + math.sin(t * 10 + i) * 6
            p5_x = math.cos(th5) * r5
            p5_y = math.sin(th5) * r5 * 0.5
            p5_z = math.sin(th5) * 30
        elif i % 3 == 1: # Ascending prediction vector beam
            frac_beam = (i % 20) / 20.0
            p5_x = (random.random() - 0.5) * 14
            p5_y = 60 - frac_beam * 170
            p5_z = (random.random() - 0.5) * 14
        else: # High density core
            r5_core = 35 * random.random()
            th5_core = random.random() * 2 * math.pi
            p5_x = math.cos(th5_core) * r5_core
            p5_y = math.sin(th5_core) * r5_core
            p5_z = (random.random() - 0.5) * 30

        # Blend stages together
        px = p1_x * w1 + p2_x * w2 + p3_x * w3 + p4_x * w4 + p5_x * w5
        py = p1_y * w1 + p2_y * w2 + p3_y * w3 + p4_y * w4 + p5_y * w5
        pz = p1_z * w1 + p2_z * w2 + p3_z * w3 + p4_z * w4 + p5_z * w5

        # 3D Rotation
        rx, rz = rotate_y(px, pz, angle_y)
        ry, rz = rotate_x(py, rz, angle_x)

        # 2D Projection
        sx, sy, scale = project(rx, ry, rz, width, height, fov=480 if not is_mobile else 380, cam_z=550)

        # Color mapping depending on stage
        if w5 > 0.5:
            # Emerald green prediction core
            r_col, g_col, b_col = 16, 230, 150
        elif w4 > 0.5:
            # Amber gold & cyan for XGBoost model
            if i % 2 == 0:
                r_col, g_col, b_col = 245, 158, 11
            else:
                r_col, g_col, b_col = 6, 182, 212
        elif w3 > 0.5:
            # Violet & Cyan multi-market context
            r_col, g_col, b_col = (139, 92, 246) if i % 2 == 0 else (6, 182, 212)
        elif w2 > 0.5:
            # Cyan & Emerald signal
            r_col, g_col, b_col = (6, 210, 240) if i % 2 == 0 else (16, 185, 129)
        else:
            # Electric cyan / blue market noise
            r_col, g_col, b_col = (56, 189, 248) if i % 3 == 0 else (34, 197, 94)

        radius = max(1.2, min(5.0, 2.5 * scale))
        alpha = int(max(40, min(230, 180 * scale)))

        particles_2d.append({
            "sx": sx, "sy": sy, "scale": scale, "rad": radius,
            "r": r_col, "g": g_col, "b": b_col, "a": alpha, "rz": rz
        })

    # Sort particles by depth (Z-buffer back to front)
    particles_2d.sort(key=lambda p: p["rz"])

    # Draw connection filaments between proximate nodes
    max_dist = 60 if is_mobile else 85
    num_pts = len(particles_2d)
    for i in range(num_pts):
        p1 = particles_2d[i]
        # check next 6 neighbors
        for j in range(i + 1, min(num_pts, i + 7)):
            p2 = particles_2d[j]
            dx = p1["sx"] - p2["sx"]
            dy = p1["sy"] - p2["sy"]
            dist = math.hypot(dx, dy)
            if dist < max_dist:
                line_alpha = int((1.0 - dist / max_dist) * 90 * p1["scale"])
                if line_alpha > 5:
                    draw.line(
                        [(p1["sx"], p1["sy"]), (p2["sx"], p2["sy"])],
                        fill=(p1["r"], p1["g"], p1["b"], line_alpha),
                        width=1
                    )

    # Draw particles with soft glow halos
    for p in particles_2d:
        sx, sy, rad = p["sx"], p["sy"], p["rad"]
        # Outer glow
        draw.ellipse(
            [sx - rad * 2.2, sy - rad * 2.2, sx + rad * 2.2, sy + rad * 2.2],
            fill=(p["r"], p["g"], p["b"], int(p["a"] * 0.28))
        )
        # Inner sharp core
        draw.ellipse(
            [sx - rad, sy - rad, sx + rad, sy + rad],
            fill=(p["r"], p["g"], p["b"], p["a"])
        )
        # Bright white center dot
        if rad > 2.0:
            draw.ellipse(
                [sx - rad * 0.4, sy - rad * 0.4, sx + rad * 0.4, sy + rad * 0.4],
                fill=(255, 255, 255, int(p["a"] * 0.8))
            )

    # Stage 3 special overlay: Orbital label rings (S&P 500, NASDAQ, VIX, XLK)
    if w3 > 0.3:
        ring_alpha = int(w3 * 75)
        cx, cy = width / 2.0, height / 2.0
        draw.ellipse([cx - 150, cy - 65, cx + 150, cy + 65], outline=(6, 182, 212, ring_alpha), width=1)
        draw.ellipse([cx - 190, cy - 85, cx + 190, cy + 85], outline=(139, 92, 246, int(ring_alpha * 0.6)), width=1)

    # Stage 5 special overlay: Converging Prediction Reticle & Vector Arrow
    if w5 > 0.2:
        cx, cy = width / 2.0, height / 2.0
        r_ret = 65 + (1.0 - w5) * 40
        ret_alpha = int(w5 * 180)
        # Reticle circles
        draw.ellipse([cx - r_ret, cy - r_ret, cx + r_ret, cy + r_ret], outline=(16, 230, 150, ret_alpha), width=2)
        draw.ellipse([cx - r_ret * 0.45, cy - r_ret * 0.45, cx + r_ret * 0.45, cy + r_ret * 0.45], outline=(6, 182, 212, int(ret_alpha * 0.8)), width=1)
        # Crosshair ticks
        tick_len = 16
        draw.line([(cx - r_ret - tick_len, cy), (cx - r_ret + 4, cy)], fill=(16, 230, 150, ret_alpha), width=2)
        draw.line([(cx + r_ret - 4, cy), (cx + r_ret + tick_len, cy)], fill=(16, 230, 150, ret_alpha), width=2)
        draw.line([(cx, cy - r_ret - tick_len), (cx, cy - r_ret + 4)], fill=(16, 230, 150, ret_alpha), width=2)
        draw.line([(cx, cy + r_ret - 4), (cx, cy + r_ret + tick_len)], fill=(16, 230, 150, ret_alpha), width=2)

    return img.convert("RGB")

def generate_sequences():
    desktop_dir = "frontend/public/sequence/desktop"
    mobile_dir = "frontend/public/sequence/mobile"
    os.makedirs(desktop_dir, exist_ok=True)
    os.makedirs(mobile_dir, exist_ok=True)

    # Desktop: 100 frames @ 960x540
    num_desktop = 100
    print(f"Generating {num_desktop} Desktop frames (960x540 WebP)...")
    for i in range(num_desktop):
        frame = render_frame(i, num_desktop, 960, 540, is_mobile=False)
        frame_name = f"frame_{i+1:04d}.webp"
        frame_path = os.path.join(desktop_dir, frame_name)
        frame.save(frame_path, "WEBP", quality=82)
        if (i + 1) % 25 == 0 or i == num_desktop - 1:
            print(f"  Desktop frame {i+1}/{num_desktop} generated.")

    # Mobile: 50 frames @ 480x640
    num_mobile = 50
    print(f"\nGenerating {num_mobile} Mobile frames (480x640 WebP)...")
    for i in range(num_mobile):
        frame = render_frame(i, num_mobile, 480, 640, is_mobile=True)
        frame_name = f"frame_{i+1:04d}.webp"
        frame_path = os.path.join(mobile_dir, frame_name)
        frame.save(frame_path, "WEBP", quality=80)
        if (i + 1) % 25 == 0 or i == num_mobile - 1:
            print(f"  Mobile frame {i+1}/{num_mobile} generated.")

    print("\nCinematic frame sequence generation complete!")

if __name__ == "__main__":
    generate_sequences()
