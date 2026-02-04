export function downloadFromResponse(response, fallbackFilename) {
  const disposition = response?.headers?.["content-disposition"] || "";
  const match = disposition.match(/filename="([^"]+)"/i);
  const filename = match?.[1] || fallbackFilename;
  const blob = response?.data;
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
