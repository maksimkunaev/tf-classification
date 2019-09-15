const tf = require('@tensorflow/tfjs');
// require('@tensorflow/tfjs-node');
const classNames = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const epochs = 190;
const model = getModel();

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

  const NUM_OUTPUT_CLASSES = 10;
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

  return model;
}

function getData(data) {
  const IMAGE_SIZE = 784;
  const NUM_CLASSES = 10;

  const batchImagesArray = data.xs;
  const batchLabelsArray = data.labels;

  console.log(batchImagesArray)
  const batchSize = data.train_data_size;

  console.log('batchSize',batchSize)
  const xs = tf.tensor2d(batchImagesArray, [batchSize, IMAGE_SIZE]);
  const labels = tf.tensor2d(batchLabelsArray, [batchSize, NUM_CLASSES]);

  return {
    xs,
    labels,
  };
}

function train(data) {
  const metrics = ['loss', 'val_loss', 'acc', 'val_acc'];
  const container = {
    name: 'Model Training', styles: { height: '1000px' }
  };

  const callbacks = {
      onTrainBegin: () => console.log('start'),
      onEpochEnd: (epoch, log) => {
          console.log('Epoch', epoch, 'Loss', log.loss);
      },
      onTrainEnd: () => {
          console.log('Training comp');
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

  return model.fit(trainXs, trainYs, {
    batchSize: BATCH_SIZE,
    epochs,
    shuffle: true,
    callbacks
  });
}

function predictOne(data) {
  const IMAGE_WIDTH = 28;
  const IMAGE_HEIGHT = 28;
  const testData = tf.tensor2d(data, [784, 1]);
  const testxs = testData.reshape([1, IMAGE_WIDTH, IMAGE_HEIGHT, 1]);
  const prediction = model.predict(testxs);

  let maxProbabilityResults = prediction.dataSync();
  const index = prediction.argMax(-1).dataSync()[0];
  let maxProbability = maxProbabilityResults[index] * 100;
  const number = classNames[index];
  prediction.print();
  testxs.dispose();
  print(`${number}: ${maxProbability}%`)
  console.log(`\n`)
}

function print(text) {
  const style = ['padding: 1rem;',
      'background: linear-gradient( #403df7, #12981d);',
      'text-shadow: 0 2px orangered;',
      'font: 1.3rem/3 Georgia;',
      'color: white;'].join('');

  console.table( '%c%s', style, text);
}

export default {
  predictOne,
  train,
}


