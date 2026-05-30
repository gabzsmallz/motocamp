import { useState } from 'react';
import { ChevronLeft, ChevronRight, Camera } from 'lucide-react';

export default function PhotoGallery({ photos = [], name = '' }) {
  const [current, setCurrent] = useState(0);
  const [imgError, setImgError] = useState({});

  const validPhotos = photos.filter((_, i) => !imgError[i]);

  if (validPhotos.length === 0) {
    return (
      <div className="w-full h-56 sm:h-72 bg-[#1a2e1a] flex flex-col items-center justify-center gap-2 rounded-t-2xl">
        <Camera size={32} className="text-green-800" />
        <span className="text-xs text-green-900 font-medium">No photos yet</span>
      </div>
    );
  }

  const prev = () => setCurrent(c => (c - 1 + validPhotos.length) % validPhotos.length);
  const next = () => setCurrent(c => (c + 1) % validPhotos.length);

  return (
    <div className="relative w-full h-56 sm:h-80 rounded-t-2xl overflow-hidden bg-[#1a2e1a] group">
      {/* Image */}
      <img
        key={validPhotos[current]}
        src={validPhotos[current]}
        alt={`${name} — photo ${current + 1}`}
        className="w-full h-full object-cover transition-opacity duration-300"
        onError={() => setImgError(e => ({ ...e, [photos.indexOf(validPhotos[current])]: true }))}
      />

      {/* Dark gradient overlay at bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

      {/* Photo count badge */}
      <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
        <Camera size={11} />
        {current + 1} / {validPhotos.length}
      </div>

      {/* Prev / Next arrows — only shown if multiple photos */}
      {validPhotos.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
          >
            <ChevronRight size={18} />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {validPhotos.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === current ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
