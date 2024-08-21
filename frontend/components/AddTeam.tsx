import React, { useState } from 'react';

const AddTeam: React.FC = () => {
  const [teamName, setTeamName] = useState('');
  const [players, setPlayers] = useState([{ firstName: '', lastName: '' }]);

  const handleAddPlayer = () => {
    setPlayers([...players, { firstName: '', lastName: '' }]);
  };

  const handlePlayerChange = (index: number, field: string, value: string) => {
    const newPlayers = players.map((player, i) =>
      i === index ? { ...player, [field]: value } : player
    );
    setPlayers(newPlayers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teamName, players }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit team information');
      }

      // Optionally, handle the response or update the UI
      console.log('Team information submitted successfully');
    } catch (error) {
      console.error('Error submitting team information:', error);
    }
  };

  return (
    <div style={{ backgroundColor: "#f2f2f2", maxWidth: "325px", borderRadius: "20px", display: "grid", textAlign: "center", margin: "20px"}}>
      <h1>Add Team</h1>
      <form onSubmit={handleSubmit} style={{padding: "10px", textAlign: "right"}}>
        <div>
          <label>Team Name:</label>
          <input
            style={{margin: "5px"}}
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
          />
        </div>
        {players.map((player, index) => (
          <div key={index}>
            <label>First Name:</label>
            <input
              style={{margin: "5px"}}
              type="text"
              value={player.firstName}
              onChange={(e) =>
                handlePlayerChange(index, 'firstName', e.target.value)
              }
              required
            />
            <label>Last Name:</label>
            <input
              style={{margin: "5px"}}
              type="text"
              value={player.lastName}
              onChange={(e) =>
                handlePlayerChange(index, 'lastName', e.target.value)
              }
              required
            />
          </div>
        ))}
        <button type="button" onClick={handleAddPlayer}  style={{backgroundColor: "#808080", borderRadius: "5px", margin: "5px", alignSelf: "left"}}>
          Add Player
        </button>
        <button type="submit"  style={{backgroundColor: "#808080", borderRadius: "5px", margin: "5px"}}>Submit</button>
      </form>
    </div>
  );
};

export default AddTeam;
