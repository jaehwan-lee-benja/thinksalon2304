<template>
    <div :class="sectionGrid">
        <div :class="listViewDiv">
            <h2>리스트 뷰</h2>
            <div :class="listViewItemDiv">
                <ol>
                    <li :class="listViewLiStyle" v-for="expense1 in sortLevel1" :key="expense1.index">

                        <div :class="listViewLiDiv">
                            <input :class="categoryStyle" v-model="expense1.category">
                            <span> : </span>
                            <input :class="amountStyle" v-model="expense1.amount">
                        </div>
                        <span> *하위 합계 : </span>
                        <input :class="amountStyle" :value="sumExpensesForTotal(expense1.id)" readonly>

                        <ol>
                            <li :class="listViewLiStyle"
                                v-for="expense2 in sortChildrenByIdAndLevel(expense1.id, expense1.level)"
                                :key="expense2.index">

                                <ListItem v-bind:expenses="expenses" :expenseId="expense2.id"
                                    @remove-expense="removeExpense" @toggle-sub-list="toggleSubList" />

                                <div v-if="expense2.show_sub_list">
                                    <ol>
                                        <li :class="listViewLiStyle"
                                            v-for="expense3 in sortChildrenByIdAndLevel(expense2.id, expense2.level)"
                                            :key="expense3.index">

                                            <ListItem v-bind:expenses="expenses" :expenseId="expense3.id"
                                                @remove-expense="removeExpense" @toggle-sub-list="toggleSubList" />

                                            <div v-if="expense3.show_sub_list">

                                            </div>

                                        </li>

                                        <NewListItem v-bind:expenses="expenses" :expenseId="expense2.id"
                                            @create-new-expense="createNewExpense" />
                                    
                                    </ol>
                                </div>

                            </li>

                            <NewListItem v-bind:expenses="expenses" :expenseId="expense1.id"
                                @create-new-expense="createNewExpense" />

                        </ol>

                    </li>
                </ol>
            </div>
        </div>


        <div :class="flowViewDiv">
            <h2>플로우 뷰</h2>
        </div>
    </div>
    <div :class="saveEditedDiv">
        <button :class="{
            'saveEditedStyle_active': isEdited === true,
            'saveEditedStyle_inactive': isEdited === false
        }" :disabled="!isEdited" @click="editExpenses">편집한 내용 저장</button>
        <button :class="{
            'cancelEditedStyle_active': isEdited === true,
            'cancelEditedStyle_inactive': isEdited === false
        }" :disabled="!isEdited" @click="cancelEditing">편집 취소</button>
    </div>
</template>
  
<script>

import { supabase } from '../lib/supabaseClient.js'
//   import PieChart from './Pie.vue'
import ListItem from './ListItem.vue'
import NewListItem from './NewListItem.vue'

