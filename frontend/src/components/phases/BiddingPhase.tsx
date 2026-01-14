'use client';

import { useGame } from '@/lib/context/GameContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { BidType } from '@/types/game';

const BID_OPTIONS: BidType[] = ['PASS', 'PETITE', 'GARDE', 'GARDE_SANS', 'GARDE_CONTRE'];

const BID_LABELS: Record<BidType, string> = {
  PASS: 'Passer',
  PETITE: 'Petite',
  GARDE: 'Garde',
  GARDE_SANS: 'Garde Sans',
  GARDE_CONTRE: 'Garde Contre',
};

export function BiddingPhase() {
  const { biddingStatus, makeBid, isLoading, humanPlayerId, playerHand } = useGame();

  if (!biddingStatus) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600">Chargement des enchères...</p>
        </div>
      </div>
    );
  }

  const isMyTurn = biddingStatus.current_bidder_id === humanPlayerId;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Main de cartes */}
      <div className="mb-8 w-full max-w-6xl">
        <h3 className="text-xl font-semibold text-white mb-4 text-center">
          Votre main ({playerHand.length} cartes)
        </h3>
        <div className="flex flex-wrap justify-center gap-2">
          {playerHand.map((card, index) => (
            <Card key={index} card={card} size="medium" />
          ))}
        </div>
      </div>

      {/* Panel d'enchères */}
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Phase d&apos;enchères
        </h2>

        {/* Historique des enchères */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">
            Enchères précédentes:
          </h3>
          {biddingStatus.bids.length === 0 ? (
            <p className="text-gray-500">Aucune enchère pour l&apos;instant</p>
          ) : (
            <div className="space-y-2">
              {biddingStatus.bids.map((bid, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-gray-50 rounded p-3"
                >
                  <span className="font-medium text-gray-700">{bid.player_id}</span>
                  <span className={`font-semibold ${bid.bid_type === 'PASS' ? 'text-gray-500' : 'text-green-600'}`}>
                    {BID_LABELS[bid.bid_type]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enchère actuelle */}
        {biddingStatus.current_highest_bid && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-center text-lg">
              <span className="font-semibold">Enchère la plus haute: </span>
              <span className="text-blue-600 font-bold">
                {BID_LABELS[biddingStatus.current_highest_bid]}
              </span>
            </p>
          </div>
        )}

        {/* Tour actuel */}
        <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
          <p className="text-center text-lg">
            <span className="font-semibold">Tour de: </span>
            <span className="text-yellow-700 font-bold">
              {biddingStatus.current_bidder_id}
            </span>
            {isMyTurn && (
              <span className="ml-2 text-green-600 font-bold">(VOUS)</span>
            )}
          </p>
        </div>

        {/* Boutons d'enchères */}
        {isMyTurn && (
          <div className="space-y-3">
            <p className="text-center text-gray-700 font-medium mb-4">
              Choisissez votre enchère:
            </p>
            <div className="grid grid-cols-2 gap-3">
              {BID_OPTIONS.map((bid) => {
                const disabled =
                  biddingStatus.current_highest_bid &&
                  bid !== 'PASS' &&
                  BID_OPTIONS.indexOf(bid) <= BID_OPTIONS.indexOf(biddingStatus.current_highest_bid);

                return (
                  <Button
                    key={bid}
                    onClick={() => makeBid(bid)}
                    disabled={disabled || isLoading}
                    variant={bid === 'PASS' ? 'secondary' : 'primary'}
                    size="large"
                    className={disabled ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    {BID_LABELS[bid]}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {!isMyTurn && (
          <div className="text-center text-gray-600">
            <p>Attendez votre tour...</p>
          </div>
        )}
      </div>
    </div>
  );
}
