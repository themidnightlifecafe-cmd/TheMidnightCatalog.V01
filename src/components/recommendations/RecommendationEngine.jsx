import { useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw, Library, Globe } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReadingProfileCard from './ReadingProfileCard';
import RecommendationCard from './RecommendationCard';
import RecommendationSkeleton from './RecommendationSkeleton';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function RecommendationEngine({ books, booksLoading, user }) {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('all');
  const [addedIds, setAddedIds] = useState(new Set());
  const queryClient = useQueryClient();

  const addBookMutation = useMutation({
    mutationFn: (data) => base44.entities.Book.create(data),
    onSuccess: (_, variables) => {
      setAddedIds(prev => new Set([...prev, variables._recId]));
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });

  const buildProfile = useCallback(() => {
    if (!books.length) return null;

    const completed = books.filter(b => b.status === 'completed');
    const rated = completed.filter(b => b.rating > 0);
    const reading = books.filter(b => b.status === 'reading');

    // Genre frequency
    const genreCount = {};
    books.forEach(b => { if (b.genre) genreCount[b.genre] = (genreCount[b.genre] || 0) + 1; });
    const topGenres = Object.entries(genreCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([g]) => g);

    // Avg rating
    const avgRating = rated.length ? (rated.reduce((s, b) => s + b.rating, 0) / rated.length).toFixed(1) : null;

    // Top rated books
    const topRated = rated.sort((a, b) => b.rating - a.rating).slice(0, 5).map(b => ({ title: b.title, author: b.author, rating: b.rating, genre: b.genre }));

    return { completed, reading, topGenres, avgRating, topRated, totalBooks: books.length };
  }, [books]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setRecommendations(null);

    const profile = buildProfile();

    let prompt;
    if (!profile || books.length < 2) {
      prompt = `Recommend 8 popular must-read books across various genres for a new reader. 
      For each book, provide: title, author, genre, description (2 sentences), reason (why a new reader would enjoy it), cover_url (use https://covers.openlibrary.org/b/title/TITLE-M.jpg replacing TITLE with URL-encoded title), source: "external", estimated_rating (out of 5).`;
    } else {
      const libTitles = books.map(b => b.title);
      prompt = `You are a book recommendation AI. A reader has the following profile:
- Total books in library: ${profile.totalBooks}
- Books completed: ${profile.completed.length}
- Currently reading: ${profile.reading.map(b => b.title).join(', ') || 'none'}
- Favorite genres (by frequency): ${profile.topGenres.join(', ') || 'mixed'}
- Average rating they give: ${profile.avgRating || 'N/A'}/5
- Their top-rated books: ${profile.topRated.map(b => `"${b.title}" by ${b.author} (${b.rating}★)`).join('; ') || 'none yet'}
- Books already in their library (do NOT recommend these): ${libTitles.join(', ')}

Based on this profile, recommend exactly 8 books they would genuinely love. Mix:
- 3 books similar to their top-rated reads
- 3 books in their favorite genres they haven't read
- 2 surprising/diverse picks outside their usual tastes

For each book provide: title, author, genre, description (2 engaging sentences about why it's special), reason (1 sentence personalized to THIS reader's taste), cover_url (use https://covers.openlibrary.org/b/title/TITLE-M.jpg with URL-encoded title), source: "external", estimated_rating (out of 5, your prediction for this reader), match_reason (one of: "similar_to_loved", "favorite_genre", "surprise_pick").`;
    }

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          recommendations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                author: { type: 'string' },
                genre: { type: 'string' },
                description: { type: 'string' },
                reason: { type: 'string' },
                cover_url: { type: 'string' },
                source: { type: 'string' },
                estimated_rating: { type: 'number' },
                match_reason: { type: 'string' },
              },
            },
          },
          profile_summary: { type: 'string' },
        },
      },
    });

    setRecommendations(result);
    setLoading(false);
  };

  const profile = buildProfile();

  const filtered = recommendations?.recommendations?.filter(r => {
    if (tab === 'all') return true;
    if (tab === 'similar') return r.match_reason === 'similar_to_loved';
    if (tab === 'genre') return r.match_reason === 'favorite_genre';
    if (tab === 'surprise') return r.match_reason === 'surprise_pick';
    return true;
  }) || [];

  const handleAddBook = (rec) => {
    addBookMutation.mutate({
      title: rec.title,
      author: rec.author,
      genre: rec.genre,
      cover_url: rec.cover_url,
      status: 'want_to_read',
      _recId: rec.title + rec.author,
    });
  };

  return (
    <div className="space-y-6">
      {/* Profile summary */}
      {!booksLoading && <ReadingProfileCard profile={profile} books={books} />}

      {/* CTA */}
      {!recommendations && !loading && (
        <div className="text-center py-12 rounded-2xl border border-dashed border-primary/30 bg-primary/5">
          <Sparkles className="w-10 h-10 mx-auto text-primary/40 mb-3" />
          <h3 className="font-heading font-bold text-lg">Ready for your picks?</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-5 max-w-xs mx-auto">
            {books.length >= 2
              ? 'Our AI has analyzed your taste. Click to see personalized recommendations.'
              : 'Get started with popular picks — add more books to unlock personalized suggestions.'}
          </p>
          <Button onClick={fetchRecommendations} className="gap-2 bg-primary">
            <Sparkles className="w-4 h-4" /> Generate Recommendations
          </Button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
            <Sparkles className="w-4 h-4 text-primary" />
            Analyzing your reading taste…
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <RecommendationSkeleton key={i} />)}
          </div>
        </div>
      )}

      {/* Results */}
      {recommendations && !loading && (
        <div className="space-y-4">
          {/* Summary bar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              {recommendations.profile_summary && (
                <p className="text-sm text-muted-foreground italic">"{recommendations.profile_summary}"</p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={fetchRecommendations} className="gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>
          </div>

          {/* Tabs */}
          {books.length >= 2 && (
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="bg-muted">
                <TabsTrigger value="all" className="text-xs gap-1"><Sparkles className="w-3 h-3" /> All</TabsTrigger>
                <TabsTrigger value="similar" className="text-xs gap-1"><Library className="w-3 h-3" /> Similar</TabsTrigger>
                <TabsTrigger value="genre" className="text-xs">Your Genres</TabsTrigger>
                <TabsTrigger value="surprise" className="text-xs gap-1"><Globe className="w-3 h-3" /> Surprise</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((rec, i) => (
              <RecommendationCard
                key={i}
                rec={rec}
                isAdded={addedIds.has(rec.title + rec.author)}
                onAdd={() => handleAddBook(rec)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}