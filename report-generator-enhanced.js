/**
 * Enhanced AI Readiness Report Generator
 * Generates comprehensive print-optimised reports with Vega-Lite visualizations
 */

class EnhancedReportGenerator {
  constructor() {
    this.config = null;
    this.results = null;
    this.sector = null;
    this.region = null;
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

    // Extract sector and region
    this.sector = this.results.answers.q0_sector || 'other';
    this.region = this.results.answers.q0_region || 'other';
  }

  async generateReport() {
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
    const { band } = score;

    reportContent.innerHTML = `
      ${this.buildExecutiveSummary(score)}

      <div id="viz-container" style="margin: 2rem 0;"></div>

      ${this.buildDetailedScores(score)}

      <div class="page-break"></div>

      ${this.buildCategoryAnalysis(score.categories)}

      <div class="page-break"></div>

      ${this.buildStateOfIndustry(band)}

      ${this.buildSectorUptake(band)}

      ${this.buildFutureDevelopments(band)}

      <div class="page-break"></div>

      ${this.buildCommonTools(band)}

      ${this.buildRecommendations(band)}

      <div class="page-break"></div>

      ${this.buildNextSteps(band)}

      ${this.buildCommonStrategies(band)}

      ${this.buildFundingSupport(band)}

      ${this.buildBusinessGroups(band)}

      ${this.buildContactCTA(band)}

      ${this.buildAboutFlaxAndTeal()}
    `;

    // Generate Vega-Lite visualization
    await this.generateVisualization(score);
  }

