const tf = require('@tensorflow/tfjs-node');

const model = tf.sequential();

model.add(tf.layers.conv2d({
	inputShape: [8, 8, 1],
	filters: 256,
	kernelSize: 3,
	activation: 'relu'
}));

model.add(tf.layers.maxPooling2d({
	poolSize: 3
}));

model.add(tf.layers.conv2d({
	filters: 256,
	kernelSize: 3,
	activation: 'relu'
}));

model.add(tf.layers.maxPooling2d({
	poolSize: 3
}));

model.add(tf.layers.flatten());

model.add(tf.layers.dense({
	activation: 'relu',
	units: 73
}));

model.add(tf.layers.dense({
	activation: 'relu',
	units: 73
}));

model.add(tf.layers.dropout({
	rate: .01
}))

model.add(tf.layers.dense({
	activation: 'softmax',
	units: 3
}));

model.compile({optimizer: tf.train.adamax(.01), loss: 'categoricalCrossentropy'});

model.save('file:///Users/Ajet/Desktop/AjetZero/src/model/saved_model');