export default {
  computed: {
    getExpenseById() {
      const expenseById = this.expenses.filter(expense => expense.id === this.expenseId)
      console.log("expenseById = ", expenseById);
      //the.expenses가 아직 fetch가 되지 않은 타이밍 이슈의 경우, this.expenseId가 삭제된 expense인 경우, 예외처리가 필요하다.
      if (expenseById.length != 0) {
        return this.expenses.find(expense => expense.id === this.expenseId)
      } else {
        return { category: "로딩중...", amount: 0, id: "" }
      }

    }
  },
};