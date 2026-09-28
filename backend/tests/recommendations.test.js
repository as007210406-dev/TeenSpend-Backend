process.env.NODE_ENV = 'test';
const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');

describe('Deterministic Spending Recommendation Engine Tests', () => {
  let userToken = '';
  const entertainmentCatId = '11111111-1111-1111-1111-111111111104'; // Entertainment
  const foodCatId = '11111111-1111-1111-1111-111111111101'; // Food
  const transportCatId = '11111111-1111-1111-1111-111111111103'; // Transport
  const schoolCatId = '11111111-1111-1111-1111-111111111107'; // School

  before(async () => {
    const timestamp = Date.now();
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        full_name: 'Scenario Teen',
        username: `scen_${timestamp}`,
        email: `scen_${timestamp}@example.com`,
        password: 'Password123!',
        confirmPassword: 'Password123!'
      });
    userToken = res.body.data.token;

    // Add Income: ₹10,000
    await request(app)
      .post('/api/income')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        source: 'Monthly Allowance + Internship',
        amount: 10000
      });

    // Add Expenses matching Section 55 specification:
    // Food = 3,000
    await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ amount: 3000, category_id: foodCatId, description: 'Food & Dining' });

    // Entertainment = 3,000 (37.5% of total expenses > 20% threshold)
    await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ amount: 3000, category_id: entertainmentCatId, description: 'Gaming & Cinema' });

    // Transport = 1,000
    await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ amount: 1000, category_id: transportCatId, description: 'Train & Bus' });

    // School = 500
    await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ amount: 500, category_id: schoolCatId, description: 'Stationery' });

    // Set a budget of 2000 for Entertainment to test Rule 3 (Budget Exceeded: 3000 > 2000)
    await request(app)
      .post('/api/budgets')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        category_id: entertainmentCatId,
        amount: 2000,
        period: 'monthly'
      });
  });

  it('should evaluate deterministic rules and flag high entertainment spending and budget exceeded', async () => {
    const res = await request(app)
      .get('/api/recommendations')
      .set('Authorization', `Bearer ${userToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.recommendations));
    assert.ok(Array.isArray(res.body.data.insights));

    const recs = res.body.data.recommendations;

    // Check Rule 1: Entertainment > 20%
    const entertainmentRec = recs.find(r => r.id === 'rec-entertainment-high');
    assert.ok(entertainmentRec, 'Must recommend limit when entertainment spending exceeds 20%');
    assert.equal(entertainmentRec.type, 'warning');

    // Check Rule 3: Budget exceeded for entertainment (spent 3000 vs 2000 budget)
    const budgetExceededRec = recs.find(r => r.id.startsWith('rec-budget-exceeded'));
    assert.ok(budgetExceededRec, 'Must alert when a category budget has been exceeded');
    assert.equal(budgetExceededRec.type, 'danger');

    // Verify dynamic smart insights
    const insights = res.body.data.insights;
    assert.ok(insights.length >= 2, 'Should provide multiple dynamic insights');
  });
});
