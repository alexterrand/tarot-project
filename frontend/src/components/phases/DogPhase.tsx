'use client';

import { useEffect, useState } from 'react';
import { useGame } from '@/lib/context/GameContext';
import { fetchDog, discardCards as apiDiscardCards } from '@/lib/api/game';
import { Card } from '@/components/ui/Card';
import { getCardKey } from '@/lib/utils/cardHelpers';
import type { CardModel } from '@/types/card';

export function DogPhase() {
  const { gameId, contract, biddingStatus, humanPlayerId } = useGame();
  const [dogCards, setDogCards] = useState<CardModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [countdown, setCountdown] = useState(3);

  const takerId = contract?.taker_id || biddingStatus?.taker_id;
  const isHumanTaker = takerId === humanPlayerId;

  useEffect(() => {
    if (!gameId || !takerId) {
      console.log('[DOG] Waiting for gameId or takerId', { gameId, takerId });
      return;
    }

    console.log('[DOG] Fetching dog...', { gameId, takerId, humanPlayerId });
    setIsLoading(true);

    // Fetch dog cards
    fetchDog(gameId, humanPlayerId)
      .then((dog) => {
        console.log('[DOG] Received dog:', dog);
        if (dog.can_view) {
          setDogCards(dog.cards);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('[DOG] Failed to fetch dog:', err);
        setIsLoading(false);
      });
  }, [gameId, takerId, humanPlayerId]);

  // Auto-transition to discard phase after countdown
  useEffect(() => {
    if (!isHumanTaker || isLoading || dogCards.length === 0 || !gameId) {
      return;
    }

    // Countdown timer
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }

    // When countdown reaches 0, call discard with empty array to trigger phase transition
    console.log('[DOG] Auto-transitioning to DISCARD phase...');

    apiDiscardCards(gameId, {
      player_id: humanPlayerId,
      cards: [],
    })
      .then((response) => {
        console.log('[DOG] Transitioned to DISCARD:', response);
      })
      .catch((err) => {
        console.error('[DOG] Failed to transition:', err);
      });
  }, [isHumanTaker, isLoading, dogCards, countdown, gameId, humanPlayerId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600 text-xl">Chargement du chien...</p>
        </div>
      </div>
    );
  }

  // Si un bot est preneur, afficher le chien pendant 3 secondes
  if (!isHumanTaker) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-4xl w-full">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Le Chien</h2>
          <p className="text-xl text-gray-600 mb-6">
            Le bot <span className="font-bold text-blue-600">{takerId}</span> a pris !
          </p>

          {dogCards.length > 0 ? (
            <>
              <div className="flex justify-center gap-2 mb-6 flex-wrap">
                {dogCards.map((card) => (
                  <Card key={getCardKey(card)} card={card} size="medium" />
                ))}
              </div>
              <p className="text-gray-600">
                Le bot effectue son écart... La partie démarre dans quelques instants.
              </p>
            </>
          ) : (
            <p className="text-gray-500">Chargement du chien...</p>
          )}
        </div>
      </div>
    );
  }

  // Si le joueur humain est preneur, afficher le chien
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl w-full">
        <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">
          Le Chien
        </h2>
        <p className="text-center text-gray-600 mb-6 text-lg">
          Vous êtes le preneur ! Voici les 6 cartes du chien qui sont ajoutées à votre main.
        </p>

        {dogCards.length > 0 ? (
          <>
            <div className="flex justify-center gap-2 mb-8 flex-wrap">
              {dogCards.map((card) => (
                <Card key={getCardKey(card)} card={card} size="medium" />
              ))}
            </div>

            <div className="text-center">
              <p className="text-gray-700 mb-2">
                Ces cartes seront ajoutées à votre main.
              </p>
              <p className="text-lg font-semibold text-blue-600">
                Passage à la phase d&apos;écart dans {countdown} secondes...
              </p>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-600">
            <p>Aucune carte du chien disponible</p>
          </div>
        )}
      </div>
    </div>
  );
}
