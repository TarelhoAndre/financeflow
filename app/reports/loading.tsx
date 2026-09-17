export default function ReportsLoading() {
  return (
    <main className="min-h-screen bg-zinc-950 p-8">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-zinc-800" />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map(
          (_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-2xl bg-zinc-900"
            />
          )
        )}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="h-96 animate-pulse rounded-2xl bg-zinc-900" />
        <div className="h-96 animate-pulse rounded-2xl bg-zinc-900" />
      </div>
    </main>
  );
}