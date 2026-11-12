# slop-police-kubk-pet-projects

Opinionated slop-police rules shared across kubk's pet projects. Each rule has its own `src/<rule-name>.ts`, exported from `src/index.ts`, a test in `src/<rule-name>.test.ts` that runs it with `lint` from `slop-police/testing`, and a section in `README.md`.

Before finishing, run `pnpm run typecheck`, `pnpm test`, `pnpm run format:check` and `pnpm run build`.
