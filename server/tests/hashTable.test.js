import { describe, it, expect } from 'vitest';
import { createTable, insertMany, insert, search, update, remove, TOMBSTONE } from '../src/logic/hashTable.js';

// The worked example from the plan: 23, 43, 13, 27, 29, 39 into a 10-slot table.
const example = () => insertMany(createTable(10), [23, 43, 13, 27, 29, 39]).table;
const keys = (table) => table.slots.map((s) => (s === null ? null : s.tombstone ? 'X' : s.key));

describe('insert', () => {
  it('builds the worked example, including the wrap-around', () => {
    expect(keys(example())).toEqual([39, null, null, 23, 43, 13, null, 27, null, 29]);
  });

  it('records a wrap step when probing past the last slot', () => {
    const t = insertMany(createTable(10), [29]).table;
    const r = insert(t, 39);
    expect(r.steps.map((s) => s.type)).toEqual(['hash', 'occupied', 'wrap', 'empty', 'placed']);
  });

  it('rejects duplicates without changing the table', () => {
    const r = insert(example(), 43);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('duplicate');
  });

  it('reports a full table', () => {
    const t = insertMany(createTable(3), [0, 1, 2]).table;
    const r = insert(t, 5);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('full');
  });

  it('does not change the table it was given', () => {
    const t = createTable(10);
    insert(t, 5);
    expect(t.slots.every((s) => s === null)).toBe(true);
  });
});

describe('search', () => {
  it('finds 23 in slot 3 with 1 check', () => {
    expect(search(example(), 23)).toMatchObject({ found: true, slot: 3, checks: 1 });
  });

  it('finds 13 in slot 5 with 3 checks', () => {
    expect(search(example(), 13)).toMatchObject({ found: true, slot: 5, checks: 3 });
  });

  it('finds 39 in slot 0 after wrapping around', () => {
    const r = search(example(), 39);
    expect(r).toMatchObject({ found: true, slot: 0, checks: 2 });
    expect(r.steps.some((s) => s.type === 'wrap')).toBe(true);
  });

  it('stops at the empty slot 6 when 33 is not there', () => {
    const r = search(example(), 33);
    expect(r).toMatchObject({ found: false, checks: 4 });
    expect(r.steps.at(-2)).toMatchObject({ type: 'empty', slot: 6 });
    expect(r.steps.at(-1).type).toBe('not_found');
  });

  it('checks every slot of a full table before giving up', () => {
    const t = insertMany(createTable(3), [0, 1, 2]).table;
    expect(search(t, 5)).toMatchObject({ found: false, checks: 3 });
  });
});

describe('update', () => {
  it('changes the value stored for an existing key', () => {
    const r = update(example(), 43, 'Thandi');
    expect(r.ok).toBe(true);
    expect(search(r.table, 43).value).toBe('Thandi');
  });

  it('reports a missing key', () => {
    expect(update(example(), 33, 'x')).toMatchObject({ ok: false, reason: 'not_found' });
  });
});

describe('delete with tombstones', () => {
  it('leaves a tombstone, not an empty slot', () => {
    const r = remove(example(), 43);
    expect(r.table.slots[4]).toEqual(TOMBSTONE);
  });

  it('still finds 13 after deleting 43 (the key misconception)', () => {
    const t = remove(example(), 43).table;
    const r = search(t, 13);
    expect(r).toMatchObject({ found: true, slot: 5 });
    expect(r.steps.some((s) => s.type === 'tombstone' && s.slot === 4)).toBe(true);
  });

  it('reuses the tombstone for a later insert', () => {
    const t = remove(example(), 43).table;
    expect(insert(t, 53)).toMatchObject({ ok: true, slot: 4 });
  });

  it('does not insert a duplicate that sits beyond a tombstone', () => {
    const t = remove(example(), 43).table;
    expect(insert(t, 13)).toMatchObject({ ok: false, reason: 'duplicate' });
  });

  it('reports a missing key', () => {
    expect(remove(example(), 33)).toMatchObject({ ok: false, reason: 'not_found' });
  });
});