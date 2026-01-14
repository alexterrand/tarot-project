# Tarot Project Instructions

## Project Overview
This project is a full implementation of the French Tarot card game (4-player rules) focusing on backend architecture, Artificial Intelligence, and Data Engineering.

**Core Goals:**
1.  **Python Mastery:** The backend and AI logic are the primary focus for enhancing Data Science and Python engineering skills.
2.  **Architecture:** Implementation of a modular architecture (Clean/Hexagonal) to decouple game logic from interfaces.
3.  **Data:** All game logs and bot data must be stored in Supabase (PostgreSQL) for future analysis.
4.  **Infrastructure:** Designed to run on a GCP VPS.

## Tech Stack
- **Language:** Python 3.11+
- **Package Manager:** uv
- **Framework:** FastAPI + Uvicorn
- **Database:** Supabase (PostgreSQL)
- **Testing:** pytest
- **Linting/Formatting:** ruff
- **Frontend:** React/Next.js (Planned for employability)

## Architecture & File Structure
- **`backend/tarot_logic/`**: The core domain. Contains pure Python rules, card definitions, and game state. **No external dependencies** (no database, no API framework, no UI).
- **`backend/app/`**: The infrastructure layer. Manages the FastAPI application, API endpoints, database connections, and serves the game.
- **`backend/pygame_client/`**: A thick client used for development and visual debugging.
- **`frontend/`**: The future web interface (V3).

## Development Guidelines
1.  **Logic Isolation:** Never modify `tarot_logic` to accommodate UI or Database specificities. The logic must remain pure.
2.  **Type Safety:** All Python code must use strict type hints.
3.  **Testing:** Any change to logic must be verified with `pytest`.
4.  **Environment:** Do not modify files inside `tarot-env/`.
5.  **Data First:** Every architectural decision regarding the game loop must consider how data will be extracted for the database (logs/training).
6. **Langage:** All code and comment should be written in english

## Common Commands
- **Install Dependencies:** `cd backend && uv sync`
- **Run Tests:** `cd backend && uv run pytest`
- **Run API:** `cd backend && uv run uvicorn app.main:app --reload`
- **Run Pygame Client:** `cd backend && uv run python pygame_client/main.py`
- **Format Code:** `cd backend && uv run ruff format .`

## Project Roadmap

### V1 - Base (Completed)
- 4-player CLI support (Bash).
- Random AI plays legal moves.
- Kitty (Chien) implementation.
- Exact scoring system.
- Excuse management.
- Bidding system and Oudlers (Bouts) management.
- Dockerisation

### V2 - Simple AI & Data ✅ COMPLETED
**Bot Strategies** ✅
- ✅ Strategy Pattern implementation for modular bot AI
- ✅ `bot-naive`: Smart greedy strategy with special card handling (Petit, Excuse)
- ✅ `bot-random`: Random legal card selection
- ✅ Reusable helper module for special card logic
- ✅ Comprehensive test suite (46 tests)

