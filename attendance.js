/**
 * BCA STORE - Premium Realtime Attendance System
 * Powered by Firebase Firestore (Realtime Architecture)
 */

let fs = null;
let activeSessionsUnsub = null;
let historyUnsub = null;
let submissionsUnsub = {}; // Map of sessionId -> unsub function
let timerIntervals = {};

// Initialize Firestore
function initAttendanceFirestore() {
    try {
        if (typeof firebase !== 'undefined') {
            fs = firebase.firestore();
            console.log("✅ Realtime Attendance System Initialized");
            listenToActiveSessions();
            listenToHistory();
        } else {
            console.error("❌ Firebase SDK not found");
        }
    } catch (e) {
        console.error("❌ Firestore Init Error:", e);
    }
}

// ─── ADMIN: CREATE SESSION ───────────────────────────────────────
async function startAttendanceSession() {
    const teacher = document.getElementById('attTeacherName').value.trim();
    const sem = document.getElementById('attSemester').value;
    const sub = document.getElementById('attSubject').value;
    const duration = parseInt(document.getElementById('attDuration').value) || 10;
    const btnText = document.getElementById('btn-text');
    const btnLoader = document.getElementById('attBtnLoader');

    if (!teacher || !sem || !sub) {
        showToast("❌ Please fill all required fields.", "error");
        return;
    }

    if (!fs) {
        showToast("❌ Firebase not connected.", "error");
        return;
    }

    if (btnText) btnText.textContent = "Starting...";
    if (btnLoader) btnLoader.style.display = 'inline-block';

    const sessionId = "sess_" + Math.random().toString(36).substr(2, 9);
    
    // Calculate expiry using Server Timestamp offset locally, but rely on status for truth
    const now = Date.now();
    const expiresAt = firebase.firestore.Timestamp.fromMillis(now + (duration * 60000));

    const attendanceLink = new URL('attendance-session.html', window.location.href).href + '?id=' + sessionId;

    const sessionData = {
        sessionId,
        teacherName: teacher,
        semester: sem,
        subject: sub,
        duration,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        expiresAt: expiresAt,
        status: 'active',
        attendanceCount: 0,
        attendanceLink: attendanceLink
    };

    try {
        await fs.collection('active_attendance_registry').doc(sessionId).set(sessionData);
        showToast("✅ Attendance session started!", "success");
        
        // Clear form
        document.getElementById('attTeacherName').value = "";
        document.getElementById('attSemester').value = "";
        document.getElementById('attSubject').innerHTML = '<option value="">— Select Subject —</option>';
    } catch (e) {
        console.error("Error starting session:", e);
        showToast("❌ Failed to start session.", "error");
    } finally {
        if (btnText) btnText.textContent = "Initialize Session";
        if (btnLoader) btnLoader.style.display = 'none';
    }
}