export default {

    data() {
        return {

            expenses: [],
            fetchedExpenses: [],

            unitDiv: 'unitDiv',
            subGrid: 'subGrid',
            graphGrid: 'graphGrid',
            graphDiv: 'graphDiv',
            sectionGrid: 'sectionGrid',
            flowViewDiv: 'flowViewDiv',
            listViewDiv: 'listViewDiv',
            listViewItemDiv: 'listViewItemDiv',
            listViewLiDiv: 'listViewLiDiv',

            categoryStyle: 'categoryStyle',
            amountStyle: 'amountStyle',
            newUlStyle: 'newUlStyle',
            saveEditedStyle_active: 'saveEditedStyle_active',
            saveEditedStyle_inactive: 'saveEditedStyle_inactive',
            cancelEditedStyle_active: 'cancelEditedStyle_active',
            cancelEditedStyle_inactive: 'cancelEditedStyle_inactive',
            saveEditedDiv: 'saveEditedDiv',
            listViewLiStyle: 'listViewLiStyle',
            listViewOlStyle: 'listViewOlStyle',

            isEditValue: true,

        }
    },
    mounted() {
        this.fetchData(),
            this.monitorIsEdited()
    },
    computed: {
        updateInputboxes() {
            this.expenses.forEach(e => {
                this.inputBoxesForCategory[e.id] = ""
                this.inputBoxesForAmount[e.id] = ""
            })
            return 0;
        },
        sortLevel1() {
            return this.expenses.filter(e => e.level === 1)
        },
        sortLevel2() {
            return this.expenses.filter(e => e.level === 2)
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
        sumExpensesForTotal(parentsIdHere) {
            const sum = this.expenses.filter(e => e.parents_id === parentsIdHere)
                .reduce((acc, item) => acc + Number(item.amount), 0);
            return sum
        },
        removeExpense(expenseHere) {
            const confirmValue = confirm("내용을 삭제하시겠습니까? 삭제 후, '저장'버튼을 눌러야 삭제가 완료됩니다.")

            if (confirmValue) {

                const parentsId = expenseHere.parents_id;
                const orderRemoved = expenseHere.order;

                this.expenses.forEach(e => {
                    const order = e.order;
                    if (e.parents_id == parentsId) {
                        if (order > orderRemoved) {
                            this.expenses[this.expenses.indexOf(e)].order = order - 1;
                        }
                    }
                });

                this.expenses = this.expenses.filter((t) => t !== expenseHere)

                if (expenseHere.level > 1) {
                    this.expenses = this.expenses.filter((t) => t.parents_id !== expenseHere.id)
                }

            }

        },
        sortChildrenByIdAndLevel(parentIdHere, parentsLevelHere) {
            return this.expenses.filter(e => e.parents_id === parentIdHere && e.level === parentsLevelHere + 1);
        },
        toggleSubList(expenseHere) {
            expenseHere.show_sub_list = !expenseHere.show_sub_list;
            this.upsertData(expenseHere)
        },
        sortExpenses(category) {
            return this.expenses.filter(e => e.category === category);
        },
        monitorIsEdited() {
            if (this.isEdited) {
                // 편집된 것이 있는 경우
                this.isEditValue = true;
            } else {
                // 편집된 것이 없는 경우
                this.isEditValue = false;
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
                level: levelForO
            };
            console.log("o = ", o);
            this.expenses.push(o);
        },
        async fetchData() {
            const a = await supabase
                .from('expense')
                .select()
                .order('order', { ascending: true })
            const { data } = a;
            this.expenses = data;
            this.fetchedExpenses = JSON.parse(JSON.stringify(data));
        },
        editExpenses() {

            const confirmValue = confirm("수정된 내용을 저장하시겠습니까?")

            if (confirmValue) {
                const expensesIdArray = this.expenses.map(e => e.id);
                const fetchedExpensesIdArray = this.fetchedExpenses.map(e => e.id);
                const willBeDeletedIdArray = fetchedExpensesIdArray.filter(e => !expensesIdArray.includes(e));

                willBeDeletedIdArray.forEach(e => this.deleteData(e));
                this.expenses.forEach(e => this.upsertData(e))

                this.fetchedExpenses = JSON.parse(JSON.stringify(this.expenses));

                alert('저장되었습니다.')
            }

        },
        async upsertData(expenseHere) {
            try {
                const { error } = await supabase
                    .from('expense')
                    .upsert(expenseHere)
                    .eq('id', expenseHere.id)
                if (error) {
                    throw error;
                }
            } catch (error) {
                console.error(error);
            }
        },
        async deleteData(expenseId) {
            try {
                const { error } = await supabase
                    .from('expense')
                    .delete()
                    .eq('id', expenseId)
                if (error) {
                    throw error;
                }
            } catch (error) {
                console.error(error);
            }
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
                this.expenses = "";
                this.expenses = JSON.parse(JSON.stringify(this.fetchedExpenses));
            }
        }

    },
    components: {
        //   PieChart
        ListItem,
        NewListItem
    }
}
</script>
  
<style scoped>@import '../style.css';</style>