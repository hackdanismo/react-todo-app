import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

// Use credentials from the .env file when using Vite for the application, .dotenv is not required
const supabase = createClient(import.meta.env.VITE_SUPABASE_PROJECT, import.meta.env.VITE_SUPABASE_ANON_KEY)

const App = () => {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState("")

  useEffect(() => {
    fetchAllTasks()
  }, [])

  async function fetchAllTasks() {
    const { data } = await supabase.from("tasks").select()
    setTasks(data)
  }

  const handleInputChange = event => {
    setNewTask(event.target.value)
  }

  const addTask = async () => {
    if (newTask.trim() === "") return   // Prevent adding an empty value
    const { data, error } = await supabase
      .from("tasks")
      .insert([{ title: newTask }])

    if (error) {
      console.error("Error adding the task:", error)
    } else {
      setTasks([...tasks, ...data])
      setNewTask("") // Clear the input after task has been added
    }
  }

  return (
    <>
      <h1>Task App</h1>

      <ul>
        {tasks.map((task) => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>

      <label>
        <input type="text" value={newTask} onChange={handleInputChange} placeholder="Add a task" />
      </label>
      <button onClick={addTask}>Add Task</button>
    </>
  )
}

export default App
