import React from 'react';
import { Star } from 'lucide-react';
import { useGameState } from '../../state/gameStore';

interface CelebrationBurstProps {
  active?: boolean;
  tone?: 'gold' | 'teal';
}

export const CelebrationBurst: React.FC<CelebrationBurstProps> = ({
  active = true,
  tone = 'gold',
}) => {
  const { state } = useGameState();
  if (!active || state.settings.reducedMotion) return null;

  const starPositions = [
    'top-3 right-6',
    'top-8 left-8',
    'bottom-6 right-12',
    'bottom-4 left-6',
  ];

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {starPositions.map((pos, idx) => (
        <Star
          key={pos}
          className={`absolute ${pos} h-5 w-5 ${
            tone === 'gold' ? 'text-amber-400 fill-amber-300' : 'text-teal-500 fill-teal-300'
          } opacity-75 transition-transform duration-500`}
          style={{ transform: `rotate(${idx * 18 - 20}deg)` }}
        />
      ))}
    </div>
  );
};
