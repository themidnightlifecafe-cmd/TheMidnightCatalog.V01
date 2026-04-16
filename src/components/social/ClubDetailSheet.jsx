import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users, BookOpen, Crown } from 'lucide-react';

export default function ClubDetailSheet({ club, open, onClose }) {
  const { data: members = [] } = useQuery({
    queryKey: ['club-members', club?.id],
    queryFn: () => base44.entities.BookClubMember.filter({ club_id: club?.id }),
    enabled: !!club?.id,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['club-reviews', club?.id],
    queryFn: () => base44.entities.BookReview.filter({ club_id: club?.id }),
    enabled: !!club?.id,
  });

  if (!club) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-heading text-xl">{club.name}</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-6">
          {club.description && <p className="text-sm text-muted-foreground">{club.description}</p>}

          {club.current_book_title && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/15">
              <BookOpen className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Currently reading</p>
                <p className="font-heading font-bold text-sm">{club.current_book_title}</p>
                {club.current_book_author && <p className="text-xs text-muted-foreground">{club.current_book_author}</p>}
              </div>
            </div>
          )}

          {/* Members */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Members ({members.length})
            </h3>
            <div className="space-y-1.5">
              {members.map(m => (
                <div key={m.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                    {m.member_name[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{m.member_name}</span>
                  {m.role === 'admin' && <Crown className="w-3 h-3 text-chart-4 ml-auto" />}
                </div>
              ))}
            </div>
          </div>

          {/* Club reviews */}
          {reviews.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Club Reviews</h3>
              <div className="space-y-3">
                {reviews.map(r => (
                  <div key={r.id} className="p-3 rounded-xl border border-border bg-card text-sm">
                    <p className="font-heading font-bold">{r.book_title}</p>
                    <p className="text-xs text-muted-foreground">by {r.reviewer_name}</p>
                    {r.review_text && <p className="text-xs mt-1 text-foreground/80">{r.review_text}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}