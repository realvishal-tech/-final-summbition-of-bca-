// ============================================================================
// BCA STORE — ADVANCED TEST & EVALUATION SYSTEM (ADMIN ENGINE)
// Handles "Paste & Convert" for MCQs and Long Answers.
// ============================================================================

const AdminTestEngine = {
  currentParsedQuestions: [], // Central store for the current quiz being built
  // Regex patterns to detect Q&A structures from raw text
  patterns: {
    // Detects Q1., 1., Question 1, or just a block starting with text
    question: /(?:Q\d+[:\.]|Question\s*\d*[:\.]|\d+[:\.]|^\s*)(.+?)(?=(?:[A-D][\.\)\:]|[a-d][\.\)\:]|[1-4][\.\)\:]|Options:|Answer:|Ans:|$))/im,
    // Detects A. B. C. D. or a) b) c) d) or 1) 2) 3) 4)
    options: /(?:[A-D][\.\)\:]|[a-d][\.\)\:]|[1-4][\.\)\:])\s*(.+?)(?=(?:[A-D][\.\)\:]|[a-d][\.\)\:]|[1-4][\.\)\:]|Answer:|Ans:|Correct|$))/gi,
    // Detects Answer: A, Ans: B, Correct: C, or even just Answer: Option 1
    answer: /(?:Answer|Ans|Correct|Correct Option):\s*([A-D1-4])/i
  },

  /**
   * Parses raw messy text containing MCQs into a structured JSON array.
   * Supports common ChatGPT and academic document formats.
   */
  parseMCQs(rawText) {
    if (!rawText || rawText.trim() === '') return [];
    
    // Normalize line endings and clean up
    const cleanText = rawText.replace(/\r\n/g, '\n').trim();
    
    // Split raw text into individual question blocks
    // This splits at Question indicators or digits followed by a dot/bracket
    const blocks = cleanText.split(/(?=^Q\d+[:\.]|^Question\s*\d*[:\.]|^\d+[:\.])/im).filter(b => b.trim().length > 10);
    const parsedQuestions = [];

    blocks.forEach((block, index) => {
      let qText = '';
      const opts = [];
      let correctAns = '';

      // 1. Extract Question Text
      const qMatch = block.match(this.patterns.question);
      if (qMatch) {
        qText = qMatch[1].replace(/[\n\r]+/g, ' ').trim();
      } else {
        // Fallback: take first line as question
        qText = block.split('\n')[0].trim();
      }

      // 2. Extract Options
      let optMatch;
      this.patterns.options.lastIndex = 0; 
      while ((optMatch = this.patterns.options.exec(block)) !== null) {
        let optText = optMatch[1].replace(/[\n\r]+/g, ' ').trim();
        if (optText.length > 0 && opts.length < 4) {
           opts.push(optText);
        }
      }

      // 3. Extract Answer
      const aMatch = block.match(this.patterns.answer);
      if (aMatch) {
        const val = aMatch[1].toUpperCase();
        if (/[A-D]/.test(val)) {
            correctAns = val.charCodeAt(0) - 65; 
        } else if (/[1-4]/.test(val)) {
            correctAns = parseInt(val) - 1;
        }
      }

      // Final Validation
      if (qText && opts.length >= 2) {
        parsedQuestions.push({
          id: 'q_' + Date.now() + '_' + index,
          question: qText,
          options: opts,
          correctAnswer: correctAns !== '' ? correctAns : 0,
          type: 'mcq'
        });
      }
    });

    return parsedQuestions;
  },

  // ... (parseLongAnswer omitted for brevity, keeping it same)

  /**
   * Saves test to Firebase
   */
  saveTestToDB(testData, callback) {
    if (!window.db) {
        console.error("Firebase DB not initialized.");
        if(callback) callback(false, "Database connection error.");
        return;
    }
    
    const testRef = db.ref(`tests/${testData.semester}/${testData.subject}/${testData.testId}`);
    testRef.set(testData)
      .then(() => {
        if(callback) callback(true);
      })
      .catch(err => {
        console.error(err);
        if(callback) callback(false, err.message);
      });
  }
};

