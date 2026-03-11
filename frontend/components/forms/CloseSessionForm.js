'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { apiPatch } from '../../lib/api'

function toDatetimeLocal(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  )
}

function makeSchema(departureTime) {
  return z.object({
    returnTime: z
      .string()
      .min(1, "L'heure de retour est requise")
      .refine(
        (val) => new Date(val) > new Date(departureTime),
        { message: "L'heure de retour doit être postérieure au départ" }
      ),
    actualDistanceKm: z
      .string()
      .min(1, 'Entrez une distance valide')
      .refine((v) => !isNaN(parseFloat(v)), { message: 'Entrez une distance valide' })
      .transform((v) => parseFloat(v))
      .refine((v) => v > 0, { message: 'La distance doit être supérieure à 0' }),
    postRemarks: z.string().optional(),
  })
}

const USE_MOCK = true

async function closeSession(sessionId, data) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300))
    return { id: sessionId, ...data, status: 'COMPLETED' }
  }
  return apiPatch(`/sessions/${sessionId}/close`, data)
}

export default function CloseSessionForm({ session }) {
  const router = useRouter()
  const schema = makeSchema(session.departureTime)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      returnTime: toDatetimeLocal(new Date()),
      actualDistanceKm: String(session.plannedDistanceKm ?? ''),
      postRemarks: '',
    },
  })

  async function onSubmit(data) {
    try {
      await closeSession(session.id, data)
      router.push('/dashboard')
    } catch (err) {
      setError('root', { message: err.message })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Heure de retour */}
      <div>
        <label htmlFor="returnTime" className="mb-1 block text-sm font-medium text-ink">
          Heure de retour
        </label>
        <input
          id="returnTime"
          type="datetime-local"
          {...register('returnTime')}
          className="w-full rounded-xl border border-ink/20 bg-foam px-4 py-2.5 text-sm outline-none focus:border-surge focus:ring-2 focus:ring-surge/20"
        />
        {errors.returnTime && (
          <p className="mt-1 text-xs text-ember">{errors.returnTime.message}</p>
        )}
      </div>

      {/* Distance réelle */}
      <div>
        <label htmlFor="actualDistanceKm" className="mb-1 block text-sm font-medium text-ink">
          Distance réelle (km)
        </label>
        <input
          id="actualDistanceKm"
          type="number"
          step="0.1"
          min="0"
          {...register('actualDistanceKm')}
          className="w-full rounded-xl border border-ink/20 bg-foam px-4 py-2.5 text-sm outline-none focus:border-surge focus:ring-2 focus:ring-surge/20"
        />
        {errors.actualDistanceKm && (
          <p className="mt-1 text-xs text-ember">{errors.actualDistanceKm.message}</p>
        )}
      </div>

      {/* Remarques après sortie */}
      <div>
        <label htmlFor="postRemarks" className="mb-1 block text-sm font-medium text-ink">
          Remarques <span className="text-ink/40">(optionnel)</span>
        </label>
        <textarea
          id="postRemarks"
          rows={3}
          {...register('postRemarks')}
          className="w-full rounded-xl border border-ink/20 bg-foam px-4 py-2.5 text-sm outline-none focus:border-surge focus:ring-2 focus:ring-surge/20"
        />
      </div>

      {errors.root && (
        <p className="rounded-xl bg-ember/10 px-4 py-2.5 text-sm text-ember">
          {errors.root.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-surge py-3 text-sm font-semibold text-white transition hover:bg-surge/90 disabled:opacity-50"
      >
        {isSubmitting ? 'Enregistrement…' : 'Clôturer la sortie'}
      </button>
    </form>
  )
}
