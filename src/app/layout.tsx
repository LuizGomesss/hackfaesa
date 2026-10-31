import { Accessibility, BusFront } from "lucide-react";
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Buzu | Assistente de embarque",
  description:
    "Protótipo que indica o embarque com menos lotação esperada na Grande Vitória.",
};

export const viewport: Viewport = {
  themeColor: "#0b4f8c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:z-10 focus:bg-card focus:p-3"
        >
          Pular para o conteúdo
        </a>
        <header className="border-b-4 border-accent bg-primary text-primary-foreground">
          <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-4">
            <Link
              href="/"
              className="flex min-h-12 items-center gap-2 text-xl font-bold"
            >
              <BusFront aria-hidden="true" />
              Buzu
            </Link>
            <Link
              href="/acessibilidade"
              className="flex min-h-12 items-center gap-1.5 text-sm font-semibold"
            >
              <Accessibility aria-hidden="true" />
              Acessibilidade
            </Link>
          </div>
        </header>
        <Providers>
          <main id="conteudo" className="flex-1 px-4 py-5">
            {children}
          </main>
        </Providers>
        <footer className="px-4 pb-4 text-center text-xs text-muted-foreground">
          Protótipo acadêmico do Hack FAESA 15. Não é um serviço oficial do
          Governo do Espírito Santo nem da Ceturb.
        </footer>
      </body>
    </html>
  );
}
