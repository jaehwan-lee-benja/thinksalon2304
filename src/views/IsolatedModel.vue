<template>
    <div class='isolatedAlignStyle'>
        <ExpenseModel v-bind:expenseById="this.theExpense" :clickedExpenseId="clickedExpenseId"
            @remove-expense="removeExpense" />
        <ExpenseDetailModel class="isolatedDetailDiv" v-bind:expenseById="this.theExpense" :expenses="expenses" />
    </div>
</template>

<script>
import ExpenseModel from './ExpenseModel.vue'
import ExpenseDetailModel from './ExpenseDetailModel.vue'
import expenseMixin from './mixins/expenseMixin.js'

export default {
    name: 'IsolatedModel',
    mixins: [expenseMixin],
    props: {
        expenseId: {
            type: String,
            default: '',
        },
        expenses: {
            type: Object,
            default: () => { }
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
    methods: {
        removeExpense(expenseHere) {
            this.$emit('remove-expense', expenseHere);
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