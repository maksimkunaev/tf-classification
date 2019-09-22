const tf = require('@tensorflow/tfjs');
// require('@tensorflow/tfjs-node');
const epochs = 3;
const NUM_OUTPUT_CLASSES = 6;
const model = getModel();
let isLearned = false;
window.tf = tf;
function getModel() {
  const model = tf.sequential();
  
  const IMAGE_WIDTH = 28;
  const IMAGE_HEIGHT = 28;
  const IMAGE_CHANNELS = 1;  
  
  model.add(tf.layers.conv2d({
    inputShape: [IMAGE_WIDTH, IMAGE_HEIGHT, IMAGE_CHANNELS],
    kernelSize: 5,
    filters: 8,
    strides: 1,
    activation: 'relu',
    kernelInitializer: 'varianceScaling'
  }));

  model.add(tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2]}));
  
  model.add(tf.layers.conv2d({
    kernelSize: 5,
    filters: 16,
    strides: 1,
    activation: 'relu',
    kernelInitializer: 'varianceScaling'
  }));
  model.add(tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2]}));
  
  model.add(tf.layers.flatten());

  model.add(tf.layers.dense({
    units: NUM_OUTPUT_CLASSES,
    kernelInitializer: 'varianceScaling',
    activation: 'softmax'
  }));

  const optimizer = tf.train.adam();
  model.compile({
    optimizer: optimizer,
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  });

  // window.model = model;
  return model;
}

function getData(data) {
  const IMAGE_SIZE = 784;

  const batchImagesArray = data.xs;
  const batchLabelsArray = data.labels;

  const batchSize = data.train_data_size;
  const xs = tf.tensor2d(batchImagesArray, [batchSize, IMAGE_SIZE]);
  const labels = tf.tensor2d(batchLabelsArray, [batchSize, NUM_OUTPUT_CLASSES]);

  return {
    xs,
    labels,
  };
}

const defaultSettings = {
  epochs: 10,
  callbacks: {},
}

function train(data, settings = defaultSettings) {
  const { epochs, callbacks: defaultCallbacks } = settings;
  const { onTrainBegin, onEpochEnd, onTrainEnd } = defaultCallbacks;

  const metrics = ['loss', 'val_loss', 'acc', 'val_acc'];
  const container = {
    name: 'Model Training', styles: { height: '1000px' }
  };

  const callbacks = {
      onTrainBegin: () => { if (onTrainBegin) onTrainBegin() },
      onEpochEnd: (epoch, log) => {
          if (onEpochEnd) onEpochEnd(epoch, log.loss)
      },
      onTrainEnd: () => {
          if (onTrainEnd) onTrainEnd()
          isLearned = true;
      }
  };

  const BATCH_SIZE = 512;
  const TRAIN_DATA_SIZE = data.train_data_size;
  
  const [trainXs, trainYs] = tf.tidy(() => {
    const d = getData(data);
    return [
      d.xs.reshape([TRAIN_DATA_SIZE, 28, 28, 1]),
      d.labels
    ];
  });
  console.log(111 ,epochs);
  return model.fit(trainXs, trainYs, {
    batchSize: BATCH_SIZE,
    epochs,
    shuffle: true,
    callbacks
  });
}

function predictOne(data) {
  if (!isLearned) {
    return {
      error: `Model is not trained!`,
      index: '',
      probability: 0
    }
  }
  const IMAGE_WIDTH = 28;
  const IMAGE_HEIGHT = 28;
  const testData = tf.tensor2d(data, [784, 1]);
  const testxs = testData.reshape([1, IMAGE_WIDTH, IMAGE_HEIGHT, 1]);
  const prediction = model.predict(testxs);

  let maxProbabilityResults = prediction.dataSync();
  const index = prediction.argMax(-1).dataSync()[0];
  let probability = maxProbabilityResults[index] * 100;

  // prediction.print();
  testxs.dispose();
  return {
    index,
    probability
  }
}

export default {
  predictOne,
  train
}


