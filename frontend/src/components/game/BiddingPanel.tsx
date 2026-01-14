// Bidding panel component

import React from 'react';
import type { BidType, BidModel } from '@/types/game';
import { Button } from '@/components/ui/Button';
import { getBidDisplayName } from '@/lib/utils/cardHelpers';

interface BiddingPanelProps {
  currentBidderId: string;
  humanPlayerId: string;
  bids: BidModel[];
  currentHighestBid: BidType | null;
  onBid: (bidType: BidType) => void;
  isLoading?: boolean;
}

const BID_OPTIONS: BidType[] = ['PASS', 'PETITE', 'GARDE', 'GARDE_SANS', 'GARDE_CONTRE'];

const BID_ORDER: Record<BidType, number> = {
  PASS: 0,
  PETITE: 1,
  GARDE: 2,
  GARDE_SANS: 3,
  GARDE_CONTRE: 4,
};

export function BiddingPanel({
  currentBidderId,
  humanPlayerId,
  bids,
  currentHighestBid,
  onBid,
  isLoading,
}: BiddingPanelProps) {
  const isMyTurn = currentBidderId === humanPlayerId;
  const highestBidValue = currentHighestBid ? BID_ORDER[currentHighestBid] : 0;

  const isBidDisabled = (bidType: BidType) => {
    if (bidType === 'PASS') return false;
    return BID_ORDER[bidType] <= highestBidValue;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Phase d&apos;enchères</h2>

      {/* Bid history */}
      <div className="mb-6 max-h-32 overflow-y-auto bg-gray-50 rounded p-3">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Historique</h3>
        {bids.length === 0 ? (
          <p className="text-sm text-gray-500">Aucune enchère pour le moment</p>
        ) : (
          <ul className="space-y-1">
            {bids.map((bid, index) => (
              <li key={index} className="text-sm text-gray-700">
                <span className="font-semibold">{bid.player_id}</span>:{' '}
                <span className={bid.bid_type === 'PASS' ? 'text-gray-500' : 'text-green-600'}>
                  {getBidDisplayName(bid.bid_type)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Bid buttons */}
      {isMyTurn ? (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700 mb-3">Votre enchère:</p>
          <div className="grid grid-cols-2 gap-2">
            {BID_OPTIONS.map((bidType) => (
              <Button
                key={bidType}
                onClick={() => onBid(bidType)}
                disabled={isBidDisabled(bidType) || isLoading}
                variant={bidType === 'PASS' ? 'secondary' : 'primary'}
              >
                {getBidDisplayName(bidType)}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-600">En attente de {currentBidderId}...</p>
        </div>
      )}
    </div>
  );
}
