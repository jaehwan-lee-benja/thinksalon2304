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
            <ol>
                <li v-for="page in this.expensePages" :key="page.index">
                    <input v-model="page.page_name">
                    <button @click="editPage(page)">수정하기</button>
                    <button @click="deletePage(page.id)">삭제하기</button>
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
    },
    mixins: [CssData],
    data() {
        return {
            newPageName: '',
        }
    },
    methods: {
        createNewPage() {
            this.$emit('create-new-page', this.newPageName);
        },
        editPage(pageHere) {
            const confirmValue = confirm("저장하시겠습니까?")
            if (confirmValue) {
                this.$emit('upsert-page', pageHere);
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

