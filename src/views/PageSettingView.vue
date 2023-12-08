<template>
    <div :class="pageListStyle">
        <h2>페이지 설정하기</h2>
        <div :class="createNewPageDiv">
            <h4>새 페이지 만들기</h4>
            <span>새 페이지명: </span>
            <input v-model="this.newPageName" placeholder="새 페이지명 적기">
            <button @click="createNewPage">만들기</button>

        </div>

        <div>
            <h4>기존 페이지 수정하기</h4>
            <button :class="{
                'pageNameEditedBtn_active': isPageEdited === true,
                'pageNameEditedBtn_inactive': isPageEdited === false
            }" :disabled="!isPageEdited" @click="editPage()">수정 저장하기</button>
            <ol>
                <li v-for="page in this.expensePages" :key="page.id">
                    <input :class="pageNameStyle" v-model="page.page_name">
                    <button @click="removePage(page)">삭제하기</button>
                    <button @click="selectPage(page.id)">페이지로 이동하기</button>
                </li>
            </ol>

        </div>
    </div>
</template>

<script>
import CssData from './CssData.vue'

export default {
    name: 'PageListView',
    props: {
        expenses: {
            type: Object,
            default: () => { }
        },
        expensePages: {
            type: Object,
            default: () => { }
        },
        isPageEdited: {
            type: Boolean,
            default: false
        },
    },
    mixins: [CssData],
    data() {
        return {
            newPageName: '',
        }
    },
    methods: {
        selectPage(pageIdHere) {
            this.$emit('selectPage', pageIdHere);
            this.$emit('close-page-div');
        },
        createNewPage() {
            this.$emit('create-new-page', this.newPageName);
            this.newPageName = "";
        },
        editPage() {
            this.$emit('edit-page');
            alert('수정되었습니다.')
        },
        async removePage(pageHere) {
            const confirmValue = confirm("삭제하시겠습니까? 삭제 후, '저장'버튼을 눌러야 삭제가 완료됩니다.")
            if (confirmValue) {
                this.$emit('remove-page', pageHere);
            }
        },
    }

}
</script>

<style scoped>
@import '../style.css';
</style>

