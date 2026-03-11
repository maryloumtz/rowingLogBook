'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import SessionCard from '../../../components/SessionCard'
import { mockBoats, mockMembers, mockSessions } from '../../../lib/mocks'
import { WARN_THRESHOLD_MS } from '../../../lib/constants'
import useAuthStore from '../../../store/authStore'

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
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    fetchActiveSessions()
      .then(setSessions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))

    const tick = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(tick)
  }, [])

  function getBoat(boatId) {
    return mockBoats.find((b) => b.id === boatId) ?? null
  }

  function getMember(userId) {
    return mockMembers.find((m) => m.id === userId) ?? null
  }

  const logout = useAuthStore((s) => s.logout)

  const warningCount = sessions.filter(
    (s) => now - new Date(s.departureTime).getTime() > WARN_THRESHOLD_MS
  ).length

  return (
    <div className="min-h-screen bg-foam text-ink">
      {/* Hero */}
      <section className="bg-ink px-6 py-10 text-foam lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#9fd8ca]">
              Tableau de bord
            </p>
            <button
              onClick={logout}
              className="rounded-full border border-white/15 px-4 py-1.5 text-xs text-foam/60 transition hover:text-foam"
            >
              Déconnexion
            </button>
          </div>
          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
                Les bateaux sur l&apos;eau, visibles en un coup d&apos;œil.
              </h1>
              <p className="max-w-xl text-base leading-7 text-foam/70">
                Sorties en cours, responsable identifié, durée écoulée. Les sorties dépassant 2h30 sont mises en évidence.
              </p>
              <Link
                href="/sessions/new"
                className="inline-flex items-center justify-center rounded-full bg-[#f3b37a] px-6 py-3 text-sm font-semibold text-ink transition hover:bg-[#f7c392]"
              >
                + Nouvelle sortie
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-foam/55">Sorties en cours</p>
                <p className="mt-2 text-4xl font-bold">{sessions.length}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-foam/55">Proches alerte</p>
                <p className="mt-2 text-4xl font-bold text-[#f3b37a]">{warningCount}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Liste */}
      <section className="mx-auto max-w-7xl px-6 py-8 lg:px-12">
        <div className="rounded-[2rem] bg-white p-6 shadow-panel ring-1 ring-ink/5 sm:p-8">
          <div className="border-b border-ink/10 pb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-surge">Sur l&apos;eau</p>
            <h2 className="mt-2 text-2xl font-semibold">Sorties en cours</h2>
          </div>

          <div className="mt-6 space-y-4">
            {loading && (
              <p className="text-center text-sm text-ink/50">Chargement…</p>
            )}
            {error && (
              <p className="rounded-xl bg-ember/10 px-4 py-3 text-sm text-ember">{error}</p>
            )}
            {!loading && !error && sessions.length === 0 && (
              <p className="text-center text-sm text-ink/50">Aucune sortie en cours.</p>
            )}
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                boat={getBoat(session.boatId)}
                responsible={getMember(session.responsibleId)}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
