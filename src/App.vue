<template>
  <nav>
      <router-link to="/reading">읽기모드</router-link> 
      <router-link to="/editing">편집모드</router-link>
  </nav>
  <!-- <button @click="handlingMode"> mode </button>

    <div v-if="mode">
      <nav>
        <router-link to="/reading">읽기모드</router-link> 
      </nav>
    </div>
    <div v-else> 
      <nav>
        <router-link to="/editing">편집모드</router-link>
      </nav>
    </div> -->
  <router-view /> <!-- 실제 페이지가 보여질 위치 -->
</template>

<script>
export default {
  data() {
    return {
      mode: true
    }
  },
  methods: {
    handlingMode() {
      this.readingMode = !this.readingMode
      console.log("this.readingMode = ", this.readingMode);
    }
  }
}
</script>