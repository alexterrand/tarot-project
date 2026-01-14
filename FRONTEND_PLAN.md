# Frontend Implementation Plan - Tarot V3

## Context Summary

**Backend Status:** ✅ COMPLETE
- FastAPI backend with 6 new endpoints for bidding, dog, discard, legal moves, contract
- Game phase management (BIDDING → DOG → DISCARD → PLAYING → FINISHED)
- 3-second trick pause mechanism (server-side timestamp tracking)
- All data logged to Supabase (4 tables: games, game_rounds, tricks, bot_decisions)

**Frontend Goal:** Build a minimal web UI (V1) for 1 human player + 3 bots

---

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **HTTP Client:** fetch (native) or axios
- **State Management:** React Context API (sufficient for V1)
- **Assets:** 78 WebP card images in `/public/cards/`
- **Communication:** REST API + polling (500ms interval)

---

## API Endpoints Reference

### Existing Endpoints
- `POST /api/v1/games` - Create game
- `GET /api/v1/games/{game_id}` - Get game state (includes `phase`, `contract`, `trick_winner_id`, `time_since_trick_completed`)
- `GET /api/v1/games/{game_id}/players/{player_id}/hand` - Get player hand
- `POST /api/v1/games/{game_id}/players/{player_id}/play` - Play card

### New Endpoints (V3)
- `POST /api/v1/games/{game_id}/bidding/bid` - Place bid
  - Request: `{"player_id": "player_1", "bid_type": "PASS|PETITE|GARDE|GARDE_SANS|GARDE_CONTRE"}`
  - Response: `{"success": true, "message": "...", "bidding_status": {...}}`
- `GET /api/v1/games/{game_id}/bidding/status` - Get bidding status
  - Response: `{"bidding_complete": false, "bids": [...], "current_bidder_id": "player_2", "current_highest_bid": "PETITE", "taker_id": "player_1"}`
- `GET /api/v1/games/{game_id}/dog?player_id={player_id}` - Get dog cards
  - Response: `{"cards": [...], "can_view": true}` (only visible to taker)
- `POST /api/v1/games/{game_id}/discard` - Discard cards
  - Request: `{"player_id": "player_1", "cards": [CardModel, ...]}`
  - Response: `{"success": true, "message": "...", "contract": {...}}`
- `GET /api/v1/games/{game_id}/legal-moves/{player_id}` - Get legal moves
  - Response: `{"player_id": "player_1", "legal_cards": [CardModel, ...]}`
- `GET /api/v1/games/{game_id}/contract` - Get contract info
  - Response: `{"taker_id": "player_1", "contract_type": "PETITE", "oudlers_count": 2, "points_needed": 41, "taker_points": 38.5, "defense_points": 52.5}`

---

## Data Models (TypeScript)

```typescript
// Card representation
interface CardModel {
  suit: 'CLUBS' | 'DIAMONDS' | 'HEARTS' | 'SPADES' | 'TRUMP' | 'EXCUSE';
  rank: number; // 1-14 (suits), 1-21 (trumps), 0 (excuse)
  display_name: string; // "Roi de Coeur", "Atout 21", etc.
}

// Game phases
type GamePhase = 'waiting' | 'bidding' | 'dog' | 'discard' | 'playing' | 'finished';

// Bid types
type BidType = 'PASS' | 'PETITE' | 'GARDE' | 'GARDE_SANS' | 'GARDE_CONTRE';

// Contract information
interface ContractModel {
  taker_id: string;
  contract_type: BidType;
  oudlers_count: number;
  points_needed: number;
  taker_points: number;
  defense_points: number;
}

// Player model
interface PlayerModel {
  id: string;
  card_count: number;
  is_current: boolean;
  is_human: boolean;
  tricks_won: number;
}

// Game public state
interface GamePublicState {
  game_id: string;
  players: PlayerModel[];
  current_trick: CardModel[];
  current_player_id: string;
  is_game_over: boolean;
  phase: GamePhase;
  contract: ContractModel | null;
  trick_winner_id: string | null;
  time_since_trick_completed: number | null; // Seconds since trick ended (for 3s pause)
}

// Bidding status
interface BiddingStatusModel {
  bidding_complete: boolean;
  bids: Array<{player_id: string; bid_type: BidType}>;
  current_bidder_id: string | null;
  current_highest_bid: BidType | null;
  taker_id: string | null;
}
```

