## FORM CONFIGURATION

- Create and account with [Form Spark](https://formspark.io). 
- Create a New form
- Go to "How-to" tab and copy your form's action URL 
- Replace it within the params section of your site's configuration in `./config.toml`

### LOCAL

```toml

<!-- ./config.toml -->

form_submission_redirect = 'http://localhost:1313/thank-you/'
<!-- Replace with your custom form endpoint https://formspark.io -->
form_action_endpoint = 'https://submit-form.com/xxxxxxxxx'
```

### PRODUCTION

```toml

<!-- ./config.toml -->

form_submission_redirect = 'https://flaxandteal.co.uk/thank-you/'
form_action_endpoint = 'https://submit-form.com/xxxxxxxxx'
```