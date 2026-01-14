# Quick Start Guide - Frontend Tarot

## 🚀 Démarrage rapide (5 minutes)

### 1. Installer Node.js et npm

Si Node.js n'est pas encore installé:

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Vérification
node --version  # devrait afficher v20.x.x
npm --version   # devrait afficher 10.x.x
```

### 2. Installer les dépendances

```bash
cd frontend
npm install
```

### 3. Configurer l'API

Créez le fichier `.env.local`:

```bash
cp .env.local.example .env.local
```

Vérifiez que le contenu pointe vers votre backend:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 4. Démarrer le backend

Dans un terminal séparé:

```bash
cd ../backend
uv run uvicorn app.main:app --reload
```

Le backend devrait être accessible sur `http://localhost:8000`

### 5. Démarrer le frontend

```bash
cd frontend
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📸 Images de cartes (important !)

Le jeu a besoin de 78 images de cartes. Pour l'instant, créez des placeholders:

```bash
mkdir -p public/cards

# Option 1: Utiliser les vraies images (si vous les avez)
# Copiez vos images WebP dans public/cards/

# Option 2: Le jeu fonctionnera avec des placeholders (images manquantes)
# mais vous verrez des images cassées dans le navigateur
```

### Convention de nommage des cartes

Les fichiers doivent suivre cette convention:

**Couleurs (56 cartes):**
- `clubs_1.webp` à `clubs_14.webp` (Trèfle: As → Roi)
- `diamonds_1.webp` à `diamonds_14.webp` (Carreau: As → Roi)
- `hearts_1.webp` à `hearts_14.webp` (Cœur: As → Roi)
- `spades_1.webp` à `spades_14.webp` (Pique: As → Roi)

**Atouts (21 cartes):**
- `trump_1.webp` à `trump_21.webp` (Petit → Monde)

**Excuse (1 carte):**
- `excuse.webp`

### Créer des images placeholder rapidement

Si vous avez ImageMagick:

```bash
cd public/cards

# Créer des placeholders colorés
for suit in clubs diamonds hearts spades; do
  for rank in {1..14}; do
    convert -size 300x500 xc:lightblue \
      -pointsize 50 -draw "text 100,250 '$suit $rank'" \
      ${suit}_${rank}.webp
  done
done

for trump in {1..21}; do
  convert -size 300x500 xc:gold \
    -pointsize 50 -draw "text 100,250 'Atout $trump'" \
    trump_${trump}.webp
done

convert -size 300x500 xc:purple \
  -pointsize 50 -draw "text 100,250 'Excuse'" \
  excuse.webp
```

## ✅ Vérification

1. Le backend répond: `curl http://localhost:8000/docs` → devrait afficher la doc Swagger
2. Le frontend est accessible: Ouvrez `http://localhost:3000`
3. Créez une partie: Cliquez sur "Démarrer une partie"
4. Si tout fonctionne, vous devriez voir la phase d'enchères

## 🐛 Problèmes courants

### "Cannot find module 'next'"
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Failed to fetch game state"
- Vérifiez que le backend tourne sur le bon port (8000)
- Vérifiez `.env.local` contient la bonne URL
- Regardez les logs du backend pour les erreurs

### Images de cartes cassées
- C'est normal si vous n'avez pas encore créé les 78 images
- Le jeu fonctionnera quand même (vous verrez juste des icônes cassées)
- Suivez la section "Images de cartes" ci-dessus

### "Port 3000 already in use"
```bash
# Tuer le processus utilisant le port 3000
lsof -ti:3000 | xargs kill -9

# Ou utiliser un autre port
npm run dev -- -p 3001
```

## 📝 Étapes suivantes

1. **Testez une partie complète**:
   - Enchères → Chien (si vous êtes preneur) → Écart → 18 plis → Scores

2. **Créez les vraies images de cartes**:
   - Photographiez un jeu de Tarot
   - Convertissez en WebP (300×500px)
   - Nommez selon la convention

3. **Personnalisez l'apparence**:
   - Modifiez les couleurs dans `tailwind.config.ts`
   - Ajustez les styles dans `src/app/globals.css`

4. **Testez avec plusieurs parties**:
   - Vérifiez que les enchères fonctionnent
   - Testez les différents types de contrats
   - Vérifiez les scores en fin de partie

## 🎮 Comment jouer

1. **Phase d'enchères**: Cliquez sur Passe, Petite, Garde, etc.
2. **Si vous êtes preneur**: Vous verrez le chien, puis vous devrez écarter 6 cartes
3. **Phase de jeu**: Cliquez sur une carte pour la jouer
4. **Cartes grisées**: Les cartes que vous ne pouvez pas jouer (règles du Tarot)
5. **Fin du pli**: Pause de 3 secondes pour voir qui a gagné
6. **Fin de partie**: Affichage des scores et du résultat du contrat

Bon jeu ! 🎴
