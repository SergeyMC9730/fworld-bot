console.log("I  fworld client")

// include .env file
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const fLoadCommands = require("./fLoadCommands");

const { Client, Events, GatewayIntentBits, Collection, REST, Routes } = require("discord.js");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const rest = new REST().setToken(process.env.bot_token);

client.commands = new Collection();
client.com_info = [];

// try to add loaded commands into current bot context on remote side
async function fTryRegisterCommands() {
	const answer = await rest.put(
		Routes.applicationCommands(process.env.bot_client_id),
		{
			body: client.com_info
		}
	);

	console.log("I  loaded %d commands", client.com_info.length);
}

// this function would be called when discord.js would initialize bot successfully
client.once(Events.ClientReady, readyClient => {
	console.log(`I  logged in as ${readyClient.user.tag}`);
});

// this function would be called on interation creating (running bot commands)
client.on(Events.InteractionCreate, async interaction => {
	// check if command is not an chat input one
	if (!interaction.isChatInputCommand()) return;

	// try to get command from the loaded command list
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		// command cannot be found

		console.warn("W  '%s' cannot be found", interaction.commandName);
		return;
	}

	try {
		// try to execute command
		await command.execute(interaction);
	} catch (error) {
		// error happened. notify user and terminal about it

		console.error(`E  error happened while executing command '${interaction.commandName}': ${error}`)

		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'Не удалось выполнить команду. Попробуйте позже', ephemeral: true });
		} else {
			await interaction.reply({ content: 'Не удалось выполнить команду. Попробуйте позже', ephemeral: true });
		}
	}
});

// initialize commands
fLoadCommands(client);
fTryRegisterCommands();

// login into discord
client.login(process.env.bot_token);

// setup websocket client
const socket_state = require("./websocket");

// setup database instance
const database_state = require("./services/database");