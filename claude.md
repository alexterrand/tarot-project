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

### V2 - Simple AI & Data (Current Focus)
- Refactor to support multiple AI strategies (Strategy Pattern).
- Implementation of distinct "Bot" classes.
- Implement a first strategy called "bot-naive" that always played the stronger card autorized by tarot logic
- Implement a second strategy called "bot-randow" that always played ramdomly a card autorized by tarot logic
- Connection to Supabase for game logging.
- Simulation module to run parallel AI-vs-AI games for performance benchmarking.

### V3 - Simple Frontend
- Web UI implementation (React/Next.js).
- Hand visualization.
- Active trick visualization.
- Minimalist avatars, no complex animations.

### V4 - Live
- Online multiplayer capabilities.
- Lobby system to play with other humans.

### V5 - Global Improvements
- 3 and 5 player variants (King call).
- New game modes (Sandbox, Tournament).
- Audio/Music integration.

### V6 - Deep Reinforcement Learning
- Training an agent using Deep Reinforcement Learning based on collected data.
  

