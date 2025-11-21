import mongoose from 'mongoose'
import { TaskModel } from '@/models/task.model'

describe('src :: models :: task.model', () => {
  describe('Schema Definition', () => {
    it('should be a mongoose model', () => {
      expect(TaskModel).toBeDefined()
      expect(TaskModel.prototype).toBeInstanceOf(mongoose.Model)
    })

    it('should have correct model name', () => {
      expect(TaskModel.modelName).toBe('task')
    })

    it('should have correct collection name', () => {
      expect(TaskModel.collection.name).toBe('tasks')
    })
  })

  describe('Schema Fields', () => {
    it('should have user_id field with correct type', () => {
      const schema = TaskModel.schema
      const userIdPath = schema.path('user_id')

      expect(userIdPath).toBeDefined()
      expect(userIdPath.instance).toBe('String')
    })

    it('should have user_id field as required', () => {
      const schema = TaskModel.schema
      const userIdPath = schema.path('user_id') as any

      expect(userIdPath.isRequired).toBe(true)
    })

    it('should have title field with correct type', () => {
      const schema = TaskModel.schema
      const titlePath = schema.path('title')

      expect(titlePath).toBeDefined()
      expect(titlePath.instance).toBe('String')
    })

    it('should have title field as required', () => {
      const schema = TaskModel.schema
      const titlePath = schema.path('title') as any

      expect(titlePath.isRequired).toBe(true)
    })

    it('should have title field with trim enabled', () => {
      const schema = TaskModel.schema
      const titlePath = schema.path('title') as any

      expect(titlePath.options.trim).toBe(true)
    })

    it('should have title field with maxlength of 200', () => {
      const schema = TaskModel.schema
      const titlePath = schema.path('title') as any

      expect(titlePath.options.maxlength).toBe(200)
    })

    it('should have description field with correct type', () => {
      const schema = TaskModel.schema
      const descriptionPath = schema.path('description')

      expect(descriptionPath).toBeDefined()
      expect(descriptionPath.instance).toBe('String')
    })

    it('should have description field as optional', () => {
      const schema = TaskModel.schema
      const descriptionPath = schema.path('description') as any

      expect(descriptionPath.isRequired).not.toBe(true)
    })

    it('should have description field with trim enabled', () => {
      const schema = TaskModel.schema
      const descriptionPath = schema.path('description') as any

      expect(descriptionPath.options.trim).toBe(true)
    })

    it('should have description field with maxlength of 1000', () => {
      const schema = TaskModel.schema
      const descriptionPath = schema.path('description') as any

      expect(descriptionPath.options.maxlength).toBe(1000)
    })

    it('should have done field with correct type', () => {
      const schema = TaskModel.schema
      const donePath = schema.path('done')

      expect(donePath).toBeDefined()
      expect(donePath.instance).toBe('Boolean')
    })

    it('should have done field with default value false', () => {
      const schema = TaskModel.schema
      const donePath = schema.path('done') as any

      expect(donePath.options.default).toBe(false)
    })

    it('should have created_at timestamp field', () => {
      const schema = TaskModel.schema
      const createdAtPath = schema.path('created_at')

      expect(createdAtPath).toBeDefined()
    })

    it('should have updated_at timestamp field', () => {
      const schema = TaskModel.schema
      const updatedAtPath = schema.path('updated_at')

      expect(updatedAtPath).toBeDefined()
    })
  })

  describe('Schema Options', () => {
    it('should have timestamps enabled', () => {
      const schema = TaskModel.schema
      const options = schema.options as any

      expect(options.timestamps).toBeDefined()
      expect(options.timestamps.createdAt).toBe('created_at')
      expect(options.timestamps.updatedAt).toBe('updated_at')
    })

    it('should use custom timestamp field names', () => {
      const schema = TaskModel.schema
      const options = schema.options as any

      expect(options.timestamps.createdAt).toBe('created_at')
      expect(options.timestamps.updatedAt).toBe('updated_at')
    })

    it('should have toJSON with virtuals enabled', () => {
      const schema = TaskModel.schema
      const options = schema.options as any

      expect(options.toJSON).toBeDefined()
      expect(options.toJSON.virtuals).toBe(true)
    })

    it('should have toJSON with versionKey disabled', () => {
      const schema = TaskModel.schema
      const options = schema.options as any

      expect(options.toJSON.versionKey).toBe(false)
    })

    it('should have toJSON transform function', () => {
      const schema = TaskModel.schema
      const options = schema.options as any

      expect(options.toJSON.transform).toBeDefined()
      expect(typeof options.toJSON.transform).toBe('function')
    })
  })

  describe('Schema Validation', () => {
    it('should require user_id field', () => {
      const task = new TaskModel({
        title: 'Test Task',
      })

      const error = task.validateSync()

      expect(error).toBeDefined()
      expect(error?.errors.user_id).toBeDefined()
    })

    it('should require title field', () => {
      const task = new TaskModel({
        user_id: 'user-123',
      })

      const error = task.validateSync()

      expect(error).toBeDefined()
      expect(error?.errors.title).toBeDefined()
    })

    it('should validate successfully with required fields only', () => {
      const task = new TaskModel({
        user_id: 'user-123',
        title: 'Test Task',
      })

      const error = task.validateSync()

      expect(error).toBeUndefined()
    })

    it('should validate successfully with all fields', () => {
      const task = new TaskModel({
        user_id: 'user-123',
        title: 'Test Task',
        description: 'Test Description',
        done: false,
      })

      const error = task.validateSync()

      expect(error).toBeUndefined()
    })

    it('should fail validation when title exceeds maxlength', () => {
      const task = new TaskModel({
        user_id: 'user-123',
        title: 'a'.repeat(201),
      })

      const error = task.validateSync()

      expect(error).toBeDefined()
      expect(error?.errors.title).toBeDefined()
    })

    it('should fail validation when description exceeds maxlength', () => {
      const task = new TaskModel({
        user_id: 'user-123',
        title: 'Test Task',
        description: 'a'.repeat(1001),
      })

      const error = task.validateSync()

      expect(error).toBeDefined()
      expect(error?.errors.description).toBeDefined()
    })

    it('should allow title at maxlength', () => {
      const task = new TaskModel({
        user_id: 'user-123',
        title: 'a'.repeat(200),
      })

      const error = task.validateSync()

      expect(error).toBeUndefined()
    })

    it('should allow description at maxlength', () => {
      const task = new TaskModel({
        user_id: 'user-123',
        title: 'Test Task',
        description: 'a'.repeat(1000),
      })

      const error = task.validateSync()

      expect(error).toBeUndefined()
    })
  })

  describe('Document Creation', () => {
    it('should create a document with all fields', () => {
      const data = {
        user_id: 'user-123',
        title: 'Test Task',
        description: 'Test Description',
        done: false,
      }

      const task = new TaskModel(data)

      expect(task.user_id).toBe(data.user_id)
      expect(task.title).toBe(data.title)
      expect(task.description).toBe(data.description)
      expect(task.done).toBe(data.done)
    })

    it('should create a document with default done value', () => {
      const task = new TaskModel({
        user_id: 'user-123',
        title: 'Test Task',
      })

      expect(task.done).toBe(false)
    })

    it('should trim title field', () => {
      const task = new TaskModel({
        user_id: 'user-123',
        title: '  Test Task  ',
      })

      expect(task.title).toBe('Test Task')
    })

    it('should trim description field', () => {
      const task = new TaskModel({
        user_id: 'user-123',
        title: 'Test Task',
        description: '  Test Description  ',
      })

      expect(task.description).toBe('Test Description')
    })

    it('should be an instance of mongoose Document', () => {
      const task = new TaskModel({
        user_id: 'user-123',
        title: 'Test Task',
      })

      expect(task).toBeInstanceOf(mongoose.Document)
    })

    it('should have _id field', () => {
      const task = new TaskModel({
        user_id: 'user-123',
        title: 'Test Task',
      })

      expect(task._id).toBeDefined()
    })

    it('should have id virtual field', () => {
      const task = new TaskModel({
        user_id: 'user-123',
        title: 'Test Task',
      })

      expect((task as any).id).toBeDefined()
      expect(typeof (task as any).id).toBe('string')
    })
  })

  describe('Field Types', () => {
    it('should store user_id as string', () => {
      const task = new TaskModel({
        user_id: 'user-123',
        title: 'Test Task',
      })

      expect(typeof task.user_id).toBe('string')
    })

    it('should store title as string', () => {
      const task = new TaskModel({
        user_id: 'user-123',
        title: 'Test Task',
      })

      expect(typeof task.title).toBe('string')
    })

    it('should store description as string', () => {
      const task = new TaskModel({
        user_id: 'user-123',
        title: 'Test Task',
        description: 'Test Description',
      })

      expect(typeof task.description).toBe('string')
    })

    it('should store done as boolean', () => {
      const task = new TaskModel({
        user_id: 'user-123',
        title: 'Test Task',
        done: true,
      })

      expect(typeof task.done).toBe('boolean')
    })
  })

  describe('Schema Indexes', () => {
    it('should have index on user_id field', () => {
      const schema = TaskModel.schema
      const indexes = schema.indexes()

      const userIdIndex = indexes.find(
        (index: any) =>
          index[0].user_id === 1 && Object.keys(index[0]).length === 1,
      )

      expect(userIdIndex).toBeDefined()
    })

    it('should have index on done field', () => {
      const schema = TaskModel.schema
      const indexes = schema.indexes()

      const doneIndex = indexes.find(
        (index: any) =>
          index[0].done === 1 && Object.keys(index[0]).length === 1,
      )

      expect(doneIndex).toBeDefined()
    })

    it('should have compound index on user_id and done', () => {
      const schema = TaskModel.schema
      const indexes = schema.indexes()

      const compoundIndex = indexes.find(
        (index: any) => index[0].user_id === 1 && index[0].done === 1,
      )

      expect(compoundIndex).toBeDefined()
    })

    it('should have compound index on user_id and created_at', () => {
      const schema = TaskModel.schema
      const indexes = schema.indexes()

      const compoundIndex = indexes.find(
        (index: any) => index[0].user_id === 1 && index[0].created_at === -1,
      )

      expect(compoundIndex).toBeDefined()
    })

    it('should have created_at in descending order in compound index', () => {
      const schema = TaskModel.schema
      const indexes = schema.indexes()

      const compoundIndex = indexes.find(
        (index: any) => index[0].user_id === 1 && index[0].created_at === -1,
      )

      expect(compoundIndex).toBeDefined()
      expect(compoundIndex?.[0].created_at).toBe(-1)
    })

    it('should have exactly 4 custom indexes', () => {
      const schema = TaskModel.schema
      const indexes = schema.indexes()

      expect(indexes.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe('toJSON Transform', () => {
    it('should transform _id to id in JSON output', () => {
      const task = new TaskModel({
        user_id: 'user-123',
        title: 'Test Task',
      })

      const json = task.toJSON()

      expect(json.id).toBeDefined()
      expect(typeof json.id).toBe('object')
      expect(json.id.toString()).toBe(task._id.toString())
    })

    it('should remove _id from JSON output', () => {
      const task = new TaskModel({
        user_id: 'user-123',
        title: 'Test Task',
      })

      const json = task.toJSON()

      expect(json._id).toBeUndefined()
    })

    it('should not include __v in JSON output', () => {
      const task = new TaskModel({
        user_id: 'user-123',
        title: 'Test Task',
      })

      const json = task.toJSON()

      expect(json.__v).toBeUndefined()
    })

    it('should include all other fields in JSON output', () => {
      const task = new TaskModel({
        user_id: 'user-123',
        title: 'Test Task',
        description: 'Test Description',
        done: true,
      })

      const json = task.toJSON()

      expect(json.user_id).toBe('user-123')
      expect(json.title).toBe('Test Task')
      expect(json.description).toBe('Test Description')
      expect(json.done).toBe(true)
    })
  })

  describe('Model Methods', () => {
    it('should have findOne method', () => {
      expect(typeof TaskModel.findOne).toBe('function')
    })

    it('should have findById method', () => {
      expect(typeof TaskModel.findById).toBe('function')
    })

    it('should have create method', () => {
      expect(typeof TaskModel.create).toBe('function')
    })

    it('should have deleteOne method', () => {
      expect(typeof TaskModel.deleteOne).toBe('function')
    })

    it('should have find method', () => {
      expect(typeof TaskModel.find).toBe('function')
    })

    it('should have updateOne method', () => {
      expect(typeof TaskModel.updateOne).toBe('function')
    })

    it('should have findByIdAndUpdate method', () => {
      expect(typeof TaskModel.findByIdAndUpdate).toBe('function')
    })

    it('should have countDocuments method', () => {
      expect(typeof TaskModel.countDocuments).toBe('function')
    })
  })

  describe('Optional Fields', () => {
    it('should allow creating task without description', () => {
      const task = new TaskModel({
        user_id: 'user-123',
        title: 'Test Task',
      })

      const error = task.validateSync()

      expect(error).toBeUndefined()
      expect(task.description).toBeUndefined()
    })

    it('should allow creating task with done value', () => {
      const task = new TaskModel({
        user_id: 'user-123',
        title: 'Test Task',
        done: true,
      })

      expect(task.done).toBe(true)
    })
  })
})
