import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { parseHTML } from 'linkedom';

function fixture() {
  const {document,window}=parseHTML('<html><body><div class="bases-view"></div></body></html>');
  const proto=window.HTMLElement.prototype;
  proto.createEl=function(tag,options={}){const el=document.createElement(tag);if(options.cls)el.className=options.cls;if(options.text!==undefined)el.textContent=options.text;for(const[k,v]of Object.entries(options.attr??{}))el.setAttribute(k,v);this.appendChild(el);return el;};
  proto.createDiv=function(options){return this.createEl('div',options);};proto.empty=function(){this.replaceChildren();};proto.setText=function(text){this.textContent=text;};
  const app={workspace:{on:()=>({}),onLayoutReady:()=>{} }};
  class Plugin {constructor(){this.app=app;}registerEvent(){}registerBasesView(id,registration){this.registration={id,...registration};return true;}}
  class BasesView {constructor(controller){this.app=controller.app;}}
  const module={exports:{}};
  vm.runInNewContext(fs.readFileSync(new URL('../dist/main.js',import.meta.url),'utf8'),{module,exports:module.exports,require:()=>({Plugin,BasesView,RenderContext:class{constructor(app){this.app=app;}}}),document,window});
  const plugin=new module.exports.default();plugin.observeDocument=()=>{};plugin.onload();
  const view=plugin.registration.factory({app},document.querySelector('.bases-view'));
  return {plugin,view,document,app};
}
const text=data=>({renderTo(el){el.textContent=data;}});

test('Formats registers a generic table and delegates arbitrary rich values without Excerpts', () => {
  const f=fixture();assert.equal(f.plugin.registration.id,'bases-formats-table');assert.equal(f.plugin.registration.name,'Flexible table');
  const requested=[];let context;
  const link={renderTo(el,ctx){context=ctx;el.createEl('a',{text:'Note',attr:{href:'Note.md'}});}};
  f.view.config={get:()=>180,getOrder:()=>['file.name','note.description','formula.custom'],getDisplayName:p=>'Label '+p};
  f.view.data={groupedData:[{hasKey:()=>false,entries:[{getValue(p){requested.push(p);return p==='formula.custom'||p==='file.file'?link:text('Long ordinary property');}}]}]};
  f.view.onDataUpdated();
  assert.deepEqual(requested,['file.file','note.description','formula.custom']);assert.equal(context.app,f.app);
  assert.equal(f.document.querySelectorAll('a').length,2);assert.equal(f.document.querySelector('col').style.width,'180px');
  assert.equal(f.document.querySelector('td[data-property="note.description"]').textContent,'Long ordinary property');
  f.view.onDataUpdated();assert.equal(f.document.querySelectorAll('table').length,1);
});
test('group headings, empty values and formula errors render with the selected columns', () => {
  const f=fixture();f.view.config={get:()=>NaN,getOrder:()=>['note.empty','formula.error'],getDisplayName:p=>p};
  f.view.data={groupedData:[{hasKey:()=>true,key:{toString:()=> 'Group A'},entries:[{getValue(p){if(p==='formula.error')throw 'Formula failed';return null;}}]}]};
  f.view.onDataUpdated();assert.equal(f.document.querySelector('col').style.width,'280px');
  assert.equal(f.document.querySelector('tbody th').textContent,'Group A');assert.equal(f.document.querySelector('tbody th').getAttribute('colspan'),'2');
  assert.equal(f.document.querySelectorAll('td')[0].textContent,'');assert.equal(f.document.querySelectorAll('td')[1].textContent,'Formula failed');
});
