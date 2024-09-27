const { Collection, Client } = require("discord.js");
const fs = require("fs");
const path = require("path");

/**
 * try to load .js files from 'commands' folder
 * @param {Client} client 
 */
function fLoadCommands(client) {
    // validate client, client.commands and client.com_info variables
    if (!(client) instanceof Client) return;
    if (!(client.commands instanceof Collection)) return;
    if (!(client.com_info instanceof Object)) return;

    const fpath = path.join(__dirname, "commands");
    // read contents of __dirname/command folder
    const folder = fs.readdirSync(fpath);

    for (const entry of folder) {
        // get path for a file inside command folder
        const file_path = path.join(fpath, entry);
        // open it
        const command_info = require(file_path);
        
        // check if this file is a slash command
        if ("data" in command_info && "execute" in command_info) {
            client.commands.set(command_info.data.name, command_info);
            client.com_info.push(command_info.data.toJSON());
        }
    }
}

module.exports = fLoadCommands;