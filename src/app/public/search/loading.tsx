export default function LoadingPublicSearchPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10">
          <div className="h-7 w-52 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-10 w-80 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-5 w-56 animate-pulse rounded bg-slate-200" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-48 animate-pulse rounded-3xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      </section>
    </main>
  )
}