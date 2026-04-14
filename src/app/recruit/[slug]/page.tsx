import type { Metadata } from 'next'
import { LandingHeader } from '@/components/shared/LandingHeader'
import { Footer } from '@/components/shared/Footer'
import { CareersHero } from '@/components/recruit/RecruitHero'
import { JobFilters } from '@/components/recruit/JobFilters'
import { JobCard } from '@/components/recruit/JobCard'
import { Button } from '@/components/ui/button'
import { getPublicJobsSSR } from '@/lib/server/recruitment'

export const revalidate = 300

type SearchParams = Promise<{
  q?: string
  type?: string
  location?: string
  is_remote?: string
  cursor?: string
}>

export const metadata: Metadata = {
  title: 'Careers | Public Job Opportunities',
  description:
    'Browse public job opportunities from businesses, explore open roles, and apply online.',
  alternates: {
    canonical: '/careers',
  },
  openGraph: {
    title: 'Careers | Public Job Opportunities',
    description:
      'Browse public job opportunities from businesses, explore open roles, and apply online.',
    url: '/careers',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Careers | Public Job Opportunities',
    description:
      'Browse public job opportunities from businesses, explore open roles, and apply online.',
  },
}

export default async function CareersPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams

  const jobsResponse = await getPublicJobsSSR({
    q: params.q,
    type: params.type,
    location: params.location,
    is_remote: params.is_remote,
    cursor: params.cursor,
    limit: '12',
  })

  const jobs = jobsResponse.data

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Careers',
    description: 'Public listing of job opportunities across businesses.',
    url: '/careers',
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader />

      <main className="pt-20 md:pt-24">
        <CareersHero />

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />

          <div className="mb-8">
            <JobFilters
              q={params.q}
              type={params.type}
              location={params.location}
              isRemote={params.is_remote}
            />
          </div>

          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Open roles</h2>
              <p className="text-sm text-muted-foreground">
                {jobs.length} role{jobs.length === 1 ? '' : 's'} found
              </p>
            </div>
          </div>

          {jobs.length === 0 ? (
            <div className="rounded-2xl border bg-card p-10 text-center shadow-sm">
              <h3 className="text-lg font-semibold">No jobs found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try adjusting your search terms or filters.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}

          {jobsResponse.next_cursor ? (
            <div className="mt-10 flex justify-center">
              <Button asChild variant="outline" className="rounded-xl">
                <a
                  href={`/careers?${new URLSearchParams({
                    ...(params.q ? { q: params.q } : {}),
                    ...(params.type ? { type: params.type } : {}),
                    ...(params.location ? { location: params.location } : {}),
                    ...(params.is_remote ? { is_remote: params.is_remote } : {}),
                    cursor: jobsResponse.next_cursor,
                  }).toString()}`}
                >
                  Load more
                </a>
              </Button>
            </div>
          ) : null}
        </section>
      </main>

      <Footer />
    </div>
  )
}