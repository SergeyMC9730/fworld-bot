const { SlashCommandBuilder, Interaction, PermissionFlagsBits } = require("discord.js");
const AccessKey = require("../access_key");
const database_state = require("../database");
const socket_state = require("../websocket");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("key")
		.setDescription("Выполняет поиск игрока по одноразовому коду и добавляет данного игрока в вайтлист")
        .addStringOption(option => option.setName('key').setDescription('Код').setRequired(true)),
	/**
	 * execute command
	 * @param {Interaction} interaction 
	 */
	async execute(interaction) {
        // get key id
        const key_id = interaction.options.getString("key");
        
        // try to find key
        const key_instance = await database_state.try_find_key(key_id);

        // check if key has been found
        if (key_instance != null) {
            socket_state.add_player_to_whitelist(key_instance.get_player());
            database_state.delete_access_key(key_id);

            await interaction.reply({content: `**Вы (\`${key_instance.get_player()}\`) были успешно добавлены в вайтлист** :tada:`, ephemeral: true});
        } else {
            await interaction.reply({content: ":warning: К сожалению, код либо не существует, либо был уже использован", ephemeral: true});
        }
	}
};