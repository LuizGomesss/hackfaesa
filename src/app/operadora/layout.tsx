import type { ReactNode } from "react";

export default function OperadoraLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-3xl">{children}</div>;
}
