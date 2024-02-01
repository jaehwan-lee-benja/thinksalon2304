<template>
    <div>
        <span> 하위 합계 : </span>
        <input class="amountStyle" :value="sumExpenses()" readonly>
        <span> 메모 : </span>
        <input class="memo" v-model="theExpenseById.memo">
        <span> 계좌 : </span>
        <select class="accountSelect" v-model="selectedAccountName" @change="selectAccount">
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
            default: () => ({})
        },
        expenses: {
            type: Object,
            default: () => ({})
        },
        accounts: {
            type: Object,
            default: () => ({})
        },
    },
    mounted() {
        this.getAccount();
    },
    data() {
        return {
            selectedAccountName: ''
        }
    },
    watch: {
        selectedAccountName(newValue) {
            const selectedAccount = this.accounts.find(account => account.name === newValue);
            if (selectedAccount) {
                this.$emit('select-account', this.expenseById.id, selectedAccount.id);
            }
        },
        expenses: {
            // 편집 취소하는 경우, 서버에 저장된 값으로 돌아오기
            handler() {
                const expensesLength = this.expenses.length;
                if (expensesLength > 0) {
                    this.$nextTick(() => {
                        this.getAccount()
                    });
                }
            },
            deep: true
        }
    },
    computed: {
        theExpenseById() {
            console.log("this.expenseById =", this.expenseById);
            console.log("this.expenseById.account_id =", this.expenseById.account_id);
            return this.expenseById
        }
    },
    methods: {
        getAccount() {
            let theAccount = { name: "" };
            if (this.expenseById.account_id != null) {
                theAccount = this.accounts.find(e => e.id === this.expenseById.account_id) || { name: "" };
            }
            this.selectedAccountName = theAccount.name;
        },
        sumExpenses() {
            const sumArr = this.expenses.filter(e => e.parents_id === this.expenseById.id)
            const sum = sumArr.reduce((acc, item) => acc + Number(item.amount), 0);
            return sum.toLocaleString();
        },
        selectAccount() {
            console.log("check!-1")
            const selectedAccount = this.accounts.find(account => account.name === this.theExpenseById.account_id);
            console.log("selectedAccount = ", selectedAccount);
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