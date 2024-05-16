import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

// Create the client to connect to Supabase using the credentials in the .env file
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_PROJECT,  // Project URL value
  import.meta.env.VITE_SUPABASE_ANON_KEY  // Anon key value
)

const App = () => {
  // State to hold all existing tasks - should be an array to support the map method
  const [tasks, setTasks] = useState([])
  // State to hold the new task input value
  const [newTask, setNewTask] = useState("")
  // State to hold the notes from the textarea input value
  const [newNotes, setNewNotes] = useState("")

  useEffect(() => {
    // Call the function to fetch all tasks when the component mounts
    fetchAllTasks()

    // Create a subscription to listen for real-time database changes
    const tasksChannel = supabase
      // Create the channel to group real-time subscriptions together
      .channel("tasks")
      .on("postgres_changes", { 
        event: "INSERT", 
        schema: "public", 
        table: "tasks" 
      }, payload => {
        // Log the output from the received payload
        console.log("Change received!", payload)
        // Add the existing tasks from the database to the state to be stored
        setTasks((prevTasks) => [...prevTasks, payload.new]);
      })
      // Subscribe to the channel
      .subscribe()

      // Cleanup the subscription on component unmount
      return () => {
        // Remove the channel subscription to stop listening to real-time updates
        supabase.removeChannel(tasksChannel)
      }
  }, [])  // Empty dependency array to run once on mount

  // Function to fetch all tasks from the database
  const fetchAllTasks = async () => {
    try {
      // Select all tasks from the database table
      const { data, error } = await supabase.from("tasks").select()

      // Throw an error if an issue occurs
      if (error) throw error
      // Store all tasks from the database into the state
      setTasks(data)
    } catch (error) {
      // Log any errors
      console.error("Error fetching the tasks:", error)
    }
  }

  // Function to handle form input
  const handleInputChange = e => {
    // Value from the input field is stored in the state
    setNewTask(e.target.value)
  }

  // Function to handle notes input
  const handleNotesInputChange = e => {
    // Value from the notes textarea field is stored in the state
    setNewNotes(e.target.value)
  }

  // Function to add a new task to the database when button is clicked
  const addNewTask = async () => {
    // Remove whitespace from the start and end of the the form input fields
    if (newTask.trim() === "" && newNotes.trim() === "") return

    try {
      const { data, error } = await supabase
        // Get the table from the Supabase database
        .from("tasks")
        // Insert the new task into this database table from the state
        .insert([
          { 
            title: newTask,
            notes: newNotes,
          }
        ])

      // Throw an error if an issue occurs
      if (error) throw error

      // Clear the input field after successful insertion
      setNewTask("")
      // Clear the textarea input field after successful insertion
      setNewNotes("")
    } catch (error) {
      // Log any errors
      console.error("Error adding a new task:", error)
    }
  }

  return (
    <>
      <h1>Tasks</h1>

      <form onSubmit={addNewTask}>
        <label>
          <input 
            type="text" 
            value={newTask} 
            onChange={handleInputChange}
            placeholder="Add a task" 
            style={{ display: `block`, width: `300px`, padding: `0.5rem 0`, margin: `1rem 0` }}
          />
        </label>
        <label>
          <textarea
            value={newNotes}
            onChange={handleNotesInputChange}
            placeholder="Add notes"
            style={{ display: `block`, width: `500px`, margin: `1rem 0` }}
          />
        </label>
        <button type="submit" onClick={addNewTask}>Add Task</button>
      </form>

      <div style={{ display: `flex`, flexDirection: `column`, gap: `1rem`, margin: `2rem 0` }}>
        {/* Map over the state containing the tasks from the database */}
        {tasks.map((task) => (
          <div key={task.id} style={{ border: `1px solid black`, padding: `1rem` }}>
            <h2>{task.title}</h2>
            <p>{task.notes}</p>
          </div>
        ))}
      </div>
    </>
  )
}

export default App