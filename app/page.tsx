import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="flex max-w-4xl flex-col items-center gap-8 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-black dark:text-zinc-50 sm:text-6xl">
            Discover Events in New Zealand
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Find running, biking, and triathlon events across New Zealand. 
            Search by location, date, or event type.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/events"
              className="rounded-full bg-black px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Browse Events
            </Link>
            <Link
              href="/search"
              className="rounded-full border border-zinc-300 px-8 py-3 text-base font-semibold text-black transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
            >
              Search Events
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
