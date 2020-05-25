const Chess = require("chess.js").Chess;
const tf = require("@tensorflow/tfjs-node")

/**
 * Wraps chess.js with useful extras.
 */
class ChessUtils {
	constructor(
		fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
	) {
		this.chess = new Chess(fen);
	}

	reset() {
		this.chess.reset();
	}

	applyMoves(moves) {
		moves.forEach((move) => this.chess.move(move, { sloppy: true }));
	}

	applyMove(move) {
		this.chess.move(move, { sloppy: true });
	}

	/**
	 * Convert a chess.js move to a uci move
	 */
	uci(move) {
		return move.from + move.to + (move.flags === "p" ? move.piece : "");
	}

	/**
	 * Legal moves from current position.
	 */
	legalMoves() {
		return this.chess.moves({ verbose: true });
	}

	fen() {
		return this.chess.fen();
	}

	move(move) {
		this.chess.move(move);
	}

	undo() {
		this.chess.undo();
	}

	turn() {
		return this.chess.turn();
	}

	squaresOf(colour) {
		return this.chess.SQUARES.filter((square) => {
			const r = this.chess.get(square);
			return r && r.color === colour;
		});
	}

	squareOfKing() {
		return this.squaresOfPiece(this.chess.turn(), "k");
	}

	squareOfOpponentsKing() {
		return this.squaresOfPiece(this.otherPlayer(this.chess.turn()), "k");
	}

	squaresOfPiece(colour, pieceType) {
		return this.squaresOf(colour).find(
			(square) => this.chess.get(square).type.toLowerCase() === pieceType
		);
	}

	coordinates(square) {
		return {
			x: square.charCodeAt(0) - "a".charCodeAt(0) + 1,
			y: Number(square.substring(1, 2)),
		};
	}

	distance(a, b) {
		return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
	}

	manhattanDistance(a, b) {
		return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
	}

	euclideanDistance(a, b) {
		const dx = a.x - b.x;
		const dy = a.y - b.y;
		return Math.sqrt(dx * dx + dy * dy);
	}

	otherPlayer(colour) {
		return colour === "w" ? "b" : "w";
	}

	pickRandomMove(moves) {
		return this.uci(moves[Math.floor(Math.random() * moves.length)]);
	}

	filterForcing(legalMoves) {
		const mates = legalMoves.filter((move) => /#/.test(move.san));
		return mates.length
			? mates
			: legalMoves.filter((move) => /\+/.test(move.san));
	}

	inCheckmate() {
		return this.chess.in_checkmate();
	}

	inStalemate() {
		return this.chess.in_stalemate();
	}

	materialEval() {
		return this.material("w") - this.material("b");
	}

	material(colour) {
		const valueOf = { p: 1, n: 3, b: 3, r: 6, q: 9, k: 0 };
		return this.squaresOf(colour)
			.map((square) => valueOf[this.chess.get(square).type])
			.reduce((a, b) => a + b);
	}

	to3dArray(color) {
		let fen = this.fen().split(" ")[0].split("");
		let board = [
			[[0], [0], [0], [0], [0], [0], [0], [0]],
			[[0], [0], [0], [0], [0], [0], [0], [0]],
			[[0], [0], [0], [0], [0], [0], [0], [0]],
			[[0], [0], [0], [0], [0], [0], [0], [0]],
			[[0], [0], [0], [0], [0], [0], [0], [0]],
			[[0], [0], [0], [0], [0], [0], [0], [0]],
			[[0], [0], [0], [0], [0], [0], [0], [0]],
			[[0], [0], [0], [0], [0], [0], [0], [0]]
		];

		const whiteMultiplier = color === 'white' ? 1 : -1;
		const blackMultiplier = whiteMultiplier * -1;

		if(color === 'white') {
			fen = fen.reverse();
		}

		let row = 0;
		let col = 0;

		fen.forEach((square) => {
			if('1' <= square[0] <= '9'){ //empty squares
				col += parseInt(square);
			}
			else if(square[0] === 'k') {
				board[row][col++][0] = 10.0 * blackMultiplier;
			}
			else if(square[0] === 'q') {
				board[row][col++][0] = .9 * blackMultiplier;
			}
			else if(square[0] === 'n') {
				board[row][col++][0] = .3 * blackMultiplier;
			}
			else if(square[0] === 'r') {
				board[row][col++][0] = .5 * blackMultiplier;
			}
			else if(square[0] === 'b') {
				board[row][col++][0] = .35 * blackMultiplier;
			}
			else if(square[0] === 'p') {
				board[row][col++][0] = .1 * blackMultiplier;
			}
			else if(square[0] === 'K') {
				board[row][col++][0] = 10.0 * whiteMultiplier;
			}
			else if(square[0] === 'Q') {
				board[row][col++][0] = .9 * whiteMultiplier;
			}
			else if(square[0] === 'N') {
				board[row][col++][0] = .3 * whiteMultiplier;
			}
			else if(square[0] === 'R') {
				board[row][col++][0] = .5 * whiteMultiplier;
			}
			else if(square[0] === 'B') {
				board[row][col++][0] = .35 * whiteMultiplier;
			}
			else if(square[0] === 'P') {
				board[row][col++][0] = .1 * whiteMultiplier;
			}
			else if(square[0] === '/'){
				col = 0;
				++row;
			}
		})
		return board
	}
}



module.exports = ChessUtils;
