import { useCallback, useEffect, useRef, useState } from "react";
import { makeCtx, createEngine, crank, blip } from "../lib/audio";

/* Boot log — mirrors what the backend actually does on startup */
const BOOT_LOG = [
  "MOUNTING PIT WALL CONSOLE",
  "ASR · DISTIL-WHISPER / SMALL.EN",
  "SER · HUBERT-LARGE-SUPERB-ER",
  "RMS ACOUSTIC TARGETING — ARMED",
  "TELEMETRY LINK — NOMINAL",
];

/* Real F1 start procedure: five lights illuminate one by one,
   then ALL GO OUT — and that is the green flag. */
export default function BootSequence({ onDone }) {
  const [armed, setArmed] = useState(false); // ignition pressed
  const [lit, setLit] = useState(0);
  const [out, setOut] = useState(false);
  const [logN, setLogN] = useState(0);

  const timers = useRef([]);
  const ctxRef = useRef(null);
  const engineRef = useRef(null);

  const cleanup = useCallback(() => {
    timers.current.forEach(clearTimeout);
    engineRef.current?.stop(0.25);
    const ctx = ctxRef.current;
    if (ctx) setTimeout(() => ctx.close().catch(() => {}), 400);
  }, []);

  useEffect(() => cleanup, [cleanup]);

  /* Browsers block audio until a gesture, so the sequence starts on the
     ignition press — which is on-theme anyway. `silent` skips the sound. */
  const ignite = (silent) => {
    if (armed) return;
    setArmed(true);

    let ctx = null;
    if (!silent) {
      ctx = makeCtx();
      ctxRef.current = ctx;
      if (ctx?.state === "suspended") ctx.resume().catch(() => {});
    }

    const t = (fn, ms) => timers.current.push(setTimeout(fn, ms));

    if (ctx) {
      crank(ctx, 0.7); // starter motor
      t(() => {
        engineRef.current = createEngine(ctx, { volume: 0.13 });
      }, 620);
    }

    // five lights, 380ms apart, each with a blip
    for (let i = 1; i <= 5; i++) {
      t(
        () => {
          setLit(i);
          if (ctx) blip(ctx, 620 + i * 40, 0.08, 0.07);
        },
        900 + i * 380,
      );
    }

    BOOT_LOG.forEach((_, i) => t(() => setLogN(i + 1), 1200 + i * 300));

    // lights out === launch
    t(() => {
      setOut(true);
      if (ctx) {
        blip(ctx, 1180, 0.22, 0.11);
        engineRef.current?.launch(ctx.currentTime, 1.0);
      }
    }, 3100);

    t(() => {
      cleanup();
      onDone();
    }, 4000);
  };

  const skip = () => {
    cleanup();
    onDone();
  };

  return (
    <div className={`boot${out ? " boot--go" : ""}`}>
      <video
        className="boot__vid"
        src="/track-night.mp4"
        poster="/track-night.jpg"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="boot__scrim" />

      <div className="boot__inner">
        {!armed ? (
          <div className="boot__ignite">
            <h1 className="boot__title">The Silent Co-Driver</h1>
            <p className="boot__sub">
              AI Driver Stress Analysis · Grand Prix Hackathon 2026
            </p>
            <button className="boot__start" onClick={() => ignite(false)}>
              <span className="boot__start-ring" />
              Press to Start
            </button>
            <button className="boot__quiet" onClick={() => ignite(true)}>
              Start without sound
            </button>
          </div>
        ) : (
          <>
            <div
              className="boot__lights"
              role="img"
              aria-label="Formula 1 start lights"
            >
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className={`boot__bulb${!out && i < lit ? " boot__bulb--on" : ""}`}
                />
              ))}
            </div>

            <h1 className="boot__title">The Silent Co-Driver</h1>
            <p className="boot__sub">
              AI Driver Stress Analysis · Grand Prix Hackathon 2026
            </p>

            <ul className="boot__log">
              {BOOT_LOG.slice(0, logN).map((line) => (
                <li key={line}>
                  <span>▸</span> {line}
                </li>
              ))}
            </ul>

            <div className={`boot__go${out ? " boot__go--show" : ""}`}>
              Lights Out
            </div>
          </>
        )}
      </div>

      <button className="boot__skip" onClick={skip}>
        Skip ▸
      </button>
    </div>
  );
}
