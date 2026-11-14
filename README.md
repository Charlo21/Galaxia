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
