# GitHub Pages Legal Site

This folder is ready to be published as a standalone GitHub Pages site for ZenSee legal documents.

## Recommended setup

Use a dedicated GitHub repository, for example:

- `zensee-legal`

Then upload the contents of this folder to the root of that repository.

## Repository structure

- `privacy-policy/index.html`
- `terms-of-service/index.html`
- `support/index.html`
- `download/index.html`
- `download/en/index.html`
- `download/zh-hant/index.html`
- `download/ja/index.html`
- `.nojekyll`

## Enable GitHub Pages

In the target repository on GitHub:

1. Open `Settings`
2. Open `Pages`
3. Under `Build and deployment`
4. Set `Source` to `Deploy from a branch`
5. Set branch to `main`
6. Set folder to `/(root)`
7. Click `Save`

## Final URL formats

If the repository is a project site repo such as `zensee-legal`:

- `https://<github-username>.github.io/zensee-legal/privacy-policy/`
- `https://<github-username>.github.io/zensee-legal/terms-of-service/`
- `https://<github-username>.github.io/zensee-legal/support/`
- `https://<github-username>.github.io/zensee-legal/download/`
- `https://<github-username>.github.io/zensee-legal/download/en/`
- `https://<github-username>.github.io/zensee-legal/download/zh-hant/`
- `https://<github-username>.github.io/zensee-legal/download/ja/`

If the repository is a user site repo such as `<github-username>.github.io`:

- `https://<github-username>.github.io/privacy-policy/`
- `https://<github-username>.github.io/terms-of-service/`
- `https://<github-username>.github.io/support/`
- `https://<github-username>.github.io/download/`
- `https://<github-username>.github.io/download/en/`
- `https://<github-username>.github.io/download/zh-hant/`
- `https://<github-username>.github.io/download/ja/`

## Notes

- `.nojekyll` is included so the static files are served directly.
- The pages use relative links, so both repository URL styles above will work.