---

## Asset Organization

### Card Naming Convention (78 cards)

**Location:** `/frontend/public/cards/`

**Format:** `{suit}_{rank}.webp`

**Suits (56 cards):**
- `clubs_1.webp` to `clubs_14.webp` (As → Roi)
- `diamonds_1.webp` to `diamonds_14.webp`
- `hearts_1.webp` to `hearts_14.webp`
- `spades_1.webp` to `spades_14.webp`

**Trumps (21 cards):**
- `trump_1.webp` (Petit) to `trump_21.webp` (Monde)

**Excuse (1 card):**
- `excuse.webp`

**Helper function:**
```typescript
// src/lib/utils/cardHelpers.ts
export function getCardImagePath(card: CardModel): string {
  if (card.suit === 'EXCUSE') return '/cards/excuse.webp';

  const suitMap = {
    CLUBS: 'clubs',
    DIAMONDS: 'diamonds',
    HEARTS: 'hearts',
    SPADES: 'spades',
    TRUMP: 'trump'
  };

  const suitName = suitMap[card.suit];
  return `/cards/${suitName}_${card.rank}.webp`;
}
```

**Image specs:**
- Resolution: 300×500px (3:5 ratio)
- Format: WebP (quality 85)
- Compression: ~200-500KB per card

---

## Project Structure

```
frontend/
├── public/
│   └── cards/              # 78 WebP images
│       ├── clubs_1.webp ... clubs_14.webp
│       ├── diamonds_1.webp ... diamonds_14.webp
│       ├── hearts_1.webp ... hearts_14.webp
│       ├── spades_1.webp ... spades_14.webp
│       ├── trump_1.webp ... trump_21.webp
│       └── excuse.webp
│
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Home page (menu)
│   │   ├── game/
│   │   │   └── [gameId]/
│   │   │       └── page.tsx  # Dynamic game page
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/             # Generic UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx    # Card display component
│   │   │   └── Spinner.tsx
│   │   │
│   │   └── game/           # Game-specific components
│   │       ├── GameBoard.tsx       # Main container (orchestrates all phases)
│   │       ├── PlayerHand.tsx      # Human player's hand
│   │       ├── OpponentDisplay.tsx # Bot display
│   │       ├── TrickDisplay.tsx    # Current trick (4 cards in cross layout)
│   │       ├── BiddingPanel.tsx    # Bidding interface (5 buttons)
│   │       ├── DogDisplay.tsx      # Dog cards (6 cards)
│   │       ├── DiscardPanel.tsx    # Discard interface (select 6 cards)
│   │       ├── ScoreDisplay.tsx    # End-game results
│   │       └── GameStatus.tsx      # Phase + current player indicator
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts   # Axios/fetch configuration
│   │   │   └── game.ts     # API functions (createGame, makeBid, playCard, etc.)
│   │   │
│   │   ├── hooks/
│   │   │   ├── useGame.ts         # Main game state hook
│   │   │   ├── usePolling.ts      # Polling hook (500ms)
│   │   │   └── useCardSelection.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── cardHelpers.ts     # getCardImagePath, sortCards, isCardPlayable
│   │   │   └── gamePhase.ts
│   │   │
│   │   └── context/
│   │       └── GameContext.tsx    # Global game state (Context API)
│   │
│   └── types/
│       ├── game.ts         # GamePublicState, GamePhase, etc.
│       ├── card.ts         # CardModel, Suit, Rank
│       └── api.ts          # API response types
│
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
└── README.md
```

---

## Component Architecture

### Component Hierarchy
```
GameBoard (Main orchestrator)
├── GameStatus (Phase indicator, current player)
├── OpponentDisplay × 3 (Bots)
├── TrickDisplay (Current trick - 4 cards)
├── PlayerHand (Human player's hand)
└── Conditional panels (based on phase):
    ├── BiddingPanel (phase === 'bidding')
    ├── DogDisplay (phase === 'dog' && isHumanTaker)
    ├── DiscardPanel (phase === 'discard' && isHumanTaker)
    └── ScoreDisplay (phase === 'finished')
```

### Key Components

