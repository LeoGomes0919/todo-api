import mongoose from 'mongoose'
import { ApiKeyModel, IApiKeyDocument } from '@/models/api-key.model'

describe('src :: models :: api-key.model', () => {
  describe('Schema Definition', () => {
    it('should be a mongoose model', () => {
      expect(ApiKeyModel).toBeDefined()
      expect(ApiKeyModel.prototype).toBeInstanceOf(mongoose.Model)
    })

    it('should have correct model name', () => {
      expect(ApiKeyModel.modelName).toBe('api_key')
    })

    it('should have correct collection name', () => {
      expect(ApiKeyModel.collection.name).toBe('api_keys')
    })
  })

  describe('Schema Fields', () => {
    it('should have key field with correct type', () => {
      const schema = ApiKeyModel.schema
      const keyPath = schema.path('key')

      expect(keyPath).toBeDefined()
      expect(keyPath.instance).toBe('String')
    })

    it('should have key field as required', () => {
      const schema = ApiKeyModel.schema
      const keyPath = schema.path('key') as any

      expect(keyPath.isRequired).toBe(true)
    })

    it('should have key field as unique', () => {
      const schema = ApiKeyModel.schema
      const keyPath = schema.path('key') as any

      expect(keyPath.options.unique).toBe(true)
    })

    it('should have user_id field with correct type', () => {
      const schema = ApiKeyModel.schema
      const userIdPath = schema.path('user_id')

      expect(userIdPath).toBeDefined()
      expect(userIdPath.instance).toBe('String')
    })

    it('should have user_id field as required', () => {
      const schema = ApiKeyModel.schema
      const userIdPath = schema.path('user_id') as any

      expect(userIdPath.isRequired).toBe(true)
    })

    it('should have user_id field as indexed', () => {
      const schema = ApiKeyModel.schema
      const userIdPath = schema.path('user_id') as any

      expect(userIdPath.options.index).toBe(true)
    })

    it('should have created_at timestamp field', () => {
      const schema = ApiKeyModel.schema
      const createdAtPath = schema.path('created_at')

      expect(createdAtPath).toBeDefined()
    })

    it('should have updated_at timestamp field', () => {
      const schema = ApiKeyModel.schema
      const updatedAtPath = schema.path('updated_at')

      expect(updatedAtPath).toBeDefined()
    })
  })

  describe('Schema Options', () => {
    it('should have timestamps enabled', () => {
      const schema = ApiKeyModel.schema
      const options = schema.options as any

      expect(options.timestamps).toBeDefined()
      expect(options.timestamps.createdAt).toBe('created_at')
      expect(options.timestamps.updatedAt).toBe('updated_at')
    })

    it('should use custom timestamp field names', () => {
      const schema = ApiKeyModel.schema
      const options = schema.options as any

      expect(options.timestamps.createdAt).toBe('created_at')
      expect(options.timestamps.updatedAt).toBe('updated_at')
    })
  })

  describe('Schema Validation', () => {
    it('should require key field', () => {
      const apiKey = new ApiKeyModel({
        user_id: 'user-123',
      })

      const error = apiKey.validateSync()

      expect(error).toBeDefined()
      expect(error?.errors.key).toBeDefined()
    })

    it('should require user_id field', () => {
      const apiKey = new ApiKeyModel({
        key: 'test-key-123',
      })

      const error = apiKey.validateSync()

      expect(error).toBeDefined()
      expect(error?.errors.user_id).toBeDefined()
    })

    it('should validate successfully with all required fields', () => {
      const apiKey = new ApiKeyModel({
        key: 'test-key-123',
        user_id: 'user-123',
      })

      const error = apiKey.validateSync()

      expect(error).toBeUndefined()
    })

    it('should allow valid key format', () => {
      const apiKey = new ApiKeyModel({
        key: 'api-key-12345678-1234-1234-1234-123456789abc',
        user_id: 'user-123',
      })

      const error = apiKey.validateSync()

      expect(error).toBeUndefined()
    })

    it('should allow valid user_id format', () => {
      const apiKey = new ApiKeyModel({
        key: 'test-key-123',
        user_id: 'user-12345678-1234-1234-1234-123456789abc',
      })

      const error = apiKey.validateSync()

      expect(error).toBeUndefined()
    })
  })

  describe('Document Creation', () => {
    it('should create a document with all fields', () => {
      const data = {
        key: 'test-key-123',
        user_id: 'user-123',
      }

      const apiKey = new ApiKeyModel(data)

      expect(apiKey.key).toBe(data.key)
      expect(apiKey.user_id).toBe(data.user_id)
    })

    it('should create a document that is an instance of IApiKeyDocument', () => {
      const apiKey = new ApiKeyModel({
        key: 'test-key-123',
        user_id: 'user-123',
      })

      expect(apiKey).toBeInstanceOf(mongoose.Document)
    })

    it('should have _id field', () => {
      const apiKey = new ApiKeyModel({
        key: 'test-key-123',
        user_id: 'user-123',
      })

      expect(apiKey._id).toBeDefined()
    })

    it('should have id field as a virtual getter', () => {
      const apiKey = new ApiKeyModel({
        key: 'test-key-123',
        user_id: 'user-123',
      })

      expect((apiKey as any).id).toBeDefined()
      expect(typeof (apiKey as any).id).toBe('string')
    })
  })

  describe('Field Types', () => {
    it('should store key as string', () => {
      const apiKey = new ApiKeyModel({
        key: 'test-key-123',
        user_id: 'user-123',
      })

      expect(typeof apiKey.key).toBe('string')
    })

    it('should store user_id as string', () => {
      const apiKey = new ApiKeyModel({
        key: 'test-key-123',
        user_id: 'user-123',
      })

      expect(typeof apiKey.user_id).toBe('string')
    })
  })

  describe('Schema Indexes', () => {
    it('should have index on user_id field', () => {
      const schema = ApiKeyModel.schema
      const indexes = schema.indexes()

      const userIdIndex = indexes.find((index: any) => index[0].user_id)

      expect(userIdIndex).toBeDefined()
    })

    it('should have unique index on key field', () => {
      const schema = ApiKeyModel.schema
      const indexes = schema.indexes()

      const keyIndex = indexes.find((index: any) => index[0].key)

      expect(keyIndex).toBeDefined()
      expect(keyIndex?.[1].unique).toBe(true)
    })
  })

  describe('Model Methods', () => {
    it('should have findOne method', () => {
      expect(typeof ApiKeyModel.findOne).toBe('function')
    })

    it('should have findById method', () => {
      expect(typeof ApiKeyModel.findById).toBe('function')
    })

    it('should have create method', () => {
      expect(typeof ApiKeyModel.create).toBe('function')
    })

    it('should have deleteOne method', () => {
      expect(typeof ApiKeyModel.deleteOne).toBe('function')
    })

    it('should have find method', () => {
      expect(typeof ApiKeyModel.find).toBe('function')
    })

    it('should have updateOne method', () => {
      expect(typeof ApiKeyModel.updateOne).toBe('function')
    })
  })

  describe('Interface Compliance', () => {
    it('should create document that matches IApiKeyDocument interface', () => {
      const apiKey: IApiKeyDocument = new ApiKeyModel({
        key: 'test-key-123',
        user_id: 'user-123',
      })

      expect(apiKey.key).toBeDefined()
      expect(apiKey.user_id).toBeDefined()
    })

    it('should have all required IApiKey properties except id', () => {
      const apiKey = new ApiKeyModel({
        key: 'test-key-123',
        user_id: 'user-123',
      })

      expect(apiKey.key).toBeDefined()
      expect(apiKey.user_id).toBeDefined()
    })
  })
})
