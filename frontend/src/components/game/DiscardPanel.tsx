// Discard panel component (select 6 cards to discard)

import React, { useState } from 'react';
import type { CardModel } from '@/types/card';
import { Button } from '@/components/ui/Button';
import { validateDiscardSelection } from '@/lib/utils/cardHelpers';

interface DiscardPanelProps {
  hand: CardModel[];
  selectedCards: CardModel[];
  onCardSelect: (card: CardModel) => void;
  onConfirmDiscard: () => void;
  isLoading?: boolean;
}

export function DiscardPanel({
  hand,
  selectedCards,
  onCardSelect,
  onConfirmDiscard,
  isLoading,
}: DiscardPanelProps) {
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = () => {
    const validation = validateDiscardSelection(selectedCards, hand);
    if (!validation.valid) {
      setError(validation.error || 'Sélection invalide');
      return;
    }
    setError(null);
    onConfirmDiscard();
  };

  const isConfirmDisabled = selectedCards.length !== 6 || isLoading;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Écart</h2>
      <p className="text-gray-600 mb-4">
        Sélectionnez exactement 6 cartes à écarter. Les cartes écartées seront comptabilisées dans vos points.
      </p>

      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-700">
          Cartes sélectionnées: {selectedCards.length}/6
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Attention: Vous ne pouvez pas écarter de Rois, d&apos;Atouts, ni l&apos;Excuse (sauf obligation).
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <Button
        onClick={handleConfirm}
        disabled={isConfirmDisabled}
        className="w-full"
        size="large"
      >
        {isLoading ? 'Écart en cours...' : 'Confirmer l\'écart'}
      </Button>

      <p className="text-xs text-gray-500 mt-3 text-center">
        Cliquez sur les cartes de votre main pour les sélectionner/désélectionner
      </p>
    </div>
  );
}