#### Card.tsx
```typescript
interface CardProps {
  card: CardModel;
  isPlayable?: boolean;      // False → grayscale filter
  isSelected?: boolean;      // True → border highlight (for discard)
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
}

// Features:
// - Load image from getCardImagePath()
// - Apply grayscale filter if !isPlayable
// - Apply border highlight if isSelected
// - Hover effect if clickable
```

#### PlayerHand.tsx
```typescript
interface PlayerHandProps {
  cards: CardModel[];
  legalCards: CardModel[];   // For graying out unplayable cards
  selectedCards?: CardModel[]; // For discard phase
  onCardClick: (card: CardModel) => void;
  phase: GamePhase;
}

// Features:
// - Sort cards: Excuse, Trumps (1→21), Suits (Clubs, Diamonds, Hearts, Spades)
// - Display in fan layout (flexbox with overlap)
// - Gray out non-legal cards (compare cards with legalCards)
// - Multi-selection support (discard phase)
```

#### TrickDisplay.tsx
```typescript
interface TrickDisplayProps {
  trick: CardModel[];
  playerIds: string[];       // For positioning cards (N, E, S, W)
  currentPlayerId: string;
  trickWinnerId?: string;    // Highlight winning card
}

// Features:
// - Display 4 cards in cross layout (North, East, South, West)
// - Fade-in animation when card played
// - Highlight winning card after 3s pause
// - Fade-out animation when trick completed
```

#### BiddingPanel.tsx
```typescript
interface BiddingPanelProps {
  currentBidderId: string;
  humanPlayerId: string;
  bids: Array<{player_id: string; bid_type: BidType}>;
  currentHighestBid: BidType | null;
  onBid: (bidType: BidType) => void;
}

// Features:
// - 5 buttons: PASS, PETITE, GARDE, GARDE_SANS, GARDE_CONTRE
// - Disable buttons if bid <= currentHighestBid
// - Scrollable bid history
// - Only active when currentBidderId === humanPlayerId
```

#### DiscardPanel.tsx
```typescript
interface DiscardPanelProps {
  hand: CardModel[];
  selectedCards: CardModel[];
  onCardSelect: (card: CardModel) => void;
  onConfirmDiscard: () => void;
}

// Features:
// - Allow selection of exactly 6 cards
// - Validation: no Kings, no Trumps (unless forced), no Excuse
// - "Confirm" button active when 6 cards selected
// - Show warning if invalid selection
```

#### GameStatus.tsx
```typescript
interface GameStatusProps {
  phase: GamePhase;
  currentPlayerId: string;
  humanPlayerId: string;
  contract?: ContractModel;
}

// Features:
// - Display current phase in French ("Phase d'enchères", "Écart", etc.)
// - Show "Votre tour" / "En attente de [player_id]"
// - Show contract info if defined (taker, type, points needed)
// - Show countdown for 3s pause (if time_since_trick_completed < 3)
```

---

## Game Flow (Phase Transitions)

### Phase 1: Menu (page: `/`)
- Display: "Démarrer Partie" button
- Action: `POST /api/v1/games` → Redirect to `/game/[gameId]`

### Phase 2: Bidding (phase: "bidding")
- **Detection:** `gameState.phase === "bidding"`
- **Component:** BiddingPanel
- **Polling:** `GET /games/{id}/bidding/status` (500ms)
- **Human Action:** Click button → `POST /games/{id}/bidding/bid`
- **Bots:** Auto-play (backend handles)
- **Transition:** When `biddingComplete === true` → Phase 3 or 4

### Phase 3: Dog (phase: "dog")
- **Detection:** `gameState.phase === "dog" && isHumanTaker`
- **Component:** DogDisplay
- **Action:** Display 6 cards, "Continue" button
- **Transition:** Auto-transition after 3s or button click → Phase 4

### Phase 4: Discard (phase: "discard")
- **Detection:** `gameState.phase === "discard" && isHumanTaker`
- **Component:** DiscardPanel
- **Action:** Select 6 cards → `POST /games/{id}/discard`
- **Validation:** No Kings/Trumps/Excuse (frontend + backend)
- **Transition:** After successful discard → Phase 5

