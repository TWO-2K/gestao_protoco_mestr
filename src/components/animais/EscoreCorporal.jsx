import { Star } from 'lucide-react';

export default function EscoreCorporal({ score, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= score ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-muted-foreground/25'}
        />
      ))}
    </div>
  );
}
