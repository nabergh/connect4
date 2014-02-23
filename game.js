var player1 = {
	playerNumber: 1,
	color: 'black'
};
var player2 = {
	playerNumber: 2,
	color: 'red'
};
var currentPlayer = this.player1;

var Game = {
	numRows: 6,
	numCols: 7,

	placePiece: function(col, player) {
		for (var i = 0; i < this.currentState.board[0].length; i++) {
			if (this.currentState.board[col][i] === 0) {
				var board = copy2DArray(this.currentState.board);
				board[col][i] = player.playerNumber;
				var move = [col, i];
				var child = this.currentState.findChild(move);
				if (child)
					this.currentState = child;
				else {
					this.nextState = new State(board, move, player.playerNumber, this.currentState.p1Threats, this.currentState.p2Threats); //Root.search(board) || 
					this.currentState.children.push(this.nextState);
					this.currentState = this.nextState;
				}
				if (this.currentState.winner == 2) {
					$('#p2-wins').show();
					Game.end();
				} else if (this.currentState.winner == 1) {
					$('#p1-wins').show();
					Game.end();
				} else if (this.currentState.winner == 0) {
					$('#draw').show();
					Game.end();
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

	markBoard: function(row, col, player) {
		var space = $('tr').eq(this.numRows - row).children().eq(col);
		space.css({
			"background": player.color
		});
	},

	end: function() {
		$('td').off();
		Game.isOver = true;
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
	if(Game.placePiece(this.cellIndex, currentPlayer))
		if(!Game.isOver && currentPlayer == player2)
			Game.playBestMove();
});