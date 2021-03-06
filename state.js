var win = Number.MAX_VALUE;
var loss = -Number.MAX_VALUE;
var maxDepth = 5;
var connectN = 3; //number of pieces needed to win minus 1

//board is the current state of the board, move is the move made to get to this state and player is the player that made that move
function State(board, move, player, p1Threats, p2Threats) {
	this.player = player;
	this.board = board;
	this.move = move;
	this.children = [];
	this.p1Threats = p1Threats || [];
	this.p2Threats = p2Threats || [];
	if (move) {
		if (player == 1) {
			if (this.threatIndex(p1Threats) != -1) {
				this.value = loss;
				this.winner = 1;
				return;
			} else if (this.threatIndex(p2Threats) != -1) {
				this.threatRefuted = true;
				p2Threats[this.threatIndex(p2Threats)] = null;
			}
		} else {
			if (this.threatIndex(p2Threats) != -1) {
				this.value = win;
				this.winner = 2;
				return;
			} else if (this.threatIndex(p1Threats) != -1) {
				this.threatRefuted = true;
				p1Threats[this.threatIndex(p1Threats)] = null;
			}
		}
	}
	if (this.checkDraw()) {
		this.value = 0;
		this.winner = 0;
	} else {
		if (move)
			this.updateThreats();
		this.valueSeeked = player == 1 ? win : loss;
	}
}


State.prototype = {
	board: [],
	value: null,
	valueSeeked: null,
	p1Threats: [],
	p2Threats: [],
	bestMove: 0, //the bestMove is only the column in which the player should play 
	evaluate: function(depth) {
		if (this == Root) {
			this.bestMove = Math.floor(Game.numCols / 2);
		} else if (this.value == win || this.value == loss || this.value == 0)
			return;
		else if ((this.value === undefined || this.value === null) && depth == maxDepth) {
			this.staticEval();
		} else {
			nextPlayer = this.player == 1 ? 2 : 1;
			//creating children out of all possible moves and checking to see if one of them has the best possible value
			for (var i = this.board.length - 1; i >= 0; i--) {
				if (this.board[i][this.board[0].length - 1] === 0) {
					var row = 0;
					while (this.board[i][row])
						row++;
					var board = copy2DArray(this.board);
					board[i][row] = nextPlayer;
					this.children.push(new State(board, [i, row], nextPlayer, copy2DArray(this.p1Threats), copy2DArray(this.p2Threats))); //Root.search(board) ||
					if (this.children[this.children.length - 1].value == this.valueSeeked) {
						this.value = this.valueSeeked;
						this.bestMove = i;
						return;
					}
				}
			}
			//evaluating all children and assigning this state's value the min value if it's the opponent's turn or max value if it is the player's turn
			this.value = -this.valueSeeked;
			for (var i = this.children.length - 1; i >= 0; i--) {
				if (this.children[i].value != win && this.children[i].value != loss && this.children[i].value !== 0)
					this.children[i].evaluate(depth + 1);
				if (this.children[i].value == this.valueSeeked) {
					this.value = this.valueSeeked;
					this.bestMove = this.children[i].move[0];
					return;
				} else if (this.children[i].threatRefuted) { //ensures threats are refuted even if the AI will lose eventually
					this.value = this.children[i].value;
					this.bestMove = this.children[i].move[0];
					return;
				} else if (this.isBetter(this.children[i].value, this.value)) {
					this.value = this.children[i].value;
					this.bestMove = this.children[i].move[0];
				}
			}
		}
	},
	staticEval: function() {
		if (this.value === undefined || this.value === null) {
			this.value = 50;
			var goodThreats, badThreats;
			if (this.player == 1) {
				goodThreats = this.p1Threats;
				badThreats = this.p2Threats;
			} else {
				goodThreats = this.p2Threats;
				badThreats = this.p1Threats;
			}
			this.value += goodThreats.length * 10;
			this.value -= badThreats.length * 10;
			//if (this.value == 50) {
			//	this.value += -Math.abs(this.move[0] - Game.numCols / 2) + Game.numCols / 2 + 1;
			//}
		}
	},
	updateThreats: function() {
		var state = this;
		//returns number of contiguous player pieces in this direction
		function searchInDirection(x, y, xDir, yDir) {
			if (!state.isInBounds(x, y) || state.board[x][y] != state.player)
				return 0;
			return 1 + searchInDirection(x + xDir, y + yDir, xDir, yDir);
		}
		var col = this.move[0];
		var row = this.move[1];
		for (var xDir = -1; xDir <= 1; xDir++) {
			for (var yDir = -1; yDir <= 1; yDir++) {
				if (xDir === 0 && yDir === 0)
					continue;
				var x = col;
				var y = row;
				//moving to the first empty space or last contiguous player piece
				while (this.board[x][y] == this.player && this.isInBounds(x + xDir, y + yDir)) {
					x += xDir;
					y += yDir;
				}

				//check to make sure space is possible threat
				if (this.board[x][y] === 0) {
					var threat = [x, y];
					var playerPieces = searchInDirection(x + xDir, y + yDir, xDir, yDir);
					playerPieces += searchInDirection(x - xDir, y - yDir, -xDir, -yDir);

					if (playerPieces >= connectN) {
						if (this.player == 1 && this.threatIndex(this.p1Threats) == -1)
							this.p1Threats.push(threat);
						else if (this.player == 2 && this.threatIndex(this.p2Threats) == -1)
							this.p2Threats.push(threat);
					}
				}
			}
		}
	},
	checkDraw: function() {
		var y = this.board[0].length - 1;
		for (var i = this.board.length - 1; i >= 0; i--) {
			if (this.board[i][y] === 0)
				return false;
		}
		return true;
	},
	isInBounds: function(x, y) {
		return x >= 0 && x < this.board.length && y >= 0 && y < this.board[0].length;
	},
	//true if v1 is better than v2
	isBetter: function(v1, v2) {
		if (this.valueSeeked == win)
			return v1 >= v2; //must be geq otherwise no move is picked in the situation of a loss
		else
			return v1 <= v2;
	},
	search: function(desiredBoard) {
		if (compare2DArray(this.board, desiredBoard))
			return this;
		for (var i = this.children.length - 1; i >= 0 && this.children[i]; i--) {
			var child = this.children[i];
			var move = child.move;
			if (desiredBoard[move[0]][move[1]] == child.player)
				child.search(desiredBoard);
		}
	},
	findChild: function(move) {
		for (var i = this.children.length - 1; i >= 0 && this.children[i]; i--) {
			var child = this.children[i];
			if (child.move[0] == move[0] && child.move[1] == move[1])
				return child;
		}
	},
	threatIndex: function(threats) {
		for (var i = threats.length - 1; i >= 0; i--) {
			if (threats[i] && threats[i][0] == this.move[0] && threats[i][1] == this.move[1])
				return i;
		}
		return -1;
	}
}

function copy2DArray(arr) {
	var copy = [];
	for (var i = 0; i < arr.length; i++) {
		if (arr[i])
			copy.push(arr[i].slice(0));
	}
	return copy;
}

//only works for 2D arrays i.e., must have at least one element that is an array and all elements must be arrays
function compare2DArray(arr1, arr2) {
	if (arr1.length != arr2.length || arr1[0].length != arr2[0].length)
		return false;
	for (var i = arr2.length - 1; i >= 0; i--) {
		for (var j = arr2.length - 1; j >= 0; j--) {
			if (arr2[i][j] != arr1[i][j])
				return false;
		}
	}
	return true;
}