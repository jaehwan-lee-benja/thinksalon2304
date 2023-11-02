<template>
    <div :class="pageDiv">

        <select v-model="pageName" @change="selectPage()">
            <option v-for="page in this.expensePages" :key="page.id" :value="page.page_name">
                {{ page.page_name }}
            </option>
        </select>

        <button @click="openPageDiv()">페이지 설정하기</button>
        <!-- <div :class="blackBg" v-if="isPageDivOpened">
            <div :class="whiteBg"> -->
        <div v-if="isPageDivOpened">
            <div>   
                <PageList v-bind:expenses="expenses"/>
            </div>
        </div>
    </div>

    <div :class="sectionGrid">
        <div :class="listViewDiv">
            
            <h2>리스트 뷰</h2>

            <div :class="listViewLiDiv">
                <input :class="categoryStyle" :value="this.getTotalExpense.category">
                <span> : </span>
                <input :class="amountStyle" :value="this.getTotalExpense.amount">
            </div>
            <span> *하위 합계 : </span>
            <input :class="amountStyle" :value="sumExpensesForTotal(this.getTotalExpense.id)" readonly>

            <ol :class="olBgStyle">

                <li :class="listViewLiStyle"
                    v-for="expense2 in sortChildrenByIdAndLevel(this.getTotalExpense.id, this.getTotalExpense.level)"
                    :key="expense2.index">

                    <ListItem v-bind:expenses="expenses" :expenseId="expense2.id" 
                    @remove-expense="removeExpense" @toggle-sub-list="toggleSubList" 
                    :toggleActiveHandler="this.toggleActiveHandler[expense2.id]" />

                    <ol :class="olBgStyle" v-if="expense2.show_sub_list">
                        <li :class="listViewLiStyle"
                            v-for="expense3 in sortChildrenByIdAndLevel(expense2.id, expense2.level)"
                            :key="expense3.index">

                            <ListItem v-bind:expenses="expenses" :expenseId="expense3.id"
                                @remove-expense="removeExpense" @toggle-sub-list="toggleSubList" 
                                :toggleActiveHandler="this.toggleActiveHandler[expense3.id]" />

                            <ol :class="olBgStyle" v-if="expense3.show_sub_list">
                                <li :class="listViewLiStyle"
                                    v-for="expense4 in sortChildrenByIdAndLevel(expense3.id, expense3.level)"
                                    :key="expense4.index">

                                    <ListItem v-bind:expenses="expenses" :expenseId="expense4.id"
                                        @remove-expense="removeExpense" @toggle-sub-list="toggleSubList" 
                                        :toggleActiveHandler="this.toggleActiveHandler[expense4.id]"/>

                                    <ol :class="olBgStyle" v-if="expense4.show_sub_list">
                                        <li :class="listViewLiStyle"
                                            v-for="expense5 in sortChildrenByIdAndLevel(expense4.id, expense4.level)"
                                            :key="expense5.index">

                                            <ListItem v-bind:expenses="expenses" :expenseId="expense5.id"
                                                @remove-expense="removeExpense" @toggle-sub-list="toggleSubList" 
                                                :toggleActiveHandler="this.toggleActiveHandler[expense5.id]" />

                                        </li>
                                        <NewListItem v-bind:expenses="expenses" :expenseId="expense4.id"
                                            @create-new-expense="createNewExpense" />
                                    </ol>

                                </li>
                                <NewListItem v-bind:expenses="expenses" :expenseId="expense3.id"
                                    @create-new-expense="createNewExpense" />
                            </ol>

                        </li>
                        <NewListItem v-bind:expenses="expenses" :expenseId="expense2.id"
                            @create-new-expense="createNewExpense" />
                    </ol>

                </li>

                <NewListItem v-bind:expenses="expenses" :expenseId="this.getTotalExpense.id"
                    @create-new-expense="createNewExpense" />
            </ol>

        </div>
        <div :class="flowViewDiv">
            <h2>플로우 뷰</h2>
            <GraphExample v-bind:expenses="expenses"/>
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
import ListItem from './ListItem.vue'
import NewListItem from './NewListItem.vue'
import PageList from './PageList.vue'
import GraphExample from './GraphExample.vue'
//   import PieChart from './Pie.vue'

