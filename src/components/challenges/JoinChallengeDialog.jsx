import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { Loader2, Trophy } from 'lucide-react';

export default function JoinChallengeDialog({ open, onOpenChange, onJoined, userName }) {
  const [code, setCode] = useState('');
  const [name, setName] = useState(userName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [found, setFound] = useState(null);

  const handleLookup = async () => {
    setLoading(true); setError(''); setFound(null);
    const results = await base44.entities.Challenge.filter({ join_code: code.trim().toUpperCase() });
    if (!results.length) { setError('No challenge found with that code.'); setLoading(false); return; }
    setFound(results[0]);
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!found || !name.trim()) return;
    setLoading(true);
    await base44.entities.ChallengeParticipant.create({
      challenge_id: found.id,
      challenge_title: found.title,
      participant_name: name.trim(),
      progress: 0,
      completed: false,
    });
    onJoined?.();
    setCode(''); setName(''); setFound(null); setError('');
    onOpenChange(false);
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setCode(''); setFound(null); setError(''); } }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2"><Trophy className="w-4 h-4 text-primary" /> Join a Challenge</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-xs mb-1 block">Your name</Label>
            <Input placeholder="How should you appear on the leaderboard?" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Challenge code</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. AB12CD"
                value={code}
                onChange={e => { setCode(e.target.value.toUpperCase()); setFound(null); setError(''); }}
                className="font-mono tracking-widest uppercase"
                maxLength={6}
              />
              <Button size="sm" onClick={handleLookup} disabled={code.length < 4 || loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Find'}
              </Button>
            </div>
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
          </div>

          {found && (
            <div className="p-3 rounded-xl border border-primary/30 bg-primary/5 space-y-1">
              <p className="font-heading font-bold text-sm">{found.title}</p>
              {found.description && <p className="text-xs text-muted-foreground">{found.description}</p>}
              <p className="text-xs text-muted-foreground">Created by {found.creator_name}</p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button size="sm" onClick={handleJoin} disabled={!found || !name.trim() || loading}>Join!</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}