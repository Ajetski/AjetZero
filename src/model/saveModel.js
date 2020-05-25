const tf = require('@tensorflow/tfjs-node');

const path = require('path');

const saveModel = async (model) => {

	const pathArr = __dirname.split(path.sep);
	let pathStr = "";
	pathArr.forEach((folder) => {
		if(!folder.match(/.:|\//)) {
			pathStr += folder + '/';
		}
	})

	await model.save('file:///' + pathStr + 'saved_model');

	console.log("Saved Model.");
}




module.exports = saveModel;