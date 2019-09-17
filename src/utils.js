const debounce = function(cb, delay = 1000) {
	let startTime = Date.now();

	return function() {
		let time = Date.now() - startTime;

		if (time < delay) return;
		cb();
		startTime = Date.now();
	}
}

const fetchData = async (url, PICTIRE_SIZE) => {
	return await fetch(url)
		.then(res => res.json())
		.then(res => {
			const batchImagesArray = new Float32Array(res.train_data_size * PICTIRE_SIZE);
			for (let i = 0; i < res.xs.length; i = i + PICTIRE_SIZE) {
				const image = res.xs.slice(i, i + PICTIRE_SIZE);
				batchImagesArray.set(image, i);
			}

			return {
				...res,
				xs: batchImagesArray,
				labels: Uint8Array.from(res.labels),
			};
		})
};

export default {
	debounce,
	fetchData
}
