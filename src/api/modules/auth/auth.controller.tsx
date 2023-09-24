import Elysia, { t } from 'elysia'
import { AppContext } from '../../../app'
import React from 'react'
import { authGuard } from './auth.guard'
import checkEmailAddress from '../../../utils/helpers/check-email-address'
import checkPhoneNumber from '../../../utils/helpers/check-phone-number'
import bcrypt from 'bcryptjs'

export class AuthController {
  constructor(private readonly app: Elysia<'/auth'>) {
    // @ts-ignore
    this.app.post('/sign-in', this.signIn.bind(this), {
      body: t.Object({
        identifier: t.String({
          minLength: 8,
          maxLength: 50
        }),
        password: t.String({ minLength: 8, maxLength: 50 })
      }),
      beforeHandle: function ({ body, set, request }) {
        if (checkEmailAddress(body.identifier)) {
          request.identifierType = 'email'
        } else if (checkPhoneNumber(body.identifier)) {
          request.identifierType = 'phoneNumber'
        } else {
          set.status = 422
          return 'Unprocessable Content'
        }
      }
    })
    // @ts-ignore
    this.app.post('/sign-up', this.signUp.bind(this), {
      body: t.Object({
        profile: t.Object({
          firstName: t.String({ minLength: 2, maxLength: 100 }),
          lastName: t.String({ minLength: 2, maxLength: 100 })
        }),
        identifier: t.String({
          minLength: 8,
          maxLength: 50
        }),
        password: t.String({ minLength: 8, maxLength: 50 })
      }),
      beforeHandle: function ({ body, set, request }) {
        if (checkEmailAddress(body.identifier)) {
          request.identifierType = 'email'
        } else if (checkPhoneNumber(body.identifier)) {
          request.identifierType = 'phoneNumber'
        } else {
          set.status = 422
          return 'Unprocessable Content'
        }
      }
    })
    // @ts-ignore
    this.app.get('/profile', this.profile.bind(this), {
    })
    // @ts-ignore
    this.app.get('/me', this.me.bind(this), {
      beforeHandle: async function ({ set, jwt, request, store: { User } }: AppContext) {
        const token = request.headers.get('authorization')?.split(' ')?.[1]
        let userData = token ? await jwt.verify(token) : null

        if (!userData) {
          set.status = 401
          return 'Unauthorized'
        }

        const user = await User.findOne({ _id: userData._id })

        if (!user) {
          set.status = 401
          return 'Unauthorized'
        }

        request.user = {
          _id: user._id.toString(),
          profile: user.profile,
          identifiers: user.identifiers.map(identifier => {
            identifier.password = null
            return identifier
          }),
          createdAt: user.createdAt as Date,
          updatedAt: user.updatedAt as Date
        }
      }
    })
  }

  async signIn({ body, jwt, request, set, store: { User } }: AppContext) {
    const user = await User.findOne({
      'identifiers': {
        $elemMatch: {
          type: request.identifierType,
          identifier: body.identifier,
        },
      },
    })

    const identifier = user?.identifiers.find(i => {
      return i.type === request.identifierType && i.identifier === body.identifier
    })

    if (!user || !identifier) {
      set.status = 404
      return 'Not found user'
    }

    if (identifier.password && !bcrypt.compareSync(body.password, identifier.password)) {
      set.status = 404
      return 'Password is wrong'
    }

    const token = await jwt.sign({
      _id: user._id,
      identifiers: user.identifiers.map(identifier => {
        identifier.password = null
        return identifier
      })
    })
    return {
      user,
      access_token: token,
      token_type: 'Bearer',
      expires_in: 7 * 24 * 60 * 60 * 1000, // 7days
    }
    return {}
  }

  async signUp({ body, jwt, request, set, store: { User } }: AppContext) {
    let user = await User.findOne({
      'identifiers': {
        $elemMatch: {
          type: request.identifierType,
          identifier: body.identifier,
        },
      },
    })

    if (user) {
      set.status = 422
      return 'Already exists user'
    }

    user = await new User({
      profile: body.profile,
      identifiers: [{
        type: request.identifierType,
        identifier: body.identifier,
        password: bcrypt.hashSync(body.password, Bun.env.SALT)
      }]
    }).save()

    const token = await jwt.sign({
      _id: user._id,
      identifiers: user.identifiers.map(identifier => {
        identifier.password = null
        return identifier
      })
    })

    return {
      user,
      access_token: token,
      token_type: 'Bearer',
      expires_in: 7 * 24 * 60 * 60 * 1000, // 7days
    }
  }

  async me({ body, jwt, request, set, store: { User } }: AppContext) {
    return request.user
  }

  async profile({ body }: AppContext) {
    return (
      <html lang="en">
        <head>
          <title>Hello World</title>
        </head>
        <body>
          <h1>Hello World</h1>
        </body>
      </html>
    )
  }
}
