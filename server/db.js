// server/db.js
//
// A small embedded, file-backed database. It keeps the whole dataset in
// memory and writes it to disk on every mutation, which is a completely
// reasonable approach for a single-instance app with a modest number of
// users. The read/write surface below (getUser, createEntry, etc.) is the
// only thing the rest of the app talks to, so swapping this file out for a
// real Postgres/MySQL/SQLite-backed module later does not require touching
// any route code.

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'bloom.json');

function emptyDB() {
  return {
    users: {},        // id -> { id, name, email, passwordHash, avgCycleLength, avgPeriodLength, circleCode, createdAt }
    entries: {},       // userId -> { 'YYYY-MM-DD': { flow, symptoms: [..], noteEnc } }
    connections: {},   // circleCode -> { ownerId }
    followers: {}      // userId -> [ circleCode, circleCode, ... ] codes this user follows
  };
}

let cache = null;

function load() {
  if (cache) return cache;
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    cache = emptyDB();
    persist();
    return cache;
  }
  try {
    cache = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {
    console.error('Failed to read database file, starting fresh:', e.message);
    cache = emptyDB();
  }
  return cache;
}

function persist() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(cache, null, 2), 'utf8');
}

// ---- users ----
function findUserByEmail(email) {
  const db = load();
  return Object.values(db.users).find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

function getUser(id) {
  const db = load();
  return db.users[id] || null;
}

function createUser(user) {
  const db = load();
  db.users[user.id] = user;
  db.entries[user.id] = {};
  db.connections[user.circleCode] = { ownerId: user.id };
  db.followers[user.id] = [];
  persist();
  return user;
}

function updateUser(id, patch) {
  const db = load();
  if (!db.users[id]) return null;
  db.users[id] = { ...db.users[id], ...patch };
  persist();
  return db.users[id];
}

// ---- cycle entries ----
function getEntries(userId) {
  const db = load();
  return db.entries[userId] || {};
}

function upsertEntry(userId, dateStr, entry) {
  const db = load();
  if (!db.entries[userId]) db.entries[userId] = {};
  db.entries[userId][dateStr] = entry;
  persist();
  return db.entries[userId][dateStr];
}

// ---- circle / sharing ----
function ownerOfCircleCode(code) {
  const db = load();
  const conn = db.connections[code];
  return conn ? conn.ownerId : null;
}

function followCircle(userId, code) {
  const db = load();
  if (!db.followers[userId]) db.followers[userId] = [];
  if (!db.followers[userId].includes(code)) db.followers[userId].push(code);
  persist();
  return db.followers[userId];
}

function getFollowedCodes(userId) {
  const db = load();
  return db.followers[userId] || [];
}

module.exports = {
  findUserByEmail,
  getUser,
  createUser,
  updateUser,
  getEntries,
  upsertEntry,
  ownerOfCircleCode,
  followCircle,
  getFollowedCodes
};
