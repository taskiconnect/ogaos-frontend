import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { LandingHeader } from '@/components/shared/LandingHeader'
import { Footer } from '@/components/shared/Footer'
import { Button } from '@/components/ui/button'
import { JobApplicationForm } from '@/components/recruit/JobApplicationForm'
import { getPublicJobSSR } from '@/lib/server/recruitment'

type Params = Promise<{ slug: string }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { slug } = await params
  const job = await getPublicJobSSR(slug)

  if (!job) {
    return {
      title: 'Apply | Job not found',
    }
  }

  return {
    title: `Apply for ${job.title}`,
    description: `Submit your application for ${job.title}.`,
    alternates: {
      canonical: `/careers/${job.slug}/apply`,
    },
  }
}

export default async function ApplyPage({
  params,
}: {
  params: Params
}) {
  const { slug } = await params
  const job = await getPublicJobSSR(slug)

  if (!job) notFound()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingHeader />

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button asChild variant="ghost" className="px-0">
            <Link href={`/careers/${job.slug}`}>Back to job details</Link>
          </Button>
        </div>

        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Apply for {job.title}</h1>
          <p className="text-sm text-muted-foreground">
            Complete the application form below to submit your interest.
          </p>
        </div>

        <JobApplicationForm jobId={job.id} jobTitle={job.title} />
      </main>

      <Footer />
    </div>
  )
}