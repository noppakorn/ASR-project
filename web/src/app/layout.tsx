import "./globals.css";
import { Inter } from "next/font/google";

const prompt = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: "Noodle Shop",
  description: "Noodle Shop with Automatic Speech Recognition",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={prompt.className}>{children}</body>
    </html>
  );
}
