// ============================================================
// Design: Neon Terminal / Cyberpunk
// Data store for all micro-learning modules, questions, and progression
// ============================================================

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'scenario';
  question: string;
  context?: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface LearningPoint {
  icon: string;
  title: string;
  description: string;
}

export interface Module {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  color: string;
  glowClass: string;
  duration: string;
  difficulty: string;
  xpReward: number;
  learningPoints: LearningPoint[];
  questions: QuizQuestion[];
  keyFact: { stat: string; description: string };
}

export const MODULES: Module[] = [
  {
    id: 'phishing',
    title: 'L\'Email Piégé',
    subtitle: 'Mission 1 — Phishing & Ingénierie Sociale',
    description: 'Apprenez à détecter les emails frauduleux, les tentatives de spear phishing et les arnaques au président dopées à l\'IA.',
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663343017296/FPbfJCyecKtnym4RKQrEZz/flat-phishing-NQZrLvmTSsHfS8L6rCrVUy.webp',
    color: '#ff0066',
    glowClass: 'glow-magenta',
    duration: '5 min',
    difficulty: 'Débutant',
    xpReward: 150,
    keyFact: { stat: '55%', description: 'des cyberattaques commencent par un email de phishing' },
    learningPoints: [
      { icon: '📧', title: 'Phishing classique', description: 'Les emails de masse imitent des marques connues (banques, Microsoft, livraison) pour voler vos identifiants. Vérifiez toujours l\'adresse réelle de l\'expéditeur.' },
      { icon: '🎯', title: 'Spear Phishing', description: 'Attaque ciblée et personnalisée utilisant des informations sur vous (nom, poste, projets). Plus difficile à détecter car le message semble légitime.' },
      { icon: '📱', title: 'Smishing & Vishing', description: 'Le phishing par SMS (smishing) et par téléphone (vishing) explose. "Votre colis est en attente" ou un faux appel de votre banque sont des pièges courants.' },
      { icon: '🤖', title: 'Deepfakes & IA', description: 'En 2026, les deepfakes vocaux et vidéo générés par IA rendent l\'arnaque au président quasi indétectable. Vérifiez toujours par un autre canal.' },
    ],
    questions: [
      {
        id: 'ph1', type: 'scenario', difficulty: 'easy',
        question: 'Vous recevez un email de "Microsoft" vous demandant de réinitialiser votre mot de passe immédiatement car votre compte a été compromis. L\'adresse de l\'expéditeur est security@micros0ft-alert.com. Que faites-vous ?',
        context: 'Vous êtes à votre bureau un lundi matin.',
        options: [
          { id: 'a', text: 'Je clique sur le lien pour sécuriser mon compte rapidement', isCorrect: false },
          { id: 'b', text: 'Je vérifie l\'adresse de l\'expéditeur, je repère le "0" dans micros0ft et je signale l\'email', isCorrect: true },
          { id: 'c', text: 'Je transfère l\'email à mes collègues pour les prévenir', isCorrect: false },
          { id: 'd', text: 'Je supprime l\'email sans rien faire d\'autre', isCorrect: false },
        ],
        explanation: 'L\'adresse "micros0ft-alert.com" contient un zéro à la place du "o" — c\'est un domaine frauduleux. Il faut signaler l\'email au support IT, pas le transférer (cela propagerait le lien malveillant).',
      },
      {
        id: 'ph2', type: 'true-false', difficulty: 'easy',
        question: 'Un email de phishing contient toujours des fautes d\'orthographe.',
        options: [
          { id: 'a', text: 'Vrai', isCorrect: false },
          { id: 'b', text: 'Faux', isCorrect: true },
        ],
        explanation: 'Faux ! Avec l\'IA générative, les emails de phishing sont désormais rédigés dans un français parfait. Les fautes d\'orthographe ne sont plus un indicateur fiable.',
      },
      {
        id: 'ph3', type: 'scenario', difficulty: 'medium',
        question: 'Votre PDG vous appelle en visioconférence et vous demande un virement urgent de 50 000€ pour une acquisition confidentielle. La vidéo et la voix semblent authentiques. Que faites-vous ?',
        options: [
          { id: 'a', text: 'J\'exécute le virement car c\'est bien le PDG en vidéo', isCorrect: false },
          { id: 'b', text: 'Je raccroche et rappelle le PDG sur son numéro habituel pour vérifier', isCorrect: true },
          { id: 'c', text: 'Je demande un email de confirmation', isCorrect: false },
          { id: 'd', text: 'Je consulte un collègue avant de décider', isCorrect: false },
        ],
        explanation: 'Les deepfakes vidéo sont désormais très convaincants. La seule parade est de vérifier par un canal différent (rappeler sur le numéro connu). Un email de confirmation pourrait aussi être falsifié.',
      },
      {
        id: 'ph4', type: 'multiple-choice', difficulty: 'medium',
        question: 'Quel est le premier réflexe à avoir face à un email suspect ?',
        options: [
          { id: 'a', text: 'Ouvrir la pièce jointe pour vérifier son contenu', isCorrect: false },
          { id: 'b', text: 'Survoler les liens sans cliquer pour voir l\'URL réelle', isCorrect: true },
          { id: 'c', text: 'Répondre à l\'expéditeur pour demander des précisions', isCorrect: false },
          { id: 'd', text: 'Transférer l\'email à un collègue pour avoir son avis', isCorrect: false },
        ],
        explanation: 'Survoler un lien (sans cliquer) permet de voir l\'URL de destination réelle en bas de l\'écran. C\'est le geste le plus sûr pour détecter un lien frauduleux sans risque.',
      },
      {
        id: 'ph5', type: 'true-false', difficulty: 'hard',
        question: 'Le spear phishing ne cible que les dirigeants d\'entreprise.',
        options: [
          { id: 'a', text: 'Vrai', isCorrect: false },
          { id: 'b', text: 'Faux', isCorrect: true },
        ],
        explanation: 'Faux ! Le spear phishing cible tout le monde : assistants, comptables, développeurs, RH... Toute personne ayant accès à des données ou des systèmes sensibles est une cible potentielle.',
      },
    ],
  },
  {
    id: 'passwords',
    title: 'Le Mot de Passe Incassable',
    subtitle: 'Mission 2 — Authentification & MFA',
    description: 'Maîtrisez l\'art de créer des mots de passe robustes et découvrez pourquoi l\'authentification multifacteur est votre meilleur allié.',
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663343017296/FPbfJCyecKtnym4RKQrEZz/flat-password-ktYfcaM6uVPnYkTdgrTtxK.webp',
    color: '#00f0ff',
    glowClass: 'glow-cyan',
    duration: '4 min',
    difficulty: 'Débutant',
    xpReward: 120,
    keyFact: { stat: '81%', description: 'des violations de données sont liées à des mots de passe faibles ou volés' },
    learningPoints: [
      { icon: '🔑', title: '12 caractères minimum', description: 'Un mot de passe de 8 caractères se craque en quelques heures. À 12 caractères avec majuscules, minuscules, chiffres et symboles, il faut des milliers d\'années.' },
      { icon: '🎲', title: 'Unicité absolue', description: 'Un mot de passe différent pour chaque service. Si un site est piraté, les autres restent protégés. Utilisez un gestionnaire de mots de passe.' },
      { icon: '🛡️', title: 'MFA : la double barrière', description: 'L\'authentification multifacteur (MFA) bloque 99% des attaques par force brute. Même si votre mot de passe fuite, le second facteur protège votre compte.' },
      { icon: '🚫', title: 'Ne jamais partager', description: 'Aucun collègue, aucun supérieur, aucun service IT ne doit connaître votre mot de passe. Les demandes de mot de passe sont toujours suspectes.' },
    ],
    questions: [
      {
        id: 'pw1', type: 'multiple-choice', difficulty: 'easy',
        question: 'Quel mot de passe est le plus sécurisé ?',
        options: [
          { id: 'a', text: 'Entreprise2026!', isCorrect: false },
          { id: 'b', text: 'M0nCh1enS@ppelleM3dor!', isCorrect: true },
          { id: 'c', text: '123456789Abc!', isCorrect: false },
          { id: 'd', text: 'P@ssw0rd!2026', isCorrect: false },
        ],
        explanation: '"M0nCh1enS@ppelleM3dor!" est une phrase de passe longue (22 caractères) avec des substitutions. Les autres sont trop prévisibles ou basés sur des patterns connus des attaquants.',
      },
      {
        id: 'pw2', type: 'true-false', difficulty: 'easy',
        question: 'Changer son mot de passe tous les 30 jours est une bonne pratique de sécurité.',
        options: [
          { id: 'a', text: 'Vrai', isCorrect: false },
          { id: 'b', text: 'Faux', isCorrect: true },
        ],
        explanation: 'Faux ! Les recommandations actuelles (ANSSI, NIST) déconseillent le changement forcé régulier. Cela pousse les utilisateurs à choisir des mots de passe faibles et prévisibles. Mieux vaut un mot de passe fort changé uniquement en cas de compromission.',
      },
      {
        id: 'pw3', type: 'scenario', difficulty: 'medium',
        question: 'Un collègue vous demande votre mot de passe pour accéder à un fichier urgent pendant votre absence. Que faites-vous ?',
        options: [
          { id: 'a', text: 'Je lui donne mon mot de passe car c\'est urgent', isCorrect: false },
          { id: 'b', text: 'Je refuse et lui propose de contacter le support IT pour un accès temporaire', isCorrect: true },
          { id: 'c', text: 'Je lui envoie le fichier par email', isCorrect: false },
          { id: 'd', text: 'Je change mon mot de passe après lui avoir donné', isCorrect: false },
        ],
        explanation: 'Ne partagez JAMAIS votre mot de passe. Le support IT peut configurer un accès temporaire ou un partage de fichier sécurisé. Même avec de bonnes intentions, partager un mot de passe est une faille de sécurité.',
      },
      {
        id: 'pw4', type: 'multiple-choice', difficulty: 'medium',
        question: 'Quelle méthode de MFA est la plus sécurisée ?',
        options: [
          { id: 'a', text: 'Code par SMS', isCorrect: false },
          { id: 'b', text: 'Application d\'authentification (ex: Microsoft Authenticator)', isCorrect: true },
          { id: 'c', text: 'Question secrète (nom de votre animal)', isCorrect: false },
          { id: 'd', text: 'Email de confirmation', isCorrect: false },
        ],
        explanation: 'Les applications d\'authentification génèrent des codes temporaires localement, sans transit réseau. Les SMS peuvent être interceptés (SIM swapping) et les questions secrètes sont souvent devinables via les réseaux sociaux.',
      },
      {
        id: 'pw5', type: 'true-false', difficulty: 'hard',
        question: 'Un gestionnaire de mots de passe est dangereux car il stocke tous vos mots de passe au même endroit.',
        options: [
          { id: 'a', text: 'Vrai', isCorrect: false },
          { id: 'b', text: 'Faux', isCorrect: true },
        ],
        explanation: 'Faux ! Les gestionnaires de mots de passe chiffrent vos données avec un algorithme puissant (AES-256). C\'est infiniment plus sûr que de réutiliser le même mot de passe partout ou de les noter sur un post-it.',
      },
    ],
  },
  {
    id: 'ransomware',
    title: 'Alerte Ransomware',
    subtitle: 'Mission 3 — Ransomware & Réaction d\'Urgence',
    description: 'Comprenez le fonctionnement des ransomwares et apprenez les réflexes vitaux pour limiter les dégâts en cas d\'attaque.',
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663343017296/FPbfJCyecKtnym4RKQrEZz/flat-ransomware-a4oTEqk5DeKXrEkBex9brR.webp',
    color: '#ff0066',
    glowClass: 'glow-magenta',
    duration: '5 min',
    difficulty: 'Intermédiaire',
    xpReward: 180,
    keyFact: { stat: '466K€', description: 'coût moyen d\'une attaque ransomware pour une PME en France' },
    learningPoints: [
      { icon: '🔒', title: 'Chiffrement total', description: 'Un ransomware chiffre tous vos fichiers et ceux du réseau. Sans clé de déchiffrement, les données sont irrécupérables. Les sauvegardes sont votre seule assurance.' },
      { icon: '💰', title: 'Double extorsion', description: 'Les attaquants ne se contentent plus de chiffrer : ils volent aussi les données et menacent de les publier. Certains contactent même vos clients directement.' },
      { icon: '⚡', title: 'Réflexe n°1 : Isoler', description: 'Déconnectez immédiatement l\'ordinateur du réseau (câble ET Wi-Fi). Ne l\'éteignez PAS pour préserver les traces forensiques.' },
      { icon: '🚨', title: 'Réflexe n°2 : Alerter', description: 'Contactez le support IT / RSSI immédiatement. Notez l\'heure exacte. Ne tentez RIEN seul et ne payez jamais la rançon.' },
    ],
    questions: [
      {
        id: 'rw1', type: 'scenario', difficulty: 'medium',
        question: 'Votre écran affiche soudainement un message en rouge : "Vos fichiers ont été chiffrés. Payez 2 BTC dans les 48h ou vos données seront publiées." Quel est votre PREMIER réflexe ?',
        options: [
          { id: 'a', text: 'J\'éteins immédiatement l\'ordinateur', isCorrect: false },
          { id: 'b', text: 'Je débranche le câble réseau et désactive le Wi-Fi', isCorrect: true },
          { id: 'c', text: 'Je prends une photo et j\'appelle la police', isCorrect: false },
          { id: 'd', text: 'J\'essaie de fermer le message et de sauvegarder mes fichiers', isCorrect: false },
        ],
        explanation: 'Le PREMIER réflexe est d\'isoler la machine du réseau pour empêcher la propagation. Ne l\'éteignez pas (les traces en mémoire sont précieuses pour l\'investigation). L\'alerte au support IT vient juste après.',
      },
      {
        id: 'rw2', type: 'true-false', difficulty: 'easy',
        question: 'Payer la rançon garantit la récupération de vos données.',
        options: [
          { id: 'a', text: 'Vrai', isCorrect: false },
          { id: 'b', text: 'Faux', isCorrect: true },
        ],
        explanation: 'Faux ! Seulement 8% des entreprises qui paient récupèrent l\'intégralité de leurs données. Payer finance le crime organisé et vous marque comme cible facile pour de futures attaques.',
      },
      {
        id: 'rw3', type: 'multiple-choice', difficulty: 'medium',
        question: 'Quel est le vecteur d\'infection le plus courant pour un ransomware ?',
        options: [
          { id: 'a', text: 'Une clé USB trouvée dans le parking', isCorrect: false },
          { id: 'b', text: 'Un email de phishing avec pièce jointe malveillante', isCorrect: true },
          { id: 'c', text: 'Un site web légitime piraté', isCorrect: false },
          { id: 'd', text: 'Une connexion Wi-Fi publique', isCorrect: false },
        ],
        explanation: 'Le phishing reste le vecteur n°1 d\'infection par ransomware. Un simple clic sur une pièce jointe malveillante (souvent un fichier Office avec macros ou un .zip) suffit à déclencher l\'attaque.',
      },
      {
        id: 'rw4', type: 'scenario', difficulty: 'hard',
        question: 'Après une attaque ransomware, le support IT vous demande de ne pas toucher à votre ordinateur. Un collègue paniqué veut éteindre tous les postes de l\'open space "par précaution". Que lui dites-vous ?',
        options: [
          { id: 'a', text: 'Bonne idée, éteignons tout pour stopper la propagation', isCorrect: false },
          { id: 'b', text: 'Non, il faut seulement déconnecter les câbles réseau et le Wi-Fi sans éteindre', isCorrect: true },
          { id: 'c', text: 'Chacun doit sauvegarder ses fichiers sur une clé USB d\'abord', isCorrect: false },
          { id: 'd', text: 'Il faut attendre les instructions du support IT sans rien toucher', isCorrect: false },
        ],
        explanation: 'Déconnecter du réseau OUI, éteindre NON. Les données en mémoire vive sont essentielles pour l\'investigation forensique. Sauvegarder sur clé USB risque de propager le malware. L\'idéal est de déconnecter et attendre le support IT.',
      },
    ],
  },
  {
    id: 'shadow-ai',
    title: 'L\'IA : Ami ou Espion ?',
    subtitle: 'Mission 4 — Shadow IA & Deepfakes',
    description: 'Découvrez les risques cachés de l\'utilisation non encadrée de l\'IA générative et apprenez à vous protéger des deepfakes.',
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663343017296/FPbfJCyecKtnym4RKQrEZz/flat-ai-AAu4vahcsCJrfycFGo3QwS.webp',
    color: '#00f0ff',
    glowClass: 'glow-cyan',
    duration: '4 min',
    difficulty: 'Intermédiaire',
    xpReward: 160,
    keyFact: { stat: '75%', description: 'des experts considèrent la Shadow IA comme le risque comportemental n°1 en 2026' },
    learningPoints: [
      { icon: '👻', title: 'Shadow IA', description: 'Utiliser un outil d\'IA non approuvé (ChatGPT gratuit, Copilot personnel...) avec des données de l\'entreprise est une fuite de données. Tout ce que vous saisissez peut être utilisé pour entraîner le modèle.' },
      { icon: '🎭', title: 'Deepfakes', description: 'Les deepfakes audio et vidéo sont désormais quasi indétectables. Un appel vidéo de votre manager peut être entièrement généré par IA. Vérifiez toujours par un autre canal.' },
      { icon: '⚠️', title: 'Hallucinations', description: 'L\'IA peut générer des informations fausses mais convaincantes (hallucinations). Ne faites jamais confiance aveuglément à un résultat d\'IA sans vérification humaine.' },
      { icon: '✅', title: 'Bonnes pratiques', description: 'Utilisez uniquement les outils d\'IA validés par votre entreprise. Ne soumettez jamais de données clients, financières ou de code source propriétaire à une IA publique.' },
    ],
    questions: [
      {
        id: 'ai1', type: 'scenario', difficulty: 'easy',
        question: 'Vous devez résumer un rapport financier confidentiel de 50 pages. Un collègue vous suggère d\'utiliser ChatGPT (version gratuite personnelle) pour gagner du temps. Que faites-vous ?',
        options: [
          { id: 'a', text: 'J\'utilise ChatGPT, c\'est juste un résumé', isCorrect: false },
          { id: 'b', text: 'Je refuse et j\'utilise uniquement l\'outil d\'IA approuvé par l\'entreprise', isCorrect: true },
          { id: 'c', text: 'J\'anonymise les données avant de les soumettre à ChatGPT', isCorrect: false },
          { id: 'd', text: 'J\'utilise ChatGPT mais je supprime la conversation après', isCorrect: false },
        ],
        explanation: 'Les données soumises à une IA publique gratuite peuvent être utilisées pour l\'entraînement du modèle. Même anonymisées, des informations financières restent sensibles. Seuls les outils approuvés par l\'entreprise offrent les garanties de confidentialité nécessaires.',
      },
      {
        id: 'ai2', type: 'true-false', difficulty: 'medium',
        question: 'Supprimer une conversation dans ChatGPT efface définitivement les données de leurs serveurs.',
        options: [
          { id: 'a', text: 'Vrai', isCorrect: false },
          { id: 'b', text: 'Faux', isCorrect: true },
        ],
        explanation: 'Faux ! Supprimer une conversation de votre interface ne garantit pas la suppression des données côté serveur. Les données peuvent avoir été utilisées pour l\'entraînement ou stockées dans des sauvegardes.',
      },
      {
        id: 'ai3', type: 'multiple-choice', difficulty: 'medium',
        question: 'Qu\'est-ce que la "Shadow IA" ?',
        options: [
          { id: 'a', text: 'Une IA malveillante utilisée par les hackers', isCorrect: false },
          { id: 'b', text: 'L\'utilisation d\'outils d\'IA non approuvés par l\'entreprise', isCorrect: true },
          { id: 'c', text: 'Un type de deepfake particulièrement dangereux', isCorrect: false },
          { id: 'd', text: 'Un logiciel espion basé sur l\'IA', isCorrect: false },
        ],
        explanation: 'La Shadow IA désigne l\'utilisation par les employés d\'outils d\'IA non validés par l\'entreprise, souvent à des fins de productivité. C\'est un risque majeur car les données confidentielles peuvent fuiter sans contrôle.',
      },
      {
        id: 'ai4', type: 'scenario', difficulty: 'hard',
        question: 'Vous recevez un message vocal de votre directeur financier vous demandant de modifier les coordonnées bancaires d\'un fournisseur. La voix est parfaitement reconnaissable. Que faites-vous ?',
        options: [
          { id: 'a', text: 'Je modifie les coordonnées car je reconnais bien sa voix', isCorrect: false },
          { id: 'b', text: 'Je rappelle le directeur financier sur son numéro habituel pour confirmer', isCorrect: true },
          { id: 'c', text: 'Je lui réponds par email pour avoir une trace écrite', isCorrect: false },
          { id: 'd', text: 'Je demande à un collègue d\'écouter le message pour confirmer', isCorrect: false },
        ],
        explanation: 'Les deepfakes vocaux sont désormais capables de cloner une voix à partir de quelques secondes d\'enregistrement. La seule parade fiable est de vérifier par un canal différent (appel direct sur un numéro connu).',
      },
    ],
  },
  {
    id: 'remote-work',
    title: 'Connexion Risquée',
    subtitle: 'Mission 5 — Télétravail, Wi-Fi & Mobilité',
    description: 'Sécurisez votre environnement de travail à distance et apprenez à vous protéger sur les réseaux publics.',
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663343017296/FPbfJCyecKtnym4RKQrEZz/flat-wifi-mGZ6ac4xMN35P6uMCvg9Dx.webp',
    color: '#00ff88',
    glowClass: 'glow-green',
    duration: '4 min',
    difficulty: 'Débutant',
    xpReward: 130,
    keyFact: { stat: '67%', description: 'des incidents de sécurité en télétravail sont liés à des réseaux Wi-Fi non sécurisés' },
    learningPoints: [
      { icon: '🔐', title: 'VPN obligatoire', description: 'Activez toujours le VPN de l\'entreprise avant de vous connecter à un réseau externe. Le VPN chiffre tout votre trafic et empêche l\'interception de vos données.' },
      { icon: '🖥️', title: 'Verrouillage automatique', description: 'Windows + L (ou Ctrl + Cmd + Q sur Mac) dès que vous quittez votre poste, même pour 30 secondes. Configurez le verrouillage automatique après 2 minutes d\'inactivité.' },
      { icon: '👀', title: 'Filtre de confidentialité', description: 'Dans les transports ou les espaces de coworking, un filtre écran empêche les regards indiscrets de lire vos données. Le "shoulder surfing" est une menace réelle.' },
      { icon: '🔌', title: 'Séparation pro/perso', description: 'Ne prêtez pas votre matériel professionnel à vos proches. Ne branchez jamais de clé USB inconnue. Ne mélangez pas comptes personnels et professionnels.' },
    ],
    questions: [
      {
        id: 'rw1', type: 'scenario', difficulty: 'easy',
        question: 'Vous êtes dans un café et devez envoyer un email professionnel urgent. Le Wi-Fi du café est gratuit et ouvert (sans mot de passe). Que faites-vous ?',
        options: [
          { id: 'a', text: 'Je me connecte au Wi-Fi et envoie l\'email rapidement', isCorrect: false },
          { id: 'b', text: 'J\'active d\'abord le VPN de l\'entreprise, puis je me connecte au Wi-Fi', isCorrect: true },
          { id: 'c', text: 'J\'utilise le partage de connexion de mon téléphone personnel', isCorrect: false },
          { id: 'd', text: 'J\'attends d\'être de retour au bureau', isCorrect: false },
        ],
        explanation: 'Le VPN chiffre tout votre trafic, même sur un réseau Wi-Fi ouvert. C\'est la solution la plus sûre pour travailler en mobilité. Le partage de connexion mobile est une alternative acceptable mais le VPN reste préférable.',
      },
      {
        id: 'rw2', type: 'true-false', difficulty: 'easy',
        question: 'Un réseau Wi-Fi avec un mot de passe (ex: celui d\'un hôtel) est automatiquement sécurisé.',
        options: [
          { id: 'a', text: 'Vrai', isCorrect: false },
          { id: 'b', text: 'Faux', isCorrect: true },
        ],
        explanation: 'Faux ! Un mot de passe Wi-Fi partagé avec tous les clients d\'un hôtel n\'offre aucune protection. N\'importe quel client connecté au même réseau peut potentiellement intercepter votre trafic. Le VPN reste indispensable.',
      },
      {
        id: 'rw3', type: 'multiple-choice', difficulty: 'medium',
        question: 'Vous trouvez une clé USB dans le parking de l\'entreprise avec l\'étiquette "Salaires 2026 - Confidentiel". Que faites-vous ?',
        options: [
          { id: 'a', text: 'Je la branche sur mon PC pour identifier le propriétaire', isCorrect: false },
          { id: 'b', text: 'Je la remets au service IT sans la brancher', isCorrect: true },
          { id: 'c', text: 'Je la jette à la poubelle', isCorrect: false },
          { id: 'd', text: 'Je la branche sur un vieil ordinateur non connecté au réseau', isCorrect: false },
        ],
        explanation: 'Le "USB drop" est une technique d\'attaque classique. L\'étiquette alléchante est conçue pour vous inciter à la brancher. Même un vieil ordinateur peut être compromis. Remettez-la au service IT qui dispose d\'outils sécurisés pour l\'analyser.',
      },
      {
        id: 'rw4', type: 'scenario', difficulty: 'medium',
        question: 'Votre enfant vous demande d\'utiliser votre ordinateur professionnel pour faire ses devoirs pendant que vous préparez le dîner. Que faites-vous ?',
        options: [
          { id: 'a', text: 'J\'accepte, c\'est juste pour des devoirs', isCorrect: false },
          { id: 'b', text: 'Je refuse et lui propose d\'utiliser un autre appareil', isCorrect: true },
          { id: 'c', text: 'J\'accepte mais je verrouille les applications professionnelles', isCorrect: false },
          { id: 'd', text: 'J\'accepte mais je reste à côté pour surveiller', isCorrect: false },
        ],
        explanation: 'Le matériel professionnel ne doit jamais être prêté, même à un proche. Un enfant pourrait accidentellement cliquer sur un lien malveillant, installer un jeu contenant un malware, ou accéder à des données confidentielles.',
      },
    ],
  },
  {
    id: 'final-quiz',
    title: 'Le Maillon Fort',
    subtitle: 'Mission Finale — Quiz Récapitulatif',
    description: 'Testez l\'ensemble de vos connaissances avec ce quiz final couvrant toutes les menaces. Obtiendrez-vous le grade de Cyber-Sentinelle ?',
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663343017296/FPbfJCyecKtnym4RKQrEZz/flat-quiz-X7onSd5i34kEvgaHshBEWk.webp',
    color: '#00ff88',
    glowClass: 'glow-green',
    duration: '6 min',
    difficulty: 'Avancé',
    xpReward: 250,
    keyFact: { stat: '95%', description: 'des incidents de cybersécurité impliquent une erreur humaine' },
    learningPoints: [
      { icon: '🏆', title: 'Évaluation complète', description: 'Ce quiz final couvre l\'ensemble des 5 modules précédents. Il teste votre capacité à réagir face à des situations réalistes et variées.' },
      { icon: '⭐', title: 'Objectif : 80%', description: 'Pour obtenir le badge "Cyber-Sentinelle", vous devez obtenir un score d\'au moins 80%. Vous pouvez retenter autant de fois que nécessaire.' },
      { icon: '📊', title: 'Analyse des résultats', description: 'À la fin du quiz, un bilan détaillé vous indiquera vos points forts et les domaines à retravailler.' },
      { icon: '🔄', title: 'Apprentissage continu', description: 'La cybersécurité évolue constamment. Revenez régulièrement pour maintenir vos connaissances à jour.' },
    ],
    questions: [
      {
        id: 'fq1', type: 'scenario', difficulty: 'medium',
        question: 'Vous recevez un SMS de votre banque : "Activité suspecte détectée sur votre compte. Cliquez ici pour vérifier : bit.ly/verif-compte". Que faites-vous ?',
        options: [
          { id: 'a', text: 'Je clique pour vérifier rapidement', isCorrect: false },
          { id: 'b', text: 'J\'ouvre l\'application officielle de ma banque ou j\'appelle le numéro au dos de ma carte', isCorrect: true },
          { id: 'c', text: 'Je réponds "STOP" pour me désinscrire', isCorrect: false },
          { id: 'd', text: 'Je transfère le SMS à un ami pour avoir son avis', isCorrect: false },
        ],
        explanation: 'C\'est du smishing (phishing par SMS). Les banques n\'envoient jamais de liens raccourcis (bit.ly). Utilisez toujours l\'application officielle ou le numéro de téléphone figurant au dos de votre carte bancaire.',
      },
      {
        id: 'fq2', type: 'multiple-choice', difficulty: 'hard',
        question: 'Quelle est la meilleure défense contre les ransomwares ?',
        options: [
          { id: 'a', text: 'Un antivirus à jour', isCorrect: false },
          { id: 'b', text: 'Des sauvegardes régulières, testées et déconnectées du réseau', isCorrect: true },
          { id: 'c', text: 'Un pare-feu nouvelle génération', isCorrect: false },
          { id: 'd', text: 'Une assurance cyber', isCorrect: false },
        ],
        explanation: 'Les sauvegardes régulières, testées et hors-ligne (air-gapped) sont la seule garantie de récupération après un ransomware. L\'antivirus et le pare-feu sont importants mais ne sont pas infaillibles.',
      },
      {
        id: 'fq3', type: 'true-false', difficulty: 'medium',
        question: 'En cas de cyberattaque, il est préférable d\'éteindre immédiatement tous les ordinateurs de l\'entreprise.',
        options: [
          { id: 'a', text: 'Vrai', isCorrect: false },
          { id: 'b', text: 'Faux', isCorrect: true },
        ],
        explanation: 'Faux ! Il faut DÉCONNECTER du réseau (câble + Wi-Fi) mais NE PAS ÉTEINDRE. La mémoire vive contient des traces précieuses pour l\'investigation forensique qui seraient perdues à l\'extinction.',
      },
      {
        id: 'fq4', type: 'scenario', difficulty: 'hard',
        question: 'Votre collègue utilise un outil d\'IA gratuit pour traduire des contrats clients confidentiels. Il dit que c\'est plus rapide que l\'outil officiel. Que faites-vous ?',
        options: [
          { id: 'a', text: 'Rien, ce n\'est pas mon problème', isCorrect: false },
          { id: 'b', text: 'J\'explique le risque de Shadow IA et je signale la situation au responsable IT', isCorrect: true },
          { id: 'c', text: 'J\'utilise aussi cet outil car il semble efficace', isCorrect: false },
          { id: 'd', text: 'Je lui demande d\'anonymiser les données avant de les soumettre', isCorrect: false },
        ],
        explanation: 'La Shadow IA est un risque majeur. Les données clients soumises à une IA publique peuvent fuiter. Il faut sensibiliser le collègue ET signaler au responsable IT pour que l\'entreprise puisse proposer une alternative approuvée.',
      },
      {
        id: 'fq5', type: 'multiple-choice', difficulty: 'medium',
        question: 'Quel pourcentage des incidents de cybersécurité implique une erreur humaine ?',
        options: [
          { id: 'a', text: '50%', isCorrect: false },
          { id: 'b', text: '75%', isCorrect: false },
          { id: 'c', text: '95%', isCorrect: true },
          { id: 'd', text: '30%', isCorrect: false },
        ],
        explanation: '95% des incidents de cybersécurité impliquent une erreur humaine (source : IBM/Verizon DBIR). C\'est pourquoi la formation et la sensibilisation des collaborateurs sont les investissements les plus rentables en cybersécurité.',
      },
      {
        id: 'fq6', type: 'scenario', difficulty: 'hard',
        question: 'Vous êtes en déplacement professionnel. À l\'aéroport, vous devez charger votre téléphone professionnel. La seule option est une borne de recharge USB publique. Que faites-vous ?',
        options: [
          { id: 'a', text: 'Je branche mon téléphone, c\'est juste pour charger', isCorrect: false },
          { id: 'b', text: 'J\'utilise mon propre chargeur branché sur une prise électrique classique', isCorrect: true },
          { id: 'c', text: 'Je branche mon téléphone mais je le verrouille', isCorrect: false },
          { id: 'd', text: 'Je demande à un voisin de me prêter son chargeur', isCorrect: false },
        ],
        explanation: 'Le "juice jacking" est une attaque qui exploite les bornes USB publiques pour voler des données ou installer des malwares. Utilisez toujours votre propre chargeur sur une prise électrique classique, ou une batterie externe.',
      },
    ],
  },
];

