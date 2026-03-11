'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import useAuthStore from '../../../store/authStore'
import { mockCurrentUser, mockToken } from '../../../lib/mocks'

const schema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
})

const USE_MOCK = true

async function loginRequest(email, password) {
  if (USE_MOCK) {
    // Simule un délai réseau
    await new Promise((r) => setTimeout(r, 300))
    if (email === mockCurrentUser.email && password === 'password') {
      return { token: mockToken, user: mockCurrentUser }
    }
    throw new Error('Email ou mot de passe incorrect')
  }

  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.message ?? 'Identifiants invalides')
  }

  return response.json()
}

export default function LoginPage() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({ resolver: zodResolver(schema) })

  async function onSubmit({ email, password }) {
    try {
      const { token, user } = await loginRequest(email, password)
      setAuth(token, user)
      router.push('/dashboard')
    } catch (err) {
      setError('root', { message: err.message })
    }
  }

  return (
    <div className="flex min-h-screen bg-ink text-foam">
      {/* Panneau gauche — branding */}
      <div className="hidden flex-col justify-between p-12 lg:flex lg:w-1/2">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#9fd8ca]">
          Rowing LogBook
        </p>
        <div className="space-y-4">
          <h1 className="text-5xl font-bold leading-tight">
            Journalise tes sorties,<br />garde ton cap.
          </h1>
          <p className="max-w-sm text-lg leading-7 text-foam/60">
            Suivi des sorties en cours, création et clôture en quelques secondes.
          </p>
        </div>
        <p className="text-xs text-foam/30">© {new Date().getFullYear()} Rowing LogBook</p>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="flex w-full items-center justify-center bg-foam px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-surge lg:hidden">
            Rowing LogBook
          </p>
          <h2 className="mb-8 text-3xl font-bold text-ink">Connexion</h2>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                className="w-full rounded-2xl border border-ink/20 bg-white px-4 py-3 text-sm outline-none focus:border-surge focus:ring-2 focus:ring-surge/20"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-ember">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
                className="w-full rounded-2xl border border-ink/20 bg-white px-4 py-3 text-sm outline-none focus:border-surge focus:ring-2 focus:ring-surge/20"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-ember">{errors.password.message}</p>
              )}
            </div>

            {errors.root && (
              <p className="rounded-2xl bg-ember/10 px-4 py-3 text-sm text-ember">
                {errors.root.message}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-ink py-3 text-sm font-semibold text-foam transition hover:bg-ink/85 disabled:opacity-50"
            >
              {isSubmitting ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-ink/40">
            Mot de passe oublié ?{' '}
            <span className="cursor-not-allowed text-ink/30">Contacter un responsable</span>
          </p>
        </div>
      </div>
    </div>
  )
}