### Phase 5: Playing (phase: "playing")
- **Detection:** `gameState.phase === "playing"`
- **Component:** GameBoard (full display)
- **Polling:** `GET /games/{id}` (500ms)
- **Features:**
  - **Gray out unplayable cards:** Compare `playerHand` with `legalMoves`
  - **Human plays card:** Click card → `POST /games/{id}/players/{id}/play`
  - **Trick completion:** When `trick.length === 4`:
    - Backend sets `time_since_trick_completed` timestamp
    - Frontend: Display "Pli remporté par [winner]" for 3s
    - Frontend: Block UI (set `legalMoves = []`)
    - After 3s: Backend auto-plays bots, trick clears
  - **Bots:** Auto-play (backend orchestrates in `_play_ai_turns`)
- **Transition:** When `is_game_over === true` → Phase 6

### Phase 6: Scoring (phase: "finished")
- **Detection:** `gameState.is_game_over === true`
- **Component:** ScoreDisplay
- **Action:** Display results, "Nouvelle Partie" button
- **Data shown:**
  - Taker vs Defense
  - Points: taker_points / defense_points
  - Contract success/failure
  - Final scores per player

---

## Polling Strategy

### Hook: usePolling (500ms interval)

```typescript
// src/lib/hooks/usePolling.ts
function usePolling(gameId: string, humanPlayerId: string, interval = 500) {
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      // 1. Fetch game state
      const gameState = await fetchGameState(gameId);

      // 2. Fetch player hand
      const playerHand = await fetchPlayerHand(gameId, humanPlayerId);

      // 3. Fetch legal moves (if playing phase)
      const legalMoves = await fetchLegalMoves(gameId, humanPlayerId);

      // 4. Fetch contract (if phase >= playing)
      const contract = gameState.phase !== 'bidding' ? await fetchContract(gameId) : null;

      // 5. Update context
      updateGameContext({ gameState, playerHand, legalMoves, contract });

      // 6. Handle 3s trick pause
      if (gameState.time_since_trick_completed !== null) {
        if (gameState.time_since_trick_completed < 3) {
          setTrickPauseActive(true); // Block UI
        } else {
          setTrickPauseActive(false);
        }
      }
    }, interval);

    return () => clearInterval(pollInterval);
  }, [gameId, humanPlayerId]);
}
```

### Trick Pause Logic (3 seconds)

**Backend behavior:**
- When trick completes: Store `timestamp = time.time()` in `trick_completion_times[game_id]`
- In `get_game_state()`: Calculate `time_since_trick_completed = time.time() - timestamp`
- After 3s: Clear timestamp, auto-play bots for next trick

**Frontend behavior:**
- If `time_since_trick_completed < 3`:
  - Display overlay: "Pli remporté par [trick_winner_id]"
  - Show countdown: "Prochain pli dans {3 - time_since_trick_completed}s"
  - Block UI: `legalMoves = []` (force disable clicks)
- After 3s:
  - Hide overlay
  - Resume polling
  - Bots will have auto-played (backend handles)

---

## State Management (Context API)

### GameContext.tsx

```typescript
interface GameContextValue {
  // Game state
  gameId: string | null;
  humanPlayerId: string;
  gameState: GamePublicState | null;
  playerHand: CardModel[];
  legalMoves: CardModel[];
  contract: ContractModel | null;
  phase: GamePhase;

  // Actions
  createGame: () => Promise<void>;
  makeBid: (bidType: BidType) => Promise<void>;
  playCard: (card: CardModel) => Promise<void>;
  discardCards: (cards: CardModel[]) => Promise<void>;

  // UI state
  isLoading: boolean;
  error: string | null;
  trickPauseActive: boolean; // True when trick pause is active
}

// Provider wraps app at root level
// Manages polling, API calls, and state updates
```

---

## Card Display Rules

### Sorting Order (PlayerHand)
1. **Excuse** (if present)
2. **Trumps** (ascending: 1 → 21)
3. **Suits** (Clubs → Diamonds → Hearts → Spades)
4. **Within each suit:** As → Roi (1 → 14)

### Graying Out Unplayable Cards

```typescript
// In PlayerHand.tsx
{cards.map(card => {
  const isPlayable = phase === 'playing' &&
                     isMyTurn &&
                     isCardInLegalMoves(card, legalMoves);

  return (
    <Card
      key={getCardKey(card)}
      card={card}
      isPlayable={isPlayable}
      onClick={() => isPlayable && onCardClick(card)}
    />
  );
})}
```

