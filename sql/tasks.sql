 -- Create the table
 CREATE TABLE tasks (
   id SERIAL PRIMARY KEY,
   title text NOT NULL,
   notes text NOT NULL
 );
 -- Insert some sample data into the table
 INSERT INTO tasks (title, notes) VALUES ('Tidy the room', 'Tidy the room so it can be nice and organised.');