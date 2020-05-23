const ChessUtils = require("../utils/ChessUtils");


class AjetZero {

  getNextMove(moves) {
	  //REDO THIS, including Neural Net
    const chess = new ChessUtils();
	chess.applyMoves(moves);
	
    const legalMoves = chess.legalMoves();
    const forcing = chess.filterForcing(legalMoves);
    const captures = legalMoves.filter(move => /x/.test(move.san));

    if (forcing.length) {
      return chess.pickRandomMove(forcing);
    }

    if (captures.length) {
      return chess.pickRandomMove(captures);
    }

    if (legalMoves.length) {
      return chess.pickRandomMove(legalMoves);
    }
  }

  getReply(chat) {
    return "hi";
  }

}

module.exports = AjetZero;