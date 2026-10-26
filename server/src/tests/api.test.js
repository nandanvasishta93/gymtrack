const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const app = require('../index');

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test('GET /api/health should return status healthy', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.status, 'healthy');
});

test('GET /api/exercises should return list of exercises', async () => {
  const res = await fetch(`${baseUrl}/api/exercises`);
  assert.strictEqual(res.status, 200);
  const exercises = await res.json();
  assert.ok(Array.isArray(exercises));
  assert.ok(exercises.length > 0);
  assert.ok(exercises.some(e => e.name === 'Barbell Bench Press'));
});

test('GET /api/nutrition/foods should return Indian vegetarian items', async () => {
  const res = await fetch(`${baseUrl}/api/nutrition/foods`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data.foods));
  assert.ok(data.foods.some(f => f.name.includes('Soy Chunks')));
});

test('GET /api/workouts/today should return today workout structure', async () => {
  const res = await fetch(`${baseUrl}/api/workouts/today`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(data.dayNumber >= 1);
  assert.ok(data.todayDate);
});

test('GET /api/core/today should return today core routine structure', async () => {
  const res = await fetch(`${baseUrl}/api/core/today`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(data.routineName);
});
