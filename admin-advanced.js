(() => {
  const STORAGE_KEY = 'adminAdvancedSettings';
  const DRAFT_KEY = 'adminAdvancedSettingsDraft';
  const LOG_KEY = 'adminAdvancedLogs';
  const ACTIVE_SECTION_KEY = 'adminAdvancedActiveSection';
  const WELCOME_KEY = 'adminWelcomeShownThisSession';

  const sw = (path, label, help) => ({ type: 'switch', path, label, help: help || '' });
  const sel = (path, label, options, help) => ({ type: 'select', path, label, options, help: help || '' });
  const num = (path, label, min, max, step, unit, help) => ({ type: 'number', path, label, min, max, step, unit: unit || '', help: help || '' });
  const rng = (path, label, min, max, step, unit, help) => ({ type: 'range', path, label, min, max, step, unit: unit || '', help: help || '' });
  const txt = (path, label, help) => ({ type: 'text', path, label, help: help || '' });
  const ta = (path, label, rows, help) => ({ type: 'textarea', path, label, rows, help: help || '' });
  const btn = (action, label, help, tone) => ({ type: 'button', action, label, help: help || '', tone: tone || 'neutral' });

  const DEFAULT_SETTINGS = {
    general: {
      autoSave: true,
      draftRecovery: true,
      undoAction: true,
      confirmations: true,
      soundEffects: false,
    },
    appearance: {
      theme: 'dark',
      accentColor: '#6366f1',
      sidebarStyle: 'expanded',
      compactMode: false,
      animations: true,
      fontSize: 16,
      cardRadius: 16,
      glassIntensity: 72,
    },
    dashboard: {
      widgets: {
        welcomeBanner: true,
        quickActions: true,
        kpis: true,
        insights: true,
        activity: true,
        resources: true,
      },
      defaultHomepage: 'dashboard',
      autoRefresh: 45,
      analyticsVisible: true,
    },
    attendance: {
      gpsRadius: 60,
      tokenExpiryMinutes: 15,
      qrValiditySeconds: 45,
      duplicateDetection: true,
      deviceRestriction: true,
      autoClose: true,
    },
    uploads: {
      maxUploadSizeMb: 50,
      allowedFormats: 'pdf,doc,docx,ppt,pptx,mp4',
      autoCompression: true,
      autoThumbnailGeneration: true,
      cloudBackup: true,
      autoCategorization: true,
    },
    notifications: {
      pushNotifications: true,
      emailAlerts: true,
      examReminders: true,
      attendanceWarnings: true,
      liveSessionAlerts: true,
      liveSyncIndicator: true,
    },
    elite: {
      enabled: true,
      heroLabel: 'Premium Learning Vault',
      heroTitle: 'Unlock Premium Knowledge',
      heroDescription: 'Accelerate your BCA journey with expertly crafted video lectures, handwritten notes, DPPs, and placement preparation batches.',
      primaryCta: 'Explore Premium Batches',
      secondaryCta: 'View Benefits',
      statBatchesValue: '50+',
      statBatchesLabel: 'Premium Batches',
      statVideosValue: '1k+',
      statVideosLabel: 'Video Lectures',
      statStudentsValue: '10k+',
      statStudentsLabel: 'Elite Students',
      tickerSpeed: 20,
      featuredBatchId: '',
      announcements: [
        'Welcome to the new premium learning ecosystem!',
        'Fresh PYQ solutions uploaded for Semester 4.',
        'New C++ Mastery Crash Course available now!',
      ].join('\n'),
    },
    security: {
      twoFactorAuth: true,
      deviceManagement: true,
      sessionTimeoutMinutes: 30,
      loginAlerts: true,
      ipRestrictions: false,
      rolePermissions: true,
    },
    ai: {
      analysisLevel: 'balanced',
      similaritySensitivity: 70,
      autoRecommendations: true,
      weakStudentDetection: true,
      aiReportGeneration: true,
    },
    students: {
      quickFilters: true,
      bulkActions: true,
      behaviorFlags: true,
      profileNotes: true,
    },
    exams: {
      questionBank: true,
      autoShuffle: true,
      timerWarnings: true,
      resultExport: true,
      proctoringMode: false,
    },
    backup: {
      autoBackupSchedule: 'daily',
      cloudSync: true,
      restorePoints: true,
      localSnapshots: true,
    },
    performance: {
      clearCacheOnSave: false,
      lazyLoading: true,
      animationPerformanceMode: 'balanced',
      dataOptimization: true,
    },
    advanced: {
      apiIntegrations: true,
      firebaseControls: true,
      debugMode: false,
      errorTracker: true,
    },
  };

  const SETTINGS_SECTIONS = [
    {
      id: 'general',
      icon: '⚙️',
      title: 'General',
      description: 'Autosave, draft recovery, confirmation flows, and small UX protections.',
      controls: [
        sw('general.autoSave', 'Auto save changes', 'Persist settings as you edit.'),
        sw('general.draftRecovery', 'Draft recovery', 'Restore unsaved work after a reload.'),
        sw('general.undoAction', 'Undo action history', 'Keep one-click rollback available.'),
        sw('general.confirmations', 'Confirmation dialogs', 'Ask before destructive actions.'),
        sw('general.soundEffects', 'Sound feedback', 'Enable subtle audio feedback for key actions.'),
      ],
    },
    {
      id: 'appearance',
      icon: '🎨',
      title: 'Appearance',
      description: 'Theme, density, motion, typography, radii, and glass settings.',
      controls: [
        sel('appearance.theme', 'Theme', [
          { value: 'dark', label: 'Dark' },
          { value: 'light', label: 'Light' },
        ], 'Dark/light mode.'),
        txt('appearance.accentColor', 'Accent color', 'Primary gradient color in hex.'),
        sel('appearance.sidebarStyle', 'Sidebar style', [
          { value: 'expanded', label: 'Expanded' },
          { value: 'compact', label: 'Compact' },
        ], 'Choose the sidebar density.'),
        sw('appearance.compactMode', 'Compact mode', 'Reduce spacing across the admin shell.'),
        sw('appearance.animations', 'Animation toggle', 'Disable motion when needed.'),
        rng('appearance.fontSize', 'Font size', 14, 18, 1, 'px', 'Responsive base typography size.'),
        rng('appearance.cardRadius', 'Card radius', 10, 28, 1, 'px', 'Corner softness across cards and panels.'),
        rng('appearance.glassIntensity', 'Glass intensity', 0, 100, 1, '%', 'Controls the strength of blur and translucency.'),
      ],
    },
    {
      id: 'dashboard',
      icon: '🏠',
      title: 'Dashboard',
      description: 'Control which widgets appear and how often data refreshes.',
      controls: [
        sw('dashboard.widgets.welcomeBanner', 'Show welcome banner', 'Display the hero banner on dashboard load.'),
        sw('dashboard.widgets.quickActions', 'Show quick actions', 'Expose the fast-action strip.'),
        sw('dashboard.widgets.kpis', 'Show KPI cards', 'Keep the main metrics visible.'),
        sw('dashboard.widgets.insights', 'Show smart insights', 'Render the live insight strip.'),
        sw('dashboard.widgets.activity', 'Show activity panels', 'Keep the activity charts and feed visible.'),
        sw('dashboard.widgets.resources', 'Show resource breakdown', 'Display the semester resource chart.'),
        sel('dashboard.defaultHomepage', 'Default homepage', [
          { value: 'dashboard', label: 'Dashboard' },
          { value: 'add', label: 'Add Material' },
          { value: 'manage', label: 'Manage' },
          { value: 'notifications', label: 'Notifications' },
          { value: 'attendance', label: 'Attendance' },
          { value: 'settings', label: 'Settings' },
        ], 'Where the admin lands first.'),
        num('dashboard.autoRefresh', 'Auto refresh interval', 0, 300, 5, 'sec', 'Refresh dashboard counts automatically.'),
        sw('dashboard.analyticsVisible', 'Analytics visibility', 'Show the analytics section in the sidebar.'),
      ],
    },
    {
      id: 'attendance',
      icon: '📍',
      title: 'Attendance',
      description: 'Attendance thresholds, QR validity, and session restrictions.',
      controls: [
        num('attendance.gpsRadius', 'GPS radius', 10, 300, 5, 'm', 'Allowable location radius for attendance.'),
        num('attendance.tokenExpiryMinutes', 'Token expiry', 1, 120, 1, 'min', 'How long an attendance token stays valid.'),
        num('attendance.qrValiditySeconds', 'QR validity', 5, 300, 5, 'sec', 'How long the QR code remains active.'),
        sw('attendance.duplicateDetection', 'Duplicate detection', 'Block repeated attendance submissions.'),
        sw('attendance.deviceRestriction', 'Device restriction', 'Limit attendance to one device per student.'),
        sw('attendance.autoClose', 'Auto close sessions', 'End sessions automatically when time expires.'),
      ],
    },
    {
      id: 'uploads',
      icon: '📂',
      title: 'Uploads',
      description: 'Files, compression, thumbnails, cloud sync, and categorization rules.',
      controls: [
        num('uploads.maxUploadSizeMb', 'Max upload size', 5, 500, 5, 'MB', 'Maximum file size allowed for uploads.'),
        txt('uploads.allowedFormats', 'Allowed formats', 'Comma-separated list of accepted formats.'),
        sw('uploads.autoCompression', 'Auto compression', 'Compress large uploads when possible.'),
        sw('uploads.autoThumbnailGeneration', 'Auto thumbnail generation', 'Generate previews for rich media.'),
        sw('uploads.cloudBackup', 'Cloud backup', 'Mirror uploads to cloud storage.'),
        sw('uploads.autoCategorization', 'Auto categorization', 'Detect and file uploads into groups.'),
      ],
    },
    {
      id: 'notifications',
      icon: '🔔',
      title: 'Notifications',
      description: 'Push, email, exam reminders, attendance warnings, and live alerts.',
      controls: [
        sw('notifications.pushNotifications', 'Push notifications', 'Enable browser push alerts.'),
        sw('notifications.emailAlerts', 'Email alerts', 'Send summary emails to admins.'),
        sw('notifications.examReminders', 'Exam reminders', 'Alert students before exams start.'),
        sw('notifications.attendanceWarnings', 'Attendance warnings', 'Notify when attendance drops.'),
        sw('notifications.liveSessionAlerts', 'Live session alerts', 'Push live session updates instantly.'),
        sw('notifications.liveSyncIndicator', 'Live sync indicator', 'Show the online sync status in the header.'),
      ],
    },
    {
      id: 'security',
      icon: '🔐',
      title: 'Security',
      description: 'Authentication, devices, session timeouts, login alerts, and roles.',
      controls: [
        sw('security.twoFactorAuth', 'Two-factor authentication', 'Require a second verification step.'),
        sw('security.deviceManagement', 'Device management', 'Track and revoke trusted devices.'),
        num('security.sessionTimeoutMinutes', 'Session timeout', 5, 240, 5, 'min', 'Log out idle admins automatically.'),
        sw('security.loginAlerts', 'Login alerts', 'Notify on new or unusual logins.'),
        sw('security.ipRestrictions', 'IP restrictions', 'Restrict admin access to approved IPs.'),
        sw('security.rolePermissions', 'Role permissions', 'Enforce admin and staff permission boundaries.'),
      ],
    },
    {
      id: 'ai',
      icon: '🤖',
      title: 'AI Features',
      description: 'Tune analysis, similarity, recommendations, weak-student detection, and reports.',
      controls: [
        sel('ai.analysisLevel', 'Analysis level', [
          { value: 'light', label: 'Light' },
          { value: 'balanced', label: 'Balanced' },
          { value: 'deep', label: 'Deep' },
        ], 'How aggressively the AI processes content.'),
        rng('ai.similaritySensitivity', 'Similarity sensitivity', 0, 100, 1, '%', 'Higher means stricter similarity detection.'),
        sw('ai.autoRecommendations', 'Auto recommendations', 'Generate follow-up suggestions automatically.'),
        sw('ai.weakStudentDetection', 'Weak student detection', 'Highlight students that may need attention.'),
        sw('ai.aiReportGeneration', 'AI report generation', 'Compile summaries and insights automatically.'),
      ],
    },
    {
      id: 'students',
      icon: '👥',
      title: 'Student Controls',
      description: 'Quick filters, bulk operations, profile notes, and behavior flags.',
      controls: [
        sw('students.quickFilters', 'Quick filters', 'Expose fast filters in student lists.'),
        sw('students.bulkActions', 'Bulk actions', 'Allow batch management and selection.'),
        sw('students.behaviorFlags', 'Behavior flags', 'Track warnings and notable patterns.'),
        sw('students.profileNotes', 'Profile notes', 'Keep admin notes on individual students.'),
      ],
    },
    {
      id: 'exams',
      icon: '📝',
      title: 'Exam System',
      description: 'Question bank, shuffling, timer warnings, results, and proctoring.',
      controls: [
        sw('exams.questionBank', 'Question bank', 'Keep the exam question bank active.'),
        sw('exams.autoShuffle', 'Auto shuffle', 'Shuffle options and question order.'),
        sw('exams.timerWarnings', 'Timer warnings', 'Warn students before the timer expires.'),
        sw('exams.resultExport', 'Result export', 'Allow results to be exported as CSV.'),
        sw('exams.proctoringMode', 'Proctoring mode', 'Enable stricter exam supervision controls.'),
      ],
    },
    {
      id: 'backup',
      icon: '💾',
      title: 'Backup & Recovery',
      description: 'Schedules, cloud sync, restore points, snapshots, and exports.',
      controls: [
        sel('backup.autoBackupSchedule', 'Auto backup schedule', [
          { value: 'off', label: 'Off' },
          { value: 'hourly', label: 'Hourly' },
          { value: 'daily', label: 'Daily' },
          { value: 'weekly', label: 'Weekly' },
        ], 'How often backups are captured.'),
        sw('backup.cloudSync', 'Cloud sync', 'Mirror backups to the cloud.'),
        sw('backup.restorePoints', 'Restore points', 'Keep restore snapshots available.'),
        sw('backup.localSnapshots', 'Local snapshots', 'Store an extra local copy for recovery.'),
        btn('backupNow', 'Manual backup', 'Download a JSON backup of the current settings.', 'primary'),
        btn('restoreBackup', 'Restore system', 'Import a previous JSON backup.', 'neutral'),
        btn('exportDatabase', 'Export database snapshot', 'Download a portable admin snapshot.', 'neutral'),
      ],
    },
    {
      id: 'performance',
      icon: '⚡',
      title: 'Performance',
      description: 'Cache controls, lazy loading, motion budgets, and data optimization.',
      controls: [
        btn('clearCache', 'Clear cache', 'Remove the local admin cache and drafts.', 'danger'),
        sw('performance.lazyLoading', 'Lazy loading', 'Delay heavy UI parts until needed.'),
        sel('performance.animationPerformanceMode', 'Animation mode', [
          { value: 'fast', label: 'Fast' },
          { value: 'balanced', label: 'Balanced' },
          { value: 'reduced', label: 'Reduced' },
        ], 'Tune motion intensity for slower devices.'),
        sw('performance.dataOptimization', 'Data optimization', 'Trim payloads and favor smaller rendering passes.'),
      ],
    },
    {
      id: 'advanced',
      icon: '🧩',
      title: 'Advanced Developer Settings',
      description: 'API integrations, Firebase controls, logs, debug mode, and error tracking.',
      controls: [
        sw('advanced.apiIntegrations', 'API integrations', 'Keep external integrations enabled.'),
        sw('advanced.firebaseControls', 'Firebase controls', 'Expose Firebase-aware admin tools.'),
        sw('advanced.debugMode', 'Debug mode', 'Log admin actions and settings changes.'),
        sw('advanced.errorTracker', 'Error tracker', 'Keep error tracking enabled.'),
        btn('databaseViewer', 'Database viewer', 'Inspect the current admin snapshot.', 'neutral'),
        btn('logsViewer', 'Logs viewer', 'Inspect recent admin activity logs.', 'neutral'),
      ],
    },
  ];

  const originalFns = {
    initAdminPage: window.initAdminPage,
    switchAdminTab: window.switchAdminTab,
    adminLogout: window.adminLogout,
    toggleDarkMode: window.toggleDarkMode,
    showAdminWelcome: window.showAdminWelcome,
    loadDashboardStats: window.loadDashboardStats,
    loadAnalytics: window.loadAnalytics,
  };

  let adminSettingsState = null;
  let adminSettingsSaveTimer = null;
  let adminDashboardRefreshTimer = null;
  let adminWelcomeAutoCloseTimer = null;
  let adminMotivationTimer = null;
  let adminPaletteFilterTimer = null;
  let adminSettingsRecoveredDraft = false;
  let adminSettingsLastSavedAt = 0;
  let adminSettingsSectionRendered = false;
  let adminBackupInput = null;
  let adminSettingsNavUpdating = false;
  let adminAnalyticsObserver = null;
  let adminSearchPaletteTimer = null;
  let eliteSelectedBatchId = '';
  let eliteEditingBatchId = '';

  const ADMIN_TAB_IDS = ['dashboard', 'add', 'manage', 'test', 'elite', 'notifications', 'inbox', 'visitors', 'analytics', 'community', 'voting', 'attendance', 'ai-settings', 'settings'];
  const ADMIN_TAB_BUTTON_IDS = {
    dashboard: 'tabDashboard',
    add: 'tabAdd',
    manage: 'tabManage',
    test: 'tabTest',
    elite: 'tabElite',
    notifications: 'tabNotifications',
    inbox: 'tabInbox',
    visitors: 'tabVisitors',
    analytics: 'tabAnalytics',
    community: 'tabCommunity',
    voting: 'tabVoting',
    attendance: 'tabAttendance',
    'ai-settings': 'tabAiSettings',
    settings: 'tabSettings',
  };

  function getAdminTabButton(tab) {
    const buttonId = ADMIN_TAB_BUTTON_IDS[tab];
    return buttonId ? document.getElementById(buttonId) : null;
  }

  function hideAllAdminTabs() {
    ADMIN_TAB_IDS.forEach((tab) => {
      const section = document.getElementById(`admin-tab-${tab}`);
      if (section) {
        section.style.display = 'none';
        section.classList.remove('active');
      }
      const button = getAdminTabButton(tab);
      if (button) {
        button.classList.remove('active');
      }
    });
  }

  function activateAdminTab(tab) {
    hideAllAdminTabs();
    const section = document.getElementById(`admin-tab-${tab}`);
    if (section) {
      section.style.display = 'block';
      section.classList.add('active');
    }
    const button = getAdminTabButton(tab);
    if (button) {
      button.classList.add('active');
    }

    // Update Bottom Nav Active State
    const bnMap = {
      dashboard: 'bnDashboard',
      add: 'bnAdd',
      manage: 'bnManage',
      analytics: 'bnAnalytics'
    };
    Object.values(bnMap).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('active');
    });
    if (bnMap[tab]) {
      const el = document.getElementById(bnMap[tab]);
      if (el) el.classList.add('active');
    }
  }

  function parseCountFromElement(id, fallback = 0) {
    const element = document.getElementById(id);
    if (!element || !element.textContent) return fallback;
    const value = Number(String(element.textContent).replace(/[^\d.]/g, ''));
    return Number.isFinite(value) ? value : fallback;
  }

  function buildSmartInsightCards(items) {
    return items.map((item) => `
      <div class="adm-insight-card ${item.tone ? `insight-${item.tone}` : ''}">
        <div class="adm-insight-icon ${item.tone ? `insight-${item.tone}` : 'insight-info'}">${escapeHtml(item.icon)}</div>
        <div class="adm-insight-body">
          <div class="adm-insight-title">${escapeHtml(item.title)}</div>
          <div class="adm-insight-desc">${escapeHtml(item.text)}</div>
          ${item.tag ? `<div class="adm-insight-tag ${item.tagTone || 'tag-info'}">${escapeHtml(item.tag)}</div>` : ''}
        </div>
      </div>
    `).join('');
  }

  function collectAdminIntelligence() {
    const materials = parseCountFromElement('dashTotalMaterials', parseCountFromElement('kpiTotalMaterials', 0));
    const visitors = parseCountFromElement('dashTotalVisitors', parseCountFromElement('wbTotalVisitors', 0));
    const inbox = parseCountFromElement('dashTotalInbox', parseCountFromElement('kpiSuggDash', 0));
    const enrolled = parseCountFromElement('dashTotalEnrolled', parseCountFromElement('totalEnrolled', 0));
    const notes = parseCountFromElement('kpiNotesDash', parseCountFromElement('totalNotes', 0));
    const videos = parseCountFromElement('kpiVideosDash', parseCountFromElement('totalVideos', 0));
    const pyqs = parseCountFromElement('kpiPYQsDash', parseCountFromElement('totalPYQs', 0));
    const attendance = document.getElementById('dashboardAttendanceRate')?.textContent || '84.2%';
    const studyAssets = notes + videos + pyqs;

    const suggestions = [];
    if (materials < 50) {
      suggestions.push({ icon: '📚', title: 'Content pipeline needs volume', text: 'Add more notes and lectures so students always have a fresh resource path.', tone: 'warning', tag: 'Content gap', tagTone: 'tag-warn' });
    } else {
      suggestions.push({ icon: '📚', title: 'Content coverage is healthy', text: 'The material library is large enough to support daily student usage.', tone: 'success', tag: 'Coverage good', tagTone: 'tag-ok' });
    }

    if (inbox > 5) {
      suggestions.push({ icon: '💬', title: 'Inbox needs attention', text: 'Review pending suggestions before the queue becomes noisy.', tone: 'warning', tag: `${inbox} waiting`, tagTone: 'tag-warn' });
    } else {
      suggestions.push({ icon: '💬', title: 'Inbox is under control', text: 'Feedback volume is manageable and the response loop is clear.', tone: 'success', tag: 'Low backlog', tagTone: 'tag-ok' });
    }

    suggestions.push({ icon: '📂', title: 'Study library is synced', text: `${studyAssets} learning assets are ready across notes, videos, and practice content.`, tone: studyAssets > 0 ? 'success' : 'warning', tag: studyAssets > 0 ? 'Library ready' : 'Add content', tagTone: studyAssets > 0 ? 'tag-ok' : 'tag-warn' });

    const strongestResource = Math.max(notes, videos, pyqs);
    const strongestLabel = strongestResource === notes ? 'notes' : strongestResource === videos ? 'videos' : 'PYQs';

    const activityScore = Math.min(100, Math.round((materials * 0.32) + (visitors * 0.08) + (enrolled * 0.02) + (strongestResource * 0.82) + (studyAssets * 0.4)));

    return {
      materials,
      visitors,
      inbox,
      enrolled,
      notes,
      videos,
      pyqs,
      studyAssets,
      attendance,
      strongestLabel,
      activityScore,
      suggestions,
    };
  }

  function renderDashboardIntelligence() {
    const strip = document.getElementById('admInsightsStrip');
    if (!strip) return;

    const intelligence = collectAdminIntelligence();
    const title = intelligence.activityScore >= 70 ? 'Dashboard momentum is strong' : 'Dashboard needs a content push';
    const badge = document.getElementById('insightsBadge');
    if (badge) {
      badge.textContent = `${intelligence.activityScore}% intelligent health`;
    }

    strip.innerHTML = buildSmartInsightCards([
      {
        icon: '📈',
        title: title,
        text: `Activity score is ${intelligence.activityScore} with ${intelligence.materials} materials and ${intelligence.enrolled} enrolled learners.`,
        tone: intelligence.activityScore >= 70 ? 'success' : 'warning',
        tag: `${intelligence.attendance} attendance`,
        tagTone: intelligence.activityScore >= 70 ? 'tag-ok' : 'tag-warn',
      },
      {
        icon: '🧠',
        title: 'Strongest content lane',
        text: `Your ${intelligence.strongestLabel} library is currently leading the platform value.`,
        tone: 'info',
        tag: 'Smart signal',
        tagTone: 'tag-info',
      },
      {
        icon: '💬',
        title: 'Inbox health',
        text: intelligence.inbox > 5 ? 'There are pending messages that should be reviewed soon.' : 'Inbox activity is light, so no bottleneck is forming.',
        tone: intelligence.inbox > 5 ? 'warning' : 'success',
        tag: `${intelligence.inbox} pending`,
        tagTone: intelligence.inbox > 5 ? 'tag-warn' : 'tag-ok',
      },
      {
        icon: '⚡',
        title: 'Smart next move',
        text: intelligence.materials < 50 ? 'Upload two new notes or a quick lecture to lift platform momentum.' : 'Push analytics visibility and refresh the attendance workflow next.',
        tone: 'info',
        tag: 'Auto suggestion',
        tagTone: 'tag-info',
      },
    ]);

    const weeklyChart = document.getElementById('admWeeklyChart');
    if (weeklyChart) {
      const values = [38, 46, 54, 61, 69, 74, 83].map((base, index) => Math.max(12, Math.min(100, base + Math.round(intelligence.materials * 0.1) + (index % 3) * 2)));
      weeklyChart.innerHTML = values.map((value, index) => `
        <div class="adm-bar-col">
          <div class="adm-bar-fill" style="height:${value}%" data-val="${value}"></div>
          <div class="adm-bar-label">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}</div>
        </div>
      `).join('');
    }

    const activityFeed = document.getElementById('admActivityFeed');
    if (activityFeed) {
      const entries = [
        { dot: '#6366f1', text: `Dashboard intelligence updated with ${intelligence.activityScore}% health`, time: 'now' },
        { dot: '#10b981', text: `${intelligence.materials} resources are actively serving students`, time: '1m ago' },
        { dot: '#f59e0b', text: `${intelligence.inbox} inbox messages still need review`, time: '2m ago' },
      ];
      activityFeed.innerHTML = entries.map((entry) => `
        <div class="adm-activity-item">
          <div class="adm-activity-dot" style="background:${entry.dot};"></div>
          <div class="adm-activity-text">${escapeHtml(entry.text)}</div>
          <div class="adm-activity-time">${escapeHtml(entry.time)}</div>
        </div>
      `).join('');
    }
  }

  function buildAnalyticsSmartSummary() {
    const totalMaterials = parseCountFromElement('totalMaterials', parseCountFromElement('kpiTotalMaterials', 0));
    const totalNotes = parseCountFromElement('totalNotes', parseCountFromElement('kpiNotesDash', 0));
    const totalVideos = parseCountFromElement('totalVideos', parseCountFromElement('kpiVideosDash', 0));
    const totalPyqs = parseCountFromElement('totalPYQs', parseCountFromElement('kpiPYQsDash', 0));
    const totalEnrolled = parseCountFromElement('totalEnrolled', parseCountFromElement('dashTotalEnrolled', 0));
    const totalVisitors = parseCountFromElement('totalUniqueVisitors', parseCountFromElement('dashTotalVisitors', 0));
    const topSemester = document.getElementById('topSemester')?.textContent || 'N/A';

    const strongestChannel = [
      { label: 'Notes', value: totalNotes },
      { label: 'Videos', value: totalVideos },
      { label: 'PYQs', value: totalPyqs },
    ].sort((a, b) => b.value - a.value)[0];

    const learningMomentum = totalMaterials + totalEnrolled + totalVisitors > 0
      ? Math.round((totalMaterials * 0.45) + (totalEnrolled * 0.15) + (totalVisitors * 0.1))
      : 0;

    return {
      totalMaterials,
      totalNotes,
      totalVideos,
      totalPyqs,
      totalEnrolled,
      totalVisitors,
      topSemester,
      strongestChannel,
      learningMomentum,
    };
  }

  function renderAnalyticsSmartSummary() {
    const breakdown = document.getElementById('semesterBreakdown');
    if (!breakdown) return;

    const summary = buildAnalyticsSmartSummary();
    const smartSummary = `
      <div class="adm-analysis-smart-panel">
        <div class="adm-analysis-smart-grid">
          <div class="adm-analysis-smart-card">
            <span class="adm-analysis-smart-kicker">Momentum</span>
            <strong>${summary.learningMomentum}%</strong>
            <p>Platform learning momentum is based on the current content footprint and enrollment scale.</p>
          </div>
          <div class="adm-analysis-smart-card">
            <span class="adm-analysis-smart-kicker">Top semester</span>
            <strong>${escapeHtml(summary.topSemester)}</strong>
            <p>This remains the strongest semester in terms of current attention and usage.</p>
          </div>
          <div class="adm-analysis-smart-card">
            <span class="adm-analysis-smart-kicker">Strongest format</span>
            <strong>${escapeHtml(summary.strongestChannel.label)}</strong>
            <p>${summary.strongestChannel.label} leads the content library by current volume.</p>
          </div>
        </div>
      </div>
    `;

    if (!breakdown.dataset.smartSummaryInjected) {
      breakdown.insertAdjacentHTML('beforebegin', smartSummary);
      breakdown.dataset.smartSummaryInjected = 'true';
    }
  }

  function updateAnalyticsSmartSummaryWhenReady() {
    if (adminAnalyticsObserver) {
      return;
    }

    const breakdown = document.getElementById('semesterBreakdown');
    if (!breakdown) return;

    adminAnalyticsObserver = new MutationObserver(() => {
      renderAnalyticsSmartSummary();
    });
    adminAnalyticsObserver.observe(breakdown, { childList: true, subtree: true });
    renderAnalyticsSmartSummary();
  }

  function renderAiSettingsRoot() {
    const section = document.getElementById('admin-tab-ai-settings');
    if (!section) return;

    const ai = getAdminSettingsState().ai || DEFAULT_SETTINGS.ai;
    const intelligence = collectAdminIntelligence();

    section.innerHTML = `
      <div class="adm-ai-shell">
        <div class="adm-ai-hero glass-card">
          <div class="adm-ai-hero-copy">
            <div class="adm-ai-kicker">AI analysis center</div>
            <h2>Intelligent analysis for the admin panel</h2>
            <p>Use adaptive AI signals to identify weak students, improve content coverage, and tune similarity detection before issues spread.</p>
          </div>
          <div class="adm-ai-hero-actions">
            <button type="button" class="btn-primary" data-admin-ai-action="open-settings">Open full AI settings</button>
            <button type="button" class="btn-outline" data-admin-ai-action="refresh">Refresh analysis</button>
          </div>
        </div>

        <div class="adm-ai-grid">
          <div class="adm-ai-metric-card">
            <span class="adm-ai-metric-label">Analysis level</span>
            <strong>${escapeHtml(ai.analysisLevel)}</strong>
            <p>Current analysis depth applied across suggestions and reports.</p>
          </div>
          <div class="adm-ai-metric-card">
            <span class="adm-ai-metric-label">Similarity sensitivity</span>
            <strong>${escapeHtml(ai.similaritySensitivity)}%</strong>
            <p>How strict plagiarism and similarity detection should behave.</p>
          </div>
          <div class="adm-ai-metric-card">
            <span class="adm-ai-metric-label">Recommendations</span>
            <strong>${ai.autoRecommendations ? 'Enabled' : 'Off'}</strong>
            <p>Autogenerated suggestions help surface the next best admin action.</p>
          </div>
          <div class="adm-ai-metric-card">
            <span class="adm-ai-metric-label">Weak student scan</span>
            <strong>${ai.weakStudentDetection ? 'Enabled' : 'Off'}</strong>
            <p>Flag students who may need content support or attendance intervention.</p>
          </div>
        </div>

        <div class="adm-ai-grid adm-ai-grid-two">
          <div class="glass-card adm-ai-panel">
            <div class="adm-section-head">
              <h3>Live AI signals</h3>
              <span class="adm-section-badge">${intelligence.activityScore}% health</span>
            </div>
            <div id="adminAiSignalList" class="adm-ai-signal-list"></div>
          </div>
          <div class="glass-card adm-ai-panel">
            <div class="adm-section-head">
              <h3>Recommended next actions</h3>
              <span class="adm-section-badge">Smart queue</span>
            </div>
            <div id="adminAiActionList" class="adm-ai-action-list"></div>
          </div>
        </div>
      </div>
    `;

    const signalList = section.querySelector('#adminAiSignalList');
    if (signalList) {
      signalList.innerHTML = buildSmartInsightCards(intelligence.suggestions);
    }

    const actionList = section.querySelector('#adminAiActionList');
    if (actionList) {
      const actions = [
        { label: 'Open AI settings section', text: 'Jump into the settings accordion and fine-tune every control.', action: 'open-settings' },
        { label: 'Review analytics', text: 'Check semester breakdowns and content coverage trends next.', action: 'analytics' },
        { label: 'Launch command palette', text: 'Search any tool or section with one keyboard shortcut.', action: 'palette' },
      ];
      actionList.innerHTML = actions.map((item) => `
        <button type="button" class="adm-ai-action-row" data-admin-ai-action-row="${escapeHtml(item.action)}">
          <strong>${escapeHtml(item.label)}</strong>
          <span>${escapeHtml(item.text)}</span>
        </button>
      `).join('');
    }

    section.querySelectorAll('[data-admin-ai-action]').forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.getAttribute('data-admin-ai-action');
        if (action === 'open-settings') {
          openAdminSettingsSection('ai');
          return;
        }
        if (action === 'refresh') {
          renderAiSettingsRoot();
          renderDashboardIntelligence();
          renderAnalyticsSmartSummary();
          return;
        }
      });
    });

    section.querySelectorAll('[data-admin-ai-action-row]').forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.getAttribute('data-admin-ai-action-row');
        if (action === 'open-settings') {
          openAdminSettingsSection('ai');
        } else if (action === 'analytics') {
          window.switchAdminTab('analytics');
        } else if (action === 'palette') {
          openAdminCommandPalette('');
        }
      });
    });
  }

  function refreshAdminIntelligence() {
    renderDashboardIntelligence();
    updateAnalyticsSmartSummaryWhenReady();
    if (document.getElementById('admin-tab-ai-settings')?.classList.contains('active')) {
      renderAiSettingsRoot();
    }
  }

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function mergeDeep(base, incoming) {
    const output = Array.isArray(base) ? base.slice() : { ...base };
    if (!incoming || typeof incoming !== 'object') {
      return output;
    }

    Object.keys(incoming).forEach((key) => {
      const baseValue = output[key];
      const incomingValue = incoming[key];
      if (Array.isArray(baseValue) && Array.isArray(incomingValue)) {
        output[key] = incomingValue.slice();
      } else if (baseValue && typeof baseValue === 'object' && !Array.isArray(baseValue) && incomingValue && typeof incomingValue === 'object' && !Array.isArray(incomingValue)) {
        output[key] = mergeDeep(baseValue, incomingValue);
      } else {
        output[key] = incomingValue;
      }
    });

    return output;
  }

  function getByPath(obj, path) {
    if (!path) return undefined;
    return path.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), obj);
  }

  function setByPath(obj, path, value) {
    const parts = path.split('.');
    const last = parts.pop();
    let cursor = obj;

    parts.forEach((part) => {
      if (!cursor[part] || typeof cursor[part] !== 'object') {
        cursor[part] = {};
      }
      cursor = cursor[part];
    });

    cursor[last] = value;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalizeHexColor(color) {
    const raw = String(color || '').trim();
    if (/^#[0-9a-fA-F]{6}$/.test(raw)) {
      return raw.toLowerCase();
    }
    if (/^#[0-9a-fA-F]{3}$/.test(raw)) {
      return raw
        .slice(1)
        .split('')
        .map((part) => part + part)
        .join('')
        .toLowerCase();
    }
    return DEFAULT_SETTINGS.appearance.accentColor;
  }

  function shadeColor(hex, percent) {
    const color = normalizeHexColor(hex).slice(1);
    const amount = Math.max(-100, Math.min(100, percent));
    const target = amount < 0 ? 0 : 255;
    const ratio = Math.abs(amount) / 100;
    const red = Math.round((target - parseInt(color.slice(0, 2), 16)) * ratio + parseInt(color.slice(0, 2), 16));
    const green = Math.round((target - parseInt(color.slice(2, 4), 16)) * ratio + parseInt(color.slice(2, 4), 16));
    const blue = Math.round((target - parseInt(color.slice(4, 6), 16)) * ratio + parseInt(color.slice(4, 6), 16));
    return `#${[red, green, blue].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
  }

  function safeNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function readAdminStorage(key) {
    try {
      return lsGet(key, null);
    } catch {
      return null;
    }
  }

  function writeAdminStorage(key, value) {
    try {
      lsSet(key, value);
    } catch {
      // ignore storage failures
    }
  }

  function getStoredSnapshot() {
    const saved = readAdminStorage(STORAGE_KEY);
    const draft = readAdminStorage(DRAFT_KEY);

    const savedState = saved && typeof saved === 'object' && saved.state ? saved : null;
    const draftState = draft && typeof draft === 'object' && draft.state ? draft : null;
    const useDraft = draftState && (!savedState || safeNumber(draftState.updatedAt, 0) > safeNumber(savedState.updatedAt, 0));

    adminSettingsRecoveredDraft = !!useDraft;
    const activeSnapshot = useDraft ? draftState : savedState;
    const baseState = mergeDeep(DEFAULT_SETTINGS, activeSnapshot ? activeSnapshot.state : saved || {});
    if (!baseState.appearance || typeof baseState.appearance !== 'object') {
      baseState.appearance = deepClone(DEFAULT_SETTINGS.appearance);
    }

    adminSettingsLastSavedAt = safeNumber(activeSnapshot && activeSnapshot.updatedAt, Date.now());
    return baseState;
  }

  function getAdminSettingsState() {
    if (!adminSettingsState) {
      adminSettingsState = getStoredSnapshot();
    }
    return adminSettingsState;
  }

  function pushAdminLog(message) {
    const existing = readAdminStorage(LOG_KEY);
    const list = Array.isArray(existing) ? existing : [];
    list.unshift({
      message,
      time: Date.now(),
    });
    writeAdminStorage(LOG_KEY, list.slice(0, 60));
  }

  function showAdminToast(message, type) {
    if (typeof showNotification === 'function') {
      showNotification(message, type || 'info');
      return;
    }
    console.log(`[admin:${type || 'info'}] ${message}`);
  }

  function setDashboardWidgetVisibility(selector, visible) {
    document.querySelectorAll(selector).forEach((node) => {
      node.style.display = visible ? '' : 'none';
    });
  }

  function applyAdminAppearanceSettings(state) {
    const appearance = state.appearance || DEFAULT_SETTINGS.appearance;
    const theme = appearance.theme === 'light' ? 'light' : 'dark';
    const accent = normalizeHexColor(appearance.accentColor);
    const accentAlt = shadeColor(accent, theme === 'dark' ? -18 : -8);
    const radius = `${appearance.cardRadius}px`;
    const fontSize = `${safeNumber(appearance.fontSize, 16)}px`;
    const glassAlpha = Math.max(0.15, Math.min(0.84, 0.26 + (safeNumber(appearance.glassIntensity, 72) / 100) * 0.45));
    const glassBg = theme === 'dark'
      ? `rgba(12, 26, 46, ${glassAlpha.toFixed(3)})`
      : `rgba(255, 255, 255, ${glassAlpha.toFixed(3)})`;

    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.setProperty('--adm-accent', accent);
    document.documentElement.style.setProperty('--adm-accent-2', accentAlt);
    document.documentElement.style.setProperty('--adm-radius', radius);
    document.documentElement.style.setProperty('--adm-glass-bg', glassBg);
    document.documentElement.style.fontSize = fontSize;
    document.documentElement.style.colorScheme = theme;

    if (typeof lsSet === 'function') {
      lsSet('darkMode', theme === 'dark');
    }

    if (typeof updateDarkToggle === 'function') {
      updateDarkToggle(theme === 'dark');
    }

    const shell = document.querySelector('.adm-shell');
    if (shell) {
      shell.classList.toggle('sidebar-collapsed', appearance.sidebarStyle === 'compact');
      shell.classList.toggle('adm-compact-mode', !!appearance.compactMode);
    }

    document.body.classList.toggle('adm-reduced-motion', !appearance.animations);
    document.body.classList.toggle('adm-compact-mode', !!appearance.compactMode);

    setDashboardWidgetVisibility('.adm-welcome-banner', state.dashboard?.widgets?.welcomeBanner !== false);
    setDashboardWidgetVisibility('.adm-quick-actions', state.dashboard?.widgets?.quickActions !== false);
    setDashboardWidgetVisibility('.adm-kpi-grid', state.dashboard?.widgets?.kpis !== false);
    setDashboardWidgetVisibility('.adm-insights-strip', state.dashboard?.widgets?.insights !== false);
    setDashboardWidgetVisibility('.adm-dash-two-col', state.dashboard?.widgets?.activity !== false);
    setDashboardWidgetVisibility('#admin-tab-dashboard .adm-panel', state.dashboard?.widgets?.resources !== false);

    const analyticsBtn = document.getElementById('tabAnalytics');
    if (analyticsBtn) {
      analyticsBtn.style.display = state.dashboard?.analyticsVisible === false ? 'none' : '';
    }
    const analyticsSection = document.getElementById('admin-tab-analytics');
    if (analyticsSection) {
      analyticsSection.style.display = state.dashboard?.analyticsVisible === false && analyticsSection.classList.contains('active') ? 'none' : '';
    }

    restartDashboardRefresh(state.dashboard?.autoRefresh);
  }

  function restartDashboardRefresh(intervalSeconds) {
    const interval = Math.max(0, safeNumber(intervalSeconds, DEFAULT_SETTINGS.dashboard.autoRefresh));
    if (adminDashboardRefreshTimer) {
      clearInterval(adminDashboardRefreshTimer);
      adminDashboardRefreshTimer = null;
    }

    if (interval <= 0 || typeof originalFns.loadDashboardStats !== 'function') {
      return;
    }

    adminDashboardRefreshTimer = setInterval(() => {
      originalFns.loadDashboardStats();
      if (typeof loadInboxBadge === 'function') loadInboxBadge();
      if (typeof loadAnalytics === 'function' && document.getElementById('admin-tab-analytics')?.classList.contains('active')) {
        loadAnalytics();
      }
    }, interval * 1000);
  }

  function snapshotSettingsForStorage() {
    return {
      updatedAt: Date.now(),
      state: deepClone(getAdminSettingsState()),
    };
  }

  function persistAdminSettings(immediate) {
    const snapshot = snapshotSettingsForStorage();
    writeAdminStorage(DRAFT_KEY, snapshot);

    if (adminSettingsSaveTimer) {
      clearTimeout(adminSettingsSaveTimer);
      adminSettingsSaveTimer = null;
    }

    const delay = immediate ? 0 : (getAdminSettingsState().general.autoSave ? 450 : 1500);

    const commit = () => {
      writeAdminStorage(STORAGE_KEY, snapshot);
      adminSettingsLastSavedAt = snapshot.updatedAt;
      updateSettingsToolbarStatus('Saved just now', 'success');
    };

    if (delay === 0) {
      commit();
      return;
    }

    updateSettingsToolbarStatus('Saving...', 'info');
    adminSettingsSaveTimer = setTimeout(commit, delay);
  }

  function scheduleSettingsAutosave() {
    persistAdminSettings(false);
  }

  function updateSettingsToolbarStatus(text, tone) {
    const status = document.getElementById('admSettingsStatus');
    if (!status) return;
    status.textContent = text;
    status.dataset.tone = tone || 'neutral';
  }

  function updateSettingsToolbarMeta() {
    const snapshot = getAdminSettingsState();
    const theme = snapshot.appearance?.theme === 'light' ? 'Light' : 'Dark';
    const lastSaved = adminSettingsLastSavedAt ? new Date(adminSettingsLastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now';
    const themeBadge = document.getElementById('admSettingsThemeBadge');
    const savedBadge = document.getElementById('admSettingsSavedBadge');
    const draftBadge = document.getElementById('admSettingsDraftBadge');
    const motionBadge = document.getElementById('admSettingsMotionBadge');

    if (themeBadge) themeBadge.textContent = `${theme} mode`;
    if (savedBadge) savedBadge.textContent = `Saved ${lastSaved}`;
    if (draftBadge) draftBadge.textContent = adminSettingsRecoveredDraft ? 'Recovered draft' : 'Live draft';
    if (motionBadge) motionBadge.textContent = snapshot.appearance?.animations ? 'Motion on' : 'Motion reduced';
  }

  function formatSettingValue(control, value) {
    if (control.type === 'range' || control.type === 'number') {
      return `${value}${control.unit ? control.unit : ''}`;
    }
    if (control.type === 'switch') {
      return value ? 'Enabled' : 'Disabled';
    }
    return value == null ? '' : String(value);
  }

  function renderControl(control, state) {
    const path = control.path || `${control.action || control.label}`;
    const value = control.path ? getByPath(state, control.path) : undefined;
    const id = `adm-setting-${String(path).replace(/[^a-zA-Z0-9]+/g, '-')}`;
    const help = control.help ? `<div class="adm-setting-help">${escapeHtml(control.help)}</div>` : '';

    if (control.type === 'switch') {
      return `
        <label class="adm-setting-card adm-setting-switch-card" for="${id}">
          <div class="adm-setting-copy">
            <div class="adm-setting-label">${escapeHtml(control.label)}</div>
            ${help}
          </div>
          <span class="adm-setting-switch">
            <input type="checkbox" id="${id}" data-setting-path="${escapeHtml(control.path)}" ${value ? 'checked' : ''} />
            <span class="adm-setting-switch-track"></span>
          </span>
        </label>
      `;
    }

    if (control.type === 'select') {
      const options = control.options.map((option) => {
        const optionValue = typeof option === 'string' ? option : option.value;
        const optionLabel = typeof option === 'string' ? option : option.label;
        return `<option value="${escapeHtml(optionValue)}" ${String(value) === String(optionValue) ? 'selected' : ''}>${escapeHtml(optionLabel)}</option>`;
      }).join('');

      return `
        <div class="adm-setting-card">
          <div class="adm-setting-copy">
            <div class="adm-setting-label">${escapeHtml(control.label)}</div>
            ${help}
          </div>
          <select id="${id}" data-setting-path="${escapeHtml(control.path)}">${options}</select>
        </div>
      `;
    }

    if (control.type === 'range') {
      return `
        <div class="adm-setting-card">
          <div class="adm-setting-copy adm-setting-copy-inline">
            <div class="adm-setting-label">${escapeHtml(control.label)}</div>
            <span class="adm-setting-value" data-setting-value-for="${escapeHtml(control.path)}">${escapeHtml(formatSettingValue(control, value))}</span>
          </div>
          ${help}
          <input type="range" id="${id}" data-setting-path="${escapeHtml(control.path)}" min="${control.min}" max="${control.max}" step="${control.step}" value="${escapeHtml(value)}" />
        </div>
      `;
    }

    if (control.type === 'number') {
      return `
        <div class="adm-setting-card">
          <div class="adm-setting-copy adm-setting-copy-inline">
            <div class="adm-setting-label">${escapeHtml(control.label)}</div>
            <span class="adm-setting-value" data-setting-value-for="${escapeHtml(control.path)}">${escapeHtml(formatSettingValue(control, value))}</span>
          </div>
          ${help}
          <input type="number" id="${id}" data-setting-path="${escapeHtml(control.path)}" min="${control.min}" max="${control.max}" step="${control.step}" value="${escapeHtml(value)}" />
        </div>
      `;
    }

    if (control.type === 'textarea') {
      return `
        <div class="adm-setting-card adm-setting-text-card">
          <div class="adm-setting-copy">
            <div class="adm-setting-label">${escapeHtml(control.label)}</div>
            ${help}
          </div>
          <textarea id="${id}" rows="${control.rows || 3}" data-setting-path="${escapeHtml(control.path)}">${escapeHtml(value)}</textarea>
        </div>
      `;
    }

    if (control.type === 'text') {
      const isColorLike = /color/i.test(control.path);
      const inputType = isColorLike ? 'color' : 'text';
      return `
        <div class="adm-setting-card">
          <div class="adm-setting-copy adm-setting-copy-inline">
            <div class="adm-setting-label">${escapeHtml(control.label)}</div>
            ${control.path === 'appearance.accentColor' ? `<span class="adm-setting-value" data-setting-value-for="${escapeHtml(control.path)}">${escapeHtml(value)}</span>` : ''}
          </div>
          ${help}
          <input type="${inputType}" id="${id}" data-setting-path="${escapeHtml(control.path)}" value="${escapeHtml(value)}" />
        </div>
      `;
    }

    if (control.type === 'button') {
      const toneClass = control.tone === 'danger' ? 'is-danger' : control.tone === 'primary' ? 'is-primary' : 'is-neutral';
      return `
        <div class="adm-setting-card adm-setting-button-card ${toneClass}">
          <div class="adm-setting-copy">
            <div class="adm-setting-label">${escapeHtml(control.label)}</div>
            ${help}
          </div>
          <button type="button" class="adm-setting-action-btn" data-settings-action="${escapeHtml(control.action)}">${escapeHtml(control.label)}</button>
        </div>
      `;
    }

    return '';
  }

  function renderSettingsSection(section, state, activeSectionId) {
    const isOpen = section.id === activeSectionId;
    const controlsHtml = section.controls.map((control) => renderControl(control, state)).join('');
    return `
      <details class="adm-settings-section" data-settings-section-panel="${escapeHtml(section.id)}" ${isOpen ? 'open' : ''}>
        <summary>
          <div class="adm-settings-section-summary-left">
            <div class="adm-settings-section-icon">${escapeHtml(section.icon)}</div>
            <div>
              <h4>${escapeHtml(section.title)}</h4>
              <p>${escapeHtml(section.description)}</p>
            </div>
          </div>
          <span class="adm-settings-section-chevron">▾</span>
        </summary>
        <div class="adm-setting-grid">
          ${controlsHtml}
        </div>
      </details>
    `;
  }

  function renderSettingsRoot() {
    const root = document.getElementById('adminSettingsRoot');
    if (!root) return;

    const state = getAdminSettingsState();
    const activeSection = sessionStorage.getItem(ACTIVE_SECTION_KEY) || 'general';
    const navButtons = SETTINGS_SECTIONS.map((section) => `
      <button type="button" class="adm-settings-nav-btn ${section.id === activeSection ? 'active' : ''}" data-settings-section="${escapeHtml(section.id)}">
        <span class="adm-settings-nav-icon">${escapeHtml(section.icon)}</span>
        <span>${escapeHtml(section.title)}</span>
      </button>
    `).join('');

    const sectionsHtml = SETTINGS_SECTIONS.map((section) => renderSettingsSection(section, state, activeSection)).join('');

    root.innerHTML = `
      <div class="adm-settings-shell">
        <aside class="adm-settings-nav">
          <div class="adm-settings-nav-head">
            <div class="adm-settings-nav-kicker">System Control</div>
            <h3>Settings</h3>
            <p>Premium controls for theme, attendance, uploads, security, AI, and recovery.</p>
          </div>
          <div class="adm-settings-nav-list">
            ${navButtons}
          </div>
        </aside>
        <div class="adm-settings-panel">
          <div class="adm-settings-toolbar">
            <div class="adm-settings-toolbar-left">
              <span class="adm-settings-pill" id="admSettingsStatus">Ready</span>
              <span class="adm-settings-pill" id="admSettingsThemeBadge">Theme</span>
              <span class="adm-settings-pill" id="admSettingsSavedBadge">Saved</span>
              <span class="adm-settings-pill" id="admSettingsDraftBadge">Draft</span>
              <span class="adm-settings-pill" id="admSettingsMotionBadge">Motion</span>
            </div>
            <div class="adm-settings-toolbar-actions">
              <button type="button" class="btn-outline" data-admin-settings-command="palette">Ctrl + K</button>
              <button type="button" class="btn-outline" data-admin-settings-action="undo">Undo</button>
              <button type="button" class="btn-outline" data-admin-settings-action="reset">Reset</button>
              <button type="button" class="btn-primary" data-admin-settings-action="save">Save Now</button>
            </div>
          </div>
          <div class="adm-settings-grid-shell">
            ${sectionsHtml}
          </div>
        </div>
      </div>
    `;

    bindSettingsEvents();
    updateSettingsToolbarMeta();
    adminSettingsSectionRendered = true;
  }

  const ELITE_SEED_BATCHES = [
    {
      id: 'placement_alpha_2026',
      title: 'Placement Alpha 2026',
      price: 1999,
      discountPrice: 499,
      desc: 'Elite programming architecture, DSA drills, interview masterclasses, and placement mock rounds designed specifically to place BCA graduates in product firms.',
      features: ['120+ Masterclasses', 'Copyable Source Codes', 'DPP Question Sheets', 'Resume Formatting Help'],
      thumb: '',
      badge: 'Hottest Seller',
      teacher: 'Vishal Kumar',
      semester: 'all',
      type: 'coding',
      subjects: ['Database Management', 'Data Structures', 'Web Development'],
      resources: {
        videos: [
          {
            id: 'lec_dbms_1',
            title: 'DBMS Core & Schema Architecture',
            detail: '45 mins',
            url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            desc: 'A comprehensive study of normalized database structures, 3NF, BCNF anomalies, and practical schema design logic.',
            subject: 'Database Management',
            notesUrl: '#',
            dppUrl: '#',
            codeSnippet: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Elite DBMS Schema Initialized Successfully!\\n";\n    return 0;\n}',
            preview: true,
            hidden: false
          },
          {
            id: 'lec_dsa_1',
            title: 'Advanced DSA: Binary Trees & Traversals',
            detail: '52 mins',
            url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            desc: 'Deep-dive study into hierarchical trees, pre-order, in-order, post-order recursive strategies, and balancing techniques.',
            subject: 'Data Structures',
            notesUrl: '#',
            dppUrl: '#',
            codeSnippet: '#include <iostream>\nusing namespace std;\n\nstruct Node {\n    int data;\n    Node* left;\n    Node* right;\n};\n\nvoid inorder(Node* root) {\n    if(!root) return;\n    inorder(root->left);\n    cout << root->data << " ";\n    inorder(root->right);\n}',
            preview: false,
            hidden: false
          }
        ],
        notes: [
          { id: 'notes_dbms_1', title: 'DBMS Handwritten Revision Notes', detail: '2.4 MB', subject: 'Database Management', url: '#' }
        ],
        dpp: [
          { id: 'dpp_dbms_1', title: 'DBMS Schema Design Sheet', detail: '10 Algorithmic Problems', subject: 'Database Management', url: '#' }
        ],
        coding: [],
        pyq: []
      },
      tests: [
        { title: 'DBMS Relational Calculus MCQ', mcqsCount: 15, duration: '20 mins', subject: 'Database Management' }
      ]
    },
    {
      id: 'bca_semester_gold',
      title: 'BCA Semester Gold (Full Syllabus)',
      price: 1499,
      discountPrice: 399,
      desc: 'Semester-wise detailed academic courseware spanning DBMS, C++, Java, Operating Systems, Web Technologies, and Software Engineering.',
      features: ['All Semester Syllabus', 'Hand-Written PDF Notes', 'Previous Year Questions', 'GPA Accelerator Strategy'],
      thumb: 'ðŸ“š',
      badge: 'Recommended',
      teacher: 'Prof. Sharma',
      semester: '4',
      type: 'exam',
      subjects: ['Operating Systems', 'Software Engineering'],
      resources: {
        videos: [
          {
            id: 'lec_os_1',
            title: 'Introduction to Operating Systems & Kernel',
            detail: '38 mins',
            url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            desc: 'Understanding OS layers, process scheduling, monolithic vs micro kernels, and memory managers.',
            subject: 'Operating Systems',
            notesUrl: '#',
            dppUrl: '#',
            codeSnippet: '#include <unistd.h>\n#include <stdio.h>\n\nint main() {\n    printf("Parent Process ID: %d\\n", getpid());\n    return 0;\n}',
            preview: true,
            hidden: false
          }
        ],
        notes: [],
        dpp: [],
        coding: [],
        pyq: []
      },
      tests: []
    }
  ];

  function normalizeResourceVideo(video) {
    return {
      id: video.id || `lec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: video.title || 'Untitled Lecture',
      detail: video.detail || 'Flexible duration',
      url: video.url || video.videoUrl || '',
      videoUrl: video.url || video.videoUrl || '',
      desc: video.desc || '',
      subject: video.subject || 'General Syllabus',
      notesUrl: video.notesUrl || '#',
      dppUrl: video.dppUrl || '#',
      codeSnippet: video.codeSnippet || '',
      preview: video.preview !== undefined ? !!video.preview : false,
      hidden: video.hidden !== undefined ? !!video.hidden : false
    };
  }

  function normalizeResourceItem(item) {
    return {
      id: item.id || `res_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: item.title || 'Untitled Resource',
      detail: item.detail || '',
      url: item.url || '#',
      subject: item.subject || 'General Syllabus',
      preview: item.preview !== undefined ? !!item.preview : false,
      hidden: item.hidden !== undefined ? !!item.hidden : false
    };
  }

  function inferEliteBatchTheme(batch) {
    const text = `${batch?.title || batch?.name || ''} ${batch?.type || ''} ${(batch?.subjects || []).join ? (batch.subjects || []).join(' ') : batch?.subjects || ''} ${(batch?.features || []).join ? (batch.features || []).join(' ') : batch?.features || ''}`.toLowerCase();
    if (text.includes('placement') || text.includes('interview')) return 'placement';
    if (text.includes('math') || text.includes('numerical') || text.includes('discrete')) return 'math';
    if (text.includes('crash') || text.includes('sprint')) return 'crash';
    if (text.includes('lab') || text.includes('practical')) return 'lab';
    if (text.includes('english') || text.includes('communication') || text.includes('language')) return 'language';
    return 'coding';
  }

  function normalizeEliteBatch(batch, index = 0) {
    const resources = batch && typeof batch.resources === 'object' ? batch.resources : {};
    const finalPrice = batch?.discountPrice !== undefined ? batch.discountPrice : (batch?.price || 499);
    const originalPrice = batch?.price !== undefined ? batch.price : 1999;
    const features = Array.isArray(batch?.features) ? batch.features : (batch?.features ? String(batch.features).split(',').map(s=>s.trim()) : ['100% Solved Exercises']);
    const subjects = Array.isArray(batch?.subjects) ? batch.subjects : (batch?.subjects ? String(batch.subjects).split(',').map(s=>s.trim()) : ['General Syllabus']);

    return {
      id: batch?.id || `elite_${Date.now()}_${index}`,
      title: batch?.title || batch?.name || 'Untitled Batch',
      name: batch?.title || batch?.name || 'Untitled Batch',
      desc: batch?.desc || batch?.description || '',
      description: batch?.desc || batch?.description || '',
      thumb: batch?.thumb || batch?.icon || 'ðŸ“š',
      icon: batch?.thumb || batch?.icon || 'ðŸ“š',
      semester: batch?.semester || 'all',
      type: batch?.type || 'exam',
      duration: batch?.duration || 'Flexible',
      teacher: batch?.teacher || 'Admin',
      priceTag: batch?.priceTag || 'Premium',
      autoTheme: batch?.autoTheme || inferEliteBatchTheme(batch),
      posterIcon: batch?.posterIcon || batch?.thumb || batch?.icon || '',
      tags: Array.isArray(batch?.tags) ? batch.tags : (batch?.tags ? String(batch.tags).split(',').map(s=>s.trim()).filter(Boolean) : []),
      price: originalPrice,
      discountPrice: finalPrice,
      features: features,
      subjects: subjects,
      badge: batch?.badge || '',
      featured: !!batch?.featured,
      hidden: !!batch?.hidden,
      access: batch?.access || 'premium',
      resources: {
        videos: (Array.isArray(resources.videos) ? resources.videos : []).map(normalizeResourceVideo),
        notes: (Array.isArray(resources.notes) ? resources.notes : []).map(normalizeResourceItem),
        dpp: (Array.isArray(resources.dpp) ? resources.dpp : []).map(normalizeResourceItem),
        coding: (Array.isArray(resources.coding) ? resources.coding : []).map(normalizeResourceItem),
        pyq: (Array.isArray(resources.pyq) ? resources.pyq : []).map(normalizeResourceItem),
      },
      tests: Array.isArray(batch?.tests) ? batch.tests : []
    };
  }

  function normalizeEliteSettings(raw) {
    const incoming = raw && typeof raw === 'object' ? raw : {};
    return {
      ...deepClone(DEFAULT_SETTINGS.elite),
      ...incoming,
    };
  }

  function getEliteBatches() {
    const stored = window.localStorage.getItem('eliteBatches');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.map((batch, index) => normalizeEliteBatch(batch, index));
        }
      } catch (error) {
        console.warn('Could not parse elite batches:', error);
      }
    }

    const seeded = ELITE_SEED_BATCHES.map((batch, index) => normalizeEliteBatch(batch, index));
    window.localStorage.setItem('eliteBatches', JSON.stringify(seeded));
    return seeded;
  }

  function saveEliteBatches(batches) {
    const next = Array.isArray(batches) ? batches.map((batch, index) => normalizeEliteBatch(batch, index)) : [];
    window.localStorage.setItem('eliteBatches', JSON.stringify(next));
    return next;
  }

  function getEliteSettings() {
    const stored = window.localStorage.getItem('eliteSettings');
    if (stored) {
      try {
        return normalizeEliteSettings(JSON.parse(stored));
      } catch (error) {
        console.warn('Could not parse elite settings:', error);
      }
    }

    const seeded = normalizeEliteSettings({});
    window.localStorage.setItem('eliteSettings', JSON.stringify(seeded));
    return seeded;
  }

  function saveEliteSettings(settings) {
    const next = normalizeEliteSettings(settings);
    eliteSettings = next;
    window.localStorage.setItem('eliteSettings', JSON.stringify(next));
    return next;
  }

  function cloneEliteBatches() {
    return deepClone(ELITE_SEED_BATCHES);
  }

  function getEliteSeedBatchId(batches, settings) {
    const storedSelection = window.localStorage.getItem('eliteSelectedBatchId') || '';
    if (storedSelection && batches.some((batch) => batch.id === storedSelection)) {
      eliteSelectedBatchId = storedSelection;
      return storedSelection;
    }
    if (eliteSelectedBatchId && batches.some((batch) => batch.id === eliteSelectedBatchId)) {
      return eliteSelectedBatchId;
    }
    if (settings.featuredBatchId && batches.some((batch) => batch.id === settings.featuredBatchId)) {
      return settings.featuredBatchId;
    }
    return batches[0]?.id || '';
  }

  function getEliteBatchById(batches, id) {
    return batches.find((batch) => batch.id === id) || null;
  }

  function getEliteResourceCount(batch) {
    if (!batch || !batch.resources) return 0;
    return ['videos', 'notes', 'dpp', 'coding', 'pyq'].reduce((total, key) => total + (Array.isArray(batch.resources[key]) ? batch.resources[key].length : 0), 0);
  }

  function getEliteAnnouncementLines(settings) {
    return String(settings?.announcements || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  function getEliteStudents() {
    try {
      const parsed = JSON.parse(window.localStorage.getItem('bca_elite_students') || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function saveEliteStudents(students) {
    window.localStorage.setItem('bca_elite_students', JSON.stringify(Array.isArray(students) ? students : []));
  }

  function syncEliteStudentToFirebase(student) {
    if (!student?.uid || typeof db === 'undefined' || !db || typeof db.ref !== 'function') return;
    db.ref(`elite_students/${student.uid}`).update(student).catch((error) => {
      console.warn('Elite student Firebase update failed:', error.message);
    });
  }

  function formatEliteDate(value) {
    if (!value) return 'Not recorded';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Not recorded';
    return date.toLocaleString();
  }

  function eliteToggleStudentPremium(uid) {
    const students = getEliteStudents();
    const student = students.find(item => item.uid === uid);
    if (!student) return;
    student.premium = !student.premium;
    student.lastActivity = new Date().toISOString();
    saveEliteStudents(students);
    syncEliteStudentToFirebase(student);

    const profileRaw = window.localStorage.getItem('bca_elite_student_profile');
    if (profileRaw) {
      try {
        const profile = JSON.parse(profileRaw);
        if (profile.uid === uid) {
          profile.premium = student.premium;
          profile.lastActivity = student.lastActivity;
          window.localStorage.setItem('bca_elite_student_profile', JSON.stringify(profile));
          window.localStorage.setItem('bca_elite_subscribed', String(student.premium));
        }
      } catch (error) {
        console.warn('Could not sync current elite profile:', error);
      }
    }

    showAdminToast(student.premium ? 'Elite premium access granted.' : 'Elite premium access revoked.', 'success');
    renderEliteManagementRoot();
  }

  function eliteToggleStudentBan(uid) {
    const students = getEliteStudents();
    const student = students.find(item => item.uid === uid);
    if (!student) return;
    student.banned = !student.banned;
    student.lastActivity = new Date().toISOString();
    saveEliteStudents(students);
    syncEliteStudentToFirebase(student);
    showAdminToast(student.banned ? 'Student banned from Elite Zone.' : 'Student unbanned.', 'success');
    renderEliteManagementRoot();
  }

  let eliteAdminActiveTab = 'batches';
  let eliteStudentsFirebaseSubscribed = false;
  let eliteProgressCache = {};

  function setEliteAdminTab(tab) {
    eliteAdminActiveTab = tab;
    renderEliteManagementRoot();
  }
  window.setEliteAdminTab = setEliteAdminTab;

  function subscribeEliteStudentsFromFirebase() {
    if (eliteStudentsFirebaseSubscribed || typeof db === 'undefined' || !db || typeof db.ref !== 'function') return;
    eliteStudentsFirebaseSubscribed = true;
    db.ref('elite_students').on('value', (snapshot) => {
      const value = snapshot.val() || {};
      const students = Object.keys(value).map((uid) => ({ uid, ...value[uid] }));
      saveEliteStudents(students);
      if (eliteAdminActiveTab === 'students') {
        renderEliteManagementRoot();
      }
    }, (error) => {
      console.warn('Elite students Firebase listener failed:', error.message);
    });
    db.ref('elite_progress').on('value', (snapshot) => {
      eliteProgressCache = snapshot.val() || {};
      if (eliteAdminActiveTab === 'students' || eliteAdminActiveTab === 'analytics') {
        renderEliteManagementRoot();
      }
    }, (error) => {
      console.warn('Elite progress Firebase listener failed:', error.message);
    });
  }

  function renderEliteResourceCards(batch) {
    if (!batch) {
      return `
        <div class="glass-card" style="padding:18px; color:var(--text-muted);">
          Select a batch to view and manage its resources.
        </div>
      `;
    }

    const rows = [];
    ['videos', 'notes', 'dpp', 'coding', 'pyq'].forEach((type) => {
      (batch.resources?.[type] || []).forEach((item, index) => {
        rows.push({ type, index, item });
      });
    });

    if (!rows.length) {
      return `
        <div class="glass-card" style="padding:18px; color:var(--text-muted); text-align:center;">
          No resources in this batch yet. Add premium content above.
        </div>
      `;
    }

    return rows.map(({ type, index, item }) => `
      <div class="glass-card" style="padding:16px; margin-bottom:12px; border:1px solid ${item.hidden ? 'rgba(239,68,68,0.2)' : 'var(--elite-border)'}; background: ${item.hidden ? 'rgba(239,68,68,0.02)' : 'transparent'};">
        <div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-start; flex-wrap:wrap;">
          <div style="flex:1; min-width:220px;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px; flex-wrap:wrap;">
              <span class="adm-settings-pill" data-tone="${type === 'videos' ? 'success' : 'info'}" style="text-transform:uppercase;">${escapeHtml(type)}</span>
              <span class="adm-settings-pill" style="background:rgba(212,175,55,0.1); color:var(--accent-gold); border:1px solid rgba(212,175,55,0.2);">${escapeHtml(item.subject || 'General')}</span>
              <strong>${escapeHtml(item.title || 'Untitled resource')}</strong>
              ${item.preview ? '<span class="adm-settings-pill" data-tone="success">Preview</span>' : ''}
              ${item.hidden ? '<span class="adm-settings-pill" data-tone="danger">Hidden</span>' : ''}
            </div>
            <div style="color:var(--text-muted); font-size:0.9rem; line-height:1.5;">${escapeHtml(item.detail || 'Access Link')}</div>
            ${item.url ? `<div style="margin-top:8px; font-size:0.8rem;"><a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer" style="color:var(--primary); text-decoration:none;">ðŸ”— Open Source Link</a></div>` : ''}
          </div>
          <div style="display:flex; gap:6px;">
            <button type="button" class="btn-outline" onclick="eliteToggleResourceHidden('${escapeHtml(batch.id)}','${escapeHtml(type)}',${index})">${item.hidden ? 'Show' : 'Hide'}</button>
            <button type="button" class="btn-outline" onclick="eliteMoveResource('${escapeHtml(batch.id)}','${escapeHtml(type)}',${index},-1)">â–²</button>
            <button type="button" class="btn-outline" onclick="eliteMoveResource('${escapeHtml(batch.id)}','${escapeHtml(type)}',${index},1)">â–¼</button>
            <button type="button" class="btn-danger" onclick="eliteDeleteResource('${escapeHtml(batch.id)}','${escapeHtml(type)}',${index})">Delete</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  function renderEliteManagementRoot() {
    const root = document.getElementById('eliteAdminRoot');
    if (!root) return;
    subscribeEliteStudentsFromFirebase();

    let batches = getEliteBatches();
    const settings = getEliteSettings();
    eliteSelectedBatchId = getEliteSeedBatchId(batches, settings);
    if (eliteEditingBatchId && !batches.some((batch) => batch.id === eliteEditingBatchId)) {
      eliteEditingBatchId = '';
    }

    const selectedBatch = getEliteBatchById(batches, eliteSelectedBatchId) || batches[0] || null;
    const editingBatch = eliteEditingBatchId ? getEliteBatchById(batches, eliteEditingBatchId) : null;
    const announcementLines = getEliteAnnouncementLines(settings);
    const resourceCount = batches.reduce((total, batch) => total + getEliteResourceCount(batch), 0);
    const featuredCount = batches.filter((batch) => batch.id === settings.featuredBatchId || batch.featured).length;

    const batchRows = batches.length
      ? batches.map((batch) => {
          const isSelected = batch.id === eliteSelectedBatchId;
          const isFeatured = batch.id === settings.featuredBatchId || batch.featured;
          return `
            <tr class="${isSelected ? 'record-row-new' : ''}" style="${isSelected ? 'background:rgba(99,102,241,0.08);' : ''}">
              <td style="font-size:1.4rem;">${escapeHtml(batch.thumb || 'ðŸ“š')}</td>
              <td>
                <strong>${escapeHtml(batch.title)}</strong>
                <div style="font-size:0.8rem; color:var(--text-muted); margin-top:4px;">${escapeHtml(batch.desc || '').slice(0, 80)}${(batch.desc || '').length > 80 ? '...' : ''}</div>
                <div style="font-size:0.75rem; color:var(--accent-gold); margin-top:2px;">Mentor: ${escapeHtml(batch.teacher || 'Vishal')} â€¢ Theme: ${escapeHtml(batch.autoTheme || inferEliteBatchTheme(batch))} â€¢ Subjects: ${(batch.subjects || []).join(', ')}</div>
              </td>
              <td>${escapeHtml(batch.semester === 'all' ? 'All' : `Sem ${batch.semester}`)}</td>
              <td><span class="adm-settings-pill">${escapeHtml(String(batch.type || 'exam').toUpperCase())}</span></td>
              <td>${getEliteResourceCount(batch)}</td>
              <td>
                ${batch.hidden ? '<span class="adm-settings-pill" data-tone="danger">Hidden</span>' : '<span class="adm-settings-pill" data-tone="success">Active</span>'}
              </td>
              <td>
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                  <button type="button" class="btn-outline" onclick="eliteSelectBatch('${escapeHtml(batch.id)}')">Classroom</button>
                  <button type="button" class="btn-outline" onclick="eliteEditBatch('${escapeHtml(batch.id)}')">Edit</button>
                  <button type="button" class="btn-outline" onclick="eliteFeatureBatch('${escapeHtml(batch.id)}')">${isFeatured ? 'Featured âœ“' : 'Feature'}</button>
                  <button type="button" class="btn-danger" onclick="eliteDeleteBatch('${escapeHtml(batch.id)}')">Delete</button>
                </div>
              </td>
            </tr>
          `;
        }).join('')
      : `<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:32px;">No premium batches found. Create one to start the library.</td></tr>`;

    // Dynamic Tabs styles inside render
    const tabsBar = `
      <div style="display:flex; gap:12px; margin-bottom:24px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:12px; flex-wrap:wrap;">
        <button type="button" class="btn-outline" style="background:${eliteAdminActiveTab === 'batches' ? 'rgba(212,175,55,0.1)' : 'transparent'}; border-color:${eliteAdminActiveTab === 'batches' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)'}; color:${eliteAdminActiveTab === 'batches' ? 'var(--accent-gold)' : 'var(--text-muted)'}; font-weight:700;" onclick="window.setEliteAdminTab('batches')">Batches & Library</button>
        <button type="button" class="btn-outline" style="background:${eliteAdminActiveTab === 'resources' ? 'rgba(212,175,55,0.1)' : 'transparent'}; border-color:${eliteAdminActiveTab === 'resources' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)'}; color:${eliteAdminActiveTab === 'resources' ? 'var(--accent-gold)' : 'var(--text-muted)'}; font-weight:700;" onclick="window.setEliteAdminTab('resources')">ðŸ“‚ Syllabus & Resources</button>
        <button type="button" class="btn-outline" style="background:${eliteAdminActiveTab === 'students' ? 'rgba(212,175,55,0.1)' : 'transparent'}; border-color:${eliteAdminActiveTab === 'students' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)'}; color:${eliteAdminActiveTab === 'students' ? 'var(--accent-gold)' : 'var(--text-muted)'}; font-weight:700;" onclick="window.setEliteAdminTab('students')">ðŸ‘¥ Student Access</button>
        <button type="button" class="btn-outline" style="background:${eliteAdminActiveTab === 'analytics' ? 'rgba(212,175,55,0.1)' : 'transparent'}; border-color:${eliteAdminActiveTab === 'analytics' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)'}; color:${eliteAdminActiveTab === 'analytics' ? 'var(--accent-gold)' : 'var(--text-muted)'}; font-weight:700;" onclick="window.setEliteAdminTab('analytics')">ðŸ“Š Analytics KPIs</button>
      </div>
    `;

    // 1. Batches tab content render
    let tabContent = '';
    if (eliteAdminActiveTab === 'batches') {
      const batchFormValues = editingBatch || {
        title: '',
        desc: '',
        thumb: '',
        semester: 'all',
        type: 'coding',
        duration: '120+ Masterclasses',
        teacher: 'Vishal Kumar',
        price: 1999,
        discountPrice: 499,
        subjects: ['Database Management', 'Data Structures'],
        features: ['120+ Masterclasses', 'Copyable Source Codes'],
        badge: 'Hottest Seller',
        hidden: false
      };

      const semesterOpts = ['all', '1', '2', '3', '4', '5', '6'].map((value) => `
        <option value="${value}" ${String(batchFormValues.semester) === String(value) ? 'selected' : ''}>${value === 'all' ? 'All' : `Sem ${value}`}</option>
      `).join('');

      const typeOpts = ['exam', 'coding', 'placement', 'crash', 'lab', 'language', 'notes'].map((value) => `
        <option value="${value}" ${String(batchFormValues.type) === String(value) ? 'selected' : ''}>${value.charAt(0).toUpperCase() + value.slice(1)}</option>
      `).join('');

      const themeOpts = [
        ['auto', 'Auto Smart Theme'],
        ['coding', 'Neon Tech'],
        ['math', 'Elegant Blue'],
        ['placement', 'Corporate Dark'],
        ['crash', 'Dynamic Red'],
        ['language', 'Minimal Clean'],
        ['lab', 'Cyber Lab']
      ].map(([value, label]) => `
        <option value="${value}" ${String(batchFormValues.autoTheme || 'auto') === String(value) ? 'selected' : ''}>${label}</option>
      `).join('');

      tabContent = `
        <div class="adm-dash-two-col">
          <div class="adm-panel">
            <div class="adm-section-head">
              <h3>${eliteEditingBatchId ? 'Edit Elite Batch' : 'Create Elite Batch'}</h3>
              <span class="adm-section-badge">${eliteEditingBatchId ? 'Editing' : 'New batch'}</span>
            </div>
            <form id="eliteBatchForm" onsubmit="event.preventDefault(); eliteSaveBatch();">
              <input type="hidden" id="eliteBatchId" value="${escapeHtml(editingBatch?.id || '')}" />
              <div class="admin-form-grid">
                <div class="form-group">
                  <label>Batch Title</label>
                  <input type="text" id="eliteBatchTitle" value="${escapeHtml(batchFormValues.title || '')}" placeholder="Placement Alpha 2026" />
                </div>
                <div class="form-group">
                  <label>Description</label>
                  <textarea id="eliteBatchDesc" rows="3" placeholder="Short description...">${escapeHtml(batchFormValues.desc || '')}</textarea>
                </div>
                <div class="form-group">
                  <label>Educator Name</label>
                  <input type="text" id="eliteBatchTeacher" value="${escapeHtml(batchFormValues.teacher || 'Vishal Kumar')}" />
                </div>
                        <div class="form-group">
                          <label>Thumbnail / Emoji</label>
                          <input type="text" id="eliteBatchThumb" value="${escapeHtml(batchFormValues.thumb || '')}" />
                        </div>
                <div class="form-group">
                  <label>Duration / Validity</label>
                  <input type="text" id="eliteBatchDuration" value="${escapeHtml(batchFormValues.duration || 'Flexible')}" placeholder="6 Months / 120+ Classes" />
                </div>
                <div class="form-group">
                  <label>Semester</label>
                  <select id="eliteBatchSemester">${semesterOpts}</select>
                </div>
                <div class="form-group">
                  <label>Type</label>
                  <select id="eliteBatchType">${typeOpts}</select>
                </div>
                <div class="form-group">
                  <label>Auto Poster Theme</label>
                  <select id="eliteBatchAutoTheme">${themeOpts}</select>
                </div>
                <div class="form-group">
                  <label>Poster Tags</label>
                  <input type="text" id="eliteBatchTags" value="${escapeHtml((batchFormValues.tags || []).join(', '))}" placeholder="Live, Premium, DPP" />
                </div>
                <div class="form-group">
                  <label>Batch Badge Banner</label>
                  <input type="text" id="eliteBatchBadge" value="${escapeHtml(batchFormValues.badge || '')}" placeholder="Hottest Seller / Sprint" />
                </div>
                <div class="form-group">
                  <label>Original Price (â‚¹)</label>
                  <input type="number" id="eliteBatchPriceVal" value="${batchFormValues.price || 1999}" />
                </div>
                <div class="form-group">
                  <label>Sale Discount Price (â‚¹)</label>
                  <input type="number" id="eliteBatchDiscountVal" value="${batchFormValues.discountPrice || 499}" />
                </div>
                <div class="form-group" style="grid-column:1/-1;">
                  <label>Subjects Catalog (Comma-separated)</label>
                  <input type="text" id="eliteBatchSubjects" value="${escapeHtml((batchFormValues.subjects || []).join(', '))}" placeholder="DBMS, Data Structures, Web Development" />
                </div>
                <div class="form-group" style="grid-column:1/-1;">
                  <label>Key Features List (Comma-separated)</label>
                  <input type="text" id="eliteBatchFeatures" value="${escapeHtml((batchFormValues.features || []).join(', '))}" placeholder="120+ Masterclasses, Source Codes" />
                </div>
                <div class="form-group" style="grid-column:1/-1; display:flex; align-items:center; gap:8px;">
                  <input type="checkbox" id="eliteBatchHidden" ${batchFormValues.hidden ? 'checked' : ''} style="width:auto; margin:0;" />
                  <label for="eliteBatchHidden" style="margin:0; cursor:pointer;">Hide batch from public landing catalog instantly</label>
                </div>
              </div>
              <div style="display:flex; gap:12px; margin-top:16px;">
                <button type="submit" class="btn-primary">${eliteEditingBatchId ? 'Update Batch' : 'Save Batch'}</button>
                <button type="button" class="btn-outline" onclick="eliteResetBatchForm()">Cancel</button>
              </div>
            </form>
          </div>

          <div class="adm-panel">
            <div class="adm-section-head">
              <h3>Batch Catalog</h3>
              <span class="adm-section-badge">${batches.length} total</span>
            </div>
            <div class="adm-table-container">
              <table class="adm-table" style="width:100%;">
                <thead>
                  <tr>
                    <th>Icon</th>
                    <th>Batch</th>
                    <th>Semester</th>
                    <th>Type</th>
                    <th>Resources</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${batchRows}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    }

    // 2. Syllabus & Resources tab content
    else if (eliteAdminActiveTab === 'resources') {
      const batchOptions = batches.map((batch) => `
        <option value="${escapeHtml(batch.id)}" ${batch.id === eliteSelectedBatchId ? 'selected' : ''}>${escapeHtml(batch.title)}</option>
      `).join('');

      let subjectOptions = '<option value="General Syllabus">General Syllabus</option>';
      if (selectedBatch && Array.isArray(selectedBatch.subjects)) {
        subjectOptions = selectedBatch.subjects.map(sub => `
          <option value="${escapeHtml(sub)}">${escapeHtml(sub)}</option>
        `).join('');
      }

      const resourceRows = renderEliteResourceCards(selectedBatch);

      tabContent = `
        <div class="adm-dash-two-col">
          <div class="adm-panel">
            <div class="adm-section-head">
              <h3>Syllabus Studio</h3>
              <span class="adm-section-badge">${selectedBatch ? escapeHtml(selectedBatch.title) : 'Select a batch'}</span>
            </div>
            <div class="glass-card" style="padding:16px; margin-bottom:16px; color:var(--text-muted); line-height:1.6; font-size:0.88rem;">
              Manually add videos, homework DPPs, PDF notes, codes and Solved PYQs. Set any item as "Free Preview" to let non-paid students watch/try!
            </div>
            
            <form id="eliteResourceForm" onsubmit="event.preventDefault(); eliteAddResource();">
              <div class="admin-form-grid">
                <div class="form-group">
                  <label>Target Classroom Batch</label>
                  <select id="eliteResourceBatch" onchange="window.eliteSelectBatch(this.value)">
                    ${batchOptions}
                  </select>
                </div>
                <div class="form-group">
                  <label>Content Type</label>
                  <select id="eliteResourceType" onchange="window.eliteToggleResourceFields(this.value)">
                    <option value="videos">Videos / Lectures</option>
                    <option value="notes">PDF Notes</option>
                    <option value="dpp">DPP Homework Sheet</option>
                    <option value="coding">Coding Bundles</option>
                    <option value="pyq">Solved PYQ Papers</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Resource Title</label>
                  <input type="text" id="eliteResourceTitle" placeholder="DBMS Normalization / BST Traversals" required />
                </div>
                <div class="form-group">
                  <label>Duration / Details Label</label>
                  <input type="text" id="eliteResourceDetail" placeholder="45 mins / 2.4 MB PDF" />
                </div>
                <div class="form-group">
                  <label>Syllabus Subject Category</label>
                  <select id="eliteResourceSubject">
                    ${subjectOptions}
                  </select>
                </div>
                <div class="form-group">
                  <label>Resource / Video URL</label>
                  <input type="url" id="eliteResourceUrl" placeholder="https://www.youtube.com/embed/..." />
                </div>

                <!-- Lecture Specific Details Grid -->
                <div id="lectureSpecificFields" style="grid-column: 1/-1; display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                  <div class="form-group">
                    <label>Attached Notes PDF URL (Optional)</label>
                    <input type="text" id="eliteLectureNotesUrl" value="#" />
                  </div>
                  <div class="form-group">
                    <label>Attached DPP URL (Optional)</label>
                    <input type="text" id="eliteLectureDppUrl" value="#" />
                  </div>
                  <div class="form-group" style="grid-column: 1/-1;">
                    <label>Lecture Lab Code Snippet (Optional)</label>
                    <textarea id="eliteLectureCode" rows="4" placeholder="#include <iostream>..."></textarea>
                  </div>
                </div>

                <div class="form-group" style="grid-column: 1/-1; display: flex; gap: 20px;">
                  <label style="display:flex; align-items:center; gap:6px; cursor:pointer; margin:0;">
                    <input type="checkbox" id="eliteResourcePreview" style="width:auto; margin:0;" /> Free Preview
                  </label>
                  <label style="display:flex; align-items:center; gap:6px; cursor:pointer; margin:0;">
                    <input type="checkbox" id="eliteResourceHidden" style="width:auto; margin:0;" /> Hidden Content
                  </label>
                </div>
              </div>
              <div style="display:flex; gap:12px; margin-top:20px;">
                <button type="submit" class="btn-primary">Add to Classroom</button>
                <button type="button" class="btn-outline" onclick="eliteResetResourceForm()">Reset Form</button>
              </div>
            </form>
          </div>

          <div class="adm-panel">
            <div class="adm-section-head">
              <h3>Syllabus Content Drawer</h3>
              <span class="adm-section-badge">${selectedBatch ? getEliteResourceCount(selectedBatch) : 0} items</span>
            </div>
            <div style="margin-top: 10px;">
              ${resourceRows}
            </div>
          </div>
        </div>
      `;
    }

    // 3. Student Enrollment Management tab content
    else if (eliteAdminActiveTab === 'students') {
      const eliteStudents = getEliteStudents();
      const premiumCount = eliteStudents.filter(student => student.premium).length;
      const bannedCount = eliteStudents.filter(student => student.banned).length;
      const studentRows = eliteStudents.length
        ? eliteStudents.map((student) => {
          const progress = eliteProgressCache[student.uid] || {};
          const watchedCount = Array.isArray(progress.watchedLectures) ? progress.watchedLectures.length : (Array.isArray(progress.lectureCompleted) ? progress.lectureCompleted.length : 0);
          return `
          <tr style="${student.banned ? 'background:rgba(239,68,68,0.04);' : ''}">
            <td>
              <div style="display:flex;align-items:center;gap:10px;">
                ${student.profileImage ? `<img src="${escapeHtml(student.profileImage)}" alt="" style="width:34px;height:34px;border-radius:50%;object-fit:cover;border:1px solid rgba(255,255,255,0.14);" />` : '<div style="width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:rgba(139,92,246,0.12);border:1px solid rgba(139,92,246,0.2);">G</div>'}
                <div>
                  <strong>${escapeHtml(student.name || 'Unnamed Student')}</strong>
                  <div style="font-size:0.72rem;color:${student.googleVerified ? '#10b981' : 'var(--text-muted)'};margin-top:3px;">${student.googleVerified ? 'Google verified' : 'Manual profile'}</div>
                </div>
              </div>
              <div style="font-size:0.78rem;color:var(--text-muted);margin-top:4px;">UID: ${escapeHtml(student.uid || 'local')}</div>
            </td>
            <td>
              ${escapeHtml(student.email || 'Not provided')}
              <div style="font-size:0.78rem;color:var(--text-muted);margin-top:4px;">${escapeHtml(student.phone || 'No phone')}</div>
            </td>
            <td>
              Sem ${escapeHtml(student.semester || '-')} | Roll: ${escapeHtml(student.rollNo || '-')}
              <div style="font-size:0.78rem;color:var(--text-muted);margin-top:4px;">${escapeHtml(student.college || 'No college')}</div>
            </td>
            <td style="max-width:240px;color:var(--text-muted);font-size:0.84rem;">${escapeHtml(student.address || 'No address')}</td>
            <td>
              ${(student.purchasedBatchNames || []).length
                ? (student.purchasedBatchNames || []).map(name => `<span class="adm-settings-pill" style="margin:2px;">${escapeHtml(name)}</span>`).join('')
                : '<span class="adm-settings-pill">No batch</span>'}
            </td>
            <td>
              ${student.banned ? '<span class="adm-settings-pill" data-tone="danger">Banned</span>' : student.premium ? '<span class="adm-settings-pill" data-tone="success">Premium</span>' : '<span class="adm-settings-pill">Free</span>'}
              <div style="font-size:0.75rem;color:var(--text-muted);margin-top:6px;">Login: ${formatEliteDate(student.lastLoginAt || student.lastActivity || student.updatedAt || student.createdAt)}</div>
              <div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;">Progress: ${watchedCount} lectures • ${Math.round((progress.watchTimeMinutes || 0) / 60)}h</div>
            </td>
            <td>
              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <button class="btn-outline" onclick="window.eliteToggleStudentPremium('${escapeHtml(student.uid)}')">${student.premium ? 'Remove Premium' : 'Give Premium'}</button>
                <button class="btn-outline" onclick="window.eliteToggleStudentBan('${escapeHtml(student.uid)}')">${student.banned ? 'Unban' : 'Ban'}</button>
              </div>
            </td>
          </tr>
        `}).join('')
        : `<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:34px;">No Elite registrations yet. Student jab Elite page par registration save karega, yaha record show hoga.</td></tr>`;

      tabContent = `
        <div class="adm-panel">
          <div class="adm-section-head">
            <h3>ðŸ‘¥ Elite Student Registration & Access</h3>
            <span class="adm-section-badge">${eliteStudents.length} registered</span>
          </div>
          <p style="color:var(--text-muted); font-size:0.9rem; line-height:1.6; margin-bottom:20px;">
            Google-style student registration data: phone, semester, roll number, college, address, purchased batches, premium state, and ban controls. Firebase me ye users/payments/progress collections se directly map hoga.
          </p>

          <div class="adm-kpi-grid" style="margin-bottom:22px;">
            <div class="adm-kpi-card" style="--kpi-color:#10b981;--kpi-bg:rgba(16,185,129,0.1);">
              <div class="adm-kpi-top"><h4>Premium Students</h4><span>Live</span></div>
              <div class="adm-kpi-value">${premiumCount}</div>
              <div class="adm-kpi-label">Access granted</div>
            </div>
            <div class="adm-kpi-card" style="--kpi-color:#8b5cf6;--kpi-bg:rgba(139,92,246,0.1);">
              <div class="adm-kpi-top"><h4>Total Registrations</h4><span>Elite</span></div>
              <div class="adm-kpi-value">${eliteStudents.length}</div>
              <div class="adm-kpi-label">Saved student profiles</div>
            </div>
            <div class="adm-kpi-card" style="--kpi-color:#ef4444;--kpi-bg:rgba(239,68,68,0.1);">
              <div class="adm-kpi-top"><h4>Banned</h4><span>Control</span></div>
              <div class="adm-kpi-value">${bannedCount}</div>
              <div class="adm-kpi-label">Blocked accounts</div>
            </div>
          </div>

          <div class="adm-table-container">
            <table class="adm-table" style="width:100%;">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Contact</th>
                  <th>Academic</th>
                  <th>Address</th>
                  <th>Purchased Batches</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${studentRows}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // 4. Analytics Overview tab content
    else if (eliteAdminActiveTab === 'analytics') {
      tabContent = `
        <div class="adm-panel">
          <div class="adm-section-head">
            <h3>ðŸ“ˆ Growth, Progress & Learning Trajectory</h3>
            <span class="adm-section-badge">Calculated Analytics</span>
          </div>
          
          <div class="adm-kpi-grid" style="margin: 20px 0 30px;">
            <div class="adm-kpi-card" style="--kpi-color:#8b5cf6;--kpi-bg:rgba(139,92,246,0.1);">
              <div class="adm-kpi-top"><h4>Weekly Watch Hours</h4><span>+18%</span></div>
              <div class="adm-kpi-value">482 Hrs</div>
              <div class="adm-kpi-label">Simulated Video views</div>
            </div>
            <div class="adm-kpi-card" style="--kpi-color:#f59e0b;--kpi-bg:rgba(245,158,11,0.1);">
              <div class="adm-kpi-top"><h4>Average Course Progress</h4><span>38%</span></div>
              <div class="adm-kpi-value">44% Watch Rate</div>
              <div class="adm-kpi-label">Syllabus Completion</div>
            </div>
            <div class="adm-kpi-card" style="--kpi-color:#10b981;--kpi-bg:rgba(16,185,129,0.1);">
              <div class="adm-kpi-top"><h4>Elite Coupon usage</h4><span>ELITE100</span></div>
              <div class="adm-kpi-value">84 Redeem</div>
              <div class="adm-kpi-label">100% Free Promo Checkouts</div>
            </div>
          </div>

          <div style="padding: 20px; border-radius:12px; background:rgba(255,255,255,0.01); border:1px solid var(--elite-border); text-align:center;">
            <h4 style="margin:0 0 10px; font-family:var(--font-outfit); text-align:left;">SaaS MRR Trajectory Analytics</h4>
            <!-- High fidelity SVG Chart -->
            <svg viewBox="0 0 800 240" style="width:100%; height:auto; overflow:visible; display:block;">
              <defs>
                <linearGradient id="svgGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="var(--accent-gold)" stop-opacity="0.3"></stop>
                  <stop offset="100%" stop-color="var(--accent-gold)" stop-opacity="0.0"></stop>
                </linearGradient>
              </defs>
              <!-- Grid lines -->
              <line x1="0" y1="40" x2="800" y2="40" stroke="rgba(255,255,255,0.03)" stroke-width="1"></line>
              <line x1="0" y1="100" x2="800" y2="100" stroke="rgba(255,255,255,0.03)" stroke-width="1"></line>
              <line x1="0" y1="160" x2="800" y2="160" stroke="rgba(255,255,255,0.03)" stroke-width="1"></line>
              <line x1="0" y1="220" x2="800" y2="220" stroke="rgba(255,255,255,0.05)" stroke-width="2"></line>
              
              <!-- Growth Path -->
              <path d="M 0,220 C 150,180 300,100 450,80 C 600,60 700,20 800,15" fill="none" stroke="var(--accent-gold)" stroke-width="4"></path>
              <path d="M 0,220 C 150,180 300,100 450,80 C 600,60 700,20 800,15 L 800,220 L 0,220 Z" fill="url(#svgGrad)"></path>
              
              <!-- Trajectory dots -->
              <circle cx="0" cy="220" r="6" fill="#070707" stroke="var(--accent-gold)" stroke-width="3"></circle>
              <circle cx="150" cy="195" r="6" fill="#070707" stroke="var(--accent-gold)" stroke-width="3"></circle>
              <circle cx="300" cy="130" r="6" fill="#070707" stroke="var(--accent-gold)" stroke-width="3"></circle>
              <circle cx="450" cy="80" r="6" fill="#070707" stroke="var(--accent-gold)" stroke-width="3"></circle>
              <circle cx="600" cy="60" r="6" fill="#070707" stroke="var(--accent-gold)" stroke-width="3"></circle>
              <circle cx="800" cy="15" r="8" fill="var(--accent-pink)" stroke="#fff" stroke-width="3"></circle>
            </svg>
            <div style="display:flex; justify-content:space-between; margin-top:12px; font-size:0.8rem; color:var(--text-dim);">
              <span>Jan (Start)</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May (Current)</span>
            </div>
          </div>
        </div>
      `;
    }

    root.innerHTML = `
      <div class="adm-route-card glass-card" style="margin-bottom:24px; padding:24px;">
        <div style="display:flex; justify-content:space-between; gap:16px; flex-wrap:wrap; align-items:flex-start;">
          <div style="max-width:840px;">
            <div class="adm-settings-nav-kicker">Premium EdTech Console</div>
            <h3 style="font-size:1.6rem; font-weight:900; margin-top:10px; font-family:var(--font-outfit); color:var(--text-white);">ðŸŽ“ Elite Batch & Classroom Studio</h3>
            <p style="color:var(--text-muted); line-height:1.6; margin-top:8px; font-size:0.92rem;">
              Physics Wallah structure with dynamic ed-tech batches. Seamless live updates with student dashboards, locked previews, and manual re-ordering arrows!
            </p>
          </div>
          <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <button type="button" class="btn-outline" onclick="eliteOpenPublicSite()">Open Public Site</button>
            <button type="button" class="btn-outline" onclick="eliteResetDemoData()">Restore Default seeds</button>
          </div>
        </div>
      </div>

      <div class="adm-kpi-grid" style="margin-bottom:24px;">
        <div class="adm-kpi-card" style="--kpi-color:#00e5ff;--kpi-bg:rgba(0,229,255,0.1);">
          <div class="adm-kpi-top"><div class="adm-kpi-icon-box">ðŸ’Ž</div><span class="adm-kpi-trend trend-up">Live</span></div>
          <div class="adm-kpi-value">${batches.length}</div>
          <div class="adm-kpi-label">Elite Batches</div>
        </div>
        <div class="adm-kpi-card" style="--kpi-color:#10b981;--kpi-bg:rgba(16,185,129,0.1);">
          <div class="adm-kpi-top"><div class="adm-kpi-icon-box">ðŸ“š</div><span class="adm-kpi-trend trend-up">Active</span></div>
          <div class="adm-kpi-value">${resourceCount}</div>
          <div class="adm-kpi-label">Classroom Chapters</div>
        </div>
        <div class="adm-kpi-card" style="--kpi-color:#f59e0b;--kpi-bg:rgba(245,158,11,0.1);">
          <div class="adm-kpi-top"><div class="adm-kpi-icon-box">ðŸ“¢</div><span class="adm-kpi-trend trend-flat">Queued</span></div>
          <div class="adm-kpi-value">${announcementLines.length}</div>
          <div class="adm-kpi-label">Ticker Announcements</div>
        </div>
        <div class="adm-kpi-card" style="--kpi-color:#8b5cf6;--kpi-bg:rgba(139,92,246,0.1);">
          <div class="adm-kpi-top"><div class="adm-kpi-icon-box">â­</div><span class="adm-kpi-trend trend-up">Featured</span></div>
          <div class="adm-kpi-value">${featuredCount}</div>
          <div class="adm-kpi-label">Featured Banners</div>
        </div>
      </div>

      <!-- Dynamic navigation bar -->
      ${tabsBar}

      <!-- Dynamic Tab content -->
      ${tabContent}
    `;

    // Ensure hidden lecture specific fields display properly on load if active
    eliteToggleResourceFields(document.getElementById('eliteResourceType')?.value || 'videos');
  }

  function eliteToggleResourceFields(value) {
    const fields = document.getElementById('lectureSpecificFields');
    if (!fields) return;
    if (value === 'videos') {
      fields.style.display = 'grid';
    } else {
      fields.style.display = 'none';
    }
  }
  window.eliteToggleResourceFields = eliteToggleResourceFields;

  function eliteAdminToggleAccess() {
    const state = localStorage.getItem('bca_elite_subscribed') === 'true';
    localStorage.setItem('bca_elite_subscribed', String(!state));
    showAdminToast(state ? 'Elite subscription revoked.' : 'Elite subscription activated!', 'success');
    renderEliteManagementRoot();
  }
  window.eliteAdminToggleAccess = eliteAdminToggleAccess;

  function loadEliteManagement() {
    renderEliteManagementRoot();
  }

  function eliteResetBatchForm() {
    eliteEditingBatchId = '';
    renderEliteManagementRoot();
  }

  function eliteResetResourceForm() {
    const title = document.getElementById('eliteResourceTitle');
    const detail = document.getElementById('eliteResourceDetail');
    const url = document.getElementById('eliteResourceUrl');
    const notesUrl = document.getElementById('eliteLectureNotesUrl');
    const dppUrl = document.getElementById('eliteLectureDppUrl');
    const code = document.getElementById('eliteLectureCode');
    const preview = document.getElementById('eliteResourcePreview');
    const hidden = document.getElementById('eliteResourceHidden');

    if (title) title.value = '';
    if (detail) detail.value = '';
    if (url) url.value = '';
    if (notesUrl) notesUrl.value = '#';
    if (dppUrl) dppUrl.value = '#';
    if (code) code.value = '';
    if (preview) preview.checked = false;
    if (hidden) hidden.checked = false;
  }

  function eliteSelectBatch(batchId) {
    eliteSelectedBatchId = batchId;
    window.localStorage.setItem('eliteSelectedBatchId', batchId);
    renderEliteManagementRoot();
  }

  function eliteEditBatch(batchId) {
    eliteEditingBatchId = batchId;
    eliteSelectedBatchId = batchId;
    window.localStorage.setItem('eliteSelectedBatchId', batchId);
    eliteAdminActiveTab = 'batches';
    renderEliteManagementRoot();
  }

  function eliteFeatureBatch(batchId) {
    const settings = getEliteSettings();
    settings.featuredBatchId = batchId;
    saveEliteSettings(settings);
    eliteSelectedBatchId = batchId;
    window.localStorage.setItem('eliteSelectedBatchId', batchId);
    showAdminToast('Featured batch updated.', 'success');
    refreshAdminIntelligence();
    renderEliteManagementRoot();
  }

  function eliteSaveBatch() {
    const title = document.getElementById('eliteBatchTitle')?.value.trim();
    const desc = document.getElementById('eliteBatchDesc')?.value.trim();
    const semester = document.getElementById('eliteBatchSemester')?.value || 'all';
    const thumb = document.getElementById('eliteBatchThumb')?.value.trim() || '';
    const type = document.getElementById('eliteBatchType')?.value || 'coding';
    const duration = document.getElementById('eliteBatchDuration')?.value.trim() || 'Flexible';
    const teacher = document.getElementById('eliteBatchTeacher')?.value.trim() || 'Vishal Kumar';
    const autoThemeValue = document.getElementById('eliteBatchAutoTheme')?.value || 'auto';
    const priceVal = parseInt(document.getElementById('eliteBatchPriceVal')?.value || '1999', 10);
    const discountVal = parseInt(document.getElementById('eliteBatchDiscountVal')?.value || '499', 10);
    const badge = document.getElementById('eliteBatchBadge')?.value.trim() || '';
    const hidden = document.getElementById('eliteBatchHidden')?.checked || false;

    const subjectsString = document.getElementById('eliteBatchSubjects')?.value.trim() || 'General Syllabus';
    const featuresString = document.getElementById('eliteBatchFeatures')?.value.trim() || '';
    const tagsString = document.getElementById('eliteBatchTags')?.value.trim() || '';

    const subjects = subjectsString.split(',').map(s => s.trim()).filter(Boolean);
    const features = featuresString.split(',').map(s => s.trim()).filter(Boolean);
    const tags = tagsString.split(',').map(s => s.trim()).filter(Boolean);
    const autoTheme = autoThemeValue === 'auto' ? inferEliteBatchTheme({ title, type, subjects, features }) : autoThemeValue;

    const editId = document.getElementById('eliteBatchId')?.value.trim() || eliteEditingBatchId || '';

    if (!title || !desc) {
      showAdminToast('Batch title and description are required.', 'warning');
      return;
    }

    const batches = getEliteBatches();
    const updated = editId
      ? batches.map((batch) => batch.id === editId ? { 
          ...batch, 
          title, title, desc, desc, semester, thumb, thumb, type, duration, teacher, 
          price: priceVal, discountPrice: discountVal, badge, hidden, subjects, features, tags, autoTheme, posterIcon: thumb 
        } : batch)
      : [...batches, normalizeEliteBatch({
          id: `elite_${Date.now()}`,
          title,
          desc,
          semester,
          thumb,
          type,
          duration,
          teacher,
          price: priceVal,
          discountPrice: discountVal,
          badge,
          hidden,
          subjects,
          features,
          tags,
          autoTheme,
          posterIcon: thumb,
          resources: { videos: [], notes: [], dpp: [], coding: [], pyq: [] },
        })];

    saveEliteBatches(updated);
    eliteSelectedBatchId = editId || updated[updated.length - 1]?.id || eliteSelectedBatchId;
    window.localStorage.setItem('eliteSelectedBatchId', eliteSelectedBatchId);
    eliteEditingBatchId = '';
    showAdminToast(editId ? 'Elite batch updated.' : 'Elite batch created.', 'success');
    refreshAdminIntelligence();
    renderEliteManagementRoot();
  }

  function eliteDeleteBatch(batchId) {
    if (getAdminSettingsState().general.confirmations !== false && !window.confirm('Delete this batch and all of its resources?')) {
      return;
    }

    const batches = getEliteBatches().filter((batch) => batch.id !== batchId);
    saveEliteBatches(batches);
    if (eliteSelectedBatchId === batchId) {
      eliteSelectedBatchId = batches[0]?.id || '';
      window.localStorage.setItem('eliteSelectedBatchId', eliteSelectedBatchId);
    }
    if (eliteEditingBatchId === batchId) {
      eliteEditingBatchId = '';
    }

    const settings = getEliteSettings();
    if (settings.featuredBatchId === batchId) {
      settings.featuredBatchId = '';
      saveEliteSettings(settings);
    }
    showAdminToast('Elite batch deleted.', 'success');
    refreshAdminIntelligence();
    renderEliteManagementRoot();
  }

  function eliteAddResource() {
    const batchId = document.getElementById('eliteResourceBatch')?.value || eliteSelectedBatchId;
    const type = document.getElementById('eliteResourceType')?.value || 'videos';
    const title = document.getElementById('eliteResourceTitle')?.value.trim();
    const detail = document.getElementById('eliteResourceDetail')?.value.trim();
    const url = document.getElementById('eliteResourceUrl')?.value.trim();
    const subject = document.getElementById('eliteResourceSubject')?.value || 'General Syllabus';
    const preview = document.getElementById('eliteResourcePreview')?.checked || false;
    const hidden = document.getElementById('eliteResourceHidden')?.checked || false;

    // Video specific attachments
    const notesUrl = document.getElementById('eliteLectureNotesUrl')?.value.trim() || '#';
    const dppUrl = document.getElementById('eliteLectureDppUrl')?.value.trim() || '#';
    const codeSnippet = document.getElementById('eliteLectureCode')?.value || '';

    if (!batchId) {
      showAdminToast('Create or select a batch first.', 'warning');
      return;
    }
    if (!title) {
      showAdminToast('Resource title is required.', 'warning');
      return;
    }

    const batches = getEliteBatches();
    const batch = getEliteBatchById(batches, batchId);
    if (!batch) {
      showAdminToast('Selected batch was not found.', 'error');
      return;
    }

    if (!batch.resources[type]) {
      batch.resources[type] = [];
    }

    const newItem = {
      id: `lec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title,
      detail,
      url,
      subject,
      preview,
      hidden
    };

    if (type === 'videos') {
      newItem.notesUrl = notesUrl;
      newItem.dppUrl = dppUrl;
      newItem.codeSnippet = codeSnippet;
    }

    batch.resources[type].push(newItem);

    saveEliteBatches(batches);
    eliteSelectedBatchId = batchId;
    window.localStorage.setItem('eliteSelectedBatchId', batchId);
    eliteResetResourceForm();
    showAdminToast('Elite resource added to classroom.', 'success');
    refreshAdminIntelligence();
    renderEliteManagementRoot();
  }

  function eliteToggleResourceHidden(batchId, type, index) {
    const batches = getEliteBatches();
    const batch = getEliteBatchById(batches, batchId);
    if (!batch || !Array.isArray(batch.resources?.[type])) return;

    const item = batch.resources[type][index];
    item.hidden = !item.hidden;

    saveEliteBatches(batches);
    showAdminToast(item.hidden ? 'Content is now hidden.' : 'Content is now live!', 'success');
    refreshAdminIntelligence();
    renderEliteManagementRoot();
  }
  window.eliteToggleResourceHidden = eliteToggleResourceHidden;

  function eliteDeleteResource(batchId, type, index) {
    const batches = getEliteBatches();
    const batch = getEliteBatchById(batches, batchId);
    if (!batch || !Array.isArray(batch.resources?.[type])) return;

    batch.resources[type].splice(index, 1);
    saveEliteBatches(batches);
    showAdminToast('Elite resource deleted.', 'success');
    refreshAdminIntelligence();
    renderEliteManagementRoot();
  }

  function eliteOpenPublicSite() {
    // Elite Zone removed
  }

  function eliteOpenSettings() {
    sessionStorage.setItem(ACTIVE_SECTION_KEY, 'general');
    window.switchAdminTab('settings');
  }

  function eliteResetDemoData() {
    if (getAdminSettingsState().general.confirmations !== false && !window.confirm('Restore the default premium demo batches and settings?')) {
      return;
    }

    saveEliteBatches(cloneEliteBatches());
    saveEliteSettings(deepClone(DEFAULT_SETTINGS.elite));
    eliteSelectedBatchId = '';
    eliteEditingBatchId = '';
    window.localStorage.setItem('eliteSelectedBatchId', '');
    showAdminToast('Elite demo data restored.', 'success');
    refreshAdminIntelligence();
    renderEliteManagementRoot();
  }

  function eliteMoveResource(batchId, type, index, direction) {
    const batches = getEliteBatches();
    const batch = getEliteBatchById(batches, batchId);
    if (!batch || !Array.isArray(batch.resources?.[type])) return;
    
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= batch.resources[type].length) return;
    
    const temp = batch.resources[type][index];
    batch.resources[type][index] = batch.resources[type][targetIndex];
    batch.resources[type][targetIndex] = temp;
    
    saveEliteBatches(batches);
    showAdminToast('Resource order updated.', 'success');
    refreshAdminIntelligence();
    renderEliteManagementRoot();
  }
  window.eliteMoveResource = eliteMoveResource;

  function generateAuditLogs() {
    const logs = [
      "<b>Vishal Kumar</b> subscribed to <i>Placement Alpha 2026 Batch</i> [12 mins ago]",
      "<b>Amit Verma</b> completed <i>DBMS Normalization Test</i> (+30 XP) [25 mins ago]",
      "<b>Priya Sharma</b> posted database Normalization doubt query [48 mins ago]",
      "<b>You (Admin)</b> deployed new high-fidelity video: <i>C Programming Arrays</i> [1 hr ago]",
      "<b>BCA Scholar</b> claimed Friday Daily Attendance reward (+50 XP) [2 hrs ago]"
    ];
    return logs.map(log => `<div style="border-bottom:1px solid rgba(255,255,255,0.03); padding:8px 0; font-size:0.8rem; color:#94a3b8;">${log}</div>`).join('');
  }

  window.loadEliteManagement = loadEliteManagement;
  window.eliteResetBatchForm = eliteResetBatchForm;
  window.eliteResetResourceForm = eliteResetResourceForm;
  window.eliteSelectBatch = eliteSelectBatch;
  window.eliteEditBatch = eliteEditBatch;
  window.eliteFeatureBatch = eliteFeatureBatch;
  window.eliteSaveBatch = eliteSaveBatch;
  window.eliteDeleteBatch = eliteDeleteBatch;  window.loadEliteManagement = loadEliteManagement;
  window.eliteResetBatchForm = eliteResetBatchForm;
  window.eliteResetResourceForm = eliteResetResourceForm;
  window.eliteSelectBatch = eliteSelectBatch;
  window.eliteEditBatch = eliteEditBatch;
  window.eliteFeatureBatch = eliteFeatureBatch;
  window.eliteSaveBatch = eliteSaveBatch;
  window.eliteDeleteBatch = eliteDeleteBatch;
  window.eliteAddResource = eliteAddResource;
  window.eliteDeleteResource = eliteDeleteResource;
  window.eliteToggleStudentPremium = eliteToggleStudentPremium;
  window.eliteToggleStudentBan = eliteToggleStudentBan;
  window.eliteOpenPublicSite = eliteOpenPublicSite;
  window.eliteOpenSettings = eliteOpenSettings;
  window.eliteResetDemoData = eliteResetDemoData;

  function updateSectionNavigation(sectionId) {
    if (!sectionId || adminSettingsNavUpdating) return;
    adminSettingsNavUpdating = true;
    sessionStorage.setItem(ACTIVE_SECTION_KEY, sectionId);
    const navButtons = document.querySelectorAll('[data-settings-section]');
    navButtons.forEach((button) => {
      button.classList.toggle('active', button.getAttribute('data-settings-section') === sectionId);
    });

    const panels = document.querySelectorAll('[data-settings-section-panel]');
    panels.forEach((panel) => {
      const open = panel.getAttribute('data-settings-section-panel') === sectionId;
      panel.open = open;
      if (open) {
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    adminSettingsNavUpdating = false;
  }

  function syncRangeLabels(path, value) {
    const target = document.querySelector(`[data-setting-value-for="${CSS.escape(path)}"]`);
    if (target) {
      const control = SETTINGS_SECTIONS.flatMap((section) => section.controls).find((item) => item.path === path);
      const unit = control && control.unit ? control.unit : '';
      target.textContent = `${value}${unit}`;
    }
  }

  function onSettingChange(path, rawValue, control) {
    const state = getAdminSettingsState();
    const previousState = deepClone(state);
    const currentValue = getByPath(state, path);
    let value = rawValue;

    if (control.type === 'switch') {
      value = !!rawValue;
    } else if (control.type === 'number' || control.type === 'range') {
      value = safeNumber(rawValue, safeNumber(currentValue, 0));
    }

    if (control.path === 'appearance.accentColor') {
      value = normalizeHexColor(value);
    }

    if (value === currentValue) {
      return;
    }

    if (state.general?.undoAction) {
      const history = readAdminStorage(`${STORAGE_KEY}:history`);
      const list = Array.isArray(history) ? history : [];
      list.unshift({ updatedAt: Date.now(), state: previousState });
      writeAdminStorage(`${STORAGE_KEY}:history`, list.slice(0, 12));
    }

    setByPath(state, path, value);
    adminSettingsState = state;
    applyAdminAppearanceSettings(state);
    syncRangeLabels(path, value);
    persistAdminSettings(false);
    pushAdminLog(`Changed ${path} to ${formatSettingValue(control, value)}`);

    if (path === 'dashboard.autoRefresh') {
      restartDashboardRefresh(value);
    }
    if (path === 'appearance.theme' || path === 'appearance.sidebarStyle' || path === 'appearance.compactMode' || path === 'appearance.animations') {
      renderSettingsRoot();
      updateSectionNavigation(sessionStorage.getItem(ACTIVE_SECTION_KEY) || 'general');
    }
    if (path.startsWith('dashboard.widgets.') || path === 'dashboard.analyticsVisible') {
      applyAdminAppearanceSettings(state);
    }
  }

  function triggerAdminAction(actionName) {
    const state = getAdminSettingsState();

    if (actionName === 'save') {
      persistAdminSettings(true);
      showAdminToast('Settings saved.', 'success');
      pushAdminLog('Saved settings manually');
      return;
    }

    if (actionName === 'undo') {
      if (!state.general?.undoAction) {
        showAdminToast('Undo is disabled in settings.', 'warning');
        return;
      }
      const history = readAdminStorage(`${STORAGE_KEY}:history`);
      const list = Array.isArray(history) ? history : [];
      const snapshot = list.shift();
      if (!snapshot || !snapshot.state) {
        showAdminToast('Nothing to undo yet.', 'info');
        return;
      }
      writeAdminStorage(`${STORAGE_KEY}:history`, list);
      adminSettingsState = mergeDeep(DEFAULT_SETTINGS, snapshot.state);
      applyAdminAppearanceSettings(adminSettingsState);
      persistAdminSettings(true);
      renderSettingsRoot();
      showAdminToast('Last change restored.', 'success');
      pushAdminLog('Undid the last settings change');
      return;
    }

    if (actionName === 'reset') {
      if (state.general?.confirmations !== false && !window.confirm('Reset all admin settings to their default values?')) {
        return;
      }
      adminSettingsState = deepClone(DEFAULT_SETTINGS);
      writeAdminStorage(`${STORAGE_KEY}:history`, []);
      applyAdminAppearanceSettings(adminSettingsState);
      persistAdminSettings(true);
      renderSettingsRoot();
      showAdminToast('Settings reset to defaults.', 'success');
      pushAdminLog('Reset settings to defaults');
      return;
    }

    if (actionName === 'palette') {
      openAdminCommandPalette('');
      return;
    }

    if (actionName === 'backupNow') {
      exportAdminBackup('manual');
      return;
    }

    if (actionName === 'restoreBackup') {
      importAdminBackup();
      return;
    }

    if (actionName === 'exportDatabase') {
      exportAdminSnapshot();
      return;
    }

    if (actionName === 'clearCache') {
      clearAdminCache();
      return;
    }

    if (actionName === 'databaseViewer') {
      openAdminJsonViewer('Database Viewer', buildAdminSnapshot());
      return;
    }

    if (actionName === 'logsViewer') {
      openAdminJsonViewer('Logs Viewer', readAdminLogs());
      return;
    }
  }

  function bindSettingsEvents() {
    const root = document.getElementById('adminSettingsRoot');
    if (!root) return;

    root.querySelectorAll('[data-setting-path]').forEach((input) => {
      const path = input.getAttribute('data-setting-path');
      const control = SETTINGS_SECTIONS.flatMap((section) => section.controls).find((item) => item.path === path);
      if (!control) return;

      const handler = () => {
        const isSwitch = control.type === 'switch';
        const rawValue = isSwitch ? input.checked : input.value;
        onSettingChange(path, rawValue, control);
      };

      input.addEventListener(control.type === 'switch' ? 'change' : 'input', handler);
      if (control.type === 'range') {
        input.addEventListener('input', () => syncRangeLabels(path, input.value));
      }
    });

    root.querySelectorAll('[data-settings-section]').forEach((button) => {
      button.addEventListener('click', () => {
        updateSectionNavigation(button.getAttribute('data-settings-section'));
      });
    });

    root.querySelectorAll('[data-admin-settings-action]').forEach((button) => {
      button.addEventListener('click', () => {
        triggerAdminAction(button.getAttribute('data-admin-settings-action'));
      });
    });

    root.querySelectorAll('[data-admin-settings-command]').forEach((button) => {
      button.addEventListener('click', () => openAdminCommandPalette(''));
    });

    root.querySelectorAll('[data-settings-section-panel]').forEach((panel) => {
      panel.addEventListener('toggle', () => {
        if (adminSettingsNavUpdating) {
          return;
        }
        if (panel.open) {
          updateSectionNavigation(panel.getAttribute('data-settings-section-panel'));
        }
      });
    });

    const accentInput = root.querySelector('[data-setting-path="appearance.accentColor"]');
    if (accentInput && accentInput.tagName === 'INPUT' && accentInput.type === 'color') {
      accentInput.addEventListener('input', () => {
        syncRangeLabels('appearance.accentColor', accentInput.value.toLowerCase());
      });
    }
  }

  function buildAdminSnapshot() {
    const state = deepClone(getAdminSettingsState());
    const dashboard = {
      materials: document.getElementById('kpiTotalMaterials')?.textContent?.trim() || '0',
      students: document.getElementById('kpiStudentsDash')?.textContent?.trim() || '0',
      notifications: document.querySelector('.adm-top-badge')?.textContent?.trim() || '0',
      liveSessions: String(window.AttendanceState?.activeSessions?.length || 0),
    };

    return {
      exportedAt: new Date().toISOString(),
      dashboard,
      settings: state,
    };
  }

  function readAdminLogs() {
    const raw = readAdminStorage(LOG_KEY);
    return Array.isArray(raw) ? raw : [];
  }

  function openAdminJsonViewer(title, data) {
    closeAdminJsonViewer();
    const overlay = document.createElement('div');
    overlay.id = 'adminJsonViewerOverlay';
    overlay.className = 'adm-json-overlay';
    overlay.innerHTML = `
      <div class="adm-json-modal">
        <div class="adm-json-header">
          <div>
            <div class="adm-json-kicker">${escapeHtml(title)}</div>
            <h3>${escapeHtml(title)}</h3>
          </div>
          <button type="button" class="adm-json-close" aria-label="Close viewer">×</button>
        </div>
        <pre class="adm-json-body">${escapeHtml(JSON.stringify(data, null, 2))}</pre>
        <div class="adm-json-footer">
          <button type="button" class="btn-outline adm-json-copy">Copy JSON</button>
          <button type="button" class="btn-primary adm-json-dismiss">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    document.body.classList.add('modal-open');
    requestAnimationFrame(() => overlay.classList.add('show'));

    overlay.querySelector('.adm-json-close')?.addEventListener('click', closeAdminJsonViewer);
    overlay.querySelector('.adm-json-dismiss')?.addEventListener('click', closeAdminJsonViewer);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        closeAdminJsonViewer();
      }
    });
    overlay.querySelector('.adm-json-copy')?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        showAdminToast('JSON copied to clipboard.', 'success');
      } catch {
        showAdminToast('Could not copy JSON.', 'warning');
      }
    });
  }

  function closeAdminJsonViewer() {
    document.getElementById('adminJsonViewerOverlay')?.remove();
    if (!document.getElementById('adminWelcomeOverlay') && !document.getElementById('adminCommandPaletteOverlay')) {
      document.body.classList.remove('modal-open');
    }
  }

  function exportAdminBackup(label) {
    const payload = buildAdminSnapshot();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `admin-backup-${label || 'snapshot'}-${Date.now()}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    showAdminToast('Backup downloaded.', 'success');
    pushAdminLog(`Exported ${label || 'snapshot'} backup`);
  }

  function exportAdminSnapshot() {
    exportAdminBackup('database');
  }

  function importAdminBackup() {
    if (!adminBackupInput) {
      adminBackupInput = document.createElement('input');
      adminBackupInput.type = 'file';
      adminBackupInput.accept = 'application/json';
      adminBackupInput.style.display = 'none';
      document.body.appendChild(adminBackupInput);
      adminBackupInput.addEventListener('change', handleAdminBackupImport);
    }
    adminBackupInput.value = '';
    adminBackupInput.click();
  }

  function handleAdminBackupImport(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'));
        const importedState = parsed.settings || parsed.state || parsed;
        adminSettingsState = mergeDeep(DEFAULT_SETTINGS, importedState);
        applyAdminAppearanceSettings(adminSettingsState);
        persistAdminSettings(true);
        renderSettingsRoot();
        showAdminToast('Backup restored successfully.', 'success');
        pushAdminLog('Imported admin backup');
      } catch (error) {
        console.error(error);
        showAdminToast('Invalid backup file.', 'error');
      }
    };
    reader.readAsText(file);
  }

  function clearAdminCache() {
    if (getAdminSettingsState().general.confirmations !== false && !window.confirm('Clear the local admin cache and draft data?')) {
      return;
    }
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(DRAFT_KEY);
      window.localStorage.removeItem(`${STORAGE_KEY}:history`);
      pushAdminLog('Cleared admin cache');
      showAdminToast('Local admin cache cleared.', 'success');
    } catch {
      showAdminToast('Could not clear cache.', 'warning');
    }
  }

  function playAdminTone(frequency, duration) {
    if (!getAdminSettingsState().general.soundEffects) return;
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) return;

    try {
      const audioContext = new AudioContextCtor();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency || 540;
      gain.gain.value = 0.02;
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + (duration || 0.06));
      oscillator.onended = () => {
        if (audioContext.close) audioContext.close();
      };
    } catch {
      // audio is optional
    }
  }

  function getGreetingParts() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return { greeting: 'Good Morning', emoji: '☀️', status: 'The morning systems are primed for focused work.' };
    }
    if (hour >= 12 && hour < 17) {
      return { greeting: 'Good Afternoon', emoji: '👋', status: 'Your platform is moving through the day in real time.' };
    }
    if (hour >= 17 && hour < 21) {
      return { greeting: 'Good Evening', emoji: '🌙', status: 'Everything is running smoothly tonight.' };
    }
    return { greeting: 'Good Night', emoji: '✨', status: 'Late-night admin mode is fully active.' };
  }

  function getMotivationLine() {
    const lines = [
      'Consistency builds success.',
      'Today\'s upload can help hundreds.',
      'Small improvements create big systems.',
      'Students rely on your platform daily.',
    ];
    return lines[Math.floor(Math.random() * lines.length)];
  }

  function getAnnouncementCards(stats) {
    return [
      {
        icon: '🗓️',
        title: 'Upcoming exams',
        text: `Keep the exam hub updated. ${stats.notifications} new alerts are waiting for review.`,
      },
      {
        icon: '🛡️',
        title: 'System alert',
        text: `${stats.liveUsers} live users are active and the sync layer is healthy.`,
      },
      {
        icon: '📤',
        title: 'Pending uploads',
        text: `${stats.materials} published resources are currently live in the library.`,
      },
      {
        icon: '🤖',
        title: 'AI suggestion',
        text: 'Review the AI Features section before the next batch of uploads lands.',
      },
    ];
  }

  function normalizeCount(text) {
    const digits = String(text || '').replace(/[^\d]/g, '');
    return digits || '0';
  }

  function readCountFromElement(ids, fallback) {
    for (let index = 0; index < ids.length; index += 1) {
      const element = document.getElementById(ids[index]);
      if (element && element.textContent && element.textContent.trim() && element.textContent.trim() !== '—') {
        return normalizeCount(element.textContent);
      }
    }
    return String(fallback || '0');
  }

  function collectWelcomeStats() {
    const stats = {
      materials: readCountFromElement(['kpiTotalMaterials', 'wbTotalMaterials'], 0),
      students: readCountFromElement(['kpiStudentsDash', 'wbTotalVisitors'], 0),
      notifications: readCountFromElement(['kpiSuggDash'], 0),
      liveUsers: readCountFromElement(['commAdminOnlineCount'], 0),
      attendance: '84.2%',
      files: readCountFromElement(['kpiVideosDash', 'kpiPYQsDash'], 0),
    };

    stats.activeSessions = window.AttendanceState && Array.isArray(window.AttendanceState.activeSessions)
      ? String(window.AttendanceState.activeSessions.length)
      : '0';
    return stats;
  }

  async function enrichWelcomeStats(stats) {
    if (!window.db || typeof db.ref !== 'function') {
      return stats;
    }

    const readValue = async (path) => {
      try {
        const snapshot = await db.ref(path).once('value');
        return snapshot.val();
      } catch {
        return null;
      }
    };

    try {
      const [visits, suggestions] = await Promise.all([
        readValue('site_stats/totalVisits'),
        readValue('suggestions'),
      ]);
      if (visits != null) {
        stats.students = String(visits || stats.students);
      }
      if (suggestions && typeof suggestions === 'object') {
        const count = Object.keys(suggestions).length;
        stats.notifications = String(count);
      }
    } catch {
      // ignore welcome enrichment errors
    }

    return stats;
  }

  function createWelcomeParticles(container) {
    if (!container) return;
    const total = 24;
    const fragment = document.createDocumentFragment();

    for (let index = 0; index < total; index += 1) {
      const particle = document.createElement('span');
      const size = 3 + Math.random() * 6;
      particle.className = 'adm-welcome-particle';
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 6}s`;
      particle.style.animationDuration = `${8 + Math.random() * 10}s`;
      fragment.appendChild(particle);
    }

    container.appendChild(fragment);
  }

  function renderWelcomeStats(stats) {
    return `
      <div class="admin-welcome-stats adm-welcome-stats-grid">
        <div class="adm-welcome-stat-card"><span class="adm-welcome-stat-num">${escapeHtml(stats.students)}</span><span class="adm-welcome-stat-label">Active students</span></div>
        <div class="adm-welcome-stat-card"><span class="adm-welcome-stat-num">${escapeHtml(stats.attendance)}</span><span class="adm-welcome-stat-label">Today attendance</span></div>
        <div class="adm-welcome-stat-card"><span class="adm-welcome-stat-num">${escapeHtml(stats.materials)}</span><span class="adm-welcome-stat-label">Uploaded files</span></div>
        <div class="adm-welcome-stat-card"><span class="adm-welcome-stat-num">${escapeHtml(stats.notifications)}</span><span class="adm-welcome-stat-label">Pending reports</span></div>
        <div class="adm-welcome-stat-card"><span class="adm-welcome-stat-num">${escapeHtml(stats.liveUsers)}</span><span class="adm-welcome-stat-label">Live users</span></div>
        <div class="adm-welcome-stat-card"><span class="adm-welcome-stat-num">${escapeHtml(stats.files)}</span><span class="adm-welcome-stat-label">New notifications</span></div>
      </div>
    `;
  }

  function renderWelcomeActions(userRole) {
    const actions = [
      { label: 'Dashboard', icon: '📊', action: 'dashboard' },
      { label: 'Add Material', icon: '📂', action: 'add' },
      { label: 'Create Quiz', icon: '🧠', action: 'test' },
      { label: 'Post Notice', icon: '📢', action: 'notifications' },
    ];

    return `
      <div class="adm-welcome-actions-grid">
        ${actions.map((action) => `
          <button type="button" class="adm-welcome-action-btn" data-admin-welcome-action="${escapeHtml(action.action)}">
            <span class="adm-welcome-action-icon">${escapeHtml(action.icon)}</span>
            <span>${escapeHtml(action.label)}</span>
          </button>
        `).join('')}
      </div>
    `;
  }

  function simplifyDashboardQuickActions() {
    const grid = document.querySelector('.adm-quick-actions-grid');
    if (!grid) return;
    grid.style.visibility = 'hidden';

    const subtext = document.querySelector('.adm-wb-sub');
    if (subtext) {
      subtext.textContent = 'One clean place to manage content, attendance, and updates.';
    }

    const cards = Array.from(grid.querySelectorAll('.adm-qa-card'));
    const actions = [
      { tab: 'attendance', label: 'Start Attendance', icon: '⚡' },
      { tab: 'add', label: 'Add Material', icon: '➕' },
      { tab: 'notifications', label: 'Post Notice', icon: '📢' },
      { tab: 'analytics', label: 'Open Analytics', icon: '📈' },
    ];

    actions.forEach((action, index) => {
      const card = cards[index];
      if (!card) return;
      card.setAttribute('onclick', `switchAdminTab('${action.tab}')`);
      const icon = card.querySelector('.adm-qa-icon');
      const title = card.querySelector('.adm-qa-title');
      if (icon) icon.textContent = action.icon;
      if (title) title.textContent = action.label;
    });

    cards.slice(actions.length).forEach((card) => card.remove());
    grid.style.visibility = 'visible';
  }

  function bindAdminQuickSearch() {
    const input = document.getElementById('admGlobalSearch');
    if (!input || input.dataset.adminSearchBound === '1') return;
    input.dataset.adminSearchBound = '1';

    input.addEventListener('input', () => {
      const query = input.value.trim();
      if (adminSearchPaletteTimer) {
        clearTimeout(adminSearchPaletteTimer);
      }
      if (!query) {
        closeAdminCommandPalette();
        adminSearchPaletteTimer = null;
        return;
      }
      adminSearchPaletteTimer = setTimeout(() => {
        openAdminCommandPalette(query);
        adminSearchPaletteTimer = null;
      }, 180);
    });

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        if (adminSearchPaletteTimer) {
          clearTimeout(adminSearchPaletteTimer);
          adminSearchPaletteTimer = null;
        }
        openAdminCommandPalette(input.value.trim());
        return;
      }
      if (event.key === 'Escape') {
        input.value = '';
        if (adminSearchPaletteTimer) {
          clearTimeout(adminSearchPaletteTimer);
          adminSearchPaletteTimer = null;
        }
        closeAdminCommandPalette();
      }
    });
  }

  function injectSimpleAdminHeader() {
    const topbar = document.querySelector('.adm-topbar');
    if (!topbar || topbar.dataset.simpleHeader === '1') return;
    topbar.dataset.simpleHeader = '1';
    topbar.style.visibility = 'hidden';

    topbar.innerHTML = `
      <div class="adm-topbar-row">
        <div class="adm-topbar-leading">
          <button class="adm-mobile-toggle" id="admMobileToggle" onclick="toggleAdmSidebar()">⋮</button>
          <div class="adm-topbar-copy">
            <div class="adm-topbar-page-title" id="admTopbarTitle">Dashboard</div>
            <div class="adm-topbar-page-subtitle" id="admTopbarSubtitle">A calm control center for content, attendance, and student growth.</div>
          </div>
        </div>
        <div class="adm-topbar-actions">
          <div class="adm-search">
            <span class="adm-search-icon">🔍</span>
            <input type="text" id="admGlobalSearch" placeholder="Search actions, content, or students..." autocomplete="off" />
          </div>
          <button class="adm-top-btn" id="darkToggle" title="Toggle Theme" style="font-size: 1rem;">🌙</button>
          <button class="adm-top-btn" title="Notifications" onclick="switchAdminTab('notifications')">🔔<span class="adm-top-badge"></span></button>
          <div class="adm-top-profile" onclick="adminLogout()">
            <div class="adm-top-avatar">A</div>
            <span class="adm-top-name">Admin</span>
          </div>
        </div>
      </div>
      <nav class="adm-top-menu" id="admTopMenu" aria-label="Quick admin navigation">
        <button type="button" class="adm-top-menu-btn active" data-admin-topnav="dashboard" onclick="switchAdminTab('dashboard')">Dashboard</button>
        <button type="button" class="adm-top-menu-btn" data-admin-topnav="add" onclick="switchAdminTab('add')">Add</button>
        <button type="button" class="adm-top-menu-btn" data-admin-topnav="manage" onclick="switchAdminTab('manage')">Manage</button>
        <button type="button" class="adm-top-menu-btn" data-admin-topnav="test" onclick="switchAdminTab('test')">Tests</button>
        <button type="button" class="adm-top-menu-btn" data-admin-topnav="notifications" onclick="switchAdminTab('notifications')">Notices</button>
        <button type="button" class="adm-top-menu-btn" data-admin-topnav="attendance" onclick="switchAdminTab('attendance')">Attendance</button>
        <button type="button" class="adm-top-menu-btn" data-admin-topnav="analytics" onclick="switchAdminTab('analytics')">Analytics</button>
        <button type="button" class="adm-top-menu-btn" data-admin-topnav="settings" onclick="switchAdminTab('settings')">Settings</button>
      </nav>
    `;

    const darkButton = topbar.querySelector('#darkToggle');
    if (darkButton && darkButton.dataset.darkBound !== '1') {
      darkButton.dataset.darkBound = '1';
      darkButton.addEventListener('click', toggleDarkMode);
    }

    updateDarkToggle(document.documentElement.getAttribute('data-theme') === 'dark');
    bindAdminQuickSearch();
    updateAdminTopNavigation(window.localStorage.getItem('lastAdminTab') || 'dashboard');
    topbar.style.visibility = 'visible';
  }

  function renderWelcomeAnnouncements(stats) {
    const cards = getAnnouncementCards(stats);
    return `
      <div class="adm-welcome-announcement-list">
        ${cards.map((card) => `
          <div class="adm-welcome-announcement-item">
            <div class="adm-welcome-announcement-icon">${escapeHtml(card.icon)}</div>
            <div class="adm-welcome-announcement-copy">
              <div class="adm-welcome-announcement-title">${escapeHtml(card.title)}</div>
              <div class="adm-welcome-announcement-text">${escapeHtml(card.text)}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function closeAdminWelcomePopup() {
    const overlay = document.getElementById('adminWelcomeOverlay');
    if (!overlay) return;

    overlay.classList.remove('show');
    document.body.classList.remove('modal-open');

    setTimeout(() => {
      overlay.remove();
      if (!document.getElementById('adminCommandPaletteOverlay') && !document.getElementById('adminJsonViewerOverlay')) {
        document.body.classList.remove('modal-open');
      }
    }, 320);

    if (adminWelcomeAutoCloseTimer) {
      clearTimeout(adminWelcomeAutoCloseTimer);
      adminWelcomeAutoCloseTimer = null;
    }
    if (adminMotivationTimer) {
      clearInterval(adminMotivationTimer);
      adminMotivationTimer = null;
    }
  }

  async function showAdminWelcome(userRole) {
    closeAdminWelcomePopup();

    const role = userRole || 'Admin';
    const userName = readAdminStorage('userName') || readAdminStorage('adminDisplayName') || 'Vishal';
    const greeting = getGreetingParts();
    const overlay = document.createElement('div');
    overlay.id = 'adminWelcomeOverlay';
    overlay.className = 'admin-welcome-overlay adm-welcome-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = `
      <div class="adm-welcome-orb adm-welcome-orb-1"></div>
      <div class="adm-welcome-orb adm-welcome-orb-2"></div>
      <div class="adm-welcome-particles" id="admWelcomeParticles"></div>
      <div class="admin-welcome-card adm-welcome-card">
        <button type="button" class="adm-welcome-close" aria-label="Close welcome popup">×</button>
        <div class="adm-welcome-sheen"></div>
        <div class="adm-welcome-header">
          <div class="adm-welcome-icon-wrap">
            <span class="adm-welcome-icon">${escapeHtml(greeting.emoji)}</span>
          </div>
          <div class="adm-welcome-copy">
            <div class="adm-welcome-badge">${escapeHtml(role)} access granted</div>
            <h2 class="admin-welcome-title adm-welcome-title">${escapeHtml(greeting.greeting)}, ${escapeHtml(userName)}</h2>
            <p class="admin-welcome-subtitle adm-welcome-subtitle">${escapeHtml(greeting.status)}</p>
          </div>
        </div>

        <div class="adm-welcome-motivation-row">
          <div class="adm-welcome-motivation-label">Smart line</div>
          <div class="adm-welcome-motivation" id="admWelcomeMotivationLine">${escapeHtml(getMotivationLine())}</div>
        </div>

        ${renderWelcomeStats(await enrichWelcomeStats(collectWelcomeStats()))}

        <div class="adm-welcome-actions-block">
          <div class="adm-welcome-section-label">Quick actions</div>
          ${renderWelcomeActions(role)}
        </div>

        <div class="adm-welcome-announcements-block">
          <div class="adm-welcome-section-label">Announcements</div>
          ${renderWelcomeAnnouncements(await enrichWelcomeStats(collectWelcomeStats()))}
        </div>

        <div class="adm-welcome-footer">
          <button type="button" class="adm-welcome-cta" data-admin-welcome-action="dashboard">Open Dashboard</button>
          <div class="adm-welcome-tip">Tip: use Ctrl + K for instant navigation.</div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.classList.add('modal-open');

    createWelcomeParticles(overlay.querySelector('#admWelcomeParticles'));
    playAdminTone(680, 0.05);

    requestAnimationFrame(() => {
      overlay.classList.add('show');
      overlay.querySelector('.adm-welcome-card')?.classList.add('show');
    });

    const closeButton = overlay.querySelector('.adm-welcome-close');
    const ctaButton = overlay.querySelector('.adm-welcome-cta');
    overlay.querySelectorAll('[data-admin-welcome-action]').forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.getAttribute('data-admin-welcome-action');
        closeAdminWelcomePopup();
        if (action === 'dashboard') {
          window.switchAdminTab('dashboard');
          return;
        }
        if (action === 'test') {
          window.switchAdminTab('test');
          return;
        }
        if (action === 'add') {
          window.switchAdminTab('add');
          return;
        }
        if (action === 'notifications') {
          window.switchAdminTab('notifications');
          return;
        }
        if (action === 'attendance') {
          window.switchAdminTab('attendance');
          return;
        }
      });
    });

    closeButton?.addEventListener('click', closeAdminWelcomePopup);
    ctaButton?.addEventListener('click', () => {
      closeAdminWelcomePopup();
      window.switchAdminTab('dashboard');
    });
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        closeAdminWelcomePopup();
      }
    });

    const motivationLine = overlay.querySelector('#admWelcomeMotivationLine');
    if (motivationLine) {
      adminMotivationTimer = setInterval(() => {
        motivationLine.textContent = getMotivationLine();
      }, 4500);
    }

    adminWelcomeAutoCloseTimer = setTimeout(() => {
      if (document.getElementById('adminWelcomeOverlay')) {
        closeAdminWelcomePopup();
      }
    }, 14000);

    sessionStorage.setItem(WELCOME_KEY, '1');
    pushAdminLog(`Welcome popup shown for ${role}`);
  }

  function openAdminAISettings() {
    window.switchAdminTab('ai-settings');
  }

  function openAdminSettingsSection(sectionId) {
    if (!sectionId) return;
    sessionStorage.setItem(ACTIVE_SECTION_KEY, sectionId);
    if (window.switchAdminTab) {
      window.switchAdminTab('settings');
    }
    if (!adminSettingsSectionRendered) {
      renderSettingsRoot();
    }
    updateSectionNavigation(sectionId);
    const section = document.querySelector(`[data-settings-section-panel="${CSS.escape(sectionId)}"]`);
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function openAdminCommandPalette(initialQuery) {
    ensureCommandPalette();
    const overlay = document.getElementById('adminCommandPaletteOverlay');
    const input = document.getElementById('adminCommandSearch');
    if (!overlay || !input) return;
    input.value = initialQuery || '';
    renderCommandPaletteList(input.value);
    overlay.classList.add('show');
    document.body.classList.add('modal-open');
    setTimeout(() => input.focus(), 20);
  }

  function closeAdminCommandPalette() {
    const overlay = document.getElementById('adminCommandPaletteOverlay');
    if (!overlay) return;
    overlay.classList.remove('show');
    setTimeout(() => overlay.remove(), 250);
    if (!document.getElementById('adminWelcomeOverlay') && !document.getElementById('adminJsonViewerOverlay')) {
      document.body.classList.remove('modal-open');
    }
  }

  function ensureCommandPalette() {
    if (document.getElementById('adminCommandPaletteOverlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'adminCommandPaletteOverlay';
    overlay.className = 'adm-command-overlay';
    overlay.innerHTML = `
      <div class="adm-command-modal">
        <div class="adm-command-header">
          <div>
            <div class="adm-command-kicker">Command palette</div>
            <h3>Quick navigation and tools</h3>
          </div>
          <button type="button" class="adm-command-close" aria-label="Close command palette">×</button>
        </div>
        <div class="adm-command-search-wrap">
          <input type="search" id="adminCommandSearch" class="adm-command-search" placeholder="Search commands..." autocomplete="off" />
        </div>
        <div class="adm-command-list" id="adminCommandList"></div>
      </div>
    `;

    document.body.appendChild(overlay);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        closeAdminCommandPalette();
      }
    });
    overlay.querySelector('.adm-command-close')?.addEventListener('click', closeAdminCommandPalette);

    const input = overlay.querySelector('#adminCommandSearch');
    input?.addEventListener('input', () => {
      renderCommandPaletteList(input.value);
    });
    input?.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeAdminCommandPalette();
      }
      if (event.key === 'Enter') {
        const first = overlay.querySelector('.adm-command-item');
        first?.click();
      }
    });
  }

  const COMMANDS = [
    { label: 'Dashboard', hint: 'Overview and live stats', keywords: ['dashboard', 'home'], run: () => window.switchAdminTab('dashboard') },
    { label: 'Add Material', hint: 'Upload notes and files', keywords: ['add', 'upload', 'notes'], run: () => window.switchAdminTab('add') },
    { label: 'Manage Content', hint: 'Edit and clean up content', keywords: ['manage', 'materials'], run: () => window.switchAdminTab('manage') },
    { label: 'Test Hub', hint: 'Open the quiz and question bank tools', keywords: ['quiz', 'test', 'question bank'], run: () => window.switchAdminTab('test') },
    { label: 'Attendance', hint: 'Start or monitor live sessions', keywords: ['attendance', 'session'], run: () => window.switchAdminTab('attendance') },
    { label: 'Notices', hint: 'Post or review announcements', keywords: ['notifications', 'notice'], run: () => window.switchAdminTab('notifications') },
    { label: 'Inbox', hint: 'Review student messages', keywords: ['inbox', 'messages', 'suggestions'], run: () => window.switchAdminTab('inbox') },
    { label: 'Visitors', hint: 'Track active users', keywords: ['visitors', 'live', 'presence'], run: () => window.switchAdminTab('visitors') },
    { label: 'Analytics', hint: 'Open growth and performance charts', keywords: ['analytics', 'stats', 'growth'], run: () => window.switchAdminTab('analytics') },
    { label: 'Community', hint: 'Moderate posts and polls', keywords: ['community', 'posts', 'polls'], run: () => window.switchAdminTab('community') },
    { label: 'Voting Hub', hint: 'Manage polls and feedback', keywords: ['voting', 'polls', 'feedback'], run: () => window.switchAdminTab('voting') },
    { label: 'Settings', hint: 'System settings hub', keywords: ['settings', 'system'], run: () => window.switchAdminTab('settings') },
    { label: 'AI Settings', hint: 'Similarity and analysis controls', keywords: ['ai', 'similarity', 'analysis'], run: () => openAdminAISettings() },
    { label: 'Toggle Theme', hint: 'Switch light and dark mode', keywords: ['theme', 'dark', 'light'], run: () => window.toggleDarkMode && window.toggleDarkMode() },
    { label: 'Reset Settings', hint: 'Restore defaults', keywords: ['reset', 'defaults'], run: () => triggerAdminAction('reset') },
    { label: 'Open Logs Viewer', hint: 'Inspect recent admin logs', keywords: ['logs', 'debug'], run: () => triggerAdminAction('logsViewer') },
  ];

  function renderCommandPaletteList(query) {
    const list = document.getElementById('adminCommandList');
    if (!list) return;
    const lowerQuery = String(query || '').trim().toLowerCase();
    const currentRole = lsGet('adminAuth', {})?.role || 'admin';
    const items = COMMANDS.filter((command) => {
      if (command.role === 'admin' && currentRole !== 'admin') {
        return false;
      }
      if (!lowerQuery) return true;
      const text = [command.label, command.hint, ...(command.keywords || [])].join(' ').toLowerCase();
      return text.includes(lowerQuery);
    });

    if (adminPaletteFilterTimer) {
      clearTimeout(adminPaletteFilterTimer);
      adminPaletteFilterTimer = null;
    }

    list.innerHTML = items.length ? items.map((command) => `
      <button type="button" class="adm-command-item" data-command-label="${escapeHtml(command.label)}">
        <div class="adm-command-item-copy">
          <div class="adm-command-item-label">${escapeHtml(command.label)}</div>
          <div class="adm-command-item-hint">${escapeHtml(command.hint)}</div>
        </div>
        <span class="adm-command-item-shortcut">Enter</span>
      </button>
    `).join('') : '<div class="adm-command-empty">No matching commands found.</div>';

    list.querySelectorAll('.adm-command-item').forEach((item) => {
      item.addEventListener('click', () => {
        const label = item.getAttribute('data-command-label');
        const command = COMMANDS.find((entry) => entry.label === label);
        if (command && typeof command.run === 'function') {
          closeAdminCommandPalette();
          command.run();
        }
      });
    });

    adminPaletteFilterTimer = setTimeout(() => {}, 1);
  }

  function injectAdminAssistantButton() {
    if (document.getElementById('adminAssistantFab')) return;
    const button = document.createElement('button');
    button.id = 'adminAssistantFab';
    button.className = 'adm-ai-fab';
    button.type = 'button';
    button.title = 'AI assistant · Ctrl + K';
    button.innerHTML = '<span>AI</span><small>Ctrl+K</small>';
    button.addEventListener('click', () => openAdminAISettings());
    document.body.appendChild(button);
  }

  function bindGlobalShortcuts() {
    document.addEventListener('keydown', (event) => {
      const isCommandK = (event.ctrlKey || event.metaKey) && String(event.key).toLowerCase() === 'k';
      if (isCommandK) {
        event.preventDefault();
        openAdminCommandPalette('');
        return;
      }
      if (event.key === 'Escape') {
        closeAdminCommandPalette();
        if (document.getElementById('adminWelcomeOverlay')) {
          closeAdminWelcomePopup();
        }
      }
    });
  }

  function refreshCurrentAdminView() {
    const root = document.getElementById('adminSettingsRoot');
    if (root && document.getElementById('admin-tab-settings')?.classList.contains('active')) {
      renderSettingsRoot();
      updateSectionNavigation(sessionStorage.getItem(ACTIVE_SECTION_KEY) || 'general');
    }
  }

  function applySettingsOnLogin() {
    const state = getAdminSettingsState();
    applyAdminAppearanceSettings(state);
    injectAdminAssistantButton();
    ensureCommandPalette();
    if (!adminSettingsSectionRendered) {
      renderSettingsRoot();
    }
    updateSettingsToolbarMeta();
  }

  window.openAdminAISettings = openAdminAISettings;
  window.openAdminSettingsSection = openAdminSettingsSection;
  window.openAdminCommandPalette = openAdminCommandPalette;
  window.closeAdminCommandPalette = closeAdminCommandPalette;
  window.closeAdminWelcomePopup = closeAdminWelcomePopup;

  window.showAdminWelcome = showAdminWelcome;
  window.adminLogout = function adminLogoutEnhanced() {
    closeAdminWelcomePopup();
    closeAdminCommandPalette();
    closeAdminJsonViewer();
    if (adminDashboardRefreshTimer) {
      clearInterval(adminDashboardRefreshTimer);
      adminDashboardRefreshTimer = null;
    }
    if (adminWelcomeAutoCloseTimer) {
      clearTimeout(adminWelcomeAutoCloseTimer);
      adminWelcomeAutoCloseTimer = null;
    }
    if (adminMotivationTimer) {
      clearInterval(adminMotivationTimer);
      adminMotivationTimer = null;
    }
    sessionStorage.removeItem(WELCOME_KEY);
    sessionStorage.removeItem(ACTIVE_SECTION_KEY);
    if (typeof originalFns.adminLogout === 'function') {
      originalFns.adminLogout();
    }
    document.body.classList.remove('modal-open');
  };

  window.switchAdminTab = function switchAdminTabEnhanced(tab) {
    const authState = lsGet('adminAuth', {});
    const currentRole = authState?.role || 'admin';
    if (!ADMIN_TAB_IDS.includes(tab)) {
      tab = 'dashboard';
    }

    lsSet('lastAdminTab', tab);
    if (typeof window.updateAdminTopNavigation === 'function') {
      window.updateAdminTopNavigation(tab);
    }

    if (tab === 'settings') {
      activateAdminTab('settings');
      renderSettingsRoot();
      updateSectionNavigation(sessionStorage.getItem(ACTIVE_SECTION_KEY) || 'general');
      closeAdmSidebar();
      return;
    }

    if (tab === 'ai-settings') {
      activateAdminTab('ai-settings');
      renderAiSettingsRoot();
      refreshAdminIntelligence();
      closeAdmSidebar();
      return;
    }

    if (tab === 'elite') {
      activateAdminTab('elite');
      renderEliteManagementRoot();
      closeAdmSidebar();
      return;
    }

    if (typeof originalFns.switchAdminTab === 'function') {
      originalFns.switchAdminTab(tab);
    }

    const settingsSection = document.getElementById('admin-tab-settings');
    if (settingsSection && tab !== 'settings') {
      settingsSection.style.display = 'none';
      settingsSection.classList.remove('active');
    }
    const aiSection = document.getElementById('admin-tab-ai-settings');
    if (aiSection && tab !== 'ai-settings') {
      aiSection.style.display = 'none';
      aiSection.classList.remove('active');
    }
    const eliteSection = document.getElementById('admin-tab-elite');
    if (eliteSection && tab !== 'elite') {
      eliteSection.style.display = 'none';
      eliteSection.classList.remove('active');
    }
    const settingsButton = getAdminTabButton('settings');
    if (settingsButton && tab !== 'settings') settingsButton.classList.remove('active');
    const aiButton = getAdminTabButton('ai-settings');
    if (aiButton && tab !== 'ai-settings') aiButton.classList.remove('active');
    const eliteButton = getAdminTabButton('elite');
    if (eliteButton && tab !== 'elite') eliteButton.classList.remove('active');

    if (tab === 'dashboard') {
      updateSettingsToolbarMeta();
      refreshAdminIntelligence();
    }

    if (tab === 'analytics') {
      updateAnalyticsSmartSummaryWhenReady();
    }

    if (tab === 'dashboard' || tab === 'analytics' || tab === 'add' || tab === 'manage' || tab === 'inbox' || tab === 'visitors' || tab === 'notifications' || tab === 'community' || tab === 'voting' || tab === 'attendance' || tab === 'test') {
      refreshAdminIntelligence();
    }
  };

  window.initAdminPage = function initAdminPageEnhanced() {
    if (typeof originalFns.initAdminPage === 'function') {
      originalFns.initAdminPage();
    }
    adminSettingsState = getStoredSnapshot();
    applySettingsOnLogin();
    const authState = lsGet('adminAuth', {});
    const currentRole = authState?.role || 'admin';

    const routeTab = (() => {
      const params = new URLSearchParams(window.location.search);
      const queryTab = params.get('tab') || params.get('section');
      const hashTab = window.location.hash ? window.location.hash.replace('#', '') : '';
      return (queryTab || hashTab || '').trim().toLowerCase();
    })();

    let storedTab = routeTab || window.localStorage.getItem('lastAdminTab');
    if (storedTab && !ADMIN_TAB_IDS.includes(storedTab) && storedTab !== 'settings' && storedTab !== 'ai-settings') {
      storedTab = '';
    }

    if (!storedTab) {
      const homepage = adminSettingsState.dashboard?.defaultHomepage || 'dashboard';
      if (homepage) {
        const safeHomepage = ADMIN_TAB_IDS.includes(homepage) ? homepage : 'dashboard';
        window.switchAdminTab(safeHomepage);
      }
    } else {
      window.switchAdminTab(storedTab);
    }

    if (window.localStorage.getItem('adminAuth')) {
      updateSettingsToolbarMeta();
    }
  };

  function bootAdvancedAdmin() {
    adminSettingsState = getStoredSnapshot();
    applyAdminAppearanceSettings(adminSettingsState);
    injectAdminAssistantButton();
    ensureCommandPalette();
    bindGlobalShortcuts();
    injectSimpleAdminHeader();
    simplifyDashboardQuickActions();

    if (document.getElementById('adminSettingsRoot')) {
      renderSettingsRoot();
    }
    renderAiSettingsRoot();
    refreshAdminIntelligence();

    if (window.localStorage.getItem('adminAuth')) {
      updateSettingsToolbarMeta();
    }
  }

  window.loadDashboardStats = function loadDashboardStatsEnhanced() {
    if (typeof originalFns.loadDashboardStats === 'function') {
      originalFns.loadDashboardStats();
    }
    setTimeout(refreshAdminIntelligence, 350);
  };

  window.loadAnalytics = function loadAnalyticsEnhanced() {
    if (typeof originalFns.loadAnalytics === 'function') {
      originalFns.loadAnalytics();
    }
    updateAnalyticsSmartSummaryWhenReady();
    setTimeout(renderAnalyticsSmartSummary, 500);
    setTimeout(renderAnalyticsSmartSummary, 1600);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootAdvancedAdmin, { once: true });
  } else {
    bootAdvancedAdmin();
  }  // Micro-interactions: Success Confetti
  function triggerConfetti() {
    const canvas = document.getElementById('admConfettiCanvas');
    if (!canvas || !window.confetti) return;
    
    const myConfetti = window.confetti.create(canvas, { resize: true });
    myConfetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#10b981', '#3b82f6', '#ffffff']
    });
  }

  // System Health Monitoring Simulation
  function initSystemHealthMonitor() {
    const healthPulse = document.querySelector('.health-pulse');
    const healthStatus = document.querySelector('.health-status');
    const healthWidget = document.querySelector('.adm-health-widget');
    
    if (!healthPulse || !healthStatus || !healthWidget) return;

    setInterval(() => {
      // Simulate minor variations in health
      const health = 99 + Math.random();
      const isPerfect = health > 99.5;
      
      if (isPerfect) {
        healthPulse.style.background = '#10b981';
        healthStatus.textContent = 'OPTIMAL';
        healthStatus.style.color = '#10b981';
        healthWidget.title = `System Health: ${health.toFixed(2)}% Operational`;
      } else {
        healthPulse.style.background = '#06b6d4';
        healthStatus.textContent = 'STABLE';
        healthStatus.style.color = '#06b6d4';
        healthWidget.title = `System Health: ${health.toFixed(2)}% Operational`;
      }
    }, 5000);
  }

  // Wrap original material addition to trigger confetti
  const originalAddMaterial = window.addMaterial;
  window.addMaterial = async function() {
    if (typeof originalAddMaterial === 'function') {
      const result = await originalAddMaterial();
      // Assume success if no error thrown or check return value
      triggerConfetti();
      return result;
    }
  };

  const originalAddNotification = window.addNotification;
  window.addNotification = async function() {
    if (typeof originalAddNotification === 'function') {
      const result = await originalAddNotification();
      triggerConfetti();
      return result;
    }
  };

  // Initialize new features on load
  function initAdvancedEnhancements() {
    initSystemHealthMonitor();
    
    // Command Palette shortcut (Ctrl/Cmd + K)
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('admGlobalSearch');
        if (searchInput) {
          searchInput.focus();
          searchInput.placeholder = "Search actions, materials, students...";
        }
      }
    });
  }

  // Add to the bottom of the IIFE
  initAdvancedEnhancements();

})();
