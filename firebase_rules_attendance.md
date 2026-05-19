// ================================================
// Firebase Firestore Security Rules for Attendance
// ================================================
// Copy this to Firebase Console > Firestore > Rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ==================== ADMIN CHECK ====================
    function isAdmin(uid) {
      return exists(/databases/$(database)/documents/admins/$(uid));
    }

    function isOwner(uid) {
      return request.auth.uid == uid;
    }

    // ==================== ADMIN COLLECTION ====================
    match /admins/{document=**} {
      allow read: if request.auth != null && isAdmin(request.auth.uid);
      allow write: if false; // Admins are assigned via console only
    }

    // ==================== ACTIVE ATTENDANCE REGISTRY ====================
    // Critical collection for live sessions
    match /active_attendance_registry/{sessionId} {
      // Admins can read/write their own sessions
      allow read, write: if request.auth != null && 
                           isAdmin(request.auth.uid) &&
                           resource.data.createdBy == request.auth.uid;
      
      // Public can read (for validation on student page)
      allow read: if request.auth == null && 
                     resource.data.status == 'active';
    }

    // ==================== ATTENDANCE SESSIONS COLLECTION ====================
    // Persistent store of all sessions
    match /attendance_sessions/{sessionId} {
      // Admins can read/write their own sessions
      allow read, write: if request.auth != null && 
                           isAdmin(request.auth.uid) &&
                           resource.data.createdBy == request.auth.uid;
      
      // Anyone can read expired sessions (for history)
      allow read: if request.auth != null && 
                     (resource.data.status == 'expired' ||
                      resource.data.createdBy == request.auth.uid);
    }

    // ==================== ATTENDANCE SUBMISSIONS ====================
    // Student submissions - write once, never update
    match /attendance_submissions/{submissionId} {
      // Admins can read submissions for their sessions
      allow read: if request.auth != null && isAdmin(request.auth.uid);
      
      // Anyone can write (submit attendance) if:
      // 1. Session exists and is active
      // 2. No duplicate submission exists
      // 3. Session not expired
      allow create: if request.auth == null &&
                       request.resource.data.sessionId != null &&
                       request.resource.data.rollNumber != null;
      
      // Prevent updates after submission
      allow update, delete: if false;
    }

    // ==================== ATTENDANCE LOGS ====================
    // Audit trail for security
    match /attendance_logs/{logId} {
      // Admins can read their logs
      allow read: if request.auth != null && isAdmin(request.auth.uid);
      
      // System can write (from Cloud Functions)
      allow write: if request.auth == null;
    }

    // ==================== ANALYTICS CACHE ====================
    // Cached analytics data for performance
    match /attendance_analytics/{analyticsId} {
      // Admins can read
      allow read: if request.auth != null && isAdmin(request.auth.uid);
      
      // System can write (from Cloud Functions)
      allow write: if request.auth == null;
    }

    // ==================== USER PROFILES ====================
    match /user_profiles/{userId} {
      // Users can read/write their own profile
      allow read, write: if request.auth.uid == userId;
      
      // Admins can read all profiles
      allow read: if request.auth != null && isAdmin(request.auth.uid);
    }

    // ==================== DENY ALL OTHERS ====================
    match /{document=**} {
      allow read, write: if false;
    }
  }
}

// ================================================
// Firebase Realtime Database Rules
// ================================================
// Copy this to Firebase Console > Realtime Database > Rules

{
  "rules": {
    "attendance_sessions": {
      "$sessionId": {
        ".read": "auth != null",
        ".write": "auth != null && root.child('admins').child(auth.uid).exists()",
        "submissions": {
          ".read": true,
          ".write": "newData.val() != null"
        }
      }
    },
    "admin_sessions": {
      ".read": "auth != null && root.child('admins').child(auth.uid).exists()",
      ".write": "auth != null && root.child('admins').child(auth.uid).exists()"
    }
  }
}

// ================================================
// Cloud Functions for Attendance System
// ================================================
// Deploy these to Firebase Cloud Functions

/**
 * Auto-expire sessions that have passed their expiry time
 * Trigger: Every 1 minute via Cloud Scheduler
 */
exports.autoExpireAttendanceSessions = functions
  .pubsub.schedule('every 1 minutes')
  .onRun(async (context) => {
    const db = admin.firestore();
    const now = new Date();

    try {
      const expiredSessions = await db.collection('active_attendance_registry')
        .where('expiresAt', '<', now)
        .where('status', '==', 'active')
        .get();

      const batch = db.batch();

      expiredSessions.docs.forEach(doc => {
        batch.update(doc.ref, {
          status: 'expired',
          endedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      await batch.commit();
      console.log(`Expired ${expiredSessions.docs.length} sessions`);

      return null;
    } catch (error) {
      console.error('Error auto-expiring sessions:', error);
      return null;
    }
  });

/**
 * Aggregate attendance statistics
 * Trigger: When submission is created
 */
exports.aggregateAttendanceStats = functions
  .firestore.document('attendance_submissions/{submissionId}')
  .onCreate(async (snap, context) => {
    const db = admin.firestore();
    const submission = snap.data();
    const sessionId = submission.sessionId;

    try {
      // Count submissions for this session
      const submissionsCount = await db.collection('attendance_submissions')
        .where('sessionId', '==', sessionId)
        .get();

      // Update analytics
      await db.collection('attendance_analytics').doc(sessionId).set({
        sessionId: sessionId,
        totalSubmissions: submissionsCount.docs.length,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      console.log(`Updated stats for session ${sessionId}`);
      return null;
    } catch (error) {
      console.error('Error updating stats:', error);
      return null;
    }
  });

/**
 * Log all attendance activities for audit trail
 * Trigger: On any attendance-related operation
 */
exports.logAttendanceActivity = functions
  .firestore.document('attendance_submissions/{submissionId}')
  .onCreate(async (snap, context) => {
    const db = admin.firestore();
    const submission = snap.data();

    try {
      await db.collection('attendance_logs').add({
        action: 'attendance_submitted',
        sessionId: submission.sessionId,
        rollNumber: submission.rollNumber,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        ipAddress: submission.studentIP,
        deviceInfo: submission.deviceInfo,
      });

      return null;
    } catch (error) {
      console.error('Error logging activity:', error);
      return null;
    }
  });
