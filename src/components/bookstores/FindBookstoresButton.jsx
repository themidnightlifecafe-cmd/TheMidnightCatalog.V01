import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2, Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function FindBookstoresButton({ onResults }) {
  const [open, setOpen] = useState(false);
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Find 5 real bookstores and libraries in or near "${city}". Include independent bookshops, used bookstores, and public libraries. Return real places with accurate details.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          stores: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                address: { type: "string" },
                city: { type: "string" },
                phone: { type: "string" },
                website: { type: "string" },
                description: { type: "string" },
                type: { type: "string", enum: ["independent", "chain", "used", "specialty", "library"] },
                rating: { type: "number" }
              }
            }
          }
        }
      }
    });
    setLoading(false);
    if (res?.stores?.length) {
      onResults(res.stores);
      setOpen(false);
      setCity('');
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="gap-2">
        <MapPin className="w-4 h-4" /> Find Nearby
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              Find Bookstores
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Your City or Area</Label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Portland, OR"
                onKeyDown={(e) => e.key === 'Enter' && city && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} className="w-full gap-2" disabled={!city || loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
              {loading ? 'Searching...' : 'Find Bookstores'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}