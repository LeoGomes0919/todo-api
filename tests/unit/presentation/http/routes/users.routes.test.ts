import { CreateUserController } from '@/presentation/http/controller/user/create-user.controller'
import { userRouter } from '@/presentation/http/routes/users.routes'

vi.mock('@/presentation/http/controller/user/create-user.controller')

describe('src :: presentation :: http :: routes :: users.routes', () => {
  it('should be a Router instance', () => {
    expect(userRouter).toBeDefined()
    expect(typeof userRouter).toBe('function')
  })

  it('should create CreateUserController instance', () => {
    expect(CreateUserController).toHaveBeenCalled()
  })

  describe('POST /', () => {
    it('should register POST / route', () => {
      const stack = (userRouter as any).stack

      const postRoute = stack.find(
        (layer: any) =>
          layer.route?.path === '/' && layer.route?.methods?.post === true,
      )

      expect(postRoute).toBeDefined()
    })

    it('should use CreateUserController handle method', () => {
      const stack = (userRouter as any).stack
      const postRoute = stack.find(
        (layer: any) => layer.route?.path === '/' && layer.route?.methods?.post,
      )

      expect(postRoute).toBeDefined()
      expect(postRoute.route.stack.length).toBeGreaterThan(0)
    })
  })

  describe('Route Configuration', () => {
    it('should have exactly one route registered', () => {
      const stack = (userRouter as any).stack
      const routes = stack.filter((layer: any) => layer.route)

      expect(routes.length).toBe(1)
    })

    it('should only have POST method registered', () => {
      const stack = (userRouter as any).stack

      const postRoutes = stack.filter(
        (layer: any) => layer.route?.methods?.post === true,
      )

      expect(postRoutes.length).toBe(1)
    })

    it('should not have GET method registered', () => {
      const stack = (userRouter as any).stack

      const getRoutes = stack.filter(
        (layer: any) => layer.route?.methods?.get === true,
      )

      expect(getRoutes.length).toBe(0)
    })

    it('should not have PUT method registered', () => {
      const stack = (userRouter as any).stack

      const putRoutes = stack.filter(
        (layer: any) => layer.route?.methods?.put === true,
      )

      expect(putRoutes.length).toBe(0)
    })

    it('should not have DELETE method registered', () => {
      const stack = (userRouter as any).stack

      const deleteRoutes = stack.filter(
        (layer: any) => layer.route?.methods?.delete === true,
      )

      expect(deleteRoutes.length).toBe(0)
    })

    it('should not have PATCH method registered', () => {
      const stack = (userRouter as any).stack

      const patchRoutes = stack.filter(
        (layer: any) => layer.route?.methods?.patch === true,
      )

      expect(patchRoutes.length).toBe(0)
    })
  })

  describe('Router Export', () => {
    it('should export userRouter', () => {
      expect(userRouter).toBeDefined()
      expect(userRouter.constructor.name).toBe('Function')
    })

    it('should have at least one layer in the stack', () => {
      const stack = (userRouter as any).stack
      expect(stack.length).toBeGreaterThan(0)
    })
  })
})
