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

module Scheduler {

	export class Scheduler {
		public queue: MinHeap;
		public static interval: number = 25; // ms
		public static lookahead: number = 100; //ms
		public keepRunning: boolean = true;

		constructor(heapArray: Model.Repeater[] = []) {
			this.queue = new MinHeap(heapArray);
		}

		add(r: Model.Repeater) {
			this.queue.add(r);
		}

		run() {
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
				setTimeout(function() { self.run() }, Scheduler.interval);
			}
		}

		stop() {
			this.keepRunning = false;
		}
	}

	export class MinHeap {
		public heapArray: Model.Repeater[];
		public heapSize: number = 0;

		constructor(heapArray: Model.Repeater[] = []) {
			this.heapArray = heapArray
			this.heapSize = heapArray.length
			this.buildMinHeap();
		}

		left(index: number) {
			return 2 * index + 1
		}

		right(index: number) {
			return 2 * index + 2
		}

		parent(index: number) {
			return (index % 2 == 0) ? (index - 2) / 2 : (index - 1) / 2;
		}

		add(r: Model.Repeater) {
			this.heapSize = this.heapArray.push(r);
			this.childHeapify(this.heapSize - 1);
		}

		extractMin() {
			[this.heapArray[0], this.heapArray[this.heapSize-1]] = [this.heapArray[this.heapSize-1], this.heapArray[0]];
			var r = this.heapArray.pop();
			this.heapSize -= 1;
			this.rootHeapify(0);
			return r;
		}

		getMin() {
			if (this.heapArray != null && this.heapArray.length > 0) {
				return this.heapArray[0];
			}
			return null;
		}

		rootHeapify(i) {
			// starts from root and works down as needed to re-order heap
			var l = this.left(i);
			var r = this.right(i);

			if (l < this.heapSize && this.heapArray[l].nextExec < this.heapArray[i].nextExec) {
				var smallest = l;
			}
			else { smallest = i; }

			if (r < this.heapSize &&
				this.heapArray[r].nextExec < this.heapArray[i].nextExec &&
				this.heapArray[r].nextExec < this.heapArray[l].nextExec) {
				var smallest = r;
			}

			if (smallest != i) {
				[this.heapArray[i], this.heapArray[smallest]] = [this.heapArray[smallest], this.heapArray[i]];
				this.rootHeapify(smallest);
			}
		}

		childHeapify(i) {
			// starts from child and works up as needed to re-order heap
			var parent = this.parent(i);
			if (parent >= 0 && this.heapArray[parent].nextExec > this.heapArray[i].nextExec) {
				[this.heapArray[parent], this.heapArray[i]] = [this.heapArray[i], this.heapArray[parent]];
				this.childHeapify(parent);
			}
		}

		buildMinHeap() {
			for (var i = Math.floor(this.heapSize / 2) - 1; i >= 0; i--) {
				this.rootHeapify(i);
			}
		}
	}
}