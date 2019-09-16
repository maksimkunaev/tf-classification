const debounce = function(cb, delay = 1000) {
	let startTime = Date.now();

	return function() {
		let time = Date.now() - startTime;

		if (time < delay) return;
		cb();
		startTime = Date.now();
	}
}

export default {
	debounce,
}
