module Utils {
	export class Dimension {
		constructor(public width: number,
			public height: number) {

		}
	}

	export class Point {
		constructor(public x: number,
			public y: number) {
		}
	}

	export class Color {
		constructor(public r: number,
			public g: number,
			public b: number,
			public a: number) {
		}
	}
}