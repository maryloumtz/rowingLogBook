'use client'

import Link from 'next/link'
import NewSessionForm from '../../../../components/forms/NewSessionForm'

export default function NewSessionPage() {
  return (
    <div className="min-h-screen bg-foam pb-12">
      <header className="sticky top-0 z-10 bg-white px-4 py-4 shadow-sm ring-1 ring-ink/5">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-surge">
            ← Retour
          </Link>
          <h1 className="text-lg font-bold text-ink">Nouvelle sortie</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        <NewSessionForm />
      </main>
    </div>
  )
}
