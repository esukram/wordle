import { test } from 'node:test';
import assert from 'node:assert/strict';
import { score } from '../js/scoring.js';

test('all-correct when guess equals solution', () => {
  assert.deepEqual(score('crane', 'crane'), [
    'correct', 'correct', 'correct', 'correct', 'correct',
  ]);
});

test('all-absent when no letters are shared', () => {
  assert.deepEqual(score('fghij', 'abcde'), [
    'absent', 'absent', 'absent', 'absent', 'absent',
  ]);
});

test('PRD case: solution apple, guess paper', () => {
  assert.deepEqual(score('paper', 'apple'), [
    'present', 'present', 'correct', 'present', 'absent',
  ]);
});

test('PRD case: solution robot, guess oozes', () => {
  assert.deepEqual(score('oozes', 'robot'), [
    'present', 'correct', 'absent', 'absent', 'absent',
  ]);
});

test('correct-position match consumes before present elsewhere', () => {
  // solution abbey, guess bebop: b@0 present (one unmatched b left after b@2
  // consumes as correct), e@1 present, b@2 correct, o@3 absent, p@4 absent.
  assert.deepEqual(score('bebop', 'abbey'), [
    'present', 'present', 'correct', 'absent', 'absent',
  ]);
});
