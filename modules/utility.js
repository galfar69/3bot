const { createHash } = require('crypto')

// Purely utility. Math, hashing, etc...
class Utility {

    constructor(activityCount = 0) {
        // A variable to sort through all the activities(statuses)
        this.activityCount = activityCount
    }

    hash(string) {
        return createHash('sha256').update(string).digest('hex')
    }

    // Converts milliseconds to a more readable format
    millisToReadable(ms) {
      let seconds = (ms / 1000).toFixed(1);
      let minutes = (ms / (1000 * 60)).toFixed(1);
      let hours = (ms / (1000 * 60 * 60)).toFixed(1);
      let days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);
      if (seconds < 60) return seconds + " Sec";
      else if (minutes < 60) return minutes + " Min";
      else if (hours < 24) return hours + " Hrs";
      else return days + " Days"
    }

    // Helper function for uptimeGradient
    componentToHex(c) {
      var hex = c.toString(16);
      return hex.length == 1 ? "0" + hex : hex;
    }

    uptimeGradient(millis) {
      let rgb = [255,0,0]
      // Color will be red at 0 days, green at 3 days and beyond. 
      let col = Math.floor( millis/1016470 )
      if (col > 255) {
        col = 255
      }
      rgb[0] = 255 - col
      rgb[1] = col

      // Convert rgb to hex and return
      return "#" + this.componentToHex(rgb[0]) + this.componentToHex(rgb[1]) + this.componentToHex(0)

    }

    // Updates topic of the channel(parameter 3)
    // Self explanatory code :)
    updateTopic(channel, playerCount, maxPlayers, TPS, Online = true) {
        channel = toString(channel)
        var online = ""
        if (Online === true) online = "Online"
        if (Online === false) online = "Offline"
        // TODO: Does not work, please fix
        // channel.setTopic(`**${playerCount}/${maxPlayers}** | **${TPS}** | **Bot: ${online}**`)
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

    // Increase the activityCount variable by one, if it reaches the end of the list
    // reset back to first one
    this.activityCount += 1
    if (this.activityCount > activities.length-1) {
      this.activityCount = 0
    }
  }
}

module.exports = Utility