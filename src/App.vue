<template>
  <div :class="appBodyGrid">
    <div :class="menuDiv">
      <div :class="titleDiv">
        <h1>현금흐름 관리하기</h1>
      </div>
      <div :class="pageHanderDiv">
        <button @click="handlingMode"> 
          <span v-if="mode">편집하기</span>
          <span v-else>뒤로가기</span> 
        </button>
        <div>
          <p v-if="mode">'편집하기' 버튼을 누르면, 내용을 편집할 수 있습니다.</p>
          <p v-else>'뒤로가기' 버튼을 누르면, 편집모드가 종료됩니다.(저장되지 않음)</p>
        </div>
        
      </div>
      <div :class="loginMenuDiv">
          <div v-if="loginMode" >
            <button @click="loginGoogle">구글 로그인</button>
            <p> *버튼을 눌러 로그인할 수 있습니다.</p>
          </div>
          <div v-else>
            <p>로그인 계정: {{ email }}</p>
            <button @click="signout">로그아웃</button>
          </div>
        </div>
      
    </div>
    <div :class="mainViewGrid">
      <ReadingView v-if="mode" />
      <EditingView v-else />
    </div>
  </div>
</template>

<script>
import ReadingView from './views/ReadingView.vue'
import EditingView from './views/EditingView.vue'
// import { supabase } from './lib/supabaseClient.js'

export default {
  data() {
    return {
      mode: true,
      appBodyGrid: 'appBodyGrid',
      menuDiv: 'menuDiv',
      pageHanderDiv: 'pageHanderDiv',
      loginMenuDiv: 'loginMenuDiv',
      titleDiv: 'titleDiv',
      mainViewGrid: 'mainViewGrid'
    }
  },
  mixins: [ReadingView],
  components: {
    ReadingView,
    EditingView
  },
  methods: {
    handlingMode() {
      this.mode = !this.mode
    },
  }
}
</script>

<style scoped>
  @import './style.css';
</style>