<template>
    <div class='isolatedAlignStyle'>

        <ExpenseModel v-bind:expenseById="getExpenseById[0]" />

        <button class="moreBtn" v-if="isNotTotal" @click="removeExpense(getExpenseById[0])">x</button>
        <div class="isolatedMoreDiv">
            <span> 하위 합계 : </span>
            <input class="amountStyle" :value="sumExpenses(getExpenseById[0].id)" readonly>
            <span> 메모 : </span>
            <input class="memo" v-model="getExpenseById[0].memo">
        </div>

    </div>
</template>

<script>
import ExpenseModel from './ExpenseModel.vue'

export default {
    name: 'ListModel',
    props: {
        expenseId: {
            type: String,
            default: '',
        },
        expenses: {
            type: Object,
            default: () => { }
        },
        toggleActiveHandler: {
            type: Boolean,
            default: true
        },
        selectedPageId: {
            type: String,
            default: '',
        },
        clickedExpenseId: {
            type: String,
            default: '',
        }
    },
    watch: {
        selectedPageId: {
            handler() {
                this.handlerLiMoreDivForPageChange()
            },
            deep: true
        },
    },
    data() {
        return {
            isLiMoreDivOpened: false,
            memoSaveBtnHandler: false
        }
    },
    computed: {
        isNotTotal() {
            if (this.getExpenseById[0].level > 1) {
                return true
            } else {
                return false
            }
        },
        getExpenseById() {
            if (this.expenses.length > 0) {
                const theExpenseById = this.expenses.filter(expense => expense.id === this.expenseId)
                if(theExpenseById.length > 0) {
                    return theExpenseById
                } else {
                    return [{ category: "로딩중..", amount: 0, id: "" }]
                }
            } else {
                return [{ category: "로딩중..", amount: 0, id: "" }]
            }
        },
    },
    methods: {
        handlerLiMoreDivForPageChange() {
            // Page가 바뀔 때, LiMoreDiv가 열려있는 경우, 없애도록하는 기능
            if (this.isLiMoreDivOpened) { this.isLiMoreDivOpened = false; }
        },
        handlerLiMoreDiv() {
            this.isLiMoreDivOpened = !this.isLiMoreDivOpened;
        },
        sumExpenses(parentsIdHere) {
            const sum = this.expenses.filter(e => e.parents_id === parentsIdHere)
                .reduce((acc, item) => acc + Number(item.amount), 0);
            return sum.toLocaleString();
        },
        removeExpense(expenseHere) {
            this.$emit('remove-expense', expenseHere);
            this.handlerLiMoreDivForPageChange();
        },
        toggleSubList(expenseHere) {
            this.$emit('toggle-sub-list', expenseHere);
        }
    },
    components: {
        ExpenseModel
    },
}
</script>

<style scoped>
@import '../style.css';
</style>