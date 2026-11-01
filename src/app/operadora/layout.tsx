import type { ReactNode } from "react";
import { MolduraApp } from "@/shared/ui/moldura-app";

export default function OperadoraLayout({ children }: { children: ReactNode }) {
  return (
    <MolduraApp>
      <div className="mx-auto w-full max-w-3xl">{children}</div>
    </MolduraApp>
  );
}