**Rule:** Card is playable if:
- `phase === 'playing'` (not bidding/dog/discard)
- AND `currentPlayerId === humanPlayerId`
- AND `card` is in `legalMoves` array

---

## API Client Implementation

### src/lib/api/game.ts

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export async function createGame(): Promise<{game_id: string; human_player_id: string}> {
  const response = await fetch(`${API_BASE_URL}/games`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({num_players: 4, human_player_id: 'player_1'})
  });
  return response.json();
}

export async function fetchGameState(gameId: string): Promise<GamePublicState> {
  const response = await fetch(`${API_BASE_URL}/games/${gameId}`);
  return response.json();
}

export async function fetchPlayerHand(gameId: string, playerId: string): Promise<CardModel[]> {
  const response = await fetch(`${API_BASE_URL}/games/${gameId}/players/${playerId}/hand`);
  const data = await response.json();
  return data.cards;
}

export async function fetchLegalMoves(gameId: string, playerId: string): Promise<CardModel[]> {
  const response = await fetch(`${API_BASE_URL}/games/${gameId}/legal-moves/${playerId}`);
  const data = await response.json();
  return data.legal_cards;
}

export async function makeBid(gameId: string, playerId: string, bidType: BidType): Promise<void> {
  await fetch(`${API_BASE_URL}/games/${gameId}/bidding/bid`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({player_id: playerId, bid_type: bidType})
  });
}

export async function playCard(gameId: string, playerId: string, card: CardModel): Promise<void> {
  await fetch(`${API_BASE_URL}/games/${gameId}/players/${playerId}/play`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({card})
  });
}

export async function discardCards(gameId: string, playerId: string, cards: CardModel[]): Promise<void> {
  await fetch(`${API_BASE_URL}/games/${gameId}/discard`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({player_id: playerId, cards})
  });
}

export async function fetchContract(gameId: string): Promise<ContractModel> {
  const response = await fetch(`${API_BASE_URL}/games/${gameId}/contract`);
  return response.json();
}
```

---

## Implementation Order (Priority)

### Sprint 1: Infrastructure (2-3 days)
1. Setup Next.js project (`npx create-next-app@latest`)
2. Configure TypeScript (strict mode)
3. Configure Tailwind CSS
4. Define types (`src/types/game.ts`, `src/types/card.ts`)
5. Create API client (`src/lib/api/client.ts`, `src/lib/api/game.ts`)
6. Create GameContext boilerplate

### Sprint 2: UI Components (2 days)
7. Prepare 78 WebP assets (photo + conversion)
8. Implement `Card.tsx` (image display, styles)
9. Implement `CardGrid.tsx` / `PlayerHand.tsx`
10. Create layout components (`TableLayout.tsx`)
11. Create home page (`app/page.tsx`) + "Démarrer Partie" button

### Sprint 3: Playing Phase (PRIORITY - 3 days)
12. Implement `TrickDisplay.tsx` (4 cards in cross)
13. Implement `GameBoard.tsx` (orchestrates all phases)
14. Implement `GameContext.tsx` + `usePolling.ts`
15. Integrate grayed out cards (`legalMoves` comparison)
16. Implement play card action → `POST /play`
17. **Implement 3s trick pause** (overlay + countdown)

### Sprint 4: Bidding + Discard (3 days)
18. Implement `BiddingPanel.tsx` + integrate `POST /bidding/bid`
19. Display bid history (scrollable)
20. Implement `DogDisplay.tsx` (show 6 cards if taker)
21. Implement `DiscardPanel.tsx` (multi-card selection)
22. Validate discard rules (no Kings/Trumps/Excuse)
23. Integrate `POST /discard`

### Sprint 5: Scoring + Polish (2 days)
24. Implement `ScoreDisplay.tsx` (end-game results)
25. Add animations (fade-in/out for tricks)
26. Responsive design (mobile support)
27. Basic E2E test (Playwright)
28. Documentation (README.md)

---

## Critical Decisions

### 1. Why Context API (not Redux/Zustand)?
- V1 = single-player local game (no complex state)
- Context + hooks sufficient for polling and state management
- Migration to Zustand possible for V4 (multiplayer WebSockets)

### 2. Why REST + Polling (not WebSockets)?
- Simpler implementation for V1
- No need to manage WS connections
- 500ms latency acceptable for single-player
- V4 will migrate to WebSockets for multiplayer

### 3. Why Backend Manages Trick Pause (not Frontend)?
- Avoids desynchronization (prepares V4 multi-client)
- Backend sends `time_since_trick_completed`, frontend just displays
- Single source of truth

### 4. Why WebP (not PNG/SVG)?
- User will photograph cards → WebP for compression
- File size: ~500KB vs 2MB per card (PNG)
- V1 = static images, no need for SVG animations

---

## Testing Strategy

### Manual Testing Checklist
1. Create game → Phase = "bidding"
2. Human bids "PETITE" → Bots auto-bid (polling)
3. If human is taker → See dog (6 cards) → Discard 6 cards
4. Play 18 tricks:
   - Verify grayed out cards (compare with legal moves)
   - Click playable card → POST /play
   - Verify 3s pause after trick (overlay + countdown)
   - Bots auto-play (polling)
5. End of game → See scoring (taker vs defense, points)
6. Verify Supabase logs (4 tables populated)

### Commands
```bash
# Backend
cd backend && uv run uvicorn app.main:app --reload

