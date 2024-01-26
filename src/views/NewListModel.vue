<template>
    <div class="newExpenseDiv">
        <table>
            <tr>
                <td v-if="isThereChild" class="tdForNew">
                    <button :class="{
                        'newExpenseBtn_minus': newExpenseBtnOpened === true,
                        'newExpenseBtn_plus': newExpenseBtnOpened === false
                    }" @click="handlerNewListDiv">
                        {{ newExpenseBtnOpened ? "-" : "+" }}
                    </button>
                </td>
                <td v-if="!isThereChild" class="tdForNew"> <span>new</span> </td>
                <td v-if="isNewListDivOpened" class="thOnList">
                    <form @submit.prevent="createNewExpense(this.theExpense.id, this.theExpense.level)">
                        <div class="listViewLiDiv">
                            <input class="categoryStyle" v-model="this.newCategory" placeholder="새 리스트 적기">
                            <span> : </span>
                            <input class="amountStyle" v-model="newAmount" placeholder="0" @input="formatAmount">
                        </div>
                        <button class="newExpenseDoneBtn">입력</button>
                    </form>
                </td>
            </tr>
        </table>
    </div>
</template>

<script>
import expenseMixin from './mixins/expenseMixin.js'

export default {
    name: 'NewListModel',
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
        isThereChild: {
            type: Boolean,
            default: true
        },
    },
    watch: {
        isThereChild: {
            handler() {
                this.controlDivIfNoChild()
            },
            deep: true
        },
    },
    data() {
        return {
            newCategory: '',
            newAmount: 0,
            isNewListDivOpened: false,
            newExpenseBtnOpened: false,
        }
    },
    mounted() {
        this.controlDivIfNoChild()
    },
    methods: {
        formatAmount() {
            this.newAmount = String(this.newAmount).replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        },
        controlDivIfNoChild() {
            if (!this.isThereChild) {
                this.isNewListDivOpened = true;
                this.newExpenseBtnOpened = true;
            } else {
                this.isNewListDivOpened = false;
                this.newExpenseBtnOpened = false;
            }
        },
        handlerNewListDiv() {
            this.isNewListDivOpened = !this.isNewListDivOpened;
            this.newExpenseBtnOpened = !this.newExpenseBtnOpened;
            if (!this.newExpenseBtnOpened) {
                this.newCategory = ''
                this.newAmount = 0
            }
        },
        createNewExpense(parentsIdHere, parentsLevelHere) {
            const numericValue = parseFloat(this.newAmount.replace(/,/g, ''));
            if (isNaN(numericValue)) {
                alert("숫자가 아닌 문자가 입력되었습니다. 숫자만 입력해주십시오");
                return; // 이후의 코드 실행을 중지하고 함수를 종료
            } else {
                this.$emit('create-new-expense', parentsIdHere, parentsLevelHere, this.newCategory, numericValue);
                this.newCategory = '';
                this.newAmount = 0;
            }
        },
    }
}
</script>

<style scoped>
@import '../style.css';
</style>