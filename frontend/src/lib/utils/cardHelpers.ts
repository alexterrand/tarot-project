// Card helper functions

import type { CardModel, Suit, CardKey } from '@/types/card';

/**
 * Get image path for a card
 */
export function getCardImagePath(card: CardModel): string {
  if (card.suit === 'EXCUSE') {
    return '/cards/excuse.webp';
  }

  const suitMap: Record<Suit, string> = {
    CLUBS: 'clubs',
    DIAMONDS: 'diamonds',
    HEARTS: 'hearts',
    SPADES: 'spades',
    TRUMP: 'trump',
    EXCUSE: 'excuse',
  };

  const suitName = suitMap[card.suit];
  return `/cards/${suitName}_${card.rank}.webp`;
}

/**
 * Generate unique key for a card (for React keys)
 */
export function getCardKey(card: CardModel): CardKey {
  return `${card.suit}_${card.rank}`;
}

/**
 * Compare two cards for equality
 */
export function cardsEqual(card1: CardModel, card2: CardModel): boolean {
  return card1.suit === card2.suit && card1.rank === card2.rank;
}

/**
 * Check if a card is in a list of cards
 */
export function isCardInList(card: CardModel, cards: CardModel[]): boolean {
  return cards.some((c) => cardsEqual(c, card));
}

/**
 * Check if a card is playable (in legal moves)
 */
export function isCardPlayable(
  card: CardModel,
  legalMoves: CardModel[],
  isMyTurn: boolean
): boolean {
  if (!isMyTurn) return false;
  return isCardInList(card, legalMoves);
}

/**
 * Sort cards for display in hand
 * Order: Excuse → Trumps (1→21) → Suits (Clubs, Diamonds, Hearts, Spades)
 */
export function sortCards(cards: CardModel[]): CardModel[] {
  const suitOrder: Record<Suit, number> = {
    EXCUSE: 0,
    TRUMP: 1,
    CLUBS: 2,
    DIAMONDS: 3,
    HEARTS: 4,
    SPADES: 5,
  };

  return [...cards].sort((a, b) => {
    // First by suit order
    const suitDiff = suitOrder[a.suit] - suitOrder[b.suit];
    if (suitDiff !== 0) return suitDiff;

    // Then by rank (ascending)
    return a.rank - b.rank;
  });
}

/**
 * Check if a card is a King
 */
export function isKing(card: CardModel): boolean {
  return (
    (card.suit === 'CLUBS' ||
      card.suit === 'DIAMONDS' ||
      card.suit === 'HEARTS' ||
      card.suit === 'SPADES') &&
    card.rank === 14
  );
}

/**
 * Check if a card is a Trump
 */
export function isTrump(card: CardModel): boolean {
  return card.suit === 'TRUMP';
}

/**
 * Check if a card is the Excuse
 */
export function isExcuse(card: CardModel): boolean {
  return card.suit === 'EXCUSE';
}

/**
 * Validate discard selection (no Kings, no Trumps, no Excuse unless forced)
 */
export function validateDiscardSelection(
  selectedCards: CardModel[],
  hand: CardModel[]
): { valid: boolean; error?: string } {
  if (selectedCards.length !== 6) {
    return { valid: false, error: 'Vous devez sélectionner exactement 6 cartes' };
  }

  // Check for invalid cards (Kings, Trumps, Excuse)
  const hasKings = selectedCards.some(isKing);
  const hasTrumps = selectedCards.some(isTrump);
  const hasExcuse = selectedCards.some(isExcuse);

  if (hasKings) {
    // Check if player has only Kings (forced discard)
    const nonKings = hand.filter((c) => !isKing(c) && !isTrump(c) && !isExcuse(c));
    if (nonKings.length >= 6) {
      return { valid: false, error: 'Vous ne pouvez pas écarter de Rois' };
    }
  }

  if (hasTrumps) {
    // Check if player has only Trumps (forced discard)
    const nonTrumps = hand.filter((c) => !isTrump(c) && !isKing(c) && !isExcuse(c));
    if (nonTrumps.length >= 6) {
      return { valid: false, error: 'Vous ne pouvez pas écarter d\'Atouts' };
    }
  }

  if (hasExcuse) {
    return { valid: false, error: 'Vous ne pouvez jamais écarter l\'Excuse' };
  }

  return { valid: true };
}

/**
 * Get French display name for bid type
 */
export function getBidDisplayName(bidType: string): string {
  const bidNames: Record<string, string> = {
    PASS: 'Passe',
    PETITE: 'Petite',
    GARDE: 'Garde',
    GARDE_SANS: 'Garde Sans',
    GARDE_CONTRE: 'Garde Contre',
  };
  return bidNames[bidType] || bidType;
}

/**
 * Get French display name for game phase
 */
export function getPhaseDisplayName(phase: string): string {
  const phaseNames: Record<string, string> = {
    waiting: 'En attente',
    bidding: 'Phase d\'enchères',
    dog: 'Révélation du chien',
    discard: 'Écart',
    playing: 'Jeu en cours',
    finished: 'Partie terminée',
  };
  return phaseNames[phase] || phase;
}
