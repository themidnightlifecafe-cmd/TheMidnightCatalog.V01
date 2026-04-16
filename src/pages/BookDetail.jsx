import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Star, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import BookTagSuggester from '@/components/books/BookTagSuggester';
import BookFileViewer from '@/components/books/BookFileViewer';
import BookQuotes from '@/components/books/BookQuotes';
import AddBookDialog from '@/components/books/AddBookDialog';
import AppHeader from '@/components/layout/AppHeader';

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState('');
  const [editOpen, setEditOpen] = useState(false);

  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.Book.list('-updated_date'),
  });
  const book = books.find(b => b.id === id);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Book.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['books'] });
      const prev = queryClient.getQueryData(['books']);
      queryClient.setQueryData(['books'], (old = []) => old.map(b => b.id === id ? { ...b, ...data } : b));
      return { prev };
    },
    onError: (_err, _vars, ctx) => queryClient.setQueryData(['books'], ctx?.prev),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['books'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Book.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['books'] });
      const prev = queryClient.getQueryData(['books']);
      queryClient.setQueryData(['books'], (old = []) => old.filter(b => b.id !== id));
      return { prev };
    },
    onError: (_err, _vars, ctx) => queryClient.setQueryData(['books'], ctx?.prev),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['books'] }),
  });

  const updateTagsMutation = useMutation({
    mutationFn: (tags) => base44.entities.Book.update(id, { tags }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['books'] }),
  });

  if (!book) return (
    <div className="p-6 text-center text-muted-foreground">Book not found.</div>
  );

  const progress = book.total_pages ? Math.round((book.current_page / book.total_pages) * 100) : 0;

  return (
    <div>
      <AppHeader title={book.title} />
      <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-6">
        {/* Cover */}
        <div className="w-full max-w-[180px] mx-auto aspect-[2/3] rounded-xl overflow-hidden bg-muted">
          {book.cover_url ? (
            <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Title + author shown on desktop (mobile uses AppHeader) */}
        <div className="text-center space-y-1">
          <h1 className="font-heading text-xl font-bold md:block hidden">{book.title}</h1>
          <p className="text-sm text-muted-foreground">{book.author}</p>
          {book.genre && <Badge variant="secondary" className="text-xs">{book.genre}</Badge>}
          {book.rating > 0 && (
            <div className="flex items-center justify-center gap-0.5 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={cn("w-4 h-4", i < book.rating ? "fill-chart-4 text-chart-4" : "text-border")} />
              ))}
            </div>
          )}
        </div>

        {/* Progress */}
        {book.status === 'reading' && (
          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Reading Progress</p>
              <p className="text-sm font-bold text-primary">{progress}%</p>
            </div>
            <div className="w-full h-2.5 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">{book.current_page || 0} / {book.total_pages || '?'} pages</p>
            <div className="flex gap-2 mt-3">
              <Input type="number" placeholder="Current page" value={page} onChange={e => setPage(e.target.value)} className="flex-1" />
              <Button size="sm" onClick={() => { updateMutation.mutate({ id: book.id, data: { current_page: Number(page) } }); setPage(''); }} disabled={!page}>
                Update
              </Button>
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {book.start_date && (
            <div className="p-3 rounded-xl bg-muted/40">
              <p className="text-xs text-muted-foreground">Started</p>
              <p className="font-medium">{format(new Date(book.start_date), 'MMM d, yyyy')}</p>
            </div>
          )}
          {book.finish_date && (
            <div className="p-3 rounded-xl bg-muted/40">
              <p className="text-xs text-muted-foreground">Finished</p>
              <p className="font-medium">{format(new Date(book.finish_date), 'MMM d, yyyy')}</p>
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Tags</Label>
          <BookTagSuggester book={book} currentTags={book.tags || []} onTagsChange={tags => updateTagsMutation.mutate(tags)} />
        </div>

        {/* File */}
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Attached File</Label>
          <BookFileViewer book={book} />
        </div>

        {/* Notes */}
        {book.notes && (
          <div>
            <Label className="text-xs text-muted-foreground">Notes</Label>
            <p className="text-sm mt-1 p-3 rounded-xl bg-muted/40">{book.notes}</p>
          </div>
        )}

        {/* Quotes */}
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Highlighted Quotes</Label>
          <BookQuotes book={book} />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-border">
          <Button variant="outline" className="flex-1 gap-2" onClick={() => setEditOpen(true)}>
            <Pencil className="w-4 h-4" /> Edit
          </Button>
          <Button variant="destructive" size="icon" onClick={() => { deleteMutation.mutate(book.id); navigate(-1); }}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <AddBookDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        editBook={book}
        onSave={(data) => { updateMutation.mutate({ id: book.id, data }); setEditOpen(false); }}
      />
    </div>
  );
}