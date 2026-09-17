export default function TransactionsLoading() {
  return (
    <main className="min-h-screen bg-zinc-950 p-8 text-white">
      <div className="h-8 w-52 animate-pulse rounded-lg bg-zinc-800" />

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl bg-zinc-900"
          />
        ))}
      </div>

      <div className="mt-6 h-20 animate-pulse rounded-2xl bg-zinc-900" />

      <div className="mt-6 h-96 animate-pulse rounded-2xl bg-zinc-900" />
    </main>
  );
}