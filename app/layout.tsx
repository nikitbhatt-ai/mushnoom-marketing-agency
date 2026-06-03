import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "raemy ai — Marketing & Content Ops",
  description:
    "AI-native, data-driven marketing & content operations. First client: Mushnoom.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
