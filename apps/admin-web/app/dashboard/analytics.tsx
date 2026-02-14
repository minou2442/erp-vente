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
  const avgTotal = points.reduce((sum, p) => sum + p.total, 0) / points.length;

  return (
    <section className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h2>Sales Trend</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>Daily revenue performance</p>
        </div>
        <div style={{ 
          background: 'rgba(59, 130, 246, 0.1)', 
          padding: '8px 12px', 
          borderRadius: '8px', 
          fontSize: '0.85rem',
          fontWeight: '600',
          color: 'var(--primary)'
        }}>
          Avg: ${avgTotal.toFixed(0)}
        </div>
      </div>
      <div className="chart">
        {points.map((point, index) => {
          const width = Math.max(4, Math.round((point.total / max) * 100));
          const isAboveAvg = point.total >= avgTotal;
          return (
            <div key={point.day} className="chart-row" style={{ '--chart-delay': `${index * 0.05}s` } as React.CSSProperties}>
              <span>{point.day.slice(5)}</span>
              <div className="chart-track">
                <div className="chart-fill" style={{ width: `${width}%`, opacity: isAboveAvg ? 1 : 0.7 }} />
              </div>
              <strong>${point.total.toFixed(0)}</strong>
            </div>
          );
        })}
      </div>
    </section>
  );
}
