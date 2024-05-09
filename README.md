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