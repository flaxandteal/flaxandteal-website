/**
 * AI Readiness Report Generator
 * Generates a print-optimized detailed report from quiz results
 */

class ReportGenerator {
  constructor() {
    this.config = null;
    this.results = null;
    this.init();
  }

  async init() {
    try {
      await this.loadConfig();
      this.loadResults();
      this.generateReport();
    } catch (error) {
      console.error('Failed to generate report:', error);
      this.showError();
    }
  }

  async loadConfig() {
    const response = await fetch('/ai-readiness-quiz-config.json');
    if (!response.ok) {
      throw new Error('Failed to load quiz configuration');
    }
    this.config = await response.json();
  }

  loadResults() {
    const stored = sessionStorage.getItem('quizResults');
    if (!stored) {
      throw new Error('No quiz results found');
    }
    this.results = JSON.parse(stored);
  }

  generateReport() {
    const reportContent = document.getElementById('report-content');
    const reportDate = document.getElementById('report-date');

    if (!reportContent) return;

    // Format date
    if (reportDate) {
      const date = new Date(this.results.timestamp);
      reportDate.textContent = `Completed on ${date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })}`;
    }

    const { score } = this.results;
    const { total, max, categories, band } = score;

    reportContent.innerHTML = `
      ${this.buildExecutiveSummary(score)}

      <div class="page-break"></div>

      ${this.buildDetailedScores(score)}

      ${this.buildCategoryAnalysis(categories)}

      <div class="page-break"></div>

      ${this.buildRecommendations(band)}

      ${this.buildNextSteps(band)}

      ${this.buildAboutFlaxAndTeal()}
    `;
  }

  buildExecutiveSummary(score) {
    const { total, max, band } = score;
    const percentage = Math.round((total / max) * 100);

    return `
      <section class="quiz-results">
        <div class="results-hero">
          <div class="score-badge">${total}/${max}</div>
          <div class="score-level">${band.level} Level</div>
          <div class="score-summary">${band.summary}</div>
        </div>
      </section>

      <section style="background-color: #F1F7F5; padding: 2rem; border-radius: 12px; margin: 2rem 0;">
        <h2 style="color: #334B4E; margin-bottom: 1rem;">Executive Summary</h2>
        <p style="line-height: 1.8; color: #333;">
          This report provides a comprehensive assessment of your organization's readiness for AI adoption.
          Based on your responses across eight key dimensions of AI readiness, your organization has achieved
          a score of <strong>${total} out of ${max} (${percentage}%)</strong>, placing you in the
          <strong>${band.level}</strong> readiness category.
        </p>
        <p style="line-height: 1.8; color: #333; margin-top: 1rem;">
          This assessment evaluates critical factors including strategic planning, data capabilities,
          team skills, technical infrastructure, organizational culture, available resources, process maturity,
          and AI awareness. The following pages provide detailed insights into each area and actionable
          recommendations for your AI adoption journey.
        </p>
      </section>
    `;
  }

  buildDetailedScores(score) {
    const { total, max, categories } = score;
    const percentage = Math.round((total / max) * 100);

    const categoryHTML = Object.entries(categories).map(([catKey, catData]) => {
      const catInfo = this.config.categories[catKey];
      const catPercentage = catData.max > 0 ? Math.round((catData.score / catData.max) * 100) : 0;

      return `
        <div class="category-item">
          <div class="category-header">
            <span class="category-name">${catInfo.name}</span>
            <span class="category-score">${catData.score}/${catData.max} (${catPercentage}%)</span>
          </div>
          <div class="category-bar">
            <div class="category-fill" style="width: ${catPercentage}%; background-color: #9BCCC1;"></div>
          </div>
          <div class="category-description">${catInfo.description}</div>
        </div>
      `;
    }).join('');

    return `
      <section style="margin: 3rem 0;">
        <h2 style="color: #334B4E; margin-bottom: 1.5rem;">Your Readiness Profile</h2>
        <div class="category-breakdown" style="background-color: #F1F7F5; padding: 2rem; border-radius: 12px;">
          ${categoryHTML}
        </div>
      </section>
    `;
  }

  buildCategoryAnalysis(categories) {
    const analyses = Object.entries(categories).map(([catKey, catData]) => {
      const catInfo = this.config.categories[catKey];
      const catPercentage = catData.max > 0 ? Math.round((catData.score / catData.max) * 100) : 0;

      let assessment = '';
      if (catPercentage >= 75) {
        assessment = 'Strong foundation in this area. Continue to maintain and build on these capabilities.';
      } else if (catPercentage >= 50) {
        assessment = 'Good progress, but room for improvement. Focus on strengthening specific aspects of this dimension.';
      } else if (catPercentage >= 25) {
        assessment = 'Early development stage. Prioritize building capabilities in this area.';
      } else {
        assessment = 'Significant development needed. This represents a key opportunity area for growth.';
      }

      return `
        <div style="margin-bottom: 2rem; padding-bottom: 2rem; border-bottom: 1px solid #E8E8E8;">
          <h4 style="color: #334B4E; margin-bottom: 0.5rem;">${catInfo.name}</h4>
          <p style="color: #666; margin-bottom: 0.5rem; font-size: 14px; font-style: italic;">${catInfo.description}</p>
          <p style="line-height: 1.6; color: #333;"><strong>Score:</strong> ${catData.score}/${catData.max} (${catPercentage}%)</p>
          <p style="line-height: 1.6; color: #333;"><strong>Assessment:</strong> ${assessment}</p>
        </div>
      `;
    }).join('');

    return `
      <section style="margin: 3rem 0;">
        <h2 style="color: #334B4E; margin-bottom: 1.5rem;">Detailed Category Analysis</h2>
        <div style="background-color: #fff; padding: 2rem; border: 2px solid #9BCCC1; border-radius: 12px;">
          ${analyses}
        </div>
      </section>
    `;
  }

