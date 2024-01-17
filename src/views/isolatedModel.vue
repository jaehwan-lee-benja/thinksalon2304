<template>
    <div class='isolatedAlignStyle'>

        <ExpenseModel v-bind:expenseById="getExpenseById[0]" />

        <button class="expenseDetailBtn" v-if="isNotTotal" @click="removeExpense(getExpenseById[0])">x</button>

        <ExpenseDetailModel class="isolatedDetailDiv" v-bind:expenseById="getExpenseById[0]"
            :sumExpenses="sumExpenses(getExpenseById[0].id)" />

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
    watch: {
        selectedPageId: {
            handler() {
                this.handlerLiDetailDivForPageChange()
            },
            deep: true
        },
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
        handlerLiDetailDivForPageChange() {
            // Page가 바뀔 때, LiDetailDiv가 열려있는 경우, 없애도록하는 기능
            if (this.isLiDetailDivOpened) { this.isLiDetailDivOpened = false; }
        },
        handlerLiDetailDiv() {
            this.isLiDetailDivOpened = !this.isLiDetailDivOpened;
        },
        sumExpenses(parentsIdHere) {
            const sum = this.expenses.filter(e => e.parents_id === parentsIdHere)
                .reduce((acc, item) => acc + Number(item.amount), 0);
            return sum.toLocaleString();
        },
        removeExpense(expenseHere) {
            this.$emit('remove-expense', expenseHere);
            this.handlerLiDetailDivForPageChange();
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