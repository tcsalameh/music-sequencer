/// <reference path="soundUtils.ts" />
/// <reference path="utils.ts" />

module Model {
	export class TimeSignature {

		constructor(public num: number, public denom: number) { }

		msPerBar(bpm: number) {
			var whole = (60.0 / bpm) * 4; // whole note duration, seconds
			var wholems = whole*1000 // whole note duration, ms
			var duration = this.num * wholems / this.denom; // total time, seconds
			return duration
		}
	}

	export class Instrument {
		bucket = 0;
		radius = 6;
		expire = 0;
		dim = new Utils.Dimension(700, 700);
		ctx = (<HTMLCanvasElement>document.getElementById("main_view")).getContext("2d");

		constructor(public center: Utils.Point,
			public color: Utils.Color,
			public dispTime: number,
			public expRate: number) {
			this.bucket = this.getRegion();
			this.expire = dispTime;
		}

		getRegion() {
			var xMap = this.center.x;
			var yMap = this.center.y;
			var xBinSize = this.dim.width / 4;
			var yBinSize = this.dim.height / 4;
			var xBin = Math.floor(xMap / xBinSize);
			var yBin = Math.floor(yMap / yBinSize);
			return (xBin + yBin * 4)
		}

		play(offset) {

		}

		move() {
			if (this.expire == 0) {
				this.radius = 0;
			}
			else {
				this.radius = this.radius + this.expRate;
				this.expire = this.expire - 1;
			}
		}

		draw() {
			this.color.a = this.expire / this.dispTime;
			this.ctx.lineWidth = 3;
			this.ctx.strokeStyle = `rgba(${this.color.r},${this.color.g},${this.color.b},${this.color.a}`;

			// draw center first
			this.ctx.beginPath();
			this.ctx.arc(this.center.x, this.center.y, 3, 0, 2 * Math.PI, false);
			this.ctx.fillStyle = `rgba(${this.color.r},${this.color.g},${this.color.b},${this.color.a})`;
			this.ctx.fill();

			// then circle
			this.ctx.beginPath();
			this.ctx.arc(this.center.x, this.center.y, this.radius, 0, 2 * Math.PI, false);
			this.ctx.stroke();

			this.ctx.lineWidth = 1;
			// then grid
			this.drawGrid();
		}

		drawGrid() {
			var h = this.dim.height;
			var w = this.dim.width;

			this.ctx.beginPath();
			this.ctx.moveTo(0, h / 4);
			this.ctx.lineTo(w, h / 4);
			this.ctx.stroke();

			this.ctx.beginPath();
			this.ctx.moveTo(0, h / 2);
			this.ctx.lineTo(w, h / 2);
			this.ctx.stroke();

			this.ctx.beginPath();
			this.ctx.moveTo(0, 3 * h / 4);
			this.ctx.lineTo(w, 3 * h / 4);
			this.ctx.stroke();

			this.ctx.beginPath();
			this.ctx.moveTo(w / 4, 0);
			this.ctx.lineTo(w / 4, h);
			this.ctx.stroke();

			this.ctx.beginPath();
			this.ctx.moveTo(w / 2, 0);
			this.ctx.lineTo(w / 2, h);
			this.ctx.stroke();

			this.ctx.beginPath();
			this.ctx.moveTo(3 * w / 4, 0);
			this.ctx.lineTo(3 * w / 4, h);
			this.ctx.stroke();
		}
	}

	export class Keys extends Instrument {
		public static sounds = [new SoundUtils.Sound("keys/Celesta C2.ogg", null),
			new SoundUtils.Sound("keys/Celesta Db2.ogg", null),
			new SoundUtils.Sound("keys/Celesta D2.ogg", null),
			new SoundUtils.Sound("keys/Celesta Eb2.ogg", null),
			new SoundUtils.Sound("keys/Celesta E2.ogg", null),
			new SoundUtils.Sound("keys/Celesta F2.ogg", null),
			new SoundUtils.Sound("keys/Celesta Gb2.ogg", null),
			new SoundUtils.Sound("keys/Celesta G2.ogg", null),
			new SoundUtils.Sound("keys/Celesta Ab2.ogg", null),
			new SoundUtils.Sound("keys/Celesta A2.ogg", null),
			new SoundUtils.Sound("keys/Celesta Bb2.ogg", null),
			new SoundUtils.Sound("keys/Celesta B2.ogg", null),
			new SoundUtils.Sound("keys/Celesta C3.ogg", null),
			new SoundUtils.Sound("keys/Celesta Db3.ogg", null),
			new SoundUtils.Sound("keys/Celesta D3.ogg", null),
			new SoundUtils.Sound("keys/Celesta Eb3.ogg", null)]

		constructor(public center: Utils.Point) {
			super(center,
				new Utils.Color(30, 100, 179, 1),
				80,
				2);
		}

		play(offset) {
			SoundUtils.play(Keys.sounds[this.bucket], offset, SoundUtils.audioCtx);
		}
	}

