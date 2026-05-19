// ================================================
// BCAverse AI - Intelligent Chat System
// Smart Responses, Memory, Context Understanding
// ================================================

// ============= AI STATE MANAGEMENT ============= 
const AIState = {
  messages: [],
  memory: [],
  contextHistory: [],
  userPreferences: {
    mode: 'intermediate',
    responseLength: 'medium',
    codeLanguage: 'javascript',
  },
  isLoading: false,
};

// ============= AI KNOWLEDGE BASE ============= 
const AIKnowledge = {
  bcaSubjects: {
    'Mathematics': ['Discrete Math', 'Numerical Methods', 'Linear Algebra'],
    'Programming': ['C', 'C++', 'Java', 'Python', 'JavaScript'],
    'DataStructures': ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'Hash Tables'],
    'Databases': ['RDBMS', 'SQL', 'MongoDB', 'Database Design'],
    'WebDev': ['HTML', 'CSS', 'JavaScript', 'APIs', 'Frontend', 'Backend'],
    'Networking': ['OSI Model', 'TCP/IP', 'DNS', 'HTTP', 'Socket Programming'],
    'OS': ['Processes', 'Threads', 'Scheduling', 'Memory Management'],
    'SoftwareEng': ['Design Patterns', 'SDLC', 'Testing', 'Documentation'],
  },

  responseTemplates: {
    explain: `I'll break this down for you:

1. **Core Concept**: 
   - [Explanation here]

2. **Key Points**:
   - Point 1
   - Point 2
   - Point 3

3. **Example**:
   [Code or real-world example]

4. **Real-World Application**:
   - Where this is used in practice

5. **Common Mistakes**:
   - ❌ Mistake 1
   - ✅ Correct approach

Want me to dive deeper into any part?`,

    code: `Here's a solution for you:

\`\`\`[language]
[code here]
\`\`\`

**Explanation**:
- Line 1-3: [What this does]
- Line 4-6: [What this does]
- Line 7-9: [What this does]

**Time Complexity**: O(n)
**Space Complexity**: O(1)

**Key Points**:
- Why this approach works
- Edge cases to consider
- Optimization opportunities`,

    debug: `Let me help you debug this:

**The Issue**:
- [What's going wrong]

**Why It's Happening**:
- [Root cause analysis]

**The Fix**:
\`\`\`[language]
[corrected code]
\`\`\`

**How It Works Now**:
- [Explanation of the fix]

**Prevention Tips**:
- How to avoid this in the future
- Best practices to follow`,

    notes: `# Topic Name

## Overview
- Quick summary of the topic

## Key Concepts
1. **Concept 1**
   - Definition
   - Importance
   - Use cases

2. **Concept 2**
   - Definition
   - Importance
   - Use cases

## Formula & Syntax
\`\`\`[language]
code here
\`\`\`

## Important Points
- ⭐ Critical concept
- ⭐ Must know
- ⭐ Common in exams

## Example Problems
1. Problem 1
   - Solution steps

2. Problem 2
   - Solution steps

## Resources
- Links to tutorials
- Recommended readings
- Practice problems`,
  },
};

// ============= INITIALIZE AI INTERFACE ============= 
function initAIInterface() {
  try {
    loadChatHistory();
    setupEventListeners();
    createAIParticles();
    setupCodeRain();
    console.log('%c✨ BCAverse AI Initialized!', 'color: #00f0ff; font-weight: bold;');
  } catch (e) {
    console.warn('AI Initialization:', e.message);
  }
}

// ============= EVENT LISTENERS ============= 
function setupEventListeners() {
  const input = document.getElementById('aiInput');
  
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  input.addEventListener('input', (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  });
}

// ============= SEND MESSAGE ============= 
async function sendMessage() {
  const input = document.getElementById('aiInput');
  const message = input.value.trim();

  if (!message) return;

  // Add user message
  addMessage(message, 'user');
  input.value = '';
  input.style.height = 'auto';

  // Show typing indicator
  showTypingIndicator();

  // Get AI response
  try {
    const response = await getAIResponse(message);
    removeTypingIndicator();
    addMessage(response, 'assistant');
    saveChatHistory();
  } catch (error) {
    removeTypingIndicator();
    const fallback = getSmartFallback(message);
    addMessage(fallback, 'assistant');
    console.error('AI Error:', error);
  }
}

