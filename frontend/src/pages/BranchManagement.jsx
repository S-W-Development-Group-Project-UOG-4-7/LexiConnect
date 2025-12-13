import { useState, useEffect } from "react";
import axios from "axios";

function BranchManagement() {
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState({
    name: "",
    district: "",
    city: "",
    address: "",
  });

  const loadBranches = () => {
    axios.get("http://127.0.0.1:8000/branches?lawyer_id=1").then((res) => {
      setBranches(res.data);
    });
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post("http://127.0.0.1:8000/branches", form);
    loadBranches();
  };

  return (
    <div>
      <h2>Branch Management</h2>

      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Branch Name" onChange={handleChange} /><br />
        <input name="district" placeholder="District" onChange={handleChange} /><br />
        <input name="city" placeholder="City" onChange={handleChange} /><br />
        <input name="address" placeholder="Address" onChange={handleChange} /><br />

        <button type="submit">Add Branch</button>
      </form>

      <h3>Your Branches</h3>
      <ul>
        {branches.map(b => (
          <li key={b.id}>{b.name} — {b.city}</li>
        ))}
      </ul>
    </div>
  );
}

export default BranchManagement;
