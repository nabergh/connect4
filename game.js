var player1 = {
	playerNumber: 1,
	color: 'black'
};
var player2 = {
	playerNumber: 2,
	color: 'gray'
};
var currentPlayer = this.player1;

var Game = {
	numRows: 6,
	numCols: 7,

	p1Threats: [],
	p2Threats: [],

	placePiece: function(col, player) {
		if (!this.currentState)
			this.currentState = Root;
		for (var i = 0; i < this.currentState.board[0].length; i++) {
			if (this.currentState.board[col][i] === 0) {
				var board = copy2DArray(this.currentState.board);
				board[col][i] = player.playerNumber;
				var move = [col, i];
				var child = this.currentState.findChild(move);
				if (child)
					this.currentState = child;
				else {
					this.nextState = new State(board, move, player.playerNumber, this.currentState.p1Threats, this.currentState.p2Threats);//Root.search(board) || 
					this.currentState.children.push(this.nextState);
					this.currentState = this.nextState;
				}
				this.markBoard(i, col, player);
				currentPlayer = currentPlayer == player1 ? player2 : player1;
				return true;
			}
		}
	},

	playBestMove: function() {
		this.currentState.evaluate(0);
		this.placePiece(this.currentState.bestMove, this.currentState.player == 1 ? player2 : player1);
	},

	//returns true if given player has won in given position
	checkWin: function(col, row, playerNumber) {
		for (var xDir = -1; xDir <= 1; xDir++) {
			for (var yDir = -1; yDir <= 0; yDir++) {
				if (xDir === 0 && yDir === 0)
					continue;
				var x = col;
				var y = row;
				//moving to last contiguous player piece
				while (this.isInBounds(x + xDir, y + yDir) && this.grid[x + xDir][y + yDir] == playerNumber) {
					x += xDir;
					y += yDir;
				}
				var i;
				for (i = 0; i < 3 && Game.isInBounds(x - xDir, y - yDir) && Game.grid[x - xDir][y - yDir] == playerNumber; i++) {
					x -= xDir;
					y -= yDir;
				}
				if (i == 3)
					return true;
			}
		}

	},

	updateThreats: function(col, row, playerNumber) {
		//returns number of contiguous player pieces in this direction
		function searchInDirection(x, y, xDir, yDir) {
			if (!Game.isInBounds(x, y) || Game.grid[x][y] != playerNumber)
				return 0;
			return 1 + searchInDirection(x + xDir, y + yDir, xDir, yDir);
		}
		for (var xDir = -1; xDir <= 1; xDir++) {
			for (var yDir = -1; yDir <= 1; yDir++) {
				if (xDir === 0 && yDir === 0)
					continue;
				var x = col;
				var y = row;
				//moving to the first empty space or last contiguous player piece
				while (this.grid[x][y] == playerNumber && this.isInBounds(x + xDir, y + yDir)) {
					x += xDir;
					y += yDir;
				}

				//check to make sure space is possible threat
				if (this.grid[x][y] === 0) {
					var threat = [x, y];
					var playerPieces = searchInDirection(x + xDir, y + yDir, xDir, yDir);
					playerPieces += searchInDirection(x - xDir, y - yDir, -xDir, -yDir);

					if (playerPieces >= 3) {
						console.log(threat);
						if (playerNumber == 1 && this.p1Threats.indexOf(threat) == -1)
							this.p1Threats.push(threat);
						else if (playerNumber == 2 && this.p2Threats.indexOf(threat) == -1)
							this.p2Threats.push(threat);
					}
				}
			}
		}
	},

	isInBounds: function(x, y) {
		return x >= 0 && x < this.numCols && y >= 0 && y < this.numRows;
	},

	//returns the other player's number assuming only a player 1 and player 2 exist
	otherPlayerNo: function(num) {
		return (num + num) % 3;
	},

	markBoard: function(row, col, player) {
		var space = $('tr').eq(this.numRows - row).children().eq(col);
		space.css({
			"background": player.color
		});
	}
};

$('td').mouseenter(function() {
	var topCell = $('tr')[0].children[this.cellIndex];
	$(topCell).css({
		"background": currentPlayer.color
	});
}).mouseleave(function() {
	var topCell = $('tr')[0].children[this.cellIndex];
	$(topCell).css({
		"background": "none"
	});
}).click(function() {
	Game.placePiece(this.cellIndex, currentPlayer);
});

/*$(document).ready(function() {
	Game.init();
});*/