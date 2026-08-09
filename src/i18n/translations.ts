export const SUPPORTED_LANGUAGES = ['de', 'fr', 'it', 'en', 'tr'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export interface Dict {
  appName: string;
  tagline: string;
  subtitle: string;
  settings: string;
  language: string;
  aiModel: string;
  close: string;
  takePhotoVideo: string;
  pickMedia: string;
  recordVoice: string;
  stopRecording: string;
  describeProblem: string;
  describePlaceholder: string;
  selectedMedia: string;
  noMedia: string;
  uploadTitle: string;
  uploadDesc: string;
  photoSourceTitle: string;
  addMore: string;
  mediaRequired: string;
  descriptionRequired: string;
  analyze: string;
  analyzing: string;
  resultTitle: string;
  riskLabel: string;
  analysisCompleteTitle: string;
  analysisCompleteSub: string;
  answerQuestions: string;
  yourInput: string;
  costDiy: string;
  costPro: string;
  costSave: string;
  costNote: string;
  costEco: string;
  yourPhoto: string;
  problemSummary: string;
  markComplete: string;
  completed: string;
  back: string;
  newAnalysis: string;
  selfRepair: string;
  selfRepairHint: string;
  yesIcan: string;
  yesIcanHint: string;
  noIcant: string;
  noIcantHint: string;
  diyPath: string;
  canRepair: string;
  proPath: string;
  findPro: string;
  findProfessional: string;
  findProfessionalSoon: string;
  errorTitle: string;
  errorCheckNetwork: string;
  errorNoApiKey: string;
  errorQuota: string;
  permissionCamera: string;
  permissionMedia: string;
  permissionMic: string;
  permissionDesc: string;
  recordingHint: string;
  copied: string;
  noApiKeyWarning: string;
  orTypeOwn: string;
  locTitle: string;
  locAsk: string;
  locShare: string;
  locGeneral: string;
  locVerify: string;
  locCorrect: string;
  locWrong: string;
  cancel: string;

  // Dil seçimi
  langSelectTitle: string;
  langSelectSubtitle: string;

  // Onboarding
  onbSkip: string;
  onbNext: string;
  onbStart: string;
  onb1A: string;
  onb1B: string;
  onb1Desc: string;
  onb2A: string;
  onb2B: string;
  onb2Desc: string;
  onb3A: string;
  onb3B: string;
  onb3Desc: string;
  onb4A: string;
  onb4B: string;
  onb4Desc: string;

  // Kategoriler
  chooseCategory: string;
  chooseSubcategory: string;
  catAppliances: string;
  catElectronics: string;
  catPlumbing: string;
  catCar: string;
  catFurniture: string;
  catOther: string;
  subDishwasher: string;
  subWashingMachine: string;
  subRefrigerator: string;
  subDryer: string;
  subMicrowaveOven: string;
  subOvenStove: string;
  subTelevision: string;
  subAcUnit: string;
  subSmartphone: string;
  subSmartwatch: string;
  subHeadphones: string;
  subLaptop: string;
  subDesktop: string;
  subRouter: string;
  subCamera: string;
  subLeakingPipes: string;
  subDrainClogs: string;
  subFaucet: string;
  subToilet: string;
  subSink: string;
  subShower: string;
  subWaterPressure: string;
  subPipes: string;
  subEngine: string;
  subBody: string;
  subTire: string;
  subDriving: string;
  subInterior: string;
  subFuelCooling: string;
  subElectrical: string;
  subWarnings: string;
  subChair: string;
  subSofa: string;
  subWardrobe: string;
  subTable: string;
  subBed: string;
  subOthers: string;

  // Alt navigasyon + geçmiş
  navHome: string;
  navHistory: string;
  historyTitle: string;
  noRepairsYet: string;
  historyHint: string;
  startFirstRepair: string;
  delete: string;
  deleteConfirm: string;

  // Ayarlar
  settingsShare: string;
  settingsShareDesc: string;
  settingsTerms: string;
  settingsTermsDesc: string;
  settingsPrivacy: string;
  settingsPrivacyDesc: string;
  settingsConsent: string;
  settingsConsentDesc: string;
  shareMessage: string;
  shareFailed: string;
  termsTitle: string;
  privacyTitle: string;
  consentTitle: string;
  consentExplain: string;
  consentAnalytics: string;
  consentAnalyticsDesc: string;
  consentPersonalization: string;
  consentPersonalizationDesc: string;
  consentSaved: string;
  consentReset: string;
  termsBody: string;
  privacyBody: string;

  // Deneyim iyileştirmeleri
  howItWorks: string;
  how1: string;
  how2: string;
  how3: string;
  tryDemo: string;
  demoTitle: string;
  demoDesc: string;
  suggestCategory: string;
  useSuggestion: string;
  stepsDone: string;
  shareResult: string;
  rateAsk: string;
  rateThanks: string;
  rateNow: string;
  rateLater: string;
  saveEstimate: string;
  savedTotal: string;
  retry: string;
  retryDesc: string;

  // Pro katmanı
  proTitle: string;
  proSub: string;
  proFeature1: string;
  proFeature2: string;
  proFeature3: string;
  proFeature4: string;
  proEnable: string;
  proNotNow: string;
  proNotify: string;
  proThanks: string;
  proActive: string;

  // Adım adım çözüm alt alanları + doğruluk rozeti + güvenlik-önce kartı
  stepWhyLabel: string;
  stepToolsLabel: string;
  stepExpectedLabel: string;
  stepIfNotLabel: string;
  stepSafetyLabel: string;
  stepDifficultyLabel: string;
  stepDurationLabel: string;
  confidenceHigh: string;
  confidenceMedium: string;
  confidenceLow: string;
  safetyFirstLabel: string;
}

const de: Dict = {
  appName: 'FIXORA',
  tagline: 'Ihr Hausreparatur-Assistent mit KI',
  subtitle:
    'Fotografieren, sprechen oder beschreiben Sie das Problem — FIXORA analysiert es und gibt Ihnen eine Schritt-für-Schritt-Anleitung.',
  settings: 'Einstellungen',
  language: 'Sprache',
  aiModel: 'KI-Modell',
  close: 'Schliessen',
  takePhotoVideo: 'Foto / Video aufnehmen',
  pickMedia: 'Aus Galerie auswählen',
  recordVoice: 'Sprachnachricht aufnehmen',
  stopRecording: 'Aufnahme stoppen',
  describeProblem: 'Problem beschreiben',
  describePlaceholder: 'z.B. Wasser tropft unter dem Waschbecken.',
  selectedMedia: 'Ausgewählte Datei',
  noMedia: 'Noch keine Datei ausgewählt',
  uploadTitle: 'Foto oder Video hinzufügen',
  uploadDesc: 'Mache ein Foto oder wähle aus deiner Galerie',
  photoSourceTitle: 'Fotoquelle wählen',
  addMore: 'Hinzufügen',
  mediaRequired: 'Bitte füge ein Foto oder Video hinzu',
  descriptionRequired: 'Bitte beschreibe das Problem',
  analyze: 'Problem analysieren',
  analyzing: 'Analyse läuft… dies kann einen Moment dauern',
  resultTitle: 'Analyse-Ergebnis',
  riskLabel: 'Risiko',
  analysisCompleteTitle: 'KI-Analyse abgeschlossen',
  analysisCompleteSub: 'Die KI-Analyse ist abgeschlossen. Schauen Sie sich die Details unten an.',
  answerQuestions: 'Bitte beantworten Sie auch die Fragen unten',
  yourInput: 'Ihre Eingabe',
  costDiy: 'Selbst machen',
  costPro: 'Professionelle Reparatur',
  costSave: 'Sie sparen',
  costNote: 'Richtwerte – örtliche Preise können abweichen.',
  costEco: 'Reparieren schont die Umwelt und reduziert Abfall.',
  yourPhoto: 'Ihr Foto',
  problemSummary: 'Problemübersicht',
  markComplete: 'Als erledigt markieren',
  completed: 'Erledigt',
  back: 'Zurück',
  newAnalysis: 'Neue Analyse',
  selfRepair: 'Können Sie diese Reparatur selbst durchführen?',
  selfRepairHint: 'Ehrlich beurteilen — FIXORA hilft Ihnen je nach Antwort weiter.',
  yesIcan: 'Ja, das kann ich',
  yesIcanHint: 'Material- und Werkzeugliste',
  noIcant: 'Nein, das kann ich nicht',
  noIcantHint: 'Firmen- und Handwerkerkontakte',
  diyPath: 'Gut! Dann können Sie es selbst versuchen. Material & Fachgeschäfte für Sie bereit.',
  canRepair: 'Material & Fachgeschäfte in meiner Nähe finden',
  proPath:
    'Kein Problem. Wir empfehlen Ihnen lokale Fachfirmen in Ihrer Nähe, damit die Reparatur sicher erledigt wird.',
  findPro: 'Lokale Fachfirmen in meiner Nähe finden',
  findProfessional: 'Profi in meiner Nähe finden',
  findProfessionalSoon: '(Bald verfügbar)',
  errorTitle: 'Etwas ist schiefgelaufen',
  errorCheckNetwork: 'Bitte prüfen Sie Ihre Verbindung und versuchen Sie es erneut.',
  errorNoApiKey:
    'Kein gültiger Gemini-API-Schlüssel konfiguriert. Legen Sie einen Schlüssel in src/auth/config.ts fest.',
  errorQuota:
    'Die kostenlose Anfragebegrenzung des KI-Anbieters ist vorübergehend aufgebraucht. Bitte warten Sie einen Moment.',
  permissionCamera: 'Kamera-Berechtigung erforderlich',
  permissionMedia: 'Medienzugriff erforderlich',
  permissionMic: 'Mikrofon-Berechtigung erforderlich',
  permissionDesc:
    'Bitte erlauben Sie den Zugriff in den Einstellungen, damit FIXORA Ihr Problem analysieren kann.',
  recordingHint: 'Beschreiben Sie das Problem laut, z.B. „Der Wasserhahn tropft“.',
  copied: 'In die Zwischenablage kopiert',
  noApiKeyWarning:
    'Kein Gemini-API-Schlüssel konfiguriert. Bitte fügen Sie ihn in src/auth/config.ts ein.',
  orTypeOwn: 'Oder geben Sie Ihre eigene Antwort unten ein …',
  locTitle: 'Lokale Optionen',
  locAsk: 'FIXORA benötigt Ihren Standort, um nahegelegene Fachgeschäfte und Handwerker zu finden. Möchten Sie den Standort teilen?',
  locShare: 'Standort teilen',
  locGeneral: 'Allgemeine Suche',
  locVerify: 'Ihr Standort wurde als „{{place}}“ erkannt. Ist das korrekt?',
  locCorrect: 'Ja, hier bin ich',
  locWrong: 'Nein, allgemeine Suche',
  cancel: 'Abbrechen',

  langSelectTitle: 'Wähle deine Sprache',
  langSelectSubtitle:
    'Die App läuft in der von dir gewählten Sprache. Du kannst sie später in den Einstellungen ändern.',

  onbSkip: 'Überspringen',
  onbNext: 'Weiter',
  onbStart: 'Start',
  onb1A: 'Werde dein eigener',
  onb1B: 'Reparatur-Experte.',
  onb1Desc: 'Etwas kaputt? Mach einfach ein Foto und füge bei Bedarf eine kurze Notiz hinzu.',
  onb2A: 'Löse es selbst.',
  onb2B: 'Sofort Geld sparen.',
  onb2Desc: 'Geniesse das Gefühl, Zeit und Geld zu sparen.',
  onb3A: 'Repariere alles.',
  onb3B: 'Sogar dein Auto.',
  onb3Desc: 'Von Motorproblemen bis zum Alltag — KI-Hilfe in Sekunden.',
  onb4A: 'Grossartig!',
  onb4B: 'Lass uns beginnen.',
  onb4Desc: 'FIXORA führt dich Schritt für Schritt durch deine Reparatur.',

  chooseCategory: 'Wähle die passende Kategorie',
  chooseSubcategory: 'Wähle die Unterkategorie',
  catAppliances: 'Haushaltsgeräte',
  catElectronics: 'Elektronik',
  catPlumbing: 'Sanitär',
  catCar: 'Auto & Fahrzeug',
  catFurniture: 'Möbel',
  catOther: 'Sonstiges',
  subDishwasher: 'Geschirrspüler',
  subWashingMachine: 'Waschmaschine',
  subRefrigerator: 'Kühlschrank',
  subDryer: 'Trockner',
  subMicrowaveOven: 'Mikrowelle',
  subOvenStove: 'Ofen / Herde',
  subTelevision: 'Fernseher',
  subAcUnit: 'Klimaanlage',
  subSmartphone: 'Smartphone',
  subSmartwatch: 'Smartwatch',
  subHeadphones: 'Kopfhörer',
  subLaptop: 'Laptop',
  subDesktop: 'Desktop-PC',
  subRouter: 'Router / Modem',
  subCamera: 'Kamera',
  subLeakingPipes: 'Leckende Rohre',
  subDrainClogs: 'Verstopfte Abflüsse',
  subFaucet: 'Armatur',
  subToilet: 'Toilette',
  subSink: 'Spüle',
  subShower: 'Dusche / Badewanne',
  subWaterPressure: 'Wasserdruck',
  subPipes: 'Rohre',
  subEngine: 'Motor',
  subBody: 'Karosserie',
  subTire: 'Reifen',
  subDriving: 'Fahrverhalten',
  subInterior: 'Innenraum',
  subFuelCooling: 'Kraftstoff & Kühlung',
  subElectrical: 'Elektrik',
  subWarnings: 'Warnungen',
  subChair: 'Stuhl',
  subSofa: 'Sofa / Couch',
  subWardrobe: 'Schrank',
  subTable: 'Tisch',
  subBed: 'Bett',
  subOthers: 'Sonstiges',

  navHome: 'Start',
  navHistory: 'Verlauf',
  historyTitle: 'Reparaturverlauf',
  noRepairsYet: 'Noch keine Reparaturen',
  historyHint: 'Deine durchgeführten Reparaturen erscheinen hier und sind jederzeit wieder abrufbar.',
  startFirstRepair: 'Starte deine erste Reparatur',
  delete: 'Löschen',
  deleteConfirm: 'Eintrag löschen?',

  settingsShare: 'Mit Freunden teilen',
  settingsShareDesc: 'Empfiehl FIXORA deinen Freunden',
  settingsTerms: 'Nutzungsbedingungen',
  settingsTermsDesc: 'Nutzungsbedingungen der App anzeigen',
  settingsPrivacy: 'Datenschutzerklärung',
  settingsPrivacyDesc: 'Erfahren, wie deine Daten verwendet werden',
  settingsConsent: 'Einwilligung verwalten',
  settingsConsentDesc: 'Datenschutzeinstellungen ansehen und aktualisieren',
  shareMessage:
    'FIXORA – der KI-gestützte Reparaturassistent für zu Hause. Mache ein Foto deines Problems und erhalte eine Schritt-für-Schritt-Anleitung: {url}',
  shareFailed: 'Teilen nicht möglich',
  termsTitle: 'Nutzungsbedingungen',
  privacyTitle: 'Datenschutzerklärung',
  consentTitle: 'Einwilligung verwalten',
  consentExplain:
    'FIXORA verwendet ausschließlich Daten, denen du ausdrücklich zustimmst. Verwalte deine Einstellungen unten.',
  consentAnalytics: 'Anonyme Analysedaten',
  consentAnalyticsDesc: 'Anonyme Nutzungsstatistiken, die uns helfen, die App zu verbessern.',
  consentPersonalization: 'Personalisierte Empfehlungen',
  consentPersonalizationDesc: 'Auf deine Historie zugeschnittene Reparaturvorschläge.',
  consentSaved: 'Deine Einstellungen wurden gespeichert.',
  consentReset: 'Auf Standard zurücksetzen',
  termsBody:
    'Willkommen bei FIXORA.\n\n1. Nutzung\nDie App bietet KI-gestützte Reparaturhinweise. Die Ergebnisse dienen nur als Orientierung und ersetzen keine professionelle Fachprüfung.\n\n2. Verantwortung\nFIXORA übernimmt keine Haftung für Schäden, die durch das Befolgen der Anleitungen entstehen. Arbeite stets sicher und ziehe bei Unsicherheit einen Fachmann hinzu.\n\n3. Änderungen\nWir können diese Bedingungen jederzeit anpassen. Aktualisierte Bedingungen gelten ab Veröffentlichung in der App.',
  privacyBody:
    'Datenschutz ist uns wichtig.\n\n1. Gespeicherte Daten\nFotos, Tonaufnahmen und Beschreibungen, die du zur Analyse hochlädst, werden verarbeitet und nicht länger als nötig gespeichert. Deine Analyse-Historie bleibt lokal auf deinem Gerät.\n\n2. Verwendung\nDeine Daten werden ausschließlich zur Bearbeitung deiner Reparaturanfrage verwendet.\n\n3. Kontakt\nFragen zum Datenschutz: sende uns eine E-Mail über die im App Store hinterlegten Kontaktdaten.',

  howItWorks: 'So funktioniert es',
  how1: 'Foto aufnehmen',
  how2: 'Problem kurz beschreiben',
  how3: 'Schritt-für-Schritt-Lösung erhalten',
  tryDemo: 'Mit Beispiel testen',
  demoTitle: 'Sieh deine erste Analyse in 10 Sekunden',
  demoDesc:
    'Mein Küchenhahn tropft. Unter dem Spülbecken tritt Wasser aus und beim Öffnen ist ein Geräusch zu hören. Wie kann ich das reparieren?',
  suggestCategory: 'Kategorie-Vorschlag',
  useSuggestion: 'Vorschlag übernehmen',
  stepsDone: 'Alle Schritte erledigt! 🎉',
  shareResult: 'Ergebnis teilen',
  rateAsk: 'Wie gefällt dir FIXORA?',
  rateThanks: 'Danke für dein Feedback!',
  rateNow: 'Im Store bewerten',
  rateLater: 'Später',
  saveEstimate: 'Geschätzte Ersparnis',
  savedTotal: 'Geschätzte Gesamtersparnis',
  retry: 'Erneut versuchen',
  retryDesc: 'Verbindung unterbrochen, Antwort ist unvollständig.',

  proTitle: 'FIXORA Pro',
  proSub: 'Unbegrenzte Analysen und Prioritäts-Support',
  proFeature1: 'Unbegrenzte Analysen pro Monat',
  proFeature2: 'Schritt-für-Schritt-Videoanleitungen',
  proFeature3: 'Priorisierte Antwortzeiten',
  proFeature4: 'Teile- und Lieferantenlisten',
  proEnable: 'Pro aktivieren (Test)',
  proNotNow: 'Jetzt nicht',
  proNotify: 'Benachrichtige mich, wenn Pro startet',
  proThanks: 'Danke, wir melden uns!',
  proActive: 'Pro aktiv ✓',
  stepWhyLabel: 'Warum',
  stepToolsLabel: 'Benötigte Werkzeuge',
  stepExpectedLabel: 'Erwartetes Ergebnis',
  stepIfNotLabel: 'Falls nicht wie erwartet',
  stepSafetyLabel: 'Sicherheit',
  stepDifficultyLabel: 'Schwierigkeit',
  stepDurationLabel: 'Dauer',
  confidenceHigh: 'Hoch',
  confidenceMedium: 'Mittel',
  confidenceLow: 'Niedrig',
  safetyFirstLabel: 'Sicherheit zuerst',
};

const fr: Dict = {
  appName: 'FIXORA',
  tagline: "Votre assistant de réparation à domicile à base d'IA",
  subtitle:
    "Photographiez, décrivez ou parlez de votre problème — FIXORA l'analyse et vous guide pas à pas.",
  settings: 'Paramètres',
  language: 'Langue',
  aiModel: 'Modèle IA',
  close: 'Fermer',
  takePhotoVideo: 'Prendre une photo / vidéo',
  pickMedia: 'Choisir depuis la galerie',
  recordVoice: 'Enregistrer un message vocal',
  stopRecording: "Arrêter l'enregistrement",
  describeProblem: 'Décrire le problème',
  describePlaceholder: 'ex. de l\'eau coule sous le lavabo.',
  selectedMedia: 'Fichier sélectionné',
  noMedia: 'Aucun fichier sélectionné',
  uploadTitle: 'Ajouter une photo ou une vidéo',
  uploadDesc: 'Prends une photo ou choisis dans ta galerie',
  photoSourceTitle: 'Choisir la source de la photo',
  addMore: 'Ajouter',
  mediaRequired: 'Ajoute une photo ou une vidéo',
  descriptionRequired: 'Décris le problème',
  analyze: 'Analyser le problème',
  analyzing: 'Analyse en cours… cela peut prendre un moment',
  resultTitle: "Résultat de l'analyse",
  riskLabel: 'Risque',
  analysisCompleteTitle: 'Analyse IA terminée',
  analysisCompleteSub: "L'analyse IA est terminée. Consultez les détails ci-dessous.",
  answerQuestions: 'Veuillez aussi répondre aux questions ci-dessous',
  yourInput: 'Votre saisie',
  costDiy: 'Faites-le vous-même',
  costPro: 'Réparation professionnelle',
  costSave: 'Vous économisez',
  costNote: 'Valeurs indicatives – les prix locaux peuvent varier.',
  costEco: 'La réparation écologique réduit les déchets.',
  yourPhoto: 'Votre photo',
  problemSummary: 'Résumé du problème',
  markComplete: 'Marquer comme terminé',
  completed: 'Terminé',
  back: 'Retour',
  newAnalysis: 'Nouvelle analyse',
  selfRepair: 'Pouvez-vous effectuer cette réparation vous-même ?',
  selfRepairHint: 'Évaluez honnêtement — FIXORA vous aide selon votre réponse.',
  yesIcan: 'Oui, je peux',
  yesIcanHint: 'liste des matériaux et équipements',
  noIcant: 'Non, je ne peux pas',
  noIcantHint: "coordonnées d'entreprises et d'artisans",
  diyPath: "Bien ! Vous pouvez essayer vous-même. Matériel et fournisseurs à proximité pour vous.",
  canRepair: "Trouver un matériau & des fournisseurs près de moi",
  proPath: "Pas de problème. Nous recommandons des professionnels locaux pour une réparation correcte.",
  findPro: 'Trouver des professionnels locaux',
  findProfessional: "Trouver un professionnel près de chez moi",
  findProfessionalSoon: '(Bientôt disponible)',
  errorTitle: "Quelque chose s'est mal passé",
  errorCheckNetwork: 'Veuillez vérifier votre connexion et réessayer.',
  errorNoApiKey:
    "Aucune clé API Gemini valide configurée. Définissez une clé dans src/auth/config.ts.",
  errorQuota:
    "Le quota gratuit du fournisseur d'IA est temporairement épuisé. Veuillez réessayer dans un instant.",
  permissionCamera: "Autorisation caméra requise",
  permissionMedia: 'Accès aux médias requis',
  permissionMic: 'Autorisation du micro requise',
  permissionDesc:
    "Veuillez autoriser l'accès dans les réglages pour que FIXORA analyse votre problème.",
  recordingHint: 'Décrivez le problème à voix haute, ex. „Le robinet fuit“.',
  copied: 'Copié dans le presse-papiers',
  noApiKeyWarning:
    "Aucune clé API Gemini configurée. Ajoutez-la dans src/auth/config.ts pour l'analyse.",
  orTypeOwn: 'Ou saisissez votre propre réponse ci-dessous …',
  locTitle: 'Options locales',
  locAsk: "FIXORA a besoin de votre position pour trouver les magasins de bricolage et les artisans à proximité. Souhaitez-vous partager votre position ?",
  locShare: 'Partager la position',
  locGeneral: 'Recherche générale',
  locVerify: 'Votre position a été détectée comme „{{place}}“. Est-ce correct ?',
  locCorrect: 'Oui, c\'est ici',
  locWrong: 'Non, recherche générale',
  cancel: 'Annuler',

  langSelectTitle: 'Choisis ta langue',
  langSelectSubtitle:
    "L'appli fonctionnera dans la langue choisie. Tu pourras la modifier plus tard dans les paramètres.",

  onbSkip: 'Passer',
  onbNext: 'Continuer',
  onbStart: 'Commencer',
  onb1A: 'Devenez votre propre',
  onb1B: 'expert en réparation.',
  onb1Desc: 'Quelque chose est cassé ? Prenez une photo et ajoutez une courte note si vous voulez.',
  onb2A: 'Résolvez-le vous-même.',
  onb2B: 'Économisez immédiatement.',
  onb2Desc: "Profitez de la satisfaction d'économiser du temps et de l'argent.",
  onb3A: 'Réparez tout.',
  onb3B: 'Même votre voiture.',
  onb3Desc: "Des problèmes de moteur à la routine — de l'aide IA en quelques secondes.",
  onb4A: 'Parfait !',
  onb4B: 'Commençons.',
  onb4Desc: 'FIXORA vous guide pas à pas dans votre réparation.',

  chooseCategory: 'Choisissez la catégorie',
  chooseSubcategory: 'Choisissez la sous-catégorie',
  catAppliances: 'Électroménager',
  catElectronics: 'Électronique',
  catPlumbing: 'Plomberie',
  catCar: 'Voiture',
  catFurniture: 'Meubles',
  catOther: 'Autre',
  subDishwasher: 'Lave-vaisselle',
  subWashingMachine: 'Machine à laver',
  subRefrigerator: 'Réfrigérateur',
  subDryer: 'Sèche-linge',
  subMicrowaveOven: 'Micro-ondes',
  subOvenStove: 'Four / Cuisinière',
  subTelevision: 'Téléviseur',
  subAcUnit: 'Climatiseur',
  subSmartphone: 'Smartphone',
  subSmartwatch: 'Montre connectée',
  subHeadphones: 'Casque',
  subLaptop: 'Ordinateur portable',
  subDesktop: 'PC de bureau',
  subRouter: 'Routeur / Modem',
  subCamera: 'Appareil photo',
  subLeakingPipes: 'Tuyaux qui fuient',
  subDrainClogs: 'Canalisations bouchées',
  subFaucet: 'Robinet',
  subToilet: 'WC',
  subSink: 'Évier',
  subShower: 'Douche / Baignoire',
  subWaterPressure: "Pression d'eau",
  subPipes: 'Tuyaux',
  subEngine: 'Moteur',
  subBody: 'Carrosserie',
  subTire: 'Pneus',
  subDriving: 'Conduite',
  subInterior: 'Intérieur',
  subFuelCooling: 'Carburant & refroidissement',
  subElectrical: 'Électricité',
  subWarnings: 'Avertissements',
  subChair: 'Chaise',
  subSofa: 'Canapé',
  subWardrobe: 'Armoire',
  subTable: 'Table',
  subBed: 'Lit',
  subOthers: 'Autre',

  navHome: 'Accueil',
  navHistory: 'Historique',
  historyTitle: 'Historique des réparations',
  noRepairsYet: "Aucune réparation pour l'instant",
  historyHint: 'Vos réparations apparaissent ici et restent accessibles à tout moment.',
  startFirstRepair: 'Lancez votre première réparation',
  delete: 'Supprimer',
  deleteConfirm: 'Supprimer ?',

  settingsShare: 'Partager avec des amis',
  settingsShareDesc: 'Recommande FIXORA à tes amis',
  settingsTerms: 'Conditions d\u2019utilisation',
  settingsTermsDesc: 'Consulter les conditions de l\u2019app',
  settingsPrivacy: 'Politique de confidentialité',
  settingsPrivacyDesc: 'Découvrir comment nous utilisons les données',
  settingsConsent: 'Gérer le consentement',
  settingsConsentDesc: 'Consulter et mettre à jour tes choix de confidentialité',
  shareMessage:
    'FIXORA \u2013 l\u2019assistant de réparation à domicile propulsé par l\u2019IA. Prends une photo de ton problème et reçois un guide pas à pas : {url}',
  shareFailed: 'Partage impossible',
  termsTitle: 'Conditions d\u2019utilisation',
  privacyTitle: 'Politique de confidentialité',
  consentTitle: 'Gérer le consentement',
  consentExplain:
    'FIXORA n\u2019utilise que les données auxquelles tu consens explicitement. Gère tes préférences ci-dessous.',
  consentAnalytics: 'Données analytiques anonymes',
  consentAnalyticsDesc:
    'Statistiques d\u2019utilisation anonymes qui nous aident à améliorer l\u2019app.',
  consentPersonalization: 'Recommandations personnalisées',
  consentPersonalizationDesc: 'Suggestions de réparation adaptées à ton historique.',
  consentSaved: 'Tes préférences ont été enregistrées.',
  consentReset: 'Réinitialiser aux valeurs par défaut',
  termsBody:
    'Bienvenue sur FIXORA.\n\n1. Utilisation\nL\u2019app fournit des conseils de réparation assistés par l\u2019IA. Les résultats servent uniquement d\u2019orientation et ne remplacent pas une vérification professionnelle.\n\n2. Responsabilité\nFIXORA n\u2019est pas responsable des dommages résultant du suivi des guides. Travaille toujours en sécurité et fais appel à un professionnel en cas de doute.\n\n3. Modifications\nNous pouvons modifier ces conditions à tout moment. Les conditions mises à jour s\u2019appliquent dès leur publication dans l\u2019app.',
  privacyBody:
    'Ta vie privée compte.\n\n1. Données enregistrées\nLes photos, enregistrements audio et descriptions téléchargés pour l\u2019analyse sont traités et conservés aussi peu que possible. Ton historique d\u2019analyse reste local sur ton appareil.\n\n2. Utilisation\nTes données sont utilisées uniquement pour traiter ta demande de réparation.\n\n3. Contact\nQuestions sur la confidentialité : contacte-nous via les informations de l\u2019App Store.',

  howItWorks: 'Comment ça marche',
  how1: 'Prendre une photo',
  how2: 'Décrire brièvement le problème',
  how3: 'Recevoir un guide pas à pas',
  tryDemo: 'Essayer avec un exemple',
  demoTitle: 'Voyez votre première analyse en 10 secondes',
  demoDesc:
    'Mon robinet de cuisine fuit. De l\u2019eau s\u2019échappe du tuyau sous l\u2019évier et un bruit se fait entendre à l\u2019ouverture. Comment le réparer ?',
  suggestCategory: 'Catégorie suggérée',
  useSuggestion: 'Utiliser la suggestion',
  stepsDone: 'Toutes les étapes sont terminées ! 🎉',
  shareResult: 'Partager le résultat',
  rateAsk: 'Comment trouvez-vous FIXORA ?',
  rateThanks: 'Merci pour votre retour !',
  rateNow: 'Évaluer dans le magasin',
  rateLater: 'Plus tard',
  saveEstimate: 'Économie estimée',
  savedTotal: 'Économies totales estimées',
  retry: 'Réessayer',
  retryDesc: 'Connexion perdue, la réponse est incomplète.',

  proTitle: 'FIXORA Pro',
  proSub: 'Analyses illimitées et support prioritaire',
  proFeature1: 'Analyses illimitées par mois',
  proFeature2: 'Guides vidéo pas à pas',
  proFeature3: 'Temps de réponse prioritaire',
  proFeature4: 'Listes de pièces et fournisseurs',
  proEnable: 'Activer Pro (test)',
  proNotNow: 'Pas maintenant',
  proNotify: 'Prévenez-moi au lancement de Pro',
  proThanks: 'Merci, nous vous préviendrons !',
  proActive: 'Pro actif ✓',
  stepWhyLabel: 'Pourquoi',
  stepToolsLabel: 'Outils nécessaires',
  stepExpectedLabel: 'Résultat attendu',
  stepIfNotLabel: "Si ce n'est pas le cas",
  stepSafetyLabel: 'Sécurité',
  stepDifficultyLabel: 'Difficulté',
  stepDurationLabel: 'Durée',
  confidenceHigh: 'Élevée',
  confidenceMedium: 'Moyenne',
  confidenceLow: 'Faible',
  safetyFirstLabel: "Sécurité d'abord",
};

const it: Dict = {
  appName: 'FIXORA',
  tagline: 'Il tuo assistente di riparazioni domestiche con IA',
  subtitle:
    'Scatta, descrivi o parla del problema — FIXORA lo analizza e ti guida passo dopo passo.',
  settings: 'Impostazioni',
  language: 'Lingua',
  aiModel: 'Modello IA',
  close: 'Chiudi',
  takePhotoVideo: 'Scatta una foto / video',
  pickMedia: 'Scegli dalla galleria',
  recordVoice: 'Registra un messaggio vocale',
  stopRecording: "Interrompi l'registrazione",
  describeProblem: 'Descrivi il problema',
  describePlaceholder: 'es. gocciola acqua sotto il lavandino.',
  selectedMedia: 'File selezionato',
  noMedia: 'Nessun file selezionato',
  uploadTitle: 'Aggiungi una foto o un video',
  uploadDesc: 'Scatta una foto o scegli dalla galleria',
  photoSourceTitle: 'Scegli la fonte della foto',
  addMore: 'Aggiungi',
  mediaRequired: 'Aggiungi una foto o un video',
  descriptionRequired: 'Descrivi il problema',
  analyze: 'Analizza il problema',
  analyzing: 'Analisi in corso… potrebbe volerci un momento',
  resultTitle: 'Risultato della analisi',
  riskLabel: 'Rischio',
  analysisCompleteTitle: 'Analisi IA completata',
  analysisCompleteSub: "L'analisi IA è completata. Controlla i dettagli qui sotto.",
  answerQuestions: 'Rispondi anche alle domande qui sotto',
  yourInput: 'Il tuo inserimento',
  costDiy: 'Fai da te',
  costPro: 'Riparazione professionale',
  costSave: 'Risparmi',
  costNote: 'Valori indicativi – i prezzi locali possono variare.',
  costEco: 'La riparazione ecologica riduce gli sprechi.',
  yourPhoto: 'La tua foto',
  problemSummary: 'Riepilogo problema',
  markComplete: 'Segna come completato',
  completed: 'Completato',
  back: 'Indietro',
  newAnalysis: 'Nuova analisi',
  selfRepair: 'Puoi eseguire tu stesso questa riparazione?',
  selfRepairHint: 'Valuta onestamente — FIXORA ti aiuta in base alla risposta.',
  yesIcan: 'Sì, posso farlo',
  yesIcanHint: 'lista di materiali e attrezzature',
  noIcant: 'No, non posso',
  noIcantHint: 'contatti di aziende e artigiani',
  diyPath: 'Buono! Puoi provare tu stesso. Materiali e fornitori nelle vicinanze per te.',
  canRepair: 'Trova materiali & fornitori',
  proPath: 'Nessun problema. Consigliamo professionisti locali per una riparazione sicura.',
  findPro: 'Trova professionisti locali',
  findProfessional: 'Trova un professionista vicino a me',
  findProfessionalSoon: '(Presto disponibile)',
  errorTitle: 'Qualcosa è andato storto',
  errorCheckNetwork: 'Controlla la connessione e riprova.',
  errorNoApiKey:
    'Nessuna chiave API Gemini valida configurata. Imposta una chiave in src/auth/config.ts.',
  errorQuota:
    'La quota gratuita del provider IA è temporaneamente esaurita. Riprova tra un momento.',
  permissionCamera: 'Permesso fotocamera richiesto',
  permissionMedia: 'Accesso ai media richiesto',
  permissionMic: 'Permesso microfono richiesto',
  permissionDesc: "Consenti l'accesso nelle impostazioni per l'analisi.",
  recordingHint: 'Descrivi il problema ad alta voce, es. „Il rubinetto perde“.',
  copied: 'Copiato negli appunti',
  noApiKeyWarning:
    'Nessuna chiave API Gemini configurata. Aggiungila in src/auth/config.ts.',
  orTypeOwn: 'Oppure scrivi la tua risposta qui sotto …',
  locTitle: 'Opzioni locali',
  locAsk: "FIXORA ha bisogno della tua posizione per trovare negozi di ferramenta e artigiani nelle vicinanze. Vuoi condividere la tua posizione?",
  locShare: 'Condividi posizione',
  locGeneral: 'Ricerca generale',
  locVerify: 'La tua posizione è stata rilevata come "{{place}}". È corretto?',
  locCorrect: 'Sì, sono qui',
  locWrong: 'No, ricerca generale',
  cancel: 'Annulla',

  langSelectTitle: 'Scegli la lingua',
  langSelectSubtitle:
    "L'app funzionerà nella lingua scelta. Potrai cambiarla più tardi nelle impostazioni.",

  onbSkip: 'Salta',
  onbNext: 'Continua',
  onbStart: 'Inizia',
  onb1A: 'Diventa il tuo',
  onb1B: 'esperto di riparazioni.',
  onb1Desc: 'Qualcosa è rotto? Scatta una foto e aggiungi una breve nota se vuoi.',
  onb2A: 'Risolvilo da solo.',
  onb2B: 'Risparmia subito.',
  onb2Desc: 'Goditi la soddisfazione di risparmiare tempo e denaro.',
  onb3A: 'Ripara tutto.',
  onb3B: 'Anche la tua auto.',
  onb3Desc: 'Dai problemi al motore alla routine — aiuto IA in pochi secondi.',
  onb4A: 'Perfetto!',
  onb4B: 'Iniziamo.',
  onb4Desc: 'FIXORA ti guida passo dopo passo nella riparazione.',

  chooseCategory: 'Scegli la categoria',
  chooseSubcategory: 'Scegli la sottocategoria',
  catAppliances: 'Elettrodomestici',
  catElectronics: 'Elettronica',
  catPlumbing: 'Idraulica',
  catCar: 'Auto',
  catFurniture: 'Mobili',
  catOther: 'Altro',
  subDishwasher: 'Lavastoviglie',
  subWashingMachine: 'Lavatrice',
  subRefrigerator: 'Frigorifero',
  subDryer: 'Asciugatrice',
  subMicrowaveOven: 'Forno a microonde',
  subOvenStove: 'Forno / Piano',
  subTelevision: 'Televisore',
  subAcUnit: 'Condizionatore',
  subSmartphone: 'Smartphone',
  subSmartwatch: 'Smartwatch',
  subHeadphones: 'Cuffie',
  subLaptop: 'Laptop',
  subDesktop: 'PC desktop',
  subRouter: 'Router / Modem',
  subCamera: 'Fotocamera',
  subLeakingPipes: 'Tubi che perdono',
  subDrainClogs: 'Scarichi intasati',
  subFaucet: 'Rubinetto',
  subToilet: 'WC',
  subSink: 'Lavello',
  subShower: 'Doccia / Vasca',
  subWaterPressure: 'Pressione acqua',
  subPipes: 'Tubi',
  subEngine: 'Motore',
  subBody: 'Carrozzeria',
  subTire: 'Pneumatici',
  subDriving: 'Guida',
  subInterior: 'Interni',
  subFuelCooling: 'Carburante e raffreddamento',
  subElectrical: 'Elettricità',
  subWarnings: 'Avvertenze',
  subChair: 'Sedia',
  subSofa: 'Divano',
  subWardrobe: 'Armadio',
  subTable: 'Tavolo',
  subBed: 'Letto',
  subOthers: 'Altro',

  navHome: 'Home',
  navHistory: 'Cronologia',
  historyTitle: 'Cronologia riparazioni',
  noRepairsYet: 'Nessuna riparazione',
  historyHint: 'Le tue riparazioni appariranno qui e restano disponibili in qualsiasi momento.',
  startFirstRepair: 'Inizia la tua prima riparazione',
  delete: 'Elimina',
  deleteConfirm: 'Eliminare?',

  settingsShare: 'Condividi con gli amici',
  settingsShareDesc: 'Consiglia FIXORA ai tuoi amici',
  settingsTerms: 'Termini di utilizzo',
  settingsTermsDesc: 'Consulta i termini dell\u2019app',
  settingsPrivacy: 'Informativa sulla privacy',
  settingsPrivacyDesc: 'Scopri come usiamo i dati',
  settingsConsent: 'Gestisci il consenso',
  settingsConsentDesc: 'Rivedi e aggiorna le tue scelte sulla privacy',
  shareMessage:
    'FIXORA \u2013 assistente per riparazioni domestiche basato sull\u2019IA. Scatta una foto del problema e ricevi una guida passo passo: {url}',
  shareFailed: 'Condivisione non riuscita',
  termsTitle: 'Termini di utilizzo',
  privacyTitle: 'Informativa sulla privacy',
  consentTitle: 'Gestisci il consenso',
  consentExplain:
    'FIXORA utilizza solo i dati a cui dai il tuo consenso esplicito. Gestisci le tue preferenze qui sotto.',
  consentAnalytics: 'Dati analitici anonimi',
  consentAnalyticsDesc: 'Statistiche d\u2019uso anonime che ci aiutano a migliorare l\u2019app.',
  consentPersonalization: 'Raccomandazioni personalizzate',
  consentPersonalizationDesc: 'Suggerimenti di riparazione su misura per la tua cronologia.',
  consentSaved: 'Preferenze salvate.',
  consentReset: 'Ripristina impostazioni predefinite',
  termsBody:
    'Benvenuto in FIXORA.\n\n1. Utilizzo\nL\u2019app fornisce consigli di riparazione basati sull\u2019IA. I risultati servono solo come orientamento e non sostituiscono un controllo professionale.\n\n2. Responsabilità\nFIXORA non è responsabile dei danni derivanti dal seguire le guide. Lavora sempre in sicurezza e rivolgiti a un professionista in caso di dubbi.\n\n3. Modifiche\nPossiamo modificare questi termini in qualsiasi momento. I termini aggiornati si applicano dalla pubblicazione nell\u2019app.',
  privacyBody:
    'La tua privacy conta.\n\n1. Dati salvati\nFoto, registrazioni audio e descrizioni caricate per l\u2019analisi vengono elaborate e conservate il minimo necessario. La cronologia delle analisi resta locale sul tuo dispositivo.\n\n2. Utilizzo\nI tuoi dati sono usati solo per gestire la tua richiesta di riparazione.\n\n3. Contatto\nDomande sulla privacy: contattaci tramite le informazioni disponibili sull\u2019App Store.',

  howItWorks: 'Come funziona',
  how1: 'Scatta una foto',
  how2: 'Descrivi brevemente il problema',
  how3: 'Ricevi la guida passo passo',
  tryDemo: 'Prova con un esempio',
  demoTitle: 'Guarda la tua prima analisi in 10 secondi',
  demoDesc:
    'Il rubinetto della mia cucina perde. L\u2019acqua fuoriesce dal tubo sotto il lavello e fa rumore quando lo apro. Come posso ripararlo?',
  suggestCategory: 'Categoria suggerita',
  useSuggestion: 'Usa il suggerimento',
  stepsDone: 'Tutti i passaggi completati! 🎉',
  shareResult: 'Condividi il risultato',
  rateAsk: 'Come trovi FIXORA?',
  rateThanks: 'Grazie per il tuo feedback!',
  rateNow: 'Valutaci nello store',
  rateLater: 'Più tardi',
  saveEstimate: 'Risparmio stimato',
  savedTotal: 'Risparmio totale stimato',
  retry: 'Riprova',
  retryDesc: 'Connessione persa, risposta incompleta.',

  proTitle: 'FIXORA Pro',
  proSub: 'Analisi illimitate e supporto prioritario',
  proFeature1: 'Analisi illimitate al mese',
  proFeature2: 'Guide video passo passo',
  proFeature3: 'Tempi di risposta prioritari',
  proFeature4: 'Elenchi di ricambi e fornitori',
  proEnable: 'Attiva Pro (test)',
  proNotNow: 'Non ora',
  proNotify: 'Avvisami al lancio di Pro',
  proThanks: 'Grazie, ti avviseremo!',
  proActive: 'Pro attivo ✓',
  stepWhyLabel: 'Perché',
  stepToolsLabel: 'Strumenti necessari',
  stepExpectedLabel: 'Risultato atteso',
  stepIfNotLabel: 'Se non fosse come previsto',
  stepSafetyLabel: 'Sicurezza',
  stepDifficultyLabel: 'Difficoltà',
  stepDurationLabel: 'Durata',
  confidenceHigh: 'Alta',
  confidenceMedium: 'Media',
  confidenceLow: 'Bassa',
  safetyFirstLabel: 'Prima la sicurezza',
};

const en: Dict = {
  appName: 'FIXORA',
  tagline: 'Your AI home-repair assistant',
  subtitle:
    'Take a photo, speak, or describe the problem — FIXORA analyzes it and guides you step by step.',
  settings: 'Settings',
  language: 'Language',
  aiModel: 'AI model',
  close: 'Close',
  takePhotoVideo: 'Take photo / video',
  pickMedia: 'Pick from gallery',
  recordVoice: 'Record voice message',
  stopRecording: 'Stop recording',
  describeProblem: 'Describe the problem',
  describePlaceholder: 'e.g. water is dripping under the sink.',
  selectedMedia: 'Selected file',
  noMedia: 'No file selected yet',
  uploadTitle: 'Add a Photo or Video',
  uploadDesc: 'Take a photo or pick from your gallery',
  photoSourceTitle: 'Select Photo Source',
  addMore: 'Add More',
  mediaRequired: 'Please add a photo or video',
  descriptionRequired: 'Please describe the problem',
  analyze: 'Analyze problem',
  analyzing: 'Analyzing… this may take a moment',
  resultTitle: 'Analysis result',
  riskLabel: 'Risk',
  analysisCompleteTitle: 'AI Analysis Complete',
  analysisCompleteSub: 'AI analysis complete. Please check the details below.',
  answerQuestions: 'Please also answer the questions below',
  yourInput: 'Your input',
  costDiy: 'DIY',
  costPro: 'Professional Repair',
  costSave: 'You Save',
  costNote: 'Indicative values – local prices may vary.',
  costEco: 'Eco-friendly repair reduces waste.',
  yourPhoto: 'Your Photo',
  problemSummary: 'Problem Summary',
  markComplete: 'Mark as completed',
  completed: 'Completed',
  back: 'Back',
  newAnalysis: 'New analysis',
  selfRepair: 'Can you do this repair yourself?',
  selfRepairHint: 'Judge honestly — FIXORA helps you based on your answer.',
  yesIcan: 'Yes, I can',
  yesIcanHint: 'materials and equipment list',
  noIcant: 'No, I cannot',
  noIcantHint: 'company and craftsman contacts',
  diyPath: 'Great! You can try it yourself. We found materials and suppliers for you.',
  canRepair: 'Find materials & suppliers near me',
  proPath: 'No problem. We recommend local professionals for a safe repair.',
  findPro: 'Find local professionals',
  findProfessional: 'Find a professional near me',
  findProfessionalSoon: '(Coming soon)',
  errorTitle: 'Something went wrong',
  errorCheckNetwork: 'Please check your connection and try again.',
  errorNoApiKey: 'No valid Gemini API key configured. Set one in src/auth/config.ts.',
  errorQuota: 'The free provider quota is temporarily exhausted. Please try again in a moment.',
  permissionCamera: 'Camera permission required',
  permissionMedia: 'Media access required',
  permissionMic: 'Microphone permission required',
  permissionDesc: 'Please allow access in settings so FIXORA can analyze your problem.',
  recordingHint: 'Describe the problem aloud, e.g. "The tap is leaking".',
  copied: 'Copied to clipboard',
  noApiKeyWarning: 'No Gemini API key configured. Add one in src/auth/config.ts.',
  orTypeOwn: 'Or type your own answer below …',
  locTitle: 'Local options',
  locAsk: 'FIXORA needs your location to find nearby hardware stores and repair professionals. Would you like to share your location?',
  locShare: 'Share location',
  locGeneral: 'General search',
  locVerify: 'Your location was detected as "{{place}}". Is this correct?',
  locCorrect: 'Yes, I\'m here',
  locWrong: 'No, general search',
  cancel: 'Cancel',

  langSelectTitle: 'Choose your language',
  langSelectSubtitle:
    'The app will run in the language you select. You can change it later in settings.',

  onbSkip: 'Skip',
  onbNext: 'Continue',
  onbStart: 'Start',
  onb1A: 'Be your own',
  onb1B: 'repair expert.',
  onb1Desc: 'Something broken? Just take a photo and add a short note if you like.',
  onb2A: 'Solve it yourself.',
  onb2B: 'Save money instantly.',
  onb2Desc: 'Enjoy the satisfaction of saving time and money.',
  onb3A: 'Fix anything.',
  onb3B: 'Even your car.',
  onb3Desc: 'From engine troubles to everyday repairs — AI help in seconds.',
  onb4A: 'Great!',
  onb4B: 'Let\'s begin.',
  onb4Desc: 'FIXORA guides you step by step through your repair.',

  chooseCategory: 'Choose the category',
  chooseSubcategory: 'Choose the subcategory',
  catAppliances: 'Home appliances',
  catElectronics: 'Electronics',
  catPlumbing: 'Plumbing',
  catCar: 'Cars & vehicles',
  catFurniture: 'Furniture',
  catOther: 'Other',
  subDishwasher: 'Dishwasher',
  subWashingMachine: 'Washing machine',
  subRefrigerator: 'Refrigerator',
  subDryer: 'Dryer',
  subMicrowaveOven: 'Microwave oven',
  subOvenStove: 'Oven / Stove',
  subTelevision: 'Television',
  subAcUnit: 'AC unit',
  subSmartphone: 'Smartphone',
  subSmartwatch: 'Smartwatch',
  subHeadphones: 'Headphones',
  subLaptop: 'Laptop',
  subDesktop: 'Desktop PC',
  subRouter: 'Router / Modem',
  subCamera: 'Camera',
  subLeakingPipes: 'Leaking pipes',
  subDrainClogs: 'Drain clogs',
  subFaucet: 'Faucet',
  subToilet: 'Toilet',
  subSink: 'Sink',
  subShower: 'Shower / Tubs',
  subWaterPressure: 'Water pressure',
  subPipes: 'Pipes',
  subEngine: 'Engine',
  subBody: 'Body',
  subTire: 'Tire',
  subDriving: 'Driving issues',
  subInterior: 'Interior',
  subFuelCooling: 'Fuel & cooling',
  subElectrical: 'Electrical',
  subWarnings: 'Warnings',
  subChair: 'Chair',
  subSofa: 'Sofa / Couch',
  subWardrobe: 'Wardrobe / Closet',
  subTable: 'Table',
  subBed: 'Bed',
  subOthers: 'Others',

  navHome: 'Home',
  navHistory: 'History',
  historyTitle: 'Repair history',
  noRepairsYet: 'No repairs yet',
  historyHint: 'Your repairs will show up here and stay available anytime.',
  startFirstRepair: 'Start your first repair',
  delete: 'Delete',
  deleteConfirm: 'Delete record?',

  settingsShare: 'Share with Friends',
  settingsShareDesc: 'Recommend FIXORA to your friends',
  settingsTerms: 'Terms of Use',
  settingsTermsDesc: 'View the app terms',
  settingsPrivacy: 'Privacy Policy',
  settingsPrivacyDesc: 'See how we use your data',
  settingsConsent: 'Manage Consent',
  settingsConsentDesc: 'Review and update your privacy choices',
  shareMessage:
    'FIXORA – the AI-powered home repair assistant. Take a photo of your problem and get a step-by-step guide: {url}',
  shareFailed: 'Sharing not available',
  termsTitle: 'Terms of Use',
  privacyTitle: 'Privacy Policy',
  consentTitle: 'Manage Consent',
  consentExplain:
    'FIXORA only uses data you explicitly consent to. Manage your preferences below.',
  consentAnalytics: 'Anonymous analytics data',
  consentAnalyticsDesc: 'Anonymous usage statistics that help us improve the app.',
  consentPersonalization: 'Personalized recommendations',
  consentPersonalizationDesc: 'Repair suggestions tailored to your history.',
  consentSaved: 'Your preferences have been saved.',
  consentReset: 'Reset to defaults',
  termsBody:
    'Welcome to FIXORA.\n\n1. Usage\nThe app provides AI-powered repair guidance. Results are for orientation only and do not replace a professional inspection.\n\n2. Liability\nFIXORA is not liable for damage resulting from following the guides. Always work safely and consult a professional when unsure.\n\n3. Changes\nWe may update these terms at any time. Updated terms apply once published in the app.',
  privacyBody:
    'Your privacy matters.\n\n1. Data stored\nPhotos, audio recordings and descriptions uploaded for analysis are processed and kept for no longer than necessary. Your analysis history stays local on your device.\n\n2. Use\nYour data is used solely to handle your repair request.\n\n3. Contact\nPrivacy questions: contact us through the details available on the App Store.',

  howItWorks: 'How it works',
  how1: 'Take a photo',
  how2: 'Describe the problem briefly',
  how3: 'Get a step-by-step guide',
  tryDemo: 'Try with an example',
  demoTitle: 'See your first analysis in 10 seconds',
  demoDesc:
    'My kitchen faucet is dripping. Water leaks from the pipe under the sink and it makes a noise when turned on. How can I fix it?',
  suggestCategory: 'Suggested category',
  useSuggestion: 'Use suggestion',
  stepsDone: 'All steps done! 🎉',
  shareResult: 'Share result',
  rateAsk: 'How do you like FIXORA?',
  rateThanks: 'Thanks for your feedback!',
  rateNow: 'Rate us in the store',
  rateLater: 'Later',
  saveEstimate: 'Estimated savings',
  savedTotal: 'Total estimated savings',
  retry: 'Retry',
  retryDesc: 'Connection lost, the answer was cut off.',

  proTitle: 'FIXORA Pro',
  proSub: 'Unlimited analyses and priority support',
  proFeature1: 'Unlimited analyses per month',
  proFeature2: 'Step-by-step video guides',
  proFeature3: 'Priority response time',
  proFeature4: 'Parts and supplier lists',
  proEnable: 'Enable Pro (test)',
  proNotNow: 'Not now',
  proNotify: 'Notify me when Pro launches',
  proThanks: 'Thanks, we\'ll be in touch!',
  proActive: 'Pro active ✓',
  stepWhyLabel: 'Why',
  stepToolsLabel: 'Tools needed',
  stepExpectedLabel: 'Expected result',
  stepIfNotLabel: 'If not as expected',
  stepSafetyLabel: 'Safety',
  stepDifficultyLabel: 'Difficulty',
  stepDurationLabel: 'Duration',
  confidenceHigh: 'High',
  confidenceMedium: 'Medium',
  confidenceLow: 'Low',
  safetyFirstLabel: 'Safety first',
};

const tr: Dict = {
  appName: 'FIXORA',
  tagline: 'Yapay zeka destekli ev tamiri asistanınız',
  subtitle:
    'Sorunu fotoğraflayın, anlatın ya da sesle bildirin — FIXORA analiz eder ve sizi adım adım yönlendirir.',
  settings: 'Ayarlar',
  language: 'Dil',
  aiModel: 'Yapay zeka modeli',
  close: 'Kapat',
  takePhotoVideo: 'Fotoğraf / video çek',
  pickMedia: 'Galeriden seç',
  recordVoice: 'Sesli mesaj kaydet',
  stopRecording: 'Kaydı durdur',
  describeProblem: 'Sorunu açıklayın',
  describePlaceholder: 'örn. lavabonun altından su damlıyor.',
  selectedMedia: 'Seçilen dosya',
  noMedia: 'Henüz dosya seçilmedi',
  uploadTitle: 'Fotoğraf veya video ekle',
  uploadDesc: 'Fotoğraf çek veya galerinden seç',
  photoSourceTitle: 'Fotoğraf kaynağı seç',
  addMore: 'Daha ekle',
  mediaRequired: 'Lütfen bir fotoğraf veya video ekleyin',
  descriptionRequired: 'Lütfen sorunu açıklayın',
  analyze: 'Sorunu analiz et',
  analyzing: 'Analiz sürüyor… biraz zaman alabilir',
  resultTitle: 'Analiz sonucu',
  riskLabel: 'Risk',
  analysisCompleteTitle: 'AI Analizi Tamamlandı',
  analysisCompleteSub: 'Yapay zeka analizi tamamladı. Aşağıdaki ayrıntıları kontrol edin.',
  answerQuestions: 'Lütfen aşağıdaki soruları da cevaplayın',
  yourInput: 'Girdiniz',
  costDiy: 'Kendin Yaparsan',
  costPro: 'Profesyonel Tamir',
  costSave: 'Tasarrufunuz',
  costNote: 'Tahmini değerler – yerel fiyatlar değişebilir.',
  costEco: 'Çevre dostu onarım atık miktarını azaltır.',
  yourPhoto: 'Fotoğrafınız',
  problemSummary: 'Sorun Özeti',
  markComplete: 'Tamamlandı olarak işaretle',
  completed: 'Tamamlandı',
  back: 'Geri',
  newAnalysis: 'Yeni analiz',
  selfRepair: 'Bu tamiri kendin yapabilir misin?',
  selfRepairHint: 'Dürüstçe değerlendirin — FIXORA cevabınıza göre size yardım eder.',
  yesIcan: 'Evet, yapabilirim',
  yesIcanHint: 'malzeme ve ekipman listesi',
  noIcant: 'Hayır, yapamam',
  noIcantHint: 'firma ve usta iletişim bilgileri',
  diyPath: 'Harika! Kendi başına deneyebilirsin. Sana yakın malzeme ve tedarikçiler hazır.',
  canRepair: 'Yakınımdaki malzeme ve tedarikçileri bul',
  proPath: 'Sorun değil. Doğru bir onarım için sana yakın profesyoneller öneriyoruz.',
  findPro: 'Yakınımdaki profesyonelleri bul',
  findProfessional: 'Yakınımda bir profesyonel bul',
  findProfessionalSoon: '(Yakında)',
  errorTitle: 'Bir şeyler ters gitti',
  errorCheckNetwork: 'Lütfen bağlantını kontrol et ve tekrar dene.',
  errorNoApiKey:
    'Geçerli bir Gemini API anahtarı yapılandırılmamış. src/auth/config.ts içine anahtar ekleyin.',
  errorQuota: 'Sağlayıcının ücretsiz kotası geçici dolu. Biraz sonra tekrar deneyin.',
  permissionCamera: 'Kamera izni gerekli',
  permissionMedia: 'Medya erişimi gerekli',
  permissionMic: 'Mikrofon izni gerekli',
  permissionDesc: 'FIXORA sorunu analiz edebilmesi için ayarlardan erişim izni verin.',
  recordingHint: 'Sorunu sesli tarif edin, örn. "Musluk damlıyor".',
  copied: 'Panoya kopyalandı',
  noApiKeyWarning:
    'Gemini anahtarı yapılandırılmamış. Analiz için src/auth/config.ts içine ekleyin.',
  orTypeOwn: 'Veya aşağıya kendi cevabınızı yazın …',
  locTitle: 'Yerel seçenekler',
  locAsk: 'FIXORA yakındaki yapı marketleri ve ustaları bulmak için konumunuza ihtiyaç duyuyor. Konumunuzu paylaşmak ister misiniz?',
  locShare: 'Konumu paylaş',
  locGeneral: 'Genel arama',
  locVerify: 'Konumunuz "{{place}}" olarak tespit edildi. Doğru mu?',
  locCorrect: 'Evet, burası',
  locWrong: 'Hayır, genel arama',
  cancel: 'İptal',

  langSelectTitle: 'Dilini seç',
  langSelectSubtitle: 'Uygulama seçtiğin dilde çalışır. Daha sonra ayarlardan değiştirebilirsin.',

  onbSkip: 'Atla',
  onbNext: 'Devam',
  onbStart: 'Başla',
  onb1A: 'Kendi',
  onb1B: 'tamir uzmanın ol.',
  onb1Desc: 'Bir şey kırık mı? Sadece fotoğrafını çek, istersen kısa bir not ekle.',
  onb2A: 'Kendin çöz,',
  onb2B: 'anında para biriktir.',
  onb2Desc: 'Zaman ve paradan tasarruf etmenin keyfini çıkar.',
  onb3A: 'Her şeyi onar,',
  onb3B: 'araban dahil.',
  onb3Desc: 'Motor sorunlarından günlük tamirlere — saniyeler içinde yapay zeka yardımı.',
  onb4A: 'Harika!',
  onb4B: 'Başlayalım.',
  onb4Desc: 'FIXORA seni onarımında adım adım yönlendirir.',

  chooseCategory: 'Kategori seçin',
  chooseSubcategory: 'Alt kategori seçin',
  catAppliances: 'Ev aletleri',
  catElectronics: 'Elektronik',
  catPlumbing: 'Sıhhi tesisat',
  catCar: 'Araba & araç',
  catFurniture: 'Mobilya',
  catOther: 'Diğer',
  subDishwasher: 'Bulaşık makinesi',
  subWashingMachine: 'Çamaşır makinesi',
  subRefrigerator: 'Buzdolabı',
  subDryer: 'Kurutucu',
  subMicrowaveOven: 'Mikrodalga',
  subOvenStove: 'Fırın / Ocak',
  subTelevision: 'Televizyon',
  subAcUnit: 'Klima',
  subSmartphone: 'Akıllı telefon',
  subSmartwatch: 'Akıllı saat',
  subHeadphones: 'Kulaklık',
  subLaptop: 'Laptop',
  subDesktop: 'Masaüstü PC',
  subRouter: 'Modem / Router',
  subCamera: 'Kamera',
  subLeakingPipes: 'Su kaçağı',
  subDrainClogs: 'Tıkanan gider',
  subFaucet: 'Musluk',
  subToilet: 'Tuvalet',
  subSink: 'Lavabo',
  subShower: 'Duş / Küvet',
  subWaterPressure: 'Su basıncı',
  subPipes: 'Borular',
  subEngine: 'Motor',
  subBody: 'Gövde',
  subTire: 'Lastik',
  subDriving: 'Sürüş sorunları',
  subInterior: 'İç mekan',
  subFuelCooling: 'Yakıt & soğutma',
  subElectrical: 'Elektrik',
  subWarnings: 'Uyarılar',
  subChair: 'Sandalye',
  subSofa: 'Koltuk / Kanepe',
  subWardrobe: 'Gardırop / Dolap',
  subTable: 'Masa',
  subBed: 'Yatak',
  subOthers: 'Diğer',

  navHome: 'Ana Sayfa',
  navHistory: 'Geçmiş',
  historyTitle: 'Tamir geçmişi',
  noRepairsYet: 'Henüz tamir yok',
  historyHint: 'Yaptığın tamirler burada görünecek ve istediğin zaman açılabilir.',
  startFirstRepair: 'İlk tamirini başlat',
  delete: 'Sil',
  deleteConfirm: 'Kaydı sil?',

  settingsShare: 'Arkadaşlarınla paylaş',
  settingsShareDesc: 'FIXORA\'yı arkadaşlarına öner',
  settingsTerms: 'Kullanım Şartları',
  settingsTermsDesc: 'Uygulama kullanım şartlarını görüntüle',
  settingsPrivacy: 'Gizlilik Politikası',
  settingsPrivacyDesc: 'Verilerinizin nasıl kullanıldığını öğrenin',
  settingsConsent: 'Onayı Yönet',
  settingsConsentDesc: 'Gizlilik tercihlerinizi inceleyin ve güncelleyin',
  shareMessage:
    'FIXORA — yapay zeka destekli ev tamiri asistanı. Sorununuzun fotoğrafını çekin ve adım adım rehber alın: {url}',
  shareFailed: 'Paylaşım yapılamadı',
  termsTitle: 'Kullanım Şartları',
  privacyTitle: 'Gizlilik Politikası',
  consentTitle: 'Onayı Yönet',
  consentExplain:
    'FIXORA yalnızca açıkça onay verdiğiniz verileri kullanır. Tercihlerinizi aşağıdan yönetin.',
  consentAnalytics: 'Anonim analitik veriler',
  consentAnalyticsDesc: 'Uygulamayı geliştirmemize yardımcı olan anonim kullanım istatistikleri.',
  consentPersonalization: 'Kişiselleştirilmiş öneriler',
  consentPersonalizationDesc: 'Geçmişinize göre uyarlanmış tamir önerileri.',
  consentSaved: 'Tercihleriniz kaydedildi.',
  consentReset: 'Varsayılanlara sıfırla',
  termsBody:
    'FIXORA\'ya hoş geldiniz.\n\n1. Kullanım\nUygulama yapay zeka destekli tamir rehberi sunar. Sonuçlar yalnızca yol göstericidir ve profesyonel bir incelemenin yerini tutmaz.\n\n2. Sorumluluk\nFIXORA, rehberlerin takip edilmesinden kaynaklanan hasarlardan sorumlu değildir. Her zaman güvenli çalışın ve emin olmadığınızda bir uzmana danışın.\n\n3. Değişiklikler\nBu şartları istediğimiz zaman güncelleyebiliriz. Güncellenen şartlar, uygulamada yayınlandığı anda geçerli olur.',
  privacyBody:
    'Gizliliğiniz bizim için önemlidir.\n\n1. Saklanan veriler\nAnaliz için yüklenen fotoğraflar, ses kayıtları ve açıklamalar işlenir ve gereğinden uzun süre saklanmaz. Analiz geçmişiniz cihazınızda yerel olarak kalır.\n\n2. Kullanım\nVerileriniz yalnızca tamir talebinizi işlemek için kullanılır.\n\n3. İletişim\nGizlilik sorularınız için App Store\'da belirtilen bilgiler üzerinden bize ulaşın.',

  howItWorks: 'Nasıl çalışır',
  how1: 'Fotoğrafını çek',
  how2: 'Sorunu kısaca anlat',
  how3: 'Adım adım çözümü al',
  tryDemo: 'Örnekle dene',
  demoTitle: 'İlk analizini 10 saniyede gör',
  demoDesc:
    'Mutfağımdaki musluk damlıyor. Lavabonun altındaki borudan su sızıyor ve açtığımda ses geliyor. Nasıl tamir edebilirim?',
  suggestCategory: 'Kategori önerisi',
  useSuggestion: 'Öneriyi uygula',
  stepsDone: 'Tüm adımlar tamamlandı! 🎉',
  shareResult: 'Sonucu paylaş',
  rateAsk: 'FIXORA\'yı nasıl buldun?',
  rateThanks: 'Geri bildirimin için teşekkürler!',
  rateNow: 'Mağazada değerlendir',
  rateLater: 'Daha sonra',
  saveEstimate: 'Tahmini tasarruf',
  savedTotal: 'Toplam tahmini tasarruf',
  retry: 'Tekrar dene',
  retryDesc: 'Bağlantı koptu, cevap yarım geldi.',

  proTitle: 'FIXORA Pro',
  proSub: 'Sınırsız analiz ve öncelikli destek',
  proFeature1: 'Ayda sınırsız analiz',
  proFeature2: 'Adım adım video rehberler',
  proFeature3: 'Öncelikli cevap süresi',
  proFeature4: 'Parça ve tedarikçi listeleri',
  proEnable: 'Pro\'yu etkinleştir (test)',
  proNotNow: 'Şimdilik hayır',
  proNotify: 'Pro çıkınca haber ver',
  proThanks: 'Teşekkürler, haber vereceğiz!',
  proActive: 'Pro aktif ✓',
  stepWhyLabel: 'Neden',
  stepToolsLabel: 'Gereken Aletler',
  stepExpectedLabel: 'Beklenen Sonuç',
  stepIfNotLabel: 'Beklenen Değilse',
  stepSafetyLabel: 'Güvenlik',
  stepDifficultyLabel: 'Zorluk',
  stepDurationLabel: 'Süre',
  confidenceHigh: 'Yüksek',
  confidenceMedium: 'Orta',
  confidenceLow: 'Düşük',
  safetyFirstLabel: 'Önce güvenlik',
};

export const translations: Record<Language, Dict> = { de, fr, it, en, tr };
