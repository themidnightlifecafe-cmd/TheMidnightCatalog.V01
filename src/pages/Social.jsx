import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Send, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SocialUpdateCard from '@/components/social/SocialUpdateCard';
import ShareUpdateDialog from '@/components/social/ShareUpdateDialog';

export default function Social() {
  const [shareOpen, setShareOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: updates = [], isLoading } = useQuery({
    queryKey: ['social-updates'],
    queryFn: () => base44.entities.SocialUpdate.list('-created_date', 50),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SocialUpdate.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['social-updates'] }),
  });

  const likeMutation = useMutation({
    mutationFn: (update) => base44.entities.SocialUpdate.update(update.id, { likes: (update.likes || 0) + 1 }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['social-updates'] }),
  });

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">Friends & Reading</h1>
          <p className="text-sm text-muted-foreground mt-1">See what your friends are reading</p>
        </div>
        <Button onClick={() => setShareOpen(true)} className="gap-2">
          <Send className="w-4 h-4" /> Share Update
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : updates.length > 0 ? (
        <div className="space-y-4">
          <AnimatePresence>
            {updates.map((update, i) => (
              <motion.div
                key={update.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <SocialUpdateCard update={update} onLike={(u) => likeMutation.mutate(u)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-16">
          <Users className="w-12 h-12 mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground mt-3">No updates yet. Be the first to share!</p>
          <Button variant="outline" className="mt-4" onClick={() => setShareOpen(true)}>
            Share what you're reading
          </Button>
        </div>
      )}

      <ShareUpdateDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        onSave={(data) => {
          createMutation.mutate(data);
          setShareOpen(false);
        }}
      />
    </div>
  );
}