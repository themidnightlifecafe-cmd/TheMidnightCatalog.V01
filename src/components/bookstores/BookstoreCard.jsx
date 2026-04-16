import { MapPin, Phone, Globe, Star, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const typeLabels = {
  independent: 'Independent',
  chain: 'Chain',
  used: 'Used Books',
  specialty: 'Specialty',
  library: 'Library',
};

export default function BookstoreCard({ store }) {
  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="h-40 bg-muted overflow-hidden">
        {store.image_url ? (
          <img src={store.image_url} alt={store.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
            <MapPin className="w-10 h-10 text-primary/20" />
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading font-bold text-base">{store.name}</h3>
          {store.rating > 0 && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="w-3.5 h-3.5 fill-chart-4 text-chart-4" />
              <span className="text-xs font-semibold">{store.rating}</span>
            </div>
          )}
        </div>

        {store.type && (
          <Badge variant="secondary" className="mt-2 text-[10px]">
            {typeLabels[store.type] || store.type}
          </Badge>
        )}

        {store.description && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{store.description}</p>
        )}

        <div className="space-y-1.5 mt-3">
          {store.address && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{store.address}</span>
            </div>
          )}
          {store.phone && (
            <a href={`tel:${store.phone}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
              <Phone className="w-3.5 h-3.5 flex-shrink-0" />
              {store.phone}
            </a>
          )}
          {store.website && (
            <a href={store.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-primary hover:underline">
              <Globe className="w-3.5 h-3.5 flex-shrink-0" />
              Visit Website
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}