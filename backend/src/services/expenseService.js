const expenseModel = require('../models/expenseModel');
const categoryModel = require('../models/categoryModel');

const expenseService = {
  async getExpenses(userId, filters) {
    const [result, categories] = await Promise.all([
      expenseModel.findAllByUser(userId, filters),
      categoryModel.findAllForUser(userId)
    ]);

    const catMap = new Map();
    categories.forEach(c => catMap.set(c.id, c));

    // Enrich expenses with category details
    const enrichedExpenses = result.expenses.map(exp => {
      const cat = catMap.get(exp.category_id) || {
        id: exp.category_id,
        name: 'Other',
        icon: 'MoreHorizontal',
        color: '#64748B'
      };
      return {
        ...exp,
        category: {
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
          color: cat.color
        }
      };
    });

    return {
      expenses: enrichedExpenses,
      pagination: {
        totalCount: result.totalCount,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      }
    };
  },

  async getExpenseById(id, userId) {
    const expense = await expenseModel.findById(id, userId);
    if (!expense) {
      const err = new Error('Expense not found or unauthorized');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }

    const category = await categoryModel.findById(expense.category_id);
    return {
      ...expense,
      category: category ? {
        id: category.id,
        name: category.name,
        icon: category.icon,
        color: category.color
      } : null
    };
  },

  async createExpense(userId, expenseData) {
    // Validate category exists
    const category = await categoryModel.findById(expenseData.category_id);
    if (!category) {
      const err = new Error('Invalid category selected');
      err.statusCode = 400;
      err.code = 'INVALID_CATEGORY';
      throw err;
    }

    const created = await expenseModel.create(userId, expenseData);
    return {
      ...created,
      category: {
        id: category.id,
        name: category.name,
        icon: category.icon,
        color: category.color
      }
    };
  },

  async updateExpense(id, userId, updates) {
    const existing = await expenseModel.findById(id, userId);
    if (!existing) {
      const err = new Error('Expense not found or unauthorized');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }

    if (updates.category_id) {
      const category = await categoryModel.findById(updates.category_id);
      if (!category) {
        const err = new Error('Invalid category selected');
        err.statusCode = 400;
        err.code = 'INVALID_CATEGORY';
        throw err;
      }
    }

    return expenseModel.update(id, userId, updates);
  },

  async deleteExpense(id, userId) {
    const existing = await expenseModel.findById(id, userId);
    if (!existing) {
      const err = new Error('Expense not found or unauthorized');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    return expenseModel.delete(id, userId);
  }
};

module.exports = expenseService;
