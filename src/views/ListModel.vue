<template>
    <table>
        <tr>
            <td class="thOnList">
                <button :class="{
                    'toggleBtn_active': this.toggleActiveHandler === true,
                    'toggleBtn_inactive': this.toggleActiveHandler === false,
                }" :disabled="!this.toggleActiveHandler" @click="toggleSubList(this.getExpenseById)">
                    {{ this.getExpenseById.show_sub_list ? "&#9660;" : "&#9654;" }}
                </button>
            </td>
            <td v-if="isNotTotal" class="thOnList">
                {{ this.getExpenseById.order }}
            </td>

            <td class="thOnList">
                <ExpenseModel v-bind:expenseById="this.getExpenseById" :clickedExpenseId="clickedExpenseId"
                    @remove-expense="removeExpense" :isList="true" />
                <button class="expenseDetailBtn" @click="handlerLiDetailDiv"> {{ !this.isLiDetailDivOpened ? "…" : "닫기" }}
                </button>
                <ExpenseDetailModel class="liDetailDiv" v-if="isLiDetailDivOpened" v-bind:expenseById="this.getExpenseById"
                    :expenses="expenses" :accounts="accounts" @select-account="selectAccount" />
            </td>
        </tr>
    </table>
</template>

<script>
import ExpenseModel from './ExpenseModel.vue'
import ExpenseDetailModel from './ExpenseDetailModel.vue'
import expenseMixin from './mixins/expenseMixin.js'

export default {
    name: 'ListModel',
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
        accounts: {
            type: Object,
            default: () => { }
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
            if (this.getExpenseById.level > 1) {
                return true
            } else {
                return false
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
        },
        selectAccount(expenseIdHere, accountIdHere) {
            this.$emit('select-account', expenseIdHere, accountIdHere)
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