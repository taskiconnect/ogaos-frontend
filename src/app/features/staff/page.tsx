import { FeaturePageClient } from '@/components/landing/features/FeaturePageClient'

export default function StaffManagementPage() {
  return (
    <FeaturePageClient
      id="staff"
      tag="Staff Management"
      title={'Your team.\nAll in one place.'}
      subtitle="Know who showed up, who didn't, and who's performing."
      description="OgaOS gives you a clear view of every team member — their role, attendance, salary, and activity status. No paper registers, no guessing. Just a clean dashboard that tells you exactly what's happening with your people."
      accent="#f43f5e"
      image="https://ik.imagekit.io/jwrqb9lqx/TaskiConnect%20Website/Image_fx%20(34).png"
      benefits={[
        "See every staff member's active/inactive status at a glance",
        'Assign roles — manager, cashier, driver, sales executive, and more',
        'Track attendance without paper registers or spreadsheets',
        'Manage salaries and payment schedules in one place',
        'Staff invited via email — they get their own login portal',
        'Activity log shows what each staff member has done in the system',
        'Onboard new hires directly from the Recruitment module',
        'Deactivate staff instantly when they leave — access revoked',
      ]}
      howItWorks={[
        { step: 1, title: 'Invite your team', body: "Enter each staff member's name, email, and role. They receive an invite to create their OgaOS login. Takes 30 seconds per person." },
        { step: 2, title: 'Assign roles and permissions', body: 'Give each person access only to what they need. A cashier sees sales. A manager sees everything. You stay in control.' },
        { step: 3, title: 'Monitor and manage daily', body: "Check who's active, review attendance, update salaries, and see what's been recorded — all from your staff dashboard." },
      ]}
      prevFeature={{ label: 'Recruitment', href: '/features/recruitment' }}
      nextFeature={{ label: 'Digital Store', href: '/features/store' }}
    />
  )
}