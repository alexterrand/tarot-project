import { CardModel } from './card';

// Game phases
export type GamePhase = 'waiting' | 'bidding' | 'dog' | 'discard' | 'playing' | 'finished';

// Bid types
export type BidType = 'PASS' | 'PETITE' | 'GARDE' | 'GARDE_SANS' | 'GARDE_CONTRE';

// Contract information
export interface ContractModel {
  taker_id: string;
  contract_type: BidType;
  oudlers_count: number;
  points_needed: number;
  taker_points: number;
  defense_points: number;
}

// Player model
export interface PlayerModel {
  id: string;
  card_count: number;
  is_current: boolean;
  is_human: boolean;
  tricks_won: number;
}

// Game public state (main state object from GET /games/{id})
export interface GamePublicState {
  game_id: string;
  players: PlayerModel[];
  current_trick: CardModel[];
  trick_player_indices: number[]; // Indices des joueurs qui ont joué chaque carte
  current_player_id: string;
  is_game_over: boolean;
  phase: GamePhase;
  contract: ContractModel | null;
  trick_winner_id: string | null;
  time_since_trick_completed: number | null; // Seconds since trick ended (for 3s pause)
}

// Bidding status
export interface BidModel {
  player_id: string;
  bid_type: BidType;
}

export interface BiddingStatusModel {
  bidding_complete: boolean;
  bids: BidModel[];
  current_bidder_id: string | null;
  current_highest_bid: BidType | null;
  taker_id: string | null;
}

// Dog model
export interface DogModel {
  cards: CardModel[];
  can_view: boolean;
}

// Legal moves model
export interface LegalMovesModel {
  player_id: string;
  legal_cards: CardModel[];
}

// Score information (for finished games)
export interface ScoreModel {
  player_id: string;
  score: number;
  is_taker: boolean;
}
