<template>
  <div :class="appBodyGrid">
    <div :class="menuDiv">
      <h1>
        <div>현금흐름</div>
        <div>관리하기</div>
      </h1>
      <button @click="handlingMode"> 
        <span v-if="mode">편집하기</span>
        <span v-else>뒤로가기</span> 
      </button>
      <div>
        <span v-if="mode">'편집하기' 버튼을 누르면, 내용을 편집할 수 있습니다.</span>
        <span v-else>'뒤로가기' 버튼을 누르면, 편집모드가 종료됩니다.(저장되지 않음)</span>
      </div>
      <span>email:</span><input v-model="email">
      <span>password:</span><input v-model="password">
      <button @click="signup">sing-up</button>
      <button @click="login">login</button>
      <button @click="signout">sign-out</button>
      <button @click="getSession">getSession</button>
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
      mode: true,
      appBodyGrid: 'appBodyGrid',
      menuDiv: 'menuDiv',
      email: '',
      password: '',
    }
  },
  components: {
    ReadingView,
    EditingView
  },
  methods: {
    handlingMode() {
      this.mode = !this.mode
    },
    async signup() {
      const { data, error } = await supabase.auth.signUp({
        email: this.email,
        password: this.password,
      })
    console.log("email = ", this.email);
    console.log("password = ", this.password);
    console.log("data = ", data);
    console.log("error = ", error);
    },
    async login() {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: this.email,
        password: this.password,
      })
    console.log("data = ", data);
    console.log("error = ", error);
    
    },
    async getSession() {
      const { data, error } = await supabase.auth.getSession()
      console.log("session = ", data)
      console.log("error = ", error);
    },
    async signout() {
      const { error } = await supabase.auth.signOut()
      console.log("error = ", error);
    
    },
    
  }
}
</script>

<style scoped>
  @import './style.css';
</style>