// UI Handlers
function handleMCQPaste() {
  const rawBox = document.getElementById('rawMcqInput');
  const previewBox = document.getElementById('mcqPreviewArea');
  
  if(!rawBox || !rawBox.value.trim()) {
      alert("Please paste some questions first.");
      return;
  }

  previewBox.innerHTML = '<div class="converting-loader"><div class="spinner"></div><p>AI Engine extracting questions...</p></div>';
  
  setTimeout(() => {
      const parsed = AdminTestEngine.parseMCQs(rawBox.value);
      
      if(parsed.length === 0) {
          previewBox.innerHTML = '<div style="color:var(--adm-red); padding:10px;">Could not detect valid questions. Please ensure format is Q1... A... B... Answer: A</div>';
          return;
      }

      // Merge with existing so users can paste multiple times
      AdminTestEngine.currentParsedQuestions = [...AdminTestEngine.currentParsedQuestions, ...parsed];
      
      // Render the unified list
      AdminTestEngine.renderParsedQuestions();
      
      // Clear input for next batch
      rawBox.value = '';
  }, 800);
}

// Global method to render the preview list
AdminTestEngine.renderParsedQuestions = function() {
    const previewBox = document.getElementById('mcqPreviewArea');
    const previewCount = document.getElementById('mcqPreviewCount');
    const resultData = document.getElementById('mcqParsedData');
    const timeInput = document.getElementById('quizTime');
    const questions = this.currentParsedQuestions;

    if(!previewBox) return;

    if(questions.length === 0) {
        previewBox.innerHTML = '<div style="text-align:center; padding:30px; color:var(--text-muted);">No questions added yet. Use the AI Parser or Manual Entry.</div>';
        if(previewCount) previewCount.textContent = '0 Questions Ready';
        if(resultData) resultData.value = '[]';
        return;
    }

    // Store for publishing
    if(resultData) resultData.value = JSON.stringify(questions);
    if(previewCount) previewCount.textContent = `${questions.length} Questions Ready`;
    
    // Auto-calculate time
    if(timeInput) timeInput.value = questions.length;

    let html = '';
    questions.forEach((q, i) => {
        html += `
        <div class="parsed-q-card animate-in" style="background:rgba(255,255,255,0.03); padding:20px; border-radius:16px; margin-bottom:16px; border:1px solid rgba(255,255,255,0.08); position:relative;">
            <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:12px;">
                <div class="q-head" style="font-weight:700; color:#fff; font-size:0.95rem; line-height:1.4;">
                    <span style="color:var(--adm-accent); margin-right:8px;">#${i+1}</span> ${q.question}
                </div>
                <button class="btn-outline" style="padding:4px 8px; font-size:0.7rem; color:var(--adm-red); border-color:rgba(239, 68, 68, 0.2); flex-shrink:0;" onclick="removeParsedQuestion(${i})">🗑️ Delete</button>
            </div>
            <div class="q-opts" style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">`;
        
        q.options.forEach((opt, oi) => {
            const isCorrect = q.correctAnswer === oi;
            html += `
            <div class="opt-item ${isCorrect ? 'correct' : ''}" style="padding:10px; border-radius:10px; background:${isCorrect ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.02)'}; font-size:0.8rem; border:1px solid ${isCorrect ? 'rgba(16,185,129,0.3)' : 'transparent'};">
                <span style="font-weight:bold; color:${isCorrect ? 'var(--adm-green)' : 'var(--text-muted)'}; margin-right:6px;">${String.fromCharCode(65+oi)}</span> ${opt}
            </div>`;
        });
        html += `</div></div>`;
    });
    previewBox.innerHTML = html;
};

