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
				if (!Game.isOver && currentPlayer == player2)
					Game.playBestMove();
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

var Root;

function resetGame() {
	var board = [];
	var cols = Game.numCols;
	while (cols--) {
		var row = [];
		var rows = Game.numRows;
		while (rows--)
			row.push(0);
		board.push(row);
	}
	Root = new State(board, null, 2, [], []);
	Game.currentState = Root;
	currentPlayer = player1;
}

$('#num-cols').val('7');
$('#num-rows').val('6');
$('#num-connect').val('4');

$('button').click(function() {
	var board = $('#board');
	board.empty();
	Game.numCols = parseInt($('#num-cols').val());
	Game.numRows = parseInt($('#num-rows').val());
	connectN = parseInt($('#num-connect').val()) - 1;
	if (connectN <= Game.numRows || connectN <= Game.numCols) {
		if (connectN > 1) {
			maxDepth = Math.max(2, 8 - Math.floor((Game.numCols - 1) / 2));
			board.css('width', 80 * Game.numCols);
			board.css('height', 80 * (Game.numRows + 1));
			var row = $('<tr></tr>');
			for (var i = 0; i < Game.numCols; i++) {
				row.append('<td></td>');
			}
			board.append(row);
			for (var i = 0; i < Game.numRows; i++) {
				var newRow = row.clone();
				board.append(newRow);
			}
			row.attr('id', 'first-row');
			resetGame();
			$('td').mouseover(function() {
				var topCell = $('tr')[0].children[this.cellIndex];
				$(topCell).css({
					"background": currentPlayer.color
				});
			}).mouseout(function() {
				var topCell = $('tr')[0].children[this.cellIndex];
				$(topCell).css({
					"background": "none"
				});
			}).click(function() {
				Game.placePiece(this.cellIndex, currentPlayer);
			});
		}
		else
			alert("You must play a game connecting more than one piece.");
	} else
		alert("You must have a board big enough to connect " + connectN + " pieces!");
});