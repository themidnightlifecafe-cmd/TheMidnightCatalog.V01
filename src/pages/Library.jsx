import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Plus, Search, BookOpen, Check, Bookmark, Library as LibraryIcon, Shuffle, Globe, ScanLine } from 'lucide-react';
import BookCard from '@/components/books/BookCard';
import AddBookDialog from '@/components/books/AddBookDialog';
import BookDetailSheet from '@/components/books/BookDetailSheet';
import TBRSpinner from '@/components/books/TBRSpinner';
import ExternalBookSearch from '@/components/books/ExternalBookSearch';
import ISBNScanner from '@/components/books/ISBNScanner';

export default function Library() {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [externalSearchOpen, setExternalSearchOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);

  const queryClient = useQueryClient();

  const { data: books = [], isLoading } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.Book.list('-updated_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Book.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['books'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Book.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      setSelectedBook(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Book.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      setSelectedBook(null);
    },
  });

  const handleSaveBook = (data) => {
    if (editBook) {
      updateMutation.mutate({ id: editBook.id, data });
    } else {
      createMutation.mutate(data);
    }
    setEditBook(null);
  };

  const filtered = books.filter((b) => {
    const matchesTab = tab === 'all' || b.status === tab;
    const matchesSearch = !search ||
      b.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.author?.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const tabCounts = {
    all: books.length,
    reading: books.filter(b => b.status === 'reading').length,
    completed: books.filter(b => b.status === 'completed').length,
    want_to_read: books.filter(b => b.status === 'want_to_read').length,
  };

  const tbrBooks = books.filter(b => b.status === 'want_to_read');

  const handleStartReading = (book) => {
    updateMutation.mutate({ id: book.id, data: { status: 'reading', start_date: new Date().toISOString().split('T')[0] } });
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">My Library</h1>
          <p className="text-sm text-muted-foreground mt-1">{books.length} books in your collection</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setScannerOpen(true)} className="gap-2">
            <ScanLine className="w-4 h-4" /> Scan ISBN
          </Button>
          <Button variant="outline" onClick={() => setExternalSearchOpen(true)} className="gap-2">
            <Globe className="w-4 h-4" /> Find Books
          </Button>
          <Button onClick={() => { setEditBook(null); setAddOpen(true); }} className="gap-2">
            <Plus className="w-4 h-4" /> Add Book
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search books or authors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-muted">
            <TabsTrigger value="all" className="text-xs">All ({tabCounts.all})</TabsTrigger>
            <TabsTrigger value="reading" className="text-xs gap-1">
              <BookOpen className="w-3 h-3" /> Reading ({tabCounts.reading})
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs gap-1">
              <Check className="w-3 h-3" /> Done ({tabCounts.completed})
            </TabsTrigger>
            <TabsTrigger value="want_to_read" className="text-xs gap-1">
              <Bookmark className="w-3 h-3" /> Wishlist ({tabCounts.want_to_read})
            </TabsTrigger>
            <TabsTrigger value="tbr_spinner" className="text-xs gap-1">
              <Shuffle className="w-3 h-3" /> TBR Spin
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {tab === 'tbr_spinner' ? (
        <TBRSpinner tbrBooks={tbrBooks} onStartReading={handleStartReading} />
      ) : isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-muted animate-pulse aspect-[2/3.5]" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onClick={setSelectedBook}
              onUpdateProgress={(id, page) => updateMutation.mutate({ id, data: { current_page: page } })}
            />
          ))}
        </div>
      ) : null}

      {tab !== 'tbr_spinner' && !isLoading && filtered.length === 0 && (
        <div className="text-center py-16">
          <LibraryIcon className="w-12 h-12 mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground mt-3">{search ? `No books matching "${search}"` : 'No books found'}</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            {search && (
              <Button variant="outline" onClick={() => setExternalSearchOpen(true)} className="gap-2">
                <Globe className="w-4 h-4" /> Search "{search}" online
              </Button>
            )}
            <Button variant="outline" onClick={() => { setEditBook(null); setAddOpen(true); }}>
              Add manually
            </Button>
          </div>
        </div>
      )}

      <ExternalBookSearch open={externalSearchOpen} onOpenChange={setExternalSearchOpen} />
      <ISBNScanner open={scannerOpen} onOpenChange={setScannerOpen} />

      <AddBookDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSave={handleSaveBook}
        editBook={editBook}
      />

      <BookDetailSheet
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
        onEdit={(book) => { setEditBook(book); setAddOpen(true); setSelectedBook(null); }}
        onUpdateProgress={(id, page) => updateMutation.mutate({ id, data: { current_page: page } })}
        onDelete={(id) => deleteMutation.mutate(id)}
      />
    </div>
  );
}