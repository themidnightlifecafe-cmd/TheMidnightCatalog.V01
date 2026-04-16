import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BookOpen, Trash2, NotebookPen, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const NOTE_TYPE_CONFIG = {
  reflection: { label: 'Reflection', emoji: '💭', color: 'bg-purple-100 text-purple-700' },
  quote: { label: 'Quote', emoji: '💬', color: 'bg-blue-100 text-blue-700' },
  question: { label: 'Question', emoji: '❓', color: 'bg-yellow-100 text-yellow-700' },
  highlight: { label: 'Highlight', emoji: '✨', color: 'bg-green-100 text-green-700' },
};

export default function Journal() {
  const [filterType, setFilterType] = useState('all');
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['reading-notes'],
    queryFn: () => base44.entities.ReadingNote.list('-created_date'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ReadingNote.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reading-notes'] }),
  });

  const filtered = filterType === 'all' ? notes : notes.filter(n => n.note_type === filterType);

  // Group by book
  const grouped = filtered.reduce((acc, note) => {
    const key = note.book_id;
    if (!acc[key]) acc[key] = { title: note.book_title, cover: note.book_cover_url, notes: [] };
    acc[key].notes.push(note);
    return acc;
  }, {});

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold flex items-center gap-2">
            <NotebookPen className="w-6 h-6 text-primary" /> Reading Journal
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{notes.length} private note{notes.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'reflection', 'quote', 'question', 'highlight'].map((type) => {
          const cfg = NOTE_TYPE_CONFIG[type];
          return (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                filterType === type
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {cfg ? `${cfg.emoji} ${cfg.label}` : 'All'}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />)}
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-2xl">
          <StickyNote className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground text-sm">No notes yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Click the 📝 button on any book card to add one</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([bookId, group]) => (
            <div key={bookId}>
              {/* Book header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-14 rounded-lg bg-muted overflow-hidden flex-shrink-0 shadow-sm">
                  {group.cover ? (
                    <img src={group.cover} alt={group.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <BookOpen className="w-4 h-4 text-primary/40" />
                    </div>
                  )}
                </div>
                <h2 className="font-heading font-bold text-base">{group.title}</h2>
              </div>

              {/* Notes */}
              <div className="space-y-3 pl-13">
                {group.notes.map((note) => {
                  const cfg = NOTE_TYPE_CONFIG[note.note_type] || NOTE_TYPE_CONFIG.reflection;
                  return (
                    <div key={note.id} className="relative group rounded-2xl border border-border bg-card p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', cfg.color)}>
                            {cfg.emoji} {cfg.label}
                          </span>
                          {note.page_number && (
                            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                              p. {note.page_number}
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            {note.created_date ? format(new Date(note.created_date), 'MMM d, yyyy') : ''}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteMutation.mutate(note.id)}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{note.content}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}