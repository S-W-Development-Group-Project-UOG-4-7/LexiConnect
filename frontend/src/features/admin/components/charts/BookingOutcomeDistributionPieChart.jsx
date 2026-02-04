import { useEffect, useMemo, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { getBookingStatusDistribution } from "../../services/adminMetrics.service";

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = ["#22c55e", "#f87171", "#94a3b8", "#fbbf24", "#60a5fa"];

const normalizeStatusLabel = (status) => {
  const value = String(status || "UNKNOWN").toLowerCase();
  if (value === "confirmed") return "Confirmed";
  if (value === "rejected") return "Rejected";
  if (value === "cancelled") return "Cancelled";
  if (value === "pending") return "Pending";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export default function BookingOutcomeDistributionPieChart() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [windowDays, setWindowDays] = useState(30);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getBookingStatusDistribution(30);
        const labels = Array.isArray(res?.labels) ? res.labels : [];
        const values = Array.isArray(res?.values) ? res.values : [];
        const data = labels.map((label, idx) => ({
          status: label,
          count: values[idx] ?? 0,
        }));
        setSeries(data);
        setWindowDays(res?.days || 30);
      } catch (err) {
        const detail =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message;
        console.error("Booking outcome distribution failed:", detail);
        setError("Failed to load booking outcome distribution");
        setSeries([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const chartData = useMemo(() => {
    const labels = series.map((row) => normalizeStatusLabel(row.status));
    const values = series.map((row) => row.count || 0);
    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: COLORS,
          borderColor: "rgba(15, 23, 42, 0.6)",
          borderWidth: 1,
        },
      ],
    };
  }, [series]);

  const total = series.reduce((sum, row) => sum + (row.count || 0), 0);

  return (
    <div className="admin-chart-card">
      <div className="admin-chart-header">
        <div>
          <h3 className="admin-chart-title">
            Booking Outcomes (Last {windowDays} days)
            <span
              className="admin-tooltip"
              title="Distribution of booking statuses in the selected window."
            >
              i
            </span>
          </h3>
        </div>
      </div>

      {error && <div className="admin-chart-error">{error}</div>}

      {loading ? (
        <div className="admin-chart-loading">Loading chart...</div>
      ) : total === 0 ? (
        <div className="admin-chart-empty">No booking outcomes in this window.</div>
      ) : (
        <div className="admin-chart-canvas admin-chart-canvas--pie">
          <Pie data={chartData} />
        </div>
      )}
    </div>
  );
}
