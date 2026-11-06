# Bases Formats

Display numeric amount columns in Obsidian Bases with exactly two decimal places. Stored properties, formula results, sorting, filters, and calculations keep their original precision.

**Development preview — not yet released or listed in Community plugins.** Requires Obsidian 1.15.0 or newer. Plugin ID: `bases-formats`. MIT licensed.

## Formatting

A column qualifies when either its property name or its display name:

- starts with `amount`;
- ends with `amount`; or
- contains `€` or `$`.

Matching ignores case, surrounding whitespace, and the `note.` / `formula.` prefix. For example, `amount_total`, `Baseline amount`, `Price €`, and `$ balance` qualify. A formula named `worth_baseline` with display name `Baseline amount` also qualifies.

The plugin changes a rendered numeric text node from `25` to `25.00`, or `1.23456` to `1.23`. It never writes note content, frontmatter, or Base definitions. It accepts plain signed decimal numbers, including comma decimals, and preserves the previous formatter's decimal-point display. Empty cells, nonnumeric strings, links, inputs, and ambiguous cells containing multiple numbers are left alone. This is a number formatter; it does not add a currency symbol or infer a currency.

Works with the built-in Bases table and optionally with the separate [Bases Excerpts](https://github.com/stallinger-dev/obsidian-bases-excerpts) table. Neither plugin requires the other or CodeScript Toolkit.

## Development

Use Node.js 22 or newer and npm:

```sh
npm ci
npm run check
```

`dist/` contains `main.js`, `manifest.json`, and `styles.css`. It is generated and ignored by Git. CI runs the same build and tests; version tags create draft releases only.

## Local deployment

Choose the target outside the versioned configuration. In PowerShell:

```powershell
$env:OBSIDIAN_VAULT = 'C:\path\to\test-vault'
npm run deploy
```

Optionally set `OBSIDIAN_CONFIG_DIR` to a relative config folder (default `.obsidian`). The config folder must already exist. The deploy command rebuilds, tests, and copies only the three release assets into `<config>/plugins/bases-formats/`. It preserves `data.json` and does not enable, disable, or reload any plugin.

**No deployment has been performed during repository setup.** Announce the first deployment before running it. Use a disposable vault for initial testing.

## Replacing Bases Amount Formatter

The existing `bases-amount-formatter` plugin remains installed and enabled until migration is approved. This plugin has its own new ID and does not reuse the old plugin's directory or configuration. For the actual cutover, disable the old formatter before enabling Bases Formats in the same vault; keep the old files available for rollback. Do not run both formatters together.

## Validation and compatibility

Automated tests cover name matching, numbers, DOM formatting, editor protection, virtualized-cell reuse, and restoration on unload. The original formatter's selectors and per-view header-offset mapping are retained. These selectors are internal Obsidian DOM details and may require adjustment after an Obsidian update.

Before the first release, test in Obsidian: renamed formula columns; two Bases with different display names; grouped tables; scrolling and column reordering; cell editing; pop-out windows; plugin unload; a theme other than the default; and mobile. Confirm that a value such as `1.23456` still sorts and calculates at full precision and that its note file stays unchanged.

See [release preparation](docs/releasing.md), [name availability](docs/name-check.md), [contributing](CONTRIBUTING.md), and [changelog](CHANGELOG.md).
