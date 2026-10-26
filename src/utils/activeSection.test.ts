import test from 'node:test';
import assert from 'node:assert/strict';
import { findActiveSection } from './activeSection.ts';

test('a publication heading below the sticky header activates Publications', () => {
  assert.equal(findActiveSection([
    { id: 'experience', top: -900 }, { id: 'publications', top: 72 }, { id: 'training', top: 2200 },
  ], 96), 'publications');
});

test('a tall section stays active until the next heading reaches the header', () => {
  assert.equal(findActiveSection([
    { id: 'experience', top: -2400 }, { id: 'publications', top: -1000 }, { id: 'training', top: 180 },
  ], 96), 'publications');
  assert.equal(findActiveSection([
    { id: 'experience', top: -2500 }, { id: 'publications', top: -1100 }, { id: 'training', top: 80 },
  ], 96), 'training');
});

test('section positions control the highlight even if navigation order differs', () => {
  assert.equal(findActiveSection([
    { id: 'training', top: 900 }, { id: 'hero', top: -500 }, { id: 'projects', top: 50 },
  ], 96), 'projects');
});

test('short final sections activate at the page bottom and absent sections are safe', () => {
  assert.equal(findActiveSection([{ id: 'training', top: -400 }, { id: 'contact', top: 250 }], 96, true), 'contact');
  assert.equal(findActiveSection([], 96), undefined);
});
