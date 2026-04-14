'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Props = {
  q?: string
  type?: string
  location?: string
  isRemote?: string
}

export function JobFilters({ q = '', type = '', location = '', isRemote = '' }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState(q)
  const [jobType, setJobType] = useState(type || 'all')
  const [jobLocation, setJobLocation] = useState(location)
  const [remoteValue, setRemoteValue] = useState(isRemote || 'all')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const params = new URLSearchParams(searchParams.toString())

    if (query.trim()) params.set('q', query.trim())
    else params.delete('q')

    if (jobLocation.trim()) params.set('location', jobLocation.trim())
    else params.delete('location')

    if (jobType && jobType !== 'all') params.set('type', jobType)
    else params.delete('type')

    if (remoteValue && remoteValue !== 'all') params.set('is_remote', remoteValue)
    else params.delete('is_remote')

    params.delete('cursor')

    router.push(`/recruit?${params.toString()}`)
  }

  function handleReset() {
    setQuery('')
    setJobType('all')
    setJobLocation('')
    setRemoteValue('all')
    router.push('/recruit')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border bg-card p-4 shadow-sm"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search job title or keyword"
        />

        <Input
          value={jobLocation}
          onChange={(e) => setJobLocation(e.target.value)}
          placeholder="Location"
        />

        <Select value={jobType} onValueChange={setJobType}>
          <SelectTrigger>
            <SelectValue placeholder="Job type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All job types</SelectItem>
            <SelectItem value="full_time">Full time</SelectItem>
            <SelectItem value="part_time">Part time</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
            <SelectItem value="internship">Internship</SelectItem>
          </SelectContent>
        </Select>

        <Select value={remoteValue} onValueChange={setRemoteValue}>
          <SelectTrigger>
            <SelectValue placeholder="Work mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All work modes</SelectItem>
            <SelectItem value="true">Remote only</SelectItem>
            <SelectItem value="false">On-site / hybrid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button type="submit">Search jobs</Button>
        <Button type="button" variant="outline" onClick={handleReset}>
          Reset
        </Button>
      </div>
    </form>
  )
}