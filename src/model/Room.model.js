class Room {
  constructor(id, host) {
    this.id = id;
    this.players = [host];
    this.currentPlayerTurn = -1;
  }

  addPlayer(player) {
    this.players.push(player);
  }

  removePlayer(player) {
    this.players = this.players.filter((p) => player.id !== p.id);
  }

  updateCurrentPlayerTurn() {
    this.currentPlayerTurn = (this.currentPlayerTurn + 1) % this.players.length;
  }

  // currentPlayerTurn - Alex


}

module.exports = Room;
