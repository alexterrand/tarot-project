'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { usePolling, type PollingData } from '@/lib/hooks/usePolling';
import {
  createGame as apiCreateGame,
  makeBid as apiMakeBid,
  playCard as apiPlayCard,
  discardCards as apiDiscardCards,
} from '@/lib/api/game';
import type {
  GamePublicState,
  ContractModel,
  BiddingStatusModel,
  BidType,
  GamePhase,
} from '@/types/game';
import type { CardModel } from '@/types/card';

interface GameContextValue {
  // Game state
  gameId: string | null;
  humanPlayerId: string;
  gameState: GamePublicState | null;
  playerHand: CardModel[];
  legalMoves: CardModel[];
  contract: ContractModel | null;
  biddingStatus: BiddingStatusModel | null;
  phase: GamePhase | null;

  // Actions
  createGame: () => Promise<string>;
  makeBid: (bidType: BidType) => Promise<void>;
  playCard: (card: CardModel) => Promise<void>;
  discardCards: (cards: CardModel[]) => Promise<void>;

  // UI state
  isLoading: boolean;
  error: string | null;
  trickPauseActive: boolean;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameId, setGameId] = useState<string | null>(null);
  const [humanPlayerId] = useState<string>('player_1');
  const [gameState, setGameState] = useState<GamePublicState | null>(null);
  const [playerHand, setPlayerHand] = useState<CardModel[]>([]);
  const [legalMoves, setLegalMoves] = useState<CardModel[]>([]);
  const [contract, setContract] = useState<ContractModel | null>(null);
  const [biddingStatus, setBiddingStatus] = useState<BiddingStatusModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trickPauseActive, setTrickPauseActive] = useState(false);

  // Handle polling updates
  const handlePollingUpdate = useCallback((data: PollingData) => {
    setGameState(data.gameState);
    setPlayerHand(data.playerHand);
    setLegalMoves(data.legalMoves);
    setContract(data.contract);
    setBiddingStatus(data.biddingStatus);

    // Handle trick pause (3 seconds)
    if (
      data.gameState?.time_since_trick_completed !== null &&
      data.gameState?.time_since_trick_completed !== undefined
    ) {
      setTrickPauseActive(data.gameState.time_since_trick_completed < 3);
    } else {
      setTrickPauseActive(false);
    }
  }, []);

  const handlePollingError = useCallback((err: Error) => {
    console.error('Polling error:', err);
    setError(err.message);
  }, []);

  // Setup polling
  usePolling({
    gameId,
    humanPlayerId,
    interval: 500,
    onUpdate: handlePollingUpdate,
    onError: handlePollingError,
  });

  // Create game
  const createGame = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiCreateGame({
        num_players: 4,
        human_player_id: humanPlayerId,
      });
      setGameId(response.game_id);
      return response.game_id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create game');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [humanPlayerId]);

  // Make bid
  const makeBid = useCallback(
    async (bidType: BidType) => {
      if (!gameId) throw new Error('No game ID');
      setIsLoading(true);
      setError(null);
      try {
        await apiMakeBid(gameId, {
          player_id: humanPlayerId,
          bid_type: bidType,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to make bid');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [gameId, humanPlayerId]
  );

  // Play card
  const playCard = useCallback(
    async (card: CardModel) => {
      if (!gameId) throw new Error('No game ID');
      setIsLoading(true);
      setError(null);
      try {
        await apiPlayCard(gameId, humanPlayerId, card);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to play card');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [gameId, humanPlayerId]
  );

  // Discard cards
  const discardCards = useCallback(
    async (cards: CardModel[]) => {
      if (!gameId) throw new Error('No game ID');
      setIsLoading(true);
      setError(null);
      try {
        await apiDiscardCards(gameId, {
          player_id: humanPlayerId,
          cards,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to discard cards');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [gameId, humanPlayerId]
  );

  const value: GameContextValue = {
    gameId,
    humanPlayerId,
    gameState,
    playerHand,
    legalMoves,
    contract,
    biddingStatus,
    phase: gameState?.phase || null,
    createGame,
    makeBid,
    playCard,
    discardCards,
    isLoading,
    error,
    trickPauseActive,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
