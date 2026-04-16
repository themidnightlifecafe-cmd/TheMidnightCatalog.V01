import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Plus, LogIn, Trophy } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import CreateChallengeDialog from '@/components/challenges/CreateChallengeDialog';
import JoinChallengeDialog from '@/components/challenges/JoinChallengeDialog';
import ChallengeCard from '@/components/challenges/ChallengeCard';

export default function Challenges() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list('-created_date'),
  });

  const { data: myParticipations = [] } = useQuery({
    queryKey: ['challenge-participations'],
    queryFn: () => base44.entities.ChallengeParticipant.filter({ created_by: user?.email }),
  });

  const { data: allParticipants = [] } = useQuery({
    queryKey: ['all-participants'],
    queryFn: () => base44.entities.ChallengeParticipant.list(),
  });

  const createChallengeMutation = useMutation({
    mutationFn: async (data) => {
      const challenge = await base44.entities.Challenge.create(data);
      // Auto-join as creator
      await base44.entities.ChallengeParticipant.create({
        challenge_id: challenge.id,
        challenge_title: challenge.title,
        participant_name: user?.full_name || user?.email?.split('@')[0] || 'You',
        progress: 0,
        completed: false,
      });
      return challenge;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['challenge-participations'] });
      queryClient.invalidateQueries({ queryKey: ['all-participants'] });
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: ({ id, progress }) => base44.entities.ChallengeParticipant.update(id, { progress }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['all-participants'] }),
  });

  const userName = user?.full_name || user?.email?.split('@')[0] || '';

  // Challenges I've joined
  const myJoinedIds = new Set(myParticipations.map(p => p.challenge_id));
  const myChallenges = challenges.filter(c => myJoinedIds.has(c.id));
  const otherChallenges = challenges.filter(c => !myJoinedIds.has(c.id));

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-chart-4" /> Challenges
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Compete solo or with friends</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setJoinOpen(true)} className="gap-2">
            <LogIn className="w-4 h-4" /> Join
          </Button>
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Create
          </Button>
        </div>
      </div>

      {/* My Challenges */}
      {myChallenges.length > 0 && (
        <section>
          <h2 className="font-heading font-bold text-base mb-3 text-muted-foreground uppercase tracking-wide text-xs">My Challenges</h2>
          <div className="space-y-4">
            {myChallenges.map(challenge => {
              const participants = allParticipants.filter(p => p.challenge_id === challenge.id);
              const mine = myParticipations.find(p => p.challenge_id === challenge.id);
              return (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  participants={participants}
                  myParticipation={mine}
                  onUpdateProgress={(id, progress) => updateProgressMutation.mutate({ id, progress })}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Discover */}
      {otherChallenges.length > 0 && (
        <section>
          <h2 className="font-heading font-bold text-xs mb-3 text-muted-foreground uppercase tracking-wide">Discover Challenges</h2>
          <div className="space-y-4">
            {otherChallenges.map(challenge => {
              const participants = allParticipants.filter(p => p.challenge_id === challenge.id);
              return (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  participants={participants}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Empty state */}
      {!isLoading && challenges.length === 0 && (
        <div className="text-center py-20 border border-dashed rounded-2xl">
          <Trophy className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground text-sm">No challenges yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Create one and share the code with friends!</p>
          <Button className="mt-4" onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Create First Challenge
          </Button>
        </div>
      )}

      <CreateChallengeDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSave={(data) => createChallengeMutation.mutate(data)}
        userName={userName}
      />
      <JoinChallengeDialog
        open={joinOpen}
        onOpenChange={setJoinOpen}
        onJoined={() => {
          queryClient.invalidateQueries({ queryKey: ['challenges'] });
          queryClient.invalidateQueries({ queryKey: ['challenge-participations'] });
          queryClient.invalidateQueries({ queryKey: ['all-participants'] });
        }}
        userName={userName}
      />
    </div>
  );
}