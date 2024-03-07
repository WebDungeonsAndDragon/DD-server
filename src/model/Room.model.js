class Room {
  constructor(id, host) {
    this.id = id;
    this.players = [host];
    this.gameEnded = false;
    this.totalRounds = -1;
    this.currentRoundNumber = -1;
    this.currentPlayerTurn = -1;
    this.context = "";
  }

  getPlayer(id) {
    return this.players.find((player) => player.id === id);
  }

  addPlayer(player) {
    this.players.push(player);
  }

  removePlayer(id) {
    this.players = this.players.filter((p) => id !== p.id);
    console.log(this.players);
  }

  updateCurrentPlayerTurn() {
    this.currentPlayerTurn = (this.currentPlayerTurn + 1) % this.players.length;
    //if the counting is 1 above, then round number 0 might be an edge case.
    if (this.currentPlayerTurn == 0) {
      // this.updateRoundNumber();
      return true;
    }
    return false;
  }

  endGame() {
    this.gameEnded = true;
  }

  startGame(totalRounds, roles) {
    this.totalRounds = totalRounds;
    this.roundNumber = 0;
    this.currentPlayerTurn = 0;
    this.updateRoles(roles);
  }

  updateRoundNumber() {
    this.roundNumber += 1;
  }

  updateRoles(roles) {
    for (let i = 0; i < this.players.length; i++) {
      this.players[i].setRole(roles[i]);
    }
  }
}

module.exports = Room;
