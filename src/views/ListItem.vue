<template>
    <div :class="listViewLiDiv">
        <input :class="categoryStyle" v-model="getExpenseById[0].category">
        <span> : </span>
        <input :class="amountStyle" v-model="getExpenseById[0].amount">
    </div>
    <span> *하위 합계 : </span>
    <input :class="amountStyle" :value="sumExpenses(getExpenseById[0].id)" readonly>
</template>

<script>

export default {
    name: 'ListItem',
    props: {
        expenseId: {
            type: String,
            default: '',
        },
        expenses: {
            type: Object,
            default: () => {}
        },
    }, 
    data() {
        return {
            listViewLiDiv: 'listViewLiDiv',
            categoryStyle: 'categoryStyle',
            amountStyle: 'amountStyle',
        }
    },
    computed: {
        getExpenseById() {
            const sorted = this.expenses.filter(expense => expense.id === this.expenseId)
            // console.log("sorted = ", sorted)
            return sorted
        }
    },
    methods: {
        // test() {
        //     console.log("expenses = ", this.expenses)
        //     console.log("expenseId = ", this.expenseId)
        // },
        sumExpenses(parentsIdHere) {
            const sum = this.expenses.filter(e => e.parents_id === parentsIdHere)
                .reduce((acc, item) => acc + Number(item.amount), 0);
            return sum
        },
        removeExpense(expense) {
            const confirmValue = confirm("내용을 삭제하시겠습니까? 삭제 후, '저장'버튼을 눌러야 삭제가 완료됩니다.")

            if (confirmValue) {

                const thisExpenses = this.expenses
                const parentsId = expense.parents_id;
                const orderRemoved = expense.order;

                thisExpenses.forEach(e => {
                    const order = e.order;
                    if (e.parents_id == parentsId) {
                        if (order > orderRemoved) {
                            thisExpenses[this.expenses.indexOf(e)].order = order - 1;
                        }
                    }
                });

                // this.expenses 이 파일에서 양방향 변화를 주기 어려운것으로 추측
                this.expenses = thisExpenses.filter((t) => t !== expense)

                // 하위 레벨 지우기 -- 위 에러 확인후 진행하기
                // if (expense.level == 2) {
                //     this.expenses = this.expenses.filter((t) => t.parents_id !== expense.id)
                // }

            }
        },
    },
    mounted() {
    //   this.test();  
    }
}
</script>

<style scoped>
@import '../style.css';
</style>