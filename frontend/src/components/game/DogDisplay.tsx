// Dog display component (6 cards revealed to taker)

import React from 'react';
import type { CardModel } from '@/types/card';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getCardKey } from '@/lib/utils/cardHelpers';

interface DogDisplayProps {
  dogCards: CardModel[];
  onContinue: () => void;
}

export function DogDisplay({ dogCards, onContinue }: DogDisplayProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Le Chien</h2>
      <p className="text-gray-600 mb-4">
        Vous êtes le preneur ! Voici les 6 cartes du chien qui sont ajoutées à votre main.
      </p>

      <div className="flex justify-center gap-2 mb-6">
        {dogCards.map((card) => (
          <Card key={getCardKey(card)} card={card} size="medium" />
        ))}
      </div>

      <Button onClick={onContinue} className="w-full" size="large">
        Continuer vers l&apos;écart
      </Button>
    </div>
  );
}
