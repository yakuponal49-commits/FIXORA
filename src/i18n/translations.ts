export const SUPPORTED_LANGUAGES = ['en', 'de', 'fr'] as const;
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
  addPhotoTitle: string;
  addPhotoDesc: string;
  addPhotoCamera: string;
  addPhotoGallery: string;
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
  back: string;
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
  diyFindAsk: string;
  proFindAsk: string;
  materialsListTitle: string;
  errorTitle: string;
  errorCheckNetwork: string;
  errorEmptyResult: string;
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
  onb1Title: string;
  onb1Desc: string;
  onb2Title: string;
  onb2Desc: string;
  onb3Title: string;
  onb3Desc: string;

  // Kategoriler
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

  // Ayarlar Banner
  settingsBannerTitle: string;
  settingsBannerDesc: string;
  settingsBannerBtn: string;
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
  cameraRetry: string;
  cameraOk: string;

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

  // Pro Modal / Promo
  promoTitle: string;
  promoUnlimitedDaily: string;
  promoPhotoVideoText: string;
  promoFastAnalysis: string;
  promoDetailedGuides: string;
  promoPricingMonthly: string;
  promoPricingYearly: string;
  promoBestValue: string;
  promoCodeLabel: string;
  promoCodeButton: string;
  promoHaveCode: string;
  promoCodeChecking: string;
  promoBuyButton: string;
  promoTerms: string;
  promoEnterCode: string;
  promoInvalidCode: string;
  promoLimitReached: string;
  promoNetworkError: string;
  promoSuccess: string;
  successTitle: string;

  // Crop Screen
  cropTitle: string;
  cropRotate: string;
  cropAspect: string;
  cropReset: string;
  cropContinue: string;

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

  // AI soru-cevap butonu
  qnaCta: string;

  // Gunluk analiz hakki
  dailyRemaining: string;
  dailyLimitReached: string;
  dailyLimitTitle: string;
  dailyLimitDesc: string;
  goPro: string;
}

