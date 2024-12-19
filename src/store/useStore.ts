import { create } from 'zustand'
import { fetchTodos, createTodo, updateTodo, deleteTodo } from '@/services/todoService'

// 定义 Todo 类型
interface Todo {
  id: number
  text: string
  completed: boolean
}

// 定义完整的 Store 状态和方法
interface StoreState {
  // 计数器状态
  count: number
  increment: () => void
  decrement: () => void
  reset: () => void

  // Todo 列表状态
  todos: Todo[]
  isLoading: boolean
  error: string | null
  fetchTodos: () => Promise<void>
  addTodo: (text: string) => Promise<void>
  toggleTodo: (id: number) => Promise<void>
  removeTodo: (id: number) => Promise<void>
}

export const useStore = create<StoreState>((set) => ({
  // 计数器相关状态和方法
  count: 0,
  increment: () => set((state) => ({ count: state.count + 2 })),
  decrement: () => set((state) => ({ count: state.count - 2 })),
  reset: () => set({ count: 0 }),

  // Todo 列表相关状态和方法
  todos: [],
  isLoading: false,
  error: null,

  fetchTodos: async () => {
    set({ isLoading: true, error: null })
    try {
      const todos = await fetchTodos()
      set({ todos, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  addTodo: async (text: string) => {
    set({ isLoading: true, error: null })
    try {
      const newTodo = await createTodo(text)
      set((state) => ({
        todos: [...state.todos, newTodo],
        isLoading: false
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  toggleTodo: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const todo = await updateTodo(
        id,
        !useStore.getState().todos.find(t => t.id === id)?.completed
      )
      set((state) => ({
        todos: state.todos.map(t => t.id === id ? todo : t),
        isLoading: false
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  removeTodo: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      await deleteTodo(id)
      set((state) => ({
        todos: state.todos.filter(todo => todo.id !== id),
        isLoading: false
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  }
}))
