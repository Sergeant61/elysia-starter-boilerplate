import Elysia from 'elysia'
import { AuthController } from './auth.controller'

export class AuthModule {
  readonly app
  constructor(app: Elysia<'/api/v1'>) {
    this.app = new Elysia({ prefix: '/auth' })
    new AuthController(this.app)
    app.use(this.app)
  }
}