const de: Dict = {
  appName: 'FIXORA',
  tagline: 'Ihr Hausreparatur-Assistent mit KI',
  subtitle:
    'Machen Sie ein Foto und beschreiben Sie das Problem. FIXORA analysiert es und gibt Ihnen eine Schritt-für-Schritt-Anleitung.',
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
  addPhotoTitle: 'Foto hinzufügen',
  addPhotoDesc: 'Machen Sie ein Foto oder wählen Sie eines aus Ihrer Galerie aus',
  addPhotoCamera: 'Foto aufnehmen',
  addPhotoGallery: 'Aus Galerie wählen',
  addMore: 'Hinzufügen',
  mediaRequired: 'Bitte füge ein Foto hinzu',
  descriptionRequired: 'Bitte beschreibe das Problem',
  analyze: 'PROBLEM ANALYSIEREN',
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
  back: 'Zurück',
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
  diyFindAsk: 'Soll ich einen Laden in Ihrer Nähe finden, wo Sie diese Materialien und Werkzeuge kaufen können?',
  proFindAsk: 'Soll ich eine Firma oder einen Handwerker in Ihrer Nähe finden, der diese Reparatur durchführt?',
  materialsListTitle: 'Materialien & Werkzeuge',
  errorTitle: 'Etwas ist schiefgelaufen',
  errorCheckNetwork: 'Bitte prüfen Sie Ihre Verbindung und versuchen Sie es erneut.',
  errorEmptyResult: 'Der Assistent hat eine leere Antwort geliefert. Bitte versuchen Sie es erneut.',
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
  onb1Title: 'Lösen Sie Ihre Sanitärprobleme',
  onb1Desc:
    'Reparieren Sie Ihre gesamte Hausinstallation selbst – von tropfenden Armaturen bis zu Heizkörpern – mit Schritt-für-Schritt-Anleitungen.',
  onb2Title: 'Frischen Sie Ihr Zuhause auf',
  onb2Desc:
    'Verleihen Sie Ihrem Wohnraum mit Wandfarbe, Rissreparatur und Dekorationstechniken einen professionellen Touch.',
  onb3Title: 'Verleihen Sie Ihren Dingen neues Leben',
  onb3Desc:
    'Reparieren Sie alte Möbel oder beschädigte Holzgegenstände mit fachmännischer Präzision und sparen Sie Geld.',

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

  settingsBannerTitle: 'Intelligente Reparatur. Keine Rätselraten mehr.',
  settingsBannerDesc: 'Erhalten Sie unbegrenzte Fixes, schnellere Ergebnisse und detaillierte Schritt-für-Schritt-Anleitungen.',
  settingsBannerBtn: 'JETZT UPGRADEN',
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
    'Willkommen bei FIXORA.\n\n1. Annahme der Bedingungen\nDurch Herunterladen, Installieren oder Nutzung von FIXORA ("die App") stimmen Sie diesen Nutzungsbedingungen zu. Wenn Sie nicht einverstanden sind, beenden Sie bitte sofort die Nutzung.\n\n2. Über FIXORA\nFIXORA ist ein KI-gestützter Reparaturassistent für zu Hause. Sie können ein Problem fotografieren, es beschreiben und eine Schritt-für-Schritt-Reparaturanleitung erhalten, die von künstlicher Intelligenz generiert wird.\n\n3. Nutzungsberechtigung\nSie müssen mindestens 13 Jahre alt sein, um FIXORA zu nutzen. Wenn Sie unter 18 Jahren alt sind, benötigen Sie die Einwilligung eines Erziehungsberechtigten.\n\n4. KI-generierte Inhalte\nFIXORA nutzt künstliche Intelligenz zur Erstellung von Reparaturvorschlägen und Anleitungen. KI-generierte Inhalte dienen ausschließlich zu Informationszwecken und ersetzen keine professionelle Prüfung oder Beratung. Konsultieren Sie bei Unsicherheit immer einen qualifizierten Fachmann. FIXORA garantiert nicht die Richtigkeit oder Vollständigkeit der KI-generierten Ergebnisse.\n\n5. Benutzereingaben\nSie können Fotos und Textbeschreibungen in die App hochladen. Sie sind allein verantwortlich für den Inhalt, den Sie einreichen. FIXORA überwacht Ihre Eingaben nicht aktiv, behält sich aber das Recht vor, Inhalte zu entfernen, die gegen diese Bedingungen verstoßen.\n\n6. Abonnements\nBestimmte Funktionen erfordern ein kostenpflichtiges Abonnement. Abonnements verlängern sich automatisch, sofern sie nicht mindestens 24 Stunden vor Ende des aktuellen Zeitraums gekündigt werden. Alle Abrechnungen, Kündigungen und Erstattungen werden über den jeweiligen App-Store (Google Play oder Apple App Store) abgewickelt. FIXORA erstattet nicht direkt.\n\n7. geistiges Eigentum\nAlle Inhalte, Funktionen und Funktionen von FIXORA sind ausschließliches Eigentum von FIXORA und durch geltende Urheberrechtsgesetze geschützt.\n\n8. Datenschutz\nIhre Nutzung von unterliegt auch unserer Datenschutzerklärung, die in diesen Bedingungen durch Verweis einbezogen ist.\n\n9. Gewährleistungsausschluss\nFIXORA wird "wie besehen" und "wie verfügbar" ohne jegliche Garantien bereitgestellt. FIXORA garantiert nicht, dass die App unterbrechungsfehlerfrei sein wird.\n\n10. Haftungsbeschränkung\nIm gesetzlich zulässigen Umfang haftet FIXORA nicht für indirekte, zufällige oder Folgeschäden, die sich aus Ihrer Nutzung der App ergeben.\n\n11. Änderungen der Bedingungen\nWir behalten uns das Recht vor, diese Bedingungen jederzeit zu ändern. Die weitere Nutzung von FIXORA nach Änderungen stellt Ihre Annahme der neuen Bedingungen dar.\n\n12. Kontakt\nBei Fragen zu diesen Bedingungen kontaktieren Sie uns bitte über den App-Store-Eintrag.',
  privacyBody:
    'Datenschutz ist uns wichtig.\n\n1. Gespeicherte Daten\nFIXORA verarbeitet Fotos, Beschreibungen und andere Eingaben, die Sie zur Erstellung einer KI-gestützten Reparatanalyse einreichen. Diese Eingaben werden ausschließlich an Drittanbieter-KI-Dienste übertragen, um die angeforderte Ausgabe zu erstellen, und werden nicht auf FIXORA-Servern gespeichert. Ihre Analysehistorie bleibt lokal auf Ihrem Gerät.\n\n2. KI-Verarbeitung\nWenn Sie ein Foto oder eine Beschreibung einreichen, werden die Daten sicher an einen KI-Dienstanbieter (z.B. Google Gemini) übertragen, um Reparaturvorschläge zu erstellen. FIXORA verkauft Ihre Daten nicht und gibt sie nicht für Werbezwecke weiter. Der KI-Anbieter verarbeitet die Daten ausschließlich zur Rückgabe der angeforderten Analyse.\n\n3. Technische Daten\nFIXORA kann anonymisierte technische Daten (Gerätetyp, Betriebssystemversion, App-Nutzungsstatistiken) über Drittanbieter-Analysedienste sammeln, um die App zu verbessern. Diese Daten können nicht zur persönlichen Identifizierung verwendet werden.\n\n4. Nutzung Ihrer Daten\nIhre Daten werden ausschließlich zur Bearbeitung Ihrer Reparaturanfrage und zur Verbesserung des FIXORA-Erlebnisses verwendet.\n\n5. Datenspeicherung\nWir speichern Ihre Fotos oder Beschreibungen nicht auf unseren Servern. Die Analysehistorie wird lokal auf Ihrem Gerät gespeichert und kann jederzeit gelöscht werden.\n\n6. Drittanbieter-Dienste\nFIXORA nutzt Drittanbieter-Dienste (KI-Anbieter, Analysedienste), die Informationen sammeln können. Diese Dienste haben eigene Datenschutzrichtlinien. Wir empfehlen Ihnen, diese zu überprüfen.\n\n7. Datenschutz für Kinder\nFIXORA ist für Nutzer ab 13 Jahren bestimmt. Wir sammeln wissentlich keine persönlichen Daten von Kindern unter 13 Jahren.\n\n8. Sicherheit\nWir verwenden kommerziell angemessene Maßnahmen zum Schutz Ihrer Daten. Dennoch ist keine Übertragungs- oder Speichermethode vollständig sicher.\n\n9. Änderungen dieser Richtlinie\nWir können diese Datenschutzerklärung von Zeit zu Zeit aktualisieren. Über wesentliche Änderungen informieren wir Sie über die App.\n\n10. Kontakt\nDatenschutzfragen: Kontaktieren Sie uns über die Kontaktdaten im App-Store-Eintrag.',

  howItWorks: 'So funktioniert es',
  how1: 'Foto aufnehmen',
  how2: 'Problem kurz beschreiben',
  how3: 'Schritt-für-Schritt-Lösung erhalten',
  tryDemo: 'Mit Beispiel testen',
  demoTitle: 'Sieh deine erste Analyse in 10 Sekunden',
  demoDesc:
    'Mein Küchenhahn tropft. Unter dem Spülbecken tritt Wasser aus und beim Öffnen ist ein Geräusch zu hören. Wie kann ich das reparieren?',
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
  cameraRetry: 'Erneut versuchen',
  cameraOk: 'OK',

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
  
  // Pro Modal
  promoTitle: 'FIXORA PRO',
  promoUnlimitedDaily: 'Unbegrenzte tägliche Analyse',
  promoPhotoVideoText: 'Foto, Video & Text',
  promoFastAnalysis: 'Schnelle und detaillierte Reparaturanalyse',
  promoDetailedGuides: 'Detaillierte Lösungsanleitungen',
  promoPricingMonthly: '1 Monat',
  promoPricingYearly: '1 Jahr',
  promoBestValue: 'BESTER WERT',
  promoCodeLabel: 'Promo-Code eingeben',
  promoCodeButton: 'Code überprüfen',
  promoHaveCode: 'Promo-Code vorhanden?',
  promoCodeChecking: 'Wird überprüft...',
  promoBuyButton: '💳 Mit Google Play zahlen',
  promoTerms: 'Das Abonnement wird automatisch verlängert. Jederzeit kündbar.',
  promoEnterCode: 'Bitte geben Sie einen Code ein',
  promoInvalidCode: 'Ungültiger Code',
  promoLimitReached: 'Dieser Code hat sein Nutzungslimit erreicht.',
  promoNetworkError: 'Backend-Verbindungsfehler. Bitte erneut versuchen.',
  promoSuccess: 'Pro aktiviert! Unbegrenzte Analyse verfügbar.',
  successTitle: 'Erfolg',
  
  // Crop Screen
  cropTitle: 'Bild zuschneiden',
  cropRotate: 'Drehen',
  cropAspect: '1:1',
  cropReset: 'Zurücksetzen',
  cropContinue: 'Weiter',

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
  qnaCta: 'Konnte ich helfen? Falls nicht, können Sie mit der KI chatten — stellen Sie Ihre Fragen hier.',
  dailyRemaining: 'Verbleibende kostenlose Analysen heute',
  dailyLimitReached: 'Ihr tägliches kostenloses Limit ist aufgebraucht.',
  dailyLimitTitle: 'Limit erreicht',
  dailyLimitDesc: 'Sie haben Ihr tägliches kostenloses Analyse-Limit erreicht. Für weitere Analysen upgraden Sie auf PRO.',
  goPro: 'Zu PRO wechseln',
};

