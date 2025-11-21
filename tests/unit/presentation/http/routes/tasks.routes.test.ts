import { CompleteTaskController } from '@/presentation/http/controller/task/complete-task.controller'
import { CreateTaskController } from '@/presentation/http/controller/task/create-task.controller'
import { DeleteTaskController } from '@/presentation/http/controller/task/delete-task.controller'
import { ListTaskController } from '@/presentation/http/controller/task/list-task.controller'
import { UpdateTaskController } from '@/presentation/http/controller/task/update-task.controller'
import { taskRouter } from '@/presentation/http/routes/tasks.routes'

vi.mock('@/presentation/http/controller/task/create-task.controller')
vi.mock('@/presentation/http/controller/task/list-task.controller')
vi.mock('@/presentation/http/controller/task/update-task.controller')
vi.mock('@/presentation/http/controller/task/delete-task.controller')
vi.mock('@/presentation/http/controller/task/complete-task.controller')

describe('src :: presentation :: http :: routes :: tasks.routes', () => {
  it('should be a Router instance', () => {
    expect(taskRouter).toBeDefined()
    expect(typeof taskRouter).toBe('function')
  })

  it('should create all controller instances', () => {
    expect(CreateTaskController).toHaveBeenCalled()
    expect(ListTaskController).toHaveBeenCalled()
    expect(UpdateTaskController).toHaveBeenCalled()
    expect(DeleteTaskController).toHaveBeenCalled()
    expect(CompleteTaskController).toHaveBeenCalled()
  })

  describe('POST /', () => {
    it('should register POST / route', () => {
      const stack = (taskRouter as any).stack

      const postRoute = stack.find(
        (layer: any) =>
          layer.route?.path === '/' && layer.route?.methods?.post === true,
      )

      expect(postRoute).toBeDefined()
    })

    it('should use CreateTaskController handle method', () => {
      const stack = (taskRouter as any).stack
      const postRoute = stack.find(
        (layer: any) => layer.route?.path === '/' && layer.route?.methods?.post,
      )

      expect(postRoute).toBeDefined()
      expect(postRoute.route.stack.length).toBeGreaterThan(0)
    })
  })

  describe('GET /', () => {
    it('should register GET / route', () => {
      const stack = (taskRouter as any).stack

      const getRoute = stack.find(
        (layer: any) =>
          layer.route?.path === '/' && layer.route?.methods?.get === true,
      )

      expect(getRoute).toBeDefined()
    })

    it('should use ListTaskController handle method', () => {
      const stack = (taskRouter as any).stack
      const getRoute = stack.find(
        (layer: any) => layer.route?.path === '/' && layer.route?.methods?.get,
      )

      expect(getRoute).toBeDefined()
      expect(getRoute.route.stack.length).toBeGreaterThan(0)
    })
  })

  describe('PUT /:id', () => {
    it('should register PUT /:id route', () => {
      const stack = (taskRouter as any).stack

      const putRoute = stack.find(
        (layer: any) =>
          layer.route?.path === '/:id' && layer.route?.methods?.put === true,
      )

      expect(putRoute).toBeDefined()
    })

    it('should use UpdateTaskController handle method', () => {
      const stack = (taskRouter as any).stack
      const putRoute = stack.find(
        (layer: any) =>
          layer.route?.path === '/:id' && layer.route?.methods?.put,
      )

      expect(putRoute).toBeDefined()
      expect(putRoute.route.stack.length).toBeGreaterThan(0)
    })
  })

  describe('DELETE /:id', () => {
    it('should register DELETE /:id route', () => {
      const stack = (taskRouter as any).stack

      const deleteRoute = stack.find(
        (layer: any) =>
          layer.route?.path === '/:id' && layer.route?.methods?.delete === true,
      )

      expect(deleteRoute).toBeDefined()
    })

    it('should use DeleteTaskController handle method', () => {
      const stack = (taskRouter as any).stack
      const deleteRoute = stack.find(
        (layer: any) =>
          layer.route?.path === '/:id' && layer.route?.methods?.delete,
      )

      expect(deleteRoute).toBeDefined()
      expect(deleteRoute.route.stack.length).toBeGreaterThan(0)
    })
  })

  describe('PATCH /:id/complete', () => {
    it('should register PATCH /:id/complete route', () => {
      const stack = (taskRouter as any).stack

      const patchRoute = stack.find(
        (layer: any) =>
          layer.route?.path === '/:id/complete' &&
          layer.route?.methods?.patch === true,
      )

      expect(patchRoute).toBeDefined()
    })

    it('should use CompleteTaskController handle method', () => {
      const stack = (taskRouter as any).stack
      const patchRoute = stack.find(
        (layer: any) =>
          layer.route?.path === '/:id/complete' && layer.route?.methods?.patch,
      )

      expect(patchRoute).toBeDefined()
      expect(patchRoute.route.stack.length).toBeGreaterThan(0)
    })
  })

  describe('Route Configuration', () => {
    it('should have exactly 5 routes registered', () => {
      const stack = (taskRouter as any).stack
      const routes = stack.filter((layer: any) => layer.route)

      expect(routes.length).toBe(5)
    })

    it('should have POST method for root path', () => {
      const stack = (taskRouter as any).stack

      const postRoutes = stack.filter(
        (layer: any) =>
          layer.route?.path === '/' && layer.route?.methods?.post === true,
      )

      expect(postRoutes.length).toBe(1)
    })

    it('should have GET method for root path', () => {
      const stack = (taskRouter as any).stack

      const getRoutes = stack.filter(
        (layer: any) =>
          layer.route?.path === '/' && layer.route?.methods?.get === true,
      )

      expect(getRoutes.length).toBe(1)
    })

    it('should have PUT method for /:id path', () => {
      const stack = (taskRouter as any).stack

      const putRoutes = stack.filter(
        (layer: any) =>
          layer.route?.path === '/:id' && layer.route?.methods?.put === true,
      )

      expect(putRoutes.length).toBe(1)
    })

    it('should have DELETE method for /:id path', () => {
      const stack = (taskRouter as any).stack

      const deleteRoutes = stack.filter(
        (layer: any) =>
          layer.route?.path === '/:id' && layer.route?.methods?.delete === true,
      )

      expect(deleteRoutes.length).toBe(1)
    })

    it('should have PATCH method for /:id/complete path', () => {
      const stack = (taskRouter as any).stack

      const patchRoutes = stack.filter(
        (layer: any) =>
          layer.route?.path === '/:id/complete' &&
          layer.route?.methods?.patch === true,
      )

      expect(patchRoutes.length).toBe(1)
    })

    it('should not have any HEAD methods', () => {
      const stack = (taskRouter as any).stack

      const headRoutes = stack.filter(
        (layer: any) => layer.route?.methods?.head === true,
      )

      expect(headRoutes.length).toBe(0)
    })

    it('should not have any OPTIONS methods', () => {
      const stack = (taskRouter as any).stack

      const optionsRoutes = stack.filter(
        (layer: any) => layer.route?.methods?.options === true,
      )

      expect(optionsRoutes.length).toBe(0)
    })
  })

  describe('Router Export', () => {
    it('should export taskRouter', () => {
      expect(taskRouter).toBeDefined()
      expect(taskRouter.constructor.name).toBe('Function')
    })

    it('should have at least 5 layers in the stack', () => {
      const stack = (taskRouter as any).stack
      expect(stack.length).toBeGreaterThanOrEqual(5)
    })

    it('should have all routes with defined handlers', () => {
      const stack = (taskRouter as any).stack
      const routes = stack.filter((layer: any) => layer.route)

      routes.forEach((route: any) => {
        expect(route.route.stack.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Route Paths', () => {
    it('should have root path (/) routes', () => {
      const stack = (taskRouter as any).stack
      const rootRoutes = stack.filter((layer: any) => layer.route?.path === '/')

      expect(rootRoutes.length).toBe(2) // POST and GET
    })

    it('should have /:id path routes', () => {
      const stack = (taskRouter as any).stack
      const idRoutes = stack.filter(
        (layer: any) => layer.route?.path === '/:id',
      )

      expect(idRoutes.length).toBe(2) // PUT and DELETE
    })

    it('should have /:id/complete path route', () => {
      const stack = (taskRouter as any).stack
      const completeRoutes = stack.filter(
        (layer: any) => layer.route?.path === '/:id/complete',
      )

      expect(completeRoutes.length).toBe(1) // PATCH
    })
  })
})
