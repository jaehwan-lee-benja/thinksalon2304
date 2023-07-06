<template>
  <div :class="appBodyGrid">
    <div :class="menuDiv">
      <h1>
        <div>현금흐름</div>
        <div>관리하기</div>
      </h1>
      <div :class="pageHanderDiv">
        <button @click="handlingMode"> 
          <span v-if="mode">편집하기</span>
          <span v-else>뒤로가기</span> 
        </button>
        <div>
          <span v-if="mode">'편집하기' 버튼을 누르면, 내용을 편집할 수 있습니다.</span>
          <span v-else>'뒤로가기' 버튼을 누르면, 편집모드가 종료됩니다.(저장되지 않음)</span>
        </div>
      </div>

      <button v-if="loginMode" @click="loginGoogle">구글 로그인</button>
      <button v-else @click="signout">sign-out</button>

    </div>
    <div>
      <ReadingView v-if="mode" />
      <EditingView v-else />
    </div>
  </div>
</template>

<script>
import ReadingView from './views/ReadingView.vue'
import EditingView from './views/EditingView.vue'
import { supabase } from './lib/supabaseClient.js'

export default {
  data() {
    return {
      users: '',
      loginMode: true,
      mode: true,
      appBodyGrid: 'appBodyGrid',
      menuDiv: 'menuDiv',
      pageHanderDiv: 'pageHanderDiv',
    }
  },
  components: {
    ReadingView,
    EditingView
  },
  methods: {
    async loginGoogle() {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google'
      })
      console.log("data = ", data);
      console.log("error = ", error);
    },
    async signout() {
      const { error } = await supabase.auth.signOut()
      console.log("error = ", error);
      if(error == null) {
        alert('로그아웃 되었습니다.')
        window.location.reload(true); // 리로드 방식 expense를 []로
      } else {
        alert('checking..')
      }
    },
    handlingMode() {
      this.mode = !this.mode
    },
  }
}
</script>

<style scoped>
  @import './style.css';
</style>