// ============= GET AI RESPONSE ============= 
async function getAIResponse(userMessage) {
  const mode = AIState.userPreferences.mode;
  const context = extractContext(userMessage);

  // Store in memory
  AIState.memory.push({
    message: userMessage,
    context: context,
    timestamp: new Date(),
  });

  // Limit memory
  if (AIState.memory.length > 20) {
    AIState.memory.shift();
  }

  // Try OpenAI first, fallback to local responses
  try {
    return await callOpenAI(userMessage, context, mode);
  } catch (e) {
    console.warn('OpenAI unavailable, using local responses');
    return generateSmartResponse(userMessage, context, mode);
  }
}

// ============= OPENAI API CALL ============= 
async function callOpenAI(message, context, mode) {
  // Check if API key exists
  const apiKey = localStorage.getItem('OPENAI_API_KEY');
  if (!apiKey) {
    return generateSmartResponse(message, context, mode);
  }

  const systemPrompt = buildSystemPrompt(mode, context);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          ...AIState.messages.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.text,
          })),
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: getMaxTokens(),
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI Error:', error);
    return generateSmartResponse(message, context, mode);
  }
}

// ============= BUILD SYSTEM PROMPT ============= 
function buildSystemPrompt(mode, context) {
  const tones = {
    beginner: 'Explain in beginner-friendly terms with analogies. Use simple language.',
    intermediate: 'Provide balanced explanations with technical depth. Include code examples.',
    advanced: 'Go deep with technical details. Assume solid programming knowledge.',
    expert: 'Discuss advanced concepts, optimizations, and edge cases. Be thorough.',
  };

  return `You are BCAverse AI, an advanced intelligent learning companion specialized for BCA (Bachelor of Computer Applications) students and developers.

Your personality:
- Friendly, enthusiastic, and professional
- Patient and encouraging
- Clear and concise
- Your tone: ${tones[mode] || tones.intermediate}

Your expertise:
- All BCA subjects (DSA, DBMS, Web Dev, Networking, OS, etc.)
- Multiple programming languages
- Career guidance and project help
- Academic problem-solving
- Code debugging and optimization

Current context: ${context.topic ? `Topic: ${context.topic}` : 'General computer science'}

When helping with code:
- Provide clean, well-commented code
- Explain the logic step-by-step
- Include time/space complexity
- Suggest optimizations when available

Be encouraging and adaptive to the user's learning style.`;
}

// ============= SMART LOCAL RESPONSE GENERATION ============= 
function generateSmartResponse(userMessage, context, mode) {
  const message = userMessage.toLowerCase();

  // Topic detection
  if (message.includes('hello') || message.includes('hi')) {
    return `Hey there! 👋 Welcome to BCAverse AI! 

I'm your intelligent learning companion, specialized in helping BCA students with:
- 💻 Programming & Coding
- 📚 BCA Subjects & Concepts
- 🐛 Debugging & Problem-Solving
- 📝 Notes & Study Materials
- 🚀 Career Guidance

What would you like help with today?`;
  }

  if (message.includes('coding') || message.includes('code') || message.includes('program')) {
    return generateCodeResponse(message, mode);
  }

  if (message.includes('explain') || message.includes('what is') || message.includes('how')) {
    return generateExplanation(message, mode);
  }

  if (message.includes('debug') || message.includes('error') || message.includes('bug')) {
    return generateDebugHelp(message, mode);
  }

  if (message.includes('note') || message.includes('summary') || message.includes('study')) {
    return generateNotes(message, mode);
  }

  if (message.includes('career') || message.includes('job') || message.includes('interview')) {
    return generateCareerGuidance(message, mode);
  }

  if (message.includes('project') || message.includes('assignment')) {
    return generateProjectHelp(message, mode);
  }

  // Default response
  return `I understood you're asking about: "${userMessage}"

I can help you with:
1. **Coding Problems** - Write, debug, and optimize code
2. **Concept Explanations** - Deep dive into BCA topics
3. **Study Notes** - Generate summaries and notes
4. **Career Guidance** - Resume, interviews, roadmaps
5. **Project Help** - Ideas, structure, implementation

Please provide more details, and I'll give you a targeted response! 🎯`;
}

