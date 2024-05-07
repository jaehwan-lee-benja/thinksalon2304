<template>
    <div>
        <button class="normalBtn" @click="openOrCloseLi">
            {{ this.isAnyOpenedLi ? "모두 닫기" : "모두 펴기" }}
        </button>
    </div>

    <ol class="olBgStyle">

        <li class="listViewLiStyle">

            <ListModel v-bind:expenses="expenses" :expenseId="this.totalExpenseId" @remove-expense="removeExpense"
                @toggle-sub-list="toggleSubList" :toggleActiveHandler="this.toggleActiveHandler[this.totalExpenseId]"
                :selectedPageId="selectedPageId" :clickedExpenseId="clickedExpenseId" :accounts="accounts"
                @select-account="selectAccount" />

            <ol class="olBgStyle" v-if="getTotalExpense.show_sub_list">
                <li class="listViewLiStyle" v-for="expense2 in sortChildrenByIdAndLevel(this.totalExpenseId, 1)"
                    :key="expense2.index">

                    <ListModel v-bind:expenses="expenses" :expenseId="expense2.id" @remove-expense="removeExpense"
                        @toggle-sub-list="toggleSubList" :toggleActiveHandler="this.toggleActiveHandler[expense2.id]"
                        :selectedPageId="selectedPageId" :clickedExpenseId="clickedExpenseId" :accounts="accounts"
                        @select-account="selectAccount" />

                    <ol class="olBgStyle" v-if="expense2.show_sub_list">
                        <li class="listViewLiStyle"
                            v-for="expense3 in sortChildrenByIdAndLevel(expense2.id, expense2.level)" :key="expense3.index">

                            <ListModel v-bind:expenses="expenses" :expenseId="expense3.id" @remove-expense="removeExpense"
                                @toggle-sub-list="toggleSubList"
                                :toggleActiveHandler="this.toggleActiveHandler[expense3.id]"
                                :selectedPageId="selectedPageId" :clickedExpenseId="clickedExpenseId" :accounts="accounts"
                                @select-account="selectAccount" />

                            <ol class="olBgStyle" v-if="expense3.show_sub_list">
                                <li class="listViewLiStyle"
                                    v-for="expense4 in sortChildrenByIdAndLevel(expense3.id, expense3.level)"
                                    :key="expense4.index">

                                    <ListModel v-bind:expenses="expenses" :expenseId="expense4.id"
                                        @remove-expense="removeExpense" @toggle-sub-list="toggleSubList"
                                        :toggleActiveHandler="this.toggleActiveHandler[expense4.id]"
                                        :selectedPageId="selectedPageId" :clickedExpenseId="clickedExpenseId"
                                        :accounts="accounts" @select-account="selectAccount" />

                                    <ol class="olBgStyle" v-if="expense4.show_sub_list">
                                        <li class="listViewLiStyle"
                                            v-for="expense5 in sortChildrenByIdAndLevel(expense4.id, expense4.level)"
                                            :key="expense5.index">

                                            <ListModel v-bind:expenses="expenses" :expenseId="expense5.id"
                                                @remove-expense="removeExpense" @toggle-sub-list="toggleSubList"
                                                :toggleActiveHandler="this.toggleActiveHandler[expense5.id]"
                                                :selectedPageId="selectedPageId" :clickedExpenseId="clickedExpenseId"
                                                :accounts="accounts" @select-account="selectAccount" />

                                        </li>
                                        <NewListModel v-bind:expenses="expenses" :expenseId="expense4.id"
                                            @create-new-expense="createNewExpense"
                                            :isThereChild="this.isThereChildMonitor[expense4.id]" />
                                    </ol>

                                </li>
                                <NewListModel v-bind:expenses="expenses" :expenseId="expense3.id"
                                    @create-new-expense="createNewExpense"
                                    :isThereChild="this.isThereChildMonitor[expense3.id]" />
                            </ol>

                        </li>
                        <NewListModel v-bind:expenses="expenses" :expenseId="expense2.id"
                            @create-new-expense="createNewExpense" :isThereChild="this.isThereChildMonitor[expense2.id]" />
                    </ol>

                </li>

                <NewListModel v-bind:expenses="expenses" :expenseId="this.totalExpenseId"
                    @create-new-expense="createNewExpense" :isThereChild="this.isThereChildMonitor[this.totalExpenseId]" />
            </ol>

        </li>

    </ol>
</template>
  
<script>
import ListModel from './ListModel.vue'
import NewListModel from './NewListModel.vue'

export default {
    name: 'ListView',
    props: {
        expenses: {
            type: Object,
            default: () => { }
        },
        totalExpenseId: {
            type: String,
            default: '',
        },
        toggleActiveHandler: {
            type: Object,
            default: () => { }
        },
        isThereChildMonitor: {
            type: Object,
            default: () => { }
        },
        selectedPageId: {
            type: String,
            default: '',
        },
        clickedExpenseId: {
            type: String,
            default: '',
        },
        isAnyOpenedLi: {
            type: Boolean,
            default: false,
        },
        accounts: {
            type: Object,
            default: () => { }
        }
    },
    computed: {
        getTotalExpense() {
            if (this.expenses.length > 0) {
                return this.expenses.find(expense => expense.id === this.totalExpenseId)
            } else {
                return { category: "로딩중...", amount: 0, id: "" }
            }
        },
    },
    methods: {
        openOrCloseLi() {
            this.$emit('open-or-close-li')
        },
        removeExpense(expenseHere) {
            const confirmValue = confirm("삭제하시겠습니까? 삭제 후, '저장'버튼을 눌러야 삭제가 완료됩니다.")
            if (confirmValue) {
                this.$emit('remove-expense', expenseHere)
            }
        },
        sortChildrenByIdAndLevel(parentIdHere, parentsLevelHere) {
            return this.expenses.filter(e => e.parents_id === parentIdHere && e.level === parentsLevelHere + 1);
        },
        toggleSubList(expenseHere) {
            this.$emit('toggle-sub-list', expenseHere)
        },
        createNewExpense(parentsIdHere, parentsLevelHere, newCategoryHere, newAmountHere) {
            this.$emit('create-new-expense', parentsIdHere, parentsLevelHere, newCategoryHere, newAmountHere)
        },
        cancelEditingExpense() {
            const confirmValue = confirm("편집을 취소하시겠습니까? 취소하면, 편집 중인 내용은 저장되지 않습니다.")
            if (confirmValue) {
                this.$emit('cancel-editing-expense')
            }
        },
        selectAccount(expenseIdHere, accountIdHere) {
            this.$emit('select-account', expenseIdHere, accountIdHere)
        }
    },
    components: {
        ListModel,
        NewListModel,
    }
}
</script>
  
<style scoped>@import '../style.css';</style>