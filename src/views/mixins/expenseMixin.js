export default {
  computed: {
    getExpenseById() {
      const expenseById = this.expenses.filter(expense => expense.id === this.expenseId)

      //the.expenses가 아직 fetch가 되지 않은 타이밍 이슈의 경우, this.expenseId가 삭제된 expense인 경우, 예외처리가 필요하다.
      if (expenseById.length != 0) {
        return this.expenses.filter(expense => expense.id === this.expenseId)
      } else {
        return [{ category: "로딩중..", amount: 0, id: "" }]
      }

    },
    theExpense() {
      return this.getExpenseById[0]
    }
  },
};