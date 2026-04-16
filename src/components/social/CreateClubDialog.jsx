import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function CreateClubDialog({ open, onOpenChange, onSave, userName }) {
  const [form, setForm] = useState({ name: '', description: '', current_book_title: '', current_book_author: '' });

  const handleSave = () => {
    if (!form.name.trim()) return;
    onSave({ ...form, join_code: generateCode(), creator_name: userName || 'Anonymous', is_public: true });
    setForm({ name: '', description: '', current_book_title: '', current_book_author: '' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="font-heading">Create a Book Club</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-xs mb-1 block">Club name *</Label>
            <Input placeholder="e.g. Mystery Lovers Circle" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Description</Label>
            <Textarea placeholder="What's your club about?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="resize-none h-16 text-sm" />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Currently reading (optional)</Label>
            <Input placeholder="Book title" value={form.current_book_title} onChange={e => setForm(f => ({ ...f, current_book_title: e.target.value }))} className="mb-2" />
            <Input placeholder="Author" value={form.current_book_author} onChange={e => setForm(f => ({ ...f, current_book_author: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={!form.name.trim()}>Create Club</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}