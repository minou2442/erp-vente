"use client";

interface AnalyticsPoint {
  day: string;
  total: number;
}

interface AnalyticsProps {
  points: AnalyticsPoint[];
}

export default function Analytics({ points }: AnalyticsProps) {
  const max = Math.max(...points.map((point) => point.total), 1);

  return (
    <section className="panel">
      <h2>Sales Trend</h2>
      <div className="chart">
        {points.map((point) => {
          const width = Math.max(4, Math.round((point.total / max) * 100));
          return (
            <div key={point.day} className="chart-row">
              <span>{point.day.slice(5)}</span>
              <div className="chart-track">
                <div className="chart-fill" style={{ width: `${width}%` }} />
              </div>
              <strong>{point.total.toFixed(0)}</strong>
            </div>
          );
        })}
      </div>
    </section>
  );
}
