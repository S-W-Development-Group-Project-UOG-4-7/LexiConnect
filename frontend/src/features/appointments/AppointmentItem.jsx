import { useState } from "react";
import { deleteAppointment } from "./api";

function formatDateTime(value) {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString();
}

export default function AppointmentItem({ appointment, onDeleted }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!appointment?.id) {
      alert("This appointment is missing an id.");
      return;
    }

    const ok = window.confirm("Delete this appointment? This action cannot be undone.");
    if (!ok) return;

    try {
      setIsDeleting(true);
      await deleteAppointment(appointment.id);
      onDeleted?.(appointment.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete appointment");
    } finally {
      setIsDeleting(false);
    }
  };

  const clientName = appointment?.clientName ?? appointment?.client?.name ?? "Client";
  const dateTime = appointment?.dateTime ?? appointment?.datetime ?? appointment?.date;

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        background: "#fff",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 600, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis" }}>
          {clientName}
        </div>
        <div style={{ color: "#4b5563", fontSize: 14 }}>{formatDateTime(dateTime)}</div>
      </div>

      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        style={{
          padding: "8px 12px",
          borderRadius: 6,
          border: "1px solid #ef4444",
          background: isDeleting ? "#fee2e2" : "#ef4444",
          color: isDeleting ? "#7f1d1d" : "#fff",
          cursor: isDeleting ? "not-allowed" : "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}
