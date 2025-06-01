import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Orkid CMS",
  description: "Content Management System for Video Tasks",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-gray-900 font-sans`}>
        <main className="min-h-screen flex flex-col items-center justify-center px-4">
          {children}
        </main>
      </body>
    </html>
  );
}
