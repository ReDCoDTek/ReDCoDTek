import Link from "next/link";

export function PiedDePage() {
  return (
    <footer className="border-t border-filet px-4 py-8 text-sm text-encre-douce">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 md:flex-row md:justify-between">
        <p>© {new Date().getFullYear()} Tarif Juste</p>
        <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Informations légales">
          <Link href="/" className="underline underline-offset-4">Accueil</Link>
        </nav>
      </div>
    </footer>
  );
}
