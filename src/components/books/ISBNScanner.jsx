import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, ScanLine, BookOpen, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

async function fetchBookByISBN(isbn) {
  const res = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
  const json = await res.json();
  const key = `ISBN:${isbn}`;
  const book = json[key];
  if (!book) return null;
  return {
    title: book.title || '',
    author: book.authors?.map(a => a.name).join(', ') || '',
    cover_url: book.cover?.large || book.cover?.medium || book.cover?.small || '',
    total_pages: book.number_of_pages || 0,
    genre: book.subjects?.[0]?.name || '',
    status: 'want_to_read',
    current_page: 0,
  };
}

export default function ISBNScanner({ open, onOpenChange }) {
  const scannerRef = useRef(null);
  const html5QrcodeRef = useRef(null);
  const [phase, setPhase] = useState('scanning'); // scanning | loading | found | error | added
  const [bookData, setBookData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const queryClient = useQueryClient();

  const addBookMutation = useMutation({
    mutationFn: (data) => base44.entities.Book.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      setPhase('added');
    },
  });

  // Start / stop scanner
  useEffect(() => {
    if (!open) return;
    setPhase('scanning');
    setBookData(null);
    setErrorMsg('');

    const scanner = new Html5Qrcode('isbn-scanner-box');
    html5QrcodeRef.current = scanner;

    let handled = false;

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 120 }, aspectRatio: 1.5 },
      async (decodedText) => {
        if (handled) return;
        // Only handle ISBN-style barcodes (EAN-13 starting with 978/979 or pure numbers)
        const clean = decodedText.replace(/\D/g, '');
        if (clean.length < 10) return;
        handled = true;

        try { await scanner.stop(); } catch (_) {}

        setPhase('loading');
        const data = await fetchBookByISBN(clean);
        if (!data) {
          setErrorMsg(`No book found for ISBN ${clean}. Try again.`);
          setPhase('error');
        } else {
          setBookData(data);
          setPhase('found');
        }
      },
      () => {} // ignore per-frame errors
    ).catch((err) => {
      setErrorMsg('Camera access denied or unavailable.');
      setPhase('error');
    });

    return () => {
      try { scanner.stop().catch(() => {}); } catch (_) {}
    };
  }, [open]);

  const handleClose = () => {
    try { html5QrcodeRef.current?.stop().catch(() => {}); } catch (_) {}
    setPhase('scanning');
    setBookData(null);
    onOpenChange(false);
  };

  const handleScanAgain = () => {
    setPhase('scanning');
    setBookData(null);
    setErrorMsg('');
    // Re-trigger by toggling open
    const scanner = new Html5Qrcode('isbn-scanner-box');
    html5QrcodeRef.current = scanner;
    let handled = false;
    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 120 }, aspectRatio: 1.5 },
      async (decodedText) => {
        if (handled) return;
        const clean = decodedText.replace(/\D/g, '');
        if (clean.length < 10) return;
        handled = true;
        try { await scanner.stop(); } catch (_) {}
        setPhase('loading');
        const data = await fetchBookByISBN(clean);
        if (!data) { setErrorMsg(`No book found for that ISBN.`); setPhase('error'); }
        else { setBookData(data); setPhase('found'); }
      },
      () => {}
    ).catch(() => { setErrorMsg('Camera access denied.'); setPhase('error'); });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="px-5 pt-5 pb-2">
          <DialogTitle className="font-heading flex items-center gap-2 text-base">
            <ScanLine className="w-4 h-4 text-primary" /> Scan Book Barcode
          </DialogTitle>
        </DialogHeader>

        {/* Scanner viewport — always in DOM so the div id exists */}
        <div className={phase === 'scanning' ? 'block' : 'hidden'}>
          <div id="isbn-scanner-box" className="w-full" style={{ minHeight: 240 }} />
          <div className="px-5 py-3 text-center text-xs text-muted-foreground">
            Point your camera at the barcode on the back of the book
          </div>
        </div>

        {/* Loading */}
        {phase === 'loading' && (
          <div className="flex flex-col items-center gap-3 py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Looking up book details…</p>
          </div>
        )}

        {/* Found */}
        {phase === 'found' && bookData && (
          <div className="px-5 pb-5 space-y-4">
            <div className="flex gap-4">
              {bookData.cover_url ? (
                <img src={bookData.cover_url} alt={bookData.title} className="w-20 h-28 rounded-xl object-cover shadow-md flex-shrink-0" />
              ) : (
                <div className="w-20 h-28 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-7 h-7 text-muted-foreground/40" />
                </div>
              )}
              <div className="min-w-0 flex-1 pt-1">
                <h3 className="font-heading font-bold text-base leading-tight">{bookData.title}</h3>
                {bookData.author && <p className="text-sm text-muted-foreground mt-1">{bookData.author}</p>}
                {bookData.total_pages > 0 && <p className="text-xs text-muted-foreground mt-1">{bookData.total_pages} pages</p>}
                {bookData.genre && <p className="text-xs text-muted-foreground mt-0.5">{bookData.genre}</p>}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={handleScanAgain}>Scan Another</Button>
              <Button size="sm" className="flex-1 gap-1.5" onClick={() => addBookMutation.mutate(bookData)} disabled={addBookMutation.isPending}>
                {addBookMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add to Library
              </Button>
            </div>
          </div>
        )}

        {/* Added */}
        {phase === 'added' && (
          <div className="flex flex-col items-center gap-3 py-10 px-5 text-center">
            <CheckCircle2 className="w-10 h-10 text-secondary" />
            <p className="font-heading font-bold text-base">{bookData?.title}</p>
            <p className="text-sm text-muted-foreground">Added to your library!</p>
            <div className="flex gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={handleScanAgain}>Scan Another</Button>
              <Button size="sm" onClick={handleClose}>Done</Button>
            </div>
          </div>
        )}

        {/* Error */}
        {phase === 'error' && (
          <div className="flex flex-col items-center gap-3 py-10 px-5 text-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
            <p className="text-sm text-muted-foreground">{errorMsg}</p>
            <Button size="sm" onClick={handleScanAgain}>Try Again</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}