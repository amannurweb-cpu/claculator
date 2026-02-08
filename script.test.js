const assert = require('node:assert/strict');
const {
  evaluateMathExpression,
  sanitizeExpression,
  formatResult,
} = require('./script.js');

assert.equal(sanitizeExpression('2+2;alert(1)'), '2+2(1)');
assert.equal(evaluateMathExpression('7+8'), 15);
assert.equal(evaluateMathExpression('2+3*4'), 14);
assert.equal(evaluateMathExpression('(2+3)*4'), 20);
assert.equal(evaluateMathExpression('10/4'), 2.5);
assert.equal(formatResult(1 / 3), '0.3333333333');
assert.equal(formatResult(Infinity), 'Error');

console.log('All calculator tests passed.');
