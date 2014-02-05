
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
		var rows = this.numRows;
		while(rows--) {
			var col = [];
			var cols = this.numCols;
			while(cols--)
				col.push(0);
			this.grid.push(col);
		}
	},

	placePiece : function(col, player) {
		for (var i = 0; i <= this.grid.length - 1; i++) {
			if(this.grid[i][col] === 0) {
				this.grid[i][col] = player.playerNumber;
				this.markBoard(i, col, player);
				return true;
			}
		}
	},

	markBoard : function(row, col, player) {
		var space = $('tr').eq(this.numRows - row).children().eq(col);
		space.css({"background": player.color});
	}
};

$('td').mouseenter(function() {
	var topCell = $('tr')[0].children[this.cellIndex];
	$(topCell).css({"background": "black"});
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