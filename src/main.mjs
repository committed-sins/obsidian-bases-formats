import { Plugin } from 'obsidian';
import { isAmountProperty, parseNumber } from './format.mjs';

const CELL = '.bases-td[data-property], .bases-excerpts-table td[data-property]';

export default class BasesFormats extends Plugin {
  onload() {
    this.documents = new Map();
    this.active = true;
    this.observeDocument(document);
    this.registerEvent(this.app.workspace.on('window-open', (_workspaceWindow, win) => this.observeDocument(win.document)));
    this.registerEvent(this.app.workspace.on('window-close', (_workspaceWindow, win) => this.stopDocument(win.document)));
    this.app.workspace.onLayoutReady(() => {
      if (!this.active) return;
      this.app.workspace.iterateAllLeaves(leaf => this.observeDocument(leaf.view.containerEl.ownerDocument));
    });
  }

  observeDocument(doc) {
    if (!this.active || this.documents.has(doc)) return;
    const state = { originals: new Map(), timer: null, observer: null };
    const win = doc.defaultView;
    const queue = () => {
      if (state.timer !== null) return;
      state.timer = win.setTimeout(() => {
        state.timer = null;
        this.formatDocument(doc, state);
      }, 0);
    };
    state.observer = new win.MutationObserver(queue);
    state.observer.observe(doc.body, {
      childList: true, subtree: true, characterData: true, attributes: true,
      attributeFilter: ['data-property', 'style', 'contenteditable'],
    });
    this.documents.set(doc, state);
    queue();
  }

  formatDocument(doc, state) {
    const namesByView = new Map();
    const retained = new Set();
    for (const cell of doc.querySelectorAll(CELL)) {
      const view = cell.closest('.bases-view') ?? cell.closest('.bases-excerpts-table');
      if (!view || cell.closest('.bases-thead')) continue;
      if (!namesByView.has(view)) {
        const names = new Map();
        for (const header of view.querySelectorAll('.bases-thead .bases-td')) {
          const offset = header.style.insetInlineStart;
          if (offset) names.set(offset, header.querySelector('.bases-table-header-name')?.textContent ?? '');
        }
        namesByView.set(view, names);
      }
      const name = cell.getAttribute('data-display-name') ?? namesByView.get(view).get(cell.style.insetInlineStart) ?? '';
      if (!isAmountProperty(cell.dataset.property ?? '', name)) continue;
      if (cell.querySelector('input, textarea, [contenteditable="true"], a, .internal-link') || cell.closest('[contenteditable="true"]')) continue;
      const walker = doc.createTreeWalker(cell, doc.defaultView.NodeFilter.SHOW_TEXT);
      const candidates = [];
      let node;
      while ((node = walker.nextNode())) if (parseNumber(node.nodeValue) !== null) candidates.push(node);
      if (candidates.length !== 1) continue;
      node = candidates[0];
      const prior = state.originals.get(node);
      const original = prior && node.nodeValue === prior.formatted ? prior.original : node.nodeValue;
      const formatted = original.replace(original.trim(), parseNumber(original).toFixed(2));
      state.originals.set(node, { original, formatted });
      retained.add(node);
      if (node.nodeValue !== formatted) node.nodeValue = formatted;
    }
    for (const [node, prior] of state.originals) {
      if (retained.has(node)) continue;
      if (node.isConnected && node.nodeValue === prior.formatted) node.nodeValue = prior.original;
      state.originals.delete(node);
    }
  }

  stopDocument(doc) {
    const state = this.documents.get(doc);
    if (!state) return;
    state.observer.disconnect();
    if (state.timer !== null) doc.defaultView.clearTimeout(state.timer);
    for (const [node, prior] of state.originals) {
      if (node.isConnected && node.nodeValue === prior.formatted) node.nodeValue = prior.original;
    }
    this.documents.delete(doc);
  }

  onunload() {
    this.active = false;
    for (const doc of this.documents.keys()) this.stopDocument(doc);
  }
}
