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
    } catch (error) {
      console.log(error.message)
    }
  }

  return (
    <>
      {user ? (<div>Signed In</div>):(<div>Not Signed In</div>)}
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
    </>
  )
}

export default App 