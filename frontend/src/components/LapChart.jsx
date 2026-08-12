import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceDot
} from 'recharts';
import { Timer } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip__header">Lap {d.lap}</div>
      <div className="chart-tooltip__row">
        <span>Lap Time</span>
        <span className="chart-tooltip__val">{d.time}s</span>
      </div>
      <div className="chart-tooltip__row">
        <span>S1</span><span className="chart-tooltip__val">{d.sector1}s</span>
      </div>
      <div className="chart-tooltip__row">
        <span>S2</span><span className="chart-tooltip__val">{d.sector2}s</span>
      </div>
      <div className="chart-tooltip__row">
        <span>S3</span><span className="chart-tooltip__val">{d.sector3}s</span>
      </div>
      <div className="chart-tooltip__divider" />
      <div className="chart-tooltip__row">
        <span>Tire</span>
        <span className="chart-tooltip__val">{d.compound} (Lap {d.tireAge})</span>
      </div>
      {d.event && (
        <div className="chart-tooltip__event">⚡ {d.event}</div>
      )}
    </div>
  );
};

const CustomDot = (props) => {
  const { cx, cy, payload } = props;
  if (payload.event) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={6} fill="var(--accent-red)" opacity={0.9} />
        <circle cx={cx} cy={cy} r={10} fill="none" stroke="var(--accent-red)" strokeWidth={1.5} opacity={0.5}>
          <animate attributeName="r" from="6" to="16" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite" />
        </circle>
      </g>
    );
  }
  return <circle cx={cx} cy={cy} r={3} fill="var(--accent-green)" opacity={0.8} />;
};

export default function LapChart({ lapData, radioEventLap }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (lapData && lapData.length > 0) {
      setData(lapData);
    }
  }, [lapData]);

  const minTime = lapData ? Math.floor(Math.min(...lapData.map(d => d.time)) - 1) : 82;
  const maxTime = lapData ? Math.ceil(Math.max(...lapData.map(d => d.time)) + 1) : 90;

  return (
    <div className="lap-chart glass-panel">
      <div className="section-label">📊 Lap Performance</div>

      {data.length > 0 ? (
        <div className="chart-container fade-in">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--accent-green)" />
                  <stop offset="45%" stopColor="var(--accent-green)" />
                  <stop offset="55%" stopColor="var(--accent-red)" />
                  <stop offset="85%" stopColor="var(--accent-red)" />
                  <stop offset="90%" stopColor="var(--accent-green)" />
                  <stop offset="100%" stopColor="var(--accent-green)" />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
                vertical={false}
              />
              <XAxis
                dataKey="lap"
                stroke="var(--text-muted)"
                fontSize={11}
                fontFamily="var(--font-mono)"
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                label={{ value: 'Lap', position: 'insideBottom', offset: -2, fill: 'var(--text-muted)', fontSize: 10 }}
              />
              <YAxis
                domain={[minTime, maxTime]}
                stroke="var(--text-muted)"
                fontSize={11}
                fontFamily="var(--font-mono)"
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                label={{ value: 'Time (s)', angle: -90, position: 'insideLeft', offset: 10, fill: 'var(--text-muted)', fontSize: 10 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />

              {radioEventLap && (
                <ReferenceLine
                  x={radioEventLap}
                  stroke="var(--accent-red)"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                  opacity={0.6}
                  label={{
                    value: '📡 RADIO',
                    position: 'top',
                    fill: 'var(--accent-red)',
                    fontSize: 10,
                    fontFamily: 'var(--font-display)',
                  }}
                />
              )}

              <Line
                type="monotone"
                dataKey="time"
                stroke="url(#lineGradient)"
                strokeWidth={2.5}
                dot={<CustomDot />}
                activeDot={{ r: 5, fill: 'var(--text-primary)', stroke: 'var(--accent-green)', strokeWidth: 2 }}
                animationDuration={300}
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="chart-legend">
            <div className="chart-legend__item">
              <span className="chart-legend__dot" style={{ background: 'var(--accent-green)' }} />
              Normal pace
            </div>
            <div className="chart-legend__item">
              <span className="chart-legend__dot" style={{ background: 'var(--accent-red)' }} />
              Stress impact
            </div>
          </div>
        </div>
      ) : (
        <div className="chart-empty">
          <Timer size={24} className="chart-empty__icon" />
          <p>Loading lap telemetry…</p>
        </div>
      )}
    </div>
  );
}
