const tf = require('@tensorflow/tfjs-node');

const path = require('path');

const getModel = async () => {

	const pathArr = __dirname.split(path.sep);
	let pathStr = "";
	pathArr.forEach((folder) => {
		if(!folder.match(/.:|\//)) {
			pathStr += folder + '/';
		}
	})

	const loadedModel = await tf.loadLayersModel('file:///' + pathStr + 'saved_model/model.json');

	console.log("Loaded model.");

	return loadedModel;
}




module.exports = getModel;