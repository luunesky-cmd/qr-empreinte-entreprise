<!-- README.md -->
# Empreinte — QR de feedback par lieu

Plateforme mobile-first pour écouter la clientèle et comprendre **où**, **quoi** et **quand**. Édition de démonstration sénégalaise incluse, compatible réseau dégradé. Interface React + TypeScript + Vite; backend optionnel Supabase.

## Arborescence

```text
index.html                 Entrée Vite
src/main.tsx               Bootstrap React
src/App.tsx                Dashboard, sites, QR, feedback et vues de démonstration
src/styles.css             Design responsive et règles accessibilité
cibles.json                Segments & cibles conservés du prototype
.env.example               Variables publiques de configuration front
supabase/migrations/       Schéma SQL et RLS
supabase/functions/        Signature, validation de scan et envoi d’avis
.github/workflows/         Publication GitHub Pages optionnelle
```

## Lancer en local

- Node.js 20+ recommandé.
- `npm install`
- `npm run dev` pour le mode développement.
- `npm run typecheck` puis `npm run build` pour valider la production.
- Ouvrir l’URL Vite (ne pas ouvrir `index.html` directement).

Sans variables Supabase, la plateforme démarre intégralement en **mode démo localStorage** : sites exemples (Dakar, Thiès, Saint-Louis), retours, QR, formulaire mobile et export CSV. Le formulaire conserve une copie locale même si le réseau ou l’Edge Function est indisponible. Pour partager un véritable QR signé, configurez le backend; ne confondez pas un QR de démonstration avec un jeton sécurisé.

## Supabase — déploiement

1. Créez un projet Supabase et exécutez `supabase/migrations/20261124000100_initial_schema.sql` via CLI ou SQL editor.
2. Activez l’inscription/authentification et créez l’organisation/membership via un flux d’administration de confiance. Aucune politique client ne permet d’insérer scans/avis.
3. Déployez `supabase/functions/qr-feedback` avec la CLI Supabase. Secrets uniquement dans le coffre Supabase: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (valeur gérée par Supabase), `QR_SIGNING_SECRET` (aléatoire fort, serveur seulement) et `ALLOWED_ORIGIN` (origine réelle, pas `*` en production).
4. Le serveur génère les signatures HMAC; la clé secrète ne doit jamais être envoyée au navigateur. L’Edge Function valide signature/révocation, crée un scan, valide consentement et insère l’avis via la clé service. Les requêtes navigateur utilisent exclusivement la clé anon publique.
5. Ajouter dans l’application un flux d’authentification/CRUD organisation et un endpoint backend d’émission des QR avant mise en production. Les exemples QR du front restent explicitement locaux; ils ne prétendent pas être signés de façon sécurisée.

### Configuration frontend

Copier `.env.example` vers `.env.local`, définir `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`. Seules URL et clé anon publiable sont préfixées `VITE_`. **Ne jamais placer `service_role`, `QR_SIGNING_SECRET` ou clés Wave/Orange Money dans le frontend ou le dépôt.** Les fonctions Supabase doivent limiter CORS à l’origine, appliquer une limitation de débit/WAF, et surveiller les abus avant lancement.

## Vercel

Importer le dépôt dans Vercel (preset Vite, build `npm run build`, output `dist`). Définir uniquement URL et anon key dans les variables d’environnement Vercel; secrets restent dans Supabase. Déployer les fonctions et migrations séparément avec la CLI Supabase. Ajouter les rewrites SPA si des routes client sont ajoutées.

## GitHub Pages (optionnel)

Workflow `Deploy static demo to GitHub Pages` construit et publie la démo autonome sur `main`/déclenchement manuel. Dans GitHub Settings → Pages, sélectionner GitHub Actions. Pages publie une démo statique, sans secrets backend; Supabase ne sera actif qu’avec une configuration sûre, hors secrets GitHub Pages.

## Fonctionnalités et limites actuelles

- Dashboard démo; filtres par lieu, retours, indicateurs, export CSV UTF-8; création locale de site/QR, partage WhatsApp.
- Formulaire client mobile, 1–5 étoiles, catégorie, commentaire facultatif, consentement explicite et sauvegarde locale résiliente.
- Bilingue français/anglais pour les parcours principaux; monnaie d’affichage XOF; page tarifs illustrative avec Wave/Orange Money et WhatsApp Business (aucune transaction réelle).
- Supabase : modèle multi-organisation, RLS activée sur chaque table, accès membre limité à l’organisation, ingestion réservée à la fonction Edge.
- Les indicateurs chiffrés du dashboard sont des données de maquette, non des statistiques d’entreprise. La démo locale ne fournit pas une signature cryptographique de confiance ni un système d’authentification. La synchronisation/résolution de QR réels demande les flux backend à compléter.

## Sécurité, accessibilité et données personnelles

- WCAG 2.2 AA visée : HTML sémantique, labels, focus visible, contrastes, tailles adaptées, commandes clavier natives, respect de `prefers-reduced-motion`. Une recette manuelle lecteurs d’écran/contraste doit précéder certification.
- Avis sans identité par défaut; consentement informé, commentaires facultatifs; l’entreprise définit finalité, durée de conservation, droit de retrait/suppression et notice. Évaluer les obligations CDP (Sénégal) et, selon les personnes/juridictions, RGPD. Ce document n’est pas un avis juridique.
- Exports locaux potentiellement sensibles : protéger l’appareil, limiter l’accès, éviter les commentaires identifiants et configurer les sauvegardes avec une politique de rétention.

## Checklist livraison

- [ ] Variables Vercel et origine CORS de production contrôlées.
- [ ] Migrations appliquées sur projet de test; tests RLS effectués pour membres/non-membres et anon.
- [ ] Secrets uniquement dans Supabase; rotation initiale; limites de débit et journaux configurés.
- [ ] Émission/validation de QR HMAC bout en bout testée; révocation vérifiée.
- [ ] Authentification, onboarding et gestion des organisations ajoutés avant collecte réelle.
- [ ] Consentement, notice CDP, rétention/suppression et export documentés avec le responsable de traitement.
- [ ] Parcours réseau faible, responsive, clavier, contraste et technologies d’assistance testés.
- [ ] Montants, modalités Wave/Orange Money et contact WhatsApp commercial validés.
- [ ] Remplacer les métriques de démo par des agrégations réelles et dater les rapports.

## Évolutions recommandées

1. Auth Supabase, invitation équipe, RBAC et provisionnement d’entreprise/site.
2. Route d’émission de QR, signature HMAC vérifiable, anti-rejeu, expiration et révocation transactionnelle.
3. Outbox IndexedDB/service worker, synchronisation idempotente et indicateurs de statut de remontée.
4. Alertes de sentiment/seuil, tendances temporelles, comparaison par agence, permissions d’export et journal d’audit.
5. Intégration de paiement certifiée et reçus XOF après validation opérateur; modèles de notifications WhatsApp Business approuvés.
6. Tests unitaires/E2E, audit sécurité/RLS, audit accessibilité indépendant et observabilité.
