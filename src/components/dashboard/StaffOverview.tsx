'use client'

import { useQuery } from '@tanstack/react-query'
import { listStaff } from '@/lib/api/business'
import { Users, UserPlus, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function StaffOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: () => listStaff(),
    staleTime: 60_000,
  })

  const staff = Array.isArray(data) ? data : []
  const activeCount = staff.filter((s: any) => s.is_active !== false).length

  return (
    <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Staff Overview</h3>
            <p className="text-[11px] text-gray-500">
              {isLoading ? '...' : `${activeCount} active member${activeCount !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/settings"
          className="text-xs text-primary hover:text-primary/80 font-semibold transition-colors"
        >
          Manage
        </Link>
      </div>

      {isLoading && (
        <div className="flex-1 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-xl bg-white/5" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-28 bg-white/5 rounded" />
                <div className="h-2 w-20 bg-white/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && staff.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
            <UserPlus className="w-6 h-6 text-blue-400" />
          </div>

          <p className="text-sm font-medium text-white mb-1">No staff added yet</p>

          <p className="text-xs text-gray-500 mb-5 max-w-[200px] leading-relaxed">
            Invite team members to help manage your business
          </p>

          <Link
            href="/dashboard/settings"
            className="h-9 px-5 rounded-xl text-xs font-semibold text-white transition-all flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #002b9d 0%, #3f9af5 100%)' }}
          >
            Invite Staff
          </Link>
        </div>
      )}

      {!isLoading && staff.length > 0 && (
        <div className="flex-1 space-y-3">
          {staff.slice(0, 5).map((member: any) => (
            <div key={member.id} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-primary">
                  {member.first_name?.[0]?.toUpperCase() ?? member.email?.[0]?.toUpperCase() ?? '?'}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {[member.first_name, member.last_name].filter(Boolean).join(' ') || member.email || 'Unnamed staff'}
                </p>
                <p className="text-xs text-gray-500 truncate">{member.email || 'No email'}</p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Circle
                  className={cn(
                    'w-2 h-2 fill-current',
                    member.is_active !== false ? 'text-emerald-400' : 'text-gray-600'
                  )}
                />
                <span
                  className={cn(
                    'text-[10px] font-semibold',
                    member.is_active !== false ? 'text-emerald-400' : 'text-gray-500'
                  )}
                >
                  {member.is_active !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && staff.length > 0 && (
        <div className="pt-4 mt-4 border-t border-white/5">
          <Link
            href="/dashboard/settings"
            className="text-xs text-gray-500 hover:text-white transition-colors flex items-center justify-between"
          >
            <span>View all staff</span>
            <span className="text-primary font-semibold">{staff.length} total</span>
          </Link>
        </div>
      )}
    </div>
  )
}