**Data & Simulation** ✅
- ✅ **Supabase integration** (PostgreSQL for game logging):
  - Schema: `games` (metadata) → `game_rounds` (contract, initial hands, dog) → `tricks` (cards played, winner) → `bot_decisions` (RL training data: hand, legal moves, card played)
  - Logging: Batch write at game end (in-memory cache during play for performance)
  - GameLoggerService: Separate middleware (doesn't pollute game logic)
  - Full bidding and contract support
  - Pushed to remote (4 logical commits)
- ✅ **Simulation module** for AI-vs-AI benchmarking:
  - CLI script (`scripts/simulate.py`) to run N games with configurable bot strategies
  - SimulationService orchestrator for batch game execution
  - Flexible strategy assignment per player (any combination of bot-naive/bot-random)
  - All games logged to Supabase (non-blocking error handling)
  - Usage: `uv run python scripts/simulate.py --games 100 --p1 bot-naive --p2 bot-random --p3 bot-naive --p4 bot-random`
  - Seed support for reproducible simulations

**Bidding & Contract System** ✅
- ✅ **Complete bidding implementation**:
  - BidType enum: PASS, PETITE, GARDE, GARDE_SANS, GARDE_CONTRE with comparison operators
  - BiddingRound class: manages auction, determines taker and contract
  - Contract class: tracks taker, type, oudlers, points needed/achieved
  - run_bidding_phase(): orchestrates bidding for all players
- ✅ **Bidding strategies**:
  - PointBasedBiddingStrategy: bids based on hand strength % (40%/60%/80%/95% thresholds)
  - RandomBiddingStrategy: baseline for testing
  - Factory function for easy instantiation
- ✅ **Dog (chien) management**:
  - run_dog_phase(): gives dog to taker, taker discards
  - MaxPointsDiscardStrategy: maximizes points in dog (respects rules: no Kings/Trumps/Excuse)
  - RandomDiscardStrategy: baseline
  - Factory function for discard strategies
- ✅ **Contract finalization**:
  - Counts oudlers AFTER dog phase
  - Calculates correct points_needed (36/41/51/56 based on oudlers)
  - Evaluates contract success

**Scoring System** ✅
- ✅ **Official Tarot scoring** (`tarot_logic/scoring.py`):
  - Base score = |taker_points - points_needed|
  - Contract multipliers: Petite×1, Garde×2, Garde Sans×3, Garde Contre×4
  - 4-player distribution: taker gains/loses ×3, each defender ∓base_score
  - Zero-sum property verified
  - Proper separation of concerns (scoring logic in `tarot_logic`, not service layer)
- ✅ **Leaderboard calculation**:
  - Integrated into Supabase logging
  - Accurate reflection of contract results
  - Abandoned games handled (everyone at 0)

**Data Quality** ✅
- ✅ Correct taker_id in game_rounds (updated after bidding)
- ✅ Correct contract_type and contract_points_needed (updated after dog phase)
- ✅ Accurate taker_team_points and defense_team_points (91 total)
- ✅ Correct contract_won determination (taker_points >= points_needed)
- ✅ Proper is_taker and contract_type in bot_decisions
- ✅ Abandoned games logged correctly (taker_id=NULL, contract_type="abandoned", no tricks/decisions)

### V3 - Simple Frontend ✅ COMPLETED
**Backend API Enhancements** ✅
- ✅ **New Pydantic models**:
  - `GamePhaseEnum`: 6 phases (waiting, bidding, dog, discard, playing, finished)
  - `BidTypeEnum`, `BidRequest`, `BidModel`, `BiddingStatusModel`
  - `DogModel`, `DiscardRequest`
  - `ContractModel`, `LegalMovesModel`
  - `GamePublicState` extended with: `phase`, `contract`, `trick_winner_id`, `time_since_trick_completed`, `trick_player_indices`
- ✅ **6 new REST endpoints**:
  - `POST /api/v1/games/{game_id}/bidding/bid` - Place a bid
  - `GET /api/v1/games/{game_id}/bidding/status` - Get bidding status
  - `GET /api/v1/games/{game_id}/dog` - Get dog cards (taker only)
  - `POST /api/v1/games/{game_id}/discard` - Discard cards (taker only)
  - `GET /api/v1/games/{game_id}/legal-moves/{player_id}` - Get legal moves
  - `GET /api/v1/games/{game_id}/contract` - Get contract info
- ✅ **Game phase management** in GameService:
  - Phase transitions: BIDDING → DOG → DISCARD → PLAYING → FINISHED
  - 3-second trick pause mechanism (timestamp tracking)
  - 3-second dog display for bot takers (auto-discard after timeout)
  - Bidding validation (turn order, bid validity)
  - Discard validation (no Kings/Trumps/Excuse unless forced)
  - Bot auto-discard with `MaxPointsDiscardStrategy`
  - Final score calculation (points + oudlers recalculated at game end)
  - Integration with `tarot_logic.bidding_phase` (finalize_contract)
  - `trick_player_indices` tracking for precise card positioning

**Frontend** ✅
- ✅ **Tech Stack**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- ✅ **Game Loop**: REST API polling (500ms interval)
- ✅ **Card Rendering**: 78 card images (WebP format, 400x600px)
- ✅ **Phase Components**:
  - `MenuPhase`: Start game button
  - `BiddingPhase`: Display hand (18 cards), bid buttons, bot auto-bidding
  - `DogPhase`: Show 6 dog cards, 3-second countdown, auto-transition to discard
  - `DiscardPhase`: Select 6 cards to discard, validation feedback
  - `PlayingPhase`: Circular table layout (player bottom, bots left/top/right), fixed card positions using `trick_player_indices`, legal move highlighting, 3-second trick pause
  - `FinishedPhase`: Contract details, final scores, oudlers count, tricks won per player
- ✅ **UX Features**:
  - Grayed out unplayable cards
  - Click to play card
  - 3-second pause after each trick with winner announcement
  - 3-second dog display for bot takers
  - Bot auto-play (500ms interval)
  - Hover effects on playable cards
  - Visual indicators for current player turn
  - Consistent card positioning (uses `trick_player_indices` for mapping)
- ✅ **Game Context**: usePolling hook, GameProvider with full state management
- ✅ **Responsive Design**: Tailwind CSS with gradient backgrounds, shadows, animations

### V4 - Live
- Online multiplayer capabilities.
- Lobby system to play with other humans.

### V5 - Global Improvements
- 3 and 5 player variants (King call).
- New game modes (Sandbox, Tournament).
- Audio/Music integration.

### V6 - Deep Reinforcement Learning
- Training an agent using Deep Reinforcement Learning based on collected data.
  

