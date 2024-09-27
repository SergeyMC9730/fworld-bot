// setup database instance
const database_state = require("./database");

async function a() {
    const thing = await database_state.try_find_key("8726");

    if (thing != null) {
        console.log(`${thing.get_player()}:${thing.get_key()}`);
    }
}

a();