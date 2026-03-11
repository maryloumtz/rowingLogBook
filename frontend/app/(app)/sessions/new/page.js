'use client'

import Link from 'next/link'
import NewSessionForm from '../../../../components/forms/NewSessionForm'

export default function NewSessionPage() {
  return (
    <div className="min-h-screen bg-foam text-ink">
      {/* Hero */}
      <section className="bg-ink px-6 py-10 text-foam lg:px-12">
        <div className="mx-auto max-w-3xl">
          <Link href="/dashboard" className="text-sm text-[#9fd8ca] hover:text-foam transition">
            ← Retour au tableau de bord
          </Link>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-[#9fd8ca]">
            Sorties
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Nouvelle sortie</h1>
          <p className="mt-3 text-foam/60">
            Renseigne les informations de la sortie avant de prendre l&apos;eau.
          </p>
        </div>
      </section>

      {/* Formulaire */}
      <main className="mx-auto max-w-3xl px-6 py-8 lg:px-12">
        <div className="rounded-[2rem] bg-white p-6 shadow-panel ring-1 ring-ink/5 sm:p-8">
          <NewSessionForm />
        </div>
      </main>
    </div>
  )
}
