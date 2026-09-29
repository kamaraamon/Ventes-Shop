# Ventes-Shop

VendeurPro : commandes et acomptes d’un vendeur, en français, pour la Côte d’Ivoire. PWA Next.js dans un workspace pnpm.

Cette version livre le socle et les écrans branchés sur un jeu fictif. Aucune donnée personnelle réelle.

## Lancer en local

Prérequis : Node.js 22 et pnpm 10.

```bash
pnpm install
pnpm dev
```

L’application écoute sur http://127.0.0.1:43123.

Sans `DATABASE_URL`, les écrans affichent le jeu fictif. Sans `BETTER_AUTH_SECRET`, `/api/auth` répond 503. Sans clé CinetPay, le paiement reste simulé.

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Le build de production est `next build --webpack`, puis `serwist build`.

## Écrans

| Écran | URL |
| --- | --- |
| Tableau de bord | `/` |
| Nouvelle commande | `/commandes/nouvelle` |
| Commandes | `/commandes` |
| Clients | `/clients` |
| Catalogue | `/catalogue` |

## Variables

Les noms sont dans `.env.example`, valeurs vides. Aucun secret n’est versionné.

`DATABASE_URL`, `DATABASE_REGION`, `VERCEL_FUNCTION_REGION`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `OTP_CHANNEL`, `CINETPAY_API_KEY`, `CINETPAY_SITE_ID`, `CINETPAY_NOTIFY_URL`, `CINETPAY_RETURN_URL`.
