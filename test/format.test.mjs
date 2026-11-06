import test from 'node:test';
import assert from 'node:assert/strict';
import { isAmountProperty, parseNumber } from '../src/format.mjs';

test('matches stored names and per-Base display names using the previous rules', () => {
  for (const name of ['amount', 'amount_total', 'note.AMOUNT_due', 'formula.total_amount', 'Baseline amount', 'Price €', '$ balance', ' € ']) assert.equal(isAmountProperty(name), true, name);
  assert.equal(isAmountProperty('formula.worth_baseline', 'Baseline amount'), true);
  for (const name of ['discount', 'some_amount_other', 'Price EUR', 'account', '']) assert.equal(isAmountProperty(name), false, name);
});
test('parses only unambiguous finite decimal numbers', () => {
  for (const [input, expected] of [['25',25],[' -1.23456 ',-1.23456],['1,25',1.25],['1\u00a0234.50',1234.5],['0',0]]) assert.equal(parseNumber(input),expected);
  for (const input of ['', ' ', '€ 2', '1,234.56', 'NaN', 'Infinity', '1e3', '1 234', '25 apples', '9'.repeat(400)]) assert.equal(parseNumber(input),null,input);
});
