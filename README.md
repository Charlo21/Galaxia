# Galaxia

Interactive 3D web prototype in the Galaxia ecosystem.

This repository hosts the original browser game (static `index.html` + assets). Wallet connect is **Ethereum Sepolia only** (`chainId` `11155111`, public RPC `https://rpc.sepolia.org`). **MAINNET_BLOCKED** is enforced; a visible network-mismatch prompt appears when the wallet is on any other chain.

No production customers, revenue figures, or mainnet claims are asserted here.

## Local

```bash
npm install
npm test
npm start
```

## Deploy

- GitHub Pages serves branch `main` at path `/` (repo root).
- Vercel: create/link project **`galaxia`** with **Root Directory** `.` (repo root). `vercel.json` sets a static output at `.`. This agent has no Vercel credentials.

## Website

https://galaxia.help

## Stack

Static HTML/JS with Three.js. No application build step (`npm start` uses `npx serve`).

## Environment

No required secrets. Wallet connect, when used, is Sepolia-only (`11155111`) with MAINNET_BLOCKED as described above.

## License

See [LICENSE](LICENSE). Proprietary: Copyright (c) 2025-2026 Charles Mouton. All rights reserved.

## Security

See [SECURITY.md](SECURITY.md). Report vulnerabilities to hello@galaxia.help. This repository does not offer a bug bounty and does not claim any audit or certification.
