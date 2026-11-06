import { BasesView, RenderContext } from 'obsidian';

/** A general-purpose read-only Bases table. Values own their rendering. */
export class FlexibleTable extends BasesView {
  constructor(controller, containerEl) {
    super(controller);
    this.type = 'bases-formats-table';
    this.containerEl = containerEl;
  }

  onDataUpdated() {
    const root = this.containerEl;
    root.empty();
    const properties = this.config.getOrder();
    if (!properties.length) { root.createDiv({ text: 'Select properties to display.' }); return; }
    const widthSetting = this.config.get('columnWidth');
    const width = typeof widthSetting === 'number' && Number.isFinite(widthSetting)
      ? Math.max(100, Math.min(800, widthSetting)) : 280;
    const table = root.createEl('table', { cls: 'bases-formats-table' });
    table.style.width = `${width * properties.length}px`;
    const columns = table.createEl('colgroup');
    for (const _ of properties) columns.createEl('col').style.width = `${width}px`;
    const header = table.createEl('thead').createEl('tr');
    for (const property of properties) header.createEl('th', {
      text: this.config.getDisplayName(property), attr: { scope: 'col' },
    });
    const context = new RenderContext(this.app);
    for (const group of this.data.groupedData) {
      const body = table.createEl('tbody');
      if (group.hasKey()) body.createEl('tr', { cls: 'bases-formats-group' }).createEl('th', {
        text: group.key.toString(), attr: { colspan: String(properties.length), scope: 'rowgroup' },
      });
      for (const entry of group.entries) {
        const row = body.createEl('tr');
        for (const property of properties) {
          const cell = row.createEl('td', { attr: {
            'data-property': property, 'data-display-name': this.config.getDisplayName(property),
          } });
          try {
            // Keep native note-name navigation while delegating all other values.
            const value = entry.getValue(property === 'file.name' ? 'file.file' : property);
            value?.renderTo(cell, context);
          } catch (error) {
            cell.setText(error instanceof Error ? error.message : String(error));
          }
        }
      }
    }
  }
}
