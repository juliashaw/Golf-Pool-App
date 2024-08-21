import React, { useState } from "react";
import AddPlayer from '../components/AddPlayer'
import AddTeam from '../components/AddTeam'

const PasswordProtected: React.FC = () => {
  const [inputPassword, setInputPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);

  const correctPassword =
    import.meta.env.VITE_APP_PASSWORD || "defaultPassword";

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputPassword(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inputPassword === correctPassword) {
      setIsAuthorized(true);
    } else {
      alert("Incorrect password. Please try again.");
    }
  };

  if (isAuthorized) {
    return (
      <main>
        <h1>Protected Content</h1>
        <p>This is a password-protected page.</p>
        <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-evenly", margin: "10px", flexWrap: "wrap"}}>
        <AddPlayer />
        <AddTeam />
        </div>
      </main>
    );
  }

  return (
    <main>
      <h1>Enter Password</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={inputPassword}
          onChange={handlePasswordChange}
          placeholder="Enter password"
        />
        <button type="submit">Submit</button>
      </form>
    </main>
  );
};

export default PasswordProtected;
