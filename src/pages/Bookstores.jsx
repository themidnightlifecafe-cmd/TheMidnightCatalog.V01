import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, MapPin, Plus, Store, Library as LibraryIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BookstoreCard from '@/components/bookstores/BookstoreCard';
import AddBookstoreDialog from '@/components/bookstores/AddBookstoreDialog';
import FindBookstoresButton from '@/components/bookstores/FindBookstoresButton';

export default function Bookstores() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [addOpen, setAddOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ['bookstores'],
    queryFn: () => base44.entities.Bookstore.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Bookstore.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookstores'] }),
  });

  const bulkCreateMutation = useMutation({
    mutationFn: (data) => base44.entities.Bookstore.bulkCreate(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookstores'] }),
  });

  const filtered = stores.filter((s) => {
    const matchesType = typeFilter === 'all' || s.type === typeFilter;
    const matchesSearch = !search ||
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.city?.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">Bookstores & Libraries</h1>
          <p className="text-sm text-muted-foreground mt-1">Discover places to find your next read</p>
        </div>
        <div className="flex gap-2">
          <FindBookstoresButton onResults={(results) => bulkCreateMutation.mutate(results)} />
          <Button onClick={() => setAddOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Add Store
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search stores or cities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={typeFilter} onValueChange={setTypeFilter}>
          <TabsList className="bg-muted">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="independent" className="text-xs">Independent</TabsTrigger>
            <TabsTrigger value="library" className="text-xs gap-1">
              <LibraryIcon className="w-3 h-3" /> Library
            </TabsTrigger>
            <TabsTrigger value="used" className="text-xs">Used</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-72 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((store, i) => (
              <motion.div
                key={store.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <BookstoreCard store={store} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="text-center py-16">
          <Store className="w-12 h-12 mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground mt-3">No bookstores found</p>
          <p className="text-xs text-muted-foreground mt-1">Try searching for bookstores in your area</p>
          <Button variant="outline" className="mt-4" onClick={() => setAddOpen(true)}>
            Add a bookstore
          </Button>
        </div>
      )}

      <AddBookstoreDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSave={(data) => { createMutation.mutate(data); setAddOpen(false); }}
      />
    </div>
  );
}