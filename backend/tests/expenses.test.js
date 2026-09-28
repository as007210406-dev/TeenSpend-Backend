process.env.NODE_ENV = 'test';
const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');

describe('Expense Management & Isolation API Tests', () => {
  let user1Token = '';
  let user2Token = '';
  let defaultCategoryId = '11111111-1111-1111-1111-111111111101'; // Food
  let createdExpenseId = '';

  before(async () => {
    const timestamp = Date.now();
    // Register User 1
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({
        full_name: 'Exp User One',
        username: `exp_u1_${timestamp}`,
        email: `exp_u1_${timestamp}@example.com`,
        password: 'Password123!',
        confirmPassword: 'Password123!'
      });
    user1Token = res1.body.data.token;

    // Register User 2
    const res2 = await request(app)
      .post('/api/auth/register')
      .send({
        full_name: 'Exp User Two',
        username: `exp_u2_${timestamp}`,
        email: `exp_u2_${timestamp}@example.com`,
        password: 'Password123!',
        confirmPassword: 'Password123!'
      });
    user2Token = res2.body.data.token;
  });

  it('should validate expense creation fields (negative amount rejected)', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        amount: -50,
        category_id: defaultCategoryId,
        description: 'Negative expense'
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  });

  it('should successfully create an expense for authenticated user', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        amount: 250.75,
        category_id: defaultCategoryId,
        description: 'College Cafeteria Lunch',
        expense_date: '2026-09-20',
        payment_method: 'UPI',
        is_recurring: false
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.expense.amount, 250.75);
    assert.equal(res.body.data.expense.description, 'College Cafeteria Lunch');
    assert.ok(res.body.data.expense.id);
    assert.ok(res.body.data.expense.category);

    createdExpenseId = res.body.data.expense.id;
  });

  it('should list expenses for user 1 including the created expense', async () => {
    const res = await request(app)
      .get('/api/expenses')
      .set('Authorization', `Bearer ${user1Token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.expenses));
    assert.ok(res.body.data.expenses.some(e => e.id === createdExpenseId));
  });

  it('CRITICAL: User 2 must NOT be able to view User 1 expense by ID (strict isolation)', async () => {
    const res = await request(app)
      .get(`/api/expenses/${createdExpenseId}`)
      .set('Authorization', `Bearer ${user2Token}`);

    assert.equal(res.status, 404, 'Must return 404 Not Found to prevent data probing across users');
    assert.equal(res.body.success, false);
  });

  it('CRITICAL: User 2 must NOT see User 1 expense in list', async () => {
    const res = await request(app)
      .get('/api/expenses')
      .set('Authorization', `Bearer ${user2Token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(!res.body.data.expenses.some(e => e.id === createdExpenseId));
  });

  it('should update an expense successfully for the owner', async () => {
    const res = await request(app)
      .put(`/api/expenses/${createdExpenseId}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        amount: 300.00,
        description: 'College Cafeteria Lunch with Drink'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.expense.amount, 300.00);
    assert.equal(res.body.data.expense.description, 'College Cafeteria Lunch with Drink');
  });

  it('CRITICAL: User 2 must NOT be able to delete User 1 expense', async () => {
    const res = await request(app)
      .delete(`/api/expenses/${createdExpenseId}`)
      .set('Authorization', `Bearer ${user2Token}`);

    assert.equal(res.status, 404);
  });

  it('should delete expense successfully by the owner', async () => {
    const res = await request(app)
      .delete(`/api/expenses/${createdExpenseId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    // Verify it is gone
    const verifyRes = await request(app)
      .get(`/api/expenses/${createdExpenseId}`)
      .set('Authorization', `Bearer ${user1Token}`);
    assert.equal(verifyRes.status, 404);
  });
});
