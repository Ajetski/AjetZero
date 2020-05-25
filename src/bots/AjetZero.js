const ChessUtils = require("../utils/ChessUtils");
const tf = require('@tensorflow/tfjs-node');


class AjetZero {

  getNextMove(moves, modelPromise, color) {
	  //REDO THIS, including Neural Net
    const chess = new ChessUtils();
	chess.applyMoves(moves);
	
	const legalMoves = chess.legalMoves();

	let maxWinPercentage = 0.0;
	let bestMove = legalMoves[0];

	legalMoves.forEach((move) => {
		if(move.san.match(/#/)){
			bestMove = move;
			maxWinPercentage = 1.0;
		}

		chess.applyMove(move);
		
		let winPercentage;
		modelPromise.then((model) => {
			winPercentage = model.predict(tf.tensor4d([chess.to3dArray(color)])).arraySync()[0][0];
		});

		if(maxWinPercentage < winPercentage){
			bestMove = move;
			maxWinPercent = winPercentage;
		}
		chess.undo();
	});

	console.log("MOVE: ", bestMove);

	return chess.uci(bestMove);
	
  }

  getReply(chat) {
    return "hi";
  }

}

module.exports = AjetZero;