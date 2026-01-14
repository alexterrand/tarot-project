# Frontend Rebuild - Phase par phase

## Problèmes actuels
1. ❌ Images de cartes croppées (problème CSS)
2. ❌ Chien non affiché après garde
3. ❌ Composants manquants ou incomplets
4. ❌ Flow de jeu incomplet

## Plan de rebuild

### Phase 1: Fix CSS des cartes ✅
- Corriger l'affichage des images (object-fit)
- Affichage sur 2 lignes avec bon recouvrement

### Phase 2: Compléter les composants de jeu
- BiddingPanel (enchères)
- DogDisplay (affichage du chien après garde)
- DiscardPanel (écart de 6 cartes)
- TrickDisplay (pli en cours)
- PlayerHand (main du joueur - 2 lignes)
- GameStatus (phase actuelle + infos)

### Phase 3: Flow complet
1. Création de partie
2. Phase enchères (avec bots qui enchérissent)
3. Phase chien (si preneur)
4. Phase écart (si preneur)
5. Phase jeu (18 plis)
6. Scoring final

### Phase 4: Hooks manquants
- usePolling (mis à jour)
- Gestion des phases
- Auto-play des bots

## Ordre d'implémentation
1. ✅ Fix Card.tsx (images)
2. ✅ Fix PlayerHand.tsx (2 lignes)
3. ⏳ Compléter tous les composants manquants
4. ⏳ Tester le flow complet
