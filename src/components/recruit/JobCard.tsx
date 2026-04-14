import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BriefcaseBusiness, Clock3, MapPin, Wallet } from 'lucide-react'
import type { PublicJobItem } from '@/lib/api/types'

function formatJobType(type: string) {
  return type.replaceAll('_', ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}

function formatMoney(value: number | null) {
  if (value == null) return null
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(value)
}

function excerpt(text: string, max = 180) {
  if (text.length <= max) return text
  return `${text.slice(0, max).trim()}...`
}

export function JobCard({ job }: { job: PublicJobItem }) {
  const salaryMin = formatMoney(job.salary_range_min)
  const salaryMax = formatMoney(job.salary_range_max)

  return (
    <Card className="h-full rounded-2xl border shadow-sm">
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{formatJobType(job.type)}</Badge>
          {job.is_remote ? <Badge>Remote</Badge> : null}
        </div>

        <div className="space-y-2">
          <CardTitle className="text-xl leading-tight">
            <Link href={`/recruit/${job.slug}`} className="hover:underline">
              {job.title}
            </Link>
          </CardTitle>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <BriefcaseBusiness className="h-4 w-4" />
              {job.business_name}
            </span>

            {job.location ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {job.location}
              </span>
            ) : null}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-muted-foreground">{excerpt(job.description)}</p>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {(salaryMin || salaryMax) && (
            <span className="inline-flex items-center gap-1.5">
              <Wallet className="h-4 w-4" />
              {salaryMin && salaryMax ? `${salaryMin} – ${salaryMax}` : salaryMin || salaryMax}
            </span>
          )}

          {job.application_deadline && (
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-4 w-4" />
              Apply by {new Date(job.application_deadline).toLocaleDateString()}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex gap-3">
        <Button asChild className="rounded-xl">
          <Link href={`/recruit/${job.slug}`}>View details</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href={`/recruit/${job.slug}/apply`}>Apply now</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}