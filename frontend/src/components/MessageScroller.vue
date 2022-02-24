<template>
  <div class="message-scroller">
    <Message v-for="(message, idx) in reversed" :key="idx" :message="message" />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import Message from '@/components/Message.vue'

@Options({
  components: {
    Message
  },
  props: {
    messages: Array
  }
})
export default class HelloWorld extends Vue {
  messages!: Array<{id: string, message: string, system: boolean}>

  get reversed (): Array<{id: string, message: string, system: boolean}> {
    return [...this.messages].reverse()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.message-scroller {
  display: flex;
  flex-direction: column-reverse;
  overflow-y: scroll;
  gap: 0.5em;
}
</style>
