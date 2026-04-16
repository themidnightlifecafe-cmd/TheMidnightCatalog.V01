import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookPlus } from 'lucide-react';

export default function AddBookDialog({ open, onOpenChange, onSave, editBook }) {
  const [form, setForm] = useState(editBook || {
    title: '', author: '', genre: '', total_pages: '', current_page: 0,
    status: 'want_to_read', cover_url: '', notes: '', rating: 0
  });

  const handleSave = () => {
    onSave({
      ...form,
      total_pages: Number(form.total_pages) || 0,
      current_page: Number(form.current_page) || 0,
      rating: Number(form.rating) || 0,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <BookPlus className="w-5 h-5 text-primary" />
            {editBook ? 'Edit Book' : 'Add a Book'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <Label>Title *</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="The Great Gatsby" />
          </div>
          <div>
            <Label>Author *</Label>
            <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="F. Scott Fitzgerald" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="want_to_read">Want to Read</SelectItem>
                  <SelectItem value="reading">Reading</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Genre</Label>
              <Input value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} placeholder="Fiction" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Total Pages</Label>
              <Input type="number" value={form.total_pages} onChange={(e) => setForm({ ...form, total_pages: e.target.value })} placeholder="320" />
            </div>
            <div>
              <Label>Current Page</Label>
              <Input type="number" value={form.current_page} onChange={(e) => setForm({ ...form, current_page: e.target.value })} placeholder="0" />
            </div>
          </div>
          <div>
            <Label>Cover Image URL</Label>
            <Input value={form.cover_url} onChange={(e) => setForm({ ...form, cover_url: e.target.value })} placeholder="https://..." />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="My thoughts..." rows={3} />
          </div>
          <Button onClick={handleSave} className="w-full" disabled={!form.title || !form.author}>
            {editBook ? 'Save Changes' : 'Add to Library'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}