module SoundUtils {

	// go back to figure out compatibility
	//Chrome & FF -> AudioContext() Safari -> webkitAudioContext()
	export var audioCtx = new AudioContext();

	export class Sound {
		constructor(public name: string, public source,
					public gain: number = 1, public lp_filter: number = 14,
					public pan: number = 0) {}
	}

	export function getData(sound: Sound, audioCtx) {
		var source = audioCtx.createBufferSource();
		var request = new XMLHttpRequest();

		request.open('GET', sound.name, true);

		request.responseType = 'arraybuffer';

		request.onload = function() {
			var audioData = request.response;
			audioCtx.decodeAudioData(audioData, function(buffer) {
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
			})
		}
		request.send();

		return source;
	}

	export function loadAll (sounds, audioCtx) {
		for (var sound of sounds) {
			sound.source = getData(sound, audioCtx);
		}
	}

	export function play (sound, when, audioCtx) {
		sound.source.start(when);
		sound.source = getData(sound, audioCtx);
	}
}