import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Create the client to connect to Supabase using the credentials in the .env file
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_PROJECT,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const App = () => {
  // State to toggle between the sign-in and sign-up form modes
  const [isSignUp, setIsSignUp] = useState(false);
  // State to manage the user of the app
  const [user, setUser] = useState(null);
  // State to capture the email value entered into the sign up form
  const [email, setEmail] = useState("");
  // State to capture the password value entered into the sign up form
  const [password, setPassword] = useState("");
  // State to store tasks from the database
  const [tasks, setTasks] = useState([]);
  // State to capture the title of a new task being added
  const [title, setTitle] = useState("");
  // State to capture the notes of a new task being added
  const [notes, setNotes] = useState("");
  // State to capture the search query
  const [searchQuery, setSearchQuery] = useState("")
  // State to track which task is being edited
  const [editingTaskId, setEditingTaskId] = useState("")
  const [editTitle, setEditTitle] = useState("")
  const [editNotes, setEditNotes] = useState("")

  // Function to fetch tasks based on the User UID value
  const fetchTasks = async (userUid) => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_uid", userUid);
      if (error) throw error;
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error.message);
    }
  };

  useEffect(() => {
    const fetchInitialTasks = async () => {
      if (user) {
        await fetchTasks(user.id);
      }
    };

    fetchInitialTasks();

    const subscription = supabase
      .channel('public:tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `user_uid=eq.${user?.id}` }, payload => {
        console.log('Change received!', payload);
        if (payload.eventType === 'INSERT' && payload.new) {
          setTasks((prevTasks) => [...prevTasks, payload.new]);
        } else if (payload.eventType === 'UPDATE' && payload.new) {
          setTasks((prevTasks) =>
            prevTasks.map((task) =>
              task.id === payload.new.id ? payload.new : task
            )
          );
        } else if (payload.eventType === 'DELETE' && payload.old) {
          setTasks((prevTasks) =>
            prevTasks.filter((task) => task.id !== payload.old.id)
          );
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  // Function to handle when a user completes the sign up form
  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      // Automatically sign in the user after sign-up
      handleSignIn(e);
    } catch (error) {
      console.error(error.message);
    }
  };

  // Function to handle when a user completes the sign in form
  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // Store data in the state
      setUser(data.user);
      // Fetch the tasks for the user that is signed-in
      fetchTasks(data.user.id);
    } catch (error) {
      console.error(error.message);
    }
  };

  // Function to handle when a user is signing out from the application
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setEmail("");
      setPassword("");
      // Clear the state, clearing the tasks when the user signs-out
      setTasks([]);
    } catch (error) {
      console.error(error.message);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert([{ title, notes, user_uid: user.id }])
        .single();
      if (error) throw error;
      // Fetch the latest tasks after adding a new task
      fetchTasks(user.id);
      // Clear the form fields so another new task can be added
      setTitle("");
      setNotes("");
    } catch (error) {
      console.error("Error adding a new task:", error.message);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId)
      if (error) throw error
      // Remove the task from the state after deletion
      setTasks(tasks.filter(task => task.id !== taskId))
    } catch (error) {
      console.error("Error deleting task:", error.message)
    }
  }

  const updateTask = async (e, taskId) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase
        .from("tasks")
        .update({ title: editTitle, notes: editNotes })
        .eq("id", taskId)
      if (error) throw error
      // Update the tasks state with the updated task data
      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, title: editTitle, notes: editNotes } : task
        )
      )
      setEditingTaskId(null)
      setEditTitle("")
      setEditNotes("")
    } catch (error) {
      console.error("Error updating task:", error.message)
    }
  }

  const toggleTaskCompletion = async (taskId, currentStatus) => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .update({ completed: !currentStatus })
        .eq("id", taskId);
      if (error) throw error;
      // Update the tasks state with the updated task data
      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, completed: !currentStatus } : task
        )
      );
    } catch (error) {
      console.error("Error toggling task completion:", error.message);
    }
  };
  

  // Search function
  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.notes.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      {user ? (
        <button type="button" onClick={handleSignOut}>Sign Out</button>
      ) : (
        <div>Not Signed In</div>
      )}
      {user ? (
        <>
          <div>+++ User is Logged In +++</div>
          <form onSubmit={addTask}>
            <label>
              <input
                type="text"
                value={title}
                placeholder="Task Title"
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </label>
            <label>
              <input
                type="text"
                value={notes}
                placeholder="Task Notes"
                onChange={(e) => setNotes(e.target.value)}
                required
              />
            </label>
            <button type="submit">Add Task</button>
          </form>
          <input
            type="text"
            placeholder="Search tasks"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <ul>
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <li key={task.id}>
                  {editingTaskId === task.id ? (
                    <form onSubmit={(e) => updateTask(e, task.id)}>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Edit Title"
                        required
                      />
                      <input
                        type="text"
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="Edit Notes"
                        required
                      />
                      <button type="submit">Update</button>
                      <button type="button" onClick={() => setEditingTaskId(null)}>Cancel</button>
                    </form>
                  ) : (
                    <>
                      <span style={{ textDecoration: task.completed ? "line-through" : "none" }}>
                        {task.title}: {task.notes}
                      </span>
                      <button type="button" onClick={() => {
                        setEditingTaskId(task.id);
                        setEditTitle(task.title);
                        setEditNotes(task.notes);
                      }}>Edit</button>
                      <button type="button" onClick={() => deleteTask(task.id)}>Delete Task</button>
                      <button type="button" onClick={() => toggleTaskCompletion(task.id, task.completed)}>
                        {task.completed ? "Mark as Incomplete" : "Mark as Completed"}
                      </button>
                    </>
                  )}
                </li>
              ))
            ) : (
              <li>No match found</li>
            )}
            {/* Map over the tasks for the user that has signed in */}
            {/*{tasks.map(task => (
              <li key={task.id}>
                {task.title}: {task.notes}
                <button type="button" onClick={() => deleteTask(task.id)}>Delete Task</button>
              </li>
            ))}*/}
          </ul>
        </>
      ) : (
        /* 
          * Sign up / Sign in form shows if user is not signed in 
          * Form toggles between the two submit functions based on the state
        */
        <form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
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
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
          {/* Button to allow users to toggle between the Sign Up and Sign In form modes */}
          <br/>
          <button type="button" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? "Switch to Sign In" : "Switch to Sign Up"}
          </button>
        </form>
        /* END: Sign up / Sign in form shows if user is not signed in */
      )}
    </>
  );
};

export default App;
