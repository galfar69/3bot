const { createHash } = require('crypto')

class Utility {

    constructor(activityCount = 0) {
        // A variable to sort through all the activities(statuses)
        this.activityCount = activityCount
    }

    hash(string) {
        return createHash('sha256').update(string).digest('hex');
    }
    

    // Updates topic of the channel(parameter 3)
    // Self explanatory code :)
    updateTopic(channel, playerCount, maxPlayers, TPS, Online = true) {
        var online = ""
        if (Online === true) online = "Online"
        if (Online === false) online = "Offline"
        channel.setTopic(`**${playerCount}/${maxPlayers}** | **${TPS}** | **Bot: ${online}**`)
    }


    // A function that goes and sets the activity(status) of the bot
    setPresence(bot, client) {

    //All the activites MUST be stored in this format !!!
    var activities = [
      {type:"PLAYING", text:"on 3B3T"},
      {type:"WATCHING",text:"the server"},
      {type:"LISTENING",text:"tnt blowing up"},
      {type:"WATCHING", text:`${Object.keys(bot.players).length}/${bot.game.maxPlayers} players play on\n 3b3t`}
    ]
    
    // Set the user activity(status) based on the current number that is the activityCount variable
    client.user.setActivity({
      type: activities[this.activityCount].type,
      name: activities[this.activityCount].text
    })

    // Increase the activityCount variable by one, if it reaches the end of the list;
    // reset back to first one
    this.activityCount += 1
    if (this.activityCount > activities.length-1) {
      this.activityCount = 0
    }
  }
}

module.exports = Utility