  buildExecutiveSummary(score) {
    const { total, max, band } = score;
    const percentage = Math.round((total / max) * 100);
    const sectorInfo = this.config.sectors[this.sector];

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
        <div style="display: flex; align-items: centre; gap: 1rem; margin-bottom: 1rem;">
          <span style="font-size: 36px;">${sectorInfo.icon}</span>
          <div>
            <strong style="color: #334B4E;">Sector:</strong> ${sectorInfo.name}<br>
            <span style="font-size: 14px; color: #666;">${sectorInfo.description}</span>
          </div>
        </div>
        <p style="line-height: 1.8; color: #333;">
          This report provides a comprehensive assessment of your organisation's readiness for AI adoption.
          Based on your responses across eight key dimensions of AI readiness, your organisation has achieved
          a score of <strong>${total} out of ${max} (${percentage}%)</strong>, placing you in the
          <strong>${band.level}</strong> readiness category.
        </p>
        <p style="line-height: 1.8; color: #333; margin-top: 1rem;">
          This assessment evaluates critical factors including strategic planning, data capabilities,
          team skills, technical infrastructure, organisational culture, available resources, process maturity,
          and AI awareness. The following pages provide detailed insights into each area and actionable
          recommendations for your AI adoption journey.
        </p>
      </section>
    `;
  }

  async generateVisualization(score) {
    const { categories } = score;
    const categoryKeys = Object.keys(categories);
    const numCategories = categoryKeys.length;

    // Prepare data for radar chart with index for equal label spacing
    const data = categoryKeys.map((key, index) => {
      const value = categories[key];
      const catInfo = this.config.categories[key];
      const percentage = value.max > 0 ? (value.score / value.max) * 100 : 0;
      // Calculate angle for equal spacing (in radians, offset by -90deg to start at top)
      const angle = ((index + 0.5) / numCategories) * 2 * Math.PI - Math.PI / 2;
      return {
        category: catInfo.name,
        score: Math.round(percentage),
        maxScore: 100,
        index: index,
        // Pre-calculate label position for equal spacing
        labelAngle: (index / numCategories) * 360 - 90,
        // Calculate text anchor based on position around the circle
        labelX: Math.cos(angle) * 175,
        labelY: Math.sin(angle) * 175
      };
    });

    const spec = {
      "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
      "title": {
        "text": "AI Readiness Profile",
        "fontSize": 20,
        "font": "Kumbh Sans, sans-serif",
        "color": "#334B4E"
      },
      "width": 400,
      "height": 400,
      "data": {"values": data},
      "layer": [
        {
          "mark": {"type": "arc", "innerRadius": 40, "stroke": "#fff"},
          "encoding": {
            "theta": {"field": "maxScore", "type": "quantitative", "stack": true},
            "radius": {
              "field": "maxScore",
              "type": "quantitative",
              "scale": {"type": "linear", "zero": true, "range": [40, 150]}
            },
            "color": {"value": "#E8E8E8"},
            "order": {"field": "index", "type": "ordinal"}
          }
        },
        {
          "mark": {"type": "arc", "innerRadius": 40, "stroke": "#fff"},
          "encoding": {
            "theta": {"field": "maxScore", "type": "quantitative", "stack": true},
            "radius": {
              "field": "score",
              "type": "quantitative",
              "scale": {"type": "linear", "zero": true, "range": [40, 150]}
            },
            "color": {
              "field": "category",
              "type": "nominal",
              "scale": {"range": ["#9BCCC1", "#7AB8AC", "#5BA497", "#3C9082", "#334B4E", "#2A3D40", "#9BCCC1", "#7AB8AC"]},
              "legend": null
            },
            "order": {"field": "index", "type": "ordinal"},
            "tooltip": [
              {"field": "category", "type": "nominal", "title": "Category"},
              {"field": "score", "type": "quantitative", "title": "Score (%)", "format": ".0f"}
            ]
          }
        },
        {
          "mark": {"type": "text", "fontSize": 11, "fontWeight": "bold"},
          "encoding": {
            "text": {"field": "category", "type": "nominal"},
            "x": {"field": "labelX", "type": "quantitative", "scale": {"domain": [-200, 200]}, "axis": null},
            "y": {"field": "labelY", "type": "quantitative", "scale": {"domain": [-200, 200]}, "axis": null},
            "color": {"value": "#334B4E"}
          }
        }
      ],
      "config": {
        "view": {"stroke": null},
        "font": "Kumbh Sans, sans-serif"
      }
    };

    try {
      await vegaEmbed('#viz-container', spec, {
        actions: false,
        renderer: 'svg'
      });
    } catch (error) {
      console.error('Visualization error:', error);
      document.getElementById('viz-container').innerHTML = '<p style="text-align: centre; color: #666;">Visualization unavailable</p>';
    }
  }

  buildDetailedScores(score) {
    const { total, max, categories } = score;
    const percentage = Math.round((total / max) * 100);

    // Define color scale based on percentage
    const getBarColor = (pct) => {
      if (pct >= 75) return '#3C9082';
      if (pct >= 50) return '#7AB8AC';
      if (pct >= 25) return '#9BCCC1';
      return '#B9DCD5';
    };

    const categoryHTML = Object.entries(categories).map(([catKey, catData]) => {
      const catInfo = this.config.categories[catKey];
      const catPercentage = catData.max > 0 ? Math.round((catData.score / catData.max) * 100) : 0;
      const barColor = getBarColor(catPercentage);

      return `
        <div style="margin-bottom: 2rem; page-break-inside: avoid;">
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.5rem;">
            <span style="font-weight: 600; color: #334B4E; font-size: 16px;">${catInfo.name}</span>
            <span style="font-weight: 700; color: #334B4E; font-size: 18px;">${catPercentage}%</span>
          </div>
          <div style="position: relative; width: 100%; height: 32px; background-color: #E8E8E8; border-radius: 16px; overflow: hidden; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);">
            <div style="position: absolute; left: 0; top: 0; height: 100%; width: ${catPercentage}%; background: linear-gradient(90deg, ${barColor} 0%, ${barColor} 100%); border-radius: 16px; transition: width 0.5s ease; display: flex; align-items: centre; justify-content: flex-end; padding-right: 12px;">
              <span style="color: #fff; font-weight: 700; font-size: 14px; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">${catData.score}/${catData.max}</span>
            </div>
          </div>
          <p style="font-size: 13px; color: #666; margin: 0.5rem 0 0 0; font-style: italic;">${catInfo.description}</p>
        </div>
      `;
    }).join('');

    return `
      <section style="margin: 3rem 0;">
        <h2 style="color: #334B4E; margin-bottom: 1.5rem;">Your Readiness Profile</h2>
        <div style="background-color: #F1F7F5; padding: 2.5rem; border-radius: 12px;">
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
          <p style="line-height: 1.6; color: #333; margin-top: 0.5rem; font-size: 14px;"><strong>Why this matters:</strong> ${catInfo.explanation}</p>
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

  buildStateOfIndustry(band) {
    return `
      <section style="margin: 3rem 0;">
        <h2 style="color: #334B4E; margin-bottom: 1rem;">State of AI in Your Industry</h2>
        <div style="background-color: #F1F7F5; padding: 2rem; border-radius: 12px;">
          <p style="line-height: 1.8; color: #333;">
            ${band.state_of_industry}
          </p>
        </div>
      </section>
    `;
  }

  buildSectorUptake(band) {
    const sectorContent = band.sector_uptake[this.sector] || band.sector_uptake.default;

    return `
      <section style="margin: 3rem 0;">
        <h2 style="color: #334B4E; margin-bottom: 1rem;">AI Uptake in ${this.config.sectors[this.sector].name}</h2>
        <div style="background-color: #fff; padding: 2rem; border: 2px solid #9BCCC1; border-radius: 12px;">
          <p style="line-height: 1.8; color: #333;">
            ${sectorContent}
          </p>
        </div>
      </section>
    `;
  }

  buildFutureDevelopments(band) {
    return `
      <section style="margin: 3rem 0;">
        <h2 style="color: #334B4E; margin-bottom: 1rem;">Future Developments for Your Maturity Level</h2>
        <div style="background-color: #F1F7F5; padding: 2rem; border-radius: 12px;">
          <p style="line-height: 1.8; color: #333;">
            ${band.future_developments}
          </p>
        </div>
      </section>
    `;
  }

  buildCommonTools(band) {
    const toolsHTML = band.common_tools.map(tool => `
      <div style="background-color: #fff; padding: 1.5rem; border: 2px solid #E8E8E8; border-radius: 8px; margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
          <h4 style="color: #334B4E; margin: 0;">${tool.name}</h4>
          <span style="background-color: #9BCCC1; color: #334B4E; padding: 0.2rem 0.6rem; border-radius: 12px; font-size: 11px; font-weight: 600;">${tool.ease}</span>
        </div>
        <p style="color: #666; font-size: 13px; margin: 0.3rem 0;"><strong>Category:</strong> ${tool.category}</p>
        <p style="color: #666; font-size: 13px; margin: 0.3rem 0;"><strong>Cost:</strong> ${tool.cost}</p>
        <p style="line-height: 1.6; color: #333; margin: 1rem 0 0.5rem 0;">${tool.description}</p>
        <p style="line-height: 1.5; color: #666; font-size: 14px; font-style: italic; margin: 0.5rem 0 0 0;">
          <strong>Implementation notes:</strong> ${tool.notes}
        </p>
      </div>
    `).join('');

    return `
      <section style="margin: 3rem 0;">
        <h2 style="color: #334B4E; margin-bottom: 1rem;">Common AI Tools at Your Maturity Level</h2>
        <div style="padding: 1rem 0;">
          ${toolsHTML}
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
        <h2 style="color: #334B4E; margin-bottom: 1.5rem;">Recommendations for Your Organisation</h2>
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
    const stepsHTML = band.next_steps_detailed.map(step => `
      <div style="background-color: #F1F7F5; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
        <h4 style="color: #334B4E; margin: 0 0 1rem 0;">${step.priority}</h4>
        <ul style="list-style-type: none; padding: 0; margin: 0;">
          ${step.actions.map(action => `<li style="padding-left: 1.5rem; position: relative; margin-bottom: 0.8rem; line-height: 1.6;"><span style="position: absolute; left: 0; color: #9BCCC1; font-weight: bold;">→</span>${action}</li>`).join('')}
        </ul>
      </div>
    `).join('');

    return `
      <section style="margin: 3rem 0;">
        <h2 style="color: #334B4E; margin-bottom: 1.5rem;">Detailed Next Steps</h2>
        <div style="background-color: #fff; padding: 2rem; border: 2px solid #334B4E; border-radius: 12px;">
          <p style="line-height: 1.8; color: #333; margin-bottom: 1.5rem; font-weight: 600;">
            ${band.next_steps}
          </p>
          ${stepsHTML}
        </div>
      </section>
    `;
  }

  buildCommonStrategies(band) {
    const strategiesHTML = band.common_strategies.map(strategy => `
      <div style="background-color: #F1F7F5; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
        <h4 style="color: #334B4E; margin: 0 0 0.5rem 0;">${strategy.strategy}</h4>
        <p style="line-height: 1.6; color: #333; margin-bottom: 1rem;">${strategy.description}</p>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
          ${strategy.success_factors.map(factor => `<span style="background-color: #9BCCC1; color: #334B4E; padding: 0.3rem 0.8rem; border-radius: 12px; font-size: 12px; font-weight: 600;">${factor}</span>`).join('')}
        </div>
      </div>
    `).join('');

    return `
      <section style="margin: 3rem 0;">
        <h2 style="color: #334B4E; margin-bottom: 1rem;">Common Strategies to Get Started</h2>
        <div style="padding: 1rem 0;">
          ${strategiesHTML}
        </div>
      </section>
    `;
  }

  buildFundingSupport(band) {
    // Check if region-specific funding is available and enabled
    const regionFunding = band.funding_support[this.region];
    const hasRegionFunding = regionFunding && regionFunding.enabled;

    let regionHTML = '';
    let regionName = '';

    if (hasRegionFunding) {
      regionName = this.config.regions[this.region].name;
      regionHTML = regionFunding.items.map(item =>
        `<li style="margin-bottom: 0.8rem; line-height: 1.6;">${item}</li>`
      ).join('');
    }

    const generalHTML = band.funding_support.general && band.funding_support.general.length > 0
      ? band.funding_support.general.map(item =>
          `<li style="margin-bottom: 0.8rem; line-height: 1.6;">${item}</li>`
        ).join('')
      : '';

    // If no region-specific funding, show only general
    if (!hasRegionFunding) {
      return `
        <section style="margin: 3rem 0;">
          <h2 style="color: #334B4E; margin-bottom: 1rem;">Potential Funding Support</h2>
          <div style="background-color: #fff; padding: 2rem; border: 2px solid #9BCCC1; border-radius: 12px;">
            <ul style="list-style-type: none; padding: 0;">
              ${generalHTML}
            </ul>
          </div>
        </section>
      `;
    }

    // Show both region-specific and general
    return `
      <section style="margin: 3rem 0;">
        <h2 style="color: #334B4E; margin-bottom: 1rem;">Potential Funding Support</h2>
        <div style="background-color: #fff; padding: 2rem; border: 2px solid #9BCCC1; border-radius: 12px;">
          <h3 style="color: #334B4E; font-size: 18px; margin-bottom: 1rem;">${regionName}</h3>
          <ul style="list-style-type: none; padding: 0; margin-bottom: ${generalHTML ? '2rem' : '0'};">
            ${regionHTML}
          </ul>
          ${generalHTML ? `
            <h3 style="color: #334B4E; font-size: 18px; margin-bottom: 1rem;">General Opportunities</h3>
            <ul style="list-style-type: none; padding: 0;">
              ${generalHTML}
            </ul>
          ` : ''}
        </div>
      </section>
    `;
  }

  buildBusinessGroups(band) {
    // Check if region-specific business groups are available and enabled
    const regionGroups = band.business_groups[this.region];
    const hasRegionGroups = regionGroups && regionGroups.enabled;

    let groupsHTML = '';
    let sectionTitle = 'Relevant Business Groups for AI in Your Region';
    let intro = '';

    if (hasRegionGroups) {
      const regionName = this.config.regions[this.region].name;
      sectionTitle = `Relevant Business Groups for AI in ${regionName}`;
      intro = `<p style="line-height: 1.8; color: #333; margin-bottom: 1.5rem;">
        Connect with these business networks and communities in ${regionName} to accelerate your AI adoption journey through peer learning and collaboration.
      </p>`;

      groupsHTML = regionGroups.groups.map(group => {
        const linkHTML = group.link ? `<a href="${group.link}" style="color: #334B4E; text-decoration: underline;">${group.link}</a>` : '<span style="color: #666; font-style: italic;">Contact locally</span>';
        return `
          <div style="background-color: #F1F7F5; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
            <h4 style="color: #334B4E; margin: 0 0 0.5rem 0;">${group.name}</h4>
            <p style="line-height: 1.6; color: #333; margin-bottom: 0.8rem;">${group.description}</p>
            <p style="font-size: 14px; color: #666; margin: 0;">${linkHTML}</p>
          </div>
        `;
      }).join('');
    } else {
      // Use general business groups
      intro = `<p style="line-height: 1.8; color: #333; margin-bottom: 1.5rem;">
        Connect with these business networks and communities to accelerate your AI adoption journey through peer learning and collaboration.
      </p>`;

      groupsHTML = band.business_groups.general.map(group => {
        const linkHTML = group.link ? `<a href="${group.link}" style="color: #334B4E; text-decoration: underline;">${group.link}</a>` : '<span style="color: #666; font-style: italic;">Search locally</span>';
        return `
          <div style="background-color: #F1F7F5; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
            <h4 style="color: #334B4E; margin: 0 0 0.5rem 0;">${group.name}</h4>
            <p style="line-height: 1.6; color: #333; margin-bottom: 0.8rem;">${group.description}</p>
            <p style="font-size: 14px; color: #666; margin: 0;">${linkHTML}</p>
          </div>
        `;
      }).join('');
    }

    return `
      <section style="margin: 3rem 0;">
        <h2 style="color: #334B4E; margin-bottom: 1rem;">${sectionTitle}</h2>
        <div style="background-color: #fff; padding: 2rem; border: 2px solid #334B4E; border-radius: 12px;">
          ${intro}
          ${groupsHTML}
        </div>
      </section>
    `;
  }

  buildContactCTA(band) {
    const cta = band.contact_cta;

    return `
      <section style="margin: 3rem 0; background: linear-gradient(135deg, #334B4E 0%, #4a6568 100%); color: #fff; padding: 3rem 2rem; border-radius: 12px; text-align: centre;">
        <h2 style="color: #fff; margin-bottom: 1rem;">${cta.heading}</h2>
        <p style="font-size: 18px; line-height: 1.6; max-width: 600px; margin: 0 auto 2rem auto; opacity: 0.95;">
          ${cta.message}
        </p>
        <div class="no-print" style="display: flex; gap: 1rem; justify-content: centre; flex-wrap: wrap; margin-top: 2rem;">
          <a href="https://calendar.app.google/NJXiZ8TQNPS7c8h97" style="background-color: #9BCCC1; color: #334B4E; padding: 0.8rem 2rem; border-radius: 500px; text-decoration: none; font-weight: 600; display: inline-block;">
            ${cta.primary_action}
          </a>
          <a href="/aiforbusiness" style="background-color: transparent; color: #fff; border: 2px solid #fff; padding: 0.8rem 2rem; border-radius: 500px; text-decoration: none; font-weight: 600; display: inline-block;">
            ${cta.secondary_action}
          </a>
        </div>
        <div class="print-only" style="display: none; margin-top: 2rem; font-size: 16px;">
          <p style="margin: 0;"><strong>Contact us:</strong> info@flaxandteal.co.uk</p>
          <p style="margin: 0.5rem 0 0 0;"><strong>Book online:</strong> https://calendar.app.google/NJXiZ8TQNPS7c8h97</p>
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
          We help organisations navigate the complexities of digital transformation and AI adoption through
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
        <div style="text-align: centre; padding: 3rem; color: #E07A5F;">
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
  document.addEventListener('DOMContentLoaded', () => new EnhancedReportGenerator());
} else {
  new EnhancedReportGenerator();
}
