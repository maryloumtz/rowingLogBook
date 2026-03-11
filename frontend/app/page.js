const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:8080';

async function getApiStatus() {
  try {
    const response = await fetch(`${apiBaseUrl}/api/health`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('API unavailable');
    }

    return response.json();
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const apiStatus = await getApiStatus();

  return (
    <main className="min-h-screen bg-foam text-ink">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-10 px-6 py-16 lg:flex-row lg:items-center lg:px-12">
        <div className="max-w-2xl space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-surge">
            Rowing LogBook
          </p>
          <h1 className="text-5xl font-bold leading-tight sm:text-6xl">
            Journalise tes sorties, analyse tes cycles, garde ton cap.
          </h1>
          <p className="max-w-xl text-lg leading-8 text-ink/75">
            Base de projet avec Next.js pour l&apos;interface, Spring Boot pour l&apos;API
            et PostgreSQL pour la persistance.
          </p>
        </div>

        <div className="w-full max-w-xl rounded-[2rem] bg-white p-8 shadow-panel ring-1 ring-ink/5">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Etat de l&apos;API</h2>
            <span className="rounded-full bg-tide px-3 py-1 text-sm font-medium text-surge">
              {apiStatus ? 'Connectee' : 'Hors ligne'}
            </span>
          </div>

          <div className="space-y-4 text-sm text-ink/80">
            <p>
              Endpoint attendu: <code className="rounded bg-foam px-2 py-1">GET /api/health</code>
            </p>
            <p>
              Source API: <code className="rounded bg-foam px-2 py-1">{apiBaseUrl}</code>
            </p>
            <pre className="overflow-x-auto rounded-2xl bg-ink p-4 text-foam">
              {JSON.stringify(
                apiStatus ?? { status: 'DOWN', message: 'Demarre le stack Docker compose' },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      </section>
    </main>
  );
}
