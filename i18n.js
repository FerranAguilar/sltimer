/* ============================================================================
   SLTimer · i18n.js — Sistema de internacionalización (es / en / fr)
   ----------------------------------------------------------------------------
   Uso mínimo en cada página HTML, justo antes de </body>:

       <script src="/i18n.js"></script>

   Y marca los textos con atributos:
       <span data-i18n="menu.settings">Ajustes</span>
       <input data-i18n-placeholder="join.codePlaceholder" ...>
       <img data-i18n-alt="brand.logoAlt" ...>
       <button data-i18n-title="chrono.editCfg" ...>

   Desde JS puedes traducir cadenas dinámicas:
       toast(t('toast.saved'));
       toast(t('lang.changed', {lang: 'English'}));   // interpolación {lang}

   Cambiar idioma (persiste en localStorage y, si hay sesión, en Supabase):
       SLTi18n.setLang('en');
   ============================================================================ */
(function (global) {
  'use strict';

  /* ── Config Supabase (mismos valores que el resto de la app) ────────────── */
  const SB  = 'https://duwmhatcqxlwtqdnzhle.supabase.co';
  const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1d21oYXRjcXhsd3RxZG56aGxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MzIwMDMsImV4cCI6MjA5MzMwODAwM30.CkvnBvuo8rS2cv1Uts6dmUATUMbW9Dgjg4L29HE9Wdo';

  const LANGS = ['es', 'en', 'fr'];
  const DEFAULT_LANG = 'es';
  const STORAGE_KEY = 'slt_lang';

  /* ── Nombres de idioma para el toast de confirmación ────────────────────── */
  const LANG_NAMES = { es: 'Español', en: 'English', fr: 'Français' };

  /* ========================================================================
     DICCIONARIO
     Claves en notación punteada agrupadas por área. Añade aquí lo que falte.
     ======================================================================== */
  const DICT = {
    /* ── Comunes / genéricos ─────────────────────────────────────────────── */
    'common.loading':      { es: 'Cargando...',   en: 'Loading...',   fr: 'Chargement...' },
    'common.save':         { es: 'Guardar',       en: 'Save',         fr: 'Enregistrer' },
    'common.cancel':       { es: 'Cancelar',      en: 'Cancel',       fr: 'Annuler' },
    'common.confirm':      { es: 'Confirmar',     en: 'Confirm',      fr: 'Confirmer' },
    'common.delete':       { es: 'Borrar',        en: 'Delete',       fr: 'Supprimer' },
    'common.remove':       { es: 'Quitar',        en: 'Remove',       fr: 'Retirer' },
    'common.edit':         { es: 'Editar',        en: 'Edit',         fr: 'Modifier' },
    'common.close':        { es: 'Cerrar',        en: 'Close',        fr: 'Fermer' },
    'common.back':         { es: 'Volver',        en: 'Back',         fr: 'Retour' },
    'common.next':         { es: 'Siguiente',     en: 'Next',         fr: 'Suivant' },
    'common.search':       { es: 'Buscar',        en: 'Search',       fr: 'Rechercher' },
    'common.name':         { es: 'Nombre',        en: 'Name',         fr: 'Nom' },
    'common.surname':      { es: 'Apellidos',     en: 'Surname',      fr: 'Nom de famille' },
    'common.category':     { es: 'Categoría',     en: 'Category',     fr: 'Catégorie' },
    'common.date':         { es: 'Fecha',         en: 'Date',         fr: 'Date' },
    'common.place':        { es: 'Lugar',         en: 'Place',        fr: 'Lieu' },
    'common.description':  { es: 'Descripción',   en: 'Description',   fr: 'Description' },
    'common.errorPrefix':  { es: 'Error: ',       en: 'Error: ',      fr: 'Erreur : ' },

    /* ── Barra superior / marca ──────────────────────────────────────────── */
    'brand.logoAlt':       { es: 'SLTimer',       en: 'SLTimer',      fr: 'SLTimer' },

    /* ── Menú principal (menu.html) ──────────────────────────────────────── */
    'menu.welcomeBack':          { es: 'Bienvenido/a de nuevo',                    en: 'Welcome back',                         fr: 'Bon retour' },
    'menu.whatToday':            { es: '¿Qué hacemos hoy?',                        en: 'What shall we do today?',              fr: 'Que faisons-nous aujourd\u2019hui ?' },
    'menu.helloName':            { es: 'Hola, {name}',                             en: 'Hello, {name}',                        fr: 'Bonjour, {name}' },
    'menu.sectionMain':          { es: 'Principal',                                en: 'Main',                                 fr: 'Principal' },
    'menu.sectionUnavailable':   { es: 'Sección no disponible aún',                en: 'Section not available yet',            fr: 'Section pas encore disponible' },
    'menu.createSession':        { es: 'Crear Sesión',                             en: 'Create Session',                       fr: 'Créer une session' },
    'menu.createSessionDesc':    { es: 'Configura palistas, tramos y cronómetro',  en: 'Set up paddlers, sections and timer',  fr: 'Configurez pagayeurs, sections et chrono' },
    'menu.joinShared':           { es: 'Unirme a sesión compartida',               en: 'Join shared session',                  fr: 'Rejoindre une session partagée' },
    'menu.joinSharedDesc':       { es: 'Introduce el código del entrenador principal', en: 'Enter the head coach\u2019s code',  fr: 'Saisissez le code de l\u2019entraîneur principal' },
    'menu.sectionMyData':        { es: 'Mis datos',                                en: 'My data',                              fr: 'Mes données' },
    'menu.sectionConfig':        { es: 'Configuración',                            en: 'Settings',                             fr: 'Paramètres' },
    'menu.history':              { es: 'Historial de Sesiones',                    en: 'Session History',                      fr: 'Historique des sessions' },
    'menu.myAthletes':           { es: 'Mis palistas',                             en: 'My paddlers',                          fr: 'Mes pagayeurs' },
    'menu.groups':               { es: 'Grupos',                                   en: 'Groups',                               fr: 'Groupes' },
    'menu.stats':                { es: 'Estadísticas',                             en: 'Statistics',                           fr: 'Statistiques' },
    'menu.notifications':        { es: 'Notificaciones',                           en: 'Notifications',                        fr: 'Notifications' },
    'menu.settings':             { es: 'Ajustes',                                  en: 'Settings',                             fr: 'Réglages' },
    'menu.myProfile':            { es: 'Mi perfil',                                en: 'My profile',                           fr: 'Mon profil' },
    'menu.logout':               { es: 'Cerrar sesión',                            en: 'Log out',                              fr: 'Se déconnecter' },

    /* ── Modal unirse a sesión compartida ────────────────────────────────── */
    'join.title':          { es: 'Unirme a sesión compartida',                             en: 'Join shared session',                          fr: 'Rejoindre une session partagée' },
    'join.subtitle':       { es: 'Introduce el código de 6 caracteres del entrenador principal', en: 'Enter the head coach\u2019s 6-character code', fr: 'Saisissez le code à 6 caractères de l\u2019entraîneur' },
    'join.codePlaceholder':{ es: 'ABC123',                                                 en: 'ABC123',                                       fr: 'ABC123' },
    'join.submit':         { es: 'Unirme',                                                 en: 'Join',                                         fr: 'Rejoindre' },

    /* ── Ajustes (ajustes.html) ──────────────────────────────────────────── */
    'settings.title':          { es: 'Ajustes',                       en: 'Settings',                    fr: 'Réglages' },
    'settings.sectionPrefs':   { es: 'Preferencias',                  en: 'Preferences',                 fr: 'Préférences' },
    'settings.language':       { es: 'Idioma',                        en: 'Language',                    fr: 'Langue' },
    'settings.languageDesc':   { es: 'Idioma de la aplicación',       en: 'App language',                fr: 'Langue de l\u2019application' },
    'settings.notifications':  { es: 'Notificaciones',                en: 'Notifications',               fr: 'Notifications' },
    'settings.notifOn':        { es: 'Activadas',                     en: 'Enabled',                     fr: 'Activées' },
    'settings.notifOff':       { es: 'Desactivadas',                  en: 'Disabled',                    fr: 'Désactivées' },
    'settings.notifEnabled':   { es: 'Notificaciones activadas',      en: 'Notifications enabled',       fr: 'Notifications activées' },
    'settings.notifDisabled':  { es: 'Notificaciones desactivadas',   en: 'Notifications disabled',      fr: 'Notifications désactivées' },
    'settings.darkOn':         { es: 'Tema oscuro activado',          en: 'Dark theme on',               fr: 'Thème sombre activé' },
    'settings.darkOff':        { es: 'Tema claro activado',           en: 'Light theme on',              fr: 'Thème clair activé' },
    'settings.darkTheme':      { es: 'Tema oscuro',                   en: 'Dark theme',                  fr: 'Thème sombre' },
    'settings.themeOn':        { es: 'Activado',                      en: 'Enabled',                     fr: 'Activé' },
    'settings.themeOff':       { es: 'Desactivado',                   en: 'Disabled',                    fr: 'Désactivé' },
    'settings.sectionAccount': { es: 'Cuenta',                        en: 'Account',                     fr: 'Compte' },
    'settings.sectionSession': { es: 'Sesión',                        en: 'Session',                     fr: 'Session' },
    'settings.changePwd':      { es: 'Cambiar contraseña',            en: 'Change password',             fr: 'Changer le mot de passe' },
    'settings.changePwdDesc':  { es: 'Actualiza tu contraseña de acceso', en: 'Update your login password', fr: 'Mettez à jour votre mot de passe' },
    'settings.deleteAccount':  { es: 'Borrar cuenta',                 en: 'Delete account',              fr: 'Supprimer le compte' },
    'settings.deleteAccountDesc': { es: 'Esta acción no se puede deshacer', en: 'This action cannot be undone', fr: 'Cette action est irréversible' },
    'settings.logout':         { es: 'Cerrar sesión',                 en: 'Log out',                     fr: 'Se déconnecter' },
    'settings.deleteWarn':     { es: 'Se eliminarán todos tus datos permanentemente.', en: 'All your data will be permanently deleted.', fr: 'Toutes vos données seront supprimées définitivement.' },
    'settings.deletePlaceholder': { es: 'BORRAR',                     en: 'DELETE',                      fr: 'SUPPRIMER' },
    'settings.pwdModalTitle':  { es: 'Cambiar contraseña',            en: 'Change password',             fr: 'Changer le mot de passe' },
    'settings.pwdModalSub':    { es: 'Introduce tu nueva contraseña. Debe tener al menos 8 caracteres.', en: 'Enter your new password. It must be at least 8 characters.', fr: 'Saisissez votre nouveau mot de passe. Au moins 8 caractères.' },
    'settings.pwdNew':         { es: 'Nueva contraseña',              en: 'New password',                fr: 'Nouveau mot de passe' },
    'settings.pwdRepeat':      { es: 'Repetir contraseña',            en: 'Repeat password',             fr: 'Répéter le mot de passe' },
    'settings.deleteModalSubPre':  { es: 'Escribe',                   en: 'Type',                        fr: 'Tapez' },
    'settings.deleteModalSubPost': { es: 'para confirmar. Se eliminarán todos tus datos permanentemente.', en: 'to confirm. All your data will be permanently deleted.', fr: 'pour confirmer. Toutes vos données seront supprimées définitivement.' },

    /* ── Nueva sesión / configuración (app.html, cross.html) ─────────────── */
    'app.whichType':       { es: '¿Qué tipo de sesión?',   en: 'What type of session?', fr: 'Quel type de session ?' },
    'app.whichTypeSub':    { es: 'Elige la modalidad para configurar la sesión', en: 'Choose the discipline to set up the session', fr: 'Choisissez la discipline pour configurer la session' },
    'app.modality':        { es: 'Modalidad',              en: 'Discipline',          fr: 'Discipline' },
    'app.slalom':          { es: 'Eslálom',                en: 'Slalom',              fr: 'Slalom' },
    'app.slalomDesc':      { es: 'Registro de tiempos por tramos y mangas con cronómetro', en: 'Record times by sections and runs with a timer', fr: 'Enregistrement des temps par sections et manches au chrono' },
    'app.kayakCross':      { es: 'Kayak Cross',            en: 'Kayak Cross',         fr: 'Kayak Cross' },
    'app.kayakCrossDesc':  { es: 'Registro de tiempos y faltas con cronómetro', en: 'Record times and penalties with a timer', fr: 'Enregistrement des temps et pénalités au chrono' },
    'crcfg.topbar':        { es: 'Configurar Kayak Cross',                    en: 'Set up Kayak Cross',                   fr: 'Configurer le Kayak Cross' },
    'crcfg.pageTitle':     { es: 'Nueva sesión de Kayak Cross',               en: 'New Kayak Cross session',              fr: 'Nouvelle session de Kayak Cross' },
    'crcfg.pageSub':       { es: 'Configura los datos, las puertas y los palistas', en: 'Set up the details, gates and paddlers', fr: 'Configurez les détails, portes et pagayeurs' },
    'crcfg.sectionGates':  { es: 'Puertas',                                   en: 'Gates',                                fr: 'Portes' },
    'crcfg.numGates':      { es: 'Número de puertas',                         en: 'Number of gates',                      fr: 'Nombre de portes' },
    'crcfg.numGatesDesc':  { es: 'Puertas del circuito de cross',             en: 'Gates on the cross course',            fr: 'Portes du circuit de cross' },
    'crcfg.circuit':       { es: 'Circuito',                                  en: 'Course',                               fr: 'Circuit' },
    'crcfg.rollZone':      { es: 'Zona de Roll',                              en: 'Roll zone',                            fr: 'Zone d\u2019esquimautage' },
    'crcfg.rollZoneDesc':  { es: 'El circuito incluye una zona de esquimotaje', en: 'The course includes a roll zone',    fr: 'Le circuit inclut une zone d\u2019esquimautage' },
    'crcfg.rollPos':       { es: 'Posición de la zona de Roll',               en: 'Roll zone position',                   fr: 'Position de la zone d\u2019esquimautage' },
    'crcfg.rollHintPre':   { es: 'Arrastra la ficha',                         en: 'Drag the marker',                      fr: 'Faites glisser le repère' },
    'crcfg.rollHintPost':  { es: 'y suéltala entre las puertas donde está la zona de roll. Esta posición será fija durante toda la sesión.', en: 'and drop it between the gates where the roll zone is. This position stays fixed for the whole session.', fr: 'et déposez-le entre les portes où se trouve la zone d\u2019esquimautage. Cette position reste fixe pendant toute la session.' },
    'crcfg.paddlersKxc':   { es: 'Palistas (KXC)',                            en: 'Paddlers (KXC)',                       fr: 'Pagayeurs (KXC)' },
    'crcfg.noKxc':         { es: 'No tienes palistas con categoría KXC. Puedes escribir un nombre temporal.', en: 'You have no paddlers in the KXC category. You can type a temporary name.', fr: 'Vous n\u2019avez aucun pagayeur en catégorie KXC. Vous pouvez saisir un nom temporaire.' },
    'crcfg.rollHintShared': { es: 'Otros entrenadores podrán registrar tiempos con un código', en: 'Other coaches can record times using a code', fr: 'D\u2019autres entraîneurs peuvent enregistrer des temps avec un code' },
    'cfg.sessionName':     { es: 'Nombre de la sesión',   en: 'Session name',        fr: 'Nom de la session' },
    'slcfg.topbar':        { es: 'Configurar eslálom',                       en: 'Set up slalom',                        fr: 'Configurer le slalom' },
    'slcfg.pageTitle':     { es: 'Nueva sesión de eslálom',                  en: 'New slalom session',                   fr: 'Nouvelle session de slalom' },
    'slcfg.pageSub':       { es: 'Configura los datos, los tramos y los palistas', en: 'Set up the details, sections and paddlers', fr: 'Configurez les détails, sections et pagayeurs' },
    'slcfg.sectionData':   { es: 'Datos de la sesión',                       en: 'Session details',                      fr: 'Détails de la session' },
    'slcfg.namePlaceholder': { es: 'Ej: Entrenamiento mañana',              en: 'e.g. Morning training',                fr: 'ex. Entraînement matin' },
    'slcfg.sectionSections': { es: 'Tramos',                                 en: 'Sections',                             fr: 'Sections' },
    'slcfg.numSections':   { es: 'Número de tramos',                         en: 'Number of sections',                   fr: 'Nombre de sections' },
    'slcfg.numSectionsDesc': { es: 'Secciones cronometradas del recorrido',  en: 'Timed sections of the course',         fr: 'Sections chronométrées du parcours' },
    'slcfg.sharedLabel':   { es: 'Sesión compartida',                        en: 'Shared session',                       fr: 'Session partagée' },
    'slcfg.sharedDesc':    { es: 'Otros entrenadores podrán registrar tiempos a la vez con un código', en: 'Other coaches can record times at the same time using a code', fr: 'D\u2019autres entraîneurs peuvent enregistrer des temps en même temps avec un code' },
    'slcfg.startSession':  { es: 'Iniciar sesión',                           en: 'Start session',                        fr: 'Démarrer la session' },
    'slcfg.codeCreated':   { es: 'Sesión compartida creada',                 en: 'Shared session created',               fr: 'Session partagée créée' },
    'slcfg.codeSub':       { es: 'Comparte este código con los demás entrenadores para que se unan desde el menú', en: 'Share this code with the other coaches so they can join from the menu', fr: 'Partagez ce code avec les autres entraîneurs pour qu\u2019ils rejoignent depuis le menu' },
    'slcfg.copyCode':      { es: 'Copiar código',                            en: 'Copy code',                            fr: 'Copier le code' },
    'slcfg.startChrono':   { es: 'Iniciar cronómetro',                       en: 'Start timer',                          fr: 'Démarrer le chrono' },
    'slcfg.searchOrType':  { es: 'Buscar o escribir nombre…',                en: 'Search or type a name…',               fr: 'Rechercher ou saisir un nom…' },
    'slcfg.maxPaddlers':   { es: 'Máximo {n} palistas',                      en: 'Maximum {n} paddlers',                 fr: 'Maximum {n} pagayeurs' },
    'slcfg.needName':      { es: 'Introduce un nombre para la sesión',        en: 'Enter a name for the session',         fr: 'Saisissez un nom pour la session' },
    'slcfg.needPaddler':   { es: 'Añade al menos un palista',                 en: 'Add at least one paddler',             fr: 'Ajoutez au moins un pagayeur' },
    'slcfg.creatingShared': { es: 'Creando sesión compartida...',            en: 'Creating shared session...',           fr: 'Création de la session partagée...' },
    'slcfg.createError':   { es: 'Error al crear la sesión: {msg}',           en: 'Error creating the session: {msg}',    fr: 'Erreur lors de la création : {msg}' },
    'slcfg.codeCopied':    { es: 'Código copiado ✓',                          en: 'Code copied ✓',                        fr: 'Code copié ✓' },
    'slcfg.copyManual':    { es: 'Copia manual: {code}',                      en: 'Copy manually: {code}',                fr: 'Copie manuelle : {code}' },
    'slcfg.loadingPaddlers': { es: 'Cargando palistas...',                    en: 'Loading paddlers...',                  fr: 'Chargement des pagayeurs...' },
    'cfg.namePlaceholder': { es: 'Ej. Entreno mañana',    en: 'e.g. Morning training', fr: 'ex. Entraînement matin' },
    'cfg.sections':        { es: 'Tramos',                en: 'Sections',            fr: 'Sections' },
    'cfg.gates':           { es: 'Puertas',               en: 'Gates',               fr: 'Portes' },
    'cfg.paddlers':        { es: 'Palistas',              en: 'Paddlers',            fr: 'Pagayeurs' },
    'cfg.addPaddler':      { es: 'Añadir palista',        en: 'Add paddler',         fr: 'Ajouter un pagayeur' },
    'cfg.addGroup':        { es: 'Añadir grupo',          en: 'Add group',           fr: 'Ajouter un groupe' },
    'cfg.roll':            { es: 'Con roll',              en: 'With roll',           fr: 'Avec esquimautage' },
    'cfg.start':           { es: 'Empezar',               en: 'Start',               fr: 'Commencer' },
    'cfg.searchOrType':    { es: 'Buscar o escribir nombre…', en: 'Search or type a name…', fr: 'Rechercher ou saisir un nom…' },

    /* ── Cronómetro / sesión (slalom.html, sessionkxc.html) ──────────────── */
    'slsess.editTime':     { es: 'Editar tiempo',                            en: 'Edit time',                            fr: 'Modifier le temps' },
    'slsess.paddlerSectionRun': { es: 'Palista / Tramo / Manga',            en: 'Paddler / Section / Run',              fr: 'Pagayeur / Section / Manche' },
    'slsess.rawTime':      { es: 'Tiempo bruto (MM:SS.d)',                    en: 'Raw time (MM:SS.d)',                   fr: 'Temps brut (MM:SS.d)' },
    'slsess.penalties':    { es: 'Penalizaciones',                           en: 'Penalties',                            fr: 'Pénalités' },
    'slsess.pen2':         { es: '+2 seg · Toque',                           en: '+2 sec · Touch',                       fr: '+2 s · Touche' },
    'slsess.pen50':        { es: '+50 seg · Error',                          en: '+50 sec · Miss',                       fr: '+50 s · Faute' },
    'slsess.status':       { es: 'Estado',                                   en: 'Status',                               fr: 'Statut' },
    'slsess.markDsq':      { es: 'Marcar como DSQ',                           en: 'Mark as DSQ',                          fr: 'Marquer DSQ' },
    'slsess.saveChanges':  { es: 'Guardar cambios',                          en: 'Save changes',                         fr: 'Enregistrer les modifications' },
    'slsess.editCfg':      { es: 'Editar configuración',                     en: 'Edit configuration',                   fr: 'Modifier la configuration' },
    'slsess.editCfgDesc':  { es: 'Cambia los datos de la sesión durante el registro', en: 'Change session details during recording', fr: 'Modifiez les détails pendant l\u2019enregistrement' },
    'slsess.applyChanges': { es: 'Aplicar cambios',                          en: 'Apply changes',                        fr: 'Appliquer les modifications' },
    'slsess.sharedDesc':   { es: 'Comparte este código para que otro entrenador se una desde el menú', en: 'Share this code so another coach can join from the menu', fr: 'Partagez ce code pour qu\u2019un autre entraîneur rejoigne depuis le menu' },
    'slsess.chrono':       { es: 'Cronómetro',                               en: 'Timer',                                fr: 'Chrono' },
    'slsess.finish':       { es: 'Finalizar',                                en: 'Finish',                               fr: 'Terminer' },
    'slsess.session':      { es: 'Sesión',                                   en: 'Session',                              fr: 'Session' },
    'slsess.currentEntry': { es: 'Registro actual',                          en: 'Current entry',                        fr: 'Enregistrement actuel' },
    'slsess.paddler':      { es: 'Palista',                                  en: 'Paddler',                              fr: 'Pagayeur' },
    'slsess.section':      { es: 'Tramo',                                    en: 'Section',                              fr: 'Section' },
    'slsess.run':          { es: 'Manga',                                    en: 'Run',                                  fr: 'Manche' },
    'slsess.autoRun':      { es: 'Manga automática según lo guardado',        en: 'Automatic run based on what\u2019s saved', fr: 'Manche automatique selon l\u2019enregistré' },
    'slsess.start':        { es: 'Iniciar',                                  en: 'Start',                                fr: 'Départ' },
    'slsess.reset':        { es: 'Reiniciar',                                en: 'Reset',                                fr: 'Réinitialiser' },
    'slsess.penBeforeStop': { es: 'Penalizaciones (antes de parar)',         en: 'Penalties (before stopping)',          fr: 'Pénalités (avant l\u2019arrêt)' },
    'slsess.savedTimes':   { es: 'Tiempos guardados',                        en: 'Saved times',                          fr: 'Temps enregistrés' },
    'slsess.tapToEdit':    { es: '· toca para editar',                       en: '· tap to edit',                        fr: '· touchez pour modifier' },
    'slsess.noTimes':      { es: 'Aún no hay tiempos registrados',           en: 'No times recorded yet',                fr: 'Aucun temps enregistré' },
    'kxc.chrono':          { es: 'Cronómetro KXC',                           en: 'KXC Timer',                            fr: 'Chrono KXC' },
    'kxc.paddlerRun':      { es: 'Palista / Manga',                          en: 'Paddler / Run',                        fr: 'Pagayeur / Manche' },
    'kxc.gatesMissed':     { es: 'Puertas falladas',                         en: 'Missed gates',                         fr: 'Portes manquées' },
    'kxc.roll':            { es: 'Roll',                                     en: 'Roll',                                 fr: 'Esquimautage' },
    'kxc.rollOk':          { es: 'Roll OK',                                  en: 'Roll OK',                              fr: 'Esquimautage OK' },
    'kxc.rollFail':        { es: 'Roll fallido',                             en: 'Roll failed',                          fr: 'Esquimautage raté' },
    'kxc.currentPaddler':  { es: 'Palista actual',                           en: 'Current paddler',                      fr: 'Pagayeur actuel' },
    'kxc.gatesTapHint':    { es: 'Puertas · toca para marcar falta',          en: 'Gates · tap to mark a miss',           fr: 'Portes · touchez pour marquer une faute' },
    'kxc.rollZoneHintPre': { es: 'La zona de',                               en: 'The',                                  fr: 'La zone de' },
    'kxc.rollZoneHintPost': { es: 'oll está fijada en la configuración. Tócala para alternar OK / fallido. Para cambiar su posición, usa la edición de un tiempo o el botón de configuración.', en: 'oll zone is fixed in the configuration. Tap it to toggle OK / failed. To change its position, use time editing or the configuration button.', fr: 'esquimautage est fixée dans la configuration. Touchez-la pour alterner OK / raté. Pour changer sa position, utilisez l\u2019édition d\u2019un temps ou le bouton de configuration.' },
    'kxc.ok':              { es: 'OK',                                       en: 'OK',                                   fr: 'OK' },
    'kxc.failed':          { es: 'Fallada',                                  en: 'Missed',                               fr: 'Manquée' },
    'kxc.editRollHintPre': { es: 'Arrastra la',                              en: 'Drag the',                             fr: 'Faites glisser le' },
    'kxc.editRollHintPost': { es: 'para mover la zona de roll. Es fija para toda la sesión.', en: 'to move the roll zone. It is fixed for the whole session.', fr: 'pour déplacer la zone d\u2019esquimautage. Elle est fixe pour toute la session.' },
    'kxc.mangas':          { es: 'Mangas',                                  en: 'Runs',                                 fr: 'Manches' },
    'kxc.time0':           { es: 'El tiempo es 0, no se guarda',             en: 'Time is 0, not saved',                 fr: 'Le temps est 0, non enregistré' },
    'kxc.savingTime':      { es: 'Guardando tiempo...',                      en: 'Saving time...',                       fr: 'Enregistrement du temps...' },
    'kxc.timeSaved':       { es: 'Tiempo guardado ✓',                        en: 'Time saved ✓',                         fr: 'Temps enregistré ✓' },
    'kxc.saveError':       { es: 'Error al guardar: {msg}',                  en: 'Error saving: {msg}',                  fr: 'Erreur d\u2019enregistrement : {msg}' },
    'kxc.invalidFormat':   { es: 'Formato inválido. Usa MM:SS.d',            en: 'Invalid format. Use MM:SS.d',          fr: 'Format invalide. Utilisez MM:SS.d' },
    'kxc.entryNotFound':   { es: 'Entrada no encontrada',                    en: 'Entry not found',                      fr: 'Entrée introuvable' },
    'kxc.changesSaved':    { es: 'Cambios guardados ✓',                      en: 'Changes saved ✓',                      fr: 'Modifications enregistrées ✓' },
    'kxc.timeDeleted':     { es: 'Tiempo eliminado',                         en: 'Time deleted',                         fr: 'Temps supprimé' },
    'kxc.max30':           { es: 'Máximo 30 palistas',                       en: 'Maximum 30 paddlers',                  fr: 'Maximum 30 pagayeurs' },
    'kxc.syncFail':        { es: 'No se pudo sincronizar: {msg}',            en: 'Could not sync: {msg}',                fr: 'Synchronisation impossible : {msg}' },
    'kxc.cfgUpdated':      { es: 'Configuración actualizada ✓',              en: 'Configuration updated ✓',              fr: 'Configuration mise à jour ✓' },
    'kxc.stopBeforeFinish': { es: 'Para el cronómetro antes de finalizar',   en: 'Stop the timer before finishing',      fr: 'Arrêtez le chrono avant de terminer' },
    'kxc.onlyHostFinish':  { es: 'Solo el anfitrión puede finalizar la sesión', en: 'Only the host can finish the session', fr: 'Seul l\u2019hôte peut terminer la session' },
    'kxc.finishing':       { es: 'Finalizando sesión...',                    en: 'Finishing session...',                 fr: 'Fin de la session...' },
    'kxc.noCfg':           { es: 'No hay configuración de sesión',           en: 'No session configuration',             fr: 'Aucune configuration de session' },
    'kxc.loadingTimes':    { es: 'Cargando tiempos...',                      en: 'Loading times...',                     fr: 'Chargement des temps...' },
    'kxc.dsqOn':           { es: 'Descalificado (toca para quitar)',          en: 'Disqualified (tap to remove)',         fr: 'Disqualifié (touchez pour retirer)' },
    'slsess.mangaManual':  { es: 'Manga ajustada manualmente',               en: 'Run set manually',                     fr: 'Manche ajustée manuellement' },
    'slsess.dsqOn':        { es: 'Descalificado (toca para quitar)',          en: 'Disqualified (tap to remove)',         fr: 'Disqualifié (touchez pour retirer)' },
    'slsess.stop':         { es: 'Parar',                                    en: 'Stop',                                 fr: 'Arrêt' },
    'slsess.confirmExit':  { es: 'El cronómetro está en marcha. ¿Salir igualmente?', en: 'The timer is running. Leave anyway?', fr: 'Le chrono tourne. Quitter quand même ?' },
    'slsess.confirmDeleteTime': { es: '¿Eliminar este tiempo?',              en: 'Delete this time?',                    fr: 'Supprimer ce temps ?' },
    'slsess.confirmFinishFull': { es: '¿Finalizar la sesión? Los tiempos ya están guardados y podrás consultarlos en el historial.', en: 'Finish the session? Times are already saved and available in the history.', fr: 'Terminer la session ? Les temps sont déjà enregistrés et consultables dans l\u2019historique.' },
    'slsess.confirmFinish': { es: 'Los tiempos ya están guardados y podrás consultarlos en el historial.', en: 'Times are saved and available in the history.', fr: 'Les temps sont enregistrés et consultables dans l\u2019historique.' },
    'chrono.editCfg':      { es: 'Editar configuración de sesión', en: 'Edit session settings', fr: 'Modifier les réglages de session' },
    'chrono.start':        { es: 'Iniciar',               en: 'Start',               fr: 'Départ' },
    'chrono.stop':         { es: 'Parar',                 en: 'Stop',                fr: 'Arrêt' },
    'chrono.reset':        { es: 'Reiniciar',             en: 'Reset',               fr: 'Réinitialiser' },
    'chrono.penalty':      { es: 'Penalización',          en: 'Penalty',             fr: 'Pénalité' },
    'chrono.dsq':          { es: 'DSQ',                   en: 'DSQ',                 fr: 'DSQ' },
    'chrono.run':          { es: 'Manga',                 en: 'Run',                 fr: 'Manche' },
    'chrono.finish':       { es: 'Finalizar sesión',      en: 'Finish session',      fr: 'Terminer la session' },
    'chrono.finishing':    { es: 'Finalizando sesión...', en: 'Finishing session...', fr: 'Fin de session...' },
    'chrono.loadingTimes': { es: 'Cargando tiempos...',   en: 'Loading times...',    fr: 'Chargement des temps...' },
    'chrono.gates_n':      { es: '{n} puertas',           en: '{n} gates',           fr: '{n} portes' },
    'chrono.withRoll':     { es: 'con roll',              en: 'with roll',           fr: 'avec esquimautage' },
    'chrono.confirmExitRunning': { es: 'El cronómetro está en marcha. ¿Salir igualmente?', en: 'The timer is running. Leave anyway?', fr: 'Le chrono tourne. Quitter quand même ?' },
    'chrono.confirmFinish':      { es: 'Los tiempos ya están guardados y podrás consultarlos en el historial.', en: 'Times are saved and available in the history.', fr: 'Les temps sont enregistrés et consultables dans l\u2019historique.' },
    'chrono.noCfg':        { es: 'No hay configuración de sesión', en: 'No session configuration', fr: 'Aucune configuration de session' },

    /* ── Historial (historial.html) ──────────────────────────────────────── */
    'history.title':       { es: 'Historial de Sesiones', en: 'Session History',     fr: 'Historique des sessions' },
    'history.empty':       { es: 'Aún no tienes sesiones', en: 'No sessions yet',     fr: 'Aucune session pour l\u2019instant' },
    'history.openSession': { es: 'Abrir sesión',          en: 'Open session',        fr: 'Ouvrir la session' },

    /* ── Palistas (athletes.html) ────────────────────────────────────────── */
    'athletes.title':      { es: 'Mis palistas',          en: 'My paddlers',         fr: 'Mes pagayeurs' },
    'athletes.add':        { es: 'Añadir palista',        en: 'Add paddler',         fr: 'Ajouter un pagayeur' },
    'athletes.empty':      { es: 'Aún no tienes palistas', en: 'No paddlers yet',    fr: 'Aucun pagayeur pour l\u2019instant' },
    'athletes.deleteConfirm': { es: '¿Eliminar este palista?', en: 'Delete this paddler?', fr: 'Supprimer ce pagayeur ?' },

    /* ── Grupos (teams.html, team.html) ──────────────────────────────────── */
    'teams.title':         { es: 'Grupos',                en: 'Groups',              fr: 'Groupes' },
    'teams.create':        { es: 'Crear grupo',           en: 'Create group',        fr: 'Créer un groupe' },
    'teams.creating':      { es: 'Creando...',            en: 'Creating...',         fr: 'Création...' },
    'teams.created':       { es: 'Grupo creado',          en: 'Group created',       fr: 'Groupe créé' },
    'teams.namePlaceholder': { es: 'Nombre del grupo',    en: 'Group name',          fr: 'Nom du groupe' },
    'teams.needName':      { es: 'Introduce un nombre para el grupo', en: 'Enter a group name', fr: 'Saisissez un nom de groupe' },
    'teams.empty':         { es: 'No perteneces a ningún equipo.', en: 'You don\u2019t belong to any team.', fr: 'Vous n\u2019appartenez à aucune équipe.' },
    'teams.members':       { es: 'Miembros',              en: 'Members',             fr: 'Membres' },
    'teams.coach':         { es: 'Entrenador',            en: 'Coach',               fr: 'Entraîneur' },
    'teams.coaches':       { es: 'Entrenadores',          en: 'Coaches',             fr: 'Entraîneurs' },
    'teams.paddler':       { es: 'Palista',               en: 'Paddler',             fr: 'Pagayeur' },
    'teams.paddlers':      { es: 'Palistas',              en: 'Paddlers',            fr: 'Pagayeurs' },
    'teams.deleteConfirm': { es: '¿Eliminar el grupo permanentemente? Esta acción no se puede deshacer.', en: 'Permanently delete the group? This cannot be undone.', fr: 'Supprimer définitivement le groupe ? Action irréversible.' },
    'teams.deleted':       { es: 'Grupo eliminado',       en: 'Group deleted',       fr: 'Groupe supprimé' },
    'teams.loadingTeams':  { es: 'Cargando equipos…',     en: 'Loading teams…',      fr: 'Chargement des équipes…' },
    'teams.notFound':      { es: 'No se encontraron equipos.', en: 'No teams found.', fr: 'Aucune équipe trouvée.' },

    /* ── Estadísticas (stats.html) ───────────────────────────────────────── */
    'stats.title':         { es: 'Estadísticas',          en: 'Statistics',          fr: 'Statistiques' },
    'stats.empty':         { es: 'No hay datos suficientes', en: 'Not enough data',   fr: 'Données insuffisantes' },

    /* ── Notificaciones (notifications.html) ─────────────────────────────── */
    'notif.title':         { es: 'Notificaciones',        en: 'Notifications',       fr: 'Notifications' },
    'notif.empty':         { es: 'No tienes notificaciones', en: 'No notifications', fr: 'Aucune notification' },
    'notif.markRead':      { es: 'Marcar como leídas',    en: 'Mark as read',        fr: 'Marquer comme lues' },

    /* ── Perfil (profile.html) ───────────────────────────────────────────── */
    'profile.title':       { es: 'Mi perfil',             en: 'My profile',          fr: 'Mon profil' },
    'profile.username':    { es: 'Nombre de usuario',     en: 'Username',            fr: 'Nom d\u2019utilisateur' },
    'profile.email':       { es: 'Correo electrónico',    en: 'Email',               fr: 'E-mail' },
    'profile.saved':       { es: 'Perfil guardado',       en: 'Profile saved',       fr: 'Profil enregistré' },

    /* ── Toasts frecuentes ───────────────────────────────────────────────── */
    'toast.saved':         { es: 'Guardado',              en: 'Saved',               fr: 'Enregistré' },
    'toast.deleted':       { es: 'Eliminado',             en: 'Deleted',             fr: 'Supprimé' },
    'toast.copied':        { es: 'Copiado',               en: 'Copied',              fr: 'Copié' },
    'lang.changed':        { es: 'Idioma: {lang}',        en: 'Language: {lang}',    fr: 'Langue : {lang}' },

    /* ── Login / registro (index.html) ───────────────────────────────────── */
    'auth.subLogin':       { es: 'Inicia sesión para continuar',             en: 'Sign in to continue',                  fr: 'Connectez-vous pour continuer' },
    'auth.subRegister':    { es: 'Crea tu cuenta',                           en: 'Create your account',                  fr: 'Créez votre compte' },
    'auth.google':         { es: 'Continuar con Google',                     en: 'Continue with Google',                 fr: 'Continuer avec Google' },
    'auth.orEmail':        { es: 'o con email',                              en: 'or with email',                        fr: 'ou par e-mail' },
    'auth.email':          { es: 'Email',                                    en: 'Email',                                fr: 'E-mail' },
    'auth.password':       { es: 'Contraseña',                               en: 'Password',                             fr: 'Mot de passe' },
    'auth.repeatPassword': { es: 'Repite la contraseña',                     en: 'Repeat password',                      fr: 'Répétez le mot de passe' },
    'auth.enter':          { es: 'Entrar',                                   en: 'Sign in',                              fr: 'Se connecter' },
    'auth.register':       { es: 'Registrarse',                              en: 'Sign up',                              fr: 'S\u2019inscrire' },
    'auth.noAccount':      { es: '¿No tienes cuenta?',                       en: 'Don\u2019t have an account?',          fr: 'Pas encore de compte ?' },
    'auth.hasAccount':     { es: '¿Ya tienes cuenta?',                       en: 'Already have an account?',             fr: 'Vous avez déjà un compte ?' },
    'auth.linkRegister':   { es: 'Regístrate',                               en: 'Sign up',                              fr: 'Inscrivez-vous' },
    'auth.linkLogin':      { es: 'Inicia sesión',                            en: 'Sign in',                              fr: 'Connectez-vous' },
    'auth.needEmailPass':  { es: 'Introduce email y contraseña',             en: 'Enter email and password',             fr: 'Saisissez e-mail et mot de passe' },
    'auth.passMin':        { es: 'La contraseña debe tener al menos 6 caracteres', en: 'Password must be at least 6 characters', fr: 'Le mot de passe doit contenir au moins 6 caractères' },
    'auth.passMismatch':   { es: 'Las contraseñas no coinciden',             en: 'Passwords don\u2019t match',           fr: 'Les mots de passe ne correspondent pas' },
    'auth.signingIn':      { es: 'Iniciando sesión...',                      en: 'Signing in...',                        fr: 'Connexion...' },
    'auth.creatingAccount': { es: 'Creando cuenta...',                       en: 'Creating account...',                  fr: 'Création du compte...' },
    'auth.checkEmail':     { es: 'Revisa tu email para confirmar la cuenta', en: 'Check your email to confirm the account', fr: 'Vérifiez votre e-mail pour confirmer le compte' },
    'auth.authError':      { es: 'Error de autenticación: {msg}',            en: 'Authentication error: {msg}',          fr: 'Erreur d\u2019authentification : {msg}' },
    'auth.redirectingGoogle': { es: 'Redirigiendo a Google...',              en: 'Redirecting to Google...',             fr: 'Redirection vers Google...' },
    'auth.fillEmailPass':  { es: 'Rellena email y contraseña',               en: 'Fill in email and password',           fr: 'Remplissez e-mail et mot de passe' },
    'auth.accountCreated': { es: 'Cuenta creada. Revisa tu email y luego inicia sesión.', en: 'Account created. Check your email, then sign in.', fr: 'Compte créé. Vérifiez votre e-mail, puis connectez-vous.' },
    'auth.googleError':    { es: 'Error al iniciar sesión con Google',        en: 'Error signing in with Google',         fr: 'Erreur de connexion avec Google' },
    'auth.checkingSession': { es: 'Comprobando sesión...',                    en: 'Checking session...',                  fr: 'Vérification de la session...' },

    /* ── Onboarding (onboarding.html) ────────────────────────────────────── */
    'onb.welcome':         { es: 'Bienvenido a SLTimer',                     en: 'Welcome to SLTimer',                   fr: 'Bienvenue sur SLTimer' },
    'onb.setupProfile':    { es: 'Configura tu perfil',                      en: 'Set up your profile',                  fr: 'Configurez votre profil' },
    'onb.intro':           { es: 'Elige cómo te verán otros entrenadores cuando compartas palistas o grupos.', en: 'Choose how other coaches will see you when you share paddlers or groups.', fr: 'Choisissez comment les autres entraîneurs vous verront lorsque vous partagez des pagayeurs ou des groupes.' },
    'onb.yourName':        { es: 'Tu nombre',                                en: 'Your name',                            fr: 'Votre nom' },
    'onb.namePlaceholder': { es: 'Ej: Marta García',                        en: 'e.g. Marta García',                    fr: 'ex. Marta García' },
    'onb.username':        { es: 'Nombre de usuario',                        en: 'Username',                             fr: 'Nom d\u2019utilisateur' },
    'onb.usernameHint':    { es: 'Solo letras, números y _ · mínimo 3 caracteres', en: 'Letters, numbers and _ only · minimum 3 characters', fr: 'Lettres, chiffres et _ uniquement · minimum 3 caractères' },
    'onb.start':           { es: 'Empezar a usar SLTimer',                   en: 'Start using SLTimer',                  fr: 'Commencer à utiliser SLTimer' },
    'onb.min3':            { es: 'Mínimo 3 caracteres',                      en: 'Minimum 3 characters',                 fr: 'Minimum 3 caractères' },
    'onb.max30':           { es: 'Máximo 30 caracteres',                     en: 'Maximum 30 characters',                fr: 'Maximum 30 caractères' },
    'onb.checking':        { es: 'Comprobando disponibilidad…',              en: 'Checking availability…',               fr: 'Vérification de la disponibilité…' },
    'onb.taken':           { es: 'Ese usuario ya está en uso, prueba otro',  en: 'That username is taken, try another',  fr: 'Ce nom d\u2019utilisateur est pris, essayez-en un autre' },
    'onb.available':       { es: '@{username} está disponible',              en: '@{username} is available',             fr: '@{username} est disponible' },
    'onb.checkError':      { es: 'No se pudo comprobar, inténtalo de nuevo',  en: 'Couldn\u2019t check, please try again', fr: 'Vérification impossible, réessayez' },
    'onb.needName':        { es: 'Escribe tu nombre',                        en: 'Enter your name',                      fr: 'Saisissez votre nom' },
    'onb.needValidUsername': { es: 'Elige un nombre de usuario válido y disponible', en: 'Choose a valid, available username', fr: 'Choisissez un nom d\u2019utilisateur valide et disponible' },
    'onb.creatingProfile': { es: 'Creando tu perfil…',                       en: 'Creating your profile…',               fr: 'Création de votre profil…' },
    'onb.justTaken':       { es: 'Ese usuario acaba de ser tomado, prueba otro', en: 'That username was just taken, try another', fr: 'Ce nom d\u2019utilisateur vient d\u2019être pris, essayez-en un autre' },
    'onb.loggingOut':      { es: 'Cerrando sesión…',                         en: 'Logging out…',                         fr: 'Déconnexion…' },
  };

  /* ========================================================================
     MOTOR
     ======================================================================== */

  function normalizeLang(l) {
    if (!l) return DEFAULT_LANG;
    l = String(l).toLowerCase().slice(0, 2);
    return LANGS.indexOf(l) >= 0 ? l : DEFAULT_LANG;
  }

  function getLang() {
    return normalizeLang(localStorage.getItem(STORAGE_KEY) || navigator.language || DEFAULT_LANG);
  }

  /* Traduce una clave. `vars` permite interpolar {placeholders}. */
  function t(key, vars) {
    const entry = DICT[key];
    let str = entry ? (entry[getLang()] || entry[DEFAULT_LANG] || key) : key;
    if (vars) {
      str = str.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
    }
    return str;
  }

  /* Aplica traducciones a todo el DOM (o a un subárbol dado). */
  function apply(root) {
    root = root || document;

    // Texto interno
    root.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = t(key);
      // Si el elemento tiene hijos-elemento (p.ej. un badge dentro), solo
      // reemplaza el primer nodo de texto para no destruir la estructura.
      if (el.children.length && el.hasAttribute('data-i18n-textnode')) {
        const node = [...el.childNodes].find(n => n.nodeType === 3 && n.textContent.trim());
        if (node) node.textContent = val;
      } else if (!el.children.length) {
        el.textContent = val;
      } else {
        // Con hijos pero sin marca especial: intenta el primer nodo de texto.
        const node = [...el.childNodes].find(n => n.nodeType === 3);
        if (node) node.textContent = val; else el.setAttribute('data-i18n-skipped', '1');
      }
    });

    // Atributos concretos
    const ATTRS = [
      ['data-i18n-placeholder', 'placeholder'],
      ['data-i18n-title', 'title'],
      ['data-i18n-alt', 'alt'],
      ['data-i18n-aria-label', 'aria-label'],
      ['data-i18n-value', 'value'],
    ];
    ATTRS.forEach(([dataAttr, targetAttr]) => {
      root.querySelectorAll('[' + dataAttr + ']').forEach(el => {
        el.setAttribute(targetAttr, t(el.getAttribute(dataAttr)));
      });
    });

    // Atributo lang del <html>
    document.documentElement.setAttribute('lang', getLang());

    // Evento para que las páginas re-rendericen contenido dinámico
    document.dispatchEvent(new CustomEvent('i18n:applied', { detail: { lang: getLang() } }));
  }

  /* Guarda idioma en Supabase (perfil) si hay sesión activa. Silencioso. */
  async function syncToSupabase(lang) {
    try {
      const tok = localStorage.getItem('slt_tok');
      const uid = localStorage.getItem('slt_uid');
      if (!tok || !uid) return;
      await fetch(SB + '/rest/v1/profiles?id=eq.' + uid, {
        method: 'PATCH',
        headers: {
          apikey: KEY,
          Authorization: 'Bearer ' + tok,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ lang: lang }),
      });
    } catch (_) { /* sin conexión o sin columna: se ignora */ }
  }

  /* Lee el idioma del perfil de Supabase y lo adopta si difiere. */
  async function syncFromSupabase() {
    try {
      const tok = localStorage.getItem('slt_tok');
      const uid = localStorage.getItem('slt_uid');
      if (!tok || !uid) return;
      const r = await fetch(SB + '/rest/v1/profiles?id=eq.' + uid + '&select=lang', {
        headers: { apikey: KEY, Authorization: 'Bearer ' + tok },
      });
      const rows = await r.json();
      const remote = rows && rows[0] && rows[0].lang;
      if (remote && LANGS.indexOf(remote) >= 0 && remote !== getLang()) {
        localStorage.setItem(STORAGE_KEY, remote);
        apply();
      }
    } catch (_) { /* se ignora */ }
  }

  /* Cambia el idioma: persiste, aplica y sincroniza. */
  function setLang(lang) {
    lang = normalizeLang(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    apply();
    syncToSupabase(lang);
    return lang;
  }

  /* ── Arranque ────────────────────────────────────────────────────────── */
  function boot() {
    apply();
    // Intenta traer preferencia remota (por si cambió en otro dispositivo)
    syncFromSupabase();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  /* ── API pública ─────────────────────────────────────────────────────── */
  global.SLTi18n = {
    t: t,
    apply: apply,
    setLang: setLang,
    getLang: getLang,
    langName: (l) => LANG_NAMES[normalizeLang(l)],
    LANGS: LANGS.slice(),
    DICT: DICT,
  };
  // Atajo global cómodo para usar en el HTML/JS existente
  global.t = t;

})(window);
