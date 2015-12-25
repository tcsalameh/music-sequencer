module SoundUtils {
	
	// go back to figure out compatibility
	export var audioCtx = new AudioContext();

	export class Sound {
		constructor(public name: string, public source) {}
	}

	export function getData(url: string, audioCtx) {
		var source = audioCtx.createBufferSource();
		var request = new XMLHttpRequest();

		request.open('GET', url, true);

		request.responseType = 'arraybuffer';

		request.onload = function() {
			var audioData = request.response;
			audioCtx.decodeAudioData(audioData, function(buffer) {
				source.buffer = buffer;
				source.connect(audioCtx.destination);
			})
		}
		request.send();

		return source;
	}

	export function loadAll (sounds, audioCtx) {
		for (var sound of sounds) {
			sound.source = getData(sound.name, audioCtx);
		}
	}

	export function play (sound, when, audioCtx) {
		sound.source.start(when);
		sound.source = getData(sound.name, audioCtx);
	}
}