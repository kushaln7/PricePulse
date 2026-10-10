import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PricePulse — Short-Term Market Price Prediction System",
  description:
    "Predicting tomorrow's market, using today's data. PricePulse analyzes historical price action, technical signals, and broader market context with a trained XGBoost Regressor.",
  keywords: [
    "PricePulse",
    "Machine Learning",
    "XGBoost",
    "Market Prediction",
    "Quantitative Finance",
    "AAPL",
    "FastAPI",
    "Next.js"
  ],
  authors: [{ name: "PricePulse Team" }]
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#02040a"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#02040a] text-slate-100 antialiased selection:bg-emerald-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
