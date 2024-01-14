<template>
    <div class='listViewLiDiv'>
        <input class="categoryStyle" v-model="theExpense.category">
        <span> : </span>
        <input class="amountStyle" ref="amountInput" v-model="formattedAmount">
    </div>
</template>

<script>

export default {
    name: 'ExpenseModel',
    props: {
        expenseById: {
            type: Object,
            default: () => { }
        }
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
        }
    }
}
</script>

<style scoped>
@import '../style.css';
</style>