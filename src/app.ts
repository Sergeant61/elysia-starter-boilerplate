import { Context, Elysia } from "elysia"
import { swagger } from '@elysiajs/swagger'
import { rateLimit } from 'elysia-rate-limit'
import { helmet } from 'elysia-helmet'
import { logger } from '@bogeychan/elysia-logger'
import { staticPlugin } from '@elysiajs/static'
import { I18NextRequest, i18next } from "elysia-i18next"
import { cors } from '@elysiajs/cors'
import { html } from "@elysiajs/html"
import jwt from "@elysiajs/jwt"
import { Logger } from "@bogeychan/elysia-logger/src/types"
import setup from "./setup"

// * Modules
import { AuthModule } from "./api/modules/auth/index.module"

// * Database
import connectMongoDb from "./database/connect"
import { IUser, User } from "./database/models/users"
import cookie from "@elysiajs/cookie"

const app = new Elysia()
  .use(setup)
  .use(swagger({
    documentation: {
      info: {
        title: 'Swagger',
        version: '1.0.0',
      },
    },
  })) // ref: https://elysiajs.com/plugins/swagger.html
  .use(cors()) // ref: https://elysiajs.com/plugins/cors.html
  .use(helmet()) // ref: https://github.com/DevTobias/elysia-helmet
  .use(jwt({
    name: 'jwt',
    secret: Bun.env.JWT_SECRET,
    exp: '7d',
  })) // ref: https://elysiajs.com/plugins/jwt.html
  .use(cookie())
  .use(staticPlugin()) // ref: https://elysiajs.com/plugins/static.html
  .use(rateLimit({ max: 100 })) // ref: https://github.com/rayriffy/elysia-rate-limit
  .use(logger({ level: 'trace' })) // ref: https://github.com/bogeychan/elysia-logger
  .use(i18next({})) // ref: https://github.com/eelkevdbos/elysia-i18next
  .use(html()) // ref: https://elysiajs.com/plugins/html.html
  .get('/', () => ({ status: 200, message: 'done' }))
  .group('/api', (app) => {

    app.group('/v1', (v1) => {
      v1.get('/', ({jwt}) => ({ status: 200, message: 'done' }))
      new AuthModule(v1)
      return v1
    })

    return app
  })


async function initialize() {
  connectMongoDb().then(() => {
    app.listen(+Bun.env.PORT, () => {
      console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
    })
  }).catch((error) => { console.log(error) })
}
initialize()

export type App = typeof app

export interface AppContext extends Context {
  store: typeof app.store
  jwt: {
    readonly sign: (morePayload: any) => Promise<string>
    readonly verify: (jwt?: string) => Promise<false | any>
  }
  request: Request & {
    html: (value: string) => Response
    user: IUser & { _id: string, createdAt: Date, updatedAt: Date }
    log: Logger
    identifierType?: string
  } & I18NextRequest
}

declare module 'bun' {
  export interface Env {
    readonly PORT: number
    readonly JWT_SECRET: string
    readonly MONGO_URL: string
    readonly SALT: number
  }
}
declare global { }
