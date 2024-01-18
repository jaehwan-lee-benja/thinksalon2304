<template>
    <div class="newExpenseDiv" >
        <table>
            <tr>
                <th class="thForNew">
                    <button class="newExpenseBtn" @click="handlerNewListDiv">
                        {{ newExpenseBtnOpened ? "-" : "+" }}
                    </button>
                </th>
                <th>
                    <form v-if="isNewListDivOpened"
                        @submit.prevent="createNewExpense(getExpenseById[0].id, getExpenseById[0].level)">
                        <div class="listViewLiDiv">
                            <input class="categoryStyle" v-model="this.newCategory" placeholder="새 리스트 적기">
                            <span> : </span>
                            <input class="amountStyle" v-model="this.newAmount" placeholder="0">
                        </div>
                        <button class="newExpenseDoneBtn">입력</button>
                    </form>
                </th>
            </tr>
        </table>
    </div>
</template>

<script>

export default {
    name: 'NewListModel',
    props: {
        expenseId: {
            type: String,
            default: '',
        },
        expenses: {
            type: Object,
            default: () => { }
        }
    },
    data() {
        return {
            newCategory: '',
            newAmount: 0,
            isNewListDivOpened: false,
            newExpenseBtnOpened: false,
        }
    },
    computed: {
        getExpenseById() {
            return this.expenses.filter(expense => expense.id === this.expenseId)
        }
    },
    methods: {
        handlerNewListDiv() {
            this.isNewListDivOpened = !this.isNewListDivOpened;
            this.newExpenseBtnOpened = !this.newExpenseBtnOpened;
            if (!this.newExpenseBtnOpened) {
                this.newCategory = ''
                this.newAmount = 0
            }
        },
        createNewExpense(parentsIdHere, parentsLevelHere) {
            this.$emit('create-new-expense', parentsIdHere, parentsLevelHere, this.newCategory, this.newAmount);
            this.newCategory = ''
            this.newAmount = 0
        },
    }
}
</script>

<style scoped>
@import '../style.css';
</style>