const { MessageEmbed } = require("discord.js")
const Utility = require("./utility.js")

class Info {
    constructor() {}

    getUptime(startTime) {
        const Util = new Utility()
        var current_time = Date.now()
        var uptime = current_time - startTime
        const uptime_embed = new MessageEmbed()
        .setTitle("Uptime")
        .setColor(Util.uptimeGradient(uptime))
        .setDescription(`${Util.millisToReadable((uptime))}`)
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