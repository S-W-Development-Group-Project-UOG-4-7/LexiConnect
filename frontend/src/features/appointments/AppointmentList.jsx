import { useMemo, useState } from "react";
import AppointmentItem from "./AppointmentItem";

export default function AppointmentList() {
  const initialAppointments = useMemo(
    () => [
      {
        id: 101,
        clientName: "Aarav Sharma",
        dateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      },
      {
        id: 102,
        clientName: "Meera Iyer",
        dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 103,
        clientName: "Rohan Gupta",
        dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    []
  );

  const [appointments, setAppointments] = useState(initialAppointments);

  const handleDeleted = (appointmentId) => {
    setAppointments((prev) => prev.filter((a) => a.id !== appointmentId));
  };

  return (
    <section style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
      <header style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>Appointments</h2>
        <p style={{ margin: "6px 0 0", color: "#4b5563" }}>
          Manage your appointments. Use the delete action to remove an appointment.
        </p>
      </header>

      {appointments.length === 0 ? (
        <div
          style={{
            border: "1px dashed #d1d5db",
            borderRadius: 8,
            padding: 16,
            color: "#4b5563",
            background: "#fafafa",
          }}
        >
          No appointments.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {appointments.map((appointment) => (
            <AppointmentItem
              key={appointment.id}
              appointment={appointment}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}
    </section>
  );
}
