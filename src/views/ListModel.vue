<template>
    <div class='liAlignStyle'>

        <button v-if="!isNotTotal" :class="{
            'totalToggleBtn_active': this.toggleActiveHandler === true,
            'totalToggleBtn_inactive': this.toggleActiveHandler === false,
        }" :disabled="!this.toggleActiveHandler" @click="toggleSubList(getExpenseById[0])">
            {{ getExpenseById[0].show_sub_list ? "&#9660;" : "&#9654;" }}
        </button>

        <button v-if="isNotTotal" :class="{
            'toggleBtn_active': this.toggleActiveHandler === true,
            'toggleBtn_inactive': this.toggleActiveHandler === false,
        }" :disabled="!this.toggleActiveHandler" @click="toggleSubList(getExpenseById[0])">
            {{ getExpenseById[0].show_sub_list ? "&#9660;" : "&#9654;" }}
        </button>

        <ExpenseModel v-bind:expenseById="getExpenseById[0]" :clickedExpenseId="clickedExpenseId" @remove-expense="removeExpense" :isList="true"/>

        <button class="expenseDetailBtn" @click="handlerLiDetailDiv"> … </button>

        <ExpenseDetailModel class="liDetailDiv" v-if="isLiDetailDivOpened" v-bind:expenseById="getExpenseById[0]"
            :expenses="expenses" />

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
        },
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
                return this.expenses.filter(expense => expense.id === this.expenseId)
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