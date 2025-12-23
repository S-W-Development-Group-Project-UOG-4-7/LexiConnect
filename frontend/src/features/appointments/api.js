export async function deleteAppointment(appointmentId) {
  const baseUrl = import.meta.env.VITE_API_URL;

  if (!baseUrl) {
    throw new Error("VITE_API_URL is not set");
  }

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
