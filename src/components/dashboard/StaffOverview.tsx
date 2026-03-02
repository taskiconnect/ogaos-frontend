'use client';

import { useState } from 'react';
import { Users, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AddStaffModal from './AddStaffModal';

const mockStaff = [
  { id: 1, name: 'Aisha Bello', role: 'Sales Staff', status: 'online', avatar: 'AB' },
  { id: 2, name: 'Emeka Okafor', role: 'Store Keeper', status: 'offline', avatar: 'EO' },
];

export default function StaffOverview() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-3xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-primary" />
            <div>
              <div className="font-semibold text-lg">Your Team</div>
              <div className="text-sm text-gray-400">2 of 5 staff slots used • Starter Plan</div>
            </div>
          </div>
          <Button onClick={() => setShowModal(true)} className="bg-primary hover:bg-primary/90">
            + Add Staff
          </Button>
        </div>

        <div className="space-y-4">
          {mockStaff.map((staff) => (
            <div key={staff.id} className="flex items-center justify-between bg-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold">
                  {staff.avatar}
                </div>
                <div>
                  <div className="font-medium">{staff.name}</div>
                  <div className="text-xs text-gray-500">{staff.role}</div>
                </div>
              </div>

              <div className={`flex items-center gap-2 text-xs px-3 py-1 rounded-full ${staff.status === 'online' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                <div className={`w-2 h-2 rounded-full ${staff.status === 'online' ? 'bg-emerald-400' : 'bg-gray-400'}`} />
                {staff.status === 'online' ? 'Online now' : 'Offline'}
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" className="w-full mt-6 border-white/20 text-sm" onClick={() => window.location.href = '/staff'}>
          Manage Full Team & Attendance →
        </Button>
      </div>

      <AddStaffModal open={showModal} onOpenChange={setShowModal} />
    </>
  );
}