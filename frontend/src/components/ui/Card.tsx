// Card display component

import React from 'react';
import Image from 'next/image';
import type { CardModel } from '@/types/card';
import { getCardImagePath, getCardKey } from '@/lib/utils/cardHelpers';

interface CardProps {
  card: CardModel;
  isPlayable?: boolean; // False → grayscale filter
  isSelected?: boolean; // True → border highlight (for discard)
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  className?: string;
}

export function Card({
  card,
  isPlayable = true,
  isSelected = false,
  size = 'medium',
  onClick,
  className = '',
}: CardProps) {
  const imagePath = getCardImagePath(card);
  const cardKey = getCardKey(card);

  const sizeStyles = {
    small: 'w-16 h-24',
    medium: 'w-24 h-36',
    large: 'w-28 h-44',
  };

  const baseStyles = 'rounded-lg shadow-md transition-all duration-200';
  const hoverStyles = onClick && isPlayable ? 'hover:scale-105 hover:shadow-xl cursor-pointer' : '';
  // Très légèrement grisé si non jouable (opacity-90 + brightness-90)
  const grayscaleStyles = !isPlayable ? 'opacity-90 brightness-90' : '';
  const selectedStyles = isSelected ? 'ring-4 ring-blue-500 scale-105' : '';

  return (
    <div
      className={`${baseStyles} ${sizeStyles[size]} ${hoverStyles} ${grayscaleStyles} ${selectedStyles} ${className}`}
      onClick={onClick && isPlayable ? onClick : undefined}
      title={card.display_name}
    >
      <Image
        src={imagePath}
        alt={card.display_name}
        width={120}
        height={200}
        className="w-full h-full object-contain rounded-lg"
        unoptimized
      />
    </div>
  );
}

// Card back (for opponent cards)
export function CardBack({ size = 'medium', className = '' }: { size?: 'small' | 'medium' | 'large'; className?: string }) {
  const sizeStyles = {
    small: 'w-16 h-24',
    medium: 'w-20 h-32',
    large: 'w-24 h-40',
  };

  return (
    <div
      className={`${sizeStyles[size]} ${className} bg-gradient-to-br from-blue-900 to-purple-900 rounded-lg shadow-md border-2 border-yellow-600 flex items-center justify-center`}
    >
      <div className="text-yellow-400 text-4xl font-bold">?</div>
    </div>
  );
}
