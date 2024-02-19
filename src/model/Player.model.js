class Player {
    constructor(id) {
        this.id = id;
        this.role = null;
    }

    constructor(id, role) {
        this.id = id;
        this.role = role;
    }

    setRole(role) {
        this.role = role;
    }
}

module.exports = Player;