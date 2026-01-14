# Commandes Utiles - Frontend Tarot

## 🚀 Installation & Démarrage

```bash
# Installation des dépendances
npm install

# Démarrage en mode développement
npm run dev

# Build de production
npm run build

# Démarrage du serveur de production
npm run start

# Linting
npm run lint
```

## 🔧 Développement

### Démarrage complet (Backend + Frontend)

Terminal 1 (Backend):
```bash
cd backend
uv run uvicorn app.main:app --reload
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

Accès:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Backend Docs: http://localhost:8000/docs

### Hot reload

Le frontend se recharge automatiquement lors des modifications de fichiers.

## 🎨 Créer des images de cartes placeholder

### Avec ImageMagick (recommandé)

```bash
cd public/cards

# Créer tous les placeholders en une commande
for suit in clubs diamonds hearts spades; do
  for rank in {1..14}; do
    convert -size 300x500 xc:lightblue \
      -gravity center \
      -pointsize 50 \
      -annotate +0+0 "$suit $rank" \
      ${suit}_${rank}.webp
  done
done

for trump in {1..21}; do
  convert -size 300x500 xc:gold \
    -gravity center \
    -pointsize 50 \
    -annotate +0+0 "Atout $trump" \
    trump_${trump}.webp
done

convert -size 300x500 xc:purple \
  -gravity center \
  -pointsize 50 \
  -annotate +0+0 "Excuse" \
  excuse.webp
```

### Sans ImageMagick (placeholder vide)

```bash
cd public/cards

# Créer des fichiers vides (le jeu affichera des images cassées)
for suit in clubs diamonds hearts spades; do
  for rank in {1..14}; do
    touch ${suit}_${rank}.webp
  done
done

for trump in {1..21}; do
  touch trump_${trump}.webp
done

touch excuse.webp
```

## 🐛 Dépannage

### Réinstaller les dépendances

```bash
rm -rf node_modules package-lock.json
npm install
```

### Nettoyer le cache Next.js

```bash
rm -rf .next
npm run dev
```

### Vérifier les ports utilisés

```bash
# Voir ce qui utilise le port 3000
lsof -i :3000

# Tuer le processus
lsof -ti:3000 | xargs kill -9

# Utiliser un autre port
npm run dev -- -p 3001
```

### Vérifier la connexion au backend

```bash
# Tester si le backend répond
curl http://localhost:8000/api/v1/games

# Voir les logs du backend
cd ../backend
uv run uvicorn app.main:app --reload --log-level debug
```

## 📊 Analyse du code

### Compter les lignes de code

```bash
# Total des lignes TypeScript
find src -name "*.ts" -o -name "*.tsx" | xargs wc -l

# Par type de fichier
echo "=== Types ===" && wc -l src/types/*.ts
echo "=== API ===" && wc -l src/lib/api/*.ts
echo "=== Composants UI ===" && wc -l src/components/ui/*.tsx
echo "=== Composants Game ===" && wc -l src/components/game/*.tsx
```

### Lister tous les composants

```bash
find src/components -name "*.tsx" -exec basename {} \;
```

### Vérifier les imports

```bash
# Voir tous les imports depuis un fichier
grep "^import" src/components/game/GameBoard.tsx
```

## 🧪 Tests manuels

### Checklist de test complet

1. **Page d'accueil**:
```bash
# Ouvrir
open http://localhost:3000

# Vérifier:
# - Bouton "Démarrer une partie" visible
# - Clic → redirige vers /game/[id]
```

2. **Phase d'enchères**:
```bash
# Vérifier:
# - 5 boutons (Passe, Petite, Garde, Garde Sans, Garde Contre)
# - Historique des enchères visible
# - Boutons désactivés si enchère trop basse
```

3. **Phase du chien** (si preneur):
```bash
# Vérifier:
# - 6 cartes affichées
# - Bouton "Continuer" fonctionne
```

4. **Phase d'écart** (si preneur):
```bash
# Vérifier:
# - Sélection de 6 cartes
# - Compteur "X/6"
# - Validation (pas de Rois/Atouts/Excuse)
# - Message d'erreur si sélection invalide
```

5. **Phase de jeu**:
```bash
# Vérifier:
# - Cartes triées (Excuse → Atouts → Couleurs)
# - Cartes non jouables en gris
# - Clic sur carte jouable → envoi au backend
# - Pli affiché en croix (4 cartes)
# - Pause de 3s après le pli
# - Compteur "Pli dans Xs"
```

6. **Fin de partie**:
```bash
# Vérifier:
# - Résultat du contrat (réussi/échoué)
# - Points preneur vs défense
# - Nombre de plis par joueur
# - Bouton "Nouvelle partie"
```

## 🔍 Debugging

### Voir les logs du polling

```javascript
// Dans la console du navigateur (F12)
// Le polling affiche automatiquement les erreurs dans la console
```

### Inspecter l'état du Context

```javascript
// Ajouter temporairement dans GameBoard.tsx:
console.log('Game State:', gameState);
console.log('Player Hand:', playerHand);
console.log('Legal Moves:', legalMoves);
```

### Voir les requêtes API

```bash
# Dans l'onglet Network du navigateur (F12)
# Filtrer par "api/v1"
# Cliquer sur une requête pour voir:
# - Request (payload envoyé)
# - Response (données reçues)
```

## 📦 Build de production

```bash
# Build
npm run build

# Tester le build en local
npm run start

# Analyser la taille du bundle
npm run build -- --analyze
```

## 🚀 Déploiement

### Vercel (recommandé pour Next.js)

```bash
# Installer Vercel CLI
npm install -g vercel

# Déployer
cd frontend
vercel

# Variables d'environnement sur Vercel:
# NEXT_PUBLIC_API_URL=https://your-backend-url.com/api/v1
```

### Build Docker

```bash
# Créer Dockerfile (à créer)
docker build -t tarot-frontend .
docker run -p 3000:3000 tarot-frontend
```

## 🔄 Git workflow

```bash
# Créer une branche pour vos modifications
git checkout -b feature/my-feature

# Commiter vos changements
git add .
git commit -m "feat: add my feature"

# Pousser
git push origin feature/my-feature

# Créer une PR sur GitHub
```

## 📝 Conventions de code

### Nommage des fichiers
- Composants: `PascalCase.tsx` (ex: `GameBoard.tsx`)
- Utilitaires: `camelCase.ts` (ex: `cardHelpers.ts`)
- Types: `camelCase.ts` (ex: `game.ts`)

### Structure des composants
```typescript
// Imports
import React from 'react';
import type { MyType } from '@/types/...';

// Interface des props
interface MyComponentProps {
  prop1: string;
  prop2?: number;
}

// Composant
export function MyComponent({ prop1, prop2 }: MyComponentProps) {
  // Hooks
  const [state, setState] = useState();

  // Handlers
  const handleClick = () => {};

  // Render
  return <div>...</div>;
}
```

## 🎯 Optimisations (futures)

```bash
# Analyser les performances
npm run build
npm run start
# Ouvrir Chrome DevTools → Lighthouse → Run audit

# Optimiser les images
# - Utiliser next/image au lieu de <img>
# - Compresser les WebP (quality 80-85)
# - Lazy load les images hors écran

# Code splitting
# - Next.js le fait automatiquement
# - Vérifier avec npm run build -- --analyze
```

---

**Tip**: Gardez toujours 2 terminaux ouverts (backend + frontend) pendant le développement !
