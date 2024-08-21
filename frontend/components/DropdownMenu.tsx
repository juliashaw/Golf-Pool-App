import { useState, useEffect } from "react";
import Select from "react-select";
import { useTable, Column } from "react-table";
import "../App.css";
import React from "react";

function TournamentSelector() {
  type Tournament = {
    id: string;
    name: string;
    doublePoints: boolean;
    leaderboard: LeaderboardEntry[] | null; 
  };

  type LeaderboardEntry = {
    position: number;
    player: string;
    total: string;
    points: number;
  };

  const [tournaments, setTournaments] = useState<
    { value: string; label: string }[]
  >([]);
  const [selectedTournament, setSelectedTournament] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [message, setMessage] = useState<string | null>(null); // New state to handle the message
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchTournaments = async () => {
      try {
        const response = await fetch("http://localhost:3000/tournaments");
        if (!response.ok) {
          throw new Error("HTTP error " + response.status);
        }
        const tournaments: Tournament[] = await response.json();

        const tournamentOptions = tournaments.map((tournament: Tournament) => ({
          value: tournament.id,
          label: tournament.name,
        }));

        setTournaments(tournamentOptions);

        // Set the first tournament as the default selected tournament if available
        if (tournamentOptions.length > 0) {
          setSelectedTournament(tournamentOptions[0]);
        }
      } catch (error) {
        console.error("Error fetching tournaments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      const fetchLeaderboard = async () => {
        setLoading(true);
        try {
          const response = await fetch(
            `/tournaments/${selectedTournament.value}`
          );
          if (!response.ok) {
            throw new Error("HTTP error " + response.status);
          }
          const data = await response.json();

          if (data.leaderboard) {
            setLeaderboard(data.leaderboard);
            setMessage(null); // Clear any previous message
          } else if (data.message) {
            setLeaderboard([]);
            setMessage(data.message); // Set the message if no leaderboard is available
          }
        } catch (error) {
          console.error("Error fetching tournament data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchLeaderboard();
    }
  }, [selectedTournament]);

  const data = React.useMemo(() => leaderboard ?? [], [leaderboard]);

  const columns: Column<LeaderboardEntry>[] = React.useMemo(
    () => [
      {
        Header: "Position",
        accessor: "position",
      },
      {
        Header: "Player",
        accessor: "player",
      },
      {
        Header: "Points",
        accessor: "points",
      },
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data });

  return (
    <main>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <Select
            className="dropdownMenu"
            options={tournaments}
            value={selectedTournament}
            onChange={setSelectedTournament}
            placeholder="Select a tournament..."
            isSearchable={true}
          />

          {selectedTournament && (
            <div className="tournament-data">
              {message ? (
                <p style={{ marginTop: "10px" }}>{message}</p> // Display the message if available
              ) : (
                <div className="table-container">
                  <table {...getTableProps()} className="centered-table">
                    <thead>
                      {headerGroups.map((headerGroup, index) => {
                        const headerGroupProps =
                          headerGroup.getHeaderGroupProps();
                        return (
                          <tr {...headerGroupProps} key={index}>
                            {headerGroup.headers.map((column, colIndex) => {
                              const columnProps = column.getHeaderProps();
                              return (
                                <th
                                  {...columnProps}
                                  key={colIndex}
                                  className="cell"
                                >
                                  {column.render("Header")}
                                </th>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </thead>
                    <tbody {...getTableBodyProps()}>
                      {rows.map((row, rowIndex) => {
                        prepareRow(row);
                        const rowProps = row.getRowProps();
                        return (
                          <tr {...rowProps} key={rowIndex}>
                            {row.cells.map((cell, cellIndex) => {
                              const cellProps = cell.getCellProps();
                              return (
                                <td
                                  {...cellProps}
                                  key={cellIndex}
                                  className="cell"
                                >
                                  {cell.render("Cell")}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default TournamentSelector;
