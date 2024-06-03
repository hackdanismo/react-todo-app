import React, { useState } from "react"
import { createClient } from "@supabase/supabase-js";

// Create the client to connect to Supabase using the credentials in the .env file
const supabase = createClient(
  // Import the Project URL value
  import.meta.env.VITE_SUPABASE_PROJECT, 
  // Import the Anon key value
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const App = () => {
  // State to manage the user of the app
  const [user, setUser] = useState(null)
  // State to capture the email value entered into the sign up form
  const [email, setEmail] = useState("")
  // State to capture the password value entered into the sign up form
  const [password, setPassword] = useState("")
  // State to store tasks from the database
  const [tasks, setTasks] = useState([])

  // Function to handle when a user completes the sign in form
  const handleSignIn = async (e) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      // Store data in the state
      setUser(data.user)
      // Fetch the tasks for the user that is signed-in
      fetchTasks(data.user.id)
    } catch (error) {
      console.error(error.message)
    }
  }

  // Function to handle when a user is signing out from the application
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setEmail("")
      setPassword("")
      // Clear the state, clearing the tasks when the user signs-out
      setTasks([])
    } catch (error) {
      console.error(error.message)
    }
  }

  // Function to fetch tasks based on the User UID value
  const fetchTasks = async (userUid) => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_uid", userUid)
      if (error) throw error
      setTasks(data)
    } catch (error) {
      console.error("Error fetching tasks:", error.message)
    }
  }

  return (
    <>
      {user ? (<button type="button" onClick={handleSignOut}>Sign Out</button>):(<div>Not Signed In</div>)}
      {user ? (
        <>
        <div>+++ User is Logged In +++</div>
        <ul>
          {/* Map over the tasks for the user that has signed in */}
          {tasks.map(task => (
            <li key={task.id}>{task.title}: {task.notes}</li>
          ))}
        </ul>
        </>
      ) : (
        /* Sign up / Sign in form shows if user is not signed in */
        <form onSubmit={handleSignIn}>
          <label>
            <input
              type="email"
              name="email"
              value={email}
              placeholder="Email address"
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </label>
          <label>
            <input
              type="password"
              name="password"
              value={password}
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button
            type="submit">
            Sign in / Sign up
          </button>
        </form>
        /* END: Sign up / Sign in form shows if user is not signed in */
      )}
    </>
  )
}

export default App 