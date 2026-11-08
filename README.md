# Steady (steady)

A private, owner-only tracker for anxieties and depression: log a worry fast, sort it by category,
track its status, and write a next step and a reframe.

- `steady-express`: `dev`, `build`, `start`, `lint`, `create:admin`, `seed`
- `steady-react`: `dev`, `typecheck`, `build`, `preview`, `lint`

```bash
yarn install
yarn workspace steady-express create:admin you@example.com 'a-long-password' First Last
yarn workspace steady-express seed   # placeholder entries
yarn dev:express
yarn dev:react
```

See `CLAUDE.md` for architecture and rules, and `../designs/steady/` for the design.
