import React, { useState, useEffect } from 'react';
import image from './125652.png';
import "./App.css"
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import { Modal, Button } from 'react-bootstrap';

export default function App() {
  const initialUsers = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    { id: 3, name: 'Alice Johnson' },
  ];

  const [users, setUsers] = useState(initialUsers);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [washStartedAt, setWashStartedAt] = useState(null);
  const [washroom, setWashroom] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleAddUser = () => {
    const storedName = localStorage.getItem('name');
    const storedPhone = localStorage.getItem('phone');

    if (!storedName || !storedPhone) {
      setModalVisible(true);
      return;
    }
  };
  const handleDeleteUser = (id) => {
    const updatedUsers = users.filter((user) => user.id !== id);
    setUsers(updatedUsers);
  };

  const handleRequest = async () => {
    try {
      const response = await fetch('http://dora-production.up.railway.app/washroom/machine/1');
      if (response.ok) {
        const data = await response.json();
        setWashroom(data);
        if (data && data.cycle && data.cycle.startedAt) {
          const startedAtTimestamp = new Date(data.cycle.startedAt).getTime() / 1000;
          setWashStartedAt(startedAtTimestamp);
        }
      } else {
        throw new Error('Request failed');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    handleRequest();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (washStartedAt !== null) {
        const currentTime = Math.floor(Date.now() / 1000);
        const elapsed = currentTime - washStartedAt;
        setElapsedTime(elapsed);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [washStartedAt]);


  const hours = Math.floor(elapsedTime / 3600);
  const minutes = Math.floor((elapsedTime % 3600) / 60);
  const seconds = elapsedTime % 60;


  const formatTimeUnit = (unit) => (unit < 10 ? `0${unit}` : unit);

  return (
    <>
    
    {
      washroom &&
  <div className="App container">
        <Modal show={modalVisible} onHide={() => setModalVisible(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Enter Name and Phone</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input type="text" placeholder="Enter Name" className="form-control mb-2" />
          <input type="text" placeholder="Enter Phone" className="form-control" />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary">
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    <div className="row">
      <div className="col-sm-6 offset-sm-3">
        <div className="machine-name text-center">
          <h1 className="fw-bold mt-4">Washroom</h1>
          <div className="mt-3 mb-3">{washroom.machine.name}</div>
          <img src={image} alt="Laundry Machine" className="machine-image img-fluid" />
          { washroom.cycle ? 
   
            <div className="counter fw-bold mt-3">
              {`${formatTimeUnit(hours)}:${formatTimeUnit(minutes)}:${formatTimeUnit(seconds)} | ${washroom.cycle.status}...`}
            </div>
            : 
             <div className='mt-1'>
              <button className="btn btn-outline-danger">I am using it</button>
            </div>
          }
        </div>
        {users.length > 0 && (
          <div className="user-list">
            <div className="mt-3 text-center fw-bold fs-3">Waitlist</div>
            <ul className="list-group">
              {washroom.waitlist.map((cycle) => (
              <li key={cycle.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  {cycle.name}
                </div>
                {cycle.status === 'Not started' && (
                  <button
                    className="btn btn-sm pl-5 btn-danger"
                    // onClick={() => handleCancelCycle(cycle.id)} // Function to cancel a cycle
                  >
                    Cancel
                  </button>
                )}
              </li>
            ))}
            </ul>
          </div>
        )}
        <div className="d-flex justify-content-center">
          <button onClick={handleAddUser} className="mt-4 mb-4 btn btn-dark">Schedule</button>
        </div>
      </div>
    </div>
  </div>
  }
  </>
  )
}
