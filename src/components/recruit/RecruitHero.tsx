import { BriefcaseBusiness, MapPin, Search } from 'lucide-react'

export function CareersHero() {
  return (
    <section className="relative overflow-hidden border-b bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-16 sm:px-6 lg:px-8">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-sm text-muted-foreground">
          <BriefcaseBusiness className="h-4 w-4" />
          Careers
        </div>

        <div className="max-w-3xl space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Find public job opportunities from growing businesses
          </h1>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            Browse open roles, explore remote and on-site opportunities, and apply directly through
            a clean public careers experience.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5">
            <Search className="h-4 w-4" />
            Search by title or keyword
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5">
            <MapPin className="h-4 w-4" />
            Filter by location
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5">
            <BriefcaseBusiness className="h-4 w-4" />
            Public roles across businesses
          </div>
        </div>
      </div>
    </section>
  )
}