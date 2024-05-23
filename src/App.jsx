import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

import Layout from "./components/layout"
import Modal from "./components/modal"

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
  const [editTaskId, setEditTaskId] = useState(null)
  const [editTitle, setEditTitle] = useState("")
  const [editNotes, setEditNotes] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  // State to hold search queries
  const [searchQuery, setSearchQuery] = useState("")
  // State to hold hide completed tasks toggle
  const [hideCompleted, setHideCompleted] = useState(false)

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
        // Add the new task at the beginning of the list
        setTasks((prevTasks) => [payload.new, ...prevTasks]);
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
      // Tasks to be ordered by the id in descending order
      const { data, error } = await supabase.from("tasks").select().order("id", { ascending: false })

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

  // Function to remove/delete a task from the database when button is clicked
  const deleteTask = async (taskId) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId)

      // Throw an error if an issue occurs
      if (error) throw error

      // Update the state to remove the deleted task
      setTasks((prevTasks) => prevTasks.filter(task => task.id !== taskId))
    } catch (error) {
      // Log any errors
      console.error("Error deleting/removing the task:", error)
    }
  }

  const startEditing = task => {
    setEditTaskId(task.id)
    setEditTitle(task.title)
    setEditNotes(task.notes)
  }

  const handleEditTitleChange = e => {
    setEditTitle(e.target.value)
  }

  const handleEditNotesChange = e => {
    setEditNotes(e.target.value)
  }

  const handleSearchInputChange = e => {
    setSearchQuery(e.target.value)
  }

  const handleHideCompletedChange = e => {
    setHideCompleted(e.target.checked)
  }

  const saveEdit = async (taskId) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ title: editTitle, notes: editNotes })
        .eq("id", taskId)

      if (error) throw error

      setTasks((prevTasks) => 
        prevTasks.map((task) => 
          task.id === taskId ? { ...task, title: editTitle, notes: editNotes } : task
        )
      )

      setEditTaskId(null)
      setEditTitle("")
      setEditNotes("")
    } catch (error) {
      console.error("Error updating/editing the task:", error)
    }
  }

  // Function to toggle the task completion
  const toggleCompletion = async (taskId, currentStatus) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ completed: !currentStatus })
        .eq("id", taskId)

      if (error) throw error

      setTasks((prevTasks) => 
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, completed: !currentStatus } : task
        )
      )
    } catch (error) {
      console.error("Error toggling task completion:", error)
    }
  }

  const filteredTasks = tasks.filter(task =>
    (task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.notes.toLowerCase().includes(searchQuery.toLowerCase())) &&
    // Hide completed tasks when the toggle option is selected
    (!hideCompleted || !task.completed)
  )

  return (
    <>
      <Layout>
        <h1>Tasks</h1>

        {/* Search field */}
        <label>
          <input
            type="text"
            placeholder="Search tasks"
            value={searchQuery}
            onChange={handleSearchInputChange}
            style={{ display: `block`, width: `300px`, padding: `0.5rem 0`, margin: `1rem 0` }}
          />
        </label>

        {/* Hide completed tasks */}
        <label>
          <input
            type="checkbox"
            checked={hideCompleted}
            onChange={handleHideCompletedChange}
          />
          Hide Completed Tasks
        </label>

        <button onClick={() => setIsModalOpen(true)}>Add Task</button>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <form onSubmit={(e) => { e.preventDefault(); addNewTask(); }}>
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
            <button type="submit">Add Task</button>
          </form>
        </Modal>

        <div style={{ display: `flex`, flexDirection: `column`, gap: `1rem`, margin: `2rem 0` }}>
          {/* Map over the state containing the tasks from the database */}
          {filteredTasks.map((task) => (
            <div key={task.id} style={{ border: `1px solid black`, padding: `1rem` }}>

              {editTaskId === task.id ? (
                <>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={handleEditTitleChange}
                  />
                  <textarea
                    value={editNotes}
                    onChange={handleEditNotesChange}
                  />
                  <button onClick={() => saveEdit(task.id)}>Save</button>
                  <button onClick={() => setEditTaskId(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <h2 style={{ textDecoration: task.completed ? "line-through" : "none" }}>{task.title}</h2>
                  {task.notes && (<p>{task.notes}</p>)}
                  <button onClick={() => startEditing(task)}>Edit Task</button>
                  <button onClick={() => deleteTask(task.id)}>Delete Task</button>
                  <button onClick={() => toggleCompletion(task.id, task.completed)}>
                    {task.completed ? "Mark as Incomplete" : "Mark as Completed"}
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </Layout>
    </>
  )
}

export default App