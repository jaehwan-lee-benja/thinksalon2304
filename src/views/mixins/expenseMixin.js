export default {
  computed: {
    getExpenseById() {
      if (this.expenses.length > 0) {
        return this.expenses.filter(expense => expense.id === this.expenseId)
      } else {
        return [{ category: "로딩중..", amount: 0, id: "" }]
      }
    },
    theExpense() {
      return this.getExpenseById[0]
    },
  },
};