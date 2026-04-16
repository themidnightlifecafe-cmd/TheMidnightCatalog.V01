import { Users, BookOpen, Copy, Check, Crown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function BookClubCard({ club, memberCount, isMember, isAdmin, onJoin, onOpen }) {
  const [copied, setCopied] = useState(false);

  const copyCode = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(club.join_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
      onClick={() => onOpen(club)}
    >
      {/* Header strip */}
      <div className="h-16 bg-gradient-to-r from-primary/20 via-accent/15 to-secondary/20 flex items-end px-4 pb-2 relative">
        {club.cover_url && (
          <img src={club.cover_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        )}
        <div className="relative z-10 flex items-center justify-between w-full">
          {isAdmin && <Crown className="w-4 h-4 text-chart-4" title="You're the admin" />}
          {isMember && !isAdmin && <span className="text-[10px] bg-secondary/80 text-white px-2 py-0.5 rounded-full font-semibold">Member</span>}
          <button
            onClick={copyCode}
            className="ml-auto flex items-center gap-1 px-2 py-1 rounded-lg bg-white/70 hover:bg-white text-xs font-mono font-bold"
          >
            {copied ? <Check className="w-3 h-3 text-secondary" /> : <Copy className="w-3 h-3" />}
            {club.join_code}
          </button>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-heading font-bold text-base leading-tight">{club.name}</h3>
        {club.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{club.description}</p>}

        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {memberCount} members</span>
          {club.current_book_title && (
            <span className="flex items-center gap-1 truncate"><BookOpen className="w-3.5 h-3.5 flex-shrink-0" /> {club.current_book_title}</span>
          )}
        </div>

        {!isMember && (
          <button
            onClick={(e) => { e.stopPropagation(); onJoin(club); }}
            className="mt-3 w-full text-xs py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            Join Club
          </button>
        )}
      </div>
    </div>
  );
}