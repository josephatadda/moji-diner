export default function Loading() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b bg-background/70 px-3 py-2 backdrop-blur">
        <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
        <div className="ml-auto flex items-center gap-2">
          <div className="h-7 w-24 animate-pulse rounded bg-muted" />
          <div className="h-7 w-36 animate-pulse rounded bg-muted" />
        </div>
      </header>
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-muted/40 dark:bg-background" />
    </div>
  );
}
