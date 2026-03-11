'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import SessionCard from '../../../components/SessionCard'
import { mockBoats, mockMembers, mockSessions } from '../../../lib/mocks'

const USE_MOCK = true

async function fetchActiveSessions() {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 0))
    return mockSessions
  }
  const response = await fetch('/api/sessions?status=IN_PROGRESS', {
    headers: { 'Content-Type': 'application/json' },
  })
  if (!response.ok) throw new Error('Impossible de charger les sorties')
  return response.json()
}

export default function DashboardPage() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchActiveSessions()
      .then(setSessions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  function getBoat(boatId) {
    return mockBoats.find((b) => b.id === boatId) ?? null
  }

  function getMember(userId) {
    return mockMembers.find((m) => m.id === userId) ?? null
  }

  return (
    <div className="min-h-screen bg-foam pb-24">
      <header className="sticky top-0 z-10 bg-white px-4 py-4 shadow-sm ring-1 ring-ink/5">
        <h1 className="text-lg font-bold text-ink">Sorties en cours</h1>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        {loading && (
          <p className="text-center text-sm text-ink/50">Chargement…</p>
        )}

        {error && (
          <p className="rounded-xl bg-ember/10 px-4 py-3 text-sm text-ember">{error}</p>
        )}

        {!loading && !error && sessions.length === 0 && (
          <p className="text-center text-sm text-ink/50">Aucune sortie en cours.</p>
        )}

        <ul className="space-y-3">
          {sessions.map((session) => (
            <li key={session.id}>
              <SessionCard
                session={session}
                boat={getBoat(session.boatId)}
                responsible={getMember(session.responsibleId)}
              />
            </li>
          ))}
        </ul>
      </main>

      <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4">
        <Link
          href="/sessions/new"
          className="w-full max-w-lg rounded-2xl bg-surge py-4 text-center text-sm font-semibold text-white shadow-lg transition hover:bg-surge/90"
        >
          + Nouvelle sortie
        </Link>
      </div>
    </div>
  )
}
