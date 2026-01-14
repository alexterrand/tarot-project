# Frontend Rebuild - Architecture en Couches

## Date: 2026-01-14

## Problème Initial
Le frontend "devinait" l'API au lieu de suivre le contrat exact du backend, causant:
- Phases non synchronisées
- Composants qui ne s'affichent pas
- Logique métier mélangée avec l'affichage

## Solution: Architecture en Couches

```
┌─────────────────────────────────────────┐
│     1. TYPES (contrat partagé)         │
│     - Copie exacte des modèles backend  │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│     2. API CLIENT (communication)       │
│     - Une fonction par endpoint         │
│     - Typage strict Request/Response    │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│     3. GAME CONTEXT (état)             │
│     - Polling 500ms                     │
│     - État synchronisé avec backend     │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│     4. UI COMPONENTS (affichage)       │
│     - Lecture seule du context         │
│     - Un composant par phase           │
└─────────────────────────────────────────┘
```

---

## Corrections Appliquées

### 1. Backend: Fix import error ✅
**Fichier**: `backend/app/services/game_service.py:457`
```python
# AVANT (❌ ImportError)
from tarot_logic.bots.dog_discard_strategy import simple_discard_strategy
cards_to_discard = simple_discard_strategy(taker_player.hand)

# APRÈS (✅)
from tarot_logic.bots.dog_discard_strategy import MaxPointsDiscardStrategy
discard_strategy = MaxPointsDiscardStrategy()
cards_to_discard = discard_strategy.choose_discard(taker_player.hand, 6)
```

### 2. Types Frontend ✅
**Fichiers**:
- `frontend/src/types/game.ts` - Types de jeu (GamePhase, BidType, Player, Contract, etc.)
- `frontend/src/types/api.ts` - Types Request/Response pour chaque endpoint
- `frontend/src/types/card.ts` - Types pour les cartes

Correspondent **exactement** aux modèles Pydantic du backend.

### 3. API Client ✅
**Fichier**: `frontend/src/lib/api/game.ts`

10 fonctions correspondant aux 10 endpoints backend:
1. `createGame()` - POST /api/v1/games
2. `fetchGameState()` - GET /api/v1/games/{id}
3. `fetchPlayerHand()` - GET /api/v1/games/{id}/players/{player_id}/hand
4. `fetchLegalMoves()` - GET /api/v1/games/{id}/legal-moves/{player_id}
5. `fetchBiddingStatus()` - GET /api/v1/games/{id}/bidding/status
6. `makeBid()` - POST /api/v1/games/{id}/bidding/bid
7. `fetchDog()` - GET /api/v1/games/{id}/dog
8. `discardCards()` - POST /api/v1/games/{id}/discard
9. `fetchContract()` - GET /api/v1/games/{id}/contract
10. `playCard()` - POST /api/v1/games/{id}/players/{player_id}/play

**Principe**: Une fonction = un endpoint. Aucune logique métier.

### 4. Game Context avec Polling ✅
**Fichiers**:
- `frontend/src/lib/context/GameContext.tsx` - Context provider
- `frontend/src/lib/hooks/usePolling.ts` - Hook de polling

**Polling toutes les 500ms**:
1. Récupère `gameState` (toujours)
2. Récupère `playerHand` (toujours)
3. Récupère `legalMoves` (si phase playing + mon tour)
4. Récupère `biddingStatus` (si phase bidding)
5. Récupère `contract` (si phase playing/finished)

Gère automatiquement la pause de 3 secondes après chaque pli.

### 5. Composants de Phase ✅
**Répertoire**: `frontend/src/components/phases/`

Chaque phase a son propre composant:

#### `BiddingPhase.tsx` - Phase d'enchères
- Affiche l'historique des enchères
- Affiche l'enchère la plus haute
- Boutons d'enchères (désactivés si plus bas que l'enchère actuelle)
- Attend automatiquement le tour du joueur

#### `DogPhase.tsx` - Affichage du chien
- Si humain est preneur: affiche les 6 cartes du chien
- Si bot est preneur: affiche message d'attente
- Bouton pour continuer vers l'écart

#### `DiscardPhase.tsx` - Sélection de l'écart
- Affiche toute la main (18 cartes)
- Permet de sélectionner 6 cartes
- Bouton de confirmation activé uniquement si 6 cartes sélectionnées

#### `PlayingPhase.tsx` - Jeu des 18 plis
- Affiche le pli en cours au centre
- Affiche la main du joueur sur 2 lignes avec recouvrement (75%)
- Grise les cartes non jouables
- Overlay pendant la pause de 3 secondes après chaque pli
- Affiche le vainqueur du pli

#### `FinishedPhase.tsx` - Scores finaux
- Affiche si le contrat est réussi ou échoué
- Détails du contrat (preneur, type, bouts, points requis)
- Scores finaux (preneur vs défense)
- Plis remportés par chaque joueur
- Bouton "Nouvelle partie"

### 6. Router de Phases ✅
**Fichier**: `frontend/src/components/game/GameBoard.tsx`

Simple switch sur `gameState.phase`:
```typescript
switch (gameState.phase) {
  case 'waiting': return <WaitingMessage />;
  case 'bidding': return <BiddingPhase />;
  case 'dog': return <DogPhase />;
  case 'discard': return <DiscardPhase />;
  case 'playing': return <PlayingPhase />;
  case 'finished': return <FinishedPhase />;
}
```

**Un seul composant affiché à la fois** selon la phase backend.

