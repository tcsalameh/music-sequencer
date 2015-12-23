/// <reference path="model.ts" />

// When instantiated, every instrument object also sets 
// when it will play next.

// Then, it gets pushed onto a minHeap
// the minHeap is keyed by the value of when each object will play next
// The scheduler 

module Scheduler {

	export class Scheduler {
		public queue: MinHeap;
		public static interval: number = 25;
		public static lookahead: number = 100;
		public keepRunning: boolean = true;

		constructor(heapArray: Model.Repeater[] = []) {
			this.queue = new MinHeap(heapArray);
		}

		run() {
			if (this.keepRunning) {
				while (this.queue.heapSize > 0 && 
					   this.queue.getMin().nextExec < currentTime + Scheduler.lookahead) { 
					//compare next exec to current time and lookahead
					if (this.queue.getMin().doSchedule) {
						var r = this.queue.getMin();
						r.schedule(); // current time needed, also knows about next exec
						this.queue.heapify();
					}
					else {
						this.queue.extractMin();
					}
				}
				setTimeout(function() { this.run() }, Scheduler.interval);
			}
		}

		stop() {
			this.keepRunning = false;
		}
	}

	class MinHeap {
		public heapArray: Model.Repeater[];
		public heapSize: number = 0;

		constructor(heapArray: Model.Repeater[] = []) {
			this.heapArray = heapArray
			this.heapSize = heapArray.length
		}

		add(i: Model.Repeater) {
			
		}

		left(index: number) {
			return 2*index + 1
		}

		right(index: number) {
			return 2 * index + 2
		}

		extractMin() {

		}

		getMin() {
			if (this.heapArray != null && this.heapArray.length > 0) {
				return this.heapArray[0];
			}
			return null;
		}

		heapify() {

		}

		repair() {

		}
	}
}