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

## DeepSeek pet

The home page, post list, archives, search, tags, and about pages include a small
interactive DeepSeek pet in the lower-right corner. It is intentionally omitted
from individual post pages. The component is plain HTML, CSS, and JavaScript;
the implementation lives under `layouts/_partials/deepseek-pet/` and
`static/deepseek-pet/`.

The character artwork and expressions are adapted from
[keleus/deepseek-pet](https://github.com/keleus/deepseek-pet), licensed under
the MIT License. The upstream license notice is included at
`static/deepseek-pet/LICENSE`.

## Deployment

`.github/workflows/deploy.yml` validates builds on pull requests and deploys to production on pushes to `main` or `master`. The workflow also supports manual runs from GitHub Actions.

Configure these repository secrets before deploying:

- `REMOTE_HOST`
- `REMOTE_USER`
- `SSH_PRIVATE_KEY`
- `REMOTE_TARGET`

### Production HTTPS

The production server must terminate TLS on port 443. If Nginx only listens on
port 80, absolute `https://` links will fail even though the corresponding
`http://` pages are present.

Install a certificate with Certbot on the server:

```shell
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d xiaozhiwei.tech -d www.xiaozhiwei.tech --redirect
```

Then make sure the cloud firewall or security group also allows inbound TCP
port 443. Verify all public routes over HTTPS:

```shell
for path in / /posts/ /archives/ /about/ /tags/ /search/; do
  curl -fsS -o /dev/null -w "%{http_code} ${path}\n" "https://xiaozhiwei.tech${path}"
done
```

## Content

Add Markdown posts under `content/posts/`. The site starts without any blog posts. The About page lives at `content/about.md` and is intentionally empty for now.
