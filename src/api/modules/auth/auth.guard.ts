import { AppContext } from "../../../app"

export async function authGuard({ set, jwt, request, store: { User } }: AppContext) {
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
