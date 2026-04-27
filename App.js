import { useEffect } from "react";

/**
 * Static HTML project redirect
 */
function App() {
  useEffect(() => {
    window.location.href = "/index.html";
  }, []);

  return (
    <div style={{
      fontFamily: "system-ui, sans-serif",
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#F7F3EA",
      color: "#0D2818"
    }}>
      <h2>Loading FitTrack...</h2>
    </div>
  );
}

export default App;