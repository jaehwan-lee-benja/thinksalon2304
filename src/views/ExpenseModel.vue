<template>
    <div :class="{
        'listViewLiDiv_clicked': this.updateClickedExpenseId === true,
        'listViewLiDiv': this.updateClickedExpenseId === false
    }">
        <input class="categoryStyle" v-model="theExpenseById.category">
        <span> : </span>
        <input class="amountStyle" ref="amountInput" v-model="formattedAmount" @input="validateInput">
    </div>
    <button class="expenseDetailBtn" v-if="isNotTotal" @click="removeExpense(theExpenseById)">x</button>
</template>

<script>
import expenseMixin from './mixins/expenseMixin.js'

export default {
    name: 'ExpenseModel',
    mixins: [expenseMixin],
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
                return this.theExpenseById.amount.toLocaleString();
            },
            set(value) {
                // 사용자가 입력할 때 컴마를 제거하고 숫자로 변환하여 저장
                const numericValue = parseFloat(value.replace(/,/g, ''));
                // 값이 유효한 숫자인 경우에만 저장
                if (!isNaN(numericValue)) {
                    this.theExpenseById.amount = numericValue;
                }
            },
        },
        theExpenseById() {
            console.log("this.expenseById = ", this.expenseById);
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
        validateInput(event) {
            const inputElement = event.target;
            const inputValue = inputElement.value;

            // 정규표현식을 사용하여 숫자 또는 컴마인 경우만 허용
            const sanitizedValue = inputValue.replace(/[^\d,]/g, '');
            if (sanitizedValue !== inputValue) {
                // 입력값을 정제하여 다시 설정
                inputElement.value = sanitizedValue;
            }
        },
    }
}
</script>

<style scoped>
@import '../style.css';
</style>