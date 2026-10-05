export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto mb-10 max-w-2xl space-y-3 text-center">
        <div className="mx-auto h-4 w-32 animate-pulse rounded-full bg-muted" />

        <div className="mx-auto h-10 w-48 animate-pulse rounded-xl bg-muted" />

        <div className="mx-auto h-4 w-72 max-w-full animate-pulse rounded-full bg-muted" />
      </div>

      <div className="mb-8 space-y-5">
        <div className="flex flex-wrap gap-2">
          {Array.from({
            length: 6,
          }).map((_, index) => (
            <div
              key={index}
              className="h-9 w-24 animate-pulse rounded-full bg-muted"
            />
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px_90px]">
          <div className="h-11 animate-pulse rounded-xl bg-muted" />
          <div className="h-11 animate-pulse rounded-xl bg-muted" />
          <div className="h-11 animate-pulse rounded-xl bg-muted" />
        </div>

        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
      </div>

      <section className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {Array.from({
          length: 8,
        }).map((_, index) => (
          <div
            key={index}
            className="space-y-3"
          >
            <div className="aspect-[3/4] animate-pulse rounded-xl bg-muted" />

            <div className="h-5 w-4/5 animate-pulse rounded bg-muted" />

            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />

            <div className="h-5 w-1/3 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </section>
    </main>
  );
}