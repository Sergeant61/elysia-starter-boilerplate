import { Schema, model, Model } from 'mongoose'

// 1. Create an interface representing a document in MongoDB.
export interface IUser {
  profile: {
    firstName: string
    lastName: string
  }
  identifiers: Array<{
    type: 'email' | 'phoneNumber'
    identifier: string
    password: string | null
  }>,
  createdAt?: Date
  updatedAt?: Date
}

export interface IUserDocument extends IUser, Document {
  fullName(): string
}

interface UserQueryHelpers {
}

export interface IUserModel extends Model<IUser, UserQueryHelpers> {
  test(): string
}

// 2. Create a Schema corresponding to the document interface.
export const UserSchema = new Schema<IUserDocument, IUserModel>({
  profile: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true }
  },
  identifiers: [{
    type: { type: String, enum: ['email', 'phoneNumber'], required: true },
    identifier: { type: String, index: true, required: true },
    password: { type: String, required: true }
  }]
}, { timestamps: true, versionKey: false })

UserSchema.method('fullName', function fullName() {
  return this.profile.firstName + ' ' + this.profile.lastName
})

UserSchema.static('test', function test() {
  return 'test'
})

// 3. Create a Index.
UserSchema.index({ 'identifiers.identifier': 'text', 'profile.firstName': 'text', 'profile.lastName': 'text' })

// 4. Must be string field.
export const UserIndexes = ['identifiers.identifier']

// 5. Create a Model.
export const User = model<IUserDocument, IUserModel>('users', UserSchema)
