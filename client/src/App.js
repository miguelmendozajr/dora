import React, { useState, useEffect } from 'react';
import image from './125652.png';
import "./App.css"
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button } from 'react-bootstrap';

export default function App() {

  const [elapsedTime, setElapsedTime] = useState(0);
  const [washStartedAt, setWashStartedAt] = useState(null);
  const [washroom, setWashroom] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');

  const handleNameChange = (event) => {
    setUserName(event.target.value);
  };

  const handlePhoneChange = (event) => {
    setUserPhone(event.target.value);
  };

  const handleSaveUser = async () => {
  try {
    const response = await fetch(`http://dora-production.up.railway.app/user?name=${userName}&phone=${userPhone}`, {
      method: 'POST',
    });

    if (response.ok) {
      localStorage.setItem('name', userName);
      localStorage.setItem('phone', "+" + String(userPhone));
      console.log('User successfully saved');
    } else {
      throw new Error('Failed to save user');
    }
  } catch (error) {
    console.error('Error saving user:', error);
  } finally {
    setModalVisible(false);
  }
};


const handleUpdateCycle = async () => {
  const storedName = localStorage.getItem('name');
  const storedPhone = localStorage.getItem('phone');
  console.log(storedName, storedPhone);
  if (!storedName || !storedPhone) {
    setModalVisible(true);
    return;
  }
  try {
    const response = await fetch(`http://dora-production.up.railway.app/washroom/machine/1/cycle/update?phone=${storedPhone.substring(1)}`, {
      method: 'POST'
    });
    if (response.ok) {
      console.log('Cycle successfully updated');
      setWashroom(prevState => ({
        ...prevState,
        cycle: {
          ...prevState.cycle,
          user_phone: storedPhone
        }
      }));

    } else {
      throw new Error('Failed to create cycle');
    }
  } catch (error) {
    console.error('Error updating cycle:', error);
  };

};

  const handleAddCycle = async () => {
    const storedName = localStorage.getItem('name');
    const storedPhone = localStorage.getItem('phone');
    console.log(storedName, storedPhone);
    if (!storedName || !storedPhone) {
      setModalVisible(true);
      return;
    }
    try {
      const response = await fetch(`http://dora-production.up.railway.app/washroom/machine/1/cycle?phone=${storedPhone.substring(1)}`, {
        method: 'POST'
      });
      if (response.ok) {
        console.log('Cycle successfully created');
        const { id } = await response.json();
        const newCycle = {
        id,
        name: storedName,
        status: 'Not started',
        phone: storedPhone
      };

      setWashroom(prevState => ({
        ...prevState,
        waitlist: [...prevState.waitlist, newCycle]
      }));

      } else {
        throw new Error('Failed to create cycle');
      }
    } catch (error) {
      console.error('Error creating cycle:', error);
    }
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

  const handleCancelCycle = async (cycleId) => {
    try {
      const response = await fetch(`http://dora-production.up.railway.app/washroom/cycle?id=${cycleId}`, {
        method: 'POST'
      });
      if (response.ok) {
        console.log('Cycle successfully canceled');
        const updatedWaitlist = washroom.waitlist.filter((cycle) => cycle.id !== cycleId);
        setWashroom(prevState => ({
          ...prevState,
          waitlist: updatedWaitlist,
        }));
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
    const storedName = localStorage.getItem('name');
    const storedPhone = localStorage.getItem('phone');

    if (storedName && storedPhone) {
      setUserName(storedName);
      setUserPhone(storedPhone);
    }
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
          <Modal.Title>Sign In</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type="text"
            placeholder="Enter Name"
            className="form-control mb-2"
            value={userName}
            onChange={handleNameChange}
          />
          <input
            type="text"
            placeholder="Enter Phone"
            className="form-control"
            value={userPhone}
            onChange={handlePhoneChange}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button disabled={userPhone.length !== 13 || !userName} variant="primary" onClick={handleSaveUser}>
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
          { washroom.cycle &&
            <div>
              <div className="counter fw-bold mt-3">
                {`${formatTimeUnit(hours)}:${formatTimeUnit(minutes)}:${formatTimeUnit(seconds)} | ${washroom.cycle.status}...`}
              </div>
              {
                washroom.cycle.warning === 1 &&
                <div className='fw-bold text-danger'>DO NOT OPEN</div>
              }
              
            </div>
          }
          { washroom.cycle && !washroom.cycle.user_phone &&
             <div className='mt-2'>
              <button onClick={handleUpdateCycle} className="btn btn-outline-danger">I am using it</button>
            </div>
          }
        </div>
        {washroom.waitlist.length > 0 && (
          <div className="user-list">
            <div className="mt-3 text-center fw-bold fs-3">Waitlist</div>
            <ul className="list-group">
              {washroom.waitlist.map((cycle) => (
              <li key={cycle.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  {cycle.name}
                </div>
                {cycle.status === 'Not started' && cycle.phone === localStorage.getItem('phone') && (
                  <button
                    className="btn btn-sm pl-5 btn-danger "
                    onClick={() => handleCancelCycle(cycle.id)}
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
          <button onClick={handleAddCycle} className="mt-4 mb-4 btn btn-dark">Schedule</button>
        </div>
      </div>
    </div>
  </div>
  }
  </>
  )
}
