/**
 * TRL Quiz Engine
 * Decision-tree flow for Technology Readiness Level identification.
 */

(() => {
  const questions = {
    q1: {
      title: 'Is the technology currently used in live operations?',
      description: 'Consider whether this exact solution is already delivering outcomes in its intended operational environment.',
      options: [
        { label: 'Yes, in routine live use', next: 'r_9' },
        { label: 'Not yet', next: 'q2' }
      ]
    },
    q2: {
      title: 'Is there a complete, integrated system that has passed qualification tests?',
      description: 'Qualification includes formal verification against performance and safety requirements.',
      options: [
        { label: 'Yes, complete and qualified', next: 'r_8' },
        { label: 'Partially complete or still maturing', next: 'q3' }
      ]
    },
    q3: {
      title: 'Has a prototype been demonstrated in an operational setting?',
      description: 'Operational setting means realistic users, constraints, and workflows.',
      options: [
        { label: 'Yes, demonstrated in operations', next: 'r_7' },
        { label: 'No, only in controlled or limited environments', next: 'q3b' }
      ]
    },
    q3b: {
      title: 'Has a prototype been demonstrated in a relevant (but not full operational) environment?',
      description: 'Relevant environments can include pilot lines, testbeds, and representative field conditions.',
      options: [
        { label: 'Yes, demonstrated in relevant environment', next: 'r_6' },
        { label: 'No, still in earlier validation', next: 'q4' }
      ]
    },
    q4: {
      title: 'Has the technology been validated in a relevant environment with representative components?',
      description: 'Validation typically includes integrated components and measured performance evidence.',
      options: [
        { label: 'Yes', next: 'r_5' },
        { label: 'No', next: 'q5' }
      ]
    },
    q5: {
      title: 'Do you have experimental proof-of-concept results?',
      description: 'Proof-of-concept means data showing that key technical assumptions hold under test.',
      options: [
        { label: 'Yes, with test evidence', next: 'r_3' },
        { label: 'No, still mostly conceptual', next: 'q4b' }
      ]
    },
    q4b: {
      title: 'Has the concept been formally defined with identified principles and use case?',
      description: 'If not, the work is likely pre-formulation and at the earliest maturity stage.',
      options: [
        { label: 'Concept and principles are identified', next: 'r_3' },
        { label: 'Not yet formally defined', next: 'r_1' }
      ]
    }
  };

  const results = {
    r_na: {
      level: 'N/A',
      heading: 'Insufficient evidence to place a TRL confidently',
      summary: 'Capture clearer technical evidence before assigning a readiness level.',
      nextSteps: [
        'Document what has and has not been tested.',
        'Define intended operational context and success criteria.',
        'Run a structured review with engineering and delivery stakeholders.'
      ]
    },
    r_9: {
      level: 'TRL 9',
      heading: 'Actual system proven in operational use',
      summary: 'Your technology appears to be fully mature and operating in real-world conditions.',
      nextSteps: [
        'Track reliability and performance over time.',
        'Capture lessons learned for scaling or transfer.',
        'Use operational evidence to support assurance and procurement activities.'
      ]
    },
    r_8: {
      level: 'TRL 8',
      heading: 'System complete and qualified',
      summary: 'The system is complete and qualification evidence is in place, but full operational use may still be limited.',
      nextSteps: [
        'Plan controlled operational rollout.',
        'Validate handover and support arrangements.',
        'Close any remaining acceptance actions before full deployment.'
      ]
    },
    r_7: {
      level: 'TRL 7',
      heading: 'Prototype demonstrated in operational setting',
      summary: 'You have strong real-context evidence, with work remaining before full qualification and deployment.',
      nextSteps: [
        'Harden the prototype into a production-ready system.',
        'Complete qualification and compliance testing.',
        'Prepare detailed deployment and risk controls.'
      ]
    },
    r_6: {
      level: 'TRL 6',
      heading: 'Prototype demonstrated in relevant environment',
      summary: 'The concept has moved beyond lab validation and shown capability in representative conditions.',
      nextSteps: [
        'Expand trials into operationally realistic conditions.',
        'Address integration constraints and edge cases.',
        'Build evidence package for operational demonstration.'
      ]
    },
    r_5: {
      level: 'TRL 5',
      heading: 'Technology validated in relevant environment',
      summary: 'Validation evidence exists, but demonstration maturity should increase before operational pilots.',
      nextSteps: [
        'Increase system integration depth.',
        'Define operational pilot success metrics.',
        'Develop transition plan toward demonstrator readiness.'
      ]
    },
    r_3: {
      level: 'TRL 3',
      heading: 'Experimental proof of concept stage',
      summary: 'You have early evidence for feasibility, but significant validation and engineering remain.',
      nextSteps: [
        'Strengthen experimental protocol and repeatability.',
        'Prioritize key technical risks and assumptions.',
        'Design pathway into lab and relevant-environment validation.'
      ]
    },
    r_1: {
      level: 'TRL 1',
      heading: 'Basic principles stage',
      summary: 'Work is at the foundational discovery phase with limited formal concept definition.',
      nextSteps: [
        'Document core scientific or technical principles.',
        'Frame potential use cases and constraints.',
        'Define first experiments to establish feasibility evidence.'
      ]
    }
  };

  const totalQuestions = 5;
  let currentId = 'q1';
  let history = [];

  const contentEl = document.getElementById('trl-quiz-content');
  const progressFillEl = document.getElementById('progress-fill');
  const progressStepEl = document.getElementById('progress-step');

  if (!contentEl) return;

  function escapeHtml(text) {
    return String(text)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function renderQuestion(questionId) {
    const question = questions[questionId];

    if (!question) {
      renderResult('r_na');
      return;
    }

    currentId = questionId;

    const optionButtons = question.options
      .map((option) => (
        `<button type="button" class="trl-option" data-next-id="${escapeHtml(option.next)}">${escapeHtml(option.label)}</button>`
      ))
      .join('');

    contentEl.innerHTML = `
      <article class="trl-question-card">
        <h2>${escapeHtml(question.title)}</h2>
        <p class="trl-question-description">${escapeHtml(question.description)}</p>
        <div class="trl-options">${optionButtons}</div>
        <div class="trl-actions">
          <button type="button" class="btn-secondary" data-action="back" ${history.length === 0 ? 'disabled' : ''}>Back</button>
          <button type="button" class="btn-secondary" data-action="restart">Restart</button>
        </div>
      </article>
    `;

    contentEl.querySelectorAll('[data-next-id]').forEach((button) => {
      button.addEventListener('click', () => choose(button.dataset.nextId));
    });

    const backButton = contentEl.querySelector('[data-action="back"]');
    const restartButton = contentEl.querySelector('[data-action="restart"]');

    if (backButton) {
      backButton.addEventListener('click', goBack);
    }

    if (restartButton) {
      restartButton.addEventListener('click', restart);
    }

    const questionNumberMap = { q1: 1, q2: 2, q3: 3, q3b: 3, q4: 4, q5: 5, q4b: 5 };
    const questionNumber = questionNumberMap[questionId] || 1;
    const pct = (questionNumber / totalQuestions) * 100;
    updateProgress(pct, `Question ${questionNumber} of ${totalQuestions}`);
  }

  function renderResult(resultId) {
    const result = results[resultId] || results.r_na;
    currentId = resultId;

    const nextStepsList = result.nextSteps
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join('');

    contentEl.innerHTML = `
      <article class="trl-result-card">
        <header class="trl-result-header">
          <p class="trl-result-level">${escapeHtml(result.level)}</p>
          <h2>${escapeHtml(result.heading)}</h2>
        </header>
        <p class="trl-result-summary">${escapeHtml(result.summary)}</p>
        <h3>Recommended next actions</h3>
        <ul>${nextStepsList}</ul>
        <div class="trl-actions">
          <button type="button" class="btn-secondary" data-action="back" ${history.length === 0 ? 'disabled' : ''}>Back</button>
          <button type="button" class="btn-secondary" data-action="restart">Restart assessment</button>
        </div>
      </article>
    `;

    const backButton = contentEl.querySelector('[data-action="back"]');
    const restartButton = contentEl.querySelector('[data-action="restart"]');

    if (backButton) {
      backButton.addEventListener('click', goBack);
    }

    if (restartButton) {
      restartButton.addEventListener('click', restart);
    }

    updateProgress(100, "Done \u00b7 Result");
  }

  function choose(nextId) {
    history.push(currentId);

    if (nextId && nextId.startsWith('q')) {
      renderQuestion(nextId);
      return;
    }

    renderResult(nextId);
  }

  function goBack() {
    if (history.length === 0) {
      return;
    }

    const previousId = history.pop();

    if (previousId.startsWith('q')) {
      renderQuestion(previousId);
      return;
    }

    renderResult(previousId);
  }

  function restart() {
    history = [];
    currentId = 'q1';
    renderQuestion('q1');
  }

  function updateProgress(pct, label) {
    if (progressFillEl) {
      progressFillEl.style.width = `${pct}%`;
      const progressBar = progressFillEl.closest('[role="progressbar"]');
      if (progressBar) {
        progressBar.setAttribute('aria-valuenow', String(Math.round(pct)));
      }
    }

    if (progressStepEl) {
      progressStepEl.textContent = label;
    }
  }

  function setupAccordion() {
    const toggle = document.getElementById('trl-scale-toggle');
    const panel = document.getElementById('trl-scale-panel');

    if (!toggle || !panel) {
      return;
    }

    const togglePanel = () => {
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isExpanded));
      panel.hidden = isExpanded;
    };

    toggle.addEventListener('click', togglePanel);
    toggle.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        togglePanel();
      }
    });
  }

  setupAccordion();
  renderQuestion('q1');

  window.trlQuizEngine = {
    renderQuestion,
    renderResult,
    choose,
    goBack,
    restart,
    updateProgress
  };
})();