const fr: Dict = {
  appName: 'FIXORA',
  tagline: "Votre assistant de réparation à domicile à base d'IA",
  subtitle:
    "Prenez une photo et décrivez le problème. FIXORA l'analyse et vous guide pas à pas.",
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
  addPhotoTitle: 'Ajouter une photo',
  addPhotoDesc: 'Prenez une photo ou sélectionnez-en une dans votre galerie',
  addPhotoCamera: 'Prendre une photo',
  addPhotoGallery: 'Choisir dans la galerie',
  addMore: 'Ajouter',
  mediaRequired: 'Ajoute une photo',
  descriptionRequired: 'Décris le problème',
  analyze: 'ANALYSER LE PROBLÈME',
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
  back: 'Retour',
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
  diyFindAsk: 'Voulez-vous que je trouve un magasin près de chez vous pour acheter ces matériaux et équipements ?',
  proFindAsk: 'Voulez-vous que je trouve une entreprise ou un artisan près de chez vous pour effectuer cette réparation ?',
  materialsListTitle: 'Matériaux & équipement',
  errorTitle: "Quelque chose s'est mal passé",
  errorCheckNetwork: 'Veuillez vérifier votre connexion et réessayer.',
  errorEmptyResult: "L'assistant a renvoyé une réponse vide. Veuillez réessayer.",
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
  onb1Title: 'Résolvez vos problèmes de plomberie',
  onb1Desc:
    'Réparez vous-même toute votre plomberie, des robinets qui fuient aux radiateurs, grâce à des guides pas à pas.',
  onb2Title: 'Rénovez votre intérieur',
  onb2Desc:
    "Donnez une touche professionnelle à votre espace de vie grâce à la peinture murale, la réparation des fissures et les techniques de décoration.",
  onb3Title: 'Redonnez vie à vos objets',
  onb3Desc:
    "Réparez vos vieux meubles ou vos objets en bois endommagés avec une précision experte et économisez de l'argent.",

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

  settingsBannerTitle: 'Réparation intelligente. Fini les devinettes.',
  settingsBannerDesc: "Accédez à des corrections illimitées, des résultats plus rapides et des guides détaillés étape par étape.",
  settingsBannerBtn: 'PASSER À LA VERSION PRO',
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
    'Bienvenue sur FIXORA.\n\n1. Acceptation des conditions\nEn téléchargeant, installant ou utilisant FIXORA (\"l\'App\"), vous acceptez ces Conditions d\'utilisation. Si vous n\'êtes pas d\'accord, veuillez cesser immédiatement l\'utilisation.\n\n2. À propos de FIXORA\nFIXORA est un assistant de réparation à domicile assisté par IA. Vous pouvez photographier un problème, le décrire et recevoir un guide de réparation pas à pas généré par l\'intelligence artificielle.\n\n3. Éligibilité\nVous devez avoir au moins 13 ans pour utiliser FIXORA. Si vous avez moins de 18 ans, vous devez avoir le consentement d\'un parent ou tuteur.\n\n4. Contenus générés par l\'IA\nFIXORA utilise l\'intelligence artificielle pour générer des suggestions et des guides de réparation. Les contenus générés par l\'IA sont fournis à titre informatif uniquement et ne remplacent pas une inspection ou des conseils professionnels. Consultez toujours un professionnel qualifié en cas de doute. FIXORA ne garantit pas l\'exactitude ou l\'exhaustivité des résultats générés par l\'IA.\n\n5. Saisies utilisateur\nVous pouvez télécharger des photos et des descriptions textuelles dans l\'App. Vous êtes seul responsable du contenu que vous soumettez. FIXORA ne surveille pas activement vos saisies mais se réserve le droit de supprimer le contenu qui viole ces conditions.\n\n6. Abonnements\nCertaines fonctionnalités nécessitent un abonnement payant. Les abonnements se renouvellent automatiquement sauf annulation au moins 24 heures avant la fin de la période en cours. La facturation, les annulations et les remboursements sont gérés par la boutique d\'applications concernée (Google Play ou Apple App Store). FIXORA ne traite pas les remboursements directement.\n\n7. Propriété intellectuelle\nTous les contenus, fonctionnalités et caractéristiques de FIXORA sont la propriété exclusive de FIXORA et sont protégés par les lois sur la propriété intellectuelle applicables.\n\n8. Confidentialité\nVotre utilisation de FIXORA est également régie par notre Politique de confidentialité, qui est intégrée aux présentes conditions par référence.\n\n9. Exclusion de garanties\nFIXORA est fourni « en l\'état » et « disponible » sans aucune garantie de quelque nature que ce soit. FIXORA ne garantit pas que l\'App sera ininterrompue ou exempte d\'erreurs.\n\n10. Limitation de responsabilité\nDans la mesure permise par la loi, FIXORA ne sera pas responsable des dommages indirects, accessoires ou consécutifs découlant de votre utilisation de l\'App.\n\n11. Modifications des conditions\nNous nous réservons le droit de modifier ces conditions à tout moment. La poursuite de l\'utilisation de FIXORA après les modifications constitue votre acceptation des nouvelles conditions.\n\n12. Contact\nPour toute question concernant ces conditions, veuillez nous contacter via la fiche de l\'App Store.',
  privacyBody:
    'Ta vie privée compte.\n\n1. Données enregistrées\nFIXORA traite les photos, descriptions et autres saisies que tu soumets dans le but de générer une analyse de réparation assistée par IA. Ces données sont transmises uniquement à des prestataires IA tiers pour générer la réponse demandée et ne sont pas stockées sur les serveurs de FIXORA. Ton historique d\'analyse reste local sur ton appareil.\n\n2. Traitement par l\'IA\nLorsque tu soumets une photo ou une description, les données sont transmises de manière sécurisée à un prestataire de services IA (par ex. Google Gemini) pour générer des suggestions de réparation. FIXORA ne vend pas tes données et ne les divulgue pas à des fins publicitaires. Le prestataire IA traite les données uniquement pour retourner l\'analyse demandée.\n\n3. Données techniques\nFIXORA peut collecter des données techniques anonymisées (type d\'appareil, version du système d\'exploitation, statistiques d\'utilisation) via des services d\'analyse tiers pour améliorer l\'app. Ces données ne permettent pas de t\'identifier personnellement.\n\n4. Utilisation de tes données\nTes données sont utilisées uniquement pour traiter ta demande de réparation et améliorer l\'expérience FIXORA.\n\n5. Conservation des données\nNous ne conservons pas tes photos ou descriptions sur nos serveurs. L\'historique d\'analyse est stocké localement sur ton appareil et peut être supprimé à tout moment.\n\n6. Services tiers\nFIXORA utilise des services tiers (prestataires IA, analyse) qui peuvent collecter des informations. Ces services ont leurs propres politiques de confidentialité. Nous t\'invitons à les consulter.\n\n7. Confidentialité des enfants\nFIXORA est destiné aux utilisateurs de 13 ans et plus. Nous ne collectons pas sciemment d\'informations personnelles auprès des enfants de moins de 13 ans.\n\n8. Sécurité\nNous utilisons des mesures commercialement raisonnables pour protéger tes données. Cependant, aucune méthode de transmission ou de stockage n\'est totalement sécurisée.\n\n9. Modifications de cette politique\nNous pouvons mettre à jour cette Politique de confidentialité de temps à autre. Nous te notifierons des changements importants via l\'app.\n\n10. Contact\nQuestions sur la confidentialité : contacte-nous via les informations de l\'App Store.',

  howItWorks: 'Comment ça marche',
  how1: 'Prendre une photo',
  how2: 'Décrire brièvement le problème',
  how3: 'Recevoir un guide pas à pas',
  tryDemo: 'Essayer avec un exemple',
  demoTitle: 'Voyez votre première analyse en 10 secondes',
  demoDesc:
    'Mon robinet de cuisine fuit. De l\u2019eau s\u2019échappe du tuyau sous l\u2019évier et un bruit se fait entendre à l\u2019ouverture. Comment le réparer ?',
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
  cameraRetry: 'Réessayer',
  cameraOk: 'OK',

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
  
  // Pro Modal
  promoTitle: 'FIXORA PRO',
  promoUnlimitedDaily: 'Analyse illimitée quotidienne',
  promoPhotoVideoText: 'Photo, Vidéo & Texte',
  promoFastAnalysis: 'Analyse de réparation rapide et détaillée',
  promoDetailedGuides: 'Guides de solutions détaillés',
  promoPricingMonthly: '1 Mois',
  promoPricingYearly: '1 An',
  promoBestValue: 'MEILLEURE VALEUR',
  promoCodeLabel: 'Entrez le code promo',
  promoCodeButton: 'Vérifier le code',
  promoHaveCode: 'Vous avez un code promo ?',
  promoCodeChecking: 'Vérification en cours...',
  promoBuyButton: '💳 Payer avec Google Play',
  promoTerms: 'L\'abonnement se renouvelle automatiquement. Annulez à tout moment.',
  promoEnterCode: 'Veuillez entrer un code',
  promoInvalidCode: 'Code invalide',
  promoLimitReached: 'Ce code a atteint sa limite d\u2019utilisation.',
  promoNetworkError: 'Erreur de connexion au serveur. Veuillez réessayer.',
  promoSuccess: 'Pro activé ! Analyse illimitée disponible.',
  successTitle: 'Succès',
  
  // Crop Screen
  cropTitle: "Recadrer l'image",
  cropRotate: 'Pivoter',
  cropAspect: '1:1',
  cropReset: 'Réinitialiser',
  cropContinue: 'Continuer',

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
  qnaCta: "Ai-je pu vous aider ? Sinon, vous pouvez discuter avec l'IA — posez vos questions ici.",
  dailyRemaining: 'Analyses gratuites restantes aujourd\'hui',
  dailyLimitReached: 'Votre limite gratuite quotidienne est épuisée.',
  dailyLimitTitle: 'Limite atteinte',
  dailyLimitDesc: 'Vous avez atteint votre limite quotidienne d\'analyses gratuites. Pour plus d\'analyses, passez à PRO.',
  goPro: 'Passer à PRO',
};

