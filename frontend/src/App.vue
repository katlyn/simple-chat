<template>
  <MessageScroller :messages="messages" />
  <form @submit.prevent="sendMessage">
    <input ref="input" type="text" autofocus placeholder="Message..." v-model="composedMessage" />
    <button type="submit">Send</button>
  </form>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import { io, Socket } from 'socket.io-client'
import MessageScroller from './components/MessageScroller.vue'

@Options({
  components: {
    MessageScroller
  }
})
export default class App extends Vue {
  socket!: Socket
  group!: number
  prompt = ''
  messages: Array<{id: string, message: string, system: boolean}> = [{
    id: 'nb',
    message: 'Connecting...',
    system: true
  }]

  composedMessage = ''

  join = '/joinchat.mp3'
  leave = '/leftchat.mp3'
  pop = '/pop.mp3'

  mounted (): void {
    this.socket = io('/')
    this.socket.on('prompt', s => {
      this.prompt = s
      this.messages.push({
        id: 'nb',
        message: s,
        system: true
      })
    })
    this.socket.emit('requestGroup')
    this.socket.io.on('reconnect', () => this.socket.emit('requestGroup'))

    this.socket.on('groupAssignment', group => {
      this.messages.push({
        id: 'nb',
        message: `You have been assigned to group ${group + 1}.`,
        system: true
      })
    })

    this.socket.on('messageCreate', message => {
      new Audio(this.pop).play()
      this.messages.push({
        ...message,
        system: false
      })
    })

    this.socket.on('memberJoin', id => {
      new Audio(this.join).play()
      this.messages.push({
        id,
        system: true,
        message: `${this.socket.id === id ? 'You j' : 'J'}oined the group`
      })
    })

    this.socket.on('memberLeave', id => {
      new Audio(this.leave).play()
      this.messages.push({
        id,
        system: true,
        message: 'Left the group'
      })
    })
  }

  sendMessage (): void {
    if (this.composedMessage.length > 0) {
      console.log(this.composedMessage)
      this.socket.emit('createMessage', this.composedMessage)
      this.composedMessage = ''
    }
    (this.$refs.input as HTMLInputElement).focus()
  }

  unmounted (): void {
    this.socket.disconnect()
  }
}
</script>

<style lang="scss">
html {
  height: 100%;
}
body {
  height: calc(100% - 1em);
  padding: 0.5em;
  margin: 0;
}

#app {
  height: 100%;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;

  display: grid;
  grid-template-rows: 1fr auto;
  gap: 0.5em;

  form {
    display: grid;
    grid-template-columns: 1fr auto;
    border: #8995a1 1px solid;

    input, button {
      font-size: inherit;
      font-family: inherit;
      color: inherit;
      border: none;
      padding: 0.5em;
      outline: none;
    }
  }
}
</style>
