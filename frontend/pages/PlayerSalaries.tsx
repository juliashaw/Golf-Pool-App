import React from "react";
import { useEffect, useState } from "react";
import { useTable, Column } from "react-table";
import "../App.css";

type SalaryData = {
  position: Number;
  name: String;
  events: Number;
  salary: String;
  wins: Number;
}

function PlayerSalaries() {
  const [salariesData, setData] = useState<SalaryData[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/player-salaries`);
        if (!response.ok) {
          throw new Error("http error" + response.status);
        }
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.log("Error occurred", error);
      }
    };

    fetchData();
  }, []);

  const PlayerSalariesTable = () => {
    const data = React.useMemo(() => salariesData ?? [], [salariesData]);

    const columns: Column<SalaryData>[] = React.useMemo(
      () => [
        {
          Header: "Position",
          accessor: "position",
        },
        {
          Header: "Player",
          accessor: "name",
        },
        {
          Header: "2023 Events Played",
          accessor: "events",
        },
        {
          Header: "2023 PGA Tour Wins",
          accessor: "wins",
        },
        {
          Header: "Salary",
          accessor: "salary",
        },
      ],
      []
    );

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
      useTable({ columns, data });

    if (!salariesData) {
      return <div>Loading...</div>;
    }

    return (
      <div className="table-container">
        <table {...getTableProps()} className="centered-table">
          <thead>
            {headerGroups.map((headerGroup, index) => {
              const headerGroupProps = headerGroup.getHeaderGroupProps();
              return (
                <tr {...headerGroupProps} key={index}>
                  {headerGroup.headers.map((column, colIndex) => {
                    const columnProps = column.getHeaderProps();
                    return (
                      <th {...columnProps} key={colIndex} className="cell">
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
                      <td {...cellProps} key={cellIndex} className="cell">
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
    );
  };

  return (
    <main>
      <h1>Player Salaries in 2023</h1>
      <PlayerSalariesTable />
    </main>
  );
}
export default PlayerSalaries;
