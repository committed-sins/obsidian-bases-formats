import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { parseHTML } from 'linkedom';

function fixture(html) {
  const {document, window} = parseHTML('<html><body>'+html+'</body></html>');
  window.NodeFilter = {SHOW_TEXT:4};
  const module = {exports:{}};
  vm.runInNewContext(fs.readFileSync(new URL('../dist/main.js',import.meta.url),'utf8'), {
    module, exports:module.exports, require: () => ({Plugin:class {}}), document, window,
  });
  const plugin = new module.exports.default();
  const state = {originals:new Map()};
  return {plugin,state,document,run:()=>plugin.formatDocument(document,state)};
}
const table = (property, value, name='') => `<div class="bases-view"><div class="bases-thead"><div class="bases-td" style="inset-inline-start:10px"><span class="bases-table-header-name">${name}</span></div></div><div class="bases-td" data-property="${property}" style="inset-inline-start:10px"><span>${value}</span></div></div>`;

test('formats once, preserves original precision and restores on a renamed column', () => {
  const f=fixture(table('formula.worth','1.23456','Baseline amount'));
  f.run(); f.run();
  const cell=f.document.querySelector('[data-property]');
  assert.equal(cell.textContent,'1.23');
  assert.equal([...f.state.originals.values()][0].original,'1.23456');
  f.document.querySelector('.bases-table-header-name').textContent='Worth'; f.run();
  assert.equal(cell.textContent,'1.23456');
});
test('display names are scoped to each Base and empty cells stay empty', () => {
  const f=fixture(table('formula.worth','25','Baseline amount')+table('formula.worth','25','Worth')+table('amount',''));
  f.run(); assert.deepEqual([...f.document.querySelectorAll('[data-property]')].map(e=>e.textContent),['25.00','25','']);
});
test('protects editors, links, mixed numbers, and handles a virtualized cell receiving new data', () => {
  const f=fixture(table('amount','<input value="12">12')+table('amount','<a>12</a>')+table('amount','<span>12</span><span>13</span>')+table('amount','12'));
  f.run(); const cells=[...f.document.querySelectorAll('[data-property]')];
  assert.equal(cells[0].textContent,'12'); assert.equal(cells[1].textContent,'12');assert.equal(cells[2].textContent,'1213');assert.equal(cells[3].textContent,'12.00');
  cells[3].firstElementChild.textContent='8.7654'; f.run(); assert.equal(cells[3].textContent,'8.77');
  cells[3].dataset.property='other'; f.run(); assert.equal(cells[3].textContent,'8.7654');
});
test('supports the optional Excerpts table and restores text on unload', () => {
  const f=fixture('<table class="bases-excerpts-table"><tr><td data-property="formula.x" data-display-name="Price €">4.567</td></tr></table>');f.run();
  const cell=f.document.querySelector('td'); assert.equal(cell.textContent,'4.57');
  f.state.observer={disconnect(){}}; f.state.timer=null;
  f.plugin.documents=new Map([[f.document,f.state]]); f.plugin.onunload();
  assert.equal(cell.textContent,'4.567');assert.equal(f.plugin.documents.size,0);
});
