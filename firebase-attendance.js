// ================================================
// Firebase Configuration for Attendance System
// ================================================

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSy...", // Replace with your Firebase API key
  authDomain: "bcastudy-hub.firebaseapp.com",
  projectId: "bcastudy-hub",
  storageBucket: "bcastudy-hub.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// ================================================
// Global Attendance State Management
// ================================================

const AttendanceState = {
  currentUser: null,
  isAdmin: false,
  activeSessions: [],
  sessionHistory: [],
  currentSession: null,
  submissions: [],
  listeners: [],
  syncStatus: 'connected',
};

// ================================================
// Authentication Helpers
// ================================================

async function initAuthListener() {
  auth.onAuthStateChanged(async (user) => {
    AttendanceState.currentUser = user;
    
    if (user) {
      // Check if user is admin
      const adminDoc = await db.collection('admins').doc(user.uid).get();
      AttendanceState.isAdmin = adminDoc.exists;
      
      // Route to appropriate page
      if (AttendanceState.isAdmin) {
        if (window.location.pathname !== '/attendance-admin.html') {
          window.location.href = '/attendance-admin.html';
        }
      } else {
        if (window.location.pathname !== '/login.html') {
          window.location.href = '/login.html';
        }
      }
    } else {
      window.location.href = '/login.html';
    }
  });
}