const en: Dict = {
  appName: 'FIXORA',
  tagline: 'Your AI home-repair assistant',
  subtitle:
    'Take a photo and describe the problem. FIXORA analyzes it and guides you step by step.',
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
  addPhotoTitle: 'Add Photo',
  addPhotoDesc: 'Take a photo or select from your gallery',
  addPhotoCamera: 'Take Photo',
  addPhotoGallery: 'Select from Gallery',
  addMore: 'Add More',
  mediaRequired: 'Please add a photo',
  descriptionRequired: 'Please describe the problem',
  analyze: 'ANALYZE PROBLEM',
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
  back: 'Back',
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
  diyFindAsk: 'Do you want me to find a store near you where you can buy these materials and equipment?',
  proFindAsk: 'Do you want me to find a company or craftsman near you to do this repair?',
  materialsListTitle: 'Materials & Equipment',
  errorTitle: 'Something went wrong',
  errorCheckNetwork: 'Please check your connection and try again.',
  errorEmptyResult: 'The assistant returned an empty response. Please try again.',
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
  onb1Title: 'Fix Your Plumbing Issues',
  onb1Desc:
    'From dripping faucets to heating radiators, fix all of your home plumbing yourself with step-by-step guides.',
  onb2Title: 'Renovate Your Home',
  onb2Desc:
    'Give your living space a professional touch with wall painting, crack repair, and decoration techniques.',
  onb3Title: 'Bring Your Items Back to Life',
  onb3Desc:
    "Repair old furniture or broken wooden items with expert precision and save money.",

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
  settingsConsentDesc: 'Review and update privacy preferences',

  settingsBannerTitle: 'Smart Repair. No more guessing.',
  settingsBannerDesc: 'Access unlimited fixes, faster results, and detailed step-by-step guidance.',
  settingsBannerBtn: 'UPGRADE NOW',
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
    'Welcome to FIXORA.\n\n1. Acceptance of Terms\nBy downloading, installing, or using FIXORA ("the App"), you agree to be bound by these Terms of Service. If you do not agree, please discontinue use immediately.\n\n2. About FIXORA\nFIXORA is an AI-powered home repair assistant. You can photograph a problem, describe it, and receive step-by-step repair guidance generated by artificial intelligence.\n\n3. Eligibility\nYou must be at least 13 years of age to use FIXORA. If you are under 18, you must have parental or guardian consent.\n\n4. AI-Generated Content\nFIXORA uses artificial intelligence to generate repair suggestions and guides. AI-generated content is provided for informational purposes only and does not replace professional inspection or advice. You should always consult a qualified professional when unsure. FIXORA does not guarantee the accuracy or completeness of AI-generated outputs.\n\n5. User Inputs\nYou may upload photos and text descriptions to the App. You are solely responsible for the content you submit. FIXORA does not actively monitor your inputs but reserves the right to remove content that violates these Terms.\n\n6. Subscriptions\nCertain features require a paid subscription. Subscriptions auto-renew unless cancelled at least 24 hours before the end of the current period. All billing, cancellations, and refunds are handled by the applicable app store (Google Play or Apple App Store). FIXORA does not process refunds directly.\n\n7. Intellectual Property\nAll content, features, and functionality of FIXORA are the exclusive property of FIXORA and are protected by applicable intellectual property laws.\n\n8. Privacy\nYour use of FIXORA is also governed by our Privacy Policy, which is incorporated into these Terms by reference.\n\n9. Disclaimer of Warranties\nFIXORA is provided on an "as is" and "as available" basis without warranties of any kind. FIXORA does not warrant that the App will be uninterrupted or error-free.\n\n10. Limitation of Liability\nTo the fullest extent permitted by law, FIXORA shall not be liable for any indirect, incidental, or consequential damages arising from your use of the App.\n\n11. Changes to Terms\nWe reserve the right to modify these Terms at any time. Continued use of FIXORA after changes constitutes your acceptance of the new Terms.\n\n12. Contact\nIf you have questions about these Terms, please contact us via the App Store listing.',
  privacyBody:
    'Your privacy matters.\n\n1. Data Stored\nFIXORA processes photos, descriptions, and other inputs you submit for the purpose of generating AI-powered repair analysis. These inputs are transmitted to third-party AI providers solely to generate the requested output and are not stored on FIXORA servers. Your analysis history stays local on your device.\n\n2. AI Processing\nWhen you submit a photo or description, the data is securely transmitted to an AI service provider (e.g. Google Gemini) to generate repair suggestions. FIXORA does not sell your data or disclose it for advertising purposes. The AI provider processes the data only to return the requested analysis.\n\n3. Technical Data\nFIXORA may collect anonymized technical data (device type, OS version, app usage statistics) through third-party analytics services to improve the app. This data cannot be used to identify you personally.\n\n4. Use of Your Data\nYour data is used solely to handle your repair request and improve the FIXORA experience.\n\n5. Data Retention\nWe do not retain your photos or descriptions on our servers. Analysis history is stored locally on your device and can be deleted at any time.\n\n6. Third-Party Services\nFIXORA uses third-party services (AI providers, analytics) that may collect information. These services have their own privacy policies. We encourage you to review them.\n\n7. Children\'s Privacy\nFIXORA is intended for users aged 13 or older. We do not knowingly collect personal information from children under 13.\n\n8. Security\nWe use commercially reasonable measures to protect your data. However, no method of transmission or storage is completely secure.\n\n9. Changes to This Policy\nWe may update this Privacy Policy from time to time. We will notify you of significant changes through the app.\n\n10. Contact\nPrivacy questions: contact us through the details available on the App Store.',

  howItWorks: 'How it works',
  how1: 'Take a photo',
  how2: 'Describe the problem briefly',
  how3: 'Get a step-by-step guide',
  tryDemo: 'Try with an example',
  demoTitle: 'See your first analysis in 10 seconds',
  demoDesc:
    'My kitchen faucet is dripping. Water leaks from the pipe under the sink and it makes a noise when turned on. How can I fix it?',
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
  cameraRetry: 'Retry',
  cameraOk: 'OK',

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
  
  // Pro Modal
  promoTitle: 'FIXORA PRO',
  promoUnlimitedDaily: 'Unlimited daily analysis',
  promoPhotoVideoText: 'Photo, Video & Text',
  promoFastAnalysis: 'Fast and detailed repair analysis',
  promoDetailedGuides: 'Detailed solution guides',
  promoPricingMonthly: '1 Month',
  promoPricingYearly: '1 Year',
  promoBestValue: 'BEST VALUE',
  promoCodeLabel: 'Enter promo code',
  promoCodeButton: 'Verify Code',
  promoHaveCode: 'Have a promo code?',
  promoCodeChecking: 'Checking...',
  promoBuyButton: 'Pay with Google Play',
  promoTerms: 'Subscription auto-renews. Cancel anytime.',
  promoEnterCode: 'Please enter a code',
  promoInvalidCode: 'Invalid code',
  promoLimitReached: 'This code has reached its usage limit.',
  promoNetworkError: 'Backend connection error. Please try again.',
  promoSuccess: 'Pro activated! Unlimited analysis available.',
  successTitle: 'Success',
  
  // Crop Screen
  cropTitle: 'Crop Image',
  cropRotate: 'Rotate',
  cropAspect: '1:1',
  cropReset: 'Reset',
  cropContinue: 'Continue',

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
  qnaCta: 'Did I help? If not, you can chat with the AI — ask your questions here.',
  dailyRemaining: 'Free analyses remaining today',
  dailyLimitReached: 'Your daily free limit has been reached.',
  dailyLimitTitle: 'Limit reached',
  dailyLimitDesc: 'You have reached your daily free analysis limit. For more analyses, upgrade to PRO.',
  goPro: 'Upgrade to PRO',
};

export const translations: Record<Language, Dict> = { en, de, fr };
