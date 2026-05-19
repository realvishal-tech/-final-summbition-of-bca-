// ================================================
// Attendance Admin Dashboard JavaScript
// Realtime Session Management & Analytics
// ================================================

let currentSessionId = null;
let sessionTimers = {};

// ==================== INITIALIZATION ====================
async function initAdminDashboard() {
  try {
    // Wait for auth to initialize
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!AttendanceState.currentUser) {
      window.location.href = '/login.html';
      return;
    }

    if (!AttendanceState.isAdmin) {
      window.location.href = '/';
      return;
    }

    // Setup realtime listeners
    listenToActiveSessions(updateActiveSessionsUI);
    
    // Load initial data
    await loadSessionHistory();
    updateDashboardStats();

    // Monitor connection status
    monitorConnectionStatus();

    console.log('✅ Admin Dashboard Initialized');
  } catch (error) {
    console.error('Init error:', error);
    showNotification('Error initializing dashboard', 'error');
  }
}

// ==================== REALTIME LISTENERS ====================
function monitorConnectionStatus() {
  // Check Firebase connection periodically
  setInterval(() => {
    db.collection('_metadata').doc('connection_test')
      .set({ timestamp: firebase.firestore.FieldValue.serverTimestamp() })
      .then(() => {
        AttendanceState.syncStatus = 'connected';
        updateConnectionStatus(true);
      })
      .catch(() => {
        AttendanceState.syncStatus = 'disconnected';
        updateConnectionStatus(false);
      });
  }, 5000);
}

function updateConnectionStatus(isConnected) {
  const statusEl = document.getElementById('connectionStatus');
  if (isConnected) {
    statusEl.textContent = '🟢 Connected';
    statusEl.classList.remove('disconnected');
  } else {
    statusEl.textContent = '🔴 Disconnected';
    statusEl.classList.add('disconnected');
  }
}

