const { SlashCommandBuilder, Interaction, PermissionFlagsBits } = require("discord.js");
const AccessKey = require("../access_key");
const database_state = require("../database");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("generatekey")
		.setDescription("Генерирует одноразовый ключ для добавления человека в вайтлист и не только")
        .addStringOption(option => option.setName('player').setDescription('Имя игрока').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
	/**
	 * execute command
	 * @param {Interaction} interaction 
	 */
	async execute(interaction) {
        // get target player
        const player = interaction.options.getString("player");

        // create key instance
        const code = new AccessKey(player);

        // write key
        database_state.add_access_key(code);

        // send answer
		await interaction.reply(`**Добавлен ключ авторизации для игрока \`${player}\`**: \`${code.get_key()}\``);
	}
};