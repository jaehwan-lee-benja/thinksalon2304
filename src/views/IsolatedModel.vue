<template>
    <div class="isolatedDivStyle">
        <div class='isolatedAlignStyle'>
            <p>[거점 정보]</p>
            <ExpenseModel v-bind:expenses="expenses" :expenseById="this.getExpenseById" :clickedExpenseId="clickedExpenseId"
                :accounts="accounts" @select-account="selectAccount" />
            <p>[참고]</p>
            <ExpenseDetailModel class="isolatedDetailDiv" v-bind:expenseById="this.getExpenseById" :expenses="expenses"
                :accounts="accounts" @select-account="selectAccount" />
            <button class="expenseDetailBtn" v-if="isNotTotal" @click="removeExpense(this.getExpenseById)">거점 삭제하기</button>
        </div>
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
        },
        accounts: {
            type: Object,
            default: () => { }
        }
    },
    computed: {
        isNotTotal() {
            if (this.getExpenseById.level > 1) {
                return true
            } else {
                return false
            }
        },
    },
    data() {
        return {
            isLiDetailDivOpened: false,
            memoSaveBtnHandler: false
        }
    },
    methods: {
        selectAccount(expenseIdHere, accountIdHere) {
            this.$emit('select-account', expenseIdHere, accountIdHere)
        },
        removeExpense(expenseHere) {
            console.log("expenseHere = ", expenseHere)
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