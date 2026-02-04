import { useEffect, useMemo, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { getKycStatusDistribution } from "../../services/adminMetrics.service";

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = ["#60a5fa", "#34d399", "#fbbf24", "#f87171"];

export default function SystemActivityDistributionPieChart() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [windowDays, setWindowDays] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getKycStatusDistribution();
        const labels = Array.isArray(res?.labels) ? res.labels : [];
        const values = Array.isArray(res?.values) ? res.values : [];
        const data = labels.map((label, idx) => ({
          label,
          count: values[idx] ?? 0,
        }));
        setSeries(data);
        setWindowDays(null);
      } catch (err) {
        const detail =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message;
        console.error("System activity distribution failed:", detail);
        setError("Failed to load system activity distribution");
        setSeries([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const chartData = useMemo(() => {
    const labels = series.map((row) => row.label);
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
            KYC Status Distribution
            <span
              className="admin-tooltip"
              title="Breakdown of current KYC verification statuses."
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
        <div className="admin-chart-empty">No activity in this window.</div>
      ) : (
        <div className="admin-chart-canvas admin-chart-canvas--pie">
          <Pie data={chartData} />
        </div>
      )}
    </div>
  );
}
