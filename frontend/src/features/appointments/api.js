export async function deleteAppointment(appointmentId) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

  const res = await fetch(`${baseUrl}/api/appointments/${appointmentId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (res.status !== 204) {
    let detail = "Failed to delete appointment";
    try {
      const body = await res.json();
      if (body?.detail) detail = body.detail;
    } catch (_) {}
    throw new Error(detail);
  }
}