# Frontend
cd frontend && npm run dev

# Open: http://localhost:3000
```

---

## Environment Variables

### frontend/.env.local
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## Deployment Notes (Future V4)

- Backend: GCP VPS (Docker container)
- Frontend: Vercel (Next.js native deployment)
- Database: Supabase (already configured)
- Domain: TBD

---

## Known Limitations (V1)

- No animations (fade-in/out tricks only)
- No sound/music
- No multiplayer (V4)
- No 3/5 player variants (V5)
- No mobile-optimized layout (basic responsive only)
- No offline mode

---

## Next Steps After Frontend V1

1. **V4 - Multiplayer:**
   - Migrate REST → WebSockets
   - Add lobby system
   - User authentication (Supabase Auth)

2. **V5 - Enhancements:**
   - 3/5 player variants
   - Sound effects + music
   - Advanced animations (card throw, win celebrations)

3. **V6 - Deep RL:**
   - Train RL agent on Supabase data
   - Deploy trained model as new bot strategy

---

## File References (Backend)

**Modified files (V3):**
- `backend/app/models/game.py` - New models (GamePhaseEnum, BidTypeEnum, ContractModel, etc.)
- `backend/app/api/endpoints.py` - 6 new endpoints
- `backend/app/services/game_service.py` - Phase management, bidding, discard, contract logic

**Existing files (used by frontend):**
- `backend/tarot_logic/` - Core game logic (rules, cards, state)
- `backend/tarot_logic/bidding.py` - BiddingRound, BidType
- `backend/tarot_logic/contract.py` - Contract class
- `backend/tarot_logic/rules.py` - get_legal_moves()

---

## Summary for AI Agent

**Context:** Backend is complete. Frontend needs to be built from scratch.

**Goal:** Create Next.js frontend with TypeScript + Tailwind for 1 human + 3 bots.

**Key Features:**
- 6 phases (menu → bidding → dog → discard → playing → scoring)
- REST API polling (500ms)
- Grayed out unplayable cards (compare with legal moves)
- 3s pause after trick (server timestamp, frontend displays countdown)
- 78 WebP card images (user will provide)

**Architecture:**
- App Router (Next.js 14+)
- Context API (GameContext)
- Component hierarchy: GameBoard → Conditional panels (BiddingPanel, DiscardPanel, etc.)
- Helper functions: getCardImagePath(), sortCards(), isCardPlayable()

**Priority:**
1. Setup project (types, API client, context)
2. **Playing phase first** (core gameplay)
3. Bidding + discard
4. Scoring + polish

**Critical files to create:**
- `src/lib/api/game.ts` - All API calls
- `src/lib/context/GameContext.tsx` - Global state
- `src/lib/hooks/usePolling.ts` - 500ms polling
- `src/components/game/GameBoard.tsx` - Main orchestrator
- `src/components/ui/Card.tsx` - Base card component
- `src/lib/utils/cardHelpers.ts` - getCardImagePath, sortCards

**Start with:** Sprint 1 (infrastructure setup)
