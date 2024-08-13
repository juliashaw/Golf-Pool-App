import React, { useEffect, useState } from "react";

const teamCardColor = "#f2f2f2";

interface Player {
  name: string;
  points: number;
}

interface Team {
  teamName: string;
  players: Player[];
  totalPoints: number;
}

const Teams: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch("http://localhost:3000/teams");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        const transformedData: Team[] = data.map((team: any) => ({
          teamName: team.team_name,
          players: Object.keys(team.players).map((playerName) => ({
            name: playerName,
            points: team.players[playerName],
          })),
          totalPoints: team.total_points,
        }));

        setTeams(transformedData);
      } catch (err) {
        setError("Failed to fetch teams data");
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <main>
      <h1>Teams</h1>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "10px",
          margin: "10px",
        }}
      >
        {teams.map((team) => (
          <div
            key={team.teamName}
            style={{
              flex: "1 1 220px",
              maxWidth: "220px",
              minWidth: "180px",
              boxSizing: "border-box",
              backgroundColor: teamCardColor,
              overflow: "hidden",
              borderRadius: "10px",
            }}
          >
            <table
              cellPadding="4"
              style={{
                width: "100%",
                textAlign: "center",
                height: "100%",
                display: "table",
                tableLayout: "fixed",
                fontSize: "0.8em",
              }}
            >
              <thead>
                <tr
                  style={{ color: "black", height: "20px", fontWeight: "bold" }}
                >
                  <th
                    colSpan={2}
                    style={{
                      textAlign: "center",
                      fontSize: "1em",
                      padding: "6px",
                      backgroundColor: teamCardColor,
                    }}
                  >
                    {team.teamName}
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 8 }, (_, index) => (
                  <tr key={index}>
                    <td
                      style={{
                        height: "20px",
                        padding: "2px",
                        textAlign: "right",
                      }}
                    >
                      {team.players[index]?.name || ""}
                    </td>
                    <td style={{ height: "20px", padding: "2px" }}>
                      {team.players[index]?.points !== undefined
                        ? team.players[index].points
                        : ""}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td></td>
                  <td
                    style={{
                      fontWeight: "bold",
                      padding: "4px",
                      height: "20px",
                    }}
                  >
                    Total: {team.totalPoints}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Teams;
