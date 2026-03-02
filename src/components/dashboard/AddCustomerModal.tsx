'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';

const customerSchema = z.object({
  name: z.string().min(3),
  phone: z.string().min(10),
  email: z.string().email().optional(),
  address: z.string().optional(),
});

type CustomerForm = z.infer<typeof customerSchema>;

interface Props { open: boolean; onOpenChange: (open: boolean) => void; }

export default function AddCustomerModal({ open, onOpenChange }: Props) {
  const form = useForm<CustomerForm>({ resolver: zodResolver(customerSchema) });

  const onSubmit = async (data: CustomerForm) => {
    // TODO: API call
    await new Promise(r => setTimeout(r, 800));
    toast.success(`✅ ${data.name} added to directory! WhatsApp message ready.`);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[rgba(255,255,255,0.03)] border-white/10 text-white rounded-3xl max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <UserPlus className="w-6 h-6 text-primary" /> Add New Customer
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-6">
          <div>
            <Label>Business / Customer Name</Label>
            <Input {...form.register('name')} placeholder="Mama Ngozi Provisions" className="bg-white/5 border-white/10 h-11" />
          </div>
          <div>
            <Label>WhatsApp Phone</Label>
            <Input {...form.register('phone')} placeholder="0803 123 4567" className="bg-white/5 border-white/10 h-11" />
          </div>
          <div>
            <Label>Email (optional)</Label>
            <Input {...form.register('email')} type="email" placeholder="customer@email.com" className="bg-white/5 border-white/10 h-11" />
          </div>
          <div>
            <Label>Address / Shop Location</Label>
            <Input {...form.register('address')} placeholder="Stall 45, Balogun Market" className="bg-white/5 border-white/10 h-11" />
          </div>

          <Button type="submit" className="w-full h-12 text-lg bg-primary hover:bg-primary/90">
            Add Customer & Save to Directory
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}