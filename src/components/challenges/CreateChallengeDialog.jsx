import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CHALLENGE_TYPES = [
  { value: 'goal_books', label: '📚 Read X books', placeholder: 'e.g. 12', unit: 'books', hint: 'How many books to read?' },
  { value: 'goal_pages', label: '📄 Read X pages', placeholder: 'e.g. 5000', unit: 'pages', hint: 'How many pages to read?' },
  { value: 'type_genre', label: '🎭 Read a specific genre', placeholder: 'e.g. 1', unit: 'books', hint: 'How many books of this genre?' },
  { value: 'speed', label: '⚡ Finish a book in X days', placeholder: 'e.g. 7', unit: 'days', hint: 'Days to finish one book' },
];

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function CreateChallengeDialog({ open, onOpenChange, onSave, userName }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    challenge_type: 'goal_books',
    target_value: '',
    target_genre: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
  });

  const typeConfig = CHALLENGE_TYPES.find(t => t.value === form.challenge_type);

  const handleSave = () => {
    if (!form.title || !form.target_value) return;
    onSave({
      ...form,
      target_value: Number(form.target_value),
      join_code: generateCode(),
      creator_name: userName || 'Anonymous',
      is_public: true,
    });
    setForm({ title: '', description: '', challenge_type: 'goal_books', target_value: '', target_genre: '', start_date: new Date().toISOString().split('T')[0], end_date: '' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Create a Challenge</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-xs mb-1 block">Challenge type</Label>
            <Select value={form.challenge_type} onValueChange={(v) => setForm(f => ({ ...f, challenge_type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CHALLENGE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs mb-1 block">Challenge name</Label>
            <Input placeholder="e.g. Summer Reading Sprint" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>

          <div>
            <Label className="text-xs mb-1 block">Description (optional)</Label>
            <Textarea placeholder="What's this challenge about?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="resize-none h-16 text-sm" />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <Label className="text-xs mb-1 block">{typeConfig?.hint}</Label>
              <div className="relative">
                <Input type="number" placeholder={typeConfig?.placeholder} value={form.target_value} onChange={e => setForm(f => ({ ...f, target_value: e.target.value }))} className="pr-14" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{typeConfig?.unit}</span>
              </div>
            </div>
            {form.challenge_type === 'type_genre' && (
              <div className="flex-1">
                <Label className="text-xs mb-1 block">Genre</Label>
                <Input placeholder="e.g. Mystery" value={form.target_genre} onChange={e => setForm(f => ({ ...f, target_genre: e.target.value }))} />
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <Label className="text-xs mb-1 block">Start date</Label>
              <Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
            </div>
            <div className="flex-1">
              <Label className="text-xs mb-1 block">End date (optional)</Label>
              <Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={!form.title || !form.target_value}>Create Challenge</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}