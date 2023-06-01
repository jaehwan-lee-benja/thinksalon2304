<template>
  <!-- <nav>
      <router-link to="/reading">읽기모드</router-link> 
      <router-link to="/editing">편집모드</router-link>
  </nav> -->
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

  <button @click="handlingMode"> 
    <span v-if="mode">읽기모드</span>
    <span v-else>편집모드</span> 
  </button>

  <ReadingView v-if="mode" />
  <EditingView v-else />

</template>

<script>
import ReadingView from './views/ReadingView.vue'
import EditingView from './views/EditingView.vue'

export default {
  data() {
    return {
      mode: true
    }
  },
  components: {
    ReadingView,
    EditingView
  },
  methods: {
    handlingMode() {
      this.mode = !this.mode
      console.log("this.mode = ", this.mode);
    }
  }
}
</script>