# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Live Website
`https://tourmaline-blini-9dcc52.netlify.app/`

## SQL
To create a `table` inside the `Supabase` `PostgreSQL` database, we can use `SQL (Structured Query Language)`:

```sql
 -- Create the table
 CREATE TABLE tasks (
   id SERIAL PRIMARY KEY,
   title text NOT NULL,
   notes text NOT NULL,
   completed BOOLEAN DEFAULT FALSE
 );
 -- Insert some sample data into the table
 INSERT INTO tasks (title, notes, completed) VALUES ('Tidy the room', 'Tidy the room so it can be nice and organised.', FALSE);
```

## Environment variables
Create a `.env` file within the root of the application and add the `Supabase` credentials. When using `Vite`, the `Environment Variables` should start with `VITE_` and can be accessed using `import.meta.env.VITE_` in the front-end code.

```
VITE_SUPABASE_PROJECT=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
