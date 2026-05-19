// ================================================
// Attendance Student Page JavaScript
// Session Loading, Countdown, Form Submission
// ================================================

let currentSession = null;
let sessionTimer = null;
let sessionId = null;
let unsubscribeListeners = [];

// ==================== INITIALIZATION ====================
async function initStudentPage() {
  try {
    // Get session ID from URL
    const pathParts = window.location.pathname.split('/');
    sessionId = pathParts[pathParts.length - 1];

    if (!sessionId) {
      showSessionNotFound();
      return;
    }

    // Initialize Firebase
    if (!firebase.apps.length) {
      console.error('Firebase not initialized');
      showError('Session Connection Error', 'Firebase initialization failed');
      return;
    }

    // Load session details
    await loadSessionDetails();

    // Setup connection monitoring
    monitorConnection();

    console.log('✅ Student Page Initialized for session:', sessionId);

  } catch (error) {
    console.error('Init error:', error);
    showError('Initialization Error', error.message);
  }
}

// ==================== SESSION LOADING ====================
async function loadSessionDetails() {
  try {
    // Fetch session from Firestore
    const doc = await getSessionDetails(sessionId);

    if (!doc) {
      showSessionNotFound();
      return;
    }

    currentSession = doc;

    // Validate session
    if (currentSession.status !== 'active') {
      hideLoadingOverlay();
      showExpiredSession();
      return;
    }

    // Check if not expired
    const expiresAt = new Date(currentSession.expiresAt);
    if (new Date() > expiresAt) {
      hideLoadingOverlay();
      showExpiredSession();
      return;
    }

    // Update UI with session details
    updateSessionUI();

    // Start countdown timer
    startCountdownTimer();

    // Start listening for real-time updates
    listenForSessionUpdates();

    hideLoadingOverlay();

  } catch (error) {
    console.error('Error loading session:', error);
    hideLoadingOverlay();
    showError('Session Load Error', error.message);
  }
}

function updateSessionUI() {
  document.getElementById('subjectName').textContent = currentSession.subject;
  document.getElementById('teacherName').textContent = currentSession.teacher;
  document.getElementById('batchName').textContent = currentSession.batch;
  document.getElementById('semesterName').textContent = currentSession.semester;
  document.getElementById('attendeeCount').textContent = currentSession.attendanceCount || 0;
  
  const statusEl = document.getElementById('sessionStatus');
  statusEl.textContent = '🔴 Live';
  statusEl.className = 'session-status active';
}

function listenForSessionUpdates() {
  try {
    const unsubscribe = db.collection('active_attendance_registry')
      .doc(sessionId)
      .onSnapshot((doc) => {
        if (!doc.exists) {
          showExpiredSession();
          return;
        }

        const session = doc.data();
        currentSession = session;

        // Update attendee count in real-time
        document.getElementById('attendeeCount').textContent = session.attendanceCount || 0;

        // Check if status changed
        if (session.status !== 'active') {
          showExpiredSession();
          if (sessionTimer) {
            sessionTimer.stop();
          }
        }
      }, (error) => {
        console.error('Listener error:', error);
        if (error.code === 'permission-denied') {
          showSessionNotFound();
        }
      });

    unsubscribeListeners.push(unsubscribe);
  } catch (error) {
    console.error('Error setting up listener:', error);
  }
}

// ==================== COUNTDOWN TIMER ====================
function startCountdownTimer() {
  const expiresAt = new Date(currentSession.expiresAt);
  const totalDuration = expiresAt - new Date(currentSession.createdAt);

  sessionTimer = new SessionTimer(
    sessionId,
    expiresAt,
    (minutes, seconds) => {
      updateTimerDisplay(minutes, seconds, totalDuration);
    },
    () => {
      // Timer expired
      disableForm();
      showExpiredSession();
    }
  );

  sessionTimer.start();
}

function updateTimerDisplay(minutes, seconds, totalDuration) {
  // Update time display
  const displayMin = String(minutes).padStart(2, '0');
  const displaySec = String(seconds).padStart(2, '0');
  document.getElementById('timerDisplay').textContent = `${displayMin}:${displaySec}`;

  // Update progress bar (0 to 100%)
  const now = new Date();
  const expiresAt = new Date(currentSession.expiresAt);
  const createdAt = new Date(currentSession.createdAt);
  
  const elapsed = now - createdAt;
  const progress = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
  
  document.getElementById('progressBar').style.width = progress + '%';

  // Change color as time runs out
  const timerEl = document.getElementById('countdownTimer');
  if (minutes === 0 && seconds <= 30) {
    timerEl.style.borderColor = '#ef4444';
    timerEl.style.background = 'linear-gradient(135deg, rgba(239,68,68,0.05) 0%, rgba(239,68,68,0.05) 100%)';
  } else if (minutes <= 2) {
    timerEl.style.borderColor = '#f59e0b';
    timerEl.style.background = 'linear-gradient(135deg, rgba(245,158,11,0.05) 0%, rgba(245,158,11,0.05) 100%)';
  }
}

