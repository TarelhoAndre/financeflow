export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 border-r border-white/10 p-6 lg:block">
          <div className="h-10 w-36 animate-pulse rounded-xl bg-zinc-800" />

          <div className="mt-10 space-y-3">
            <div className="h-10 animate-pulse rounded-xl bg-zinc-900" />
            <div className="h-10 animate-pulse rounded-xl bg-zinc-900" />
            <div className="h-10 animate-pulse rounded-xl bg-zinc-900" />
            <div className="h-10 animate-pulse rounded-xl bg-zinc-900" />
          </div>
        </aside>

        {/* Conteúdo */}
        <section className="flex-1">
          <header className="border-b border-white/10 px-6 py-5 lg:px-8">
            <div className="h-7 w-40 animate-pulse rounded-lg bg-zinc-800" />
          </header>

          <div className="p-6 lg:p-8">
            <div className="h-8 w-52 animate-pulse rounded-lg bg-zinc-800" />

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-28 animate-pulse rounded-2xl border border-white/10 bg-zinc-900"
                />
              ))}
            </div>

            <div className="mt-6 h-72 animate-pulse rounded-2xl border border-white/10 bg-zinc-900" />

            <div className="mt-6 h-80 animate-pulse rounded-2xl border border-white/10 bg-zinc-900" />
          </div>
        </section>
      </div>
    </main>
  );
}