class Player {
    // constructor(id, name) {
    //     this.id = id;
    //     this.name = name;
    //     this.role = null;
    // }

    constructor(id, name, role) {
        this.id = id;
        this.name = name;
        this.role = role;
    }

    setRole(role) {
        this.role = role;
    }
}

module.exports = Player;