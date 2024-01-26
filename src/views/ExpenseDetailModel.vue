<template>
    <div>
        <span> 하위 합계 : </span>
        <input class="amountStyle" :value="sumExpenses()" readonly>
        <span> 메모 : </span>
        <input class="memo" v-model="theExpenseById.memo">
        <span> 계좌 : </span>
        <select class="accountSelect" v-model="selectedAccountName" @change="selectAccount()">
            <option value="" disabled selected>계좌 선택하기</option>
            <option v-for="account in accounts" :key="account.id" :value="account.name" :id="account.id">
                {{ account.name }}
            </option>
        </select>
    </div>
</template>

<script>

export default {
    name: 'ExpenseDetailModel',
    props: {
        expenseById: {
            type: Object,
            default: () => { }
        },
        expenses: {
            type: Object,
            default: () => { }
        },
        accounts: {
            type: Object,
            default: () => { }
        }
    },
    data() {
        return {
            selectedAccountName: '',
        }
    },
    computed: {
        theExpenseById() {
            return this.expenseById
        },
        // selectedAccountName() {
        //     const accountName = this.accounts.filter(e => e.id === this.expenseById.account_id)
        //     return ''
        // }
    },
    methods: {
        sumExpenses() {
            const sumArr = this.expenses.filter(e => e.parents_id === this.expenseById.id)
            const sum = sumArr.reduce((acc, item) => acc + Number(item.amount), 0);
            return sum.toLocaleString();
        },
        selectAccount() {
            const selectedAccount = this.accounts.find(account => account.name === this.selectedAccountName);
            if (selectedAccount) {
                this.$emit('select-account', this.expenseById.id, selectedAccount.id)
            }
        }
    }
}
</script>

<style scoped>
@import '../style.css';
</style>