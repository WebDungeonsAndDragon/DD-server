class Room {
  constructor(id, host) {
    this.id = id;
    this.players = [host];
    this.totalRounds = -1;
    this.currentRoundNumber = -1; 
  }

  addPlayer(player) {
    this.players.push(player);
  }

  removePlayer(player) {
    this.players = this.players.filter((p) => player.id !== p.id);
  }

  startGame(totalRounds) {
    this.totalRounds = totalRounds;
    this.roundNumber = 0;
    this.currentPlayerTurn = 0;
  }

  updateRoundNumber() {
    this.roundNumber += 1;
  }


}

module.exports = Room;
