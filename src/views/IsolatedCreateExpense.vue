<template>
    <div class="isolatedDivStyle">
        <div class='isolatedAlignStyle'>
            <table class="isolatedTableStyle">
                <tr>
                    <td>
                        상위 거점 선택하기
                    </td>
                    <td>
                        <select v-model="parentsExpense" @change="selectParentsExpense">
                            <option v-for="expense in this.expenses" :key="expense.id" :value="expense">
                                {{ expense.category }}
                            </option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <td>
                        거점 이름 정하기
                    </td>
                    <td>

                        <input class="categoryStyle" v-model="newCategory">
                    </td>
                </tr>
                <tr>
                    <td>
                        거점 크기 정하기(돈의 양)
                    </td>
                    <td>
                        <input class="categoryStyle" v-model="newAmount">

                    </td>
                </tr>
                <tr>
                    <td>
                        거점 계좌 매칭하기
                    </td>
                    <td>
                        <select v-model="selectedAccount" @change="selectAccount">
                            <option v-for="account in this.accounts" :key="account.id" :value="account">
                                {{ account.name }}
                            </option>
                        </select>
                    </td>
                </tr>
            </table>
        </div>
        <button @click="createNewExpense">만들기</button>
    </div>
</template>

<script>

export default {
    name: 'IsolatedCreateExpense',
    props: {
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
            parentsExpense: "",
            newCategory: "",
            newAmount: "",
            selectedAccount: ""
        }
    },
    methods: {
        selectAccount() {
            console.log("this.selectedAccount = ", this.selectedAccount)
        },
        selectParentsExpense() {
            console.log("parentsExpense = ", this.parentsExpense)
        },
        createNewExpense() {
            this.$emit('create-new-expense', this.parentsExpense.id, this.parentsExpense.level, this.newCategory, this.newAmount, this.selectedAccount.id);
        }
    },
}
</script>

<style scoped>
@import '../style.css';
</style>