// ============= CONTEXT EXTRACTION ============= 
function extractContext(message) {
  const subjects = Object.keys(AIKnowledge.bcaSubjects).join('|').toLowerCase();
  const topicMatch = message.match(new RegExp(subjects, 'i'));

  return {
    topic: topicMatch ? topicMatch[0] : null,
    hasCode: message.includes('```') || message.includes('code:'),
    isQuestion: message.includes('?'),
    sentiment: message.includes('help') || message.includes('please') ? 'polite' : 'neutral',
  };
}

// ============= SPECIALIZED RESPONSE GENERATORS ============= 
function generateCodeResponse(message, mode) {
  const language = AIState.userPreferences.codeLanguage;
  
  return `Let me help you with ${language} coding! 

**What specific coding help do you need?**
- 💡 Solve a problem
- 🐛 Debug existing code
- 📖 Learn a concept
- ⚡ Optimize performance
- 🎯 Project implementation

Share your code or describe what you want to build, and I'll provide:
1. Clean, well-organized code
2. Step-by-step explanation
3. Time & space complexity analysis
4. Best practices & optimization tips

Go ahead, paste your code or describe your problem! 👨‍💻`;
}

function generateExplanation(message, mode) {
  const topics = '';
  
  return `I'd love to explain that for you! 📚

To give you the best explanation, please tell me:
1. **What's the topic?** (e.g., Linked Lists, SQL Joins, Recursion)
2. **Current level?** (Beginner/Intermediate/Advanced)
3. **Any specific angle?** (e.g., Time complexity, comparison with alternatives)

I'll provide:
- ✅ Clear concept explanation
- 📋 Key points & formulas
- 💡 Real-world examples
- 🎯 Common pitfalls to avoid

What would you like me to explain in detail? 🤔`;
}

function generateDebugHelp(message, mode) {
  return `I can definitely help you fix that bug! 🐛

**To debug effectively, please share:**
1. **The Error Message** - What error are you getting?
2. **Your Code** - Paste the relevant code snippet
3. **Expected Output** - What should happen?
4. **Actual Output** - What's actually happening?

**I'll help you:**
- 🎯 Identify the root cause
- ✅ Provide the fix
- 📖 Explain what went wrong
- 💪 Prevent similar bugs

Paste your code and error, and let's squash that bug! 🔧`;
}

function generateNotes(message, mode) {
  return `Great! I can generate study notes for you! 📝

**What topic would you like notes on?**

Some popular subjects:
- Data Structures (Arrays, Linked Lists, Trees, Graphs)
- Database Management (SQL, Normalization, Queries)
- Web Development (HTML, CSS, JavaScript, APIs)
- Operating Systems (Processes, Memory, Scheduling)
- Networking (TCP/IP, DNS, HTTP, Protocols)
- Programming (OOP, Design Patterns, Best Practices)

Just give me the topic, and I'll create comprehensive notes with:
- 📌 Key concepts
- 🎯 Important formulas
- 💻 Code examples
- 🔗 Real-world applications
- ⭐ Exam-important points

What would you like notes on? 📚`;
}

function generateCareerGuidance(message, mode) {
  return `Excellent! I can help with your career path! 🚀

**I can assist with:**
- 📋 Resume building & optimization
- 🎤 Interview preparation
- 🛣️ Career roadmaps
- 💼 Job search strategies
- 🎯 Skill development plans
- 📚 Learning resources

**Tell me about:**
1. Your current experience level
2. Interested roles (Frontend, Backend, Full-Stack, etc.)
3. Your goals & timeline
4. Any specific concerns

I'll provide:
- Personalized recommendations
- Step-by-step action plans
- Resource suggestions
- Timeline expectations

Let's build your tech career! 💪`;
}

function generateProjectHelp(message, mode) {
  return `Perfect! I can help you with your project! 🎯

**Need help with:**
- 💡 Project ideas & concepts
- 🏗️ Architecture & design
- 💻 Code implementation
- 🐛 Troubleshooting issues
- 🎨 UI/UX suggestions
- 📚 Documentation

**Tell me:**
1. Project type (Web app, Desktop, Data Analysis, etc.)
2. Technologies you're using
3. Current progress/status
4. Specific challenge you're facing

I'll provide:
- Implementation guidance
- Code examples
- Best practices
- Performance tips
- Complete solutions if needed

What's your project about? 🚀`;
}

