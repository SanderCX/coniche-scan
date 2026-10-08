import type { Metadata } from "next";
import { Epilogue } from "next/font/google";
import "./globals.css";
import { PaginaTitel } from "@/components/PaginaTitel";

const epilogue = Epilogue({
  variable: "--font-epilogue",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Coniche Scan",
  description: "Klantcontact-volwassenheidsscan",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="nl"
      className={`${epilogue.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-ink">
        <PaginaTitel />
        {children}
      </body>
    </html>
  );
}
