'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { applyToPublicJob } from '@/lib/api/recruitment'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

type Props = {
  jobId: string
  jobTitle: string
}

export function JobApplicationForm({ jobId, jobTitle }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [cv, setCv] = useState<File | null>(null)

  async function onSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await applyToPublicJob(jobId, {
        first_name: String(formData.get('first_name') || ''),
        last_name: String(formData.get('last_name') || ''),
        email: String(formData.get('email') || ''),
        phone_number: String(formData.get('phone_number') || ''),
        cover_letter: String(formData.get('cover_letter') || ''),
        cv,
      })

      setSuccess(`Your application for ${jobTitle} was submitted successfully.`)
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit application'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle>Apply for this role</CardTitle>
        <CardDescription>
          Fill in your details and upload your CV if available.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          action={async (formData) => {
            await onSubmit(formData)
          }}
          className="space-y-5"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first_name">First name</Label>
              <Input id="first_name" name="first_name" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Last name</Label>
              <Input id="last_name" name="last_name" required />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" name="email" type="email" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone number</Label>
              <Input id="phone_number" name="phone_number" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover_letter">Cover letter</Label>
            <Textarea
              id="cover_letter"
              name="cover_letter"
              rows={6}
              placeholder="Tell the employer why you are a strong fit for this role."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cv">CV / Resume</Label>
            <Input
              id="cv"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setCv(e.target.files?.[0] ?? null)}
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-300">
              {success}
            </div>
          ) : null}

          <Button type="submit" disabled={loading} className="rounded-xl">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit application'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}