'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import CloseSessionForm from '../../../../../components/forms/CloseSessionForm'
import { mockSessions } from '../../../../../lib/mocks'
import { getCurrentUserId } from '../../../../../lib/auth'

export default function CloseSessionPage() {
  const { id } = useParams()
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const found = mockSessions.find((s) => s.id === id)

    if (!found || found.responsibleId !== getCurrentUserId()) {
      router.replace('/dashboard')
      return
    }

    setSession(found)
    setReady(true)
  }, [id, router])

  if (!ready) return null

  return (
    <div className="min-h-screen bg-foam pb-12">
      <header className="sticky top-0 z-10 bg-white px-4 py-4 shadow-sm ring-1 ring-ink/5">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-surge">
            ← Retour
          </Link>
          <h1 className="text-lg font-bold text-ink">Clôturer la sortie</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        <CloseSessionForm session={session} />
      </main>
    </div>
  )
}
