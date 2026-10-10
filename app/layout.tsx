import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/components/layout/AppProvider";

const manrope = Manrope({ subsets: ["latin", "latin-ext"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  title: "FitAI — mashq qil, rivojlan, jamoangni g‘alabaga olib chiq",
  description: "Sun’iy intellekt yordamida mashqlarni to‘g‘ri bajar, natijalaringni kuzat va maktabing bilan sog‘lom raqobatda qatnash.",
};
export const viewport: Viewport = { themeColor: "#10120F" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={manrope.variable}>
      <body className="font-sans">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
