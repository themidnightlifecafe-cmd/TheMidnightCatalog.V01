import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WriteReviewDialog({ open, onOpenChange, onSave, userName, clubs = [], prefilledBook = null }) {
  const [form, setForm] = useState({
    book_title: prefilledBook?.title || '',
    book_author: prefilledBook?.author || '',
    book_cover_url: prefilledBook?.cover_url || '',
    rating: 0,
    review_text: '',
    club_id: '',
    club_name: '',
  });
  const [hovered, setHovered] = useState(0);

  const handleSave = () => {
    if (!form.book_title || !form.rating) return;
    onSave({ ...form, reviewer_name: userName || 'Anonymous', likes: 0, liked_by: [] });
    setForm({ book_title: '', book_author: '', book_cover_url: '', rating: 0, review_text: '', club_id: '', club_name: '' });
    onOpenChange(false);
  };

  const selectedClub = clubs.find(c => c.id === form.club_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="font-heading">Write a Review</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Label className="text-xs mb-1 block">Book title *</Label>
              <Input placeholder="Title" value={form.book_title} onChange={e => setForm(f => ({ ...f, book_title: e.target.value }))} />
            </div>
            <div className="flex-1">
              <Label className="text-xs mb-1 block">Author</Label>
              <Input placeholder="Author" value={form.book_author} onChange={e => setForm(f => ({ ...f, book_author: e.target.value }))} />
            </div>
          </div>

          <div>
            <Label className="text-xs mb-1.5 block">Your rating *</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button"
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setForm(f => ({ ...f, rating: n }))}
                >
                  <Star className={cn('w-6 h-6 transition-colors', (hovered || form.rating) >= n ? 'fill-chart-4 text-chart-4' : 'text-border')} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs mb-1 block">Your review</Label>
            <Textarea placeholder="What did you think? Share your thoughts..." value={form.review_text} onChange={e => setForm(f => ({ ...f, review_text: e.target.value }))} className="resize-none h-24 text-sm" />
          </div>

          {clubs.length > 0 && (
            <div>
              <Label className="text-xs mb-1 block">Share with club (optional)</Label>
              <Select value={form.club_id} onValueChange={(v) => {
                const c = clubs.find(cl => cl.id === v);
                setForm(f => ({ ...f, club_id: v, club_name: c?.name || '' }));
              }}>
                <SelectTrigger><SelectValue placeholder="Select a club…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Public only</SelectItem>
                  {clubs.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={!form.book_title || !form.rating}>Post Review</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}