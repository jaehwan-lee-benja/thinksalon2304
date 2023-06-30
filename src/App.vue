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
      session: '',
      pageHanderDiv: 'pageHanderDiv',
    }
  },
  mounted() {
    this.sessionListener();
  },
  components: {
    ReadingView,
    EditingView
  },
  methods: {
    async fetchData() {
        const a = await supabase
            .from('users')
            .select()
            .order('order', { ascending: true })
        const { data } = a;
        this.users = data;
    },
    addNewUser() {
      const user = this.session.user;
      const o = {
        id: user.id, 
      };
      this.insertData(o);
    },
    async insertData(oHere) { 
      try {
            const { error } = await supabase
                .from('users')
                .insert(oHere)
            if (error) {
                throw error;
            }
        } catch (error) {
            console.error(error);
        }
    },
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
    sessionListener() {
      supabase.auth.onAuthStateChange((event, session) => {
        console.log("sessionListener = ", event, session)

        this.session = session;

        if(session !== null) {

          const userIdNow = this.session.user.id;
          const usersArray = this.users;
          
          const isNew = usersArray.find(eachUser => eachUser.id == userIdNow);

          console.log("isNew =", isNew);

          // this.addNewUser();

          // this.isNewMember();

          // const user = session.user;
          // console.log("user = ", user);

          // console.log("created_at =", user.created_at);
          // console.log("updated_at =", user.updated_at);

          // if (user.created_at === user.updated_at) {
          //   console.log('신규 사용자입니다.');
          // } else {
          //   console.log('기존 사용자입니다.');
          // }

          this.loginMode = false;
          
        } else {
          this.loginMode = true;
        }

      })

    },
    async isNewMember() {
      const user = this.session.user;
      console.log("user @isNewMember =", user);
      
      const { data, error } = await supabase
          .from('users')
          .select('id')
          .eq('email', user.email)
          .single();

        if (error) {
          console.error('사용자 검색 오류:', error);
        } else {
          if (data) {
            console.log('기존 사용자입니다.');
          } else {
            console.log('신규 사용자입니다.');
          }
        }
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