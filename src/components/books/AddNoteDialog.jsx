import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen } from 'lucide-react';

const NOTE_TYPES = [
  { value: 'reflection', label: '💭 Reflection' },
  { value: 'quote', label: '💬 Quote' },
  { value: 'question', label: '❓ Question' },
  { value: 'highlight', label: '✨ Highlight' },
];

export default function AddNoteDialog({ open, onOpenChange, book, onSave }) {
  const [content, setContent] = useState('');
  const [pageNumber, setPageNumber] = useState('');
  const [noteType, setNoteType] = useState('reflection');

  const handleSave = () => {
    if (!content.trim()) return;
    onSave({
      book_id: book.id,
      book_title: book.title,
      book_cover_url: book.cover_url || '',
      content: content.trim(),
      page_number: pageNumber ? parseInt(pageNumber, 10) : undefined,
      note_type: noteType,
    });
    setContent('');
    setPageNumber('');
    setNoteType('reflection');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            Add Note
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm text-muted-foreground -mt-1 mb-1">
          <span className="font-medium text-foreground">{book?.title}</span>
          {book?.author && <span> · {book.author}</span>}
        </div>

        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Label className="text-xs mb-1 block">Note type</Label>
              <Select value={noteType} onValueChange={setNoteType}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NOTE_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value} className="text-xs">{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-24">
              <Label className="text-xs mb-1 block">Page (optional)</Label>
              <Input
                type="number"
                placeholder="e.g. 42"
                value={pageNumber}
                onChange={(e) => setPageNumber(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs mb-1 block">Your note</Label>
            <Textarea
              autoFocus
              placeholder="Write your thoughts, a quote, or a question..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] text-sm resize-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={!content.trim()}>Save Note</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}