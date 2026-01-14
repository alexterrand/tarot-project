'use client';

import { useGame } from '@/lib/context/GameContext';
import { Card } from '@/components/ui/Card';
import { getCardKey } from '@/lib/utils/cardHelpers';
import type { CardModel } from '@/types/card';
import type { PlayerModel } from '@/types/game';

export function PlayingPhase() {
  const {
    gameState,
    playerHand,
    legalMoves,
    playCard,
    isLoading,
    humanPlayerId,
    trickPauseActive,
  } = useGame();

  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Chargement...</p>
      </div>
    );
  }

  const isMyTurn = gameState.current_player_id === humanPlayerId && !trickPauseActive;

  const isCardPlayable = (card: CardModel): boolean => {
    if (!isMyTurn) return false;
    return legalMoves.some((c) => c.suit === card.suit && c.rank === card.rank);
  };

  const handleCardClick = (card: CardModel) => {
    if (isCardPlayable(card) && !isLoading) {
      playCard(card);
    }
  };

  // Positions fixes pour les joueurs (dans le sens horaire)
  // player_1 (humain, bas) -> player_2 (gauche) -> player_3 (haut) -> player_4 (droite)
  const PLAYER_POSITIONS = {
    0: { name: 'player_1', position: 'bottom', label: 'VOUS' },  // Index 0
    1: { name: 'player_2', position: 'left', label: 'Bot 2' },   // Index 1
    2: { name: 'player_3', position: 'top', label: 'Bot 3' },    // Index 2
    3: { name: 'player_4', position: 'right', label: 'Bot 4' },  // Index 3
  } as const;

  // Obtenir les informations de chaque joueur par index
  const getPlayerByIndex = (playerIndex: number): PlayerModel | undefined => {
    return gameState.players[playerIndex];
  };

  // Obtenir la carte jouée par un joueur spécifique (par index)
  const getCardForPlayerIndex = (playerIndex: number): CardModel | null => {
    // Chercher si cet index de joueur apparaît dans trick_player_indices
    const cardIndex = gameState.trick_player_indices.indexOf(playerIndex);
    if (cardIndex >= 0 && cardIndex < gameState.current_trick.length) {
      return gameState.current_trick[cardIndex];
    }
    return null;
  };

  // Fonction pour afficher un joueur avec sa position fixe
  const renderPlayer = (
    playerIndex: number,
    position: 'left' | 'top' | 'right' | 'bottom',
    label: string
  ) => {
    const player = getPlayerByIndex(playerIndex);
    if (!player) return null;

    const isCurrentPlayer = gameState.current_player_id === player.id;
    const card = getCardForPlayerIndex(playerIndex);

    // Classes CSS pour positionner le joueur
    const playerBoxClasses = {
      left: 'absolute left-4 top-1/2 -translate-y-1/2',
      top: 'absolute top-4 left-1/2 -translate-x-1/2',
      right: 'absolute right-4 top-1/2 -translate-y-1/2',
      bottom: 'absolute bottom-4 left-1/2 -translate-x-1/2',
    };

    // Classes CSS pour positionner la carte jouée
    const cardPositionClasses = {
      left: 'absolute left-40 top-1/2 -translate-y-1/2',
      top: 'absolute top-40 left-1/2 -translate-x-1/2',
      right: 'absolute right-40 top-1/2 -translate-y-1/2',
      bottom: 'absolute bottom-40 left-1/2 -translate-x-1/2',
    };

    const isHuman = position === 'bottom';

    return (
      <>
        {/* Informations du joueur */}
        <div className={`${playerBoxClasses[position]} z-10`}>
          <div
            className={`bg-white rounded-lg shadow-lg p-4 text-center min-w-[140px] ${
              isCurrentPlayer ? 'ring-4 ring-yellow-400' : ''
            }`}
          >
            <p className={`font-bold ${isHuman ? 'text-blue-600' : 'text-gray-800'}`}>
              {player.id}
            </p>
            {isHuman && <p className="text-xs text-blue-500 font-semibold">{label}</p>}
            <p className="text-sm text-gray-600 mt-1">{player.card_count} cartes</p>
            <p className="text-xs text-gray-500">{player.tricks_won} plis</p>
          </div>
        </div>

        {/* Carte jouée par ce joueur - POSITION FIXE */}
        {card && (
          <div className={`${cardPositionClasses[position]} z-20`}>
            <Card card={card} size="medium" />
          </div>
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-green-100 to-green-200">
      {/* Zone de jeu - table de tarot circulaire */}
      <div className="relative w-full max-w-6xl h-[700px] bg-green-800 rounded-3xl shadow-2xl overflow-visible">
        {/* Centre de la table */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-green-700 shadow-inner flex items-center justify-center z-0">
          <div className="text-center">
            <p className="text-white text-lg font-semibold">Pli en cours</p>
            <p className="text-green-200 text-sm mt-1">
              {gameState.current_trick.length} / 4 cartes
            </p>
            {gameState.current_player_id && (
              <p className="text-yellow-300 text-sm mt-2 font-semibold">
                Tour: {gameState.current_player_id}
              </p>
            )}
          </div>
        </div>

        {/* Joueurs aux positions fixes */}
        {renderPlayer(0, 'bottom', 'VOUS')}  {/* player_1 - humain */}
        {renderPlayer(1, 'left', 'Bot 2')}   {/* player_2 */}
        {renderPlayer(2, 'top', 'Bot 3')}    {/* player_3 */}
        {renderPlayer(3, 'right', 'Bot 4')}  {/* player_4 */}

        {/* Pause après pli */}
        {trickPauseActive && gameState.trick_winner_id && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 rounded-3xl">
            <div className="bg-white rounded-lg p-8 text-center shadow-2xl">
              <h3 className="text-3xl font-bold text-green-600 mb-3">
                🏆 Pli remporté !
              </h3>
              <p className="text-xl font-semibold text-gray-800 mb-2">
                {gameState.trick_winner_id}
              </p>
              <p className="text-gray-600 text-lg">
                Prochain pli dans {Math.ceil(3 - (gameState.time_since_trick_completed || 0))}s
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main du joueur humain en dessous */}
      <div className="mt-6 bg-white rounded-lg shadow-lg p-6 max-w-6xl w-full">
        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
          Votre main ({playerHand.length} cartes)
        </h3>

        {isMyTurn && (
          <p className="text-center text-green-600 font-semibold mb-4 text-lg">
            ✨ C&apos;est votre tour ! Cliquez sur une carte pour la jouer.
          </p>
        )}

        {!isMyTurn && !trickPauseActive && (
          <p className="text-center text-gray-500 mb-4">
            En attente de {gameState.current_player_id}...
          </p>
        )}

        {/* Affichage des cartes sur 2 lignes */}
        <div className="flex flex-col items-center gap-0">
          {/* Ligne du haut */}
          <div className="flex flex-wrap justify-center gap-1 mb-[-27px] z-10">
            {playerHand.slice(0, Math.ceil(playerHand.length / 2)).map((card) => {
              const isPlayable = isCardPlayable(card);
              return (
                <div
                  key={getCardKey(card)}
                  onClick={() => handleCardClick(card)}
                  className={`transition-transform ${
                    isPlayable ? 'cursor-pointer hover:scale-105' : ''
                  }`}
                >
                  <Card
                    card={card}
                    size="medium"
                    isPlayable={isMyTurn ? isPlayable : true}
                  />
                </div>
              );
            })}
          </div>

          {/* Ligne du bas */}
          <div className="flex flex-wrap justify-center gap-1">
            {playerHand.slice(Math.ceil(playerHand.length / 2)).map((card) => {
              const isPlayable = isCardPlayable(card);
              return (
                <div
                  key={getCardKey(card)}
                  onClick={() => handleCardClick(card)}
                  className={`transition-transform ${
                    isPlayable ? 'cursor-pointer hover:scale-105' : ''
                  }`}
                >
                  <Card
                    card={card}
                    size="medium"
                    isPlayable={isMyTurn ? isPlayable : true}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
