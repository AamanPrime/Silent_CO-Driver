/* Motorsport audio, synthesised in-browser with Web Audio.
   Nothing is sampled or downloaded, so no licensing attaches to any of it. */

export function makeCtx() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  return Ctx ? new Ctx() : null;
}

function noiseBuffer(ctx, seconds = 2) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

/* Sustained engine drone: detuned saw stack through a swept low-pass + tyre roar. */
export function createEngine(ctx, { volume = 0.16, rev = 0.26 } = {}) {
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 620;
  lp.Q.value = 6;
  lp.connect(master);

  const oscs = [
    { f: 58, type: "sawtooth", g: 0.34 },
    { f: 116, type: "sawtooth", g: 0.22 },
    { f: 174, type: "square", g: 0.1 },
  ].map(({ f, type, g }) => {
    const o = ctx.createOscillator();
    const og = ctx.createGain();
    o.type = type;
    o.frequency.value = f;
    o.detune.value = (Math.random() - 0.5) * 22;
    og.gain.value = g;
    o.connect(og).connect(lp);
    o.start();
    return { o, base: f };
  });

  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer(ctx);
  noise.loop = true;
  const nf = ctx.createBiquadFilter();
  nf.type = "bandpass";
  nf.frequency.value = 1100;
  nf.Q.value = 0.7;
  const ng = ctx.createGain();
  ng.gain.value = 0.045;
  noise.connect(nf).connect(ng).connect(master);
  noise.start();

  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = rev;
  lfoGain.gain.value = 320;
  lfo.connect(lfoGain).connect(lp.frequency);
  lfo.start();

  const revLfo = ctx.createOscillator();
  revLfo.frequency.value = rev;
  oscs.forEach(({ o, base }) => {
    const g = ctx.createGain();
    g.gain.value = base * 0.16;
    revLfo.connect(g).connect(o.frequency);
  });
  revLfo.start();

  master.gain.setValueAtTime(0, ctx.currentTime);
  master.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.45);

  const nodes = [...oscs.map((x) => x.o), lfo, revLfo, noise];

  return {
    master,
    /** ramp the whole engine up in pitch — the lights-out launch */
    launch(at = ctx.currentTime, dur = 1.1) {
      oscs.forEach(({ o, base }) => {
        o.frequency.cancelScheduledValues(at);
        o.frequency.setValueAtTime(base, at);
        o.frequency.exponentialRampToValueAtTime(base * 2.6, at + dur);
      });
      lp.frequency.cancelScheduledValues(at);
      lp.frequency.setValueAtTime(620, at);
      lp.frequency.exponentialRampToValueAtTime(3200, at + dur);
    },
    stop(fade = 0.3) {
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(master.gain.value, t);
      master.gain.linearRampToValueAtTime(0, t + fade);
      setTimeout(
        () =>
          nodes.forEach((n) => {
            try {
              n.stop();
            } catch {
              /* already stopped */
            }
          }),
        fade * 1000 + 60,
      );
    },
  };
}

/* Starter motor: chugging filtered noise before the engine catches. */
export function crank(ctx, dur = 0.75) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, 1);
  src.loop = true;

  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 260;
  bp.Q.value = 3;

  const g = ctx.createGain();
  const chug = ctx.createOscillator();
  chug.type = "square";
  chug.frequency.value = 11;
  const chugG = ctx.createGain();
  chugG.gain.value = 0.09;
  chug.connect(chugG).connect(g.gain);

  src.connect(bp).connect(g).connect(ctx.destination);
  const t = ctx.currentTime;
  g.gain.setValueAtTime(0.07, t);
  g.gain.setValueAtTime(0.07, t + dur - 0.12);
  g.gain.linearRampToValueAtTime(0, t + dur);
  src.start(t);
  chug.start(t);
  src.stop(t + dur + 0.05);
  chug.stop(t + dur + 0.05);
}

/* Short blip — one per start light. */
export function blip(ctx, freq = 880, dur = 0.09, vol = 0.09) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "sine";
  o.frequency.value = freq;
  const t = ctx.currentTime;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}
