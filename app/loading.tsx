export default function Loading() {
  return (
    <main
      className="mx-auto w-full max-w-7xl ps-4 pe-4 py-10 sm:ps-6 sm:pe-6 lg:ps-8 lg:pe-8"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">
        جار تحميل المصاحف والكتب الإسلامية
      </span>

      <div className="animate-pulse space-y-10">
        <div className="space-y-4">
          <div className="h-4 w-24 rounded-full bg-primary/20" />

          <div className="h-9 w-72 max-w-full rounded-lg bg-muted" />

          <div className="h-4 w-full max-w-xl rounded-full bg-muted" />

          <div className="h-4 w-full max-w-md rounded-full bg-muted" />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {Array.from({
            length: 8,
          }).map(
            (
              _,
              index,
            ) => (
              <div
                key={
                  index
                }
                className="space-y-4"
              >
                <div className="aspect-[3/4] rounded-2xl bg-muted" />

                <div className="space-y-2">
                  <div className="h-4 w-3/4 rounded-full bg-muted" />

                  <div className="h-3 w-1/2 rounded-full bg-primary/15" />

                  <div className="h-5 w-1/3 rounded-full bg-muted" />
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </main>
  );
}