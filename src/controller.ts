/// <reference path="model.ts" />
/// <reference path="view.ts" />
/// <reference path="utils.ts" />
/// <reference path="soundUtils.ts" />
/// <reference path="scheduler.ts" />
/// <reference path="jquery.d.ts" />

var canvas = <HTMLCanvasElement> document.getElementById("main_view")
var ctx = canvas.getContext("2d")

var audioCtx = new AudioContext();

var TIME_SIG = new Model.TimeSignature(4, 4);
var bpm = 120
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

enum KeyCodes {
	UNDO = 32,
	LEFT = 37,
	RIGHT = 39,
	UP = 38,
	DOWN = 40,
	DEC_BPM = 188,
	INC_BPM = 190
}

var resetControls = function(t) {
	volume.setValue(t.sounds[0].gain);
	lowpass.setValue(t.sounds[0].lp_filter);
	panner.setValue(t.sounds[0].pan);
}

var setVolume = function() {
	var v = volume.getValue();
	for (var s of currentInstrument.type.sounds) {
		s.gain = v;
	}
	SoundUtils.loadAll(currentInstrument.type.sounds, SoundUtils.audioCtx);
}

var setFilter = function() {
	var f = lowpass.getValue();
	for (var s of currentInstrument.type.sounds) {
		s.lp_filter = f;
	}
	SoundUtils.loadAll(currentInstrument.type.sounds, SoundUtils.audioCtx);
}

var setPanner = function() {
	var p = panner.getValue();
	for (var s of currentInstrument.type.sounds) {
		s.pan = p;
	}
	SoundUtils.loadAll(currentInstrument.type.sounds, SoundUtils.audioCtx);
}

$("#volume").on("change", setVolume);
$("#lowpass").on("change", setFilter);
$("#pan").on("change", setPanner);

var genNewNote = function(event: MouseEvent) {
	var canvas_p = new Utils.Point(event.pageX, event.pageY);
	var r = new Model.Repeater(currentInstrument.type,
						 canvas_p,
						 currentInstrument.bar,
						 TIME_SIG,
						 bpm)
	animArray.addNote(r);
	scheduler.add(r);
}

canvas.addEventListener("mouseup", genNewNote, false);

var keyPressed = function(event: KeyboardEvent) {
	var code = event.keyCode;

	switch (code) {
		case KeyCodes.UNDO:
			animArray.removeNote();
			break;
		case KeyCodes.LEFT:
			if (currentInstrument.id > 0) {
				currentInstrument = Model.ITypes[currentInstrument.id - 1];
				var t = currentInstrument.type
				resetControls(t);
			}
			break;
		case KeyCodes.RIGHT:
			if (currentInstrument.id < Model.ITypes.length - 1) {
				currentInstrument = Model.ITypes[currentInstrument.id + 1];
				var t = currentInstrument.type
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
			bpm += 1
			animArray.setBpm(bpm)
	}
}

window.onkeydown = function (e) {
	return !(e.keyCode == 32) && !(e.keyCode == 38) && !(e.keyCode == 40);
}

window.addEventListener("keyup", keyPressed, false);

scheduler.run();
View.start();
