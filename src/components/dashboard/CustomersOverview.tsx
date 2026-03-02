'use client';

import { useState } from 'react';
import { Users, Plus, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AddCustomerModal from './AddCustomerModal';

const mockCustomers = [
  { id: 1, name: 'Mama Ngozi Provisions', phone: '0803 123 4567', balance: 42500, last: '2 days ago' },
  { id: 2, name: 'Chukwudi Electricals', phone: '0908 765 4321', balance: 18500, last: '1 week ago' },
];

export default function CustomersOverview() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-3xl p-8 h-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-primary" />
            <div>
              <div className="font-semibold text-lg">Customer Directory</div>
              <div className="text-sm text-gray-400">142 total • 3 with outstanding balance</div>
            </div>
          </div>
          <Button onClick={() => setShowModal(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" /> Add Customer
          </Button>
        </div>

        <div className="space-y-4">
          {mockCustomers.map((c) => (
            <div key={c.id} className="flex items-center justify-between bg-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white font-bold text-sm">
                  {c.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Phone className="w-3 h-3" /> {c.phone}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-rose-400">₦{c.balance.toLocaleString()}</div>
                <div className="text-xs text-gray-500">{c.last}</div>
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" className="w-full mt-6 border-white/20" onClick={() => window.location.href = '/customers'}>
          View Full Directory →
        </Button>
      </div>

      <AddCustomerModal open={showModal} onOpenChange={setShowModal} />
    </>
  );
}