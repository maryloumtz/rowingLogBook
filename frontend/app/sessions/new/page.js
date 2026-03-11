import Link from 'next/link'

export default function NewSessionPage() {
  return (
    <main className="min-h-screen bg-foam px-6 py-10 text-ink lg:px-12">
      <section className="mx-auto max-w-3xl rounded-[2rem] bg-white p-8 shadow-panel ring-1 ring-ink/5">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-surge">
          Sorties
        </p>
        <h1 className="mt-3 text-4xl font-bold">Nouvelle sortie</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-ink/70">
          Point d&apos;entree reserve a la creation d&apos;une nouvelle sortie. Cette page
          permet deja au bouton d&apos;acces rapide du tableau de bord de mener vers une
          destination valide.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-semibold text-foam transition hover:bg-ink/90"
        >
          Retour au tableau de bord
        </Link>
      </section>
    </main>
  )
}
