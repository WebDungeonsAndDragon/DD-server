class Room {
  constructor(id, host) {
    this.id = id;
    this.players = [host];
  }

  addPlayer(player) {
    this.players.push(player);
  }

  removePlayer(player) {
    this.players = this.players.filter((p) => player.id !== p.id);
  }
}

module.exports = Room;
