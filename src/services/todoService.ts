interface Todo {
  id: number
  text: string
  completed: boolean
}

// 获取所有todos
export async function fetchTodos(): Promise<Todo[]> {
  const response = await fetch('/api/todos')
  if (!response.ok) {
    throw new Error('Failed to fetch todos')
  }
  return response.json()
}

// 创建新todo
export async function createTodo(text: string): Promise<Todo> {
  const response = await fetch('/api/todos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  })
  if (!response.ok) {
    throw new Error('Failed to create todo')
  }
  return response.json()
}

// 更新todo状态
export async function updateTodo(id: number, completed: boolean): Promise<Todo> {
  const response = await fetch('/api/todos', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id, completed }),
  })
  if (!response.ok) {
    throw new Error('Failed to update todo')
  }
  return response.json()
}

// 删除todo
export async function deleteTodo(id: number): Promise<void> {
  const response = await fetch(`/api/todos?id=${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete todo')
  }
}
