import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client using credentials from .env file
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_PROJECT,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const App = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");

  useEffect(() => {
    fetchAllTodos();

    // Subscribe to changes in the 'todo' table
    const todoChannel = supabase
      .channel('todos')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'todo' }, payload => {
        console.log('Change received!', payload);
        setTodos((prevTodos) => [...prevTodos, payload.new]);
      })
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(todoChannel);
    };
  }, []);

  // Function to fetch all todos from the database
  async function fetchAllTodos() {
    try {
      const { data, error } = await supabase.from("todo").select();
      if (error) throw error;
      setTodos(data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  }

  // Handle input change for new todo
  const handleInputChange = (event) => {
    setNewTodo(event.target.value);
  };

  // Function to add a new todo to the database
  const addTodo = async () => {
    if (newTodo.trim() === "") return; // Prevent adding an empty value

    try {
      const { data, error } = await supabase
        .from("todo")
        .insert([{ task: newTodo }]);
      if (error) throw error;

      setNewTodo(""); // Clear the input after task has been added
    } catch (error) {
      console.error("Error adding the task:", error);
    }
  };

  return (
    <>
      <h1>Todo App</h1>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.task}</li>
        ))}
      </ul>

      <label>
        <input
          type="text"
          value={newTodo}
          onChange={handleInputChange}
          placeholder="Add a task"
        />
      </label>
      <button onClick={addTodo}>Add Task</button>
    </>
  );
};

export default App;