function removeParsedQuestion(index) {
    if(confirm("Are you sure you want to remove this question?")) {
        AdminTestEngine.currentParsedQuestions.splice(index, 1);
        AdminTestEngine.renderParsedQuestions();
    }
}

function saveQuiz() {
  const questions = AdminTestEngine.currentParsedQuestions;
  const title = document.getElementById('quizTitle')?.value;
  const sem = document.getElementById('quizSem')?.value;
  const sub = document.getElementById('quizSub')?.value;
  const timeLimit = document.getElementById('quizTime')?.value;
  const feedback = document.getElementById('quizFeedback')?.value !== 'false'; 

  if(questions.length === 0 || !title || !sem || !sub) {
      alert("Please complete all fields and add questions first.");
      return;
  }

  const testId = 'test_' + Date.now();

  const testData = {
      testId: testId,
      title: title,
      semester: sem,
      subject: sub,
      type: 'quiz',
      questions: questions,
      timeLimit: parseInt(timeLimit) || questions.length,
      immediateFeedback: feedback,
      createdAt: Date.now(),
      status: 'published'
  };

  const btn = document.querySelector('.save-quiz-btn');
  const origText = btn.innerHTML;
  btn.innerHTML = '<div class="spinner" style="width:16px;height:16px;"></div> Saving...';
  btn.disabled = true;

  AdminTestEngine.saveTestToDB(testData, (success, err) => {
      btn.innerHTML = origText;
      btn.disabled = false;
      if(success) {
          alert("✅ Quiz Successfully Published to Question Bank!");
          document.getElementById('rawMcqInput').value = '';
          document.getElementById('mcqPreviewArea').innerHTML = '';
          document.getElementById('quizTitle').value = '';
          document.getElementById('mcqParsedData').value = '';
          loadQuestionBank();
      } else {
          alert("Error saving: " + err);
      }
  });
}

function handleLongAnswerSave() {
  const qTitle = document.getElementById('laTitle').value;
  const qText = document.getElementById('laQuestion').value;
  const idealAns = document.getElementById('laIdealAnswer').value;
  const keywords = document.getElementById('laKeywords').value;
  const marks = document.getElementById('laMarks').value;
  const sem = document.getElementById('laSem').value;
  const sub = document.getElementById('laSub').value;

  if(!qTitle || !qText || !idealAns || !sem || !sub) {
      alert("Please fill all required fields.");
      return;
  }

  const parsed = AdminTestEngine.parseLongAnswer(qText, idealAns, keywords, marks);
  if(!parsed) return;

  const testId = 'test_' + Date.now();
  const testData = {
      testId: testId,
      title: qTitle,
      semester: sem,
      subject: sub,
      type: 'long_answer',
      questionData: parsed,
      createdAt: Date.now(),
      status: 'published'
  };

  const btn = document.getElementById('saveLABtn');
  const origText = btn.innerHTML;
  btn.innerHTML = '<div class="spinner" style="width:16px;height:16px;"></div> Saving...';
  btn.disabled = true;

  AdminTestEngine.saveTestToDB(testData, (success, err) => {
      btn.innerHTML = origText;
      btn.disabled = false;
      if(success) {
          alert("✅ AI Evaluated Question published successfully!");
          document.getElementById('laTitle').value = '';
          document.getElementById('laQuestion').value = '';
          document.getElementById('laIdealAnswer').value = '';
          document.getElementById('laKeywords').value = '';
          loadQuestionBank();
      } else {
          alert("Error saving: " + err);
      }
  });
}

