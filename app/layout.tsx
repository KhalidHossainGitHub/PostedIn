import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PostedIn",
  description:
    "Turn messy thoughts into polished, high-quality LinkedIn posts that sound like you.",
  icons: {
    icon: [{ url: "/PostedIn-Icon.ico", type: "image/x-icon" }],
    apple: "/PostedIn-Logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
