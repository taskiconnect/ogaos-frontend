import { ShieldCheck } from 'lucide-react'
import Link from 'next/link'
export function UnavailableAccountAction({ title }: { title: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-6 text-foreground">
      <section className="max-w-md rounded-3xl border border-border bg-card p-8">
        <ShieldCheck className="mb-5 size-10 text-blue-400" />
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          This account service is currently unavailable. Please contact your account administrator
          or support for assistance. Your password has not been changed and no recovery email has
          been sent.
        </p>
        <Link
          href="/auth/login"
          className="mt-6 inline-block rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
        >
          Back to sign in
        </Link>
      </section>
    </main>
  )
}