// ─── ADMIN: REALTIME ACTIVE SESSIONS ─────────────────────────────
function listenToActiveSessions() {
    if (!fs) return;
    
    if (activeSessionsUnsub) activeSessionsUnsub();
    
    activeSessionsUnsub = fs.collection('active_attendance_registry')
        .where('status', '==', 'active')
        .onSnapshot(snap => {
            const container = document.getElementById('activeSessionsContainer');
            if (!container) return;

            if (snap.empty) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📭</div>
                        <h3>No Active Sessions</h3>
                        <p>Start a new session to track live attendance.</p>
                    </div>`;
                
                const globalInd = document.getElementById('globalLiveIndicator');
                if (globalInd) {
                    globalInd.classList.add('hidden');
                    globalInd.classList.remove('flex');
                }

                // Clear any running timers that no longer exist
                Object.keys(timerIntervals).forEach(id => {
                    clearInterval(timerIntervals[id]);
                    delete timerIntervals[id];
                });
                return;
            }

            const globalInd = document.getElementById('globalLiveIndicator');
            if (globalInd) {
                globalInd.classList.remove('hidden');
                globalInd.classList.add('flex');
            }

            let html = '';
            const activeSessions = [];

            snap.forEach(doc => {
                const data = doc.data();
                html += generateActiveSessionCard(data);
                activeSessions.push(data);
            });

            container.innerHTML = html;

            activeSessions.forEach(data => {
                let expiryTime = data.expiresAt;
                if (expiryTime && typeof expiryTime.toMillis === 'function') {
                    expiryTime = expiryTime.toMillis();
                }

                // Realtime expiry check fallback (Admin side)
                if (Date.now() >= expiryTime) {
                    expireSession(data.sessionId);
                } else {
                    startAdminTimer(data.sessionId, expiryTime);
                }

                // Listen to submissions for this session if not already listening
                if (!submissionsUnsub[data.sessionId]) {
                    listenToSubmissions(data.sessionId);
                }
            });

            // Cleanup removed sessions
            const activeIds = snap.docs.map(d => d.id);
            Object.keys(submissionsUnsub).forEach(id => {
                if (!activeIds.includes(id)) {
                    submissionsUnsub[id]();
                    delete submissionsUnsub[id];
                }
            });

        }, err => {
            console.error("Active sessions sync error:", err);
            showToast("⚠️ Realtime connection lost. Retrying...", "warning");
        });
}

function generateActiveSessionCard(session) {
    return `
    <div class="glass-card active-session-card" id="session-card-${session.sessionId}">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
            <div>
                <h3 class="live-indicator"><span class="pulse-indicator"></span> LIVE</h3>
                <h4 style="font-size: 1.1rem; font-weight: 800; margin-top: 8px;">${session.subject}</h4>
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">${session.semester.replace('Semester','Sem')} • Prof. ${session.teacherName}</p>
            </div>
            <div style="text-align: right;">
                <div class="timer-display" id="timer-${session.sessionId}">--:--</div>
                <div style="font-size: 0.8rem; color: var(--success); font-weight: 700; margin-top: 8px;">
                    <span id="count-${session.sessionId}">${session.attendanceCount || 0}</span> Present
                </div>
            </div>
        </div>

        <div style="display: flex; gap: 8px; margin-bottom: 20px;">
            <input type="text" class="link-input" value="${session.attendanceLink}" readonly onclick="this.select()" />
            <button class="btn-outline" onclick="copyText('${session.attendanceLink}')">Copy</button>
            <button class="btn-primary" style="padding: 8px 16px; font-size: 0.85rem;" onclick="window.open('${session.attendanceLink}', '_blank')">Open</button>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 16px;">
            <button class="btn-outline" onclick="viewSubmissions('${session.sessionId}')" style="font-size: 0.85rem;">Feed</button>
            <button class="btn-danger" onclick="expireSession('${session.sessionId}')" style="font-size: 0.85rem;">End Session Now</button>
        </div>
    </div>`;
}

// ─── ADMIN: REALTIME SUBMISSIONS FEED ────────────────────────────
function listenToSubmissions(sessionId) {
    if (!fs) return;
    if (submissionsUnsub[sessionId]) submissionsUnsub[sessionId]();

    submissionsUnsub[sessionId] = fs.collection('attendance_submissions')
        .where('sessionId', '==', sessionId)
        .orderBy('timestamp', 'desc')
        .onSnapshot(snap => {
            // Update counter in DB logic handles count, but UI can use this too
            const countEl = document.getElementById(`count-${sessionId}`);
            if (countEl) countEl.textContent = snap.size;

            // Optional: update feed if currently viewing this session's feed
            if (document.getElementById('feed-session-id')?.value === sessionId) {
                renderSubmissionsFeed(snap.docs.map(d => d.data()));
            }
        });
}

function viewSubmissions(sessionId) {
    // Hidden input to store which session feed we're looking at
    let hiddenInput = document.getElementById('feed-session-id');
    if (!hiddenInput) {
        hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.id = 'feed-session-id';
        document.body.appendChild(hiddenInput);
    }
    hiddenInput.value = sessionId;
    
    // Smooth scroll to feed
    document.getElementById('attendanceFeedSection')?.scrollIntoView({ behavior: 'smooth' });
}

function renderSubmissionsFeed(records) {
    const table = document.getElementById('attendanceFeedTable');
    const empty = document.getElementById('attendanceFeedEmpty');
    
    if (!records.length) {
        table.innerHTML = '';
        if (empty) empty.style.display = 'block';
        return;
    }
    
    if (empty) empty.style.display = 'none';

    table.innerHTML = records.map(r => {
        const time = r.timestamp ? r.timestamp.toDate().toLocaleTimeString('en-IN') : '--:--:--';
        return `
        <tr class="fade-in">
            <td style="font-weight: 700; color: var(--text);">${r.studentName}</td>
            <td><span class="roll-badge">${r.rollNumber}</span></td>
            <td>${time}</td>
            <td><span class="status-badge success">Present</span></td>
        </tr>`;
    }).join('');
}

// ─── ADMIN: TIMERS & EXPIRY ──────────────────────────────────────
function startAdminTimer(sessionId, expiresAt) {
    if (timerIntervals[sessionId]) clearInterval(timerIntervals[sessionId]);

    function updateTimer() {
        const display = document.getElementById(`timer-${sessionId}`);
        const now = Date.now();
        const diff = expiresAt - now;
        
        if (diff <= 0) {
            clearInterval(timerIntervals[sessionId]);
            delete timerIntervals[sessionId];
            if (display) {
                display.textContent = "EXPIRED";
                display.style.color = "var(--danger)";
            }
            expireSession(sessionId, true);
            return;
        }
        
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        if (display) {
            display.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            if (diff < 60000) display.style.color = "var(--warning)";
        }

        const globalTimer = document.getElementById('globalTimer');
        if (globalTimer) {
            // To prevent flickering with multiple sessions, only bind to the first one
            if (!globalTimer.dataset.sessionId || globalTimer.dataset.sessionId === sessionId) {
                globalTimer.dataset.sessionId = sessionId;
                globalTimer.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }
        }
    }

    updateTimer(); // run immediately once
    timerIntervals[sessionId] = setInterval(updateTimer, 1000);
}

async function expireSession(sessionId, auto = false) {
    try {
        const sessionRef = fs.collection('active_attendance_registry').doc(sessionId);
        const doc = await sessionRef.get();
        
        if (doc.exists) {
            const data = doc.data();
            data.status = 'expired';
            data.expiredAt = firebase.firestore.FieldValue.serverTimestamp();
            
            const batch = fs.batch();
            batch.set(fs.collection('attendance_history').doc(sessionId), data);
            batch.delete(sessionRef);
            await batch.commit();
        }
        
        if (timerIntervals[sessionId]) {
            clearInterval(timerIntervals[sessionId]);
            delete timerIntervals[sessionId];
        }

        // Submissions unsub will happen automatically via listenToActiveSessions cleanup
        if (!auto) showToast("🛑 Session ended and moved to history.", "info");
    } catch (e) {
        console.error("Error expiring session:", e);
    }
}

// ─── ADMIN: HISTORY ──────────────────────────────────────────────
function listenToHistory() {
    if (!fs) return;
    if (historyUnsub) historyUnsub();

    historyUnsub = fs.collection('attendance_history')
        .orderBy('createdAt', 'desc')
        .limit(20)
        .onSnapshot(snap => {
            const table = document.getElementById('attendanceHistoryTable');
            const empty = document.getElementById('attendanceHistoryEmpty');
            if (!table) return;

            if (snap.empty) {
                table.innerHTML = '';
                if (empty) empty.style.display = 'block';
                return;
            }

            if (empty) empty.style.display = 'none';

            table.innerHTML = snap.docs.map(doc => {
                const s = doc.data();
                const dateStr = s.createdAt ? s.createdAt.toDate().toLocaleDateString('en-IN') : 'N/A';
                return `
                <tr>
                    <td>${dateStr}</td>
                    <td style="font-weight:600;">${s.subject}</td>
                    <td>${s.teacherName}</td>
                    <td>${s.semester.replace('Semester','Sem ')}</td>
                    <td><span class="count-badge">${s.attendanceCount || 0}</span></td>
                    <td>
                        <button class="btn-sm btn-outline" onclick="exportSessionCSV('${s.sessionId}')">Export</button>
                    </td>
                </tr>`;
            }).join('');
        });
}

// ─── UTILS ───────────────────────────────────────────────────────
function copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast("📋 Copied to clipboard!", "success");
    }).catch(() => {
        showToast("❌ Failed to copy.", "error");
    });
}

async function exportSessionCSV(sessionId) {
    if (!fs) return;
    try {
        const snap = await fs.collection('attendance_submissions')
            .where('sessionId', '==', sessionId)
            .orderBy('timestamp', 'asc')
            .get();
            
        if (snap.empty) {
            showToast("No records found to export.", "warning");
            return;
        }

        let csv = "Student Name,Roll Number,Semester,Time,Status\n";
        snap.forEach(doc => {
            const d = doc.data();
            const time = d.timestamp ? d.timestamp.toDate().toLocaleTimeString('en-IN') : 'N/A';
            csv += `"${d.studentName}","${d.rollNumber}","${d.semester}","${time}","Present"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Attendance_${sessionId}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

    } catch(e) {
        console.error("Export error:", e);
        showToast("Error exporting data.", "error");
    }
}

// Ensure subjects update logic remains
const DEFAULT_SUBJECTS = {
    Semester1: ["Mathematical Foundation", "Computer Fundamentals", "Business Communication", "C Programming", "Lab on DOS & Windows", "Lab on C"],
    Semester2: ["Discrete Mathematics", "Computer Architecture", "Data Structure", "System Analysis and Design", "Lab on MS-Office", "Lab on Data Structure"],
    Semester3: ["Fundamentals of Management", "Database Management System", "C++ Programming", "Numerical Methodology", "Lab on DBMS", "Lab on C++"],
    Semester4: ["Java Programming", "Computer Graphics", "Operating System", "Software Engineering", "Lab on Java", "Lab on Computer Graphics"],
    Semester5: ["RDBMS", "Artificial Intelligence", "Web Technology", "Computer Network", "Lab on Oracle", "Lab on Python"],
    Semester6: ["Project Report", "Seminar Presentation", "Viva-Voce"]
};

function updateAttendanceSubjectDropdown() {
    const sem = document.getElementById('attSemester').value;
    const subSelect = document.getElementById('attSubject');
    if (!subSelect) return;
    subSelect.innerHTML = '<option value="">— Select Subject —</option>';
    
    if (sem && DEFAULT_SUBJECTS[sem]) {
        DEFAULT_SUBJECTS[sem].forEach(sub => {
            subSelect.innerHTML += `<option value="${sub}">${sub}</option>`;
        });
    }
}

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
    initAttendanceFirestore();
});
