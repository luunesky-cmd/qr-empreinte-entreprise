# QR Empreinte Entreprise — Prototype

Prototype web autonome (aucun serveur requis) pour collecter des retours clients par point de contact physique, via des **QR signés, attribuables à un lieu et révocables**.

Conçu pour le marché sénégalais : banques, télécoms, distribution, services publics, hôtellerie/restauration et PME.

## Lancer

Ouvrir `index.html` dans un navigateur (ou `npx serve .`). Les données sont stockées dans `localStorage`.

## Fonctionnalités

- **Entreprises & sites** : créer une entreprise, ses sites (agence, boutique, restaurant…) et ses emplacements (accueil, caisse, table, chambre…).
- **QR signés** : chaque QR embarque `entreprise / site / emplacement / horodatage` + une signature HMAC-SHA256 (Web Crypto). Un QR copié ou altéré est détecté.
- **Révocation** : un QR peut être révoqué ; le formulaire refuse alors la saisie.
- **Formulaire mobile** : note 1–5, catégorie (accueil, attente, propreté, service, autre), commentaire.
- **Tableau de bord** : taux de scans, complétion, note moyenne, signalements négatifs, comparaison par site / emplacement / créneau horaire.
- **Export CSV** des retours.
- **Jeu de données de démo** : cibles sénégalaises (`data/cibles.json`) et génération de retours fictifs pour présenter un pilote.

## Structure

```
index.html        application (dashboard + admin + formulaire)
app.js            logique : signature, stockage, stats
styles.css        styles mobile-first
data/cibles.json  segmentation commerciale Sénégal
```

## Pilote recommandé (30 jours)

1. 2–3 sites pilotes, 10–30 QR.
2. QR sur accueil, caisses, zones d'attente.
3. Mesurer scans, complétion, note moyenne, signalements.
4. Rapport « où / quand / quel type de problème ».
5. Proposer abonnement, export automatique, révocation, extension.

## Prochaines étapes (hors prototype)

- Backend (Node/Supabase) pour signature côté serveur et stockage central.
- Authentification multi-entreprises, rôles agence / siège.
- Notifications WhatsApp/SMS sur signalement négatif.
