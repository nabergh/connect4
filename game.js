var player1 = {
		playerNumber : 1,
		color: 'black'
};
var player2 = {
		playerNumber : 2,
		color: 'gray'
};
var currentPlayer = this.player1;

var Board = {
	numRows : 6,
	numCols : 7,
	grid : [],

	//inits grid to 2d array with all 0s
	init : function() {
		var cols = this.numCols;
		while(cols--) {
			var row = [];
			var rows = this.numRows;
			while(rows--)
				row.push(0);
			this.grid.push(row);
		}
	},

	p1Threats : [],
	p2Threats : [],

	placePiece : function(col, player) {
		for (var i = 0; i < this.grid[0].length; i++) {
			if(this.grid[col][i] === 0) {
				this.grid[col][i] = player.playerNumber;
				var space = [col, i];
				/*if(player.playerNumber == 1) {
					if(this.p1Threats.indexOf(space) != -1)
						alert('Player 1 wins!');
				} else {
					if(this.p2Threats.indexOf(space) != -1)
						alert('Player 2 wins!');
				}*/
				this.updateThreats(i, col, player.playerNumber);
				this.markBoard(i, col, player);
				return true;
			}
		}
	},

	updateThreats : function(row, col, playerNumber) {
		//returns number of contiguous player pieces in this direction
		function searchInDirection(x, y, xDir, yDir) {
			if(!Board.isInBounds(x, y) || Board.grid[x][y] != playerNumber)
				return 0;
			return 1 + searchInDirection(x + xDir, y + yDir, xDir, yDir);
		}
		for (var xDir = -1; xDir <= 1; xDir++) {
			for (var yDir = -1; yDir <= 1; yDir++) {
				if(xDir === 0 && yDir === 0)
					continue;
				var x = col;
				var y = row;
				//moving to the first empty space or last contiguous player piece
				while (this.grid[x][y] == playerNumber && this.isInBounds(x + xDir, y + yDir)) {
					x += xDir;
					y += yDir;
				}
				
				//check to make sure spaceis possible threat
				if(this.grid[x][y] === 0) {
					var threat = [x, y];
					var playerPieces = searchInDirection(x + xDir, y + yDir, xDir, yDir);
					playerPieces += searchInDirection(x - xDir, y - yDir, -xDir, -yDir);
				
					if(playerPieces >= 3) {
						console.log(threat);
						if(playerNumber == 1 && this.p1Threats.indexOf(threat) == -1)
							this.p1Threats.push(threat);
						else if (playerNumber == 2 && this.p2Threats.indexOf(threat) == -1)
							this.p2Threats.push(threat);
					}
				}
			}
		}
	},

	isInBounds : function(x,y) {
		return x >= 0 && x < this.numCols && y >= 0 && y < this.numRows;
	},

	//returns the other player's number assuming only a player 1 and player 2 exist
	otherPlayerNo : function(num) {
		return (num + num) % 3;
	},

	markBoard : function(row, col, player) {
		var space = $('tr').eq(this.numRows - row).children().eq(col);
		space.css({"background": player.color});
	}
};

$('td').mouseenter(function() {
	var topCell = $('tr')[0].children[this.cellIndex];
	$(topCell).css({"background": currentPlayer.color});
}).mouseleave(function() {
	var topCell = $('tr')[0].children[this.cellIndex];
	$(topCell).css({"background": "none"});
}).click(function() {
	Board.placePiece(this.cellIndex, currentPlayer);
	currentPlayer = currentPlayer == player1 ? player2 : player1;
});

$(document).ready(function() {
	Board.init();
});