import type { Metadata } from "next";
import { AberturaInicial } from "@/features/abertura";
import "./globals.css";

export const metadata: Metadata = {
  title: "Buzu",
  description: "Seu ônibus na palma da mão.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AberturaInicial>{children}</AberturaInicial>
      </body>
    </html>
  );
}