// Progression system
export interface UserProgress {
  completedModules: string[];
  moduleScores: Record<string, number>;
  totalXP: number;
  currentLevel: number;
  badges: string[];
}

export const LEVELS = [
  { level: 1, title: 'Recrue', minXP: 0, color: '#64748b' },
  { level: 2, title: 'Agent', minXP: 150, color: '#00f0ff' },
  { level: 3, title: 'Opérateur', minXP: 400, color: '#00ff88' },
  { level: 4, title: 'Analyste', minXP: 700, color: '#f59e0b' },
  { level: 5, title: 'Sentinelle', minXP: 990, color: '#ff0066' },
];

export const BADGES = [
  { id: 'first-mission', title: 'Première Mission', description: 'Compléter votre premier module', icon: '🎯' },
  { id: 'perfect-score', title: 'Score Parfait', description: 'Obtenir 100% à un module', icon: '💎' },
  { id: 'phishing-expert', title: 'Anti-Phishing', description: 'Compléter le module Phishing', icon: '🎣' },
  { id: 'password-master', title: 'Maître des Clés', description: 'Compléter le module Mots de passe', icon: '🔑' },
  { id: 'ransomware-ready', title: 'Anti-Ransomware', description: 'Compléter le module Ransomware', icon: '🛡️' },
  { id: 'ai-aware', title: 'IA Vigilant', description: 'Compléter le module Shadow IA', icon: '🤖' },
  { id: 'road-warrior', title: 'Nomade Sécurisé', description: 'Compléter le module Télétravail', icon: '🌐' },
  { id: 'cyber-sentinel', title: 'Cyber-Sentinelle', description: 'Compléter tous les modules avec 80%+', icon: '🏆' },
  { id: 'speed-runner', title: 'Speed Runner', description: 'Compléter 3 modules en une session', icon: '⚡' },
];

export function getLevel(xp: number) {
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.minXP) current = level;
  }
  return current;
}

export function getNextLevel(xp: number) {
  const current = getLevel(xp);
  const next = LEVELS.find(l => l.level === current.level + 1);
  return next || null;
}
