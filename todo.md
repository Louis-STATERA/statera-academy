# Project TODO

- [x] Résoudre les conflits de merge après upgrade full-stack (Home.tsx, package.json)
- [x] Corriger les erreurs TypeScript (lib.esnext.d.ts, etc.)
- [x] Synchroniser le schéma de base de données (pnpm db:push)
- [x] Créer le schéma DB (users, userProgress, diplomas)
- [x] Créer les helpers DB (getProgress, upsertProgress, createDiploma, updateDiplomaUrl)
- [x] Créer les routes tRPC (progress.get/save, diploma.list/create/uploadImage)
- [x] Adapter le ProgressContext pour sync serveur + localStorage fallback
- [x] Ajouter route tRPC pour upload rapport de progression en S3
- [x] Intégrer l'upload du diplôme dans CyberDiploma (appel tRPC après génération)
- [x] Ajouter indicateur de sync dans la NavBar (connecté/non connecté)
- [x] Intégrer useAuth dans ProfilePage pour afficher le nom de l'utilisateur connecté
- [ ] Nettoyer les dépendances inutiles (html2canvas, html-to-image) — reporté
- [x] Écrire les tests Vitest pour les routes tRPC (14 tests passés)
- [x] Tester le flux complet dans le navigateur