// ==================== UPDATE UI ====================
function updateActiveSessionsUI(sessions) {
  const container = document.getElementById('activeSessionsContainer');
  const allSessionsContainer = document.getElementById('allSessionsContainer');

  if (sessions.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🎯</div>
        <p>No active sessions. Create one to get started!</p>
      </div>
    `;
    allSessionsContainer.innerHTML = container.innerHTML;
    return;
  }

  let html = '';
  sessions.forEach(session => {
    html += createSessionCard(session);
  });

  container.innerHTML = html;
  allSessionsContainer.innerHTML = html;

  // Setup timers for all active sessions
  sessions.forEach(session => {
    if (!sessionTimers[session.sessionId]) {
      startSessionTimer(session);
    }
  });
}

function createSessionCard(session) {
  const timeRemaining = getTimeRemaining(session.expiresAt);
  const isActive = session.status === 'active';

  return `
    <div class="session-card" onclick="openSessionDetails('${session.sessionId}')">
      <div class="session-status ${!isActive ? 'expired' : ''}">
        ${isActive ? '🔴 Live' : '⏹️ Expired'}
      </div>
      <div class="session-title">${session.subject}</div>
      <div class="session-meta">👨‍🏫 ${session.teacher}</div>
      <div class="session-meta">📘 Batch: ${session.batch}</div>
      <div class="session-countdown">${timeRemaining}</div>
      <div class="session-count">
        👥 ${session.attendanceCount || 0} attendees
      </div>
    </div>
  `;
}

function getTimeRemaining(expiresAt) {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry - now;

  if (diff <= 0) return 'Expired';

  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  return `${minutes}m ${seconds}s`;
}

// ==================== SESSION TIMER ====================
function startSessionTimer(session) {
  if (sessionTimers[session.sessionId]) return;

  const timer = new SessionTimer(
    session.sessionId,
    session.expiresAt,
    (minutes, seconds) => {
      updateSessionCardTimer(session.sessionId, minutes, seconds);
    },
    () => {
      // Session expired
      delete sessionTimers[session.sessionId];
      updateActiveSessionsUI(AttendanceState.activeSessions);
    }
  );

  timer.start();
  sessionTimers[session.sessionId] = timer;
}

function updateSessionCardTimer(sessionId, minutes, seconds) {
  const countdownEls = document.querySelectorAll('.session-countdown');
  countdownEls.forEach(el => {
    if (el.textContent.includes(sessionId)) {
      el.textContent = `${minutes}m ${seconds}s`;
    }
  });
}

// ==================== ANALYTICS & STATS ====================
function updateDashboardStats() {
  const activeCount = AttendanceState.activeSessions.length;
  const totalSubmissions = AttendanceState.activeSessions.reduce(
    (sum, s) => sum + (s.attendanceCount || 0), 0
  );

  document.getElementById('activeSessCount').textContent = activeCount;
  document.getElementById('totalSubmissions').textContent = totalSubmissions;

  // Load from Firestore for total sessions
  db.collection('attendance_sessions')
    .where('createdBy', '==', AttendanceState.currentUser.uid)
    .get()
    .then(snapshot => {
      document.getElementById('totalSessions').textContent = snapshot.docs.length;
    });
}

// ==================== SESSION MANAGEMENT ====================
async function handleCreateSession(event) {
  event.preventDefault();

  const sessionData = {
    subject: document.getElementById('sessionSubject').value,
    teacher: document.getElementById('sessionTeacher').value,
    batch: document.getElementById('sessionBatch').value,
    semester: document.getElementById('sessionSemester').value,
    duration: parseInt(document.getElementById('sessionDuration').value),
    description: document.getElementById('sessionDescription').value,
  };

  try {
    showNotification('Creating session...', 'info');
    const session = await createAttendanceSession(sessionData);
    
    closeModal('createSessionModal');
    document.querySelector('.modal-form').reset();

    showNotification('Session created successfully!', 'success');

    // Update UI immediately
    setTimeout(() => {
      updateActiveSessionsUI(AttendanceState.activeSessions);
    }, 500);

  } catch (error) {
    console.error('Error creating session:', error);
    showNotification('Error creating session: ' + error.message, 'error');
  }
}

async function openSessionDetails(sessionId) {
  currentSessionId = sessionId;
  const session = AttendanceState.activeSessions.find(s => s.sessionId === sessionId);

  if (!session) {
    showNotification('Session not found', 'error');
    return;
  }

  // Update modal content
  document.getElementById('detailsTitle').textContent = `${session.subject} - Session Details`;
  document.getElementById('detailSubject').textContent = session.subject;
  document.getElementById('detailTeacher').textContent = session.teacher;
  document.getElementById('detailSessionId').textContent = session.sessionId;
  document.getElementById('attendanceLinkInput').value = 
    `${window.location.origin}${session.attendanceLink}`;

  // Update countdown
  const timer = sessionTimers[sessionId];
  if (timer && timer.isActive) {
    document.getElementById('detailCountdown').textContent = getTimeRemaining(session.expiresAt);
  } else {
    document.getElementById('detailCountdown').textContent = 'Expired';
  }

  // Generate QR Code
  generateQRCode(session.attendanceLink);

  // Load submissions
  listenToSubmissions(sessionId, updateSubmissionsList);

  // Listen for real-time submission updates
  const unsubscribe = db.collection('attendance_submissions')
    .where('sessionId', '==', sessionId)
    .orderBy('submittedAt', 'desc')
    .onSnapshot(snapshot => {
      updateLiveSubmissionFeed(snapshot.docs.map(d => d.data()));
    });

  // Show end button if session is active
  const endBtn = document.getElementById('endSessionBtn');
  if (session.status === 'active') {
    endBtn.style.display = 'block';
  } else {
    endBtn.style.display = 'none';
  }

  // Open modal
  const modal = document.getElementById('sessionDetailsModal');
  modal.classList.add('active');

  // Cleanup on close
  const closeWatcher = setInterval(() => {
    if (!modal.classList.contains('active')) {
      clearInterval(closeWatcher);
      unsubscribe();
    }
  }, 100);
}

function generateQRCode(url) {
  const container = document.getElementById('qrCodeContainer');
  container.innerHTML = ''; // Clear previous QR

  try {
    new QRCode(container, {
      text: url,
      width: 200,
      height: 200,
      colorDark: '#020817',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });
  } catch (error) {
    console.error('QR generation error:', error);
  }
}

function downloadQRCode() {
  const canvas = document.querySelector('#qrCodeContainer canvas');
  if (!canvas) {
    showNotification('QR code not generated yet', 'error');
    return;
  }

  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = `attendance-qr-${currentSessionId}.png`;
  link.click();

  showNotification('QR code downloaded!', 'success');
}

function updateSubmissionsList(submissions) {
  const container = document.getElementById('sessionSubmissionsList');

  if (submissions.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No submissions yet</p>';
    return;
  }

  let html = '';
  submissions.forEach(sub => {
    html += `
      <div class="attendee-item">
        <div>
          <div class="attendee-name">${sub.fullName}</div>
          <div class="attendee-roll">Roll: ${sub.rollNumber} | Reg: ${sub.registrationNumber}</div>
        </div>
        <div style="font-size: 0.85rem; color: var(--text-secondary);">
          ${formatDate(sub.submittedAt)}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function updateLiveSubmissionFeed(submissions) {
  const feed = document.getElementById('liveSubmissionFeed');

  if (submissions.length === 0) {
    feed.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <p>Submissions will appear here in real-time</p>
      </div>
    `;
    return;
  }

  let html = '';
  submissions.slice(0, 20).forEach(sub => {
    html += `
      <div class="submission-item">
        <div class="submission-header">
          <span class="submission-name">✅ ${sub.fullName}</span>
          <span class="submission-time">${formatTime(sub.submittedAt)}</span>
        </div>
        <div class="submission-details">
          ${sub.rollNumber} | ${sub.registrationNumber} | Sem: ${sub.semester}
        </div>
      </div>
    `;
  });

  feed.innerHTML = html;
}

async function endSession() {
  if (!currentSessionId) {
    showNotification('No session selected', 'error');
    return;
  }

  if (!confirm('Are you sure you want to end this session? This action cannot be undone.')) {
    return;
  }

  try {
    showNotification('Ending session...', 'info');
    await endAttendanceSession(currentSessionId);

    // Stop timer
    if (sessionTimers[currentSessionId]) {
      sessionTimers[currentSessionId].stop();
      delete sessionTimers[currentSessionId];
    }

    closeModal('sessionDetailsModal');
    showNotification('Session ended successfully!', 'success');

    // Update UI
    setTimeout(() => {
      updateActiveSessionsUI(AttendanceState.activeSessions);
    }, 500);

  } catch (error) {
    console.error('Error ending session:', error);
    showNotification('Error ending session: ' + error.message, 'error');
  }
}

// ==================== HISTORY ====================
async function loadSessionHistory() {
  try {
    const history = await getSessionHistory();
    updateHistoryTable(history);
  } catch (error) {
    console.error('Error loading history:', error);
  }
}

function updateHistoryTable(sessions) {
  const tbody = document.getElementById('historyTableBody');

  if (sessions.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">No history yet</td></tr>';
    return;
  }

  let html = '';
  sessions.forEach(session => {
    html += `
      <tr>
        <td>${formatDate(session.createdAt)}</td>
        <td>${session.subject}</td>
        <td>${session.teacher}</td>
        <td>${session.batch}</td>
        <td>${session.attendanceCount || 0}</td>
        <td>
          <button class="btn-icon" onclick="viewHistoryDetails('${session.sessionId}')">👁️</button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

function viewHistoryDetails(sessionId) {
  // Open same modal as active session for viewing
  openSessionDetails(sessionId);
}

function exportHistoryPDF() {
  // Placeholder for PDF export
  showNotification('PDF export coming soon!', 'info');
}

// ==================== UTILITIES ====================
function switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });

  // Hide all menu items active state
  document.querySelectorAll('.menu-item').forEach(item => {
    item.classList.remove('active');
  });

  // Show selected tab
  document.getElementById(tabName + 'Tab').classList.add('active');

  // Mark menu item as active
  event.target.closest('.menu-item').classList.add('active');
}

function openCreateSessionModal() {
  document.getElementById('createSessionModal').classList.add('active');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

function copyToClipboard(selector) {
  const element = document.querySelector(selector);
  const text = element.value;

  navigator.clipboard.writeText(text).then(() => {
    showNotification('Copied to clipboard!', 'success');
  }).catch(err => {
    console.error('Copy error:', err);
  });
}

function formatDate(timestamp) {
  if (!timestamp) return '-';
  const date = new Date(timestamp.toDate ? timestamp.toDate() : timestamp);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatTime(timestamp) {
  if (!timestamp) return '-';
  const date = new Date(timestamp.toDate ? timestamp.toDate() : timestamp);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function showNotification(message, type = 'info') {
  // Simple notification - can be enhanced with a notification library
  const bgColor = {
    info: 'rgb(59, 130, 246)',
    success: 'rgb(16, 185, 129)',
    error: 'rgb(239, 68, 68)'
  }[type] || 'rgb(59, 130, 246)';

  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 14px 20px;
    background: ${bgColor};
    color: white;
    border-radius: 8px;
    z-index: 9999;
    animation: slideInUp 0.3s ease;
    font-weight: 600;
  `;

  document.body.appendChild(notification);
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// ==================== MODAL HANDLERS ====================
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.classList.remove('active');
  }
});

// Prevent closing modal when clicking inside
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-content') || 
      e.target.closest('.modal-content')) {
    return;
  }
});

// ==================== KEYBOARD SHORTCUTS ====================
document.addEventListener('keydown', (e) => {
  // Escape to close modal
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal.active').forEach(modal => {
      modal.classList.remove('active');
    });
  }
});

console.log('✅ Admin Dashboard Script Loaded');
