<template>
  <div class="message" :class="{ system: message.system }" :style="{ borderColor: color }">
    <div class="color" :style="{ background: color }"></div>
    <span>
      {{ message.message }}
    </span>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import stc from 'string-to-color'

@Options({
  props: {
    message: Object
  }
})
export default class HelloWorld extends Vue {
  message!:{ id: string, message: string, system: boolean }

  get color (): string {
    return stc(this.message.id)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.message {
  border: 1px solid;
  display: flex;
  align-items: center;
  gap: 1em;
  padding: 0.5em;
  text-align: left;

  &.system {
    font-style: italic;
  }

  .color {
    align-self: stretch;
    width: 1em;
    flex-shrink: 0;
  }
}
</style>
