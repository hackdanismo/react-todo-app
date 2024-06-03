 -- Create the table with reference to the User UID from within the Supabase auth users table
 CREATE TABLE tasks (
   id SERIAL PRIMARY KEY,
   title text NOT NULL,
   notes text NOT NULL,
   completed BOOLEAN DEFAULT FALSE
   user_uid UUID REFERENCES auth.users(id)
 );
 -- Insert some sample data into the table
 INSERT INTO tasks (title, notes, completed) VALUES ('Tidy the room', 'Tidy the room so it can be nice and organised.', FALSE, "2b8ff76f-e829-43d9-a060-f8a963228dbb");