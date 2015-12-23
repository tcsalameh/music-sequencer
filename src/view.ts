/// <reference path="model.ts" />
/// <reference path="controller.ts" />
module View {

	export function anim(insts, ctx) {
		ctx.fillStyle = "#000000";
		ctx.fillRect(0, 0, 700, 700);
		for (var i of insts) {
			i.move();
			i.draw();
		}
		drawMessages(TIME_SIG, bpm, currentInstrument.bar, currentInstrument.label, ctx)
		var timer = setTimeout(function() { anim(insts, ctx) }, 45)
	}

	export function start() {
		var timer = setTimeout(function() { anim(control.notes, ctx) }, 45)
	}

	export function drawMessages(timesig, bpm, bar, cur_inst, ctx) {
		ctx.font = "12px sans-serif";
		ctx.fillStyle = "#FFFFFF";
		ctx.fillText(timesig.num + "/" + timesig.denom, 5, 15);
		ctx.fillText(bpm + " BPM", 25, 15);
		var barIndic;
		if (bar > 1) {
			barIndic = " bars";
		}
		else {
			barIndic = " bar"
		}
		ctx.fillText(bar + barIndic, 80, 15);
		ctx.font = "18px sans-serif";
		ctx.fillText(cur_inst, 300, 20);
	}



}