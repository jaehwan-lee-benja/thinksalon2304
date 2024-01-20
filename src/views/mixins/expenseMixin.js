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
    },
    formattedAmount: {
      get() {
        // 화면에 표시될 때는 컴마를 포함하여 반환
        return this.theExpenseById.amount.toLocaleString();
      },
      set(value) {
        // 사용자가 수정할 때는 숫자만 포함하여 저장
        console.log("value = ", value)
        const numericValue = parseFloat(value.replace(/,/g, ''));
        console.log("numericValue = ", numericValue);
        // 값이 유효한 숫자인 경우에만 저장
        if (!isNaN(numericValue)) {
          this.theExpenseById.amount = numericValue;
        }
      },
    },
  },
};