import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

// Use credentials from the .env file when using Vite for the application, .dotenv is not required
const supabase = createClient(import.meta.env.VITE_SUPABASE_PROJECT, import.meta.env.VITE_SUPABASE_ANON_KEY)

const App = () => {
  const [todos, setTodos] = useState([])

  useEffect(() => {
    fetchAllTodos()
  }, [])

  async function fetchAllTodos() {
    const { data } = await supabase.from("todo").select()
    setTodos(data)
  }

  return (
    <>
      <h1>Todo App</h1>

      <ul>
        {todos.map((todo) => (
          <li key={todo.task}>{todo.task}</li>
        ))}
      </ul>
    </>
  )
}

export default App
