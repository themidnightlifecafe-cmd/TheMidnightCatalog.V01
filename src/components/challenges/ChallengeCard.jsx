import { useState } from 'react';
import { Trophy, Users, Copy, Check, CalendarDays, Zap, BookOpen, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const TYPE_CONFIG = {
  goal_books: { icon: BookOpen, label: 'Book Goal', color: 'bg-purple-100 text-purple-700', unit: 'books' },
  goal_pages: { icon: Layers, label: 'Page Goal', color: 'bg-blue-100 text-blue-700', unit: 'pages' },
  type_genre: { icon: Trophy, label: 'Genre Challenge', color: 'bg-yellow-100 text-yellow-700', unit: 'books' },
  speed: { icon: Zap, label: 'Speed Challenge', color: 'bg-orange-100 text-orange-700', unit: 'days' },
};

export default function ChallengeCard({ challenge, participants = [], myParticipation, onUpdateProgress }) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState('');

  const cfg = TYPE_CONFIG[challenge.challenge_type] || TYPE_CONFIG.goal_books;
  const Icon = cfg.icon;

  const copyCode = () => {
    navigator.clipboard.writeText(challenge.join_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const topParticipants = [...participants]
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 5);

  const myProgress = myParticipation?.progress || 0;
  const pct = Math.min(100, Math.round((myProgress / challenge.target_value) * 100));

  const handleSave = (e) => {
    e.preventDefault();
    const num = parseFloat(inputVal);
    if (!isNaN(num)) onUpdateProgress?.(myParticipation.id, num);
    setEditing(false);
    setInputVal('');
  };

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1', cfg.color)}>
                <Icon className="w-3 h-3" /> {cfg.label}
              </span>
              {challenge.target_genre && (
                <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{challenge.target_genre}</span>
              )}
            </div>
            <h3 className="font-heading font-bold text-base leading-tight">{challenge.title}</h3>
            {challenge.description && <p className="text-xs text-muted-foreground mt-0.5">{challenge.description}</p>}
          </div>
          {/* Join code */}
          <button
            onClick={copyCode}
            className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            title="Copy join code"
          >
            {copied ? <Check className="w-3 h-3 text-secondary" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
            <span className="font-mono text-xs font-bold tracking-widest">{challenge.join_code}</span>
          </button>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><Trophy className="w-3 h-3" /> Goal: {challenge.target_value} {cfg.unit}</span>
          {challenge.end_date && (
            <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Ends {format(new Date(challenge.end_date), 'MMM d')}</span>
          )}
          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {participants.length} joined</span>
        </div>
      </div>

      {/* My progress */}
      {myParticipation && (
        <div className="px-4 pb-3">
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/15">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-primary">Your progress</span>
              {editing ? (
                <form onSubmit={handleSave} className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <input
                    autoFocus
                    type="number"
                    value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                    onKeyDown={e => e.key === 'Escape' && setEditing(false)}
                    placeholder={myProgress.toString()}
                    className="w-16 text-xs border border-primary rounded px-1.5 py-0.5 bg-background focus:outline-none"
                  />
                  <button type="submit" className="text-[10px] px-2 py-0.5 rounded bg-primary text-primary-foreground font-semibold">✓</button>
                </form>
              ) : (
                <button onClick={() => setEditing(true)} className="text-xs text-primary hover:underline">
                  {myProgress} / {challenge.target_value} {cfg.unit}
                </button>
              )}
            </div>
            <div className="w-full h-2 bg-primary/20 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">{pct}% complete · tap number to update</p>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      {topParticipants.length > 0 && (
        <div className="border-t border-border px-4 py-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Leaderboard</p>
          <div className="space-y-1.5">
            {topParticipants.map((p, i) => {
              const pPct = Math.min(100, Math.round((p.progress / challenge.target_value) * 100));
              return (
                <div key={p.id} className="flex items-center gap-2">
                  <span className="text-[10px] font-bold w-4 text-muted-foreground">{i + 1}</span>
                  <span className="text-xs font-medium flex-1 truncate">{p.participant_name}</span>
                  <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-secondary rounded-full" style={{ width: `${pPct}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground w-8 text-right">{p.progress}</span>
                  {p.completed && <Trophy className="w-3 h-3 text-chart-4" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}