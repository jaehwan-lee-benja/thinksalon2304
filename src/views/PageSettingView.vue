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
                        'pageNameEditedBtn_active': isPageNameEdited === true,
                        'pageNameEditedBtn_inactive': isPageNameEdited === false
                    }" :disabled="!isPageNameEdited" @click="editPage()">수정 저장하기</button>
            <ol>
                <li v-for="page in this.expensePages" :key="page.id">
                    <input :class="pageNameStyle" v-model="page.page_name">
                    <button @click="deletePage(page.id)">삭제하기</button>
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
        isPageNameEdited: {
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
            const confirmValue = confirm("저장하시겠습니까?")
            if (confirmValue) {
                this.$emit('upsert-page');
                alert('수정되었습니다.')
            }
        },
        async deletePage(pageIdHere) {
            const confirmValue = confirm("정말로 삭제하시겠습니까? 삭제된 데이터는 복구가 불가능합니다.")
            if (confirmValue) {
                this.$emit('delete-page', pageIdHere);
            }
        },
    }

}
</script>

<style scoped>
@import '../style.css';
</style>

