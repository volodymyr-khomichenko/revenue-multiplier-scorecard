# Revenue Multiplier Scorecard

Self-contained scorecard for the book [Marketing as a Revenue Multiplier](https://khomichenko.com/marketing-as-a-revenue-multiplier/).

Live: https://revenue-multiplier-scorecard.vercel.app
Custom domain (once DNS is pointed): https://revenue-multiplier-scorecard.khomichenko.com

## Files

- `index.html` — the whole product (v0.14)
- `api/subscribe.js` — sends the email copy to MailerLite
- `wordpress-embed.html` — paste into a WordPress Custom HTML block later, if you decide to embed

## MailerLite (optional, later)

In Vercel → Project → Settings → Environment Variables:

- `MAILERLITE_API_KEY`
- `MAILERLITE_GROUP_ID`

Then in `index.html` set `SUBSCRIBE_ENDPOINT` to `"/api/subscribe"`. Until then the form is demo-only and does not send email.
