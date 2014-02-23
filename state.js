var win = Number.MAX_VALUE;
var loss = -Number.MAX_VALUE;
var maxDepth = 5;

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
				return;
			} else if (this.threatIndex(p2Threats) != -1)
				p2Threats[this.threatIndex(p2Threats)] = null;
		} else {
			if (this.threatIndex(p2Threats) != -1) {
				this.value = win;
				return;
			} else if (this.threatIndex(p1Threats) != -1)
				p1Threats[this.threatIndex(p1Threats)] = null;
		}
	}
	if (this.checkDraw()) {
		this.value = 0;
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
	checkWin: null,
	p1Threats: [],
	p2Threats: [],
	bestMove: [],
	evaluate: function(depth) {
		if (this.value == win || this.value == loss || this.value == 0)
			return;
		else if (!this.value && depth == maxDepth) {
			this.staticEval();
		} else {
			//console.log("iterate");
			nextPlayer = this.player == 1 ? 2 : 1;
			//creating children out of all possible moves and checking to see if one of them has the best possible value
			for (var i = this.board.length - 1; i >= 0; i--) {
				if (this.board[i][this.board[0].length - 1] === 0) {
					var move = [i, 0];
					while (this.board[i][move[1]])
						move[1]++;
					var board = copy2DArray(this.board);
					board[move[0]][move[1]] = nextPlayer;
					this.children.push(new State(board, move, nextPlayer, copy2DArray(this.p1Threats), copy2DArray(this.p2Threats)));//Root.search(board) ||
					if (this.children[this.children.length - 1].value == this.valueSeeked) {
						this.value = this.valueSeeked;
						return;
					}
				}
			}
			//evaluating all children and assigning this state's value the min value if it's the opponent's turn or max value if it is the player's turn
			var bestValue = -this.valueSeeked;
			for (var i = this.children.length - 1; i >= 0; i--) {
				if (!this.children[i].value)
					this.children[i].evaluate(depth + 1);
				if (this.children[i].value == this.valueSeeked) {
					this.value = this.valueSeeked;
					return;
				}
				bestValue = this.betterValue(this.children[i].value, bestValue);
				if (bestValue == this.children[i].value)
					this.bestMove = this.children[i].move[0];
			}
			this.value = bestValue;
		}
	},
	staticEval: function() {
		this.value = 5;
	},
	checkWin: function(col, row) {
		for (var xDir = -1; xDir <= 1; xDir++) {
			for (var yDir = -1; yDir <= 0; yDir++) {
				if (xDir === 0 && yDir === 0)
					continue;
				var x = col;
				var y = row;
				//moving to last contiguous player piece
				while (this.isInBounds(x + xDir, y + yDir) && this.board[x + xDir][y + yDir] == this.player) {
					x += xDir;
					y += yDir;
				}
				var i;
				for (i = 0; i < 3 && this.isInBounds(x - xDir, y - yDir) && this.board[x - xDir][y - yDir] == this.player; i++) {
					x -= xDir;
					y -= yDir;
				}
				if (i == 3)
					return true;
			}
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

					if (playerPieces >= 3) {
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
	//returns the max value if a win for the player is seeked by the player whose turn it is, min value otherwise
	betterValue: function(v1, v2) {
		if (this.valueSeeked == win) {
			return v1 >= v2 ? v1 : v2;
		} else
			return v1 <= v2 ? v1 : v2;
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
			if (child.move == move)
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

var board = [];
var cols = Game.numCols;
while (cols--) {
	var row = [];
	var rows = Game.numRows;
	while (rows--)
		row.push(0);
	board.push(row);
}
var Root = new State(board, null, 2, [], []);

function copy2DArray(arr) {
	var copy = [];
	for (var i = 0; i < arr.length; i++) {
		if (arr[i])
			copy.push(arr[i].slice(0));
	}
	return copy;
}

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