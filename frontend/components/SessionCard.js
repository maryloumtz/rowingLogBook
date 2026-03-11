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

export default function SessionCard({ session, boat, responsible }) {
  const router = useRouter()
  const [elapsed, setElapsed] = useState(
    () => Date.now() - new Date(session.departureTime).getTime()
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - new Date(session.departureTime).getTime())
    }, 60000)
    return () => clearInterval(interval)
  }, [session.departureTime])

  const isWarning = elapsed > WARN_THRESHOLD_MS
  const isOwner = session.responsibleId === getCurrentUserId()

  function handleClick() {
    if (isOwner) {
      router.push(`/sessions/${session.id}/close`)
    }
  }

  return (
    <div
      role="article"
      onClick={handleClick}
      className={[
        'rounded-2xl p-4 ring-1 transition',
        isWarning
          ? 'bg-ember/10 ring-ember/30 cursor-pointer'
          : 'bg-white ring-ink/10',
        isOwner ? 'cursor-pointer hover:shadow-md' : 'cursor-default',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-ink">{boat?.name ?? '—'}</p>
          <p className="text-sm text-ink/60">
            {responsible?.firstName} {responsible?.lastName}
          </p>
        </div>

        {isWarning && (
          <span
            aria-label="Avertissement durée dépassée"
            className="text-xl"
          >
            ⚠️
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-ink/60">
          Départ :{' '}
          {new Date(session.departureTime).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
        <span
          className={[
            'font-medium',
            isWarning ? 'text-ember' : 'text-surge',
          ].join(' ')}
        >
          {formatDuration(elapsed)}
        </span>
      </div>

      {isOwner && (
        <p className="mt-2 text-xs text-surge">Appuyer pour clôturer →</p>
      )}
    </div>
  )
}
