// Card types based on backend API models

export type Suit = 'CLUBS' | 'DIAMONDS' | 'HEARTS' | 'SPADES' | 'TRUMP' | 'EXCUSE';

export interface CardModel {
  suit: Suit;
  rank: number; // 1-14 (suits), 1-21 (trumps), 0 (excuse)
  display_name: string; // "Roi de Coeur", "Atout 21", etc.
}

// Helper types for card comparison
export type CardKey = string; // Format: "suit_rank" (e.g., "HEARTS_13", "TRUMP_21", "EXCUSE_0")
