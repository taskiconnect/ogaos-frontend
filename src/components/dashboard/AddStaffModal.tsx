'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';

const staffSchema = z.object({
  name: z.string().min(2, 'Name too short'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Phone number required'),
  role: z.enum(['staff', 'manager']),
});

type StaffForm = z.infer<typeof staffSchema>;

interface AddStaffModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddStaffModal({ open, onOpenChange }: AddStaffModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<StaffForm>({
    resolver: zodResolver(staffSchema),
    defaultValues: { name: '', email: '', phone: '', role: 'staff' },
  });

  const onSubmit = async (data: StaffForm) => {
    setIsLoading(true);
    // TODO: Call your real API (create staff with business_id)
    await new Promise((r) => setTimeout(r, 1200));

    toast.success(`Staff member ${data.name} added successfully! They will receive login details via WhatsApp.`);
    form.reset();
    onOpenChange(false);
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[rgba(255,255,255,0.03)] border-white/10 text-white rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <UserPlus className="w-6 h-6 text-primary" />
            Add New Staff Member
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <div className="space-y-1.5">
            <Label>Full Name</Label>
            <Input {...form.register('name')} placeholder="Chukwudi Okeke" className="inputClass" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input {...form.register('email')} type="email" placeholder="chukwudi@business.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Phone (WhatsApp)</Label>
              <Input {...form.register('phone')} placeholder="0803 123 4567" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Role</Label>
            <select {...form.register('role')} className="w-full h-11 bg-white/5 border border-white/10 rounded-lg px-4 text-white">
              <option value="staff">Staff (can record sales & view ledger)</option>
              <option value="manager">Manager (full access except billing)</option>
            </select>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full h-12 text-lg">
            {isLoading ? 'Adding staff...' : 'Add Staff & Send Login Details'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}