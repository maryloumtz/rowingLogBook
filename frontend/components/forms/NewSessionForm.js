'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { getToken, getCurrentUserId } from '../../lib/auth'

const schema = z.object({
  boatId: z.string().min(1, 'Choisissez un bateau'),
  departureTime: z
    .string()
    .min(1, "L'heure de départ est requise")
    .refine((val) => new Date(val) <= new Date(), {
      message: "L'heure de départ ne peut pas être dans le futur",
    }),
  plannedDistanceKm: z
    .string()
    .min(1, 'Entrez une distance valide')
    .refine((v) => !isNaN(parseFloat(v)), { message: 'Entrez une distance valide' })
    .transform((v) => parseFloat(v))
    .refine((v) => v > 0, { message: 'La distance doit être supérieure à 0' }),
  route: z.string().optional(),
  crewMemberIds: z.array(z.string()).optional(),
  preRemarks: z.string().optional(),
})

function toDatetimeLocal(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  )
}

async function submitSession(data) {
  const response = await fetch('/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.message ?? 'Erreur lors de la création')
  }
  return response.json()
}

export default function NewSessionForm() {
  const router = useRouter()
  const [boats, setBoats] = useState([])
  const [members, setMembers] = useState([])

  useEffect(() => {
    const headers = { Authorization: `Bearer ${getToken()}` }
    fetch('/api/boats', { headers }).then((r) => r.json()).then(setBoats).catch(() => {})
    fetch('/api/members', { headers }).then((r) => r.json()).then(setMembers).catch(() => {})
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      boatId: '',
      departureTime: toDatetimeLocal(new Date()),
      plannedDistanceKm: undefined,
      route: '',
      crewMemberIds: [],
      preRemarks: '',
    },
  })

  async function onSubmit(data) {
    try {
      await submitSession({
        boatId: Number(data.boatId),
        createdById: Number(getCurrentUserId()),
        startTime: new Date(data.departureTime).toISOString(),
      })
      router.push('/dashboard')
    } catch (err) {
      setError('root', { message: err.message })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Bateau */}
      <div>
        <label htmlFor="boatId" className="mb-1 block text-sm font-medium text-ink">
          Bateau
        </label>
        <select
          id="boatId"
          {...register('boatId')}
          className="w-full rounded-xl border border-ink/20 bg-foam px-4 py-2.5 text-sm outline-none focus:border-surge focus:ring-2 focus:ring-surge/20"
        >
          <option value="">— Choisir un bateau —</option>
          {boats.map((boat) => (
            <option key={boat.id} value={boat.id}>
              {boat.name} — {boat.type} (cap. {boat.capacity})
            </option>
          ))}
        </select>
        {errors.boatId && (
          <p className="mt-1 text-xs text-ember">{errors.boatId.message}</p>
        )}
      </div>

      {/* Heure de départ */}
      <div>
        <label htmlFor="departureTime" className="mb-1 block text-sm font-medium text-ink">
          Heure de départ
        </label>
        <input
          id="departureTime"
          type="datetime-local"
          {...register('departureTime')}
          className="w-full rounded-xl border border-ink/20 bg-foam px-4 py-2.5 text-sm outline-none focus:border-surge focus:ring-2 focus:ring-surge/20"
        />
        {errors.departureTime && (
          <p className="mt-1 text-xs text-ember">{errors.departureTime.message}</p>
        )}
      </div>

      {/* Distance planifiée */}
      <div>
        <label htmlFor="plannedDistanceKm" className="mb-1 block text-sm font-medium text-ink">
          Distance prévue (km)
        </label>
        <input
          id="plannedDistanceKm"
          type="number"
          step="0.1"
          min="0"
          {...register('plannedDistanceKm')}
          className="w-full rounded-xl border border-ink/20 bg-foam px-4 py-2.5 text-sm outline-none focus:border-surge focus:ring-2 focus:ring-surge/20"
        />
        {errors.plannedDistanceKm && (
          <p className="mt-1 text-xs text-ember">{errors.plannedDistanceKm.message}</p>
        )}
      </div>

      {/* Parcours */}
      <div>
        <label htmlFor="route" className="mb-1 block text-sm font-medium text-ink">
          Parcours <span className="text-ink/40">(optionnel)</span>
        </label>
        <input
          id="route"
          type="text"
          {...register('route')}
          className="w-full rounded-xl border border-ink/20 bg-foam px-4 py-2.5 text-sm outline-none focus:border-surge focus:ring-2 focus:ring-surge/20"
        />
      </div>

      {/* Équipage */}
      <div>
        <label htmlFor="crewMemberIds" className="mb-1 block text-sm font-medium text-ink">
          Équipage <span className="text-ink/40">(optionnel)</span>
        </label>
        <select
          id="crewMemberIds"
          multiple
          {...register('crewMemberIds')}
          className="w-full rounded-xl border border-ink/20 bg-foam px-4 py-2.5 text-sm outline-none focus:border-surge focus:ring-2 focus:ring-surge/20"
        >
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.firstName} {member.lastName}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-ink/40">Maintenez Ctrl pour sélectionner plusieurs membres</p>
      </div>

      {/* Remarques avant sortie */}
      <div>
        <label htmlFor="preRemarks" className="mb-1 block text-sm font-medium text-ink">
          Remarques <span className="text-ink/40">(optionnel)</span>
        </label>
        <textarea
          id="preRemarks"
          rows={3}
          {...register('preRemarks')}
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
        className="w-full rounded-full bg-ink py-3 text-sm font-semibold text-foam transition hover:bg-ink/85 disabled:opacity-50"
      >
        {isSubmitting ? 'Enregistrement…' : 'Démarrer la sortie'}
      </button>
    </form>
  )
}
