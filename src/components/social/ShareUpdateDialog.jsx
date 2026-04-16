import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Send, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

export default function ShareUpdateDialog({ open, onOpenChange, onSave }) {
  const [form, setForm] = useState({
    book_title: '', book_author: '', update_type: 'progress',
    message: '', progress_percent: 50, rating: 0, user_name: '',
  });

  useEffect(() => {
    if (open) {
      base44.auth.me().then((user) => {
        setForm(f => ({ ...f, user_name: user.full_name || user.email }));
      }).catch(() => {});
    }
  }, [open]);

  const handleSave = () => {
    onSave(form);
    setForm(f => ({ ...f, book_title: '', book_author: '', message: '', progress_percent: 50, rating: 0, update_type: 'progress' }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Share an Update
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <Label>Book Title</Label>
            <Input value={form.book_title} onChange={(e) => setForm({ ...form, book_title: e.target.value })} placeholder="What are you reading?" />
          </div>
          <div>
            <Label>Author</Label>
            <Input value={form.book_author} onChange={(e) => setForm({ ...form, book_author: e.target.value })} placeholder="Author name" />
          </div>
          <div>
            <Label>Update Type</Label>
            <Select value={form.update_type} onValueChange={(v) => setForm({ ...form, update_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="started">Just started reading</SelectItem>
                <SelectItem value="progress">Made progress</SelectItem>
                <SelectItem value="finished">Finished the book</SelectItem>
                <SelectItem value="recommendation">Recommend this book</SelectItem>
                <SelectItem value="review">Write a review</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {form.update_type === 'progress' && (
            <div>
              <Label>Progress ({form.progress_percent}%)</Label>
              <Slider
                value={[form.progress_percent]}
                onValueChange={([v]) => setForm({ ...form, progress_percent: v })}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>
          )}

          {form.update_type === 'review' && (
            <div>
              <Label>Rating</Label>
              <div className="flex gap-1 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button key={i} onClick={() => setForm({ ...form, rating: i + 1 })}>
                    <Star className={cn("w-6 h-6 transition-colors", i < form.rating ? "fill-chart-4 text-chart-4" : "text-border hover:text-chart-4/50")} />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label>Message</Label>
            <Textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Share your thoughts..."
              rows={3}
            />
          </div>

          <Button onClick={handleSave} className="w-full" disabled={!form.book_title}>
            Share Update
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}