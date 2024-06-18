<template>
    <div class="isolatedTableDivStyle">
        <table>
            <tr>
                <td>
                    명칭 :
                </td>
                <td>
                    <input class="categoryStyle" v-model="theExpenseById.category">
                </td>
            </tr>
            <tr>
                <td>
                    계좌 :
                </td>
                <td>
                    <select class="accountSelect" v-model="selectedAccountName" @change="selectAccount">
                        <option value="" disabled selected>계좌 선택하기</option>
                        <option v-for="account in accounts" :key="account.id" :value="account.name" :id="account.id">
                            {{ account.name }}
                        </option>
                    </select>
                </td>
            </tr>
            <tr>
                <td>
                    금액 :
                </td>
                <td>
                    <input class="amountStyle" ref="amountInput" v-model="formattedAmount" @input="validateInput">
                </td>
            </tr>
        </table>
    </div>
</template>

<script>
import expenseMixin from './mixins/expenseMixin.js'

export default {
    name: 'ExpenseModel',
    mixins: [expenseMixin],
    props: {
        expenses: {
            type: Object,
            default: () => ({})
        },
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
            return this.expenseById
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
        selectAccount() {
            const selectedAccount = this.accounts.find(account => account.name === this.theExpenseById.account_id);
            if (selectedAccount) {
                this.$emit('select-account', this.expenseById.id, selectedAccount.id)
            }
        },
        getAccount() {
            let theAccount = { name: "" };
            if (this.expenseById.account_id != null) {
                theAccount = this.accounts.find(e => e.id === this.expenseById.account_id) || { name: "" };
            }
            this.selectedAccountName = theAccount.name;
        },
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