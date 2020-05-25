tf = require('@tensorflow/tfjs-node');

// Define input, which has a size of 5 (not including batch dimension).
const input = tf.input({shape: [8, 8]});

const flattenLayer = tf.layers.flatten();

let output = flattenLayer.apply(input);

output = tf.layers.conv2d(
	{
		kernelSize: 3,
		filters: 256,
		strides: 3,
		activation: 'relu'
	}
).apply(output);

output = output.apply(tf.layers.maxPooling2d(
	{
		strides: 3
	}
));

output = output.apply(tf.layers.conv2d(
	{
		kernelSize: 3,
		filters: 256,
		strides: 3,
		activation: 'relu'
	}
));

output = output.apply(tf.layers.maxPooling2d(
	{
		strides: 3
	}
));

output = output.apply(tf.layers.conv2d(
	{
		kernelSize: 3,
		filters: 256,
		strides: 3,
		activation: 'relu'
	}
));


output = output.apply(tf.layers.maxPooling2d(
	{
		strides: 3
	}
));

const denseLayer1 = tf.layers.dense(
	{
		units: 73,
		activation: 'relu'
	}
);

output = output.apply(tf.layers.dense(
	{
		units: 73,
		activation: 'relu'
	}
));

output = output.apply(tf.layers.dropout(
	{
		rate: .01
	}
));

output = output.apply(tf.layers.dense(
	{
		units: 3,
		activation: 'softmax'
	}
));



// Create the model based on the inputs.
const model = tf.model({inputs: input, outputs: output});

// The model can be used for training, evaluation and prediction.
// For example, the following line runs prediction with the model on
// some fake data.
model.predict(tf.ones([2, 8, 8])).print();