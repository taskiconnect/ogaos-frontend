export const dynamic = 'force-dynamic'

import { FeaturePageClient } from '@/components/landing/features/FeaturePageClient'

export default function RecruitmentPage() {
  return (
    <FeaturePageClient
      id="recruitment"
      tag="Recruitment"
      title={'Hire better people,\nfaster.'}
      subtitle="Post jobs, review applications, and onboard new hires — without leaving OgaOS."
      description="Finding the right person for your business shouldn't require a full HR department. OgaOS gives you a simple recruitment pipeline — post a role, collect applications, and move candidates through to hire. All in one place."
      accent="#a855f7"
      image="https://ik.imagekit.io/jwrqb9lqx/TaskiConnect%20Website/Image_fx%20(33).png"
      benefits={[
        'Post jobs in under 2 minutes — title, description, salary, deadline',
        'Full-time, part-time, contract, and internship role types',
        'Applicant tracking: review CVs and move candidates through stages',
        'Set salary ranges in naira — shown to applicants upfront',
        'Remote-friendly: toggle on to attract wider talent',
        'Application deadline reminders so you never miss a close date',
        'Search and filter applicants by name, role, or stage',
        'Onboard successful hires directly into staff management',
      ]}
      howItWorks={[
        { step: 1, title: 'Post a job in 2 minutes', body: 'Add a job title, description, type, location, salary range, and deadline. Toggle remote if applicable. Hit Post Job.' },
        { step: 2, title: 'Review applications as they come in', body: 'See all applicants in one place. Review their details, shortlist the best candidates, and move them through your pipeline.' },
        { step: 3, title: 'Hire and onboard', body: 'Accept a candidate and they flow straight into your Staff Management module — roles, salary, and start date all pre-filled.' },
      ]}
      prevFeature={{ label: 'Tax Calculation', href: '/features/tax' }}
      nextFeature={{ label: 'Staff Management', href: '/features/staff' }}
    />
  )
}