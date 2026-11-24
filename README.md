# QR Empreinte Entreprise

Prototype web interactif pour **QR Empreinte Entreprise**, une solution de collecte de retours clients par lieu et point de contact. Interface de démonstration en français, avec des données synthétiques illustrant un réseau d'agences et de boutiques au Sénégal.

## Lancer la démo

Aucune dépendance ni compilation requise. Ouvrez `index.html` dans un navigateur récent, ou lancez un serveur local :

```bash
python3 -m http.server 8000
```

Puis rendez-vous sur [http://localhost:8000](http://localhost:8000).

## Fonctionnalités interactives

- Tableau de bord multi-sites : scans, retours complétés, taux de complétion et satisfaction.
- Activité hebdomadaire, distribution des notes et retours récents.
- Navigation entre les sections de démonstration et interface adaptative pour mobile.
- Filtre de période et export CSV des performances par établissement.
- Formulaire de création de point d'écoute, identifiant de démonstration et aperçu graphique du QR.

## Limites de cette version

Cette livraison est un **prototype front-end**. Les chiffres et avis sont fictifs ; les changements de période ne modifient que les indicateurs de démonstration. La création de QR affiche un aperçu graphique et un identifiant fictif : elle ne produit pas un QR encodant un lien utilisable. Il n'y a pas encore de serveur, d'authentification, de base de données, de collecte réelle, de signature cryptographique ni de révocation de QR. Le CSS du QR est illustratif et ne doit pas être utilisé comme code scannable.

Pour un déploiement réel, prévoir une API, une base de données, la génération de QR encodant des URL uniques, une signature vérifiable côté serveur, des mécanismes de révocation, des contrôles de confidentialité et des tests.

## Structure

- `index.html` — interface et contenu de démonstration
- `styles.css` — styles responsive
- `app.js` — interactions front-end

Les polices sont chargées via Google Fonts lorsqu'une connexion est disponible ; des polices système assurent le repli.
