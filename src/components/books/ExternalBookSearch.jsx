import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Check, BookOpen, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function ExternalBookSearch({ open, onOpenChange }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [added, setAdded] = useState({});
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: (data) => base44.entities.Book.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      setAdded((prev) => ({ ...prev, [variables._searchKey]: true }));
    },
  });

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setResults([]);
    const res = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=12&fields=key,title,author_name,cover_i,number_of_pages_median,subject`
    );
    const json = await res.json();
    setResults(json.docs || []);
    setSearching(false);
  };

  const handleAdd = (book) => {
    const searchKey = book.key;
    const coverUrl = book.cover_i
      ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
      : '';
    addMutation.mutate({
      _searchKey: searchKey,
      title: book.title,
      author: book.author_name?.[0] || 'Unknown',
      cover_url: coverUrl,
      total_pages: book.number_of_pages_median || undefined,
      genre: book.subject?.[0] || '',
      status: 'want_to_read',
      current_page: 0,
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setQuery(''); setResults([]); setAdded({}); } }}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col gap-0 p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="font-heading flex items-center gap-2">
            <Search className="w-4 h-4 text-primary" /> Search Book Database
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">Search millions of books via Open Library and add them to your collection.</p>
        </DialogHeader>

        {/* Search bar */}
        <div className="px-6 pb-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Search by title, author, or ISBN..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-9"
            />
          </div>
          <Button onClick={handleSearch} disabled={searching || !query.trim()}>
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
          </Button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {searching && (
            <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Searching...</span>
            </div>
          )}

          {!searching && results.length === 0 && query && (
            <div className="text-center py-16 text-muted-foreground">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No results found. Try a different search.</p>
            </div>
          )}

          {!searching && results.length === 0 && !query && (
            <div className="text-center py-16 text-muted-foreground/50">
              <Search className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Start typing to search books</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-2">
              {results.map((book) => {
                const isAdded = added[book.key];
                const coverUrl = book.cover_i
                  ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                  : null;
                return (
                  <div key={book.key} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors">
                    {/* Cover thumbnail */}
                    <div className="w-10 h-14 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                      {coverUrl ? (
                        <img src={coverUrl} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-heading font-semibold text-sm leading-tight line-clamp-1">{book.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {book.author_name?.[0] || 'Unknown author'}
                        {book.number_of_pages_median ? ` · ${book.number_of_pages_median} pages` : ''}
                      </p>
                      {book.subject?.[0] && (
                        <span className="inline-block text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full mt-1">{book.subject[0]}</span>
                      )}
                    </div>

                    {/* Add button */}
                    <Button
                      size="sm"
                      variant={isAdded ? 'secondary' : 'outline'}
                      disabled={isAdded || addMutation.isPending}
                      onClick={() => handleAdd(book)}
                      className="flex-shrink-0 gap-1.5 text-xs"
                    >
                      {isAdded ? <><Check className="w-3.5 h-3.5" /> Added</> : <><Plus className="w-3.5 h-3.5" /> Add</>}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}