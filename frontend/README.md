# Tarot Frontend (V3)

Frontend web pour le jeu de Tarot français. Construit avec Next.js 14, TypeScript et Tailwind CSS.

## Prérequis

- Node.js 18+ et npm
- Backend Tarot API en cours d'exécution (voir `../backend/`)

## Installation

```bash
# Installer les dépendances
npm install

# Créer le fichier .env.local (si nécessaire)
cp .env.local.example .env.local
```

## Configuration

Créez un fichier `.env.local` avec l'URL de l'API backend:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Développement

```bash
# Démarrer le serveur de développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Structure du projet

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Layout racine avec GameProvider
│   ├── page.tsx           # Page d'accueil (menu)
│   ├── game/[gameId]/     # Page dynamique de jeu
│   └── globals.css        # Styles globaux
├── components/
│   ├── ui/                # Composants UI génériques
│   │   ├── Button.tsx
│   │   ├── Card.tsx       # Affichage des cartes
│   │   └── Spinner.tsx
│   └── game/              # Composants spécifiques au jeu
│       ├── GameBoard.tsx       # Orchestrateur principal
│       ├── GameStatus.tsx      # Indicateur de phase
│       ├── PlayerHand.tsx      # Main du joueur
│       ├── TrickDisplay.tsx    # Affichage du pli en cours
│       ├── OpponentDisplay.tsx # Affichage des adversaires (bots)
│       ├── BiddingPanel.tsx    # Interface d'enchères
│       ├── DogDisplay.tsx      # Affichage du chien
│       ├── DiscardPanel.tsx    # Interface d'écart
│       └── ScoreDisplay.tsx    # Résultats de fin de partie
├── lib/
│   ├── api/               # Clients API
│   │   ├── client.ts      # Configuration fetch
│   │   └── game.ts        # Endpoints de l'API
│   ├── hooks/
│   │   └── usePolling.ts  # Hook de polling (500ms)
│   ├── utils/
│   │   └── cardHelpers.ts # Fonctions utilitaires (tri, validation)
│   └── context/
│       └── GameContext.tsx # État global (Context API)
└── types/
    ├── card.ts            # Types des cartes
    ├── game.ts            # Types de jeu (phases, contrat, etc.)
    └── api.ts             # Types des requêtes/réponses API
```

## Fonctionnalités

### Phases de jeu
1. **Menu** - Créer une nouvelle partie
2. **Enchères** - Placer une enchère (Passe, Petite, Garde, etc.)
3. **Chien** - Révélation du chien (si preneur)
4. **Écart** - Sélection de 6 cartes à écarter (si preneur)
5. **Jeu** - 18 plis à jouer
6. **Scores** - Résultats de la partie

### Caractéristiques
- ✅ Polling automatique (500ms) pour les mises à jour d'état
- ✅ Cartes non jouables affichées en niveaux de gris
- ✅ Pause de 3 secondes après chaque pli
- ✅ Validation de l'écart (pas de Rois, Atouts, ou Excuse)
- ✅ Affichage du contrat et des scores
- ✅ Interface responsive

## Assets requis

Le jeu nécessite 78 images de cartes au format WebP dans `/public/cards/`:

### Structure des fichiers
```
public/cards/
├── clubs_1.webp → clubs_14.webp      # Trèfle (As → Roi)
├── diamonds_1.webp → diamonds_14.webp # Carreau (As → Roi)
├── hearts_1.webp → hearts_14.webp    # Cœur (As → Roi)
├── spades_1.webp → spades_14.webp    # Pique (As → Roi)
├── trump_1.webp → trump_21.webp      # Atouts (1 → 21)
└── excuse.webp                        # Excuse
```

### Spécifications des images
- Format: WebP
- Résolution: 300×500px (ratio 3:5)
- Qualité: 85
- Taille: ~200-500KB par carte

### Création des assets
Vous pouvez photographier de vraies cartes et les convertir en WebP:

```bash
# Exemple avec ImageMagick
convert input.jpg -resize 300x500 -quality 85 clubs_1.webp
```

## Scripts disponibles

```bash
npm run dev      # Démarrage en mode développement
npm run build    # Build de production
npm run start    # Démarrage du serveur de production
npm run lint     # Vérification du linting
```

## API Backend

Le frontend communique avec l'API backend via REST + polling. Endpoints utilisés:

- `POST /api/v1/games` - Créer une partie
- `GET /api/v1/games/{game_id}` - État de la partie
- `GET /api/v1/games/{game_id}/players/{player_id}/hand` - Main du joueur
- `POST /api/v1/games/{game_id}/bidding/bid` - Placer une enchère
- `GET /api/v1/games/{game_id}/bidding/status` - Statut des enchères
- `GET /api/v1/games/{game_id}/dog` - Cartes du chien
- `POST /api/v1/games/{game_id}/discard` - Écarter des cartes
- `GET /api/v1/games/{game_id}/legal-moves/{player_id}` - Coups légaux
- `POST /api/v1/games/{game_id}/players/{player_id}/play` - Jouer une carte
- `GET /api/v1/games/{game_id}/contract` - Informations du contrat

## État de développement

### ✅ Complété (Sprint 1-2)
- Configuration Next.js + TypeScript + Tailwind
- Types TypeScript complets
- Client API avec gestion d'erreurs
- Context API avec polling
- Composants UI de base (Button, Card, Spinner)
- Page d'accueil avec création de partie
- GameBoard orchestrateur

### 🚧 À tester
- Tous les composants de jeu (nécessite backend en cours d'exécution)
- Images des 78 cartes (à créer/photographier)
- Tests E2E complets d'une partie

### 📋 Améliorations futures (V4+)
- Migration REST → WebSockets pour le multijoueur
- Animations avancées (lancer de carte, célébrations)
- Son et musique
- Mode hors-ligne
- Support 3/5 joueurs

## Déploiement

### Production (Vercel)
```bash
# Build de production
npm run build

# Test en local
npm run start
```

Le déploiement sur Vercel se fait automatiquement depuis GitHub.

### Variables d'environnement production
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api/v1
```

## Dépannage

### Le polling ne fonctionne pas
- Vérifiez que le backend est en cours d'exécution sur `http://localhost:8000`
- Vérifiez la configuration de `NEXT_PUBLIC_API_URL` dans `.env.local`
- Ouvrez la console du navigateur pour les erreurs API

### Les images de cartes ne s'affichent pas
- Vérifiez que tous les fichiers WebP sont dans `/public/cards/`
- Vérifiez la convention de nommage (ex: `hearts_13.webp`)
- Les images doivent être au bon format (WebP)

### Erreur "useGame must be used within a GameProvider"
- Assurez-vous que `GameProvider` enveloppe votre application dans `layout.tsx`

## Licence

Ce projet fait partie du Tarot Project (voir racine du repository).
