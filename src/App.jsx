import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

// Use credentials from the .env file when using Vite for the application, .dotenv is not required
const supabase = createClient(import.meta.env.VITE_SUPABASE_PROJECT, import.meta.env.VITE_SUPABASE_ANON_KEY)

const App = () => {
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState("")

  useEffect(() => {
    fetchAllTodos()
  }, [])

  async function fetchAllTodos() {
    const { data } = await supabase.from("todo").select()
    setTodos(data)
  }

  const handleInputChange = event => {
    setNewTodo(event.target.value)
  }

  const addTodo = async () => {
    if (newTodo.trim() === "") return   // Prevent adding an empty value
    const { data, error } = await supabase
      .from("todo")
      .insert([{ task: newTodo }])

    if (error) {
      console.error("Error adding the task:", error)
    } else {
      setTodos([...todos, ...data])
      setNewTodo("") // Clear the input after task has been added
    }
  }

  return (
    <>
      <h1>Todo App</h1>

      <ul>
        {todos.map((todo) => (
          <li key={todo.task}>{todo.task}</li>
        ))}
      </ul>

      <label>
        <input type="text" value={newTodo} onChange={handleInputChange} placeholder="Add a task" />
      </label>
      <button onClick={addTodo}>Add Task</button>
    </>
  )
}

export default App
