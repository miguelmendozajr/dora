import React, { useState, useEffect } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import image from './125652.png'; // Importing the image

function App() {
  const initialUsers = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    { id: 3, name: 'Alice Johnson' },
  ];

  const [users, setUsers] = useState(initialUsers);
  const [elapsedTime, setElapsedTime] = useState(0);

  const handleAddUser = () => {
    const newUser = { id: users.length + 1, name: 'Miguel' };
    setUsers([...users, newUser]);
  };

  const handleDeleteUser = (id) => {
    const updatedUsers = users.filter((user) => user.id !== id);
    setUsers(updatedUsers);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prevElapsedTime) => prevElapsedTime + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(elapsedTime / 3600);
  const minutes = Math.floor((elapsedTime % 3600) / 60);
  const seconds = elapsedTime % 60;

  const formatTimeUnit = (unit) => (unit < 10 ? `0${unit}` : unit);

  return (
    <div>
    <div className="App container">
      <div className="row">
        <div className="col-sm-6 offset-sm-3">
          <div className="machine-name text-center">
            <h1 className="fw-bold">Washroom</h1>
            <div className="mt-3 mb-3">Whirpool 8MWTW1823WJM</div>
            <img src={image} alt="Laundry Machine" className="machine-image img-fluid" />
            <div className="counter fw-bold mt-3">
              {`${formatTimeUnit(hours)}:${formatTimeUnit(minutes)}:${formatTimeUnit(seconds)} | Washing...`}
            </div>
            <div className='mt-1'>
              <button className="btn btn-outline-danger">I am using the machine</button>
            </div>
          </div>
          {users.length > 0 && (
            <div className="user-list mt-3">
              <div className="fw-bold fs-3">Waitlist</div>
              <ul className="list-group">
                {users.map((user) => (
                  <li
                    key={user.id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    {user.name}
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="d-flex justify-content-center">
            <button onClick={handleAddUser} className="mt-4 btn btn-dark">Schedule</button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default App;
