import mongoose from 'mongoose'
import { UserModel } from '@/models/user.model'

describe('src :: models :: user.model', () => {
  describe('Schema Definition', () => {
    it('should be a mongoose model', () => {
      expect(UserModel).toBeDefined()
      expect(UserModel.prototype).toBeInstanceOf(mongoose.Model)
    })

    it('should have correct model name', () => {
      expect(UserModel.modelName).toBe('users')
    })

    it('should have correct collection name', () => {
      expect(UserModel.collection.name).toBe('users')
    })
  })

  describe('Schema Fields', () => {
    it('should have user_id field with correct type', () => {
      const schema = UserModel.schema
      const userIdPath = schema.path('user_id')

      expect(userIdPath).toBeDefined()
      expect(userIdPath.instance).toBe('String')
    })

    it('should have user_id field as required', () => {
      const schema = UserModel.schema
      const userIdPath = schema.path('user_id') as any

      expect(userIdPath.isRequired).toBe(true)
    })

    it('should have user_id field as unique', () => {
      const schema = UserModel.schema
      const userIdPath = schema.path('user_id') as any

      expect(userIdPath.options.unique).toBe(true)
    })

    it('should have name field with correct type', () => {
      const schema = UserModel.schema
      const namePath = schema.path('name')

      expect(namePath).toBeDefined()
      expect(namePath.instance).toBe('String')
    })

    it('should have name field as required', () => {
      const schema = UserModel.schema
      const namePath = schema.path('name') as any

      expect(namePath.isRequired).toBe(true)
    })

    it('should have name field with trim enabled', () => {
      const schema = UserModel.schema
      const namePath = schema.path('name') as any

      expect(namePath.options.trim).toBe(true)
    })

    it('should have name field with maxlength of 200', () => {
      const schema = UserModel.schema
      const namePath = schema.path('name') as any

      expect(namePath.options.maxlength).toBe(200)
    })

    it('should have created_at timestamp field', () => {
      const schema = UserModel.schema
      const createdAtPath = schema.path('created_at')

      expect(createdAtPath).toBeDefined()
    })

    it('should have updated_at timestamp field', () => {
      const schema = UserModel.schema
      const updatedAtPath = schema.path('updated_at')

      expect(updatedAtPath).toBeDefined()
    })
  })

  describe('Schema Options', () => {
    it('should have timestamps enabled', () => {
      const schema = UserModel.schema
      const options = schema.options as any

      expect(options.timestamps).toBeDefined()
      expect(options.timestamps.createdAt).toBe('created_at')
      expect(options.timestamps.updatedAt).toBe('updated_at')
    })

    it('should use custom timestamp field names', () => {
      const schema = UserModel.schema
      const options = schema.options as any

      expect(options.timestamps.createdAt).toBe('created_at')
      expect(options.timestamps.updatedAt).toBe('updated_at')
    })

    it('should have toJSON with virtuals enabled', () => {
      const schema = UserModel.schema
      const options = schema.options as any

      expect(options.toJSON).toBeDefined()
      expect(options.toJSON.virtuals).toBe(true)
    })

    it('should have toJSON with versionKey disabled', () => {
      const schema = UserModel.schema
      const options = schema.options as any

      expect(options.toJSON.versionKey).toBe(false)
    })

    it('should have toJSON transform function', () => {
      const schema = UserModel.schema
      const options = schema.options as any

      expect(options.toJSON.transform).toBeDefined()
      expect(typeof options.toJSON.transform).toBe('function')
    })
  })

  describe('Schema Validation', () => {
    it('should require user_id field', () => {
      const user = new UserModel({
        name: 'Test User',
      })

      const error = user.validateSync()

      expect(error).toBeDefined()
      expect(error?.errors.user_id).toBeDefined()
    })

    it('should require name field', () => {
      const user = new UserModel({
        user_id: 'user-123',
      })

      const error = user.validateSync()

      expect(error).toBeDefined()
      expect(error?.errors.name).toBeDefined()
    })

    it('should validate successfully with all required fields', () => {
      const user = new UserModel({
        user_id: 'user-123',
        name: 'Test User',
      })

      const error = user.validateSync()

      expect(error).toBeUndefined()
    })

    it('should fail validation when name exceeds maxlength', () => {
      const user = new UserModel({
        user_id: 'user-123',
        name: 'a'.repeat(201),
      })

      const error = user.validateSync()

      expect(error).toBeDefined()
      expect(error?.errors.name).toBeDefined()
    })

    it('should allow name at maxlength', () => {
      const user = new UserModel({
        user_id: 'user-123',
        name: 'a'.repeat(200),
      })

      const error = user.validateSync()

      expect(error).toBeUndefined()
    })

    it('should allow valid user_id format', () => {
      const user = new UserModel({
        user_id: 'user-12345678-1234-1234-1234-123456789abc',
        name: 'Test User',
      })

      const error = user.validateSync()

      expect(error).toBeUndefined()
    })
  })

  describe('Document Creation', () => {
    it('should create a document with all fields', () => {
      const data = {
        user_id: 'user-123',
        name: 'Test User',
      }

      const user = new UserModel(data)

      expect(user.user_id).toBe(data.user_id)
      expect(user.name).toBe(data.name)
    })

    it('should trim name field', () => {
      const user = new UserModel({
        user_id: 'user-123',
        name: '  Test User  ',
      })

      expect(user.name).toBe('Test User')
    })

    it('should be an instance of mongoose Document', () => {
      const user = new UserModel({
        user_id: 'user-123',
        name: 'Test User',
      })

      expect(user).toBeInstanceOf(mongoose.Document)
    })

    it('should have _id field', () => {
      const user = new UserModel({
        user_id: 'user-123',
        name: 'Test User',
      })

      expect(user._id).toBeDefined()
    })

    it('should have id virtual field', () => {
      const user = new UserModel({
        user_id: 'user-123',
        name: 'Test User',
      })

      expect((user as any).id).toBeDefined()
      expect(typeof (user as any).id).toBe('string')
    })
  })

  describe('Field Types', () => {
    it('should store user_id as string', () => {
      const user = new UserModel({
        user_id: 'user-123',
        name: 'Test User',
      })

      expect(typeof user.user_id).toBe('string')
    })

    it('should store name as string', () => {
      const user = new UserModel({
        user_id: 'user-123',
        name: 'Test User',
      })

      expect(typeof user.name).toBe('string')
    })
  })

  describe('Schema Indexes', () => {
    it('should have unique index on user_id field', () => {
      const schema = UserModel.schema
      const indexes = schema.indexes()

      const userIdIndex = indexes.find((index: any) => index[0].user_id)

      expect(userIdIndex).toBeDefined()
      expect(userIdIndex?.[1].unique).toBe(true)
    })
  })

  describe('toJSON Transform', () => {
    it('should transform _id to id in JSON output', () => {
      const user = new UserModel({
        user_id: 'user-123',
        name: 'Test User',
      })

      const json = user.toJSON()

      expect(json.id).toBeDefined()
      expect(typeof json.id).toBe('object')
      expect(json.id.toString()).toBe(user._id.toString())
    })

    it('should remove _id from JSON output', () => {
      const user = new UserModel({
        user_id: 'user-123',
        name: 'Test User',
      })

      const json = user.toJSON()

      expect(json._id).toBeUndefined()
    })

    it('should not include __v in JSON output', () => {
      const user = new UserModel({
        user_id: 'user-123',
        name: 'Test User',
      })

      const json = user.toJSON()

      expect(json.__v).toBeUndefined()
    })

    it('should include all other fields in JSON output', () => {
      const user = new UserModel({
        user_id: 'user-123',
        name: 'Test User',
      })

      const json = user.toJSON()

      expect(json.user_id).toBe('user-123')
      expect(json.name).toBe('Test User')
    })
  })

  describe('Model Methods', () => {
    it('should have findOne method', () => {
      expect(typeof UserModel.findOne).toBe('function')
    })

    it('should have findById method', () => {
      expect(typeof UserModel.findById).toBe('function')
    })

    it('should have create method', () => {
      expect(typeof UserModel.create).toBe('function')
    })

    it('should have deleteOne method', () => {
      expect(typeof UserModel.deleteOne).toBe('function')
    })

    it('should have find method', () => {
      expect(typeof UserModel.find).toBe('function')
    })

    it('should have updateOne method', () => {
      expect(typeof UserModel.updateOne).toBe('function')
    })

    it('should have findByIdAndUpdate method', () => {
      expect(typeof UserModel.findByIdAndUpdate).toBe('function')
    })

    it('should have countDocuments method', () => {
      expect(typeof UserModel.countDocuments).toBe('function')
    })
  })

  describe('Unique Constraints', () => {
    it('should have user_id as unique field', () => {
      const schema = UserModel.schema
      const userIdPath = schema.path('user_id') as any

      expect(userIdPath.options.unique).toBe(true)
    })
  })

  describe('Field Trimming', () => {
    it('should trim leading whitespace from name', () => {
      const user = new UserModel({
        user_id: 'user-123',
        name: '   Test User',
      })

      expect(user.name).toBe('Test User')
    })

    it('should trim trailing whitespace from name', () => {
      const user = new UserModel({
        user_id: 'user-123',
        name: 'Test User   ',
      })

      expect(user.name).toBe('Test User')
    })

    it('should trim both leading and trailing whitespace from name', () => {
      const user = new UserModel({
        user_id: 'user-123',
        name: '   Test User   ',
      })

      expect(user.name).toBe('Test User')
    })
  })

  describe('Field Validation Limits', () => {
    it('should accept name with 1 character', () => {
      const user = new UserModel({
        user_id: 'user-123',
        name: 'A',
      })

      const error = user.validateSync()

      expect(error).toBeUndefined()
    })

    it('should accept name with 100 characters', () => {
      const user = new UserModel({
        user_id: 'user-123',
        name: 'a'.repeat(100),
      })

      const error = user.validateSync()

      expect(error).toBeUndefined()
    })

    it('should accept name with exactly 200 characters', () => {
      const user = new UserModel({
        user_id: 'user-123',
        name: 'a'.repeat(200),
      })

      const error = user.validateSync()

      expect(error).toBeUndefined()
    })

    it('should reject name with 201 characters', () => {
      const user = new UserModel({
        user_id: 'user-123',
        name: 'a'.repeat(201),
      })

      const error = user.validateSync()

      expect(error).toBeDefined()
      expect(error?.errors.name).toBeDefined()
    })
  })
})
