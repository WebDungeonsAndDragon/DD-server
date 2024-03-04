class Room {
  constructor(id, host) {
    this.id = id;
    this.players = [host];
    this.gameEnded = false;
  }

  addPlayer(player) {
    this.players.push(player);
  }

  removePlayer(player) {
    this.players = this.players.filter((p) => player.id !== p.id);
  }

  updateCurrentPlayerTurn() {
    this.currentPlayerTurn = (this.currentPlayerTurn + 1) % this.players.length;
    //if the counting is 1 above, then round number 0 might be an edge case.
    if (this.currentPlayerTurn == 0) {
      this.updateRoundNumber();
    }
  }

  endGame() {
    this.gameEnded = true;
  }
}

module.exports = Room;
