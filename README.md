# Bases Formats

Display numeric amount columns in Obsidian Bases with exactly two decimal places, and optionally use a **Flexible table** with wrapping text and automatically growing rows. Stored properties, formula results, sorting, filters, and calculations keep their original precision.

**Development preview — not yet released or listed in Community plugins.** Requires Obsidian 1.15.0 or newer. Plugin ID: `bases-formats`. MIT licensed.

## Formatting

A column qualifies when either its property name or its display name:

- starts with `amount`;
- ends with `amount`; or
- contains `€` or `$`.

Matching ignores case, surrounding whitespace, and the `note.` / `formula.` prefix. For example, `amount_total`, `Baseline amount`, `Price €`, and `$ balance` qualify. A formula named `worth_baseline` with display name `Baseline amount` also qualifies.

The plugin changes a rendered numeric text node from `25` to `25.00`, or `1.23456` to `1.23`. It never writes note content, frontmatter, or Base definitions. It accepts plain signed decimal numbers, including comma decimals, and preserves the previous formatter's decimal-point display. Empty cells, nonnumeric strings, links, inputs, and ambiguous cells containing multiple numbers are left alone. This is a number formatter; it does not add a currency symbol or infer a currency.

Number formatting works in both the native table and Flexible table. No other community plugin or CodeScript Toolkit is required.

## Flexible table

Select **Flexible table** in the Bases view selector, or add a view to an existing Base:

```yaml
views:
  - type: bases-formats-table
    name: Flexible
    order:
      - file.name
      - note.description
      - note.amount
    columnWidth: 280
```

The view displays any selected properties and formula values through their own rendering hooks. It does not extract note content or interpret Markdown itself. If [Bases Excerpts](https://github.com/stallinger-dev/obsidian-bases-excerpts) is also enabled, its excerpt values render Markdown and source-relative links here just as they do in the native table. Flexible table adds automatic row height and full wrapping. The plugins are independent.

Configure columns, filters, sorting, grouping, and limits using Bases. Column width is adjustable in view settings (100–800 px, default 280). The table is read-only, while links remain clickable. Use a native table view of the same Base to edit properties. All returned rows are rendered, so set a Bases limit for large result sets.

The previous unreleased `bases-excerpts-table` view has moved out of Bases Excerpts. In any manually copied preview configuration, change its type to `bases-formats-table` and enable Bases Formats. No existing vault configuration is rewritten automatically.

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

Automated tests cover name matching, numbers, DOM formatting, editor protection, virtualized-cell reuse, restoration on unload, and generic table rendering without Bases Excerpts. The original formatter's selectors and per-view header-offset mapping are retained. These selectors are internal Obsidian DOM details and may require adjustment after an Obsidian update.

Before the first release, test in Obsidian: renamed formula columns; two Bases with different display names; grouped tables; scrolling and column reordering; cell editing; pop-out windows; plugin unload; a theme other than the default; and mobile. Confirm that a value such as `1.23456` still sorts and calculates at full precision and that its note file stays unchanged.

See [release preparation](docs/releasing.md), [name availability](docs/name-check.md), [contributing](CONTRIBUTING.md), and [changelog](CHANGELOG.md).
