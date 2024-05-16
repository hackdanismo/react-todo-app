/*import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

// Use credentials from the .env file when using Vite for the application, .dotenv is not required
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_PROJECT,  // Project URL from the environment variables
  import.meta.env.VITE_SUPABASE_ANON_KEY  // Anon key from the environment variables
)

const App = () => {
  const [tasks, setTasks] = useState([])  // State to store the list of tasks
  const [newTask, setNewTask] = useState("")  // State to store the new task input

  useEffect(() => {
    // Fetch all tasks when the component mounts
    fetchAllTasks()

    // Subscribe to changes in the "tasks" database table in realtime
    const tasksChannel = supabase
      // Create a channel named "tasks"
      .channel("tasks")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "tasks" }, payload => {
        // Log the received payload
        console.log("Change received!", payload)
        // Add the new task to the state
        setTasks((prevTasks) => [...prevTasks, payload.new]);
      })
      .subscribe(); // Subscribe to the channel

      // Cleanup the subscription on component unmount
      return () => {
        // Remove the channel subscription
        supabase.removeChannel(tasksChannel)
      }
  }, [])  // Empty dependency array to run once on mount

  // Function to fetch all tasks from the Supabase PostgreSQL database
  async function fetchAllTasks() {
    try {
      // Select all tasks from the "tasks" database table
      const { data, error } = await supabase.from("tasks").select()
      // Throw an error if an issue occurs
      if (error) throw error
      // Pass the tasks from the database to be stored in the state
      setTasks(data)
    } catch (error) {
      // Log any errors
      console.error("Error fetching the tasks:", error)
    }
  }

  // Handle input change for a new task
  const handleInputChange = event => {
    // Update state with the value entered from the input field
    setNewTask(event.target.value)
  }

  // Function to add a new task to the database table
  const addTask = async () => {
    if (newTask.trim() === "") return

    try {
      const { data, error } = await supabase
        .from("tasks")
        // Insert a new task into the "tasks" database table
        .insert([{ title: newTask }])

      // Throw an error if there's an issue
      if (error) throw error
      // Clear the input after the task has been added
      setNewTask("")
    } catch (error) {
      // Log any errors
      console.error("Error adding the task:", error)
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
*/