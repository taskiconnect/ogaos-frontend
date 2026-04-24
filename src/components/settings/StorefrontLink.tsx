// src/components/settings/StorefrontLink.tsx
'use client'

import { useState } from 'react'
import { Check, Copy, ExternalLink, Eye, EyeOff } from 'lucide-react'

interface StorefrontLinkProps {
  slug: string
  isPublic: boolean
}

export default function StorefrontLink({ slug, isPublic }: StorefrontLinkProps) {
  const [copied, setCopied] = useState(false)
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const url = `${baseUrl}/public/${slug}`

  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="mt-4 space-y-3">
      <p className="text-xs text-gray-500">Your storefront link:</p>

      <div className="flex items-center gap-2 bg-white/3 border border-white/10 rounded-xl px-4 py-3">
        <span className="flex-1 text-xs font-mono text-primary truncate">{url}</span>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 hover:bg-white/10 hover:text-white transition-colors shrink-0 font-semibold"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy
            </>
          )}
        </button>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary hover:bg-primary/20 transition-colors shrink-0 font-semibold"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Open
        </a>
      </div>

      <div className="flex items-center gap-2 text-xs">
        {isPublic ? (
          <>
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400">Live — customers can visit this link</span>
          </>
        ) : (
          <>
            <EyeOff className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-gray-500">Hidden — enable the toggle above to go live</span>
          </>
        )}
      </div>
    </div>
  )
}