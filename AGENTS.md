# Incubator website operating rules

## Production releases

- The production site is `https://aiincubator-uky.vercel.app`.
- Vercel is connected to `Tamathe/Incubator`, with `main` as the production branch.
- Unless Tama explicitly asks to keep work local or requests a preview only, treat completed website changes as production release work.
- For a production release: verify the intended diff, run the relevant tests and production build, commit only the intended files, push the release commit to `main`, wait for the matching Vercel deployment to reach `READY`, and verify the public site.
- A local commit does not deploy. A feature-branch push creates a preview. A push to `main` triggers the automatic production deployment.
- Do not report a production change as complete until the public site has been checked.
