/**
 * Game subscribes to gameId events and handles them posting moves
 * generated by player object that must implement two methods:
 *
 * getNextMove(array of uciMoves) returns uciMove
 * getReply(chat event) returns chat message
 *
 */
const getModel = require('./model/loadModel');
const saveModel = require('./model/saveModel');
const Chess = require('./utils/ChessUtils');
const tf = require('@tensorflow/tfjs-node');

class Game {
	/**
	 * Initialise with interface to lichess.
	 */
	constructor(api, name, player) {
		this.api = api;
		this.name = name;
		this.player = player;
		this.model = getModel();
	}

	start(gameId) {
		this.gameId = gameId;
		this.api.streamGame(gameId, (event) => this.handler(event));
	}

	handleChatLine(event) {
		if (event.username !== this.name) {
			const reply = this.player.getReply(event);
			if (reply) {
				this.api.chat(this.gameId, event.room, reply);
			}
		}
	}

	handler(event) {
		switch (event.type) {
			case "chatLine":
				this.handleChatLine(event);
				break;
			case "gameFull":
				this.colour = this.playingAs(event);
				this.playNextMove(event.state.moves);
				break;
			case "gameState":
				if (event.status === "started") {
					//if game isn't over, keep playing
					this.playNextMove(event.moves);
				}
				else if(event.winner &&  event.moves != "") {
					const chess = new Chess();
					//if game is over, use game data to improve bot
					const moves = event.moves.split(" ");
					const wonPositions = [];
					const lostPositions = [];
					const won = [];
					const lost = [];
					moves.forEach((move) => {
						chess.applyMove(move);
						wonPositions.push(chess.to3dArray(event.winner));
						won.push([1.0, 0.0, 0.0]);
						lostPositions.push(chess.to3dArray(event.winner === 'white' ? 'black' : 'white'));
						lost.push([0.0, 0.0, 1.0]);
					})

					getModel().then((model) => {
						model.compile({optimizer: tf.train.adamax(.01), loss: 'categoricalCrossentropy'});
						model.fit(tf.tensor4d(wonPositions), tf.tensor2d(won), { epochs: 10 }).then(() => {
							model.fit(tf.tensor4d(lostPositions), tf.tensor2d(lost), { epochs: 10 }).then(() => {
								saveModel(model)
							})
						}).catch((err) => {
							console.log("ERROR: ", err)
						});
					})
					this.api.challengeStockfish(8);
				}
				else if (event.moves != "" && event.status != 'mate' &&  event.status != 'resign') {
					const chess = new Chess();
					//if game is over, use game data to improve bot
					const moves = event.moves.split(" ");
					const drawnPositions = [];
					const drawn = [];
					moves.forEach((move) => {
						chess.applyMove(move);
						drawnPositions.push(chess.to3dArray(event.winner));
						drawn.push([0.0, 1.0, 0.0]);
						drawnPositions.push(chess.to3dArray(event.winner === 'white' ? 'black' : 'white'));
						drawn.push([0.0, 1.0, 0.0]);
					})

					getModel().then((model) => {
						model.compile({optimizer: tf.train.adamax(.01), loss: 'categoricalCrossentropy'});
						model.fit(tf.tensor4d(drawnPositions), tf.tensor2d(drawn), { epochs: 10 }).then( () => {
							saveModel(model)
						});
					});
					this.api.challengeStockfish(8);
				}
				break;
			default:
				console.log("Unhandled game event : " + JSON.stringify(event));
		}
	}

	playNextMove(previousMoves) {
		const moves = previousMoves === "" ? [] : previousMoves.split(" ");
		if (this.isTurn(this.colour, moves)) {
			const nextMove = this.player.getNextMove(moves, this.model, this.colour);
			if (nextMove) {
				console.log(
					this.name + " as " + this.colour + " to move " + nextMove
				);
				this.api.makeMove(this.gameId, nextMove);
			}
		}
	}

	playingAs(event) {
		return event.white.name === this.name ? "white" : "black";
	}

	isTurn(colour, moves) {
		var parity = moves.length % 2;
		return colour === "white" ? parity === 0 : parity === 1;
	}
}

module.exports = Game;
