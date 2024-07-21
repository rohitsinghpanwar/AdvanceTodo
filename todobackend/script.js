import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { createConnection } from 'mysql2';

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

const db = createConnection({
  host: 'localhost',
  user: 'root',
  password: '246472',
  database: 'mydatabase'
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('MySQL connected');
});

app.post('/api/todo', (req, res) => {
  const { todo } = req.body;
  const sql = 'INSERT INTO todo_items (todo, day, date) VALUES (?, DATE_FORMAT(NOW(), \'%W\'), NOW())';
  db.query(sql, [todo], (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send('Server error: ' + err.message);
      return;
    }
    res.status(200).send('Todo added successfully');
  });
});

app.post('/api/complete', (req, res) => {
  const { id } = req.body;
  const sql = 'UPDATE todo_items SET completed = 1 WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error updating data:', err);
      res.status(500).send('Server error: ' + err.message);
      return;
    }
    res.status(200).send('Todo marked as complete');
  });
});

// New GET endpoint to fetch all todos
app.get('/api/todos', (req, res) => {
  const sql = 'SELECT * FROM todo_items WHERE completed=0';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching todos:', err);
      res.status(500).send('Server error: ' + err.message);
      return;
    }
    res.status(200).json(results);
  });
});
app.get('/api/completedtodos', (req, res) => {
  const sql = 'SELECT * FROM todo_items WHERE completed=1';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching todos:', err);
      res.status(500).send('Server error: ' + err.message);
      return;
    }
    res.status(200).json(results);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
