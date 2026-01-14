# Corrections appliquées au frontend

## Date: 2026-01-13

### 1. Images de cartes croppées ✅
**Fichier**: `frontend/src/components/ui/Card.tsx`
- Changé `object-cover` → `object-contain`
- Les images ne sont plus coupées

### 2. Cartes moins grisées ✅
**Fichier**: `frontend/src/components/ui/Card.tsx`
- Changé `grayscale opacity-50` → `opacity-90 brightness-90`
- Les cartes non jouables sont juste légèrement assombries

### 3. Affichage sur 2 lignes ✅
**Fichier**: `frontend/src/components/game/PlayerHand.tsx`
- Main divisée en 2 lignes
- Ligne du haut recouvre à 75% la ligne du bas (`mb-[-27px]`)
- Cartes plus grandes: `w-24 h-36`

### 4. Cartes non grisées pendant enchères/chien/écart ✅
**Fichier**: `frontend/src/components/game/PlayerHand.tsx`
- `canPlayCard()` retourne `true` pour phases bidding, dog, discard
- Seule la phase `playing` grise les cartes non jouables

### 5. Fix affichage du chien ✅
**Fichier**: `frontend/src/components/game/GameBoard.tsx`
- Utilise `biddingStatus?.taker_id` en fallback si `contract` n'existe pas encore
- Ajout de logs de debug pour tracer le problème

### 6. Backend: Enchères automatiques des bots ✅
**Fichier**: `backend/app/services/game_service.py`
- Ajout de `_play_ai_bids()` qui utilise `PointBasedBiddingStrategy`
- Appel automatique après chaque enchère humaine
- Les bots ne passent plus systématiquement

## Points restants à vérifier

1. ⏳ Tester le flow complet enchères → chien → écart → jeu
2. ⏳ Vérifier que les 18 plis se jouent correctement
3. ⏳ Vérifier le scoring final
4. ⏳ Vérifier la pause de 3s après chaque pli

## Pour tester

```bash
# Backend
cd backend
uv run uvicorn app.main:app --reload

# Frontend
cd frontend
npm run dev

# Ouvrir http://localhost:3000
# Créer une partie
# Faire une enchère (ex: Garde)
# Vérifier que le chien s'affiche
```

## Commandes utiles

```bash
# Voir les logs du backend
# Les logs afficheront les enchères des bots

# Voir les logs du frontend
# Ouvrir la console du navigateur (F12)
# Chercher les logs commençant par [DOG]
```
