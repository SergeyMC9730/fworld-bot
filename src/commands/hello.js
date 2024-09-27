const { SlashCommandBuilder, Interaction } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("hello")
		.setDescription("привет"),
	/**
	 * execute command
	 * @param {Interaction} interaction 
	 */
	async execute(interaction) {
		await interaction.reply("привет мир");
	}
};