// ==================== FORM SUBMISSION ====================
async function submitAttendance(event) {
  event.preventDefault();

  // Validate session
  if (!currentSession || currentSession.status !== 'active') {
    showError('Invalid Session', 'This session is no longer active');
    return;
  }

  // Get form data
  const studentData = {
    fullName: document.getElementById('fullName').value.trim(),
    rollNumber: document.getElementById('rollNumber').value.trim().toUpperCase(),
    registrationNumber: document.getElementById('registrationNumber').value.trim(),
    semester: document.getElementById('semester').value,
  };

  // Validate form data
  if (!validateFormData(studentData)) {
    return;
  }

  // Disable form
  disableForm();

  try {
    // Show loading state
    showSubmissionLoading();

    // Submit attendance
    const submission = await submitAttendance_(sessionId, studentData);

    // Show success
    hideLoadingOverlay();
    showSuccessMessage(studentData);

  } catch (error) {
    console.error('Submission error:', error);
    
    // Re-enable form
    enableForm();
    
    // Show error
    if (error.message.includes('already submitted')) {
      showError(
        'Already Submitted',
        'You have already marked attendance for this session.'
      );
    } else if (error.message.includes('expired')) {
      showExpiredSession();
    } else {
      showError('Submission Error', error.message);
    }
  }
}

// Helper to avoid naming conflict
async function submitAttendance_(sessionId, studentData) {
  return await submitAttendance(sessionId, studentData);
}

function validateFormData(data) {
  if (!data.fullName) {
    showError('Validation Error', 'Please enter your full name');
    return false;
  }

  if (!data.rollNumber) {
    showError('Validation Error', 'Please enter your roll number');
    return false;
  }

  if (!data.registrationNumber) {
    showError('Validation Error', 'Please enter your registration number');
    return false;
  }

  if (!data.semester) {
    showError('Validation Error', 'Please select your semester');
    return false;
  }

  // Validate roll number format
  if (!/^[A-Z0-9]{3,20}$/.test(data.rollNumber)) {
    showError('Validation Error', 'Roll number should be 3-20 alphanumeric characters');
    return false;
  }

  // Validate registration number format
  if (!/^\d{6,12}$/.test(data.registrationNumber)) {
    showError('Validation Error', 'Registration number should be 6-12 digits');
    return false;
  }

  return true;
}

// ==================== UI CONTROLS ====================
function disableForm() {
  const form = document.getElementById('attendanceForm');
  const inputs = form.querySelectorAll('input, select, button');
  inputs.forEach(input => {
    input.disabled = true;
  });
}

function enableForm() {
  const form = document.getElementById('attendanceForm');
  const inputs = form.querySelectorAll('input, select, button');
  inputs.forEach(input => {
    input.disabled = false;
  });
}

function showSubmissionLoading() {
  const btn = document.getElementById('submitBtn');
  btn.textContent = 'Submitting...';
  btn.disabled = true;
}

function resetForm() {
  document.getElementById('attendanceForm').reset();
  document.getElementById('successOverlay').style.display = 'none';
  enableForm();
}

function closeError() {
  document.getElementById('errorOverlay').style.display = 'none';
}

// ==================== OVERLAY DISPLAYS ====================
function hideLoadingOverlay() {
  const overlay = document.getElementById('loadingOverlay');
  overlay.style.opacity = '0';
  overlay.style.pointerEvents = 'none';
  setTimeout(() => {
    overlay.style.display = 'none';
  }, 300);
}

function showSuccessMessage(studentData) {
  document.getElementById('successOverlay').style.display = 'flex';
  document.getElementById('successMessage').textContent = 
    `Your attendance for ${currentSession.subject} has been successfully recorded.`;
  document.getElementById('successName').textContent = `✓ ${studentData.fullName}`;
  document.getElementById('successRoll').textContent = `✓ Roll: ${studentData.rollNumber}`;

  // Stop form submission after showing success
  disableForm();
  sessionTimer?.stop();
}

function showError(title, message) {
  document.getElementById('errorTitle').textContent = title;
  document.getElementById('errorMessage').textContent = message;
  document.getElementById('errorOverlay').style.display = 'flex';
}

function showExpiredSession() {
  document.getElementById('expiredOverlay').style.display = 'flex';
  disableForm();
  
  const statusEl = document.getElementById('sessionStatus');
  statusEl.textContent = '⏰ Expired';
  statusEl.className = 'session-status expired';
}

function showSessionNotFound() {
  document.getElementById('errorTitle').textContent = 'Session Not Found';
  document.getElementById('errorMessage').textContent = 
    'This attendance session does not exist or has expired.';
  document.getElementById('errorOverlay').style.display = 'flex';
  
  const btn = document.querySelector('#errorOverlay .btn-primary');
  btn.textContent = 'Go Home';
  btn.onclick = () => window.location.href = '/';
}

// ==================== CONNECTION MONITORING ====================
function monitorConnection() {
  // Monitor Firebase connection
  setInterval(() => {
    const connectionBadge = document.getElementById('connectionBadge');
    
    if (AttendanceState.syncStatus === 'connected') {
      connectionBadge.textContent = '🟢 Connected';
      connectionBadge.classList.remove('disconnected');
    } else {
      connectionBadge.textContent = '🔴 Disconnected';
      connectionBadge.classList.add('disconnected');
    }
  }, 2000);
}

// ==================== CLEANUP ====================
window.addEventListener('beforeunload', () => {
  // Stop timer
  if (sessionTimer) {
    sessionTimer.stop();
  }

  // Unsubscribe from listeners
  unsubscribeListeners.forEach(unsubscribe => {
    if (typeof unsubscribe === 'function') {
      unsubscribe();
    }
  });
});

// ==================== PAGE INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  initStudentPage();
});

// ==================== AUTO-LOAD STATE ==================== 
// Attempt to restore session on page refresh
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    console.log('Page restored from bfcache');
    initStudentPage();
  }
});

console.log('✅ Student Page Script Loaded');
