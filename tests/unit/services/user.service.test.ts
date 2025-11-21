import { ICreateUserDTO } from '@/interfaces/user.interface'
import { ApiKeyModel } from '@/models/api-key.model'
import { UserModel } from '@/models/user.model'
import { UserService } from '@/services/user.service'

vi.mock('@/models/user.model', () => ({
  UserModel: {
    create: vi.fn(),
    deleteOne: vi.fn(() => ({
      catch: vi.fn(),
    })),
  },
}))

vi.mock('@/models/api-key.model', () => ({
  ApiKeyModel: {
    create: vi.fn(),
  },
}))

const mockRandomUUID = vi.fn()
const mockRandomBytes = vi.fn()

vi.mock('crypto', () => ({
  default: {
    randomUUID: () => mockRandomUUID(),
    randomBytes: (size: number) => mockRandomBytes(size),
  },
  randomUUID: () => mockRandomUUID(),
  randomBytes: (size: number) => mockRandomBytes(size),
}))

describe('src :: services :: user.service', () => {
  const mockUserId = 'test-uuid-123'
  const mockApiKey = 'abc123def456'

  const mockCreateUserDTO: ICreateUserDTO = {
    name: 'Test User',
  }

  const mockUser = {
    id: 'mongo-id-123',
    user_id: mockUserId,
    name: 'Test User',
    created_at: new Date('2025-01-01T00:00:00.000Z'),
    updated_at: new Date('2025-01-01T00:00:00.000Z'),
  }

  const mockApiKeyEntry = {
    id: 'api-key-id-123',
    user_id: mockUserId,
    key: mockApiKey,
    created_at: new Date('2025-01-01T00:00:00.000Z'),
    updated_at: new Date('2025-01-01T00:00:00.000Z'),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockRandomUUID.mockReturnValue(mockUserId)
    mockRandomBytes.mockReturnValue(Buffer.from(mockApiKey, 'hex'))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('create', () => {
    it('should be able to create a user with an api_key', async () => {
      vi.mocked(UserModel.create).mockResolvedValue(mockUser as any)
      vi.mocked(ApiKeyModel.create).mockResolvedValue(mockApiKeyEntry as any)

      const result = await UserService.create(mockCreateUserDTO)

      expect(mockRandomUUID).toHaveBeenCalledTimes(1)
      expect(UserModel.create).toHaveBeenCalledWith({
        user_id: mockUserId,
        name: mockCreateUserDTO.name,
      })
      expect(mockRandomBytes).toHaveBeenCalledWith(16)
      expect(ApiKeyModel.create).toHaveBeenCalledWith({
        user_id: mockUserId,
        key: expect.any(String),
      })

      expect(result).toEqual({
        id: mockUser.id,
        user_id: mockUser.user_id,
        name: mockUser.name,
        api_key: expect.any(String),
        created_at: mockUser.created_at,
        updated_at: mockUser.updated_at,
      })
    })

    it('should generate a unique UUID for each user', async () => {
      const firstUUID = 'uuid-1'
      const secondUUID = 'uuid-2'

      mockRandomUUID
        .mockReturnValueOnce(firstUUID)
        .mockReturnValueOnce(secondUUID)

      vi.mocked(UserModel.create)
        .mockResolvedValueOnce({ ...mockUser, user_id: firstUUID } as any)
        .mockResolvedValueOnce({ ...mockUser, user_id: secondUUID } as any)

      vi.mocked(ApiKeyModel.create).mockResolvedValue(mockApiKeyEntry as any)

      const result1 = await UserService.create(mockCreateUserDTO)
      const result2 = await UserService.create(mockCreateUserDTO)

      expect(result1?.user_id).toBe(firstUUID)
      expect(result2?.user_id).toBe(secondUUID)
      expect(mockRandomUUID).toHaveBeenCalledTimes(2)
    })

    it('should generate a random 32-character hex API key', async () => {
      vi.mocked(UserModel.create).mockResolvedValue(mockUser as any)
      vi.mocked(ApiKeyModel.create).mockResolvedValue(mockApiKeyEntry as any)

      const result = await UserService.create(mockCreateUserDTO)

      expect(mockRandomBytes).toHaveBeenCalledWith(16)
      expect(result?.api_key).toBeDefined()
      expect(typeof result?.api_key).toBe('string')
    })

    it('should throw an error when UserModel.create returns null', async () => {
      vi.mocked(UserModel.create).mockResolvedValue(null as any)
      vi.mocked(UserModel.deleteOne).mockReturnValue({
        catch: vi.fn().mockResolvedValue(undefined),
      } as any)

      await expect(UserService.create(mockCreateUserDTO)).rejects.toThrow(
        'Error creating user',
      )

      expect(UserModel.create).toHaveBeenCalled()
      expect(ApiKeyModel.create).not.toHaveBeenCalled()
    })

    it('should throw an error when ApiKeyModel.create returns null', async () => {
      vi.mocked(UserModel.create).mockResolvedValue(mockUser as any)
      vi.mocked(ApiKeyModel.create).mockResolvedValue(null as any)
      vi.mocked(UserModel.deleteOne).mockReturnValue({
        catch: vi.fn().mockResolvedValue(undefined),
      } as any)

      await expect(UserService.create(mockCreateUserDTO)).rejects.toThrow(
        'Error creating API key',
      )

      expect(ApiKeyModel.create).toHaveBeenCalled()
      expect(UserModel.deleteOne).toHaveBeenCalledWith({
        user_id: mockUserId,
      })
    })

    it('should rollback the user when API key creation fails', async () => {
      vi.mocked(UserModel.create).mockResolvedValue(mockUser as any)
      vi.mocked(ApiKeyModel.create).mockRejectedValue(
        new Error('Database error'),
      )
      vi.mocked(UserModel.deleteOne).mockReturnValue({
        catch: vi.fn().mockResolvedValue(undefined),
      } as any)

      await expect(UserService.create(mockCreateUserDTO)).rejects.toThrow(
        'Database error',
      )

      expect(UserModel.deleteOne).toHaveBeenCalledWith({
        user_id: mockUserId,
      })
    })

    it('should log an error if rollback fails', async () => {
      vi.mocked(UserModel.create).mockResolvedValue(mockUser as any)
      vi.mocked(ApiKeyModel.create).mockRejectedValue(
        new Error('API key error'),
      )

      await expect(UserService.create(mockCreateUserDTO)).rejects.toThrow(
        'API key error',
      )
    })

    it('should propagate original error even if rollback fails', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      const originalError = new Error('Original error')

      vi.mocked(UserModel.create).mockResolvedValue(mockUser as any)
      vi.mocked(ApiKeyModel.create).mockRejectedValue(originalError)

      await expect(UserService.create(mockCreateUserDTO)).rejects.toThrow(
        originalError,
      )

      consoleErrorSpy.mockRestore()
    })

    it('should create a user with a long name', async () => {
      const longName = 'A'.repeat(200)
      const userWithLongName: ICreateUserDTO = { name: longName }

      vi.mocked(UserModel.create).mockResolvedValue({
        ...mockUser,
        name: longName,
      } as any)
      vi.mocked(ApiKeyModel.create).mockResolvedValue(mockApiKeyEntry as any)

      const result = await UserService.create(userWithLongName)

      expect(result?.name).toBe(longName)
      expect(UserModel.create).toHaveBeenCalledWith({
        user_id: mockUserId,
        name: longName,
      })
    })

    it('should create a user with a name containing special characters', async () => {
      const specialName = 'José da Silva Júnior (Zé)'
      const userWithSpecialName: ICreateUserDTO = { name: specialName }

      vi.mocked(UserModel.create).mockResolvedValue({
        ...mockUser,
        name: specialName,
      } as any)
      vi.mocked(ApiKeyModel.create).mockResolvedValue(mockApiKeyEntry as any)

      const result = await UserService.create(userWithSpecialName)

      expect(result?.name).toBe(specialName)
    })

    it('should throw an error when UserModel.create throws an exception', async () => {
      const dbError = new Error('Database connection failed')
      vi.mocked(UserModel.create).mockRejectedValue(dbError)

      await expect(UserService.create(mockCreateUserDTO)).rejects.toThrow(
        dbError,
      )

      expect(ApiKeyModel.create).not.toHaveBeenCalled()
    })

    it('should return an object with the correct structure', async () => {
      vi.mocked(UserModel.create).mockResolvedValue(mockUser as any)
      vi.mocked(ApiKeyModel.create).mockResolvedValue(mockApiKeyEntry as any)

      const result = await UserService.create(mockCreateUserDTO)

      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('user_id')
      expect(result).toHaveProperty('name')
      expect(result).toHaveProperty('api_key')
      expect(result).toHaveProperty('created_at')
      expect(result).toHaveProperty('updated_at')
      expect(Object.keys(result!)).toHaveLength(6)
    })

    it('should use the same user_id for UserModel and ApiKeyModel', async () => {
      vi.mocked(UserModel.create).mockResolvedValue(mockUser as any)
      vi.mocked(ApiKeyModel.create).mockResolvedValue(mockApiKeyEntry as any)

      await UserService.create(mockCreateUserDTO)

      const userCreateCall = vi.mocked(UserModel.create).mock.calls[0][0] as {
        user_id: string
        name: string
      }
      const apiKeyCreateCall = vi.mocked(ApiKeyModel.create).mock
        .calls[0][0] as { user_id: string; key: string }

      expect(userCreateCall.user_id).toBe(apiKeyCreateCall.user_id)
      expect(userCreateCall.user_id).toBe(mockUserId)
    })

    it('should create timestamps correctly', async () => {
      const now = new Date()
      const userWithTimestamps = {
        ...mockUser,
        created_at: now,
        updated_at: now,
      }

      vi.mocked(UserModel.create).mockResolvedValue(userWithTimestamps as any)
      vi.mocked(ApiKeyModel.create).mockResolvedValue(mockApiKeyEntry as any)

      const result = await UserService.create(mockCreateUserDTO)

      expect(result?.created_at).toEqual(now)
      expect(result?.updated_at).toEqual(now)
    })

    it('should handle duplicate user error', async () => {
      const duplicateError = new Error('Duplicate key error')
      ;(duplicateError as any).code = 11000

      vi.mocked(UserModel.create).mockRejectedValue(duplicateError)

      await expect(UserService.create(mockCreateUserDTO)).rejects.toThrow(
        duplicateError,
      )
    })
  })
})