	export class Percussion extends Instrument {
		public static sounds = [new SoundUtils.Sound("percussion/Kick YouKnow.ogg", null),
			new SoundUtils.Sound("percussion/Kick 808 2.ogg", null),
			new SoundUtils.Sound("percussion/FloorTom AR70sTight V127 1.ogg", null),
			new SoundUtils.Sound("percussion/RideBell Central V2.ogg", null),
			new SoundUtils.Sound("percussion/Snare 70sDnB 1.ogg", null),
			new SoundUtils.Sound("percussion/ClosedHH 8-Ball.ogg", null),
			new SoundUtils.Sound("percussion/OpenHH 8-Ball.ogg", null),
			new SoundUtils.Sound("percussion/Combo CleanGutter.ogg", null),
			new SoundUtils.Sound("percussion/Clap AR60sEarly V127 1.ogg", null),
			new SoundUtils.Sound("percussion/Clap AR60sEarly V127 2.ogg", null),
			new SoundUtils.Sound("percussion/Clap AR70sOpen V127 2.ogg", null),
			new SoundUtils.Sound("percussion/Crash 70sDnB.ogg", null),
			new SoundUtils.Sound("percussion/Crackle Sutekh 1.ogg", null),
			new SoundUtils.Sound("percussion/Glitch Neolithic.ogg", null),
			new SoundUtils.Sound("percussion/Glitch Resurrection.ogg", null),
			new SoundUtils.Sound("percussion/Ambience DistSuspend.ogg", null)]

		constructor(public center: Utils.Point) {
			super(center,
				new Utils.Color(244, 60, 4, 1),
				20,
				5);
		}

		play(offset) {
			SoundUtils.play(Percussion.sounds[this.bucket], offset, SoundUtils.audioCtx);
		}
	}

	export class Bass extends Instrument {
		public static sounds = [new SoundUtils.Sound("bass/Adrenaline C3.ogg", null),
			new SoundUtils.Sound("bass/Adrenaline Db3.ogg", null),
			new SoundUtils.Sound("bass/Adrenaline D3.ogg", null),
			new SoundUtils.Sound("bass/Adrenaline Eb3.ogg", null),
			new SoundUtils.Sound("bass/Adrenaline E3.ogg", null),
			new SoundUtils.Sound("bass/Adrenaline F3.ogg", null),
			new SoundUtils.Sound("bass/Adrenaline Gb3.ogg", null),
			new SoundUtils.Sound("bass/Adrenaline G3.ogg", null),
			new SoundUtils.Sound("bass/Adrenaline Ab3.ogg", null),
			new SoundUtils.Sound("bass/Adrenaline A3.ogg", null),
			new SoundUtils.Sound("bass/Adrenaline Bb3.ogg", null),
			new SoundUtils.Sound("bass/Adrenaline B3.ogg", null),
			new SoundUtils.Sound("bass/Adrenaline C4.ogg", null),
			new SoundUtils.Sound("bass/Adrenaline Db4.ogg", null),
			new SoundUtils.Sound("bass/Adrenaline D4.ogg", null),
			new SoundUtils.Sound("bass/Adrenaline Eb4.ogg", null)]

		constructor(public center: Utils.Point) {
			super(center,
				new Utils.Color(100, 50, 200, 1),
				80,
				2);
		}

		play(offset) {
			SoundUtils.play(Bass.sounds[this.bucket], offset, SoundUtils.audioCtx);
		}
	}

	export class Strings extends Instrument {
		public static sounds = [new SoundUtils.Sound("strings/Bowgart C3.ogg", null),
			new SoundUtils.Sound("strings/Bowgart Db3.ogg", null),
			new SoundUtils.Sound("strings/Bowgart D3.ogg", null),
			new SoundUtils.Sound("strings/Bowgart Eb3.ogg", null),
			new SoundUtils.Sound("strings/Bowgart E3.ogg", null),
			new SoundUtils.Sound("strings/Bowgart F3.ogg", null),
			new SoundUtils.Sound("strings/Bowgart Gb3.ogg", null),
			new SoundUtils.Sound("strings/Bowgart G3.ogg", null),
			new SoundUtils.Sound("strings/Bowgart Ab3.ogg", null),
			new SoundUtils.Sound("strings/Bowgart A3.ogg", null),
			new SoundUtils.Sound("strings/Bowgart Bb3.ogg", null),
			new SoundUtils.Sound("strings/Bowgart B3.ogg", null),
			new SoundUtils.Sound("strings/Bowgart C4.ogg", null),
			new SoundUtils.Sound("strings/Bowgart Db4.ogg", null),
			new SoundUtils.Sound("strings/Bowgart D4.ogg", null),
			new SoundUtils.Sound("strings/Bowgart Eb4.ogg", null)]

		constructor(public center: Utils.Point) {
			super(center,
				new Utils.Color(80, 150, 100, 1),
				50,
				1);
		}

		play(offset) {
			SoundUtils.play(Strings.sounds[this.bucket], offset, SoundUtils.audioCtx);
		}

