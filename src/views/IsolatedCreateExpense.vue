<template>
    <div class="isolatedDivStyle">
        <div class='isolatedAlignStyle'>
            <p>[상위 거점 선택하기]</p>
            <select v-model="parentsExpense" @change="selectParentsExpense">
                <option v-for="expense in this.expenses" :key="expense.id" :value="expense.id">
                    {{ expense.category }}
                </option>
            </select>
            <p>[거점 이름 정하기]</p>
            <input class="categoryStyle" v-model="newCategory">
            <p>[거점 크기 정하기(돈의 양)]</p>
            <input class="categoryStyle" v-model="newAmount">
            <p>[거점 계좌 매칭하기]</p>
            <select v-model="selectedAccount" @change="selectAccount">
                <option v-for="account in this.accounts" :key="account.id" :value="account.id">
                    {{ account.name }}
                </option>
            </select>
        </div>
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
        }
    },
}
</script>

<style scoped>
@import '../style.css';
</style>