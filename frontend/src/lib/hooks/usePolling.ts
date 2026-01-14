// Polling hook for game state updates

import { useEffect, useCallback } from 'react';
import {
  fetchGameState,
  fetchPlayerHand,
  fetchLegalMoves,
  fetchContract,
  fetchBiddingStatus,
} from '@/lib/api/game';
import type { GamePublicState, ContractModel, BiddingStatusModel } from '@/types/game';
import type { CardModel } from '@/types/card';

export interface PollingData {
  gameState: GamePublicState | null;
  playerHand: CardModel[];
  legalMoves: CardModel[];
  contract: ContractModel | null;
  biddingStatus: BiddingStatusModel | null;
}

export interface UsePollingOptions {
  gameId: string | null;
  humanPlayerId: string;
  interval?: number;
  onUpdate: (data: PollingData) => void;
  onError: (error: Error) => void;
}

export function usePolling({
  gameId,
  humanPlayerId,
  interval = 500,
  onUpdate,
  onError,
}: UsePollingOptions) {
  const poll = useCallback(async () => {
    if (!gameId) return;

    try {
      // 1. Fetch game state
      const gameState = await fetchGameState(gameId);

      // 2. Fetch player hand
      const playerHand = await fetchPlayerHand(gameId, humanPlayerId);

      // 3. Fetch legal moves (only during playing phase)
      let legalMoves: CardModel[] = [];
      if (gameState.phase === 'playing' && gameState.current_player_id === humanPlayerId) {
        try {
          legalMoves = await fetchLegalMoves(gameId, humanPlayerId);
        } catch {
          // Legal moves might not be available yet, ignore error
          legalMoves = [];
        }
      }

      // 4. Fetch contract (if phase >= playing)
      let contract: ContractModel | null = null;
      if (
        gameState.phase === 'playing' ||
        gameState.phase === 'finished'
      ) {
        try {
          contract = await fetchContract(gameId);
        } catch {
          // Contract might not be finalized yet, ignore error
          contract = null;
        }
      }

      // 5. Fetch bidding status (if bidding/dog/discard phase - we need taker_id)
      let biddingStatus: BiddingStatusModel | null = null;
      if (
        gameState.phase === 'bidding' ||
        gameState.phase === 'dog' ||
        gameState.phase === 'discard'
      ) {
        try {
          biddingStatus = await fetchBiddingStatus(gameId);
        } catch {
          // Bidding status might not be available yet, ignore error
          biddingStatus = null;
        }
      }

      // 6. Update context
      onUpdate({
        gameState,
        playerHand,
        legalMoves,
        contract,
        biddingStatus,
      });
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Unknown polling error'));
    }
  }, [gameId, humanPlayerId, onUpdate, onError]);

  useEffect(() => {
    if (!gameId) return;

    // Initial poll
    poll();

    // Setup interval
    const pollInterval = setInterval(poll, interval);

    return () => clearInterval(pollInterval);
  }, [gameId, interval, poll]);
}
