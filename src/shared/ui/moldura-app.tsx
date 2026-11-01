import { Accessibility, BusFront } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export function MolduraApp({ children }: { children: ReactNode }) {
  return (
    <>
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
      <main id="conteudo" className="flex-1 px-4 py-5">
        {children}
      </main>
      <footer className="px-4 pb-4 text-center text-xs text-muted-foreground">
        Protótipo acadêmico do Hack FAESA 15. Não é um serviço oficial do
        Governo do Espírito Santo nem da Ceturb.
      </footer>
    </>
  );
}
