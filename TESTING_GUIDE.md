# Guide de Test - Tarot Game Frontend

## Démarrage

### Terminal 1: Backend
```bash
cd backend
uv run uvicorn app.main:app --reload
```
Le backend démarre sur http://localhost:8000

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```
Le frontend démarre sur http://localhost:3000

---

## Test 1: Joueur Humain Prend (Flow Complet)

### Étapes
1. Ouvrir http://localhost:3000
2. Cliquer sur "Démarrer une partie"
3. **Phase Bidding**:
   - Attendre votre tour
   - Cliquer sur "PETITE" ou "GARDE"
   - Les bots vont automatiquement passer
4. **Phase Dog**:
   - Vous verrez les 6 cartes du chien s'afficher
   - Vérifier que les 6 cartes sont visibles
   - Cliquer "Continuer vers l'écart"
5. **Phase Discard**:
   - Votre main contient maintenant 24 cartes (18 + 6 du chien)
   - Sélectionner 6 cartes à écarter (clic pour sélectionner/désélectionner)
   - Les cartes sélectionnées ont un ring bleu
   - Le bouton "Confirmer l'écart" s'active quand 6 cartes sont sélectionnées
   - Cliquer "Confirmer l'écart"
6. **Phase Playing**:
   - Votre main revient à 18 cartes
   - Affichage sur 2 lignes avec recouvrement
   - C'est le tour du joueur après le donneur
   - Quand c'est votre tour, les cartes jouables sont claires, les non-jouables sont légèrement assombries
   - Cliquer sur une carte pour la jouer
   - Après chaque pli complet:
     - Un overlay s'affiche pendant 3 secondes
     - Affiche qui a remporté le pli
     - Compte à rebours: "Prochain pli dans 3s", "2s", "1s"
   - Répéter pour les 18 plis
7. **Phase Finished**:
   - Affiche "Contrat réussi !" ou "Contrat échoué"
   - Détails du contrat (type, bouts, points requis)
   - Scores finaux (preneur vs défense)
   - Plis remportés par chaque joueur
   - Cliquer "Nouvelle partie" pour recommencer

### ✅ Points à Vérifier
- [ ] Enchères des bots se font automatiquement
- [ ] Chien s'affiche avec 6 cartes
- [ ] Main passe de 18 à 24 cartes après le chien
- [ ] Sélection des 6 cartes d'écart fonctionne
- [ ] Main revient à 18 cartes après l'écart
- [ ] Cartes affichées sur 2 lignes avec recouvrement
- [ ] Cartes non jouables sont légèrement assombries
- [ ] Pause de 3 secondes après chaque pli avec overlay
- [ ] 18 plis se jouent jusqu'au bout
- [ ] Scores finaux corrects

---

## Test 2: Bot Prend (Flow Simplifié)

### Étapes
1. Ouvrir http://localhost:3000
2. Cliquer sur "Démarrer une partie"
3. **Phase Bidding**:
   - Attendre votre tour
   - Cliquer sur "PASS"
   - Les bots vont enchérir automatiquement
   - Un bot devrait gagner l'enchère
4. **Phase Dog**:
   - Message: "Le bot player_X regarde le chien..."
   - "Le jeu va démarrer dans quelques instants"
   - Attendre que le backend traite automatiquement le chien et l'écart
5. **Phase Playing**:
   - Passe directement au jeu (pas de phase discard visible)
   - Jouer vos 18 plis normalement
6. **Phase Finished**:
   - Voir les scores

### ✅ Points à Vérifier
- [ ] Les bots enchérissent automatiquement après votre PASS
- [ ] Message d'attente s'affiche quand bot regarde le chien
- [ ] Backend gère automatiquement dog + discard du bot
- [ ] Jeu démarre directement après (pas de blocage)
- [ ] 18 plis se jouent normalement

---

## Test 3: Tous Passent (Partie Annulée)

### Étapes
1. Modifier temporairement le backend pour forcer tous les bots à passer
   - OU avoir de la chance et tomber sur une main où tous passent
2. Créer partie
3. Cliquer "PASS"
4. Vérifier que tous les bots passent aussi
5. Vérifier que la partie se termine

### ✅ Points à Vérifier
- [ ] Si tous passent, partie passe à phase "finished"
- [ ] Message approprié s'affiche

---

## Test 4: Vérification Détaillée des Cartes

### Pendant Phase Playing

#### Affichage
- [ ] Cartes affichées sur 2 lignes
- [ ] Ligne du haut recouvre ligne du bas à 75% (overlap visible)
- [ ] Images de cartes complètes (non croppées)
- [ ] Taille des cartes appropriée (w-24 h-36)

#### Jouabilité
- [ ] Quand c'est votre tour:
  - Cartes jouables: claires et cliquables (cursor pointer)
  - Cartes non jouables: légèrement assombries (opacity-90 brightness-90)
- [ ] Quand ce n'est pas votre tour:
  - Toutes les cartes visibles normalement
  - Aucune carte cliquable

#### Phases Précédentes
- [ ] **Phase Bidding**: Toutes les cartes visibles normalement (pas grisées)
- [ ] **Phase Dog**: Cartes du chien visibles normalement
- [ ] **Phase Discard**: Toutes les cartes visibles et cliquables pour sélection

---

## Test 5: Vérification du Polling

### Utiliser les DevTools du Navigateur
1. Ouvrir F12
2. Aller dans l'onglet "Network"
3. Filtrer par "Fetch/XHR"

### Pendant le Jeu
Vérifier que toutes les 500ms, des requêtes sont faites:
- [ ] GET `/api/v1/games/{game_id}` (game state)
- [ ] GET `/api/v1/games/{game_id}/players/player_1/hand` (main)
- [ ] GET `/api/v1/games/{game_id}/bidding/status` (si phase bidding)
- [ ] GET `/api/v1/games/{game_id}/legal-moves/player_1` (si phase playing + mon tour)
- [ ] GET `/api/v1/games/{game_id}/contract` (si phase playing/finished)

### Vérifier les Réponses
- [ ] Statut 200 pour toutes les requêtes
- [ ] Pas de 404 ou 500
- [ ] Réponses JSON correctement formées

---

## Test 6: Gestion d'Erreurs

### Test Erreur Backend
1. Stopper le backend (Ctrl+C)
2. Essayer de créer une partie
3. Vérifier:
   - [ ] Message d'erreur s'affiche
   - [ ] L'application ne crash pas
   - [ ] Redémarrer backend et retry fonctionne

### Test Erreur Réseau
1. Pendant une partie, couper la connexion réseau
2. Vérifier:
   - [ ] Erreurs dans console (normales)
   - [ ] L'application ne crash pas
   - [ ] Rétablir connexion → polling reprend

---

## Logs de Debug

### Backend
Le backend affiche des logs utiles:
```
Bot player_2 enchérit: PETITE
Chien ajouté à la main de player_2: 24 cartes
Bot player_2 écarte: [carte1, carte2, ...]
Phase de jeu démarrée - Preneur: player_2
```

### Frontend (Console Navigateur)
Le frontend affiche des logs avec préfixe `[DOG]`:
```
[DOG] Fetching dog for human player: player_1
[DOG] Dog response: {cards: [...], can_view: true}
```

---

## Problèmes Connus et Solutions

### Problème: Bouton "Démarrer une partie" ne fait rien
**Solution**: Vérifier que le backend est démarré et accessible sur http://localhost:8000

### Problème: Enchères bloquées après avoir passé
**Solution**: Devrait être corrigé - les bots enchérissent automatiquement maintenant

### Problème: Chien ne s'affiche pas
**Solution**:
- Vérifier que vous êtes bien le preneur
- Vérifier les logs `[DOG]` dans la console
- Vérifier que la requête `/api/v1/games/{id}/dog` retourne `can_view: true`

### Problème: Images de cartes croppées
**Solution**: Devrait être corrigé - `object-contain` au lieu de `object-cover`

### Problème: Cartes trop grisées
**Solution**: Devrait être corrigé - `opacity-90 brightness-90` au lieu de `grayscale opacity-50`

### Problème: Impossible de sélectionner 6 cartes pour l'écart
**Solution**: Cliquer sur les cartes pour les sélectionner (ring bleu apparaît)

---

## Checklist Complète

### Phase Bidding ✓
- [ ] Affiche historique des enchères
- [ ] Affiche enchère la plus haute
- [ ] Affiche tour actuel
- [ ] Boutons d'enchères fonctionnent
- [ ] Bots enchérissent automatiquement

### Phase Dog ✓
- [ ] Si humain prend: affiche 6 cartes
- [ ] Si bot prend: affiche message d'attente
- [ ] Bouton "Continuer" fonctionne

### Phase Discard ✓
- [ ] Main contient 24 cartes
- [ ] Sélection de 6 cartes fonctionne
- [ ] Cartes sélectionnées ont ring bleu
- [ ] Bouton activé uniquement si 6 cartes
- [ ] Après confirmation, main revient à 18

### Phase Playing ✓
- [ ] Pli actuel s'affiche au centre
- [ ] Main affichée sur 2 lignes
- [ ] Recouvrement 75% entre lignes
- [ ] Cartes non jouables grisées
- [ ] Clic sur carte jouable fonctionne
- [ ] Pause 3s après chaque pli
- [ ] Overlay affiche vainqueur du pli
- [ ] 18 plis se jouent complètement

### Phase Finished ✓
- [ ] Affiche résultat (réussi/échoué)
- [ ] Affiche détails contrat
- [ ] Affiche scores finaux
- [ ] Affiche plis remportés
- [ ] Bouton "Nouvelle partie" fonctionne

---

## Critères de Succès

Le test est considéré réussi si:
1. ✅ Scénario "Humain prend" se joue du début à la fin sans erreur
2. ✅ Scénario "Bot prend" se joue du début à la fin sans erreur
3. ✅ Affichage des cartes correct (2 lignes, overlap, images complètes)
4. ✅ Pause de 3 secondes fonctionne après chaque pli
5. ✅ Scores finaux affichés correctement
6. ✅ Aucune erreur dans la console (hors erreurs normales de polling)
7. ✅ Backend logs montrent le bon comportement des bots

Si tous ces critères sont remplis, le frontend V3 est fonctionnel ! 🎉
