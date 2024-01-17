<template>
    <div :class="{
        'listViewLiDiv_clicked': this.updateClickedExpenseId === true,
        'listViewLiDiv': this.updateClickedExpenseId === false
    }">
        <input class="categoryStyle" v-model="theExpense.category">
        <span> : </span>
        <input class="amountStyle" ref="amountInput" v-model="formattedAmount">
    </div>
    <button class="expenseDetailBtn" v-if="isNotTotal" @click="removeExpense(theExpense)">x</button>
</template>

<script>

export default {
    name: 'ExpenseModel',
    props: {
        expenseById: {
            type: Object,
            default: () => { }
        },
        clickedExpenseId: {
            type: String,
            default: '',
        },
        isList: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        formattedAmount: {
            get() {
                // 화면에 표시될 때는 컴마를 포함하여 반환
                return this.theExpense.amount.toLocaleString();
            },
            set(value) {
                // 사용자가 수정할 때는 숫자만 포함하여 저장
                const numericValue = parseFloat(value.replace(/,/g, ''));
                // 값이 유효한 숫자인 경우에만 저장
                if (!isNaN(numericValue)) {
                    this.theExpense.amount = numericValue;
                }
            },
        },
        theExpense() {
            return this.expenseById
        },
        isNotTotal() {
            if (this.expenseById.level > 1) {
                return true
            } else {
                return false
            }
        },
        updateClickedExpenseId() {
            if (this.clickedExpenseId === this.expenseById.id && this.isList === true) {
                return true
            } else {
                return false
            }
        },

    },
    methods: {
        removeExpense(expenseHere) {
            this.$emit('remove-expense', expenseHere);
        },
    }
}
</script>

<style scoped>
@import '../style.css';
</style>