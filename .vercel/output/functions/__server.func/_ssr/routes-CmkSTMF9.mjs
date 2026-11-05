import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Volume2, t as VolumeX } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CmkSTMF9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var WAVES = [
	"sine",
	"triangle",
	"sawtooth",
	"square"
];
var WAVE_LABEL = {
	sine: "Sine",
	triangle: "Tri",
	sawtooth: "Saw",
	square: "Sqr"
};
var NAMES = [
	"C",
	"C♯",
	"D",
	"D♯",
	"E",
	"F",
	"F♯",
	"G",
	"G♯",
	"A",
	"A♯",
	"B"
];
function clamp(value, min = 0, max = 1) {
	return Math.min(max, Math.max(min, value));
}
function midiToFreq(midi) {
	return 440 * 2 ** ((midi - 69) / 12);
}
function xToFreq(x) {
	const t = clamp(x);
	const min = midiToFreq(48);
	return min * (midiToFreq(84) / min) ** t;
}
/** 1 at the top of the field, silence parked on the bottom edge. */
function yToExpression(y) {
	const height = clamp(1 - y);
	if (height <= .02) return 0;
	return ((height - .02) / .98) ** 1.15;
}
/** Low notes run warm red → high notes cool magenta. Ends don't meet. */
function hueForX(x) {
	return (clamp(x) * 292 + 8) % 360;
}
function describeFreq(freq) {
	const exact = 69 + 12 * Math.log2(freq / 440);
	const midi = Math.round(exact);
	const cents = Math.max(-50, Math.min(50, Math.round((exact - midi) * 100)));
	return {
		name: `${NAMES[(midi % 12 + 12) % 12]}${Math.floor(midi / 12) - 1}`,
		cents,
		freq
	};
}
function formatCents(cents) {
	return `${cents > 0 ? "+" : cents < 0 ? "−" : "±"}${Math.abs(cents).toString().padStart(2, "0")}`;
}
function isBlackKey(semitoneIndex) {
	const pc = ((48 + semitoneIndex) % 12 + 12) % 12;
	return pc === 1 || pc === 3 || pc === 6 || pc === 8 || pc === 10;
}
function noteLabel(semitoneIndex) {
	const midi = 48 + semitoneIndex;
	return `${NAMES[(midi % 12 + 12) % 12]}${Math.floor(midi / 12) - 1}`;
}
function hsl(hue, sat, light, alpha = 1) {
	return `hsl(${hue} ${sat}% ${light}% / ${alpha})`;
}
function drawField(ctx, w, h, state) {
	const { nx, ny, amp, hue, present } = state;
	ctx.clearRect(0, 0, w, h);
	const keyH = Math.max(36, Math.min(68, h * .15));
	const keyTop = h - keyH;
	const step = w / 36;
	ctx.lineWidth = 1;
	for (const p of [
		.25,
		.5,
		.75
	]) {
		const y = Math.round(keyTop * p) + .5;
		ctx.strokeStyle = hsl(hue, 50, 60, .06 + amp * .1);
		ctx.beginPath();
		ctx.moveTo(0, y);
		ctx.lineTo(w, y);
		ctx.stroke();
	}
	for (let i = 0; i <= 36; i++) {
		const x = Math.round(i / 36 * w) + .5;
		const pc = i % 12;
		const isC = pc === 0;
		const natural = pc === 0 || pc === 2 || pc === 4 || pc === 5 || pc === 7 || pc === 9 || pc === 11;
		ctx.strokeStyle = hsl(hueForX(i / 36), 70, 62, (isC ? .28 : natural ? .1 : .04) + amp * (isC ? .25 : .08));
		ctx.beginPath();
		ctx.moveTo(x, 0);
		ctx.lineTo(x, keyTop);
		ctx.stroke();
	}
	if (present && amp > .01) {
		const gx = nx * w;
		const gy = ny * h;
		const radius = 70 + amp * 240;
		const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, radius);
		glow.addColorStop(0, hsl(hue, 100, 62, .16 + amp * .28));
		glow.addColorStop(1, hsl(hue, 100, 50, 0));
		ctx.fillStyle = glow;
		ctx.fillRect(0, 0, w, h);
	}
	for (let i = 0; i < 36; i++) {
		const x = i * step;
		const keyHue = hueForX((i + .5) / 36);
		ctx.fillStyle = hsl(keyHue, 85, 58, .05 + amp * .05);
		ctx.fillRect(x + .5, keyTop, step - 1, keyH);
		ctx.strokeStyle = hsl(keyHue, 80, 64, .28 + amp * .25);
		ctx.strokeRect(x + 1, keyTop + .5, step - 2, keyH - 1);
	}
	for (let i = 0; i < 36; i++) {
		if (!isBlackKey(i)) continue;
		const x = i * step;
		const keyHue = hueForX((i + .5) / 36);
		const kh = keyH * .62;
		ctx.fillStyle = hsl(keyHue, 90, 46, .38 + amp * .28);
		ctx.fillRect(x + .5, keyTop, step - 1, kh);
	}
	if (present) {
		const i = Math.min(35, Math.max(0, Math.floor(nx * 36)));
		const x = i * step;
		ctx.fillStyle = hsl(hueForX((i + .5) / 36), 100, 62, .18 + amp * .55);
		ctx.fillRect(x + .5, keyTop, step - 1, keyH);
		const columnTop = Math.min(ny * h, keyTop);
		const columnH = keyTop - columnTop;
		if (columnH > 1) {
			const col = ctx.createLinearGradient(0, columnTop, 0, keyTop);
			col.addColorStop(0, hsl(hue, 100, 64, .05 + amp * .45));
			col.addColorStop(1, hsl(hue, 100, 55, .02 + amp * .16));
			ctx.fillStyle = col;
			ctx.fillRect(x + .5, columnTop, step - 1, columnH);
		}
	}
	ctx.beginPath();
	ctx.moveTo(0, keyTop + .5);
	ctx.lineTo(w, keyTop + .5);
	ctx.strokeStyle = hsl(hue, 70, 70, .35 + amp * .4);
	ctx.stroke();
	ctx.font = "500 10px 'IBM Plex Mono', ui-monospace, monospace";
	ctx.textAlign = "center";
	ctx.textBaseline = "bottom";
	const labelAll = step >= 20;
	for (let i = 0; i < 36; i++) {
		const isC = (48 + i) % 12 === 0;
		const natural = !isBlackKey(i);
		if (!isC && !(labelAll && natural)) continue;
		ctx.fillStyle = hsl(hueForX((i + .5) / 36), 70, 72, isC ? .9 : .55);
		const text = isC || step >= 28 ? noteLabel(i) : noteLabel(i).replace(/[0-9]/g, "");
		ctx.fillText(text, i * step + step / 2, keyTop - 4);
	}
	ctx.textAlign = "right";
	ctx.fillStyle = hsl(hueForX(1), 70, 72, .9);
	ctx.fillText("C6", w - 4, keyTop - 4);
	if (!present) return;
	const px = nx * w;
	const py = ny * h;
	ctx.strokeStyle = hsl(hue, 100, 70, .35 + amp * .55);
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(Math.round(px) + .5, 0);
	ctx.lineTo(Math.round(px) + .5, h);
	ctx.moveTo(0, Math.round(py) + .5);
	ctx.lineTo(w, Math.round(py) + .5);
	ctx.stroke();
	const r = 4 + amp * 11;
	ctx.beginPath();
	ctx.arc(px, py, r, 0, Math.PI * 2);
	ctx.fillStyle = hsl(hue, 100, 74, .95);
	ctx.fill();
	ctx.beginPath();
	ctx.arc(px, py, r + 6 + amp * 8, 0, Math.PI * 2);
	ctx.strokeStyle = hsl(hue, 100, 70, .35 + amp * .4);
	ctx.stroke();
}
function drawScope(ctx, w, h, data, hue, amp) {
	ctx.clearRect(0, 0, w, h);
	ctx.beginPath();
	const mid = h / 2;
	if (!data) {
		ctx.moveTo(0, mid);
		ctx.lineTo(w, mid);
	} else {
		const n = data.length;
		const stride = Math.max(1, Math.floor(n / w));
		for (let x = 0; x < w; x++) {
			const y = mid - (data[Math.min(n - 1, x * stride)] - 128) / 128 * (h * .42);
			if (x === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		}
	}
	ctx.strokeStyle = hsl(hue, 90, 64, .45 + amp * .55);
	ctx.lineWidth = 1.25;
	ctx.stroke();
}
var WAVE_GAIN = {
	sine: .84,
	triangle: .8,
	sawtooth: .5,
	square: .36
};
var DETUNE_MIX = {
	sine: 0,
	triangle: .2,
	sawtooth: .32,
	square: .24
};
function makeImpulse(ctx) {
	const seconds = 2.2;
	const decay = 3.15;
	const length = Math.floor(ctx.sampleRate * seconds);
	const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
	for (let channel = 0; channel < 2; channel++) {
		const data = buffer.getChannelData(channel);
		for (let i = 0; i < length; i++) {
			const env = (1 - i / length) ** decay;
			const early = i < ctx.sampleRate * .03 ? .65 : 1;
			data[i] = (Math.random() * 2 - 1) * env * early;
		}
	}
	return buffer;
}
var ThereminEngine = class {
	nx = .5;
	ny = .62;
	present = false;
	unlocked = false;
	muted = false;
	failed = false;
	wave = "sine";
	reverb = .36;
	ctx = null;
	graph = null;
	prevY = .62;
	onVis = () => {
		if (document.visibilityState === "visible" && this.ctx?.state === "suspended") this.ctx.resume();
	};
	unlock() {
		if (this.failed) return;
		try {
			if (!this.ctx) this.mount();
			if (this.ctx?.state === "suspended") this.ctx.resume();
			this.unlocked = true;
			this.apply();
		} catch {
			this.failed = true;
		}
	}
	setHand(nx, ny, present) {
		this.nx = clamp(nx);
		this.ny = clamp(ny);
		this.present = present;
		this.apply();
	}
	setWave(wave) {
		this.wave = wave;
		if (!this.graph) return;
		this.graph.osc1.type = wave;
		this.graph.osc2.type = wave;
		this.apply();
	}
	setReverb(mix) {
		this.reverb = clamp(mix);
		this.applyReverb();
	}
	setMuted(muted) {
		this.muted = muted;
		this.apply();
	}
	readTimeDomain(into) {
		if (!this.graph) return false;
		this.graph.analyser.getByteTimeDomainData(into);
		return true;
	}
	dispose() {
		document.removeEventListener("visibilitychange", this.onVis);
		if (!this.ctx) return;
		try {
			this.graph?.osc1.stop();
			this.graph?.osc2.stop();
			this.graph?.lfo.stop();
			this.ctx.close();
		} catch {}
		this.ctx = null;
		this.graph = null;
		this.unlocked = false;
	}
	mount() {
		const Ctx = window.AudioContext || window.webkitAudioContext;
		if (!Ctx) throw new Error("Web Audio is unavailable");
		const ctx = new Ctx({ latencyHint: "interactive" });
		const osc1 = ctx.createOscillator();
		const osc2 = ctx.createOscillator();
		const osc2Gain = ctx.createGain();
		const mix = ctx.createGain();
		const filter = ctx.createBiquadFilter();
		const vca = ctx.createGain();
		const hp = ctx.createBiquadFilter();
		const dry = ctx.createGain();
		const wet = ctx.createGain();
		const delay = ctx.createDelay(.1);
		const revFilter = ctx.createBiquadFilter();
		const convolver = ctx.createConvolver();
		const master = ctx.createGain();
		const compressor = ctx.createDynamicsCompressor();
		const analyser = ctx.createAnalyser();
		const lfo = ctx.createOscillator();
		const vibrato = ctx.createGain();
		const pan1 = ctx.createStereoPanner();
		const pan2 = ctx.createStereoPanner();
		osc1.type = this.wave;
		osc2.type = this.wave;
		osc2.detune.value = 9;
		osc2Gain.gain.value = 0;
		filter.type = "lowpass";
		filter.frequency.value = 480;
		filter.Q.value = .55;
		vca.gain.value = 0;
		hp.type = "highpass";
		hp.frequency.value = 28;
		hp.Q.value = .7;
		delay.delayTime.value = .02;
		revFilter.type = "lowpass";
		revFilter.frequency.value = 6200;
		convolver.buffer = makeImpulse(ctx);
		master.gain.value = this.muted ? 0 : .82;
		compressor.threshold.value = -10;
		compressor.knee.value = 12;
		compressor.ratio.value = 3;
		compressor.attack.value = .004;
		compressor.release.value = .18;
		analyser.fftSize = 1024;
		analyser.smoothingTimeConstant = .75;
		lfo.type = "sine";
		lfo.frequency.value = 5.05;
		vibrato.gain.value = 0;
		pan1.pan.value = -.28;
		pan2.pan.value = .28;
		osc1.connect(pan1).connect(mix);
		osc2.connect(osc2Gain).connect(pan2).connect(mix);
		mix.connect(filter).connect(vca).connect(hp);
		hp.connect(dry).connect(master);
		hp.connect(delay).connect(revFilter).connect(convolver).connect(wet).connect(master);
		master.connect(compressor).connect(analyser).connect(ctx.destination);
		lfo.connect(vibrato);
		vibrato.connect(osc1.frequency);
		vibrato.connect(osc2.frequency);
		osc1.start();
		osc2.start();
		lfo.start();
		this.ctx = ctx;
		this.graph = {
			osc1,
			osc2,
			osc2Gain,
			mix,
			filter,
			vca,
			hp,
			dry,
			wet,
			delay,
			revFilter,
			convolver,
			master,
			compressor,
			analyser,
			lfo,
			vibrato
		};
		document.addEventListener("visibilitychange", this.onVis);
		this.applyReverb();
		if (ctx.state === "suspended") ctx.resume();
	}
	applyReverb() {
		if (!this.ctx || !this.graph) return;
		const now = this.ctx.currentTime;
		const wet = Math.sin(this.reverb * Math.PI * .5);
		const dry = Math.cos(this.reverb * Math.PI * .5);
		this.graph.dry.gain.setTargetAtTime(dry, now, .03);
		this.graph.wet.gain.setTargetAtTime(wet, now, .03);
	}
	apply() {
		if (!this.ctx || !this.graph) return;
		const now = this.ctx.currentTime;
		const g = this.graph;
		const freq = xToFreq(this.nx);
		const expression = this.present ? yToExpression(this.ny) : 0;
		const upward = Math.max(0, this.prevY - this.ny);
		this.prevY = this.ny;
		const accent = Math.min(1, upward * 14);
		const level = expression * WAVE_GAIN[this.wave];
		const glide = this.present ? .042 : .07;
		g.osc1.frequency.setTargetAtTime(freq, now, glide);
		g.osc2.frequency.setTargetAtTime(freq, now, glide);
		g.vca.gain.setTargetAtTime(level, now, this.present ? .026 : .085);
		g.osc2Gain.gain.setTargetAtTime(this.present ? DETUNE_MIX[this.wave] : 0, now, .04);
		const cents = 5 + 11 * expression;
		const depth = this.present && !this.muted ? freq * (2 ** (cents / 1200) - 1) : 0;
		g.vibrato.gain.setTargetAtTime(depth, now, .1);
		const cutoff = 460 + expression ** .55 * 8600 + accent * 2800;
		g.filter.frequency.setTargetAtTime(Math.min(14e3, cutoff), now, .05);
		g.master.gain.setTargetAtTime(this.muted ? 0 : .82, now, .018);
	}
};
var REVERB_KEY = "chroma-reverb";
var WAVE_KEY = "chroma-wave";
function isWave(value) {
	return value === "sine" || value === "triangle" || value === "sawtooth" || value === "square";
}
function WaveGlyph({ wave }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 24 24",
		className: "wave-glyph",
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: wave === "sine" ? "M1 12 C 4 12 4 3 8 3 S 12 21 16 21 S 20 12 23 12" : wave === "triangle" ? "M1 15 L7 4 L15 20 L21 8" : wave === "sawtooth" ? "M2 17 L11 4 V17 L20 4" : "M2 16 H8 V5 H16 V16 H22",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "1.5",
			strokeLinejoin: "round",
			strokeLinecap: "round"
		})
	});
}
function ChromaTheremin() {
	const engineRef = (0, import_react.useRef)(null);
	const fieldRef = (0, import_react.useRef)(null);
	const canvasRef = (0, import_react.useRef)(null);
	const scopeRef = (0, import_react.useRef)(null);
	const noteRef = (0, import_react.useRef)(null);
	const centsRef = (0, import_react.useRef)(null);
	const hzRef = (0, import_react.useRef)(null);
	const statusRef = (0, import_react.useRef)(null);
	const readoutRef = (0, import_react.useRef)(null);
	const waveBuf = (0, import_react.useRef)(null);
	const presentRef = (0, import_react.useRef)(false);
	const mutedRef = (0, import_react.useRef)(false);
	const visAmp = (0, import_react.useRef)(0);
	const touchedRef = (0, import_react.useRef)(false);
	const [wave, setWave] = (0, import_react.useState)("sine");
	const [reverb, setReverb] = (0, import_react.useState)(36);
	const [muted, setMuted] = (0, import_react.useState)(false);
	const [armed, setArmed] = (0, import_react.useState)(false);
	const [present, setPresent] = (0, import_react.useState)(false);
	const [touched, setTouched] = (0, import_react.useState)(false);
	const [pointerKind, setPointerKind] = (0, import_react.useState)("mouse");
	const [audioError, setAudioError] = (0, import_react.useState)(false);
	function engine() {
		if (!engineRef.current) engineRef.current = new ThereminEngine();
		return engineRef.current;
	}
	function markPresent(next) {
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
	function applyMute(next) {
		mutedRef.current = next;
		engine().setMuted(next);
		setMuted(next);
	}
	(0, import_react.useEffect)(() => {
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
	(0, import_react.useEffect)(() => {
		localStorage.setItem(WAVE_KEY, wave);
		localStorage.setItem(REVERB_KEY, String(reverb));
	}, [wave, reverb]);
	(0, import_react.useEffect)(() => {
		const onKey = (event) => {
			const tag = event.target?.tagName;
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
			const step = event.shiftKey ? .006 : .02;
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
	(0, import_react.useEffect)(() => {
		let frame = 0;
		const loop = () => {
			frame = requestAnimationFrame(loop);
			const eng = engineRef.current;
			const field = canvasRef.current;
			const scope = scopeRef.current;
			const nx = eng?.nx ?? .5;
			const ny = eng?.ny ?? .62;
			const isPresent = eng?.present ?? false;
			const target = isPresent && !mutedRef.current ? yToExpression(ny) : 0;
			visAmp.current += (target - visAmp.current) * .2;
			const amp = visAmp.current;
			const hue = isPresent || touchedRef.current ? hueForX(nx) : hueForX(.5);
			const freq = xToFreq(nx);
			const pitch = describeFreq(freq);
			const root = document.documentElement;
			const sat = 62 + amp * 32;
			const light = 56 + amp * 14;
			root.style.setProperty("--neon", `hsl(${hue} ${sat}% ${light}%)`);
			root.style.setProperty("--line", `hsl(${hue} ${40 + amp * 45}% ${32 + amp * 18}% / ${.34 + amp * .55})`);
			root.style.setProperty("--glow", `hsl(${hue} 100% 62%)`);
			root.style.setProperty("--amp", amp.toFixed(4));
			root.style.setProperty("--nx", nx.toFixed(4));
			root.style.setProperty("--cents", (isPresent ? pitch.cents : 0).toFixed(1));
			if (noteRef.current) noteRef.current.textContent = touchedRef.current ? pitch.name : "—";
			if (centsRef.current) centsRef.current.textContent = touchedRef.current ? `${formatCents(pitch.cents)}¢` : "±00¢";
			if (hzRef.current) hzRef.current.textContent = touchedRef.current ? `${freq.toFixed(1)} Hz` : "— Hz";
			if (statusRef.current) {
				const status = mutedRef.current ? "MUTED" : isPresent && eng?.unlocked ? "LIVE" : isPresent ? "READY" : "SILENT";
				if (statusRef.current.textContent !== status) statusRef.current.textContent = status;
			}
			if (readoutRef.current) {
				const live = isPresent && !mutedRef.current && !!eng?.unlocked;
				readoutRef.current.dataset.live = live ? "true" : "false";
			}
			paintCanvas(field, (ctx, w, h) => {
				drawField(ctx, w, h, {
					nx,
					ny,
					amp,
					hue,
					present: isPresent
				});
			});
			if (!waveBuf.current || waveBuf.current.length !== 1024) {
				const next = /* @__PURE__ */ new Uint8Array(1024);
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
	function handFrom(event, nextPresent) {
		const rect = event.currentTarget.getBoundingClientRect();
		const nx = clamp((event.clientX - rect.left) / rect.width);
		const ny = clamp((event.clientY - rect.top) / rect.height);
		engine().setHand(nx, ny, nextPresent);
		markPresent(nextPresent);
		if (event.pointerType !== pointerKind) setPointerKind(event.pointerType);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "app",
		"data-touched": touched ? "true" : "false",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "sr-only",
				id: "chroma-help",
				children: "Chroma is a theremin. Horizontal position sets pitch from C3 to C6. Vertical position sets volume, loud at the top and quiet at the bottom. Arrow keys move the tone. Keys 1 to 4 change the waveform. Space mutes. Escape releases."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "top",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "brand",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "CHROMA" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "THEREMIN" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "readout",
					ref: readoutRef,
					"data-live": "false",
					"aria-hidden": "true",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "note",
							ref: noteRef,
							children: "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "meta",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									ref: centsRef,
									children: "±00¢"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									ref: hzRef,
									children: "— Hz"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "status",
									ref: statusRef,
									children: "SILENT"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "cents-track",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "cents-zero" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "cents-needle" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
							className: "scope",
							ref: scopeRef
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "stage",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "y-axis",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "LOUD" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "y-meter",
								"aria-hidden": "true",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "QUIET" })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "field",
						ref: fieldRef,
						role: "application",
						"aria-roledescription": "theremin",
						"aria-label": "Play field. Left to right is pitch. Top is loud, bottom is quiet.",
						"aria-describedby": "chroma-help",
						tabIndex: 0,
						onPointerDown: (event) => {
							arm();
							event.currentTarget.setPointerCapture(event.pointerId);
							handFrom(event, true);
						},
						onPointerMove: (event) => {
							const dragging = event.currentTarget.hasPointerCapture(event.pointerId);
							if (event.pointerType === "mouse" && !dragging) {
								handFrom(event, true);
								return;
							}
							if (dragging) handFrom(event, true);
						},
						onPointerUp: (event) => {
							if (event.pointerType === "mouse") {
								const rect = event.currentTarget.getBoundingClientRect();
								handFrom(event, event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom);
							} else {
								engine().setHand(engine().nx, engine().ny, false);
								markPresent(false);
							}
						},
						onPointerLeave: (event) => {
							if (event.currentTarget.hasPointerCapture(event.pointerId)) return;
							engine().setHand(engine().nx, engine().ny, false);
							markPresent(false);
						},
						onContextMenu: (event) => event.preventDefault(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", { ref: canvasRef }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "hint",
							"data-hidden": present && armed ? "true" : "false",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: audioError ? "Audio isn't available in this browser" : !armed ? "Click or tap the frame" : pointerKind === "touch" ? "Drag inside the frame" : present ? "" : "Hover the frame" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "hint-sub",
								children: "Left–right pitch · up–down volume"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "x-axis",
						"aria-hidden": "true",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "LOW PITCH" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "x-track",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "x-pip" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "HIGH PITCH" })
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "dock",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "controls",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "waves",
							role: "group",
							"aria-label": "Waveform",
							children: WAVES.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "wave",
								"aria-pressed": wave === item,
								"aria-label": `${WAVE_LABEL[item]} wave`,
								onClick: () => {
									arm();
									engine().setWave(item);
									setWave(item);
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WaveGlyph, { wave: item }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: WAVE_LABEL[item] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "keycap",
										children: index + 1
									})
								]
							}, item))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "reverb",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "REVERB" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "range",
									min: 0,
									max: 100,
									value: reverb,
									"aria-valuetext": `${reverb} percent`,
									style: { ["--reverb"]: `${reverb}%` },
									onPointerDown: () => arm(),
									onChange: (event) => {
										const next = Number(event.target.value);
										setReverb(next);
										engine().setReverb(next / 100);
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "pct",
									children: reverb
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "mute",
							"aria-pressed": muted,
							onClick: () => {
								arm();
								applyMute(!muted);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "ico-swap",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, {
									className: muted ? "ico-layer ico-layer-off" : "ico-layer",
									strokeWidth: 1.5
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, {
									className: muted ? "ico-layer" : "ico-layer ico-layer-off",
									strokeWidth: 1.5
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: muted ? "Unmute" : "Mute" })]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "legend",
					children: "Arrows nudge · 1–4 wave · space mute · esc release"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "sr-only",
				"aria-live": "polite",
				children: muted ? "Muted" : armed ? "Sound on" : ""
			})
		]
	});
}
function paintCanvas(canvas, draw) {
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
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChromaTheremin, {});
}
//#endregion
export { Home as component };
