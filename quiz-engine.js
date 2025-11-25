/**
 * AI Readiness Quiz Engine
 * Handles quiz logic, navigation, scoring, and results display
 */

class QuizEngine {
  constructor() {
    this.config = null;
    this.currentQuestionIndex = 0;
    this.answers = {};
    this.init();
  }

  async init() {
    try {
      await this.loadConfig();
      this.setupEventListeners();
      this.renderQuestion();
    } catch (error) {
      console.error('Failed to initialize quiz:', error);
      this.showError('Failed to load quiz. Please refresh the page.');
    }
  }

  async loadConfig() {
    const response = await fetch('/ai-readiness-quiz-config.json');
    if (!response.ok) {
      throw new Error('Failed to load quiz configuration');
    }
    this.config = await response.json();

    // Update total questions counter
    const totalQuestionsEl = document.getElementById('total-questions');
    if (totalQuestionsEl) {
      totalQuestionsEl.textContent = this.config.questions.length;
    }
  }

  setupEventListeners() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.previousQuestion());
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextQuestion());
    }
  }

  renderQuestion() {
    const question = this.config.questions[this.currentQuestionIndex];
    const quizContent = document.getElementById('quiz-content');

    if (!quizContent) return;

    // Handle grid-type questions (sector selection)
    if (question.type === 'grid') {
      return this.renderGridQuestion(question);
    }

    // Get category info
    const category = this.config.categories[question.category];

    // Build options HTML
    const optionsHTML = question.options.map((option, index) => {
      const isSelected = this.answers[question.id] === index;
      return `
        <div class="option ${isSelected ? 'selected' : ''}" data-option-index="${index}">
          ${option.text}
        </div>
      `;
    }).join('');

    // Render question
    quizContent.innerHTML = `
      <div class="question">
        <div class="question-category">${category.name}</div>
        <h2 class="question-text">${question.text}</h2>
        <div class="options">
          ${optionsHTML}
        </div>
      </div>
    `;

    // Add click handlers to options
    const options = quizContent.querySelectorAll('.option');
    options.forEach((option, index) => {
      option.addEventListener('click', () => this.selectOption(question.id, index));
    });

    // Update progress
    this.updateProgress();
    this.updateNavigationButtons();
  }

  renderGridQuestion(question) {
    const quizContent = document.getElementById('quiz-content');

    // Get the appropriate data source based on options field
    const dataSource = question.options === 'sectors' ? this.config.sectors :
                       question.options === 'regions' ? this.config.regions :
                       this.config.sectors;

    const gridHTML = Object.entries(dataSource).map(([key, item]) => {
      const isSelected = this.answers[question.id] === key;
      const icon = item.icon || '';
      const iconHTML = icon ? `<div class="sector-icon">${icon}</div>` : '';
      return `
        <div class="sector-card ${isSelected ? 'selected' : ''}" data-sector="${key}">
          ${iconHTML}
          <div class="sector-name">${item.name}</div>
          <div class="sector-desc">${item.description}</div>
        </div>
      `;
    }).join('');

    quizContent.innerHTML = `
      <div class="question">
        <h2 class="question-text">${question.text}</h2>
        <p class="question-description">${question.description}</p>
        <div class="sector-grid">
          ${gridHTML}
        </div>
      </div>
    `;

    // Add click handlers
    quizContent.querySelectorAll('.sector-card').forEach(card => {
      card.addEventListener('click', () => {
        this.selectSector(question.id, card.dataset.sector);
      });
    });

    this.updateProgress();
    this.updateNavigationButtons();
  }

  selectSector(questionId, sectorKey) {
    this.answers[questionId] = sectorKey;
    document.querySelectorAll('.sector-card').forEach(card => {
      card.classList.toggle('selected', card.dataset.sector === sectorKey);
    });
    this.updateNavigationButtons();
  }

  selectOption(questionId, optionIndex) {
    this.answers[questionId] = optionIndex;

    // Update UI
    const options = document.querySelectorAll('.option');
    options.forEach((option, index) => {
      if (index === optionIndex) {
        option.classList.add('selected');
      } else {
        option.classList.remove('selected');
      }
    });

    // Enable next button
    this.updateNavigationButtons();
  }

  updateProgress() {
    const progressFill = document.getElementById('progress-fill');
    const currentQuestionEl = document.getElementById('current-question');

    if (progressFill) {
      const progress = ((this.currentQuestionIndex + 1) / this.config.questions.length) * 100;
      progressFill.style.width = `${progress}%`;
    }

    if (currentQuestionEl) {
      currentQuestionEl.textContent = this.currentQuestionIndex + 1;
    }
  }

  updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const currentQuestion = this.config.questions[this.currentQuestionIndex];

    // Show/hide previous button
    if (prevBtn) {
      prevBtn.style.display = this.currentQuestionIndex > 0 ? 'block' : 'none';
    }

    // Update next button state and text
    if (nextBtn) {
      const hasAnswer = this.answers[currentQuestion.id] !== undefined;
      nextBtn.disabled = !hasAnswer;

      const isLastQuestion = this.currentQuestionIndex === this.config.questions.length - 1;
      nextBtn.textContent = isLastQuestion ? 'See Results' : 'Next';
    }
  }

  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.renderQuestion();
    }
  }

  nextQuestion() {
    const currentQuestion = this.config.questions[this.currentQuestionIndex];

    // Ensure question is answered
    if (this.answers[currentQuestion.id] === undefined) {
      return;
    }

    // Check if this is the last question
    if (this.currentQuestionIndex === this.config.questions.length - 1) {
      this.showResults();
    } else {
      this.currentQuestionIndex++;
      this.renderQuestion();
    }
  }

  calculateScore() {
    let totalScore = 0;
    const categoryScores = {};

    // Initialize category scores (excluding sector)
    Object.keys(this.config.categories).forEach(cat => {
      if (cat !== 'sector') {
        categoryScores[cat] = { score: 0, max: 0 };
      }
    });

    // Calculate scores - exclude non-scoring questions
    let scoringQuestionCount = 0;
    this.config.questions.forEach(question => {
      const answer = this.answers[question.id];

      // Skip grid questions and questions without scoring
      if (question.type === 'grid' || !question.options || !question.options[0] || question.options[0].score === undefined) {
        return;
      }

      if (answer !== undefined && typeof answer === 'number') {
        const score = question.options[answer].score;
        totalScore += score;
        scoringQuestionCount++;

        if (categoryScores[question.category]) {
          categoryScores[question.category].score += score;
          categoryScores[question.category].max += 3; // Max score per question is 3
        }
      }
    });

    // Find score band
    const scoreBand = this.config.score_bands.find(band =>
      totalScore >= band.min && totalScore <= band.max
    );

    return {
      total: totalScore,
      max: scoringQuestionCount * 3,
      categories: categoryScores,
      band: scoreBand
    };
  }

  showResults() {
    const quizContent = document.getElementById('quiz-content');
    const quizNav = document.querySelector('.quiz-navigation');
    const quizProgress = document.querySelector('.quiz-progress');
    const quizResults = document.getElementById('quiz-results');

    if (quizContent) quizContent.style.display = 'none';
    if (quizNav) quizNav.style.display = 'none';
    if (quizProgress) quizProgress.style.display = 'none';

    const scoreData = this.calculateScore();

    if (quizResults) {
      quizResults.style.display = 'block';
      quizResults.innerHTML = this.buildResultsHTML(scoreData);

      // Store results in sessionStorage for report page
      sessionStorage.setItem('quizResults', JSON.stringify({
        score: scoreData,
        answers: this.answers,
        timestamp: new Date().toISOString()
      }));

      // Animate category bars
      setTimeout(() => {
        document.querySelectorAll('.category-fill').forEach(fill => {
          const width = fill.getAttribute('data-width');
          fill.style.width = width;
        });
      }, 100);
    }
  }

  buildResultsHTML(scoreData) {
    const { total, max, categories, band } = scoreData;
    const percentage = Math.round((total / max) * 100);

    // Build category breakdown
    const categoryHTML = Object.entries(categories).map(([catKey, catData]) => {
      const catInfo = this.config.categories[catKey];
      const catPercentage = catData.max > 0 ? Math.round((catData.score / catData.max) * 100) : 0;

      return `
        <div class="category-item">
          <div class="category-header">
            <span class="category-name">${catInfo.name}</span>
            <span class="category-score">${catData.score}/${catData.max}</span>
          </div>
          <div class="category-bar">
            <div class="category-fill" data-width="${catPercentage}%" style="width: 0%;"></div>
          </div>
          <div class="category-description">${catInfo.description}</div>
        </div>
      `;
    }).join('');

    // Build recommendations
    const recommendationsHTML = band.recommendations.map(rec =>
      `<li>${rec}</li>`
    ).join('');

    return `
      <div class="results-hero">
        <div class="score-badge">${total}/${max}</div>
        <div class="score-level">${band.level} Level</div>
        <div class="score-summary">${band.summary}</div>
      </div>

      <div class="category-breakdown">
        <h3>Your Readiness Profile</h3>
        ${categoryHTML}
      </div>

      <div class="recommendations">
        <h3>Recommendations</h3>
        <ul>
          ${recommendationsHTML}
        </ul>
        <div class="next-steps">
          <h4>Next Steps</h4>
          <p>${band.next_steps}</p>
        </div>
      </div>

      <div class="results-actions">
        <a href="/ai-readiness/report" class="btn-primary">View Detailed Report</a>
        <a href="/aiforbusiness" class="btn-secondary">Explore Workshops</a>
        <button class="btn-secondary" onclick="location.reload()">Retake Quiz</button>
      </div>
    `;
  }

  showError(message) {
    const quizContent = document.getElementById('quiz-content');
    if (quizContent) {
      quizContent.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: #E07A5F;">
          <h3>Error</h3>
          <p>${message}</p>
        </div>
      `;
    }
  }
}

// Initialize quiz when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new QuizEngine());
} else {
  new QuizEngine();
}