// ============= SMART FALLBACK RESPONSE ============= 
function getSmartFallback(message) {
  const keywords = {
    bug: '🐛 Bug Fixing Help',
    code: '💻 Code Assistance',
    explain: '📚 Concept Explanation',
    learn: '🎓 Learning Path',
    help: '🤝 General Help',
    project: '🎯 Project Guidance',
  };

  let response = `I understand you're asking about: "${message}"

I'm here to help with BCA-related topics! Try asking me about:
- **Coding Problems**: "Help me solve this array problem"
- **Concepts**: "Explain binary search trees"
- **Debugging**: "Why is my code throwing an error?"
- **Notes**: "Generate notes on SQL"
- **Career**: "Best path for web development"

Be as specific as possible for better help! 🎯`;

  return response;
}

// ============= QUICK ACTIONS ============= 
function quickAction(type) {
  const actions = {
    explain: `Here are some topics I can explain:
- Linked Lists & Arrays
- Binary Trees & Graphs
- SQL Queries & Joins
- Operating System Concepts
- Web Development Basics
- OOPS & Design Patterns

Which one interests you?`,

    code: `What coding help do you need?
- Solve a specific problem
- Debug your code
- Optimize an algorithm
- Learn a new concept
- Implement a design pattern

Paste your code or describe your challenge!`,

    notes: `What subject would you like notes on?
- Data Structures
- Database Management
- Web Technologies
- Networking Protocols
- Algorithm Analysis
- Software Engineering

Tell me the topic!`,

    career: `Career guidance options:
- Resume building
- Interview preparation
- Skill roadmap
- Job search strategy
- Freelancing guide
- Startup ideas

What specific help do you need?`,
  };

  const message = actions[type] || 'How can I help?';
  document.getElementById('aiInput').value = message;
  document.getElementById('aiInput').focus();
}

// ============= MESSAGE DISPLAY ============= 
function addMessage(text, type) {
  const messagesDiv = document.getElementById('aiMessages');
  const messageEl = document.createElement('div');
  messageEl.className = `ai-message ${type}`;
  messageEl.style.animation = 'fadeInUp 0.4s ease-out backwards';

  const avatar = type === 'user' ? '👤' : '🤖';
  const content = highlightCode(text);

  messageEl.innerHTML = `
    <div class="ai-message-avatar">${avatar}</div>
    <div class="ai-message-content">${content}</div>
  `;

  messagesDiv.appendChild(messageEl);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  AIState.messages.push({ type, text, timestamp: new Date() });
}

// ============= CODE HIGHLIGHTING ============= 
function highlightCode(text) {
  let html = text;

  // Find code blocks
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  html = html.replace(codeBlockRegex, (match, language, code) => {
    const lang = language || 'javascript';
    let highlighted = code.trim();

    try {
      highlighted = hljs.highlight(code.trim(), { language: lang, ignoreIllegals: true }).value;
    } catch (e) {
      // Fallback if language not supported
    }

    return `<div class="ai-code-block">
      <div class="code-header">
        <span class="code-language">${lang}</span>
        <button class="code-copy-btn" onclick="copyCode(this)">📋 Copy</button>
      </div>
      <div class="code-content"><code>${highlighted}</code></div>
    </div>`;
  });

  // Convert markdown Bold to HTML
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Convert markdown Italic to HTML
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Convert markdown lists
  html = html.replace(/^- (.*?)$/gm, '<li style="margin-left: 20px;">$1</li>');

  // Convert line breaks
  html = html.replace(/\n/g, '<br>');

  return html;
}

// ============= COPY CODE ============= 
function copyCode(button) {
  const codeEl = button.closest('.ai-code-block').querySelector('code');
  const text = codeEl.innerText;

  navigator.clipboard.writeText(text).then(() => {
    button.classList.add('copied');
    button.textContent = '✅ Copied!';

    setTimeout(() => {
      button.classList.remove('copied');
      button.textContent = '📋 Copy';
    }, 2000);
  });
}