export default {

    data() {
        return {

            totalExpenses: [],
            expenses: [],
            fetchedExpenses: [],
            expensePages: [],
            selectedPageId: '',

            unitDiv: 'unitDiv',
            subGrid: 'subGrid',
            sectionGrid: 'sectionGrid',
            flowViewDiv: 'flowViewDiv',
            listViewDiv: 'listViewDiv',
            listViewLiDiv: 'listViewLiDiv',

            categoryStyle: 'categoryStyle',
            amountStyle: 'amountStyle',
            saveEditedStyle_active: 'saveEditedStyle_active',
            saveEditedStyle_inactive: 'saveEditedStyle_inactive',
            cancelEditedStyle_active: 'cancelEditedStyle_active',
            cancelEditedStyle_inactive: 'cancelEditedStyle_inactive',
            saveEditedDiv: 'saveEditedDiv',
            listViewLiStyle: 'listViewLiStyle',
            listViewOlStyle: 'listViewOlStyle',
            olBgStyle:'olBgStyle',
            pageDiv: 'pageDiv',
            blackBg: "blackBg",
            whiteBg: "whiteBg",

            isPageDivOpened: false,
            isEditValue: true,
            toggleActiveHandler: {},

        }
    },
    mounted() {
        this.fetchData(),
        this.monitorIsEdited()
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
        selectPage() {
            let selectedPage = this.expensePages.filter(e => e.page_name === this.pageName)
            console.log("selectedPage.length = ", selectedPage.length);
            if(selectedPage.length == 0) {
                selectedPage = [this.expensePages[0]]
            }
            this.selectedPageId = selectedPage[0].id
            console.log("this.selectedPageId = ", this.selectedPageId);
            this.expenses = this.totalExpenses.filter(e => e.page_id === this.selectedPageId)
            // 여기부터
            this.fetchedExpenses = JSON.parse(JSON.stringify(this.expenses));
            this.expenses.forEach(e => {
                if(e.level == 5) { this.toggleActiveHandler[e.id] = false; }
            })
            // 여기까지 함수로 묶기 필요(반복됨)
        },
        openPageDiv() {
            this.isPageDivOpened = !this.isPageDivOpened;
        },
        controlToggleActiveHandler(expenseHere){    
            if( expenseHere.level == 5 ) {
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
            this.controlToggleActiveHandler(expenseHere);
            if(expenseHere.level < 5 ){
                expenseHere.show_sub_list = !expenseHere.show_sub_list;
                this.upsertData(expenseHere)
            }
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
                level: levelForO,
                show_sub_list: false,
                page_id: this.selectedPageId
            };

            if(levelForO < 5) {
                this.toggleActiveHandler[o.id] = true;
            } else {
                this.toggleActiveHandler[o.id] = false;
            }

            this.expenses.push(o);
        },
        async fetchData() {

            this.fetchDataForPage()
            const a = await supabase
                .from('expense')
                .select()
                .order('order', { ascending: true })
            const { data } = a;
            this.totalExpenses = data;
            this.selectPage();
            this.fetchedExpenses = JSON.parse(JSON.stringify(data));
            this.expenses.forEach(e => {
                if(e.level == 5) { this.toggleActiveHandler[e.id] = false; }
            })
        },
        async fetchDataForPage() {
            const a = await supabase
                .from('expense_page')
                .select()
            const { data } = a;
            this.expensePages = data;
            console.log("this.expensePages = ", this.expensePages);
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
        ListItem,
        NewListItem,
        PageList,
        GraphExample,
        //   PieChart
    }
}
</script>
  
<style scoped>@import '../style.css';</style>