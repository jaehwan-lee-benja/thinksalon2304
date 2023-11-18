<template>
    <div :class="listViewLiDiv">
        <input :class="categoryStyle" :value="this.getTotalExpense.category">
        <span> : </span>
        <input :class="amountStyle" :value="this.getTotalExpense.amount">
    </div>
    <button :class="moreBtn" @click="handlerLiMoreDiv()"> … </button>
    <div :class="liMoreDiv" v-if="isLiMoreDivOpened">
        <span> *하위 합계 : </span>
        <input :class="amountStyle" :value="sumExpensesForTotal(this.getTotalExpense.id)" readonly>
    </div>

    <ol :class="olBgStyle">

        <li :class="listViewLiStyle"
            v-for="expense2 in sortChildrenByIdAndLevel(this.getTotalExpense.id, this.getTotalExpense.level)"
            :key="expense2.index">

            <ListModel v-bind:expenses="expenses" :expenseId="expense2.id" @remove-expense="removeExpense"
                @toggle-sub-list="toggleSubList" :toggleActiveHandler="this.toggleActiveHandler[expense2.id]" />

            <ol :class="olBgStyle" v-if="expense2.show_sub_list">
                <li :class="listViewLiStyle" v-for="expense3 in sortChildrenByIdAndLevel(expense2.id, expense2.level)"
                    :key="expense3.index">

                    <ListModel v-bind:expenses="expenses" :expenseId="expense3.id" @remove-expense="removeExpense"
                        @toggle-sub-list="toggleSubList" :toggleActiveHandler="this.toggleActiveHandler[expense3.id]" />

                    <ol :class="olBgStyle" v-if="expense3.show_sub_list">
                        <li :class="listViewLiStyle"
                            v-for="expense4 in sortChildrenByIdAndLevel(expense3.id, expense3.level)" :key="expense4.index">

                            <ListModel v-bind:expenses="expenses" :expenseId="expense4.id" @remove-expense="removeExpense"
                                @toggle-sub-list="toggleSubList"
                                :toggleActiveHandler="this.toggleActiveHandler[expense4.id]" />

                            <ol :class="olBgStyle" v-if="expense4.show_sub_list">
                                <li :class="listViewLiStyle"
                                    v-for="expense5 in sortChildrenByIdAndLevel(expense4.id, expense4.level)"
                                    :key="expense5.index">

                                    <ListModel v-bind:expenses="expenses" :expenseId="expense5.id"
                                        @remove-expense="removeExpense" @toggle-sub-list="toggleSubList"
                                        :toggleActiveHandler="this.toggleActiveHandler[expense5.id]" />

                                </li>
                                <NewListModel v-bind:expenses="expenses" :expenseId="expense4.id"
                                    @create-new-expense="createNewExpense" />
                            </ol>

                        </li>
                        <NewListModel v-bind:expenses="expenses" :expenseId="expense3.id"
                            @create-new-expense="createNewExpense" />
                    </ol>

                </li>
                <NewListModel v-bind:expenses="expenses" :expenseId="expense2.id" @create-new-expense="createNewExpense" />
            </ol>

        </li>

        <NewListModel v-bind:expenses="expenses" :expenseId="this.getTotalExpense.id"
            @create-new-expense="createNewExpense" />
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
    },

    data() {
        return {

            totalExpenses: [],
            fetchedExpenses: [],
            expensePages: [],
            selectedPageId: '',

            unitDiv: 'unitDiv',
            subGrid: 'subGrid',
            viewGrid: 'viewGrid',
            flowViewDiv: 'flowViewDiv',
            listViewDiv: 'listViewDiv',
            listViewLiDiv: 'listViewLiDiv',

            categoryStyle: 'categoryStyle',
            amountStyle: 'amountStyle',

            listViewLiStyle: 'listViewLiStyle',
            listViewOlStyle: 'listViewOlStyle',
            olBgStyle: 'olBgStyle',
            liMoreDiv: 'liMoreDiv',
            moreBtn: 'moreBtn',

            isLiMoreDivOpened: false,
            toggleActiveHandler: {},

        }
    },
    computed: {
        getTotalExpense() {
            const totalExpenseArr = this.expenses.filter(e => e.level === 1)
            const totalExpense = totalExpenseArr[0]
            let o = ''
            if (totalExpense) {
                o = totalExpense
            }
            return o
        },
        isEdited() {

            const fetched = this.fetchedExpenses.map(e => ({
                category: e.category,
                amount: Number(e.amount)
            })
            );

            const edited = this.expenses.map(e => ({
                category: e.category,
                amount: Number(e.amount)
            })
            );

            const fetchedData = JSON.stringify(fetched);
            const editedData = JSON.stringify(edited);
            const result = (fetchedData || "") != (editedData || "")

            return result

        },

    },
    methods: {
        handlerLiMoreDiv() {
            this.isLiMoreDivOpened = !this.isLiMoreDivOpened;
        },
        controlToggleActiveHandler(expenseHere) {
            if (expenseHere.level == 5) {
                this.toggleActiveHandler[expenseHere.id] = false;
            } else {
                this.toggleActiveHandler[expenseHere.id] = true;
            }
        },
        sumExpensesForTotal(parentsIdHere) {
            const sum = this.expenses.filter(e => e.parents_id === parentsIdHere)
                .reduce((acc, item) => acc + Number(item.amount), 0);
            return sum
        },
        removeExpense(expenseHere) {
            console.log("expenseHere @remove = ", expenseHere);
            // const confirmValue = confirm("내용을 삭제하시겠습니까? 삭제 후, '저장'버튼을 눌러야 삭제가 완료됩니다.")

            // if (confirmValue) {

            //     const parentsId = expenseHere.parents_id;
            //     const orderRemoved = expenseHere.order;

            //     console.log("this.expenses = ", this.expenses);
            //     this.expenses.forEach(e => {
            //         const order = e.order;
            //         if (e.parents_id == parentsId) {
            //             if (order > orderRemoved) {
            //                 this.expenses[this.expenses.indexOf(e)].order = order - 1;
            //             }
            //         }
            //     });

            //     this.expenses = this.expenses.filter((t) => t !== expenseHere)

            //     if (expenseHere.level > 1) {
            //         this.expenses = this.expenses.filter((t) => t.parents_id !== expenseHere.id)
            //     }

            // }

        },
        removeExpenseByPageDelete(pageIdHere) {
            const deleteExpensesArray = this.totalExpenses.filter((e) => e.page_id == pageIdHere)
            deleteExpensesArray.forEach(e => this.deleteData(e.id))
        },
        sortChildrenByIdAndLevel(parentIdHere, parentsLevelHere) {
            return this.expenses.filter(e => e.parents_id === parentIdHere && e.level === parentsLevelHere + 1);
        },
        toggleSubList(expenseHere) {
            this.controlToggleActiveHandler(expenseHere);
            if (expenseHere.level < 5) {
                expenseHere.show_sub_list = !expenseHere.show_sub_list;
                // this.upsertData(expenseHere)
            }
        },
        createNewExpense(parentsIdHere, parentsLevelHere, newCategoryHere, newAmountHere) {

            const levelForO = parentsLevelHere + 1;

            const o = {
                id: this.getUuidv4(),
                parents_id: parentsIdHere,
                category: newCategoryHere,
                amount: newAmountHere,
                order: this.setOrder(parentsIdHere),
                level: levelForO,
                show_sub_list: false,
                page_id: this.selectedPageId
            };

            if (levelForO < 5) {
                this.toggleActiveHandler[o.id] = true;
            } else {
                this.toggleActiveHandler[o.id] = false;
            }

            this.$emit('create-new-expense', o)

        },
        
        getUuidv4() {
            return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
        },
        setOrder(parentsIdHere) {
            const arr = this.expenses.filter(e => e.parents_id === parentsIdHere)
            const expenseLength = Object.keys(arr).length;
            return expenseLength + 1;
        },
        cancelEditing() {
            const confirmValue = confirm("편집을 취소하시겠습니까? 취소하면, 편집 중인 내용은 저장되지 않습니다.")

            if (confirmValue) {
                // this.expenses = ""; // 복구하기
                // this.expenses = JSON.parse(JSON.stringify(this.fetchedExpenses));
            }
        }
    },
    components: {
        ListModel,
        NewListModel,
    }
}
</script>
  
<style scoped>
@import '../style.css';
</style>