# Chess (WIP)

A chess game built with Svelte, TypeScript, and Vite.

## Goal

Build an interactive chess experience as an opportunity to learn more about svelte and vitest

## Project Roadmap

- [x] **Milestone 1:** Board Rendering
- [x] **Milestone 2:** Full Board Initialization
- [x] **Milestone 3:** Click Source/Destination Movement
- [x] **Milestone 4:** Drag and Drop Movement
- [x] **Milestone 5:** FEN Parsing and Text-File Persistence
- [ ] **Milestone 6:** Legal Move Engine
  - [ ] Add pawn move generator, including en passant target setting
  - [ ] Add knight move generator
  - [ ] Add bishop move generator
  - [ ] Add queen move generator
  - [ ] Add rook move generator, including castling availability
  - [ ] Add king move generator, including castling availability
  - [ ] Check all generated pseudo legal moves and filter down to legal moves
  - [ ] Add halfmove counter updates (reset on pawn move/capture, increment otherwise)
  - [ ] Add promotion logic (auto queen promotion)
- [ ] **Milestone 7:** Game Completion Logic
  - [ ] Add checkmate detection
  - [ ] Add stalemate detection
- [ ] **Milestone 8:** Add ai opponent

## Run Locally

Install dependencies:

```bash
pnpm install
```

Start the dev server:

```bash
pnpm dev
```

## Useful Commands

```bash
pnpm build        # production build
pnpm preview      # preview production build locally
pnpm check        # type + Svelte checks
pnpm lint         # Prettier check
pnpm format       # format code with Prettier
```
