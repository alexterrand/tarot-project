import { CardModel } from './card';
import { BidType, BiddingStatusModel, ContractModel } from './game';

// API Request/Response types

// POST /api/v1/games
export interface CreateGameRequest {
  num_players: number;
  human_player_id: string;
}

export interface CreateGameResponse {
  game_id: string;
  human_player_id: string;
}

// POST /api/v1/games/{game_id}/bidding/bid
export interface BidRequest {
  player_id: string;
  bid_type: BidType;
}

export interface BidResponse {
  success: boolean;
  message: string;
  bidding_status: BiddingStatusModel;
}

// POST /api/v1/games/{game_id}/discard
export interface DiscardRequest {
  player_id: string;
  cards: CardModel[];
}

export interface DiscardResponse {
  success: boolean;
  message: string;
  contract: ContractModel;
}

// GET /api/v1/games/{game_id}/dog
export interface DogResponse {
  cards: CardModel[];
  can_view: boolean;
}

// GET /api/v1/games/{game_id}/players/{player_id}/hand
export interface HandResponse {
  cards: CardModel[];
}

// GET /api/v1/games/{game_id}/legal-moves/{player_id}
export interface LegalMovesResponse {
  player_id: string;
  legal_cards: CardModel[];
}

// POST /api/v1/games/{game_id}/players/{player_id}/play
export interface PlayCardRequest {
  card: CardModel;
}

export interface PlayCardResponse {
  success: boolean;
  message: string;
}

// Error response
export interface ApiError {
  detail: string;
}
