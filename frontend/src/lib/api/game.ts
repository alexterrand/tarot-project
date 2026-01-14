// Game API functions

import { apiRequest } from './client';
import type {
  CreateGameRequest,
  CreateGameResponse,
  BidRequest,
  BidResponse,
  DiscardRequest,
  DiscardResponse,
  DogResponse,
  HandResponse,
  LegalMovesResponse,
  PlayCardRequest,
  PlayCardResponse,
} from '@/types/api';
import type {
  GamePublicState,
  ContractModel,
  BiddingStatusModel,
} from '@/types/game';
import type { CardModel } from '@/types/card';

/**
 * Create a new game
 */
export async function createGame(
  request: CreateGameRequest = { num_players: 4, human_player_id: 'player_1' }
): Promise<CreateGameResponse> {
  return apiRequest<CreateGameResponse>('/games', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Get game state
 */
export async function fetchGameState(gameId: string): Promise<GamePublicState> {
  return apiRequest<GamePublicState>(`/games/${gameId}`);
}

/**
 * Get player hand
 */
export async function fetchPlayerHand(
  gameId: string,
  playerId: string
): Promise<CardModel[]> {
  const response = await apiRequest<HandResponse>(
    `/games/${gameId}/players/${playerId}/hand`
  );
  return response.cards;
}

/**
 * Get legal moves for a player
 */
export async function fetchLegalMoves(
  gameId: string,
  playerId: string
): Promise<CardModel[]> {
  const response = await apiRequest<LegalMovesResponse>(
    `/games/${gameId}/legal-moves/${playerId}`
  );
  return response.legal_cards;
}

/**
 * Get bidding status
 */
export async function fetchBiddingStatus(
  gameId: string
): Promise<BiddingStatusModel> {
  return apiRequest<BiddingStatusModel>(`/games/${gameId}/bidding/status`);
}

/**
 * Place a bid
 */
export async function makeBid(
  gameId: string,
  request: BidRequest
): Promise<BidResponse> {
  return apiRequest<BidResponse>(`/games/${gameId}/bidding/bid`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Get dog cards (only visible to taker)
 */
export async function fetchDog(
  gameId: string,
  playerId: string
): Promise<DogResponse> {
  return apiRequest<DogResponse>(`/games/${gameId}/dog?player_id=${playerId}`);
}

/**
 * Discard cards (taker only)
 */
export async function discardCards(
  gameId: string,
  request: DiscardRequest
): Promise<DiscardResponse> {
  return apiRequest<DiscardResponse>(`/games/${gameId}/discard`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Get contract information
 */
export async function fetchContract(gameId: string): Promise<ContractModel> {
  return apiRequest<ContractModel>(`/games/${gameId}/contract`);
}

/**
 * Play a card
 */
export async function playCard(
  gameId: string,
  playerId: string,
  card: CardModel
): Promise<PlayCardResponse> {
  return apiRequest<PlayCardResponse>(
    `/games/${gameId}/players/${playerId}/play`,
    {
      method: 'POST',
      body: JSON.stringify({ card }),
    }
  );
}