// Admin login
async function adminLogin(email, password) {
  try {
    const result = await auth.signInWithEmailAndPassword(email, password);
    return result.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Admin logout
async function adminLogout() {
  try {
    await auth.signOut();
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// ================================================
// Session Management
// ================================================

// Create new attendance session
async function createAttendanceSession(sessionData) {
  try {
    const sessionId = generateUniqueId();
    const attendanceLink = `/attendance/live/${sessionId}`;
    
    const sessionDoc = {
      sessionId: sessionId,
      subject: sessionData.subject,
      teacher: sessionData.teacher,
      batch: sessionData.batch,
      semester: sessionData.semester,
      duration: sessionData.duration || 15, // minutes
      description: sessionData.description || '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      expiresAt: new Date(Date.now() + (sessionData.duration || 15) * 60000),
      status: 'active',
      attendanceCount: 0,
      attendanceLink: attendanceLink,
      createdBy: AttendanceState.currentUser.uid,
      submissions: [],
    };

    // Save to active registry
    const docRef = await db.collection('active_attendance_registry').doc(sessionId).set(sessionDoc);
    
    // Also save to sessions collection for history
    await db.collection('attendance_sessions').doc(sessionId).set(sessionDoc);
    
    console.log('✅ Attendance session created:', sessionId);
    return sessionDoc;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
}

// Get all active sessions
function listenToActiveSessions(callback) {
  const unsubscribe = db.collection('active_attendance_registry')
    .where('createdBy', '==', AttendanceState.currentUser.uid)
    .where('status', '==', 'active')
    .orderBy('createdAt', 'desc')
    .onSnapshot((snapshot) => {
      AttendanceState.activeSessions = [];
      snapshot.forEach((doc) => {
        AttendanceState.activeSessions.push(doc.data());
      });
      callback(AttendanceState.activeSessions);
    }, (error) => {
      console.error('Error listening to sessions:', error);
    });

  AttendanceState.listeners.push(unsubscribe);
  return unsubscribe;
}

// Get session history
async function getSessionHistory() {
  try {
    const snapshot = await db.collection('attendance_sessions')
      .where('createdBy', '==', AttendanceState.currentUser.uid)
      .where('status', '==', 'expired')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    AttendanceState.sessionHistory = snapshot.docs.map(doc => doc.data());
    return AttendanceState.sessionHistory;
  } catch (error) {
    console.error('Error fetching history:', error);
    return [];
  }
}

// Get real-time submissions feed
function listenToSubmissions(sessionId, callback) {
  const unsubscribe = db.collection('attendance_submissions')
    .where('sessionId', '==', sessionId)
    .orderBy('submittedAt', 'desc')
    .onSnapshot((snapshot) => {
      const submissions = [];
      snapshot.forEach((doc) => {
        submissions.push(doc.data());
      });
      AttendanceState.submissions = submissions;
      callback(submissions);
    }, (error) => {
      console.error('Error listening to submissions:', error);
    });

  AttendanceState.listeners.push(unsubscribe);
  return unsubscribe;
}

// End attendance session
async function endAttendanceSession(sessionId) {
  try {
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    
    // Update active registry
    await db.collection('active_attendance_registry').doc(sessionId).update({
      status: 'expired',
      endedAt: timestamp,
      updatedAt: timestamp,
    });

    // Update sessions collection
    await db.collection('attendance_sessions').doc(sessionId).update({
      status: 'expired',
      endedAt: timestamp,
      updatedAt: timestamp,
    });

    console.log('✅ Session ended:', sessionId);
  } catch (error) {
    console.error('Error ending session:', error);
    throw error;
  }
}

// ================================================
// Student Attendance Submission
// ================================================

// Submit attendance as student
async function submitAttendance(sessionId, studentData) {
  try {
    // Validate session
    const sessionDoc = await db.collection('active_attendance_registry').doc(sessionId).get();
    
    if (!sessionDoc.exists) {
      throw new Error('Session not found');
    }

    const session = sessionDoc.data();

    // Validate session status
    if (session.status !== 'active') {
      throw new Error('Session has expired');
    }

    // Validate expiry
    if (new Date() > new Date(session.expiresAt)) {
      // Auto-expire if needed
      await endAttendanceSession(sessionId);
      throw new Error('Session has expired');
    }

    // Check for duplicate attendance
    const duplicateCheck = await db.collection('attendance_submissions')
      .where('sessionId', '==', sessionId)
      .where('rollNumber', '==', studentData.rollNumber)
      .get();

    if (!duplicateCheck.empty) {
      throw new Error('You have already submitted attendance for this session');
    }

    // Create submission record
    const submission = {
      sessionId: sessionId,
      fullName: studentData.fullName,
      rollNumber: studentData.rollNumber,
      registrationNumber: studentData.registrationNumber,
      semester: studentData.semester,
      submittedAt: firebase.firestore.FieldValue.serverTimestamp(),
      studentIP: await getClientIP(),
      deviceInfo: getDeviceInfo(),
      status: 'submitted',
    };

    // Save submission
    const docRef = await db.collection('attendance_submissions').add(submission);

    // Update submission count in session
    await db.collection('active_attendance_registry').doc(sessionId).update({
      attendanceCount: firebase.firestore.FieldValue.increment(1),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    // Also update in sessions collection
    await db.collection('attendance_sessions').doc(sessionId).update({
      attendanceCount: firebase.firestore.FieldValue.increment(1),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    console.log('✅ Attendance submitted:', docRef.id);
    return submission;
  } catch (error) {
    console.error('Error submitting attendance:', error);
    throw error;
  }
}

// Get session details (for student page)
async function getSessionDetails(sessionId) {
  try {
    const doc = await db.collection('active_attendance_registry').doc(sessionId).get();
    
    if (!doc.exists) {
      throw new Error('Session not found or has expired');
    }

    return doc.data();
  } catch (error) {
    console.error('Error getting session:', error);
    throw error;
  }
}

// ================================================
// Realtime Countdown & Session Management
// ================================================

class SessionTimer {
  constructor(sessionId, expiresAt, onTick, onExpire) {
    this.sessionId = sessionId;
    this.expiresAt = new Date(expiresAt);
    this.onTick = onTick;
    this.onExpire = onExpire;
    this.interval = null;
    this.isActive = true;
  }

  start() {
    this.updateTimer();
    this.interval = setInterval(() => this.updateTimer(), 1000);
  }

  updateTimer() {
    const now = new Date();
    const diff = this.expiresAt - now;

    if (diff <= 0) {
      this.expire();
      return;
    }

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    this.onTick(minutes, seconds);
  }

  expire() {
    this.stop();
    this.onExpire();
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isActive = false;
  }
}

// ================================================
// Utility Functions
// ================================================

// Generate unique session ID
function generateUniqueId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Get client IP (mock - replace with actual implementation)
async function getClientIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    return 'unknown';
  }
}

// Get device information
function getDeviceInfo() {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

// ================================================
// Realtime Connection Status
// ================================================

firebase.firestore().enableNetwork().then(() => {
  AttendanceState.syncStatus = 'connected';
  console.log('🟢 Connected to Firebase');
}).catch((err) => {
  AttendanceState.syncStatus = 'disconnected';
  console.warn('🔴 Disconnected from Firebase:', err);
});

// Listen to connection status
db.collection('_metadata').doc('connection_status')
  .onSnapshot((doc) => {
    if (doc.exists && doc.data().connected) {
      AttendanceState.syncStatus = 'connected';
    }
  });

// ================================================
// Cleanup
// ================================================

window.addEventListener('beforeunload', () => {
  // Cleanup all listeners
  AttendanceState.listeners.forEach(unsubscribe => {
    if (typeof unsubscribe === 'function') {
      unsubscribe();
    }
  });
  AttendanceState.listeners = [];
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    db, auth, AttendanceState,
    createAttendanceSession, getSessionHistory, listenToActiveSessions,
    listenToSubmissions, endAttendanceSession, submitAttendance,
    getSessionDetails, SessionTimer, generateUniqueId,
  };
}
