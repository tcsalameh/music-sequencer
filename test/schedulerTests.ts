/// <reference path="../src/scheduler.ts" />
/// <reference path="../src/model.ts" />
/// <reference path="test.ts" />
/// <reference path="../src/soundUtils.ts" />

// How to test the scheduler:
	// make a bunch of objects that behave like repeaters
	// actual repeater objects require a window and a graphics and audio context
	// so using those wouldn't work as well unless I make a page for testing
	// and it would be hard to tell what is going on anyway

// Few different checks:
	// Can I instantiate an empty MinHeap and add objects to it?
	// Can I instantiate a MinHeap from an existing array of objects?
	// In both cases, is it ordered correctly?
	// Can I extract objects and will it maintain ordering?
	// Can I change an object's nextExec, and after rootHeapify ordering is maintained?

	//constructor
	//left
	//right
	//parent
	//add
	//extractMin
	//getMin
	//rootHeapify
	//childHeapify
	//buildMinHeap

// Finally
	// Is the scheduler accurate?
	// For this I could do a couple things:
		// Log to console every time Model.Repeaters "play"
		// Have the test repeaters draw something on a coordinate system
		// according to when they are next scheduled to "play"
		// and observe if there's any drift between rounds

		// make sure to check what happens with changing tempos
		// make sure to test stop function as well

SoundUtils.loadAll(Model.Keys.sounds, SoundUtils.audioCtx);
SoundUtils.loadAll(Model.Bass.sounds, SoundUtils.audioCtx);
SoundUtils.loadAll(Model.Percussion.sounds, SoundUtils.audioCtx);
SoundUtils.loadAll(Model.Strings.sounds, SoundUtils.audioCtx);
SoundUtils.loadAll(Model.Lead.sounds, SoundUtils.audioCtx);

var p = new Utils.Point(0, 0);
var ts = new Model.TimeSignature(4, 4);

var r1 = new Model.Repeater(Model.Keys, p, 1, ts, 110);
var r2 = new Model.Repeater(Model.Percussion, p, 2, ts, 110);
var r3 = new Model.Repeater(Model.Keys, p, 3, ts, 110);
var r4 = new Model.Repeater(Model.Keys, p, 4, ts, 110);

// "heaps" for testing

var heapArr1 = [r2,r4,r3,r1];

var minheap1 = new Scheduler.MinHeap(this.heapArr1);

// test whether first element is min
var t1 = new Test.Test("First is Min", (r1 == minheap1.getMin()), "Success!");

var m = minheap1.extractMin();

// extract min gets the min
var t2 = new Test.Test("Extract Min gets Min", (r1 == m), "Success!");

// heap is still properly ordered (min at front)
var t3 = new Test.Test("Heap ordered after extract", (r2 == minheap1.getMin()), "Success!");

// when we add a new element we still get the right heap order
minheap1.add(r1);
var t4 = new Test.Test("Heap ordered after add", (r1 == minheap1.getMin()), "Success!");

// when we change an element's key, and then call rootHeapify on it, the order is adjusted
r1.schedule();
minheap1.rootHeapify(0);
var t5 = new Test.Test("Heap ordered after key increase", (r1 == minheap1.getMin() || r2 == minheap1.getMin()), "Success!");
r1.schedule();
minheap1.rootHeapify(0);
var t6 = new Test.Test("Heap ordered after key increase 2", (r2 == minheap1.getMin()), "Success!");

Test.printTests();