function toggleMcqMode(mode) {
    const aiView = document.getElementById('mcqAiView');
    const manView = document.getElementById('mcqManualView');
    const aiBtn = document.getElementById('btnMcqAiMode');
    const manBtn = document.getElementById('btnMcqManualMode');

    if (mode === 'AI') {
        aiView.style.display = 'block';
        manView.style.display = 'none';
        aiBtn.style.background = 'var(--adm-accent-bg)';
        aiBtn.style.color = 'var(--adm-accent)';
        manBtn.style.background = 'rgba(255,255,255,0.05)';
        manBtn.style.color = 'var(--text-muted)';
    } else {
        aiView.style.display = 'none';
        manView.style.display = 'block';
        manBtn.style.background = 'var(--adm-accent-bg)';
        manBtn.style.color = 'var(--adm-accent)';
        aiBtn.style.background = 'rgba(255,255,255,0.05)';
        aiBtn.style.color = 'var(--text-muted)';
    }
}

function addManualQuestion() {
    const q = document.getElementById('manQ').value.trim();
    const a = document.getElementById('manA').value.trim();
    const b = document.getElementById('manB').value.trim();
    const c = document.getElementById('manC').value.trim();
    const d = document.getElementById('manD').value.trim();
    const correct = parseInt(document.getElementById('manCorrect').value);

    if (!q || !a || !b) {
        alert("Please enter at least the question and two options.");
        return;
    }

    const options = [a, b];
    if (c) options.push(c);
    if (d) options.push(d);

    const questionObj = {
        question: q,
        options: options,
        correctAnswer: correct
    };

    // Push to central store
    AdminTestEngine.currentParsedQuestions.push(questionObj);
    
    // Refresh UI
    AdminTestEngine.renderParsedQuestions();

    // Reset Form
    ['manQ', 'manA', 'manB', 'manC', 'manD'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.value = '';
    });
    
    // Visual feedback
    console.log("✅ Question added manually.");
}

function clearCurrentQuiz() {
    if(confirm("This will remove ALL currently ready questions. Are you sure?")) {
        AdminTestEngine.currentParsedQuestions = [];
        AdminTestEngine.renderParsedQuestions();
    }
}

function loadQuestionBank() {
  const bankArea = document.getElementById('questionBankGrid');
  if(!bankArea || !window.db) return;

  bankArea.innerHTML = '<div class="spinner"></div>';

  db.ref('tests').once('value', snap => {
      if(!snap.exists()) {
          bankArea.innerHTML = '<p style="color:var(--text-muted);">No tests created yet.</p>';
          return;
      }

      let html = '';
      snap.forEach(sem => {
          sem.forEach(sub => {
              sub.forEach(test => {
                  const t = test.val();
                  const qCount = t.type === 'quiz' ? (t.questions?.length || 0) : 1;
                  const typeLabel = t.type === 'quiz' ? '📝 MCQ Quiz' : '🧠 AI Long Answer';
                  
                  html += `<div class="adm-qb-card">
                      <div class="qb-header">
                          <span class="qb-badge ${t.type === 'quiz' ? 'bg-blue' : 'bg-purple'}">${typeLabel}</span>
                          <span class="qb-date">${new Date(t.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h4 class="qb-title">${t.title}</h4>
                      <div class="qb-meta">
                          <span>📍 ${t.subject} (${t.semester})</span>
                          <span>🔢 ${qCount} Questions</span>
                      </div>
                      <div class="qb-actions">
                          <button class="adm-quick-btn" style="padding:6px 12px; font-size:0.75rem;" onclick="alert('Edit feature coming soon')">✏️ Edit</button>
                          <button class="adm-quick-btn" style="padding:6px 12px; font-size:0.75rem; color:var(--adm-red); border-color:var(--adm-red-bg);" onclick="deleteTest('${t.semester}', '${t.subject}', '${t.testId}')">🗑️ Delete</button>
                      </div>
                  </div>`;
              });
          });
      });
      bankArea.innerHTML = html || '<p style="color:var(--text-muted);">No tests created yet.</p>';
  });
}

function deleteTest(sem, sub, id) {
  if(confirm("Are you sure you want to delete this test?")) {
      db.ref(`tests/${sem}/${sub}/${id}`).remove()
          .then(() => loadQuestionBank())
          .catch(err => alert("Error deleting: " + err));
  }
}

