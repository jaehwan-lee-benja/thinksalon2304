<template>
    <div class='isolatedAlignStyle'>

        <ExpenseModel v-bind:expenseById="getExpenseById[0]" :clickedExpenseId="clickedExpenseId"
            @remove-expense="removeExpense" />
        <ExpenseDetailModel class="isolatedDetailDiv" v-bind:expenseById="getExpenseById[0]" :expenses="expenses" />

    </div>
</template>

<script>
import ExpenseModel from './ExpenseModel.vue'
import ExpenseDetailModel from './ExpenseDetailModel.vue'

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
    data() {
        return {
            isLiDetailDivOpened: false,
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
                if (theExpenseById.length > 0) {
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
        removeExpense(expenseHere) {
            this.$emit('remove-expense', expenseHere);
        },
        toggleSubList(expenseHere) {
            this.$emit('toggle-sub-list', expenseHere);
        }
    },
    components: {
        ExpenseModel,
        ExpenseDetailModel
    },
}
</script>

<style scoped>
@import '../style.css';
</style>