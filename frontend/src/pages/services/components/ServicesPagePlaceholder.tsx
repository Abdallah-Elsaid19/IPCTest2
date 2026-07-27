export default function ServicesPagePlaceholder() {
  return (
    <section
      className="animate-pulse bg-background-100 py-12"
      aria-busy="true"
      aria-label="Loading services sections"
      role="status"
    >
      <div className="container-content">
        <div className="grid border-l border-t border-background-400 bg-background-200 shadow-xl sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="min-h-44 border-b border-r border-background-400 bg-background-100 p-6"
            >
              <div className="h-3 w-8 rounded-sm bg-primary-500/50" />
              <div className="mt-7 h-5 w-32 rounded-sm bg-background-500/50" />
              <div className="mt-4 h-3 w-full rounded-sm bg-background-400/60" />
              <div className="mt-2 h-3 w-[72%] rounded-sm bg-background-400/60" />
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Loading services content…</span>
    </section>
  );
}
