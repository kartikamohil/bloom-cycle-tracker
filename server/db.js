const pool = require('./postgres');

// ---------------- USERS ----------------

const USER_SELECT = `
  SELECT
    id,
    name,
    email,
    password_hash AS "passwordHash",
    avg_cycle_length AS "avgCycleLength",
    avg_period_length AS "avgPeriodLength",
    last_period_start AS "lastPeriodStart",
    circle_code AS "circleCode",
    companions
  FROM users`;

async function findUserByEmail(email) {
  const result = await pool.query(
    `${USER_SELECT}
     WHERE LOWER(email) = LOWER($1)
     LIMIT 1`,
    [email]
  );

  return result.rows[0] || null;
}

async function getUser(id) {
  const result = await pool.query(
    `${USER_SELECT}
     WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

async function createUser(user) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(
      `INSERT INTO users
       (id, name, email, password_hash,
        avg_cycle_length, avg_period_length,
        last_period_start, circle_code, companions, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        user.id,
        user.name,
        user.email,
        user.passwordHash,
        user.avgCycleLength || null,
        user.avgPeriodLength || null,
        user.lastPeriodStart || null,
        user.circleCode,
        user.companions || [],
        user.createdAt || new Date()
      ]
    );

    if (user.circleCode) {
      await client.query(
        `INSERT INTO circles (owner_id, circle_code)
         VALUES ($1, $2)
         ON CONFLICT (circle_code) DO NOTHING`,
        [user.id, user.circleCode]
      );
    }

    await client.query('COMMIT');

    return getUser(user.id);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function updateUser(id, patch) {
  const allowedFields = {
    name: 'name',
    avgCycleLength: 'avg_cycle_length',
    avgPeriodLength: 'avg_period_length',
    lastPeriodStart: 'last_period_start',
    circleCode: 'circle_code',
    companions: 'companions'
  };

  const updates = [];
  const values = [];
  let index = 1;

  for (const [key, value] of Object.entries(patch)) {
    if (allowedFields[key]) {
      updates.push(`${allowedFields[key]} = $${index}`);
      values.push(value);
      index++;
    }
  }

  if (updates.length === 0) {
    return getUser(id);
  }

  values.push(id);

  const result = await pool.query(
    `UPDATE users
     SET ${updates.join(', ')}
     WHERE id = $${index}
     RETURNING id, name, email, password_hash AS "passwordHash",
               avg_cycle_length AS "avgCycleLength",
               avg_period_length AS "avgPeriodLength",
               last_period_start AS "lastPeriodStart",
               circle_code AS "circleCode",
               companions`,
    values
  );

  return result.rows[0] || null;
}


// ---------------- CYCLE ENTRIES ----------------

async function getEntries(userId) {
  const result = await pool.query(
    `SELECT
       entry_date,
       flow,
       symptoms,
       note_enc
     FROM cycle_entries
     WHERE user_id = $1
     ORDER BY entry_date`,
    [userId]
  );

  const entries = {};

  for (const row of result.rows) {
    const date =
      row.entry_date instanceof Date
        ? row.entry_date.toISOString().slice(0, 10)
        : String(row.entry_date).slice(0, 10);

    entries[date] = {
      flow: row.flow,
      symptoms: row.symptoms || [],
      noteEnc: row.note_enc
    };
  }

  return entries;
}

async function upsertEntry(userId, dateStr, entry) {
  const result = await pool.query(
    `INSERT INTO cycle_entries
       (user_id, entry_date, flow, symptoms, note_enc)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id, entry_date)
     DO UPDATE SET
       flow = EXCLUDED.flow,
       symptoms = EXCLUDED.symptoms,
       note_enc = EXCLUDED.note_enc,
       updated_at = NOW()
     RETURNING entry_date, flow, symptoms, note_enc`,
    [
      userId,
      dateStr,
      entry.flow || null,
      entry.symptoms || [],
      entry.noteEnc || null
    ]
  );

  const row = result.rows[0];

  return {
    flow: row.flow,
    symptoms: row.symptoms || [],
    noteEnc: row.note_enc
  };
}


// ---------------- CIRCLES ----------------

async function ownerOfCircleCode(code) {
  const result = await pool.query(
    `SELECT owner_id
     FROM circles
     WHERE circle_code = $1`,
    [code]
  );

  return result.rows[0]?.owner_id || null;
}

async function followCircle(userId, code) {
  const client = await pool.connect();

  try {
    const circleResult = await client.query(
      `SELECT id
       FROM circles
       WHERE circle_code = $1`,
      [code]
    );

    if (circleResult.rows.length === 0) {
      return [];
    }

    const circleId = circleResult.rows[0].id;

    await client.query(
      `INSERT INTO circle_followers
       (user_id, circle_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, circle_id) DO NOTHING`,
      [userId, circleId]
    );

    const result = await client.query(
      `SELECT c.circle_code
       FROM circle_followers cf
       JOIN circles c ON c.id = cf.circle_id
       WHERE cf.user_id = $1`,
      [userId]
    );

    return result.rows.map(row => row.circle_code);
  } finally {
    client.release();
  }
}

async function getFollowedCodes(userId) {
  const result = await pool.query(
    `SELECT c.circle_code
     FROM circle_followers cf
     JOIN circles c ON c.id = cf.circle_id
     WHERE cf.user_id = $1`,
    [userId]
  );

  return result.rows.map(row => row.circle_code);
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