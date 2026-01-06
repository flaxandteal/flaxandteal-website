# Official Site Documentation 

## FORM CONFIGURATION

- Create and account with [Form Spark](https://formspark.io). 
- Create a New form
- Go to "How-to" tab and copy your form's action URL 
- Replace it within the params section of your site's configuration in `./config.toml`

```toml

<!-- ./config.toml -->

form_submission_redirect = 'https://flaxandteal.co.uk/thank-you/'
form_action_endpoint = 'https://submit-form.com/xxxxxxxxx'
```

## Converting from png to webp

Currently done by `mogrify -format webp -quality 80 X.png` with ImageMagick installed.

## Publishing blog posts (staff-only portal)

Flax & Teal staff can publish new blog posts through GitHub:

1. Open the repository in GitHub and go to **Actions → Publish Blog Post**.
2. Click **Run workflow** and fill in:
   - **Title** and **Author** (required).
   - **Summary** for the listing card (1–2 sentences, required).
   - **Body** with the full Markdown content (required).
   - **Tags** (comma-separated, optional).
3. Submit the form. The workflow will create a new Markdown file in `content/blog/`, commit it to `master`, and the existing deploy workflow will publish it to `/blog`.

Only users with write access to the repository (F&T staff) can run the workflow, keeping the publishing portal private to the team.