		draw() {
			if (this.expire > 2 * this.dispTime / 3) {
				this.color.a = Math.abs((this.dispTime - this.expire) / (2 * this.dispTime / 3));
			}
			else {
				this.color.a = this.expire / (4 * this.dispTime / 3);
			}

			this.ctx.strokeStyle = `rgba(${this.color.r},${this.color.g},${this.color.b},${this.color.a}`;
			this.ctx.fillStyle = `rgba(${this.color.r},${this.color.g},${this.color.b},${this.color.a}`;

			var x = Math.floor(this.center.x / (this.dim.width / 4)) * this.dim.width / 4;
			var y = Math.floor(this.center.y / (this.dim.height / 4)) * this.dim.height / 4;
			this.ctx.fillRect(x, y, this.dim.width / 4, this.dim.height / 4);
			this.drawGrid();
		}
	}

	export class Lead extends Instrument {
		public static sounds = [new SoundUtils.Sound("lead/Widen C4.ogg", null),
			new SoundUtils.Sound("lead/Widen Db4.ogg", null),
			new SoundUtils.Sound("lead/Widen D4.ogg", null),
			new SoundUtils.Sound("lead/Widen Eb4.ogg", null),
			new SoundUtils.Sound("lead/Widen E4.ogg", null),
			new SoundUtils.Sound("lead/Widen F4.ogg", null),
			new SoundUtils.Sound("lead/Widen Gb4.ogg", null),
			new SoundUtils.Sound("lead/Widen G4.ogg", null),
			new SoundUtils.Sound("lead/Widen Ab4.ogg", null),
			new SoundUtils.Sound("lead/Widen A4.ogg", null),
			new SoundUtils.Sound("lead/Widen Bb4.ogg", null),
			new SoundUtils.Sound("lead/Widen B4.ogg", null),
			new SoundUtils.Sound("lead/Widen C5.ogg", null),
			new SoundUtils.Sound("lead/Widen Db5.ogg", null),
			new SoundUtils.Sound("lead/Widen D5.ogg", null),
			new SoundUtils.Sound("lead/Widen Eb5.ogg", null)]

		constructor(public center: Utils.Point) {
			super(center,
				new Utils.Color(232, 239, 55, 1),
				40,
				5);
		}

		play(offset) {
			SoundUtils.play(Lead.sounds[this.bucket], offset, SoundUtils.audioCtx);
		}
	}

	export class Repeater {
		interval: number = 1000; // default 1s
		inst: Instrument = null;
		ctx = (<HTMLCanvasElement> document.getElementById("main_view")).getContext("2d");
		nextExec: number = 0;
		doSchedule: boolean = true;

		constructor(public inst_type, public loc: Utils.Point, public recurs: number, public timesig: TimeSignature, public bpm: number) {
			this.setRecRate(recurs);
			this.inst = new this.inst_type(this.loc);
			this.inst.play(0);
			this.nextExec = performance.now() + this.interval;
		}

		setRecRate(r) {
			this.recurs = r;
			if (this.recurs < 0) {
				this.recurs = 1;
			}
			this.interval = this.timesig.msPerBar(this.bpm) * this.recurs;
		}

		setBpm(bpm) {
			if (bpm < 1) {
				this.bpm = 1;
			}
			else {
				this.bpm = bpm;
			}
			this.setRecRate(this.recurs);
		}

		schedule() {
			this.inst.play(SoundUtils.audioCtx.currentTime + (this.nextExec - performance.now())/1000);
			var self = this;
			setTimeout(function() { self.inst = new self.inst_type(self.loc) }, Math.floor(this.nextExec - performance.now()));
			this.nextExec += this.interval;
		}

		shutdown() {
			this.doSchedule = false;
		}

		move() {
			this.inst.move();
		}

		draw() {
			this.inst.draw();
		}
	}


	export var ITypes = [{ label: "Keys", type: Keys, bar: 1, id: 0},
		{ label: "Percussion", type: Percussion, bar: 1, id: 1 },
		{ label: "Bass", type: Bass, bar: 1, id: 2},
		{ label: "Strings", type: Strings, bar: 1, id: 3 },
		{ label: "Lead", type: Lead, bar: 1, id: 4 }];


	export class Cc {
		public notes = [];
		public menus = [];
		public bpm = 0;
		public timesig = null;

		constructor() {}

		init(bpm, timesig) {
			this.bpm = bpm;
			this.timesig = timesig;
		}

		addNote(note: Repeater) {
			// for repeater type
			this.notes.push(note)
		}
		
		setBpm(bpm) {
			// sets bpm for all notes
			this.bpm = bpm;
			for (var note of this.notes) {
				note.setBpm(this.bpm);
			}
		}

		removeNote() {
			// removes last repeating note from the animation queue
			// and invokes it's shutdown method
			// so the scheduler will remove it from the sound playing queue
			if (this.notes.length > 0) {
				this.notes.pop().shutdown();
			}
		}

	}

}
