import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Users, Star, Plus, LogIn, PenLine, Rss } from 'lucide-react';

import FriendActivityFeed from '@/components/social/FriendActivityFeed';
import ReviewCard from '@/components/social/ReviewCard';
import BookClubCard from '@/components/social/BookClubCard';
import CreateClubDialog from '@/components/social/CreateClubDialog';
import JoinClubDialog from '@/components/social/JoinClubDialog';
import WriteReviewDialog from '@/components/social/WriteReviewDialog';
import ClubDetailSheet from '@/components/social/ClubDetailSheet';
import ShareUpdateDialog from '@/components/social/ShareUpdateDialog';

export default function Social() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('feed');
  const [createClubOpen, setCreateClubOpen] = useState(false);
  const [joinClubOpen, setJoinClubOpen] = useState(false);
  const [writeReviewOpen, setWriteReviewOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);

  const navigate = useNavigate();
  const userName = user?.full_name || user?.email?.split('@')[0] || 'Anonymous';

  const handleOpenClub = (club) => {
    if (window.innerWidth < 768) {
      navigate(`/social/club/${club.id}`);
    } else {
      setSelectedClub(club);
    }
  };

  const { data: clubs = [] } = useQuery({
    queryKey: ['book-clubs'],
    queryFn: () => base44.entities.BookClub.list('-created_date'),
  });

  const { data: myMemberships = [] } = useQuery({
    queryKey: ['club-memberships'],
    queryFn: () => base44.entities.BookClubMember.filter({ created_by: user?.email }),
  });

  const { data: allMembers = [] } = useQuery({
    queryKey: ['all-club-members'],
    queryFn: () => base44.entities.BookClubMember.list(),
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['book-reviews'],
    queryFn: () => base44.entities.BookReview.list('-created_date', 30),
  });

  const createClubMutation = useMutation({
    mutationFn: async (data) => {
      const club = await base44.entities.BookClub.create(data);
      await base44.entities.BookClubMember.create({ club_id: club.id, club_name: club.name, member_name: userName, role: 'admin' });
      return club;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-clubs'] });
      queryClient.invalidateQueries({ queryKey: ['club-memberships'] });
      queryClient.invalidateQueries({ queryKey: ['all-club-members'] });
    },
  });

  const saveReviewMutation = useMutation({
    mutationFn: (data) => base44.entities.BookReview.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['book-reviews'] }),
  });

  const likeReviewMutation = useMutation({
    mutationFn: ({ review }) => {
      const likedBy = review.liked_by || [];
      const hasLiked = likedBy.includes(user?.email);
      return base44.entities.BookReview.update(review.id, {
        likes: hasLiked ? (review.likes || 1) - 1 : (review.likes || 0) + 1,
        liked_by: hasLiked ? likedBy.filter(e => e !== user?.email) : [...likedBy, user?.email],
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['book-reviews'] }),
  });

  const myClubIds = new Set(myMemberships.map(m => m.club_id));
  const myClubs = clubs.filter(c => myClubIds.has(c.id));
  const discoverClubs = clubs.filter(c => !myClubIds.has(c.id));

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> Social
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Connect with fellow readers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShareOpen(true)} className="gap-1.5">
            <Rss className="w-4 h-4" /> Share Update
          </Button>
          <Button size="sm" onClick={() => setWriteReviewOpen(true)} className="gap-1.5">
            <PenLine className="w-4 h-4" /> Write Review
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted w-full sm:w-auto">
          <TabsTrigger value="feed" className="text-xs gap-1.5 flex-1 sm:flex-none"><Rss className="w-3.5 h-3.5" /> Activity</TabsTrigger>
          <TabsTrigger value="reviews" className="text-xs gap-1.5 flex-1 sm:flex-none"><Star className="w-3.5 h-3.5" /> Reviews</TabsTrigger>
          <TabsTrigger value="clubs" className="text-xs gap-1.5 flex-1 sm:flex-none"><Users className="w-3.5 h-3.5" /> Book Clubs</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Activity Feed */}
      {tab === 'feed' && <FriendActivityFeed />}

      {/* Reviews */}
      {tab === 'reviews' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{reviews.length} reviews</p>
            <Button size="sm" onClick={() => setWriteReviewOpen(true)} className="gap-1.5 h-8">
              <PenLine className="w-3.5 h-3.5" /> Write Review
            </Button>
          </div>
          {reviews.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-2xl text-muted-foreground text-sm">
              No reviews yet — be the first to share your thoughts!
            </div>
          ) : (
            reviews.map(r => (
              <ReviewCard
                key={r.id}
                review={r}
                currentUserEmail={user?.email}
                onLike={(review) => likeReviewMutation.mutate({ review })}
              />
            ))
          )}
        </div>
      )}

      {/* Book Clubs */}
      {tab === 'clubs' && (
        <div className="space-y-6">
          {/* My clubs */}
          {myClubs.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">My Clubs</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myClubs.map(club => (
                  <BookClubCard
                    key={club.id}
                    club={club}
                    memberCount={allMembers.filter(m => m.club_id === club.id).length}
                    isMember
                    isAdmin={club.created_by === user?.email}
                    onOpen={handleOpenClub}
                    onJoin={() => {}}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Discover */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {discoverClubs.length > 0 ? 'Discover Clubs' : 'No other clubs yet'}
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setJoinClubOpen(true)} className="gap-1.5 h-7 text-xs">
                  <LogIn className="w-3.5 h-3.5" /> Join by Code
                </Button>
                <Button size="sm" onClick={() => setCreateClubOpen(true)} className="gap-1.5 h-7 text-xs">
                  <Plus className="w-3.5 h-3.5" /> Create
                </Button>
              </div>
            </div>
            {discoverClubs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {discoverClubs.map(club => (
                  <BookClubCard
                    key={club.id}
                    club={club}
                    memberCount={allMembers.filter(m => m.club_id === club.id).length}
                    isMember={false}
                    onOpen={handleOpenClub}
                    onJoin={(club) => {
                      // Direct join
                      base44.entities.BookClubMember.create({ club_id: club.id, club_name: club.name, member_name: userName, role: 'member' })
                        .then(() => {
                          queryClient.invalidateQueries({ queryKey: ['club-memberships'] });
                          queryClient.invalidateQueries({ queryKey: ['all-club-members'] });
                        });
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed rounded-2xl text-muted-foreground text-sm">
                Create a club and invite friends with the join code!
              </div>
            )}
          </section>
        </div>
      )}

      {/* Dialogs */}
      <CreateClubDialog open={createClubOpen} onOpenChange={setCreateClubOpen} onSave={d => createClubMutation.mutate(d)} userName={userName} />
      <JoinClubDialog open={joinClubOpen} onOpenChange={setJoinClubOpen} onJoined={() => { queryClient.invalidateQueries({ queryKey: ['book-clubs'] }); queryClient.invalidateQueries({ queryKey: ['club-memberships'] }); queryClient.invalidateQueries({ queryKey: ['all-club-members'] }); }} userName={userName} />
      <WriteReviewDialog open={writeReviewOpen} onOpenChange={setWriteReviewOpen} onSave={d => saveReviewMutation.mutate(d)} userName={userName} clubs={myClubs} />
      <ShareUpdateDialog open={shareOpen} onOpenChange={setShareOpen} onSave={(d) => { base44.entities.SocialUpdate.create(d).then(() => queryClient.invalidateQueries({ queryKey: ['social-updates'] })); }} />
      <ClubDetailSheet club={selectedClub} open={!!selectedClub} onClose={() => setSelectedClub(null)} />
    </div>
  );
}