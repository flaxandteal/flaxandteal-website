---
title: "Publishing blog posts with GitHub"
date: 2024-08-22T00:00:00Z
author: "Flax & Teal"
description: "Introducing the staff-only GitHub portal for adding new articles to the Flax & Teal blog."
draft: false
tags: ["workflow", "content"]
---

Our blog now publishes directly from GitHub. Instead of editing site files manually, Flax & Teal staff can run the **Publish Blog Post** workflow in GitHub and fill out a short form. The workflow will create a new Markdown file in `content/blog`, commit it to the repository, and trigger the normal site deployment pipeline.

### How the workflow works

1. Go to **Actions → Publish Blog Post → Run workflow** in GitHub.
2. Enter the post **Title**, **Author**, and a short **Summary** (used on the listing page).
3. Paste the full Markdown **Body** of the article, plus optional comma-separated **Tags**.
4. Run the workflow. When it finishes, a new post file is committed to `master` and will appear on the `/blog` page after the next deploy.

### Tips for great posts

- Use Markdown headings to structure your article.
- Add links with `[text](url)` and bullet lists for readability.
- Keep summaries to ~1–2 sentences; they’re shown on the blog listing cards.
- Include a publish-ready title case headline so the URL slug reads well.