  buildRecommendations(band) {
    const recommendationsHTML = band.recommendations.map(rec =>
      `<li style="margin-bottom: 1rem; line-height: 1.6;">${rec}</li>`
    ).join('');

    return `
      <section style="margin: 3rem 0;">
        <h2 style="color: #334B4E; margin-bottom: 1.5rem;">Recommendations for Your Organization</h2>
        <div style="background-color: #F1F7F5; padding: 2rem; border-radius: 12px;">
          <p style="line-height: 1.8; color: #333; margin-bottom: 1.5rem;">
            Based on your <strong>${band.level}</strong> readiness level, we recommend focusing on
            the following priority areas:
          </p>
          <ul style="list-style-type: none; padding: 0;">
            ${recommendationsHTML}
          </ul>
        </div>
      </section>
    `;
  }

  buildNextSteps(band) {
    return `
      <section style="margin: 3rem 0;">
        <h2 style="color: #334B4E; margin-bottom: 1.5rem;">Next Steps</h2>
        <div style="background-color: #fff; padding: 2rem; border: 2px solid #334B4E; border-radius: 12px;">
          <p style="line-height: 1.8; color: #333; margin-bottom: 1.5rem; font-weight: 600;">
            ${band.next_steps}
          </p>
          <div style="background-color: #F1F7F5; padding: 1.5rem; border-radius: 8px; margin-top: 2rem;">
            <h3 style="color: #334B4E; margin-bottom: 1rem; font-size: 20px;">Ready to Take Action?</h3>
            <p style="line-height: 1.6; color: #333; margin-bottom: 1rem;">
              Flax & Teal offers practical AI workshops designed specifically for SMEs and organizations
              at your stage of the AI adoption journey. Our programmes combine hands-on training with
              personalized mentoring to help you implement AI effectively.
            </p>
            <p style="line-height: 1.6; color: #333; margin: 0;">
              <strong>Contact us:</strong> info@flaxandteal.co.uk<br>
              <strong>Learn more:</strong> <a href="https://flaxandteal.co.uk/aiforbusiness/" style="color: #334B4E;">flaxandteal.co.uk/aiforbusiness</a><br>
              <strong>Book a consultation:</strong> <a href="https://calendar.app.google/NJXiZ8TQNPS7c8h97" style="color: #334B4E;">Schedule a call</a>
            </p>
          </div>
        </div>
      </section>
    `;
  }

  buildAboutFlaxAndTeal() {
    return `
      <section style="margin: 3rem 0; padding: 2rem; background-color: #F1F7F5; border-radius: 12px;">
        <h2 style="color: #334B4E; margin-bottom: 1.5rem;">About Flax & Teal</h2>
        <p style="line-height: 1.8; color: #333; margin-bottom: 1rem;">
          Flax & Teal is a consultancy focused on open technologies, serving public and private sectors
          through web-based solutions in computational engineering, geospatial analysis, and data science.
          We help organizations navigate the complexities of digital transformation and AI adoption through
          practical, hands-on support.
        </p>
        <p style="line-height: 1.8; color: #333; margin-bottom: 1rem;">
          Our AI for Business workshops are commissioned by councils, enterprise agencies, and innovation
          hubs to deliver real value to their SME communities. We combine technical expertise with practical,
          sector-specific guidance to help businesses adopt AI safely and effectively.
        </p>
        <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #E8E8E8;">
          <p style="font-size: 14px; color: #666; margin: 0;">
            <strong>Flax & Teal Limited</strong><br>
            Farset Labs, Weavers Court, Linfield Road, Belfast BT12 5GH<br>
            Email: info@flaxandteal.co.uk | Web: flaxandteal.co.uk
          </p>
        </div>
      </section>
    `;
  }

  showError() {
    const reportContent = document.getElementById('report-content');
    if (reportContent) {
      reportContent.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: #E07A5F;">
          <h3>No Quiz Results Found</h3>
          <p>Please complete the quiz first to generate your report.</p>
          <a href="/ai-readiness/" style="display: inline-block; margin-top: 2rem; padding: 0.8rem 2rem; background-color: #334B4E; color: #fff; text-decoration: none; border-radius: 500px; font-weight: 600;">
            Take the Quiz
          </a>
        </div>
      `;
    }
  }
}

// Initialize report when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ReportGenerator());
} else {
  new ReportGenerator();
}
