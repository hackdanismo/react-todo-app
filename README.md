# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## SQL
To create a `table` inside the `Supabase` `PostgreSQL` database, we can use `SQL (Structured Query Language)`:

```sql
 -- Create the table
 CREATE TABLE todo (
   id SERIAL PRIMARY KEY,
   task VARCHAR(255) NOT NULL
 );
 -- Insert some sample data into the table
 INSERT INTO todo (task) VALUES ('Tidy the room');
```

## Environment variables
Create a `.env` file within the root of the application and add the `Supabase` credentials. When using `Vite`, the `Environment Variables` should start with `VITE_` and can be accessed using `import.meta.env.VITE_` in the front-end code.

```
VITE_SUPABASE_PROJECT=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Realtime Notes

The error indicates that the on method is not recognized, likely due to an incorrect method chain. The Supabase client has been updated, and the subscription API has slightly changed. You should use the channel method for subscribing to real-time events.

Here’s the corrected code using the updated subscription method:

Key Changes:
Channel Subscription: Used supabase.channel('todos') to create a channel for real-time updates.
Event Listener: The on method is now applied to listen to 'postgres_changes' for the INSERT event.
Cleanup: The subscription is removed using supabase.removeChannel(todoChannel) to clean up on component unmount.
This code should now properly subscribe to real-time changes in the todo table and update the state accordingly.

```javascript
import { useEffect, useState } from "react"; // Import React hooks for state and effect management
import { createClient } from "@supabase/supabase-js"; // Import Supabase client creation function

// Initialize Supabase client using credentials from .env file
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_PROJECT,  // Project URL from environment variables
  import.meta.env.VITE_SUPABASE_ANON_KEY  // Anon key from environment variables
);

const App = () => {
  const [todos, setTodos] = useState([]); // State to store the list of todos
  const [newTodo, setNewTodo] = useState(""); // State to store the new todo input

  useEffect(() => {
    fetchAllTodos(); // Fetch all todos when the component mounts

    // Subscribe to changes in the 'todo' table
    const todoChannel = supabase
      .channel('todos') // Create a channel named 'todos'
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'todo' }, payload => {
        console.log('Change received!', payload); // Log the received payload
        setTodos((prevTodos) => [...prevTodos, payload.new]); // Add the new todo to the state
      })
      .subscribe(); // Subscribe to the channel

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(todoChannel); // Remove the channel subscription
    };
  }, []); // Empty dependency array to run once on mount

  // Function to fetch all todos from the database
  async function fetchAllTodos() {
    try {
      const { data, error } = await supabase.from("todo").select(); // Select all todos from 'todo' table
      if (error) throw error; // Throw an error if there's an issue
      setTodos(data); // Set the fetched todos to state
    } catch (error) {
      console.error("Error fetching todos:", error); // Log any errors
    }
  }

  // Handle input change for new todo
  const handleInputChange = (event) => {
    setNewTodo(event.target.value); // Update state with the current input value
  };

  // Function to add a new todo to the database
  const addTodo = async () => {
    if (newTodo.trim() === "") return; // Prevent adding an empty value

    try {
      const { data, error } = await supabase
        .from("todo")
        .insert([{ task: newTodo }]); // Insert a new todo into 'todo' table
      if (error) throw error; // Throw an error if there's an issue

      setNewTodo(""); // Clear the input after task has been added
    } catch (error) {
      console.error("Error adding the task:", error); // Log any errors
    }
  };

  return (
    <>
      <h1>Todo App</h1> {/* Application header */}

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.task}</li> // Render each todo as a list item
        ))}
      </ul>

      <label>
        <input
          type="text"
          value={newTodo}
          onChange={handleInputChange} // Update newTodo state on input change
          placeholder="Add a task" // Placeholder text
        />
      </label>
      <button onClick={addTodo}>Add Task</button> {/* Button to add new todo */}
    </>
  );
};

export default App; // Export the component as default
```

**The Realtime option has been switched on in Supabase**

Explanation of Each Section:
Imports and Initialization:
useEffect and useState are imported from React for managing side effects and state.
createClient from Supabase is used to initialize the Supabase client with credentials from environment variables.
Component State:
todos state stores the list of tasks.
newTodo state holds the current input value for a new task.
Effect Hook:
useEffect is used to fetch todos on component mount and set up a real-time subscription.
todoChannel subscribes to INSERT events on the todo table.
Cleanup function removes the subscription when the component unmounts.
Functions:
fetchAllTodos fetches all tasks from the Supabase database.
handleInputChange updates the newTodo state as the user types.
addTodo inserts a new task into the database and clears the input field.
Render Logic:
Renders a header, list of todos, an input field, and a button to add new tasks.