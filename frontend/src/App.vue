<template>
  <MessageScroller :messages="messages" />
  <form @submit.prevent="sendMessage">
    <input type="text" autofocus placeholder="Message..." v-model="composedMessage" />
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
    message: 'connecting...',
    system: true
  }]

  composedMessage = ''

  join = new Audio('/joinchat.mp3')
  leave = new Audio('/leftchat.mp3')
  pop = new Audio('/pop.mp3')

  mounted (): void {
    this.socket = io('/')
    this.socket.on('prompt', s => {
      this.prompt = s
      this.messages.push({
        id: 'nb',
        message: `Prompt: ${s}`,
        system: true
      })
    })
    this.socket.emit('requestGroup')
    this.socket.io.on('reconnect', () => this.socket.emit('requestGroup'))

    this.socket.on('groupAssignment', group => {
      this.messages.push({
        id: 'nb',
        message: `You have been assigned to group ${group}.`,
        system: true
      })
    })

    this.socket.on('messageCreate', message => {
      this.pop.play()
      this.messages.push({
        ...message,
        system: false
      })
    })

    this.socket.on('memberJoin', id => {
      this.join.play()
      this.messages.push({
        id,
        system: true,
        message: `${this.socket.id === id ? 'You j' : 'J'}oined the group`
      })
    })

    this.socket.on('memberLeave', id => {
      this.leave.play()
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
  }

  unmounted (): void {
    this.socket.disconnect()
  }
}
</script>

<style lang="scss">
body {
  margin: 0;
}

#app {
  height: calc(100vh - 1em);
  margin: 0.5em;
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
