function Rules() {
  return (
    <main
      style={{ display: "flex", justifyContent: "center", padding: "20px"}}
    >
      <div
        style={{ maxWidth: "500px", width: "100%"}}
      >
        <section>
          <h1 style={{ textAlign: "center" }}>Fantasy Golf Pool Rules</h1>

          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ textAlign: "center" }}>Entry Process</h2>
            <ul style={{ textAlign: "left" }}>
              <li>
                Teams will be allocated on a first-come, first-served basis
              </li>
              <li>
                Team entries will be accepted from February 1st (12:00 AM) to
                March 7th (11:59 PM)
              </li>
              <li>
                Teams may include any number of players, provided the total
                salary remains under the cap of $35,000,000
              </li>
              <li>
                Only PGA Tour players who ranked in the Top 60 on last year's
                money list are eligible for team selection.
              </li>
            </ul>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ textAlign: "center" }}>Scoring</h2>
            <p>
              Teams will earn points based on 'Top 10' finishes in PGA Tour
              events starting with the Arnold Palmer Invitational and the Puerto
              Rico Open, and ending with the Tour Championship.
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                marginBottom: '20px'
              }}
            >
              <p style={{ margin: 0 }}>1st Place: 15 points</p>
              <p style={{ margin: 0 }}>2nd Place: 12 points</p>
              <p style={{ margin: 0 }}>3rd Place: 10 points</p>
              <p style={{ margin: 0 }}>4th Place: 7 points</p>
              <p style={{ margin: 0 }}>5th Place: 6 points</p>
              <p style={{ margin: 0 }}>6th Place: 5 points</p>
              <p style={{ margin: 0 }}>7th Place: 4 points</p>
              <p style={{ margin: 0 }}>8th Place: 3 points</p>
              <p style={{ margin: 0 }}>9th Place: 2 points</p>
              <p style={{ margin: 0 }}>10th Place: 1 point</p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <p style={{ margin: 0, marginBottom: '12px' }}>The following tournaments will award double points:</p>
              <p style={{ margin: 0 }}>The Players Championship (March)</p>
              <p style={{ margin: 0 }}>The Masters (April)</p>
              <p style={{ margin: 0 }}>The PGA Championship (May)</p>
              <p style={{ margin: 0 }}>The U.S. Open (June)</p>
              <p style={{ margin: 0 }}>The Open Championship (July)</p>
              <p style={{ margin: 0 }}>The Tour Championship (August)</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Rules;
