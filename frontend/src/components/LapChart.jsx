import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";
import { Timer } from "lucide-react";

const Tip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="tip">
      <div className="tip__lap">Lap {d.lap}</div>
      <div className="tip__row">
        <span>Lap Time</span>
        <b>{d.time}s</b>
      </div>
      <div className="tip__rule" />
      <div className="tip__row">
        <span>S1</span>
        <b>{d.sector1}s</b>
      </div>
      <div className="tip__row">
        <span>S2</span>
        <b>{d.sector2}s</b>
      </div>
      <div className="tip__row">
        <span>S3</span>
        <b>{d.sector3}s</b>
      </div>
      <div className="tip__rule" />
      <div className="tip__row">
        <span>Tyre</span>
        <b>
          {d.compound} · L{d.tireAge}
        </b>
      </div>
      {d.event && <div className="tip__evt">▲ {d.event}</div>}
    </div>
  );
};

const Dot = ({ cx, cy, payload }) => {
  if (payload.event) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={5} fill="var(--sig-crit)" />
        <circle
          cx={cx}
          cy={cy}
          r={9}
          fill="none"
          stroke="var(--sig-crit)"
          strokeWidth={1.4}
        >
          <animate
            attributeName="r"
            from="6"
            to="18"
            dur="1.6s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            from="0.7"
            to="0"
            dur="1.6s"
            repeatCount="indefinite"
          />
        </circle>
      </g>
    );
  }
  return (
    <circle cx={cx} cy={cy} r={2.5} fill="var(--ash)" opacity={0.85} />
  );
};

export default function LapChart({ lapData, radioEventLap }) {
  const data = lapData?.length ? lapData : [];
  const lo = data.length
    ? Math.floor(Math.min(...data.map((d) => d.time)) - 0.8)
    : 82;
  const hi = data.length
    ? Math.ceil(Math.max(...data.map((d) => d.time)) + 0.8)
    : 90;

  return (
    <div className="hud lap" style={{ "--accent": "var(--sig-tired)" }}>
      <div className="hud-head">
        <span className="hud-head__bar" />
        <span className="hud-head__txt">Lap Performance</span>
        <span className="hud-head__meta">
          {data.length ? `${data.length} LAPS · DELTA TRACE` : "AWAITING FEED"}
        </span>
      </div>

      <div className="lap__body">
        {data.length ? (
          <>
            <ResponsiveContainer width="100%" height={252}>
              <AreaChart
                data={data}
                margin={{ top: 14, right: 22, left: 0, bottom: 4 }}
              >
                <defs>
                  <linearGradient id="paceFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--ash)"
                      stopOpacity={0.28}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--ash)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="paceLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--sig-calm)" />
                    <stop offset="48%" stopColor="var(--ash)" />
                    <stop offset="62%" stopColor="var(--red)" />
                    <stop offset="82%" stopColor="var(--sig-crit)" />
                    <stop offset="100%" stopColor="var(--sig-calm)" />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="2 6"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />

                <XAxis
                  dataKey="lap"
                  stroke="#4d5567"
                  fontSize={10}
                  fontFamily="JetBrains Mono, monospace"
                  tickLine={false}
                  axisLine={{ stroke: "rgba(255,255,255,0.09)" }}
                />
                <YAxis
                  domain={[lo, hi]}
                  stroke="#4d5567"
                  fontSize={10}
                  fontFamily="JetBrains Mono, monospace"
                  tickLine={false}
                  axisLine={{ stroke: "rgba(255,255,255,0.09)" }}
                  width={44}
                  tickFormatter={(v) => `${v}s`}
                />
                <Tooltip
                  content={<Tip />}
                  cursor={{ stroke: "rgba(255,255,255,0.16)", strokeWidth: 1 }}
                />

                {radioEventLap && (
                  <ReferenceLine
                    x={radioEventLap}
                    stroke="var(--sig-crit)"
                    strokeDasharray="3 4"
                    strokeWidth={1.2}
                    label={{
                      value: "RADIO",
                      position: "top",
                      fill: "var(--sig-crit)",
                      fontSize: 9,
                      fontFamily: "Chakra Petch, sans-serif",
                      letterSpacing: 2,
                    }}
                  />
                )}

                <Area
                  type="monotone"
                  dataKey="time"
                  stroke="url(#paceLine)"
                  strokeWidth={2.2}
                  fill="url(#paceFill)"
                  dot={<Dot />}
                  activeDot={{
                    r: 4.5,
                    fill: "#fff",
                    stroke: "var(--ash)",
                    strokeWidth: 2,
                  }}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>

            <div className="lap__key">
              <span className="lap__key-item">
                <i
                  className="lap__key-swatch"
                  style={{ background: "var(--ash)" }}
                />
                Pace trace
              </span>
              <span className="lap__key-item">
                <i
                  className="lap__key-swatch"
                  style={{ background: "var(--sig-crit)" }}
                />
                Radio event
              </span>
              <span className="lap__key-item">
                <i
                  className="lap__key-swatch"
                  style={{ background: "var(--red)" }}
                />
                Stress window
              </span>
            </div>
          </>
        ) : (
          <div className="lap__idle">
            <Timer size={24} strokeWidth={1.3} />
            <p>Telemetry feed offline</p>
          </div>
        )}
      </div>
    </div>
  );
}
