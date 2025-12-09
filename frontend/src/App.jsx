import { Routes, Route, Link } from "react-router-dom";

function App() {
  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <h1>LexiConnect</h1>

      {/* Simple navigation for now */}
      <nav style={{ marginBottom: "1rem" }}>
        <Link to="/login" style={{ marginRight: "1rem" }}>Login</Link>
        <Link to="/register" style={{ marginRight: "1rem" }}>Register</Link>
        <Link to="/search" style={{ marginRight: "1rem" }}>Search</Link>
        <Link to="/booking" style={{ marginRight: "1rem" }}>Booking</Link>
        <Link to="/manage-bookings">My Bookings</Link>
      </nav>

      {/* Define routes */}
      <Routes>
        <Route path="/login" element={<div>Login Page (Thenu will build)</div>} />
        <Route path="/register" element={<div>Register Page (Thenu will build)</div>} />
        <Route path="/search" element={<div>Search Page (Chapa will build)</div>} />
        <Route path="/booking" element={<div>Booking Page (Thenu will build)</div>} />
        <Route path="/manage-bookings" element={<div>Manage Bookings Page (Thenu will build)</div>} />
        <Route
          path="*"
          element={<div>Welcome to LexiConnect – please choose a page above.</div>}
        />
      </Routes>
    </div>
  );
}

export default App;
