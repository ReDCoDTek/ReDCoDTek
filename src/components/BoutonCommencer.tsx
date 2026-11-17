import Link from "next/link";

export function BoutonCommencer({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/calcul"
      className={`flex min-h-14 w-full items-center justify-center rounded-md bg-gain px-6 text-lg font-semibold text-papier shadow-[0_2px_0_0_#123a2c] transition active:translate-y-px active:shadow-none md:w-auto ${className}`}
    >
      Commencer — c’est gratuit
    </Link>
  );
}
