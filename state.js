//board is the current state of the board, move is the move made to get to this state and player is the player that made that move
function State(board, move, player) {
	this.player = player;
	this.board = board;//board.slice(0);
	//this.board[move[0]][move[1]] = player;
	this.move = move;
	if (move && this.checkWin(move[0], move[1]))
		this.value = player == 1 ? -1 : 1; //player 2 wins are assigned value of 1, player 1 wins assigned value of 2
	else if (this.checkDraw()) {
		this.value = 0;
	} else {
		this.valueSeeked = player == 1 ? 1 : -1;
	}
}


State.prototype = {
	board: [],
	value: null,
	valueSeeked: null,
	checkWin: null,
	children: [],
	evaluate: function() {
		console.log("iterate");
		nextPlayer = this.player == 1 ? 2 : 1;
		//creating children out of all possible moves and checking to see if one of them gives the desired result
		for (var i = this.board.length - 1; i >= 0; i--) {
			if (this.board[i][this.board[0].length - 1] === 0) {
				var move = [i, 0];
				while (this.board[i][move[1]])
					move[1]++;
				var board = this.board.slice(0);
				board[move[0]][move[1]] = nextPlayer;
				this.children.push(Root.search(board) || new State(board, move, nextPlayer));
				if (this.children[this.children.length - 1].value == this.valueSeeked) {
					this.value = this.valueSeeked;
					return;
				}
			}
		}
		//evaluating all children and assigning this state's value the min value if it's the opponent's turn or max value if it is the player's turn
		var bestValue = this.valueSeeked * -1;
		for (var i = this.children.length - 1; i >= 0; i--) {
			if (!this.children[i].value())
				this.children[i].evaluate();
			if (this.children[i].value == this.valueSeeked) {
				this.value = this.valueSeeked;
				return;
			}
			bestValue = this.betterValue(this.children[i].value, bestValue);
		}
		this.value = bestValue;
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
		if (valueSeeked == 1) {
			return v1 >= v2 ? v1 : v2;
		} else
			return v1 <= v2 ? v1 : v2;
	},
	search: function(desiredBoard) {
		if (this.board == desiredBoard)
			return this;
		for (var i = this.children.length - 1; i >= 0 && this.children[i]; i--) {
			var child = this.children[i];
			var move = child.move;
			if (desiredBoard[move[0]][move[1]] == child.player)
				child.search(desiredBoard);
		}
	},
	findChild : function(move) {
		for (var i = this.children.length - 1; i >= 0 && this.children[i]; i--) {
			var child = this.children[i];
			if(child.move == move)
				return child;
		}
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
var Root = new State(board, null, 2);