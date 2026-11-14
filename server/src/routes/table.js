// Hash table endpoints. Stateless: the client sends the current table and
// gets back the new table plus the steps to animate. No database needed.
import { Router } from 'express';
import { createTable, insertMany, search, update, remove } from '../logic/hashTable.js';
import { checkKey, checkSize, checkTable } from '../validation.js';

const router = Router();
const bad = (res, message) => res.status(400).json({ error: message });

// POST /api/table/insert  { keys: [23, 43], size?: 10, table?: {...} }
router.post('/insert', (req, res) => {
  const { keys, size, table } = req.body;
  if (!Array.isArray(keys) || keys.length === 0) return bad(res, 'keys must be a non-empty array');
  for (const key of keys) {
    const err = checkKey(key);
    if (err) return bad(res, err);
  }
  let start;
  if (table) {
    const err = checkTable(table);
    if (err) return bad(res, err);
    start = table;
  } else {
    const s = size ?? 10;
    const err = checkSize(s);
    if (err) return bad(res, err);
    start = createTable(s);
  }
  res.json(insertMany(start, keys));
});

// POST /api/table/search  { table, key }
router.post('/search', (req, res) => {
  const { table, key } = req.body;
  const err = checkTable(table) || checkKey(key);
  if (err) return bad(res, err);
  res.json(search(table, key));
});

// POST /api/table/update  { table, key, value }
router.post('/update', (req, res) => {
  const { table, key, value } = req.body;
  const err = checkTable(table) || checkKey(key);
  if (err) return bad(res, err);
  res.json(update(table, key, value ?? null));
});

// POST /api/table/delete  { table, key }
router.post('/delete', (req, res) => {
  const { table, key } = req.body;
  const err = checkTable(table) || checkKey(key);
  if (err) return bad(res, err);
  res.json(remove(table, key));
});

export default router;