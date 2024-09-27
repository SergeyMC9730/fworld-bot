class AccessKey {
    #player = "";
    #key = "";

    constructor(player) {
        this.set_player(player);
        this.#generate_key();
    }

    #generate_key() {
        this.#key = `${Math.floor(Math.random() * 9999)}`;
    }

    get_player() {
        return this.#player;
    }
    get_key() {
        return this.#key
    }

    set_player(player) {
        this.#player = player;
    }
    set_key(key) {
        this.#key = key;
    }
}

module.exports = AccessKey;