# Security

ag-relay sits in front of **your own** Google account quota. Treat its
credentials like account passwords.

## How secrets are handled

- **Environment variables only.** The Google refresh token, OAuth client
  credentials, relay API key and dashboard password are read from environment
  variables (or, for local use, `~/.ag-relay/config.json` with `0600`
  permissions). None of them are ever written into source code, and the
  dashboard HTML/JS contains no secret values.
- **`.gitignore` covers** `.tokens*.json`, `.oauth-session.json`, `.env*`,
  `.metadata.json` and local tooling dumps. If you add a new file that can
  hold a credential, gitignore it *before* the first commit.
- **The relay API key is the only credential clients need.** Anyone holding
  it can spend your quota — share it only with your own apps/devices, and
  rotate it (replace `RELAY_API_KEY` and redeploy) if it leaks. Rotation
  instantly invalidates the old key.
- **Protect the dashboard.** Set `DASH_PASSWORD`; without it anyone who
  finds your relay URL can see quota and usage information.
- **Protect the host account.** The only way to change the deployed code is
  through your hosting account (e.g. Vercel). Enable two-factor
  authentication on it and on the Google account the relay runs under.

## Recommendations

- Run the relay under a **dedicated Google account** that holds the
  Antigravity license (e.g. a secondary account), **not** your main account:
  the relay talks to Google through the same internal API the official
  client uses, but from an unofficial client — if Google ever restricts the
  account, only that account is affected.
- Keep your deployment's environment variables marked **sensitive** in your
  host's dashboard so their values are never shown back.

## Reporting

Found a way this code leaks a credential or accepts an unauthorized
request? Please open a GitHub issue describing the problem *without*
including any real tokens or keys.
