import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { drawField, drawScope } from "@/lib/theremin-draw";
import { ThereminEngine } from "@/lib/theremin-engine";
import {
  clamp,
  describeFreq,
  formatCents,
  hueForX,
  xToFreq,
  yToExpression,
  WAVE_LABEL,
  WAVES,
  type Waveform,
} from "@/lib/pitch";

const REVERB_KEY = "chroma-reverb";
const WAVE_KEY = "chroma-wave";

function isWave(value: string | null): value is Waveform {
  return value === "sine" || value === "triangle" || value === "sawtooth" || value === "square";
}

function WaveGlyph({ wave }: { wave: Waveform }) {
  const d =
    wave === "sine"
      ? "M1 12 C 4 12 4 3 8 3 S 12 21 16 21 S 20 12 23 12"
      : wave === "triangle"
        ? "M1 15 L7 4 L15 20 L21 8"
        : wave === "sawtooth"
          ? "M2 17 L11 4 V17 L20 4"
          : "M2 16 H8 V5 H16 V16 H22";
  return (
    <svg viewBox="0 0 24 24" className="wave-glyph" aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function ChromaTheremin() {
  const engineRef = useRef<ThereminEngine | null>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scopeRef = useRef<HTMLCanvasElement>(null);
  const noteRef = useRef<HTMLParagraphElement>(null);
  const centsRef = useRef<HTMLSpanElement>(null);
  const hzRef = useRef<HTMLSpanElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);
  const readoutRef = useRef<HTMLDivElement>(null);
  const waveBuf = useRef<Uint8Array | null>(null);
  const presentRef = useRef(false);
  const mutedRef = useRef(false);
  const visAmp = useRef(0);
  const touchedRef = useRef(false);

  const [wave, setWave] = useState<Waveform>("sine");
  const [reverb, setReverb] = useState(36);
  const [muted, setMuted] = useState(false);
  const [armed, setArmed] = useState(false);
  const [present, setPresent] = useState(false);
  const [touched, setTouched] = useState(false);
  const [pointerKind, setPointerKind] = useState<string>("mouse");
  const [audioError, setAudioError] = useState(false);

  function engine() {
    if (!engineRef.current) engineRef.current = new ThereminEngine();
    return engineRef.current;
  }

  function markPresent(next: boolean) {
    if (presentRef.current === next) return;
    presentRef.current = next;
    setPresent(next);
    if (next && !touchedRef.current) {
      touchedRef.current = true;
      setTouched(true);
    }
  }

  function arm() {
    const eng = engine();
    eng.unlock();
    if (eng.failed) setAudioError(true);
    setArmed(true);
  }

  function applyMute(next: boolean) {
    mutedRef.current = next;
    engine().setMuted(next);
    setMuted(next);
  }

  useEffect(() => {
    const savedWave = localStorage.getItem(WAVE_KEY);
    const savedReverb = localStorage.getItem(REVERB_KEY);
    if (isWave(savedWave)) {
      setWave(savedWave);
      engine().setWave(savedWave);
    }
    if (savedReverb !== null) {
      const next = Number(savedReverb);
      if (Number.isFinite(next)) {
        const clamped = Math.round(clamp(next, 0, 100));
        setReverb(clamped);
        engine().setReverb(clamped / 100);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(WAVE_KEY, wave);
    localStorage.setItem(REVERB_KEY, String(reverb));
  }, [wave, reverb]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const eng = engine();

      if (event.code === "Space") {
        if (event.repeat || tag === "BUTTON") return;
        event.preventDefault();
        applyMute(!mutedRef.current);
        return;
      }

      if (event.key >= "1" && event.key <= "4") {
        const next = WAVES[Number(event.key) - 1];
        eng.setWave(next);
        setWave(next);
        return;
      }

      if (event.key === "Escape") {
        eng.setHand(eng.nx, eng.ny, false);
        markPresent(false);
        return;
      }

      if (!event.key.startsWith("Arrow")) return;
      event.preventDefault();
      arm();
      const step = event.shiftKey ? 0.006 : 0.02;
      let nx = eng.nx;
      let ny = eng.ny;
      if (event.key === "ArrowLeft") nx -= step;
      if (event.key === "ArrowRight") nx += step;
      if (event.key === "ArrowUp") ny -= step;
      if (event.key === "ArrowDown") ny += step;
      eng.setHand(clamp(nx), clamp(ny), true);
      markPresent(true);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    let frame = 0;
    const loop = () => {
      frame = requestAnimationFrame(loop);
      const eng = engineRef.current;
      const field = canvasRef.current;
      const scope = scopeRef.current;
      const nx = eng?.nx ?? 0.5;
      const ny = eng?.ny ?? 0.62;
      const isPresent = eng?.present ?? false;
      const target = isPresent && !mutedRef.current ? yToExpression(ny) : 0;
      visAmp.current += (target - visAmp.current) * 0.2;
      const amp = visAmp.current;
      const hue = isPresent || touchedRef.current ? hueForX(nx) : hueForX(0.5);
      const freq = xToFreq(nx);
      const pitch = describeFreq(freq);

      const root = document.documentElement;
      const sat = 62 + amp * 32;
      const light = 56 + amp * 14;
      root.style.setProperty("--neon", `hsl(${hue} ${sat}% ${light}%)`);
      root.style.setProperty(
        "--line",
        `hsl(${hue} ${40 + amp * 45}% ${32 + amp * 18}% / ${0.34 + amp * 0.55})`,
      );
      root.style.setProperty("--glow", `hsl(${hue} 100% 62%)`);
      root.style.setProperty("--amp", amp.toFixed(4));
      root.style.setProperty("--nx", nx.toFixed(4));
      root.style.setProperty("--cents", (isPresent ? pitch.cents : 0).toFixed(1));

      if (noteRef.current) {
        noteRef.current.textContent = touchedRef.current ? pitch.name : "—";
      }
      if (centsRef.current) {
        centsRef.current.textContent = touchedRef.current ? `${formatCents(pitch.cents)}¢` : "±00¢";
      }
      if (hzRef.current) {
        hzRef.current.textContent = touchedRef.current ? `${freq.toFixed(1)} Hz` : "— Hz";
      }
      if (statusRef.current) {
        const status = mutedRef.current
          ? "MUTED"
          : isPresent && eng?.unlocked
            ? "LIVE"
            : isPresent
              ? "READY"
              : "SILENT";
        if (statusRef.current.textContent !== status) statusRef.current.textContent = status;
      }
      if (readoutRef.current) {
        const live = isPresent && !mutedRef.current && !!eng?.unlocked;
        readoutRef.current.dataset.live = live ? "true" : "false";
      }

      paintCanvas(field, (ctx, w, h) => {
        drawField(ctx, w, h, { nx, ny, amp, hue, present: isPresent });
      });

      if (!waveBuf.current || waveBuf.current.length !== 1024) {
        const next = new Uint8Array(1024);
        next.fill(128);
        waveBuf.current = next;
      }
      const heard = eng?.readTimeDomain(waveBuf.current) ?? false;
      paintCanvas(scope, (ctx, w, h) => {
        drawScope(ctx, w, h, heard ? waveBuf.current : null, hue, amp);
      });
    };

    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  function handFrom(event: React.PointerEvent<HTMLDivElement>, nextPresent: boolean) {
    const rect = event.currentTarget.getBoundingClientRect();
    const nx = clamp((event.clientX - rect.left) / rect.width);
    const ny = clamp((event.clientY - rect.top) / rect.height);
    engine().setHand(nx, ny, nextPresent);
    markPresent(nextPresent);
    if (event.pointerType !== pointerKind) setPointerKind(event.pointerType);
  }

  const hint = audioError
    ? "Audio isn't available in this browser"
    : !armed
      ? "Click or tap the frame"
      : pointerKind === "touch"
        ? "Drag inside the frame"
        : present
          ? ""
          : "Hover the frame";

  return (
    <main className="app" data-touched={touched ? "true" : "false"}>
      <p className="sr-only" id="chroma-help">
        Chroma is a theremin. Horizontal position sets pitch from C3 to C6. Vertical position sets
        volume, loud at the top and quiet at the bottom. Arrow keys move the tone. Keys 1 to 4
        change the waveform. Space mutes. Escape releases.
      </p>

      <header className="top">
        <div className="brand">
          <h1>CHROMA</h1>
          <p>THEREMIN</p>
        </div>
        <div className="readout" ref={readoutRef} data-live="false" aria-hidden="true">
          <p className="note" ref={noteRef}>
            —
          </p>
          <p className="meta">
            <span ref={centsRef}>±00¢</span>
            <span ref={hzRef}>— Hz</span>
            <span className="status" ref={statusRef}>
              SILENT
            </span>
          </p>
          <div className="cents-track">
            <i className="cents-zero" />
            <i className="cents-needle" />
          </div>
          <canvas className="scope" ref={scopeRef} />
        </div>
      </header>

      <div className="stage">
        <div className="y-axis">
          <span>LOUD</span>
          <div className="y-meter" aria-hidden="true">
            <i />
          </div>
          <span>QUIET</span>
        </div>

        <div
          className="field"
          ref={fieldRef}
          role="application"
          aria-roledescription="theremin"
          aria-label="Play field. Left to right is pitch. Top is loud, bottom is quiet."
          aria-describedby="chroma-help"
          tabIndex={0}
          onPointerDown={(event) => {
            arm();
            event.currentTarget.setPointerCapture(event.pointerId);
            handFrom(event, true);
          }}
          onPointerMove={(event) => {
            const dragging = event.currentTarget.hasPointerCapture(event.pointerId);
            if (event.pointerType === "mouse" && !dragging) {
              handFrom(event, true);
              return;
            }
            if (dragging) handFrom(event, true);
          }}
          onPointerUp={(event) => {
            if (event.pointerType === "mouse") {
              const rect = event.currentTarget.getBoundingClientRect();
              const inside =
                event.clientX >= rect.left &&
                event.clientX <= rect.right &&
                event.clientY >= rect.top &&
                event.clientY <= rect.bottom;
              handFrom(event, inside);
            } else {
              engine().setHand(engine().nx, engine().ny, false);
              markPresent(false);
            }
          }}
          onPointerLeave={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) return;
            engine().setHand(engine().nx, engine().ny, false);
            markPresent(false);
          }}
          onContextMenu={(event) => event.preventDefault()}
        >
          <canvas ref={canvasRef} />
          <div className="hint" data-hidden={present && armed ? "true" : "false"}>
            <p>{hint}</p>
            <p className="hint-sub">Left–right pitch · up–down volume</p>
          </div>
        </div>

        <div className="x-axis" aria-hidden="true">
          <span>LOW PITCH</span>
          <span className="x-track">
            <i className="x-pip" />
          </span>
          <span>HIGH PITCH</span>
        </div>
      </div>

      <footer className="dock">
        <div className="controls">
          <div className="waves" role="group" aria-label="Waveform">
            {WAVES.map((item, index) => (
              <button
                key={item}
                type="button"
                className="wave"
                aria-pressed={wave === item}
                aria-label={`${WAVE_LABEL[item]} wave`}
                onClick={() => {
                  arm();
                  engine().setWave(item);
                  setWave(item);
                }}
              >
                <WaveGlyph wave={item} />
                <span>{WAVE_LABEL[item]}</span>
                <span className="keycap">{index + 1}</span>
              </button>
            ))}
          </div>

          <label className="reverb">
            <span>REVERB</span>
            <input
              type="range"
              min={0}
              max={100}
              value={reverb}
              aria-valuetext={`${reverb} percent`}
              style={{ ["--reverb" as string]: `${reverb}%` }}
              onPointerDown={() => arm()}
              onChange={(event) => {
                const next = Number(event.target.value);
                setReverb(next);
                engine().setReverb(next / 100);
              }}
            />
            <span className="pct">{reverb}</span>
          </label>

          <button
            type="button"
            className="mute"
            aria-pressed={muted}
            onClick={() => {
              arm();
              applyMute(!muted);
            }}
          >
            <span className="ico-swap">
              <Volume2 className={muted ? "ico-layer ico-layer-off" : "ico-layer"} strokeWidth={1.5} />
              <VolumeX className={muted ? "ico-layer" : "ico-layer ico-layer-off"} strokeWidth={1.5} />
            </span>
            <span>{muted ? "Unmute" : "Mute"}</span>
          </button>
        </div>
        <p className="legend">Arrows nudge · 1–4 wave · space mute · esc release</p>
      </footer>

      <div className="sr-only" aria-live="polite">
        {muted ? "Muted" : armed ? "Sound on" : ""}
      </div>
    </main>
  );
}

function paintCanvas(
  canvas: HTMLCanvasElement | null,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const rect = canvas.getBoundingClientRect();
  const w = Math.max(1, rect.width);
  const h = Math.max(1, rect.height);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const bw = Math.round(w * dpr);
  const bh = Math.round(h * dpr);
  if (canvas.width !== bw || canvas.height !== bh) {
    canvas.width = bw;
    canvas.height = bh;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  draw(ctx, w, h);
}
