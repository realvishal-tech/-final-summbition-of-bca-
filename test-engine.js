// ============================================================================
// BCA STORE — CLIENT-SIDE AI EVALUATION ENGINE & TEST MANAGER
// Provides Anti-Cheat, NLP Long Answer evaluation, and MCQ handling.
// ============================================================================

const TestEngine = {
  activeTest: null,
  currentQuestionIndex: 0,
  answers: {},
  startTime: null,
  violations: 0,
  isTestActive: false,
  studentData: null,

  // --- NLP Evaluation Engine (Long Answers) ---
  NLP: {
    // Basic stop words to ignore during matching
    stopWords: new Set(['the', 'is', 'at', 'which', 'and', 'on', 'a', 'an', 'in', 'of', 'to', 'for', 'with', 'it', 'as', 'by', 'are', 'that', 'this', 'can', 'be']),
    
    tokenize(text) {
      if(!text) return [];
      return text.toLowerCase()
        .replace(/[^\w\s]/g, ' ') // remove punctuation
        .split(/\s+/)
        .filter(w => w.length > 2 && !this.stopWords.has(w));
    },

    evaluate(studentAnswer, idealAnswer, keywords, maxMarks) {
      const studentTokens = this.tokenize(studentAnswer);
      const idealTokens = this.tokenize(idealAnswer);
      
      const studentSet = new Set(studentTokens);
      const idealSet = new Set(idealTokens);

      // 1. Keyword Matching (High Weight)
      let kwFound = 0;
      let coveredKeywords = [];
      let missingKeywords = [];
      
      keywords.forEach(kw => {
        const parts = kw.toLowerCase().split(' ');
        const found = parts.every(p => studentAnswer.toLowerCase().includes(p));
        if (found) {
          kwFound++;
          coveredKeywords.push(kw);
        } else {
          missingKeywords.push(kw);
        }
      });

      const kwScore = keywords.length > 0 ? (kwFound / keywords.length) * 0.5 : 0;

      // 2. Semantic Overlap (Jaccard Index approximation)
      let overlap = 0;
      idealSet.forEach(t => {
        if (studentSet.has(t)) overlap++;
      });
      
      const overlapScore = idealSet.size > 0 ? (overlap / idealSet.size) * 0.4 : 0;

      // 3. Length Quality
      const idealLen = idealAnswer.length;
      const studLen = studentAnswer.length;
      let lengthScore = 0.1;
      if (studLen < idealLen * 0.3) lengthScore = 0.02;
      else if (studLen < idealLen * 0.6) lengthScore = 0.06;
      else if (studLen > idealLen * 1.5) lengthScore = 0.08; // slightly penalize verbosity

      // Calculate Total Accuracy (0 to 1)
      let accuracy = kwScore + overlapScore + lengthScore;
      
      // If no keywords provided, re-weight
      if (keywords.length === 0) {
          accuracy = (overlapScore * 2.2) + lengthScore;
      }

      accuracy = Math.min(1, Math.max(0, accuracy));
      
      // Generate Suggestions
      let suggestion = "Excellent answer!";
      if (accuracy < 0.5) suggestion = "Try to explain the core concepts in more detail.";
      else if (accuracy < 0.8 && missingKeywords.length > 0) suggestion = "You missed some key technical terms. Focus on those next time.";

      return {
        accuracyPercent: Math.round(accuracy * 100),
        marksAwarded: Math.round(accuracy * maxMarks * 10) / 10,
        coveredPoints: coveredKeywords,
        missingPoints: missingKeywords,
        suggestion: suggestion
      };
    }
  },

  // --- Test Flow Management ---
  initTest(testData) {
    this.activeTest = testData;
    this.currentQuestionIndex = 0;
    this.answers = {};
    this.violations = 0;
    this.isTestActive = true;
    this.startTime = Date.now();

    this.renderQuestion();
    this.startAntiCheat();
    this.startTimer();
  },

  renderQuestion() {
    if (!this.activeTest) return;

    const testArea = document.getElementById('testContentArea');
    const qCountElem = document.getElementById('qCountDisplay');
    
    if (this.activeTest.type === 'long_answer') {
        const qData = this.activeTest.questionData;
        qCountElem.textContent = `Subjective Question (${qData.marks} Marks)`;
        
        testArea.innerHTML = `
          <div class="test-q-card animate-in">
            <h3>${qData.question}</h3>
            <textarea id="longAnsInput" class="test-la-input" placeholder="Type your answer here... Minimum 50 words recommended for better AI evaluation."></textarea>
          </div>
        `;
        
        if(this.answers['q1']) {
            document.getElementById('longAnsInput').value = this.answers['q1'];
        }

        document.getElementById('btnNext').style.display = 'none';
        document.getElementById('btnPrev').style.display = 'none';
        document.getElementById('btnSubmit').style.display = 'block';

    } else if (this.activeTest.type === 'quiz') {
        const q = this.activeTest.questions[this.currentQuestionIndex];
        qCountElem.textContent = `Question ${this.currentQuestionIndex + 1} of ${this.activeTest.questions.length}`;
        
        const isAnswered = this.answers[this.currentQuestionIndex] !== undefined;
        const immediateFeedback = this.activeTest.immediateFeedback;

        let optsHtml = '';
        q.options.forEach((opt, idx) => {
            const isSelected = this.answers[this.currentQuestionIndex] === idx;
            let statusClass = '';
            
            if (isAnswered && immediateFeedback) {
                if (idx === q.correctAnswer) statusClass = 'correct-fixed';
                else if (isSelected) statusClass = 'wrong-fixed';
            } else if (isSelected) {
                statusClass = 'selected';
            }

            optsHtml += `
              <div class="test-opt-item ${statusClass} ${isAnswered && immediateFeedback ? 'disabled' : ''}" 
                   onclick="${isAnswered && immediateFeedback ? '' : `TestEngine.selectOption(${idx})`}">
                <span class="opt-alpha">${String.fromCharCode(65+idx)}</span>
                <span class="opt-text">${opt}</span>
                ${isAnswered && immediateFeedback && idx === q.correctAnswer ? '<span class="status-icon">✅</span>' : ''}
                ${isAnswered && immediateFeedback && isSelected && idx !== q.correctAnswer ? '<span class="status-icon">❌</span>' : ''}
              </div>
            `;
        });

        testArea.innerHTML = `
          <div class="test-q-card animate-in">
            <h3>${q.question}</h3>
            <div class="test-opts-grid">
              ${optsHtml}
            </div>
            ${isAnswered && immediateFeedback ? `
                <div class="feedback-msg ${this.answers[this.currentQuestionIndex] === q.correctAnswer ? 'msg-success' : 'msg-error'}">
                    ${this.answers[this.currentQuestionIndex] === q.correctAnswer ? '✨ Brilliant! That is the correct answer.' : `❌ Not quite. The correct answer was ${String.fromCharCode(65+q.correctAnswer)}.`}
                </div>
            ` : ''}
          </div>
        `;

        // Buttons
        document.getElementById('btnPrev').style.display = this.currentQuestionIndex > 0 ? 'block' : 'none';
        document.getElementById('btnNext').style.display = this.currentQuestionIndex < this.activeTest.questions.length - 1 ? 'block' : 'none';
        document.getElementById('btnSubmit').style.display = this.currentQuestionIndex === this.activeTest.questions.length - 1 ? 'block' : 'none';
    }
  },

  selectOption(idx) {
    if (!this.isTestActive) return;
    if (this.activeTest.immediateFeedback && this.answers[this.currentQuestionIndex] !== undefined) return;
    
    this.answers[this.currentQuestionIndex] = idx;
    
    // If immediate feedback is on, we re-render to show correct/wrong
    // Otherwise we just mark it selected
    this.renderQuestion();

    // Satisfying haptic-like delay if immediate mode
    if (this.activeTest.immediateFeedback) {
        // We can add a sound effect or extra animation trigger here if needed
        const q = this.activeTest.questions[this.currentQuestionIndex];
        const isCorrect = idx === q.correctAnswer;
        console.log(isCorrect ? "✨ Correct!" : "❌ Wrong choice");
    }
  },

  nextQuestion() {
    if (this.currentQuestionIndex < this.activeTest.questions.length - 1) {
        this.currentQuestionIndex++;
        this.renderQuestion();
    }
  },

  prevQuestion() {
    if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--;
        this.renderQuestion();
    }
  },

  // --- Submission & Evaluation ---
  submitTest() {
    if(!confirm("Are you sure you want to submit your test?")) return;
    
    this.isTestActive = false;
    this.stopAntiCheat();
    
    // Calculate and Sync MCQ results immediately for speed
    if (this.activeTest.type === 'quiz') {
        let score = 0;
        const total = this.activeTest.questions.length;
        this.activeTest.questions.forEach((q, i) => {
            if(this.answers[i] === q.correctAnswer) score++;
        });
        const acc = Math.round((score / total) * 100);
        
        this.saveResultToFirebase({
            accuracy: acc,
            score: score,
            maxScore: total,
            type: 'mcq'
        });

        this.showMCQResults();
        this.loadLeaderboard();
    } else {
        const studAns = document.getElementById('longAnsInput').value;
        this.answers['q1'] = studAns;
        this.showLongAnswerResults();
    }
  },

  showLongAnswerResults() {
      const qData = this.activeTest.questionData;
      const studAns = this.answers['q1'] || "";
      
      document.getElementById('testActiveView').style.display = 'none';
      const resultsView = document.getElementById('testResultsView');
      resultsView.style.display = 'block';

      if (studAns.length < 10) {
          document.getElementById('resAccuracy').textContent = "0%";
          document.getElementById('resScore').textContent = `0 / ${qData.marks}`;
          document.getElementById('resSugg').textContent = "Answer too short to evaluate.";
          return;
      }

      // 🧠 Call the AI Engine
      const result = this.NLP.evaluate(studAns, qData.idealAnswer, qData.keywords, qData.marks);

      // ☁️ Save Result to Firebase (Immediate Sync)
      this.saveResultToFirebase({
          accuracy: result.accuracyPercent,
          score: result.marksAwarded,
          maxScore: qData.marks,
          type: 'long_answer'
      });

      document.getElementById('resAccuracy').textContent = `${result.accuracyPercent}%`;
      document.getElementById('resScore').textContent = `${result.marksAwarded} / ${qData.marks}`;
      document.getElementById('resSugg').textContent = result.suggestion;

      let html = `<div class="res-details-card"><h4>Evaluation Breakdown</h4><div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">`;
      
      html += `<div class="res-good"><h5>✅ Covered Concepts</h5><ul>`;
      if(result.coveredPoints.length > 0) {
          result.coveredPoints.forEach(p => html += `<li>${p}</li>`);
      } else {
          html += `<li style="color:var(--text-muted);">None detected</li>`;
      }
      html += `</ul></div>`;

      html += `<div class="res-bad"><h5>❌ Missing Concepts</h5><ul>`;
      if(result.missingPoints.length > 0) {
          result.missingPoints.forEach(p => html += `<li>${p}</li>`);
      } else {
          html += `<li style="color:var(--text-muted);">None detected</li>`;
      }
      html += `</ul></div></div></div>`;

      document.getElementById('resDetailed').innerHTML = html;
  },

  showMCQResults() {
      document.getElementById('testActiveView').style.display = 'none';
      const resultsView = document.getElementById('testResultsView');
      resultsView.style.display = 'block';

      let score = 0;
      const total = this.activeTest.questions.length;

      this.activeTest.questions.forEach((q, i) => {
          if(this.answers[i] === q.correctAnswer) score++;
      });

      const acc = Math.round((score / total) * 100);
      document.getElementById('resAccuracy').textContent = `${acc}%`;
      document.getElementById('resScore').textContent = `${score} / ${total}`;
      
      let sugg = "Good Job!";
      if(acc < 50) sugg = "You need to revise this topic.";
      else if(acc === 100) sugg = "Perfect! Excellent understanding.";
      document.getElementById('resSugg').textContent = sugg;

      // Show breakdown
      let html = `<div class="res-details-card"><h4>Question Breakdown</h4>`;
      this.activeTest.questions.forEach((q, i) => {
          const studAns = this.answers[i];
          const isCorrect = studAns === q.correctAnswer;
          html += `
            <div class="res-q-row ${isCorrect ? 'correct' : 'wrong'}">
               <div class="res-q-text"><strong>Q${i+1}:</strong> ${q.question}</div>
               <div class="res-q-ans">
                 Your Answer: ${studAns !== undefined ? String.fromCharCode(65+studAns) : 'None'} 
                 ${isCorrect ? '✅' : '❌ (Correct: ' + String.fromCharCode(65+q.correctAnswer) + ')'}
               </div>
            </div>
          `;
      });
      html += `</div>`;
      document.getElementById('resDetailed').innerHTML = html;
  },

  saveResultToFirebase(resultSummary) {
      if (!window.db || !this.studentData || !this.activeTest) return;

      const resultRef = db.ref(`test_results/${this.activeTest.semester}/${this.activeTest.subject}/${this.activeTest.testId}/${this.studentData.roll}`);
      
      const payload = {
          student: this.studentData,
          testTitle: this.activeTest.title,
          summary: resultSummary,
          timestamp: Date.now(),
          violations: this.violations
      };

      resultRef.set(payload)
          .then(() => console.log("✅ Result synced to cloud."))
          .catch(err => {
              console.error("❌ Sync failed:", err);
              // Simple offline retry logic for slow internet
              setTimeout(() => resultRef.set(payload), 5000);
          });
  },

  loadLeaderboard() {
      const listEl = document.getElementById('resLeaderboardList');
      if (!listEl || !this.activeTest) return;

      const path = `test_results/${this.activeTest.semester}/${this.activeTest.subject}/${this.activeTest.testId}`;
      
      db.ref(path).on('value', snap => {
          if (!snap.exists()) {
              listEl.innerHTML = '<div style="text-align:center; padding:20px; color:var(--test-muted);">Be the first to rank!</div>';
              return;
          }

          const scores = [];
          snap.forEach(studSnap => {
              scores.push(studSnap.val());
          });

          // Sort by Score (Descending)
          scores.sort((a, b) => b.summary.score - a.summary.score);

          let html = '';
          scores.slice(0, 10).forEach((s, i) => {
              const isMe = s.student.roll === this.studentData?.roll;
              html += `
                <div class="leaderboard-item ${isMe ? 'me' : ''}" style="display:flex; justify-content:space-between; align-items:center; padding:12px; border-bottom:1px solid rgba(255,255,255,0.05); ${isMe ? 'background:rgba(129, 140, 248, 0.1); border-radius:8px;' : ''}">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <span style="font-weight:800; color:${i === 0 ? '#ffd700' : (i === 1 ? '#c0c0c0' : (i === 2 ? '#cd7f32' : 'var(--test-muted)'))}">${i + 1}</span>
                        <div>
                            <div style="font-weight:700; font-size:0.9rem;">${s.student.name} ${isMe ? '(You)' : ''}</div>
                            <div style="font-size:0.7rem; color:var(--test-muted);">${s.student.roll}</div>
                        </div>
                    </div>
                    <div style="font-weight:800; color:var(--test-primary);">${s.summary.score} <span style="font-size:0.6rem; color:var(--test-muted);">pts</span></div>
                </div>
              `;
          });
          listEl.innerHTML = html;
      });
  },

  // --- Anti-Cheat System ---
  startAntiCheat() {
      this.visibilityHandler = () => {
          if (document.hidden && this.isTestActive) {
              this.violations++;
              this.showCheatWarning();
          }
      };
      
      this.copyHandler = (e) => {
          if(this.isTestActive) {
              e.preventDefault();
              this.violations++;
              this.showCheatWarning("Copy/Paste is disabled during the test.");
          }
      };

      document.addEventListener('visibilitychange', this.visibilityHandler);
      document.addEventListener('copy', this.copyHandler);
      document.addEventListener('paste', this.copyHandler);
  },

  stopAntiCheat() {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      document.removeEventListener('copy', this.copyHandler);
      document.removeEventListener('paste', this.copyHandler);
  },

  showCheatWarning(msg = "Tab switching detected!") {
      const warn = document.getElementById('cheatWarning');
      document.getElementById('cheatMsg').textContent = `${msg} (Warning ${this.violations}/3)`;
      warn.classList.add('show');
      
      if(this.violations >= 3) {
          setTimeout(() => {
              alert("Test Auto-Submitted due to multiple violations.");
              this.submitTest();
          }, 1500);
      } else {
          setTimeout(() => warn.classList.remove('show'), 3000);
      }
  },

  // --- Timer ---
  startTimer() {
      // Use admin defined time limit (in minutes) converted to seconds
      const totalSeconds = this.activeTest.timeLimit ? this.activeTest.timeLimit * 60 : (this.activeTest.type === 'quiz' ? this.activeTest.questions.length * 60 : 600);
      let timeLimit = totalSeconds;
      const timerEl = document.getElementById('testTimer');
      const progressEl = document.getElementById('timerProgressBar');
      
      this.timerInterval = setInterval(() => {
          if(!this.isTestActive) {
              clearInterval(this.timerInterval);
              return;
          }
          
          timeLimit--;
          const m = Math.floor(timeLimit / 60);
          const s = timeLimit % 60;
          timerEl.textContent = `${m}:${s < 10 ? '0' : ''}${s}`;

          // Update Progress Bar
          if (progressEl) {
              const percent = (timeLimit / totalSeconds) * 100;
              progressEl.style.width = `${percent}%`;
              
              // Color change for urgency
              if (percent < 20) {
                  progressEl.style.background = 'var(--test-red)';
                  timerEl.parentElement.style.background = 'rgba(239, 68, 68, 0.2)';
              } else if (percent < 50) {
                  progressEl.style.background = 'var(--test-yellow)';
              }
          }

          if(timeLimit <= 0) {
              clearInterval(this.timerInterval);
              alert("Time's up! Auto-submitting test.");
              this.submitTest();
          }
      }, 1000);
  }
};
