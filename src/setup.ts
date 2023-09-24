import Elysia from 'elysia'
import { User } from './database/models/users'

const setup = new Elysia({
  name: 'setup',
})
  .state('User', User)
  .decorate('ApiResponse', (data: any) => {
    return new Response(JSON.stringify(data))
  })

export default setup
