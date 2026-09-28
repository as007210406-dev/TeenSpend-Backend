process.env.NODE_ENV = 'test';
const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');

describe('Analytics Calculations API Tests', () => {
  let userToken = '';
  const foodCatId = '11111111-1111-1111-1111-111111111101';

  before(async () => {
    const timestamp = Date.now();
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        full_name: 'Analytics Teen',
        username: `analytics_${timestamp}`,
        email: `analytics_${timestamp}@example.com`,
        password: 'Password123!',
        confirmPassword: 'Password123!'
      });
    userToken = res.body.data.token;

    // Add Income 5000
    await request(app)
      .post('/api/income')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ source: 'Weekly Allowance', amount: 5000 });

    // Add Expense 1500
    await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ amount: 1500, category_id: foodCatId, description: 'Groceries' });

    // Set Overall Budget 4000
    await request(app)
      .post('/api/budgets')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ amount: 4000, period: 'monthly' });
  });

  it('should return financial summary with accurate calculations', async () => {
    const res = await request(app)
      .get('/api/analytics/summary')
      .set('Authorization', `Bearer ${userToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    const summary = res.body.data.summary;

    assert.equal(summary.totalIncome, 5000);
    assert.equal(summary.totalExpenses, 1500);
    assert.equal(summary.moneySaved, 3500);
    assert.equal(summary.savingsRate, 70); // (3500 / 5000) * 100 = 70%
    assert.equal(summary.remainingBudget, 2500); // 4000 - 1500 = 2500
  });

  it('should return category analytics breakdown', async () => {
    const res = await request(app)
      .get('/api/analytics/categories')
      .set('Authorization', `Bearer ${userToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.breakdown));
    assert.ok(res.body.data.breakdown.length > 0);
    assert.equal(res.body.data.breakdown[0].total, 1500);
  });

  it('should return deep metrics including daily averages and highest spending category', async () => {
    const res = await request(app)
      .get('/api/analytics/metrics')
      .set('Authorization', `Bearer ${userToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    const metrics = res.body.data.metrics;
    assert.equal(metrics.totalSpending, 1500);
    assert.ok(metrics.averageDailySpending >= 0);
    assert.ok(metrics.highestSpendingCategory);
    assert.equal(metrics.numberOfTransactions, 1);
  });
});
