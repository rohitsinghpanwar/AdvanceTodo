import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { createPool } from 'mysql2';

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const pool = createPool({
  host: 'db', // Docker Compose service name
  user: 'root',
  password: '246472',
  database: 'mydatabase',
  waitForConnections: true,
  connectionLimit: 10, // Number of connections in the pool
  queueLimit: 0
});

// Promisify the pool query function for easier use with async/await
const promisePool = pool.promise();

app.post('/api/todo', async (req, res) => {
  const { todo } = req.body;
  const sql = 'INSERT INTO todo_items (todo, day, date) VALUES (?, DATE_FORMAT(NOW(), \'%W\'), NOW())';
  try {
    await promisePool.query(sql, [todo]);
    res.status(200).send('Todo added successfully');
  } catch (err) {
    console.error('Error inserting data:', err);
    res.status(500).send('Server error: ' + err.message);
  }
});

app.post('/api/complete', async (req, res) => {
  const { id } = req.body;
  const sql = 'UPDATE todo_items SET completed = 1 WHERE id = ?';
  try {
    await promisePool.query(sql, [id]);
    res.status(200).send('Todo marked as complete');
  } catch (err) {
    console.error('Error updating data:', err);
    res.status(500).send('Server error: ' + err.message);
  }
});

app.get('/api/todos', async (req, res) => {
  const sql = 'SELECT * FROM todo_items WHERE completed=0';
  try {
    const [rows] = await promisePool.query(sql);
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error fetching todos:', err);
    res.status(500).send('Server error: ' + err.message);
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});

