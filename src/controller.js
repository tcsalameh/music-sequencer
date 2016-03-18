var SoundUtils;
(function (SoundUtils) {
    // go back to figure out compatibility
    //Chrome & FF -> AudioContext() Safari -> webkitAudioContext()
    SoundUtils.audioCtx = new AudioContext();
    var Sound = (function () {
        function Sound(name, source, gain, lp_filter, pan) {
            if (gain === void 0) { gain = 1; }
            if (lp_filter === void 0) { lp_filter = 14; }
            if (pan === void 0) { pan = 0; }
            this.name = name;
            this.source = source;
            this.gain = gain;
            this.lp_filter = lp_filter;
            this.pan = pan;
        }
        return Sound;
    })();
    SoundUtils.Sound = Sound;
    function getData(sound, audioCtx) {
        var source = audioCtx.createBufferSource();
        var request = new XMLHttpRequest();
        request.open('GET', sound.name, true);
        request.responseType = 'arraybuffer';
        request.onload = function () {
            var audioData = request.response;
            audioCtx.decodeAudioData(audioData, function (buffer) {
                source.buffer = buffer;
                var lastNode = source;
                if (sound.gain != 1) {
                    var gainNode = audioCtx.createGain();
                    gainNode.gain.value = sound.gain;
                    lastNode.connect(gainNode);
                    lastNode = gainNode;
                }
                if (sound.lp_filter < 14) {
                    var lowpf = audioCtx.createBiquadFilter();
                    lowpf.frequency.value = Math.floor(Math.pow(2, sound.lp_filter));
                    lastNode.connect(lowpf);
                    lastNode = lowpf;
                }
                if (sound.pan != 0) {
                    var panner = audioCtx.createStereoPanner();
                    panner.pan.value = sound.pan;
                    lastNode.connect(panner);
                    lastNode = panner;
                }
                lastNode.connect(audioCtx.destination);
            });
        };
        request.send();
        return source;
    }
    SoundUtils.getData = getData;
    function loadAll(sounds, audioCtx) {
        for (var _i = 0; _i < sounds.length; _i++) {
            var sound = sounds[_i];
            sound.source = getData(sound, audioCtx);
        }
    }
    SoundUtils.loadAll = loadAll;
    function play(sound, when, audioCtx) {
        sound.source.start(when);
        sound.source = getData(sound, audioCtx);
    }
    SoundUtils.play = play;
})(SoundUtils || (SoundUtils = {}));
var Utils;
(function (Utils) {
    var Dimension = (function () {
        function Dimension(width, height) {
            this.width = width;
            this.height = height;
        }
        return Dimension;
    })();
    Utils.Dimension = Dimension;
    var Point = (function () {
        function Point(x, y) {
            this.x = x;
            this.y = y;
        }
        return Point;
    })();
    Utils.Point = Point;
    var Color = (function () {
        function Color(r, g, b, a) {
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
        }
        return Color;
    })();
    Utils.Color = Color;
})(Utils || (Utils = {}));
/// <reference path="soundUtils.ts" />
/// <reference path="utils.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Model;
(function (Model) {
    var TimeSignature = (function () {
        function TimeSignature(num, denom) {
            this.num = num;
            this.denom = denom;
        }
        TimeSignature.prototype.msPerBar = function (bpm) {
            var whole = (60.0 / bpm) * 4; // whole note duration, seconds
            var wholems = whole * 1000; // whole note duration, ms
            var duration = this.num * wholems / this.denom; // total time, seconds
            return duration;
        };
        return TimeSignature;
    })();
    Model.TimeSignature = TimeSignature;
    var Instrument = (function () {
        function Instrument(center, color, dispTime, expRate) {
            this.center = center;
            this.color = color;
            this.dispTime = dispTime;
            this.expRate = expRate;
            this.bucket = 0;
            this.radius = 6;
            this.expire = 0;
            this.dim = new Utils.Dimension(700, 700);
            this.ctx = document.getElementById("main_view").getContext("2d");
            this.bucket = this.getRegion();
            this.expire = dispTime;
        }
        Instrument.prototype.getRegion = function () {
            var xMap = this.center.x;
            var yMap = this.center.y;
            var xBinSize = this.dim.width / 4;
            var yBinSize = this.dim.height / 4;
            var xBin = Math.floor(xMap / xBinSize);
            var yBin = Math.floor(yMap / yBinSize);
            return (xBin + yBin * 4);
        };
        Instrument.prototype.play = function (offset) {
        };
        Instrument.prototype.move = function () {
            if (this.expire == 0) {
                this.radius = 0;
            }
            else {
                this.radius = this.radius + this.expRate;
                this.expire = this.expire - 1;
            }
        };
        Instrument.prototype.draw = function () {
            this.color.a = this.expire / this.dispTime;
            this.ctx.lineWidth = 3;
            this.ctx.strokeStyle = "rgba(" + this.color.r + "," + this.color.g + "," + this.color.b + "," + this.color.a;
            // draw center first
            this.ctx.beginPath();
            this.ctx.arc(this.center.x, this.center.y, 3, 0, 2 * Math.PI, false);
            this.ctx.fillStyle = "rgba(" + this.color.r + "," + this.color.g + "," + this.color.b + "," + this.color.a + ")";
            this.ctx.fill();
            // then circle
            this.ctx.beginPath();
            this.ctx.arc(this.center.x, this.center.y, this.radius, 0, 2 * Math.PI, false);
            this.ctx.stroke();
            this.ctx.lineWidth = 1;
            // then grid
            this.drawGrid();
        };
        Instrument.prototype.drawGrid = function () {
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
        };
        return Instrument;
    })();
    Model.Instrument = Instrument;
    var Keys = (function (_super) {
        __extends(Keys, _super);
        function Keys(center) {
            _super.call(this, center, new Utils.Color(30, 100, 179, 1), 80, 2);
            this.center = center;
        }
        Keys.prototype.play = function (offset) {
            SoundUtils.play(Keys.sounds[this.bucket], offset, SoundUtils.audioCtx);
        };
        Keys.sounds = [new SoundUtils.Sound("keys/Celesta C2.ogg", null),
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
            new SoundUtils.Sound("keys/Celesta Eb3.ogg", null)];
        return Keys;
    })(Instrument);
    Model.Keys = Keys;
    var Percussion = (function (_super) {
        __extends(Percussion, _super);
        function Percussion(center) {
            _super.call(this, center, new Utils.Color(244, 60, 4, 1), 20, 5);
            this.center = center;
        }
        Percussion.prototype.play = function (offset) {
            SoundUtils.play(Percussion.sounds[this.bucket], offset, SoundUtils.audioCtx);
        };
        Percussion.sounds = [new SoundUtils.Sound("percussion/Kick YouKnow.ogg", null),
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
            new SoundUtils.Sound("percussion/Ambience DistSuspend.ogg", null)];
        return Percussion;
    })(Instrument);
    Model.Percussion = Percussion;
    var Bass = (function (_super) {
        __extends(Bass, _super);
        function Bass(center) {
            _super.call(this, center, new Utils.Color(100, 50, 200, 1), 80, 2);
            this.center = center;
        }
        Bass.prototype.play = function (offset) {
            SoundUtils.play(Bass.sounds[this.bucket], offset, SoundUtils.audioCtx);
        };
        Bass.sounds = [new SoundUtils.Sound("bass/Adrenaline C3.ogg", null),
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
            new SoundUtils.Sound("bass/Adrenaline Eb4.ogg", null)];
        return Bass;
    })(Instrument);
    Model.Bass = Bass;
    var Strings = (function (_super) {
        __extends(Strings, _super);
        function Strings(center) {
            _super.call(this, center, new Utils.Color(80, 150, 100, 1), 50, 1);
            this.center = center;
        }
        Strings.prototype.play = function (offset) {
            SoundUtils.play(Strings.sounds[this.bucket], offset, SoundUtils.audioCtx);
        };
        Strings.prototype.draw = function () {
            if (this.expire > 2 * this.dispTime / 3) {
                this.color.a = Math.abs((this.dispTime - this.expire) / (2 * this.dispTime / 3));
            }
            else {
                this.color.a = this.expire / (4 * this.dispTime / 3);
            }
            this.ctx.strokeStyle = "rgba(" + this.color.r + "," + this.color.g + "," + this.color.b + "," + this.color.a;
            this.ctx.fillStyle = "rgba(" + this.color.r + "," + this.color.g + "," + this.color.b + "," + this.color.a;
            var x = Math.floor(this.center.x / (this.dim.width / 4)) * this.dim.width / 4;
            var y = Math.floor(this.center.y / (this.dim.height / 4)) * this.dim.height / 4;
            this.ctx.fillRect(x, y, this.dim.width / 4, this.dim.height / 4);
            this.drawGrid();
        };
        Strings.sounds = [new SoundUtils.Sound("strings/Bowgart C3.ogg", null),
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
            new SoundUtils.Sound("strings/Bowgart Eb4.ogg", null)];
        return Strings;
    })(Instrument);
    Model.Strings = Strings;
    var Lead = (function (_super) {
        __extends(Lead, _super);
        function Lead(center) {
            _super.call(this, center, new Utils.Color(232, 239, 55, 1), 40, 5);
            this.center = center;
        }
        Lead.prototype.play = function (offset) {
            SoundUtils.play(Lead.sounds[this.bucket], offset, SoundUtils.audioCtx);
        };
        Lead.sounds = [new SoundUtils.Sound("lead/Widen C4.ogg", null),
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
            new SoundUtils.Sound("lead/Widen Eb5.ogg", null)];
        return Lead;
    })(Instrument);
    Model.Lead = Lead;
    var Repeater = (function () {
        function Repeater(inst_type, loc, recurs, timesig, bpm) {
            this.inst_type = inst_type;
            this.loc = loc;
            this.recurs = recurs;
            this.timesig = timesig;
            this.bpm = bpm;
            this.interval = 1000; // default 1s
            this.inst = null;
            this.ctx = document.getElementById("main_view").getContext("2d");
            this.nextExec = 0;
            this.doSchedule = true;
            this.setRecRate(recurs);
            this.inst = new this.inst_type(this.loc);
            this.inst.play(0);
            this.nextExec = performance.now() + this.interval;
        }
        Repeater.prototype.setRecRate = function (r) {
            this.recurs = r;
            if (this.recurs < 0) {
                this.recurs = 1;
            }
            this.interval = this.timesig.msPerBar(this.bpm) * this.recurs;
        };
        Repeater.prototype.setBpm = function (bpm) {
            if (bpm < 1) {
                this.bpm = 1;
            }
            else {
                this.bpm = bpm;
            }
            this.setRecRate(this.recurs);
        };
        Repeater.prototype.schedule = function () {
            this.inst.play(SoundUtils.audioCtx.currentTime + (this.nextExec - performance.now()) / 1000);
            var self = this;
            setTimeout(function () { self.inst = new self.inst_type(self.loc); }, Math.floor(this.nextExec - performance.now()));
            this.nextExec += this.interval;
        };
        Repeater.prototype.shutdown = function () {
            this.doSchedule = false;
        };
        Repeater.prototype.move = function () {
            this.inst.move();
        };
        Repeater.prototype.draw = function () {
            this.inst.draw();
        };
        return Repeater;
    })();
    Model.Repeater = Repeater;
    Model.ITypes = [{ label: "Keys", type: Keys, bar: 1, id: 0 },
        { label: "Percussion", type: Percussion, bar: 1, id: 1 },
        { label: "Bass", type: Bass, bar: 1, id: 2 },
        { label: "Strings", type: Strings, bar: 1, id: 3 },
        { label: "Lead", type: Lead, bar: 1, id: 4 }];
    var Cc = (function () {
        function Cc() {
            this.notes = [];
            this.menus = [];
            this.bpm = 0;
            this.timesig = null;
        }
        Cc.prototype.init = function (bpm, timesig) {
            this.bpm = bpm;
            this.timesig = timesig;
        };
        Cc.prototype.addNote = function (note) {
            // for repeater type
            this.notes.push(note);
        };
        Cc.prototype.setBpm = function (bpm) {
            // sets bpm for all notes
            this.bpm = bpm;
            for (var _i = 0, _a = this.notes; _i < _a.length; _i++) {
                var note = _a[_i];
                note.setBpm(this.bpm);
            }
        };
        Cc.prototype.removeNote = function () {
            // removes last repeating note from the animation queue
            // and invokes it's shutdown method
            // so the scheduler will remove it from the sound playing queue
            if (this.notes.length > 0) {
                this.notes.pop().shutdown();
            }
        };
        return Cc;
    })();
    Model.Cc = Cc;
})(Model || (Model = {}));
/// <reference path="model.ts" />
/// <reference path="controller.ts" />
var View;
(function (View) {
    function anim(insts, ctx) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, 700, 700);
        for (var _i = 0; _i < insts.length; _i++) {
            var i = insts[_i];
            i.move();
            i.draw();
        }
        drawMessages(TIME_SIG, bpm, currentInstrument.bar, currentInstrument.label, ctx);
        var timer = setTimeout(function () { anim(insts, ctx); }, 45);
    }
    View.anim = anim;
    function start() {
        var timer = setTimeout(function () { anim(animArray.notes, ctx); }, 45);
    }
    View.start = start;
    function drawMessages(timesig, bpm, bar, cur_inst, ctx) {
        ctx.font = "12px sans-serif";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(timesig.num + "/" + timesig.denom, 5, 15);
        ctx.fillText(bpm + " BPM", 25, 15);
        var barIndic;
        if (bar > 1) {
            barIndic = " bars";
        }
        else {
            barIndic = " bar";
        }
        ctx.fillText(bar + barIndic, 80, 15);
        ctx.font = "18px sans-serif";
        ctx.fillText(cur_inst, 300, 20);
    }
    View.drawMessages = drawMessages;
})(View || (View = {}));
/// <reference path="model.ts" />
/// <reference path="soundUtils.ts" />
/* When instantiated, every repeater object also sets
when it will play next.

Then, it gets pushed onto a queue implemented as a MinHeap
This queue is keyed by the value of when each object will play next.
When running, the scheduler looks at the first object in the queue,
and if it needs to be scheduled it calls its schedule method.
This schedules the audio to play and sets the next play time of the object again.
Then we rebuild the heap to account for the updated play time.
If it doesn't need to be scheduled anymore, it extracts it from the heap
and rebuilds the heap.

If it's looked at all the objects in its lookahead window (or the queue is empty),
the scheduler waits for a certain interval (setTimeout) before waking up again
to schedule the next events.
*/
var Scheduler;
(function (Scheduler_1) {
    var Scheduler = (function () {
        function Scheduler(heapArray) {
            if (heapArray === void 0) { heapArray = []; }
            this.keepRunning = true;
            this.bpm = 120;
            this.queue = new MinHeap(heapArray);
        }
        Scheduler.prototype.add = function (r) {
            this.queue.add(r);
        };
        Scheduler.prototype.run = function () {
            if (this.keepRunning) {
                while (this.queue.heapSize > 0 &&
                    this.queue.getMin().nextExec < performance.now() + Scheduler.lookahead) {
                    //compare next exec to current time and lookahead
                    if (this.queue.getMin().doSchedule) {
                        var r = this.queue.getMin();
                        r.schedule(); // resets exec time
                        this.queue.rootHeapify(0); // re-build the heap
                    }
                    else {
                        this.queue.extractMin();
                    }
                }
                var self = this;
                setTimeout(function () { self.run(); }, Scheduler.interval);
            }
        };
        Scheduler.prototype.stop = function () {
            this.keepRunning = false;
        };
        Scheduler.interval = 25; // ms
        Scheduler.lookahead = 100; //ms
        return Scheduler;
    })();
    Scheduler_1.Scheduler = Scheduler;
    var MinHeap = (function () {
        function MinHeap(heapArray) {
            if (heapArray === void 0) { heapArray = []; }
            this.heapSize = 0;
            this.heapArray = heapArray;
            this.heapSize = heapArray.length;
            this.buildMinHeap();
        }
        MinHeap.prototype.left = function (index) {
            return 2 * index + 1;
        };
        MinHeap.prototype.right = function (index) {
            return 2 * index + 2;
        };
        MinHeap.prototype.parent = function (index) {
            return (index % 2 == 0) ? (index - 2) / 2 : (index - 1) / 2;
        };
        MinHeap.prototype.add = function (r) {
            this.heapSize = this.heapArray.push(r);
            this.childHeapify(this.heapSize - 1);
        };
        MinHeap.prototype.extractMin = function () {
            _a = [this.heapArray[this.heapSize - 1], this.heapArray[0]], this.heapArray[0] = _a[0], this.heapArray[this.heapSize - 1] = _a[1];
            var r = this.heapArray.pop();
            this.heapSize -= 1;
            this.rootHeapify(0);
            return r;
            var _a;
        };
        MinHeap.prototype.getMin = function () {
            if (this.heapArray != null && this.heapArray.length > 0) {
                return this.heapArray[0];
            }
            return null;
        };
        MinHeap.prototype.rootHeapify = function (i) {
            // starts from root and works down as needed to re-order heap
            var l = this.left(i);
            var r = this.right(i);
            if (l < this.heapSize && this.heapArray[l].nextExec < this.heapArray[i].nextExec) {
                var smallest = l;
            }
            else {
                smallest = i;
            }
            if (r < this.heapSize &&
                this.heapArray[r].nextExec < this.heapArray[i].nextExec &&
                this.heapArray[r].nextExec < this.heapArray[l].nextExec) {
                var smallest = r;
            }
            if (smallest != i) {
                _a = [this.heapArray[smallest], this.heapArray[i]], this.heapArray[i] = _a[0], this.heapArray[smallest] = _a[1];
                this.rootHeapify(smallest);
            }
            var _a;
        };
        MinHeap.prototype.childHeapify = function (i) {
            // starts from child and works up as needed to re-order heap
            var parent = this.parent(i);
            if (parent >= 0 && this.heapArray[parent].nextExec > this.heapArray[i].nextExec) {
                _a = [this.heapArray[i], this.heapArray[parent]], this.heapArray[parent] = _a[0], this.heapArray[i] = _a[1];
                this.childHeapify(parent);
            }
            var _a;
        };
        MinHeap.prototype.buildMinHeap = function () {
            for (var i = Math.floor(this.heapSize / 2) - 1; i >= 0; i--) {
                this.rootHeapify(i);
            }
        };
        return MinHeap;
    })();
    Scheduler_1.MinHeap = MinHeap;
})(Scheduler || (Scheduler = {}));
/// <reference path="model.ts" />
/// <reference path="view.ts" />
/// <reference path="utils.ts" />
/// <reference path="soundUtils.ts" />
/// <reference path="scheduler.ts" />
/// <reference path="jquery.d.ts" />
var canvas = document.getElementById("main_view");
var ctx = canvas.getContext("2d");
var audioCtx = new AudioContext();
var TIME_SIG = new Model.TimeSignature(4, 4);
var bpm = 120;
var currentInstrument = Model.ITypes[0];
var animArray = new Model.Cc();
var scheduler = new Scheduler.Scheduler();
var volume = $("#volume").data("roundSlider");
var lowpass = $("#lowpass").data("roundSlider");
var panner = $("#pan").data("roundSlider");
SoundUtils.loadAll(Model.Keys.sounds, audioCtx);
SoundUtils.loadAll(Model.Percussion.sounds, audioCtx);
SoundUtils.loadAll(Model.Bass.sounds, audioCtx);
SoundUtils.loadAll(Model.Strings.sounds, audioCtx);
SoundUtils.loadAll(Model.Lead.sounds, audioCtx);
var KeyCodes;
(function (KeyCodes) {
    KeyCodes[KeyCodes["UNDO"] = 32] = "UNDO";
    KeyCodes[KeyCodes["LEFT"] = 37] = "LEFT";
    KeyCodes[KeyCodes["RIGHT"] = 39] = "RIGHT";
    KeyCodes[KeyCodes["UP"] = 38] = "UP";
    KeyCodes[KeyCodes["DOWN"] = 40] = "DOWN";
    KeyCodes[KeyCodes["DEC_BPM"] = 188] = "DEC_BPM";
    KeyCodes[KeyCodes["INC_BPM"] = 190] = "INC_BPM";
})(KeyCodes || (KeyCodes = {}));
var resetControls = function (t) {
    volume.setValue(t.sounds[0].gain);
    lowpass.setValue(t.sounds[0].lp_filter);
    panner.setValue(t.sounds[0].pan);
};
var setVolume = function () {
    var v = volume.getValue();
    for (var _i = 0, _a = currentInstrument.type.sounds; _i < _a.length; _i++) {
        var s = _a[_i];
        s.gain = v;
    }
    SoundUtils.loadAll(currentInstrument.type.sounds, SoundUtils.audioCtx);
};
var setFilter = function () {
    var f = lowpass.getValue();
    for (var _i = 0, _a = currentInstrument.type.sounds; _i < _a.length; _i++) {
        var s = _a[_i];
        s.lp_filter = f;
    }
    SoundUtils.loadAll(currentInstrument.type.sounds, SoundUtils.audioCtx);
};
var setPanner = function () {
    var p = panner.getValue();
    for (var _i = 0, _a = currentInstrument.type.sounds; _i < _a.length; _i++) {
        var s = _a[_i];
        s.pan = p;
    }
    SoundUtils.loadAll(currentInstrument.type.sounds, SoundUtils.audioCtx);
};
$("#volume").on("change", setVolume);
$("#lowpass").on("change", setFilter);
$("#pan").on("change", setPanner);
var genNewNote = function (event) {
    var canvas_p = new Utils.Point(event.pageX, event.pageY);
    var r = new Model.Repeater(currentInstrument.type, canvas_p, currentInstrument.bar, TIME_SIG, bpm);
    animArray.addNote(r);
    scheduler.add(r);
};
canvas.addEventListener("mouseup", genNewNote, false);
var keyPressed = function (event) {
    var code = event.keyCode;
    switch (code) {
        case KeyCodes.UNDO:
            animArray.removeNote();
            break;
        case KeyCodes.LEFT:
            if (currentInstrument.id > 0) {
                currentInstrument = Model.ITypes[currentInstrument.id - 1];
                var t = currentInstrument.type;
                resetControls(t);
            }
            break;
        case KeyCodes.RIGHT:
            if (currentInstrument.id < Model.ITypes.length - 1) {
                currentInstrument = Model.ITypes[currentInstrument.id + 1];
                var t = currentInstrument.type;
                resetControls(t);
            }
            break;
        case KeyCodes.UP:
            currentInstrument.bar += 1;
            break;
        case KeyCodes.DOWN:
            if (currentInstrument.bar > 1)
                currentInstrument.bar -= 1;
            break;
        case KeyCodes.DEC_BPM:
            if (bpm > 1)
                bpm -= 1;
            animArray.setBpm(bpm);
            break;
        case KeyCodes.INC_BPM:
            bpm += 1;
            animArray.setBpm(bpm);
    }
};
window.onkeydown = function (e) {
    return !(e.keyCode == 32) && !(e.keyCode == 38) && !(e.keyCode == 40);
};
window.addEventListener("keyup", keyPressed, false);
scheduler.run();
View.start();
