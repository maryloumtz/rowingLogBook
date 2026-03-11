import Link from 'next/link'
import { WARN_THRESHOLD_MS } from '../lib/constants'
import { mockBoats, mockMembers, mockSessions } from '../lib/mocks'

const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:8080'

async function getApiStatus() {
  try {
    const response = await fetch(`${apiBaseUrl}/api/health`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error('API unavailable')
    }

    return response.json()
  } catch {
    return null
  }
}

function formatElapsedDuration(elapsedMs) {
  const totalMinutes = Math.max(0, Math.floor(elapsedMs / (60 * 1000)))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours === 0) {
    return `${minutes} min`
  }

  return `${hours}h${String(minutes).padStart(2, '0')}`
}

function formatDepartureTime(date) {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function getCurrentSessions(now = new Date()) {
  return mockSessions
    .filter((session) => session.status === 'IN_PROGRESS')
    .map((session) => {
      const boat = mockBoats.find((item) => item.id === session.boatId)
      const responsible = mockMembers.find((member) => member.id === session.responsibleId)
      const departureDate = new Date(session.departureTime)
      const elapsedMs = now.getTime() - departureDate.getTime()

      return {
        id: session.id,
        boatName: boat?.name ?? 'Bateau inconnu',
        responsibleName: responsible
          ? `${responsible.firstName} ${responsible.lastName}`
          : 'Responsable inconnu',
        departureLabel: formatDepartureTime(departureDate),
        elapsedLabel: formatElapsedDuration(elapsedMs),
        isWarning: elapsedMs >= WARN_THRESHOLD_MS,
      }
    })
    .sort((left, right) => Number(right.isWarning) - Number(left.isWarning))
}

export default async function HomePage() {
  const [apiStatus, currentSessions] = await Promise.all([getApiStatus(), getCurrentSessions()])
  const warningCount = currentSessions.filter((session) => session.isWarning).length

  return (
    <main className="min-h-screen bg-foam text-ink">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 py-10 lg:px-12">
        <div className="overflow-hidden rounded-[2rem] bg-ink text-foam shadow-panel">
          <div className="grid gap-8 px-8 py-10 lg:grid-cols-[1.4fr_0.9fr] lg:px-10">
            <div className="space-y-5">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#9fd8ca]">
                Tableau de bord
              </p>
              <div className="space-y-3">
                <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
                  Les bateaux actuellement sur l&apos;eau restent visibles en un coup d&apos;oeil.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-foam/75 sm:text-lg">
                  Suivi en direct des sorties en cours, responsable identifié, heure de départ
                  et durée écoulée. Les sorties dépassant 2h30 sont mises en évidence.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/sessions/new"
                  className="inline-flex items-center justify-center rounded-full bg-[#f3b37a] px-6 py-3 text-sm font-semibold text-ink transition hover:bg-[#f7c392]"
                >
                  Nouvelle sortie
                </Link>
                <div className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/8 px-4 py-3 text-sm text-foam/80">
                  Seuil visuel: 2h30
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
                <p className="text-sm uppercase tracking-[0.2em] text-foam/55">Sorties en cours</p>
                <p className="mt-3 text-4xl font-bold">{currentSessions.length}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
                <p className="text-sm uppercase tracking-[0.2em] text-foam/55">Proches alerte</p>
                <p className="mt-3 text-4xl font-bold text-[#f3b37a]">{warningCount}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
                <p className="text-sm uppercase tracking-[0.2em] text-foam/55">Etat API</p>
                <p className="mt-3 text-xl font-semibold">{apiStatus ? 'Connectee' : 'Hors ligne'}</p>
              </div>
            </div>
          </div>
        </div>

        <section className="rounded-[2rem] bg-white p-6 shadow-panel ring-1 ring-ink/5 sm:p-8">
          <div className="flex flex-col gap-3 border-b border-ink/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-surge">
                Sur l&apos;eau
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Liste des sorties en cours</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-ink/65">
              Affichage du bateau, du responsable, de l&apos;heure de départ et de la durée
              écoulée. Une carte ambre signale une sortie qui dépasse 2h30.
            </p>
          </div>

          <div className="mt-6 grid gap-4">
            {currentSessions.map((session) => (
              <article
                key={session.id}
                className={`rounded-[1.75rem] border p-5 transition sm:p-6 ${
                  session.isWarning
                    ? 'border-ember/35 bg-[#fff1e8] shadow-[0_18px_40px_rgba(239,131,84,0.16)]'
                    : 'border-ink/8 bg-foam/65'
                }`}
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-2xl font-semibold">{session.boatName}</h3>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                          session.isWarning
                            ? 'bg-ember text-white'
                            : 'bg-tide text-surge'
                        }`}
                      >
                        {session.isWarning ? 'A surveiller' : 'En cours'}
                      </span>
                    </div>
                    <p className="text-base text-ink/75">
                      Responsable: <span className="font-medium text-ink">{session.responsibleName}</span>
                    </p>
                  </div>

                  <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:min-w-[340px]">
                    <div className="rounded-2xl bg-white/70 px-4 py-3">
                      <dt className="uppercase tracking-[0.18em] text-ink/45">Depart</dt>
                      <dd className="mt-2 text-lg font-semibold text-ink">{session.departureLabel}</dd>
                    </div>
                    <div className="rounded-2xl bg-white/70 px-4 py-3">
                      <dt className="uppercase tracking-[0.18em] text-ink/45">Duree ecoulee</dt>
                      <dd className="mt-2 text-lg font-semibold text-ink">{session.elapsedLabel}</dd>
                    </div>
                  </dl>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  )
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/login')
}
