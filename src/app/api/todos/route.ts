import { NextResponse } from 'next/server'

// 模拟数据库
let todos = [
  { id: 1, text: '学习 Next.js', completed: false },
  { id: 2, text: '学习 Zustand', completed: true },
]

// GET /api/todos - 获取所有todos
export async function GET() {
  return NextResponse.json(todos)
}

// POST /api/todos - 创建新todo
export async function POST(request: Request) {
  const body = await request.json()
  const newTodo = {
    id: Date.now(),
    text: body.text,
    completed: false
  }
  todos.push(newTodo)
  return NextResponse.json(newTodo, { status: 201 })
}

// PUT /api/todos/:id - 更新todo
export async function PUT(request: Request) {
  const body = await request.json()
  const { id, completed } = body

  todos = todos.map(todo => 
    todo.id === id ? { ...todo, completed } : todo
  )

  const updatedTodo = todos.find(todo => todo.id === id)
  if (!updatedTodo) {
    return NextResponse.json(
      { error: 'Todo not found' },
      { status: 404 }
    )
  }

  return NextResponse.json(updatedTodo)
}

// DELETE /api/todos/:id - 删除todo
export async function DELETE(request: Request) {
  const url = new URL(request.url)
  const id = parseInt(url.searchParams.get('id') || '')

  const todoIndex = todos.findIndex(todo => todo.id === id)
  if (todoIndex === -1) {
    return NextResponse.json(
      { error: 'Todo not found' },
      { status: 404 }
    )
  }

  todos = todos.filter(todo => todo.id !== id)
  return NextResponse.json({ message: 'Todo deleted' })
}
