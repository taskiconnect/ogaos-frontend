'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Briefcase } from 'lucide-react';

interface Props { open: boolean; onOpenChange: (open: boolean) => void; }

export default function PostJobModal({ open, onOpenChange }: Props) {
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Job posted! Candidates will see it in the directory.');
    onOpenChange(false);
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[rgba(255,255,255,0.03)] border-white/10 text-white rounded-3xl max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <Briefcase className="w-6 h-6 text-primary" /> Post New Job
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-6">
          <div>
            <Label>Job Title</Label>
            <Input placeholder="Sales Attendant – Full Time" className="bg-white/5 border-white/10 h-11" />
          </div>
          <div>
            <Label>Salary Range (monthly)</Label>
            <Input placeholder="₦85,000 – ₦120,000" className="bg-white/5 border-white/10 h-11" />
          </div>
          <div>
            <Label>Job Description</Label>
            <Textarea placeholder="Looking for energetic sales person..." className="bg-white/5 border-white/10 min-h-32" />
          </div>
          <div>
            <Label>Location</Label>
            <Input placeholder="Ikeja, Lagos" className="bg-white/5 border-white/10 h-11" />
          </div>

          <Button onClick={handlePost} disabled={loading} className="w-full h-12 text-lg">
            {loading ? 'Posting to Hire-Right...' : 'Post Job to Directory'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}