function showTestHubSubTab(tab) {
    const views = ['viewMCQ', 'viewLong', 'viewBank', 'viewResults'];
    const btns = ['btnShowMCQ', 'btnShowLong', 'btnShowBank', 'btnShowResults'];
    
    views.forEach(v => {
        const el = document.getElementById(v);
        if(el) el.style.display = 'none';
    });
    
    btns.forEach(b => {
        const btn = document.getElementById(b);
        if(btn) {
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-outline');
        }
    });

    const activeView = 'view' + tab;
    const activeBtn = 'btnShow' + tab;
    
    const av = document.getElementById(activeView);
    if(av) av.style.display = 'block';
    
    const ab = document.getElementById(activeBtn);
    if(ab) {
        ab.classList.remove('btn-outline');
        ab.classList.add('btn-primary');
    }

    if (tab === 'Bank') loadQuestionBank();
    if (tab === 'Results') loadTestResults();
}

let resultsListener = null;

function loadTestResults() {
    const table = document.getElementById('testResultsTable');
    const sem = document.getElementById('resFilterSem').value;
    if (!table || !window.db) return;

    // Cleanup previous listener if exists
    if (resultsListener) db.ref('test_results/' + sem).off('value', resultsListener);

    table.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:40px;"><div class="spinner"></div><p style="font-size:0.7rem; color:var(--text-muted); margin-top:8px;">Listening for live submissions...</p></td></tr>';

    resultsListener = db.ref('test_results/' + sem).on('value', snap => {
        if (!snap.exists()) {
            table.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:40px; color:var(--text-muted);">No submissions found for this semester.</td></tr>';
            return;
        }

        let html = '';
        const allResults = [];

        snap.forEach(subSnap => {
            subSnap.forEach(testSnap => {
                testSnap.forEach(studSnap => {
                    allResults.push({
                        ...studSnap.val(),
                        subKey: subSnap.key,
                        testKey: testSnap.key
                    });
                });
            });
        });

        // Sort by Score (Descending) - Highest marks on top
        allResults.sort((a, b) => b.summary.score - a.summary.score);

        allResults.forEach(r => {
            const date = new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date(r.timestamp).toLocaleDateString();
            const accuracyColor = r.summary.accuracy >= 70 ? '#10b981' : (r.summary.accuracy >= 40 ? '#f59e0b' : '#ef4444');
            
            html += `<tr class="animate-in">
                <td>
                    <div style="font-weight:700;">${r.student.name}</div>
                    <div style="font-size:0.7rem; color:var(--text-muted);">${r.student.class}</div>
                </td>
                <td><code>${r.student.roll}</code></td>
                <td style="font-size:0.85rem; max-width:180px; overflow:hidden; text-overflow:ellipsis;">${r.testTitle}</td>
                <td style="font-weight:800;">${r.summary.score} / ${r.summary.maxScore}</td>
                <td><span class="adm-section-badge" style="background:rgba(0,0,0,0.1); color:${accuracyColor};">${r.summary.accuracy}%</span></td>
                <td style="font-size:0.8rem; color:var(--text-muted);">${date}</td>
                <td>
                    <button class="btn-outline" style="padding:4px 8px; font-size:0.7rem; color:var(--adm-red);" onclick="deleteResult('${sem}', '${r.subKey}', '${r.testKey}', '${r.student.roll}')">🗑️</button>
                </td>
            </tr>`;
        });

        table.innerHTML = html || '<tr><td colspan="7" style="text-align:center; padding:40px; color:var(--text-muted);">No submissions found.</td></tr>';
    });
}

function deleteResult(sem, sub, tid, roll) {
    if (confirm("Delete this student record forever?")) {
        db.ref(`test_results/${sem}/${sub}/${tid}/${roll}`).remove()
            .then(() => loadTestResults())
            .catch(err => alert("Error: " + err));
    }
}