// ============= TYPING INDICATOR ============= 
function showTypingIndicator() {
  const messagesDiv = document.getElementById('aiMessages');
  const typing = document.createElement('div');
  typing.className = 'ai-message assistant';
  typing.id = 'typingIndicator';
  typing.innerHTML = `
    <div class="ai-message-avatar">🤖</div>
    <div class="ai-message-content ai-typing">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;

  messagesDiv.appendChild(typing);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function removeTypingIndicator() {
  const typing = document.getElementById('typingIndicator');
  if (typing) typing.remove();
}

// ============= CHAT HISTORY ============= 
function saveChatHistory() {
  const history = {
    messages: AIState.messages,
    timestamp: new Date(),
    preferences: AIState.userPreferences,
  };

  localStorage.setItem('bcaverseAIHistory', JSON.stringify(history));
}

function loadChatHistory() {
  const saved = localStorage.getItem('bcaverseAIHistory');
  if (saved) {
    const history = JSON.parse(saved);
    AIState.messages = history.messages || [];
    AIState.userPreferences = history.preferences || AIState.userPreferences;
  }
}

function clearHistory() {
  if (confirm('Clear all chat history? This cannot be undone.')) {
    AIState.messages = [];
    AIState.memory = [];
    document.getElementById('aiMessages').innerHTML = getWelcomeHTML();
    localStorage.removeItem('bcaverseAIHistory');
    Toast.success('Chat history cleared!');
  }
}

// ============= SETTINGS ============= 
function setAIMode(mode) {
  AIState.userPreferences.mode = mode;
  saveChatHistory();
  Toast.success(`Learning mode changed to: ${mode}`);
}

function setResponseLength(length) {
  AIState.userPreferences.responseLength = length;
  saveChatHistory();
  Toast.success(`Response length set to: ${length}`);
}

function setCodeLanguage(language) {
  AIState.userPreferences.codeLanguage = language;
  saveChatHistory();
  Toast.success(`Code language set to: ${language}`);
}

function exportChat() {
  const data = {
    chat: AIState.messages,
    exported: new Date(),
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bcaverse-chat-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  Toast.success('Chat exported!');
}

// ============= VISUAL EFFECTS ============= 
function createAIParticles() {
  const container = document.getElementById('aiParticles');
  if (!container) return;

  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: absolute;
      width: 2px;
      height: 2px;
      background: #00f0ff;
      border-radius: 50%;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      opacity: ${Math.random() * 0.5};
      box-shadow: 0 0 10px rgba(0, 240, 255, 0.6);
      animation: float ${5 + Math.random() * 10}s ${Math.random() * 2}s infinite ease-in-out;
    `;
    container.appendChild(particle);
  }
}

function setupCodeRain() {
  const canvas = document.getElementById('aiCodeRain');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const chars = ['0', '1', '>', '<', '{', '}', '[', ']', '/', '\\'];
  let drops = [];

  for (let i = 0; i < 30; i++) {
    drops.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: Math.random() * 2 + 1,
      char: chars[Math.floor(Math.random() * chars.length)],
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 240, 255, 0.3)';
    ctx.font = '14px monospace';

    drops.forEach((drop) => {
      ctx.fillText(drop.char, drop.x, drop.y);
      drop.y += drop.speed;

      if (drop.y > canvas.height) {
        drop.y = -20;
        drop.char = chars[Math.floor(Math.random() * chars.length)];
      }
    });

    requestAnimationFrame(animate);
  }

  animate();
}

// ============= HELPER FUNCTIONS ============= 
function getMaxTokens() {
  const lengths = { short: 500, medium: 1000, long: 2000 };
  return lengths[AIState.userPreferences.responseLength] || 1000;
}

function toggleSidebar() {
  const sidebar = document.getElementById('aiSidebar');
  sidebar.style.display = sidebar.style.display === 'none' ? 'flex' : 'none';
}

function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

function getWelcomeHTML() {
  return `<div class="ai-welcome">
    <div class="ai-avatar-large">🤖</div>
    <h1 class="ai-welcome-title">Welcome to <span class="gradient-ai">BCAverse AI</span></h1>
    <p class="ai-welcome-subtitle">Your Intelligent Learning Companion</p>
  </div>`;
}

// ============= INITIALIZATION ============= 
document.addEventListener('DOMContentLoaded', initAIInterface);
