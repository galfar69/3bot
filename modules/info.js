const { MessageEmbed } = require("discord.js")

class Info {
    constructor() {}

    getUptime(startTime) {
        var current_time = Date.now()

        const uptime_embed = new MessageEmbed()
        .setTitle("Uptime")
        .setColor("#1133aa")
        .setDescription(`${millisToReadable((current_time - startTime))}`)
        .setFooter({ text: 'Made by 3b3t community'})
        .setTimestamp()

        return uptime_embed

    }

    // Get the TPS of the server
    getTPS(bot) {
        return bot.getTps()
    }
}

module.exports = Info