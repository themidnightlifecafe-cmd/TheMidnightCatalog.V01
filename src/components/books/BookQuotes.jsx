import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Quote, Trash2, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const COLORS = {
  yellow: 'bg-yellow-50 border-yellow-300 text-yellow-900',
  pink:   'bg-pink-50 border-pink-300 text-pink-900',
  blue:   'bg-blue-50 border-blue-300 text-blue-900',
  green:  'bg-green-50 border-green-300 text-green-900',
};

const DOT_COLORS = {
  yellow: 'bg-yellow-400',
  pink:   'bg-pink-400',
  blue:   'bg-blue-400',
  green:  'bg-green-400',
};

export default function BookQuotes({ book }) {
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState('');
  const [pageNum, setPageNum] = useState('');
  const [color, setColor] = useState('yellow');

  const queryClient = useQueryClient();
  const queryKey = ['quotes', book.id];

  const { data: quotes = [] } = useQuery({
    queryKey,
    queryFn: () => base44.entities.Quote.filter({ book_id: book.id }, '-created_date'),
  });

  const addMutation = useMutation({
    mutationFn: (data) => base44.entities.Quote.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setText('');
      setPageNum('');
      setColor('yellow');
      setAdding(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Quote.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const handleSave = () => {
    if (!text.trim()) return;
    addMutation.mutate({
      book_id: book.id,
      book_title: book.title,
      text: text.trim(),
      page_number: pageNum ? Number(pageNum) : undefined,
      color,
    });
  };

  return (
    <div className="space-y-3">
      {/* Saved quotes list */}
      {quotes.length > 0 && (
        <div className="space-y-2">
          {quotes.map((q) => (
            <div
              key={q.id}
              className={cn('relative p-3 rounded-xl border-l-4 text-sm', COLORS[q.color] || COLORS.yellow)}
            >
              <button
                onClick={() => deleteMutation.mutate(q.id)}
                className="absolute top-2 right-2 opacity-40 hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <p className="italic leading-relaxed pr-5">"{q.text}"</p>
              <div className="flex items-center gap-3 mt-2 text-[11px] opacity-60">
                {q.page_number && <span>p. {q.page_number}</span>}
                <span>{format(new Date(q.created_date), 'MMM d, yyyy')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      {adding ? (
        <div className="p-3 rounded-xl border border-border bg-muted/30 space-y-2">
          <Textarea
            autoFocus
            placeholder="Paste or type the quote…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="text-sm min-h-[80px] resize-none"
          />
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Page #"
              value={pageNum}
              onChange={(e) => setPageNum(e.target.value)}
              className="w-24 h-8 text-sm"
            />
            {/* Color picker */}
            <div className="flex gap-1.5 flex-1">
              {Object.keys(COLORS).map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    'w-5 h-5 rounded-full border-2 transition-all',
                    DOT_COLORS[c],
                    color === c ? 'border-foreground scale-110' : 'border-transparent'
                  )}
                />
              ))}
            </div>
            <Button size="sm" onClick={handleSave} disabled={!text.trim() || addMutation.isPending} className="h-8 text-xs">
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)} className="h-8 px-2">
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all text-sm text-muted-foreground hover:text-primary"
        >
          <Plus className="w-4 h-4" /> Add a quote
        </button>
      )}
    </div>
  );
}