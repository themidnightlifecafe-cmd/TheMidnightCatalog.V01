import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function CommentSection({ parentId, parentType }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [text, setText] = useState('');

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', parentId],
    queryFn: () => base44.entities.Comment.filter({ parent_id: parentId }),
  });

  const addComment = useMutation({
    mutationFn: (data) => base44.entities.Comment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', parentId] });
      setText('');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    addComment.mutate({
      parent_id: parentId,
      parent_type: parentType,
      author_name: user?.full_name || user?.email?.split('@')[0] || 'Anonymous',
      content: text.trim(),
    });
  };

  return (
    <div className="pt-2 space-y-3 border-t border-border">
      {comments.length > 0 && (
        <div className="space-y-2">
          {comments.map(c => (
            <div key={c.id} className="flex gap-2 text-xs">
              <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center font-bold text-[9px] text-muted-foreground flex-shrink-0 mt-0.5">
                {(c.author_name || '?')[0].toUpperCase()}
              </div>
              <div>
                <span className="font-semibold">{c.author_name}</span>
                <span className="text-muted-foreground ml-1.5 text-[10px]">
                  {c.created_date ? formatDistanceToNow(new Date(c.created_date), { addSuffix: true }) : ''}
                </span>
                <p className="text-foreground/80 mt-0.5">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Write a comment…"
          className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <button type="submit" disabled={!text.trim()} className="p-1.5 rounded-lg bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors">
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}