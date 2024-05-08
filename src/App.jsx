import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

// Use credentials from the .env file when using Vite for the application, .dotenv is not required
const supabase = createClient(import.meta.env.VITE_SUPABASE_PROJECT, import.meta.env.VITE_SUPABASE_ANON_KEY)

const App = () => {
  const [countries, setCountries] = useState([])

  useEffect(() => {
    getCountries()
  }, [])

  async function getCountries() {
    const { data } = await supabase.from("countries").select()
    setCountries(data)
  }

  return (
    <>
      <h1>Todo App</h1>

      <ul>
        {countries.map((country) => (
          <li key={country.name}>{country.name}</li>
        ))}
      </ul>
    </>
  )
}

export default App
