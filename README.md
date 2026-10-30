# MyBlog

Personal blog built with Hugo and the PaperMod theme.

## Development

```shell
bun install
bun run dev
```

## Build

```shell
bun install
bun run build
```

The generated static site is written to `dist/`.

## Deployment

`.github/workflows/deploy.yml` validates builds on pull requests and deploys to production on pushes to `main` or `master`. The workflow also supports manual runs from GitHub Actions.

Configure these repository secrets before deploying:

- `REMOTE_HOST`
- `REMOTE_USER`
- `SSH_PRIVATE_KEY`
- `REMOTE_TARGET`

## Content

Add Markdown posts under `content/posts/`. The site starts without any blog posts. The About page lives at `content/about.md` and is intentionally empty for now.
