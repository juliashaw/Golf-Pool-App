import React from "react";
import { useEffect, useState } from "react";
import { useTable, Column } from "react-table";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import "../App.css";
import TournamentSelector from "../components/TournamentSelector";

function Standings() {
  type StatsData = {
    rank: number;
    name: string;
    totalPoints: number;
  };

  const [statsData, setData] = useState<StatsData[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3000/standingsToDate");
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

  const StandingsTable = () => {
    const data = React.useMemo(() => statsData ?? [], [statsData]);

    const columns: Column<StatsData>[] = React.useMemo(
      () => [
        {
          Header: "Position",
          accessor: "rank",
        },
        {
          Header: "Player",
          accessor: "name",
        },
        {
          Header: "Total Points",
          accessor: "totalPoints",
        },
      ],
      []
    );

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
      useTable({ columns, data });

    if (!statsData) {
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
    <main className="eventsPage">
      <h1>Standings</h1>
      <Tabs variant="enclosed" size="sm">
        <TabList className="tabTitle">
          <Tab>Individual Tournaments</Tab>
          <Tab>Year-To-Date</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <TournamentSelector />
          </TabPanel>
          <TabPanel>
            <StandingsTable />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </main>
  );
}

export default Standings;
