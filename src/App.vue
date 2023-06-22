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
        <!-- <button @click="getSession">getSession</button> -->
      </div>


      <LoginView />

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
import LoginView from './views/LoginView.vue'
import { supabase } from './lib/supabaseClient.js'

export default {
  data() {
    return {
      mode: true,
      appBodyGrid: 'appBodyGrid',
      menuDiv: 'menuDiv',
      session: '',
      pageHanderDiv: 'pageHanderDiv',
    }
  },
  mounted() {
    this.sessionListener();
  },
  components: {
    ReadingView,
    EditingView,
    LoginView
  },
  methods: {
    sessionListener() {
      supabase.auth.onAuthStateChange((event, session) => {
        console.log("sessionListener = ", event, session)
        this.session = session;
      })
    },
    handlingMode() {
      this.mode = !this.mode
    },
    async getSession() {
      const { data, error } = await supabase.auth.getSession()
      console.log("session = ", data)
      console.log("error = ", error)
    }
  }
}
</script>

<style scoped>
  @import './style.css';
</style>