require("dotenv").config();
const ws = require("ws");

console.log("I  connecting to server's websocket instance");

const server_instance = new ws.WebSocket(`ws://${process.env.socket_ip}`);
let server_instance_ready = false;

// --------- WEBSOCKET FUNCTIONS --------- 

/**
 * send json data to the server
 * @param {Object} json_data 
 */
function send_json_string(json_data) {
    const data = JSON.stringify(json_data);
    const printable_data = data.replace(process.env.socket_key, "HIDDEN");

    console.log("D  sending '%s' to the websocket server", printable_data);

    server_instance.send(data);
}

/**
 * send connection key to the server. this is required for executing commands with administrative priviliges
 */
function send_key() {
    if (!server_instance_ready) {
        console.error("E  server is not ready yet to send commands");
        return;
    }

    console.log("I  connection succeded. sending connection key");

    // construct message that gonna be sent to the server
    const packet = {
        "type": "sendKey",
        "userKey": `${process.env.socket_key}`
    };

    // send message
    send_json_string(packet);
}

/**
 * add player to whitelist
 * @param {String} player_name
 */
function add_player_to_whitelist(player_name) {
    console.log("I  adding player '%s'", player_name);

    // construct message that gonna be sent to the server
    const packet = {
        "type": "whitelistSet",
        "key": `${process.env.socket_key}`,
        "playerName": `${player_name}`,
        "whitelistFlag": true
    };

    // send message
    send_json_string(packet);
}

// --------- WEBSOCKET EVENTS --------- 

server_instance.on('error', (error) => {
    console.error("E  websocket error: " + error)
    server_instance_ready = false;
});

server_instance.on('open', () => {
    // set success flag
    server_instance_ready = true;

    // we would try to send connection key right after connecting to the websocket server
    send_key();
});

server_instance.on('close', () => {
    // this instance cannot be used now
    server_instance_ready = false;

    console.warn("W  websocket server closed connection");
});

server_instance.on('message', (data) => {
    console.log("D  websocket response: " + data.toString("utf-8"))
});

// --------- WEBSOCKET EXPORTS --------- 

module.exports = {
    add_player_to_whitelist: add_player_to_whitelist,
    server_instance_ready: server_instance_ready
};