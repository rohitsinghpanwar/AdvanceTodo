import React, { useState, useEffect } from "react";
import axios from 'axios';

function App() {
  const [todo, setTodo] = useState('');
  const [submittedTodo, setSubmittedTodo] = useState(null);
  const [todos, setTodos] = useState([]);
  const [complete, setComplete] = useState(null);
  const [view, setView] = useState('remaining'); // State to manage the view

  // Utility function to format date
  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options); // Formats date to DD/MM/YYYY
  };

  useEffect(() => {
    // Function to fetch remaining todos
    const fetchRemainingTodos = () => {
      axios.get('http://65.0.205.20:3000/api/todos')
        .then(response => {
          setTodos(response.data); // Set the todos state with the fetched data
        })
        .catch(error => {
          console.error('Error fetching todos:', error);
        });
    };

    // Function to fetch completed todos
    const fetchCompletedTodos = () => {
      axios.get('http://65.0.205.20:3000/api/completedtodos')
        .then(response => {
          setTodos(response.data);
        })
        .catch(error => {
          console.error('Error fetching completed todos:', error);
        });
    };

    if (view === 'remaining') {
      fetchRemainingTodos();
    } else if (view === 'completed') {
      fetchCompletedTodos();
    }
  }, [submittedTodo, complete, view]); // Dependency array includes view to trigger useEffect on view change

  const handleChange = (e) => {
    setTodo(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    axios.post('http://65.0.205.20:3000/api/todo', { todo })
      .then(response => {
        console.log('Todo added:', response.data);
        setSubmittedTodo(todo); // Update submittedTodo to trigger useEffect
        setTodo('');
      })
      .catch(error => {
        console.error('Error in inserting data:', error);
      });
  };

  const handleComplete = (e) => {
    const todoId = e.target.value;

    axios.post('http://65.0.205.20:3000/api/complete', { id: todoId })
      .then(response => {
        console.log('Todo completed:', response.data);
        setComplete(todoId); // Update complete to trigger useEffect
      })
      .catch(error => {
        console.error('Error completing todo:', error);
      });
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  return (
    <div className="bg-black h-screen bg-opacity-70">
      <h1 className="text-white italic font-bold text-5xl underline underline-offset-4 text-center p-5">
        Todo Manager
      </h1>
      <div className="flex flex-col items-center mt-5">
        <div className="flex items-center gap-1">
          <label htmlFor="todo" className="text-2xl italic gap-3 flex items-center justify-center">
            Enter your Todo
            <input
              type="text"
              name="todo"
              id="todo"
              className="w-96 h-10 rounded-lg"
              min={1}
              value={todo}
              onChange={handleChange}
            />
          </label>
          <button
            type="button"
            className="bg-blue-500 text-lg p-1 rounded-lg drop-shadow-[0_0px_10px_rgba(200,200,200,0.5)] h-10"
            onClick={handleSubmit}
          >
            Add Todo
          </button>
        </div>
      </div>
      <div className="flex justify-center mt-5">
        <div className="flex flex-col items-center bg-amber-100 border-black border-2 w-[70vw] rounded-xl p-3">
          <h2 className="text-4xl italic">{view === 'remaining' ? 'Remaining Todos:' : 'Completed Todos:'}</h2>
          <ul className="flex flex-col">
            {todos.map(todoItem => (
              <div key={todoItem.id} className="border border-black w-[70vw]">
                <li className="text-2xl text-center italic">
                  {todoItem.todo}
                </li>
                {view === 'completed' && (
                  <h1 className="text-center text-lg italic">Completed✅</h1>
                )}
                {view === 'remaining' && (
                  <div className="flex justify-evenly items-center p-1">
                    <h2>{todoItem.day}</h2>
                    <h2>{formatDate(todoItem.date)}</h2> {/* Format date before displaying */}
                    <button
                      type="button"
                      className="bg-green-300 p-1 rounded-full"
                      onClick={handleComplete}
                      value={todoItem.id}
                    >
                      Complete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </ul>
          <div className="flex justify-between w-[60vw] p-3">
            <button type="button" className="bg-red-500 p-1 text-lg font-bold rounded-lg" onClick={() => handleViewChange('remaining')}>Remaining Todos</button>
            <button type="button" className="bg-red-500 p-1 text-lg font-bold rounded-lg" onClick={() => handleViewChange('completed')}>Completed Todos</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

