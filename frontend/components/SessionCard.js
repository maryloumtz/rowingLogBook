'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { WARN_THRESHOLD_MS } from '../lib/constants'
import { getCurrentUserId } from '../lib/auth'

function formatDuration(ms) {
  const totalMinutes = Math.floor(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes} min`
  return `${hours}h${String(minutes).padStart(2, '0')}`
}

export default function SessionCard({ session }) {
  const router = useRouter()
  const [elapsed, setElapsed] = useState(
    () => Date.now() - new Date(session.startTime).getTime()
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - new Date(session.startTime).getTime())
    }, 60000)
    return () => clearInterval(interval)
  }, [session.startTime])

  const isWarning = elapsed > WARN_THRESHOLD_MS
  const isOwner = String(session.createdById) === getCurrentUserId()

  function handleClick() {
    if (isOwner) router.push(`/sessions/${session.id}/close`)
  }

  return (
    <article
      role="article"
      onClick={handleClick}
      className={[
        'rounded-[1.75rem] border p-5 transition sm:p-6',
        isWarning
          ? 'border-ember/35 bg-[#fff1e8] shadow-[0_18px_40px_rgba(239,131,84,0.16)]'
          : 'border-ink/8 bg-foam/65',
        isOwner ? 'cursor-pointer hover:shadow-md' : 'cursor-default',
      ].join(' ')}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-2xl font-semibold text-ink">{session.boatName ?? '—'}</h3>
            <span
              className={[
                'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]',
                isWarning ? 'bg-ember text-white' : 'bg-tide text-surge',
              ].join(' ')}
            >
              {isWarning ? 'À surveiller' : 'En cours'}
            </span>
            {isWarning && (
              <span aria-label="Avertissement durée dépassée">⚠️</span>
            )}
          </div>
          <p className="text-base text-ink/70">
            Responsable :{' '}
            <span className="font-medium text-ink">{session.createdByName}</span>
          </p>
          {isOwner && (
            <p className="text-xs font-medium text-surge">Appuyer pour clôturer →</p>
          )}
        </div>

        <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:min-w-[300px]">
          <div className="rounded-2xl bg-white/70 px-4 py-3">
            <dt className="text-xs uppercase tracking-[0.18em] text-ink/45">Départ</dt>
            <dd className="mt-1 text-lg font-semibold text-ink">
              {new Date(session.startTime).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </dd>
          </div>
          <div className="rounded-2xl bg-white/70 px-4 py-3">
            <dt className="text-xs uppercase tracking-[0.18em] text-ink/45">Durée écoulée</dt>
            <dd className={[
              'mt-1 text-lg font-semibold',
              isWarning ? 'text-ember' : 'text-ink',
            ].join(' ')}>
              {formatDuration(elapsed)}
            </dd>
          </div>
        </dl>
      </div>
    </article>
  )
}
