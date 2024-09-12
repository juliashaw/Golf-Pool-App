import React, { useState } from 'react';

const AddPlayer: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [salary, setSalary] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, salary }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit player information');
      }

      console.log('Player information submitted successfully');
    } catch (error) {
      console.error('Error submitting player information:', error); 
    }
  };

  return (
    <div style={{ backgroundColor: "#f2f2f2", minWidth: "325px", borderRadius: "20px", display: "grid", textAlign: "center"}}>
      <h1>Add Player</h1>
      <form onSubmit={handleSubmit} style={{padding: "10px", textAlign: "right"}}>
        <div >
          <label>First Name:</label>
          <input
            style={{margin: "5px"}}
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Last Name:</label>
          <input
            style={{margin: "5px"}}
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Salary:</label>
          <input
            style={{margin: "5px"}}
            type="number"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            required
          />
        </div>
        <button type="submit" style={{backgroundColor: "#808080", borderRadius: "5px", margin: "5px"}}>Submit</button>
      </form>
    </div>
  );
};

export default AddPlayer;
