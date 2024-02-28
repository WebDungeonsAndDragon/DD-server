class Room {
  constructor(id, host) {
    this.id = id;
    this.players = [host];
    this.currentPlayer = -1;
  }

  addPlayer(player) {
    this.players.push(player);
  }

  removePlayer(player) {
    this.players = this.players.filter((p) => player.id !== p.id);
  }

  
}

module.exports = Room;
