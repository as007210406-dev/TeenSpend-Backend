process.env.NODE_ENV = 'test';
const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');

describe('Budget Management & Calculation API Tests', () => {
  let userToken = '';
  const foodCatId = '11111111-1111-1111-1111-111111111101';

  before(async () => {
    const timestamp = Date.now();
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        full_name: 'Budget Tester',
        username: `budget_${timestamp}`,
        email: `budget_${timestamp}@example.com`,
        password: 'Password123!',
        confirmPassword: 'Password123!'
      });
    userToken = res.body.data.token;
  });

  it('should set an overall monthly budget and a category budget', async () => {
    // 1. Overall monthly budget
    const resOverall = await request(app)
      .post('/api/budgets')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        amount: 5000,
        period: 'monthly'
      });

    assert.equal(resOverall.status, 201);
    assert.equal(resOverall.body.success, true);

    // 2. Food category budget
    const resCat = await request(app)
      .post('/api/budgets')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        category_id: foodCatId,
        amount: 1500,
        period: 'monthly'
      });

    assert.equal(resCat.status, 201);
    assert.equal(resCat.body.success, true);
  });

  it('should calculate budget progress accurately after adding expenses', async () => {
    // Add an expense in food category
    await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        amount: 1200,
        category_id: foodCatId,
        description: 'Team Pizza Dinner'
      });

    const res = await request(app)
      .get('/api/budgets')
      .set('Authorization', `Bearer ${userToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.budgets.length >= 2);

    const foodBudget = res.body.data.budgets.find(b => b.category_id === foodCatId);
    assert.ok(foodBudget);
    assert.equal(foodBudget.spent, 1200);
    assert.equal(foodBudget.amount, 1500);
    assert.equal(foodBudget.percentUsed, 80);
    assert.equal(foodBudget.status, 'warning', 'At 80% it should trigger warning status');
  });
});
