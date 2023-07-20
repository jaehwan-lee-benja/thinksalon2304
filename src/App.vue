<template>
  <div :class="mainBodyDiv">
    <div :class="menuDiv">
      <div :class="titleDiv">
        <h1>현금흐름 관리하기</h1>
      </div>
      <div :class="subMenuGrid">
        <div :class="pageHanderDiv">
          <div v-if="mode">
            <button @click="handlingMode">편집모드로 전환</button>
            <span v-if="mode"> 버튼을 누르면, 내용을 편집할 수 있습니다.</span>
          </div>
          <div v-else>
            <button @click="handlingMode">읽기모드로 전환</button>
            <span> 버튼을 누르면, 편집모드가 종료됩니다.</span>
          </div>
        </div>
        <div :class="loginMenuDiv">
            <div v-if="loginMode" >
              <button @click="loginGoogle">구글 로그인</button>
              <span> *버튼을 눌러 로그인할 수 있습니다.</span>
            </div>
            <div v-else>
              <span> 로그인 계정: {{ email }} | </span>
              <button @click="signout">로그아웃</button>

            </div>
        </div>
      </div>

      
    </div>
    <div :class="mainViewDiv">
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
      menuDiv: 'menuDiv',
      pageHanderDiv: 'pageHanderDiv',
      loginMenuDiv: 'loginMenuDiv',
      titleDiv: 'titleDiv',
      mainViewDiv: 'mainViewDiv',
      subMenuGrid: 'subMenuGrid',
      mainBodyDiv: 'mainBodyDiv',
    }
  },
  mixins: [ReadingView],
  components: {
    ReadingView,
    EditingView
  },
  methods: {
    handlingMode() {
      console.log("this.mode1 = ", this.mode);
      if(!this.mode) {
        confirm("편집모드를 종료하시겠습니까? 수정 후 저장하지 않은 내용은 저장되지 않습니다.")
      }

      this.mode = !this.mode
      
      console.log("this.mode2 = ", this.mode);
    },
  }
}
</script>

<style scoped>
  @import './style.css';
</style>