### 7. Pages ✅
**Fichiers**:
- `frontend/src/app/page.tsx` - Page d'accueil avec bouton "Démarrer une partie"
- `frontend/src/app/game/[gameId]/page.tsx` - Affiche GameBoard (router de phases)
- `frontend/src/app/layout.tsx` - Wrap avec GameProvider

---

## Flow du Jeu

### Scénario 1: Joueur humain prend
1. **Bidding** → Joueur enchérit (ex: GARDE)
2. **Dog** → Affiche les 6 cartes du chien pendant 3 secondes
3. **Discard** → Joueur sélectionne 6 cartes à écarter
4. **Playing** → 18 plis (pause 3s après chaque pli)
5. **Finished** → Scores et résultats

### Scénario 2: Bot prend
1. **Bidding** → Bot enchérit automatiquement
2. **Dog** → Message "Le bot X regarde le chien..." (backend auto-gère l'écart)
3. **Playing** → 18 plis (pause 3s après chaque pli)
4. **Finished** → Scores et résultats

### Scénario 3: Tous passent
1. **Bidding** → Tous passent
2. **Finished** → Partie annulée

---

## Principes de l'Architecture

### ✅ FAIRE
- Copier exactement les types du backend
- Une fonction par endpoint, sans logique métier
- Polling simple toutes les 500ms
- Router par phase (un composant = une phase)
- Composants en lecture seule du context

### ❌ NE PAS FAIRE
- Deviner l'API ou les types
- Ajouter de la logique métier dans l'API client
- Utiliser des websockets (V1 = polling)
- Mélanger plusieurs phases dans un composant
- Modifier directement l'état dans les composants

---

## Structure des Fichiers

```
frontend/
├── src/
│   ├── types/
│   │   ├── card.ts          # Types des cartes
│   │   ├── game.ts          # Types du jeu
│   │   └── api.ts           # Types Request/Response
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts    # Helper HTTP
│   │   │   └── game.ts      # 10 fonctions API
│   │   ├── context/
│   │   │   └── GameContext.tsx  # Provider + actions
│   │   ├── hooks/
│   │   │   └── usePolling.ts    # Hook de polling
│   │   └── utils/
│   │       └── cardHelpers.ts   # Helpers cartes
│   ├── components/
│   │   ├── phases/
│   │   │   ├── BiddingPhase.tsx
│   │   │   ├── DogPhase.tsx
│   │   │   ├── DiscardPhase.tsx
│   │   │   ├── PlayingPhase.tsx
│   │   │   └── FinishedPhase.tsx
│   │   ├── game/
│   │   │   └── GameBoard.tsx    # Router de phases
│   │   └── ui/
│   │       ├── Card.tsx         # Composant carte
│   │       ├── Button.tsx
│   │       └── Spinner.tsx
│   └── app/
│       ├── page.tsx             # Home page
│       ├── game/[gameId]/page.tsx
│       └── layout.tsx           # GameProvider wrapper
```

---

## Tests à Effectuer

### ✅ Test 1: Joueur prend
1. Créer partie
2. Enchérir (PETITE ou GARDE)
3. Voir le chien (6 cartes)
4. Écarter 6 cartes
5. Jouer 18 plis
6. Voir les scores

### ✅ Test 2: Bot prend
1. Créer partie
2. Passer (laisser bot enchérir)
3. Voir message d'attente pendant dog
4. Jouer 18 plis
5. Voir les scores

### ✅ Test 3: Tous passent
1. Créer partie
2. Passer
3. Vérifier que partie se termine

### ✅ Test 4: Pause 3 secondes
- Vérifier l'overlay après chaque pli
- Vérifier le compte à rebours (3, 2, 1)
- Vérifier que les cartes sont bloquées pendant la pause

---

## Commandes pour Tester

```bash
# Terminal 1: Backend
cd backend
uv run uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend
npm run dev

# Ouvrir http://localhost:3000
# Cliquer "Démarrer une partie"
# Tester les scénarios ci-dessus
```

---

## Améliorations Futures (hors scope V3)

### Phase Polish UI
- Ajouter vraies images de cartes (actuellement affichées)
- Animations de transition entre phases
- Sons (cartes jouées, plis remportés)
- Affichage des adversaires autour de la table

### Phase Performance
- Optimiser le polling (ne fetch que ce qui a changé)
- WebSockets pour updates en temps réel
- Compression des images

### Phase Features
- Partie multijoueur (plusieurs humains)
- Historique des parties
- Statistiques de jeu
- Replay de partie
- Chat entre joueurs

---

## Résumé des Changements

| Composant | Avant | Après |
|-----------|-------|-------|
| **Backend** | ImportError | ✅ MaxPointsDiscardStrategy |
| **Types** | Devinés | ✅ Exactement backend |
| **API** | Logique métier mélangée | ✅ Une fonction = un endpoint |
| **Context** | État non synchronisé | ✅ Polling 500ms |
| **UI** | Tout dans GameBoard | ✅ Un composant par phase |
| **Flow** | Incohérent | ✅ Suit exactement backend |

---

## Conclusion

L'architecture en couches garantit:
1. **Contrat strict** entre frontend et backend
2. **Séparation des responsabilités** (types, API, état, UI)
3. **Facilité de maintenance** (une phase = un fichier)
4. **Testabilité** (chaque couche indépendante)
5. **Extensibilité** (ajouter features sans casser l'existant)

Le frontend suit maintenant **exactement** le backend, sans devinettes.
