# Change Log

## [1.1.0] - 2026-10-04

### Added

- Automatically add a tpwand to each player's hotbar on first join, with a per-player option to disable it. This is enabled by default.
- Allow players with sufficient permission level to configure well known world locations from the tpwand UI without needing the command block hack.

### Changed

- Modernized the build and packaging pipeline and updated Node.js/TypeScript compatibility.

## [1.0.1] - 2024-04-24

### Changed

- Changed admin UI to allow configuration of display to either use buttons or dropdowns for teleport locations. For a small number of items (or if on a tablet), buttons may work better - but for larger lists each player can change their settings to use a dropdown instead. These options are persisted on a per player basis.
- Teleport destinations are now sorted alphabetically.
- Re-ordered main menu in order of likely use (i.e. config options at the end).
