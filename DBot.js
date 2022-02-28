/*
 * To use this bot, you will need discord.js installed. You can install with: npm install discord.js
 * This bot uses discord.js v13
 * You need to do this before running this example:
 * - You need to get a discord token
 * - You need to get the id of the channel you want to use
 * - You need to get an service account key from Firebase Website
 */


// Get the arguments to start the bot
if (process.argv.length == 7) {
    console.log('Usage : node DBot.js <discord bot token> <channel id> <host> <port> [<name>] [<password>]')
    process.exit(1)
  }

  // Import all the libraries used
  const https = require("https")
  const moment = require("moment")
  var fb = require("firebase-admin");
  const { createHash } = require('crypto');
  const Utility = require("./modules/utility.js")

  const Util = new Utility()

  // Get the creditentials used for accessing the db
  var serviceAccount = require("./your-service-account-key.json");

  // Initialize the Firebase access
  fb.initializeApp({
    credential: fb.credential.cert(serviceAccount)
  });

  // Get the firestore database as db 
  const db = fb.firestore()

  // Load discord.js
  const {
    Client,
    Intents,
    MessageEmbed
  } = require('discord.js')
  
  // Create Discord intentions, required in v13
  const intents = new Intents(['GUILDS', 'GUILD_MESSAGES'])
  
  // Create Discord client
  const client = new Client({
    intents: intents
  })
  
  // The channel ID(argument 3) used for the discord bot
  let channel = process.argv[3]

  // Prefix for the discord AND mc bot
  const prefix = "!"

  // Command list used for minecraft
  const commandsMinecraft = [
    {name:"seen", description:"Tells you when was the player last seen on the server.", usage:`${prefix}seen [player]`},
    {name:"type", description:"Tells you the server type its running on.", usage:`${prefix}type`},
    {name:"leak", description:"Leaks random users cords(maybe its real, maybe it isn't...", usage:`${prefix}leak`},
    {name:"tps", description:"Tells the current server TPS.", usage:`${prefix}tps`},
    {name:"uptime", description:"Shows the uptime of the bots.", usage:`${prefix}uptime`},
  ]

  // Command list used for discord 
  const commandsDiscord = [
    {name:"seen", description:"Tells you when was the player last seen on the server.", usage:`${prefix}seen [player]`},
    {name:"players", description:"Shows what players are online in the server", usage:`${prefix}players`},
    {name:"tps", description:"Shows the current TPS of the server", usage:`${prefix}tps`},
    {name:"health", description:"Sends a message with the bots health level", usage:`${prefix}health`},
    {name:"hunger", description:"Sends a message with the bots hunger level", usage:`${prefix}hunger`},
    {name:"message", description:"Whispers(send message to user)", usage:`${prefix}msg [player] [message]`},
    {name:"uptime", description:"Shows the uptime of the bots", usage:`${prefix}uptime`},
  ]


  
  // Load mineflayer
  const mineflayer = require('mineflayer');
  const { normalize } = require("path");
  const tpsPlugin = require("mineflayer-tps")(mineflayer)

  var bot

  // Create the bot
  function createBot() {
    const options = {
      host: process.argv[4],
      port: parseInt(process.argv[5]),
      username: process.argv[6] || 'discord',
      password: process.argv[7],
      enableServerListing: false
    }

    bot = mineflayer.createBot(options)

    // load the TpsPlugin for the bot
    bot.loadPlugin(tpsPlugin)
  }

  // Login Minecraft Bot
  createBot()

  // When the discord client is ready
  client.on('ready', () => {
    console.log(`The discord bot logged in! Username: ${client.user.username}!`)

    // Find the Discord channel messages will be sent to
    channel = client.channels.cache.get(channel)

    // If channel is undefined/null
    if (!channel) {
      console.log(`I could not find the channel (${process.argv[3]})!\nUsage : node DBot.js <discord bot token> <channel id> <host> <port> [<name>] [<password>]`)
      process.exit(1)
    }
  })

  // Set the variable start_time to the current time and date once the discord bot and minecraft bot have successfully logged in
  var start_time = Date.now()

  // Sha256 hash function
  function hash(string) {
    return createHash('sha256').update(string).digest('hex');
  }

  // Converts milliseconds to a more readable format
  function millisToReadable(ms) {
    let seconds = (ms / 1000).toFixed(1);
    let minutes = (ms / (1000 * 60)).toFixed(1);
    let hours = (ms / (1000 * 60 * 60)).toFixed(1);
    let days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);
    if (seconds < 60) return seconds + " Sec";
    else if (minutes < 60) return minutes + " Min";
    else if (hours < 24) return hours + " Hrs";
    else return days + " Days"
  }

  // Sends a message everywhere: Discord, Minecraft
  function sendEverywhere(message, log = false, type = "normal") {

    // Get the type sorted
    switch (type) {

      // Will send a normal text message into Minecraft and Discord
      case "normal":
        channel.send(message)
        bot.chat(message)
        break
      
      // Will send an embed that will welcome the player
      case "welcome":
        var embed1 = new MessageEmbed()
        .setColor("#7DC479")
        .setDescription(message)
        .setAuthor({name:"Welcome!",iconURL:client.user.avatarURL()})
        .setTimestamp()

        channel.send({embeds: [embed1]})
        bot.chat(message)
        break
      
      // Will send and embed that will leave the player (???)
      case "leave":
        var embed2 = new MessageEmbed()
        .setColor("#CE2944")
        .setDescription(message)
        .setAuthor({name:"Goodbye!",iconURL:client.user.avatarURL()})
        .setTimestamp()

        channel.send({embeds: [embed2]})
        bot.chat(message)
        break
    }
    
    // if parameter log is true; log it into console
    if (log === true) console.log(message)
  }

  // Updates topic of the channel(parameter 3)
  // Self explanatory code :)
  function updateTopic(playerCount, maxPlayers, TPS, Online = true) {
    var online = ""
    if (Online === true) online = "Online"
    if (Online === false) online = "Offline"
    channel.setTopic(`**${playerCount}/${maxPlayers}** | **${TPS}** | **Bot: ${online}**`)
  }

  // A variable to sort through all the activities(statuses)
  var activityCount = 0

  // A function that goes and sets the activity(status) of the bot
  function setPresence() {

    //All the activites MUST be stored in this format !!!
    var activities = [
      {type:"PLAYING", text:"on 3B3T"},
      {type:"WATCHING",text:"the server"},
      {type:"LISTENING",text:"tnt blowing up"},
      {type:"WATCHING", text:`${Object.keys(bot.players).length}/${bot.game.maxPlayers} players play on\n 3b3t`}
    ]
    
    // Set the user activity(status) based on the current number that is the activityCount variable
    client.user.setActivity({
      type: activities[activityCount].type,
      name: activities[activityCount].text
    })

    // Increase the activityCount variable by one, if it reaches the end of the list;
    // reset back to first one
    activityCount += 1
    if (activityCount > activities.length-1) {
      activityCount = 0
    }
  }

  // A variable that stores what was the last tps
  var lastTps = 0

  // Stores if the bot has joined
  // Second one stores number of players that were on the server when the bot joined
  var joined = true
  var joinedPlayers = 0

  // Once the bot joins set Joined to true AND
  // Set joinedPlayers to the number of players currently on the server when bot spawned( minus the bot )
  bot.once("playerJoined", () => {
    joined = true
    joinedPlayers = Object.keys(bot.players).length - 1
  })


  // THIS DOES NOT WELCOME !!!
  // Once the bot joins, send message that it is online and set all the intervals
  bot.once("playerJoined", () => {

    var embed = new MessageEmbed()
      .setTitle("Bot Online!")
      .setColor("#0022aa")
      .setFooter({ text: 'Made by 3b3t community'})
      .setTimestamp()

    channel.send({embeds: [embed]})

    // Sets interval which the topic of the channel will be changed
    lastTps = bot.getTps()
    updateTopic(Object.keys(bot.players).length, bot.game.maxPlayers, bot.getTps(), true)
    setInterval(() => lastTps = bot.getTps, 90000)
    setInterval(() => updateTopic(Object.keys(bot.players).length, bot.game.maxPlayers, bot.getTps(), true), 150000)
    setInterval(() => {setPresence()}, 30000)
    return
  })

  
  // Redirect Discord messages to in-game chat
  client.on('messageCreate', message => {

    // Only handle messages in specified channel
    if (message.channel.id !== channel.id) return

    // Ignore messages from the bot itself
    if (message.author.id === client.user.id) return

    // Commands for Discord
    switch(message.content.split(" ")[0]) {
      
      // Send and embed with all the commands for discord
      // Usage: <Prefix>help
      case prefix + "help":

        // Variable that is used to store all the commands
        var cmdText = ""
        for (let cmd = 0; cmd < commandsDiscord.length; cmd++) {
          cmdText += `__${commandsDiscord[cmd].name}__ ; *${commandsDiscord[cmd].description}* ; **${commandsDiscord[cmd].usage}**\n`
        }

        // Embed with all the commands
        var embd = new MessageEmbed()
        .setColor("#CE2944")
        .setDescription(cmdText)
        .setAuthor({name:"Help",iconURL:client.user.avatarURL()})
        .setTimestamp()

        channel.send({embeds: [embd]})
        break

      // Send a text when when the requested player was last seen/is online
      // Usage: <Prefix>seen <player>
      case prefix + "seen":

        // Variable Used to store the result of the Promise
        var result

        // Promise that will get resolved to get the usefull data of the request
        new Promise(function (resolve, reject) {

          // Make the HTTPS request and get the result
          https.get(`https://api.minetools.eu/uuid/${message.content.split(" ")[1]}`, res => {
              res.setEncoding("utf8")
              let body = ""
              res.on("data", data => {
                  body += data
              });
              res.on("end", () => {
                // Parse the data the request gave us and if error happens just log it
                try { 
                  body = JSON.parse(body)
                } catch (err) {
                  console.log(err)
                }

                // hehe
                result = body

                // If the result was OK(Requested player is a valid minecraft user) then continue with the rest of the code
                if (result.status === "OK") {

                  // Get the document of the player that stores the last seen data
                  db.collection("seen").doc(result.id).get().then(doc => {

                    // If the player is in the current players online, say it
                    if (message.content.split(" ")[1] in bot.players) {
                      channel.send(`**${message.content.split(" ")[1]}** is currently online`)
                    }
                    else {
                      // If the document with the player data doesn't exist(never was on the server while bot was online/existed)
                      if (!doc.exists) {
                        channel.send(`${message.content.split(" ")[1]} never was on the server(while the bot existed)`)
                      }
                      // Else convert the time and date to a more nicer format using 'moment' and send it 
                      else {
                        channel.send(`**${message.content.split(" ")[1]}** was last seen ***${moment(doc.data().date).fromNow()}***`)
                      }
                    }
                  })
                }
                // If the result was ERR(ERR is only returned when the requested player is not a valid minecraft user),
                // then say that player is not a valid minecraft user
                else {
                  channel.send(`${message.content.split(" ")[1]} is not a valid minecraft user!`)
                }

                resolve(body)
                                    
              });
               res.on("error", (e) => {
                  reject(e)
              });
          });
        })
        break


      // Allows Maintainer's/Head Developer's to Shutdown the bot
      // Usage: <Prefix>quit
      // DONT ADD TO THE COMMANDS LIST !!!
      case prefix + "quit":

        // If the message is from the Maintainer's/Head Developer's ID (galfar as of now) shutdown the bot
        if (message.author.id == 921808259688583258) {
          
          // Teh Embed
          var emb = new MessageEmbed()
          .setTitle("Bot Offline!")
          .setColor("#FF0000")
          .setFooter({ text: 'Made by 3b3t community'})
          .setTimestamp()


          channel.send({embeds: [emb]})

          bot.quit()
          console.log("Quit")
        }
        break
      
      // Send A List of current Players online INCLUDING the bot itself
      // Usage: <Prefix>players
      case prefix + "players":
        const embed = new MessageEmbed()
        .setTitle("Players Online")
        .setColor("#0055ff")
        .setDescription(`${Object.keys(bot.players).join("\n")}`)
        .setFooter({ text: 'Made by 3b3t community'})
        .setTimestamp()

        channel.send({embeds: [embed]})
        break
      
      // Sends current server TPS
      // Usage: <Prefix>tps
      case prefix + "tps":
        channel.send(`Current TPS: ${Util.getTPS()}`)
        break
      
      // Sends Bot's Health level
      // Usage: <Prefix>health
      case prefix + "health":

        var text = ""
        for (let hearth = 0; hearth < bot.health; hearth++) {
          text += "❤️";
        }

        channel.send(`Bot's Health: ${text} (${bot.health})`)
        break
      
      // Sends Bots Hunger level
      // Usage: <Prefix>hunger
      case prefix + "hunger":

        var text = ""
        for (let hunger = 0; hunger < bot.food; hunger++) {
          text += "🍗";
        }

        channel.send(`Bot's Hunger: ${text} (${bot.health})`)
        break
      
      // Whispers to a specified player
      // Usage: <Prefix>msg [player] [message]
      case prefix + "msg" || prefix + "w":

        // If number of provided parameters is NOT 2 then send usage
        if (message.content.split(" ").length < 2) {
          channel.send(`Usage: ${prefix}msg [username] [message]`)
          break
        }
        try {
          // Remove the <Prefix>msg and player part and send only the message
          var tex = message.content.substring(message.content.indexOf(" ") + 1)
          text = tex.substring(tex.indexOf(" ") + 1)

          // Whisper/Message the requested player
          bot.whisper(message.content.split(" ")[1], text)

          // If there was an error, send what was the error to the channel
          } catch (error) {
            channel.send(`there was an an error: ${error}`)
          }
          break

      case prefix + "uptime":
        var current_time = Date.now()

        const uptime_embed = new MessageEmbed()
        .setTitle("Uptime")
        .setColor("#1133aa")
        .setDescription(`${millisToReadable((current_time - start_time))}`)
        .setFooter({ text: 'Made by 3b3t community'})
        .setTimestamp()

        channel.send({embeds: [uptime_embed]})
        break

      //
      default:
        if (message.content === null || message.content == "") break

        /* Doesnt Currently work, was supposed to remove the characters when user is pinged and get the id and convert it into a name
          var messageCopy = message.content
          if (messageCopy.split(" ")[0].startsWith("<@!")) {
            messageCopy = messageCopy.replace("/([<!@>])\w+/", "")
          }
        */

        // Send the message
        bot.chat(`${message.author.username}: ${message.content}`)
      }
  })
  
  // Redirect in-game messages to Discord channel
  bot.on('chat', (username, message) => {
    // Ignore messages from the bot itself
    // And log them to the console
    if (username === bot.username) {
      console.log(`${bot.username}: ${message}`)
      return
    }


    switch (message.split(" ")[0]) {


      // Send a message with all the commands for Minecraft
      // Usage: <Prefix>help
      case prefix + "help":

        // Variable that is used to store all the commands
        var cmdText = ""
        for (cmd = 0; cmd < commandsMinecraft.length; cmd++) {
          cmdText += `${commandsMinecraft[cmd].name} ; ${commandsMinecraft[cmd].description} ; ${commandsMinecraft[cmd].usage} ;;; `
        }

        // Send the message
        bot.chat(cmdText)
        break


      // Tells when the player was last seen
      // Usage: <Prefix>seen [player]
      case prefix + "seen":
        var result

        // Promise that will get resolved to get the usefull data of the request
        new Promise(function (resolve, reject) {

          // Make the HTTPS request and get the result
          https.get(`https://api.minetools.eu/uuid/${message.split(" ")[1]}`, res => {
              res.setEncoding("utf8")
              let body = ""
              res.on("data", data => {
                  body += data
              });
              res.on("end", () => {
                try { 
                  body = JSON.parse(body)
                } catch (err) {
                  console.log(err)
                }
                result = body

                // If the result was OK(Requested player is a valid minecraft user) then continue with the rest of the code
                if (result.status === "OK") {

                  // Get the document of the player that stores the last seen data
                  db.collection("seen").doc(result.id).get().then(doc => {

                    // If the player is in the current players online, say it
                    if (message.split(" ")[1] in bot.players) {
                      console.log(`\r${username}`)
                      bot.chat(`${message.split(" ")[1]} is currently online`)
                    }
                    else {
                      // If the document with the player data doesn't exist(never was on the server while bot was online/existed)
                      if (!doc.exists) {
                        console.log(`\r${username}`)
                        bot.chat(`${message.split(" ")[1]} never was on the server(while the bot existed)`)
                      }
                      // Else convert the time and date to a more nicer format using 'moment' and send it 
                      else {
                        console.log(`\r${username}`)
                        bot.chat(`${message.split(" ")[1]} was last seen ${moment(doc.data().date).fromNow()}`)
                      }
                    }
                  })
                }

                // If the result was ERR(ERR is only returned when the requested player is not a valid minecraft user),
                // then say that player is not a valid minecraft user
                else {
                  bot.chat(`${message.split(" ")[1]} is not a valid minecraft user!`)
                }
                resolve(body)
                                    
              });
               res.on("error", (e) => {
                  reject(e)
              });
          });
        })
        break


      // Tells the server type
      // Usage: <Prefix>type
      case prefix + "type":
        bot.chat(`Server Type: ${bot.game.serverBrand}`)
        break
      
      // !!! TROLL !!!  doesnt tell coordinates of player  !!! TROLL !!!
      case prefix + "leak":
        sendEverywhere(`${username} is hidden ¯\\_(ツ)_/¯`)
        break
      
      // Sends current server TPS
      // Usage: <Prefix>tps
      case prefix + "tps":
        bot.chat(`Current server TPS: ${Util.getTPS()}`)
        break
      
      // If no command was requested, means message was recieved
      case prefix + "uptime":
        var current_time = Date.now()
        bot.chat(`Bot's uptime: ${millisToReadable((current_time - start_time))}`)
        break
      default:

        // Make the embed have a unique color for each player
        var embed_color = Util.hash(username).substring(0,6)

        const embed = new MessageEmbed()
        .setAuthor({name: `${username}`, iconURL: `https://crafatar.com/avatars/${bot.players[username].uuid}?overlay`})
        .setColor("#" + embed_color)
        .setDescription(`${message}`)
        //.setFooter({ text: 'Made with ❤️ by galfar'})
        .setTimestamp()

        channel.send({embeds: [embed]})
        
        // For logging purposes log what the player said and other players said
        console.log(`${username}: ${message}`)
    }

  })

  // When any player joins, INCLUDING the bot itself
  bot.on("playerJoined", (player) => {

    // If the username is Bot itself, Dont welcome it
    if (player.username === bot.username) return

    // Dont welcome allready joined players
    if (joined == true && joinedPlayers > 0) {
        joinedPlayers -= 1
    }
    // Else welcome any players thaat join after
    else if (joined == true && joinedPlayers == 0){

      // Try getting the UUID of the player, else try again (IQ 200)
      try {
        var playerUUIDstring = `${player.uuid}`
      } catch {
        var playerUUIDstring = player.entity.uuid
      }

      // Split the UUID by "-" and put them into string for later use
      var playerUUIDstringList = playerUUIDstring.split("-")
      var PlayerUUIDstringComplete = ""

      // Assemble the string with the UUID of the player
      for (i = 0; i < playerUUIDstringList.length; i++) {
        PlayerUUIDstringComplete += playerUUIDstringList[i]
      }

      // Get if the player was on the server
      db.collection("seen").doc(`${PlayerUUIDstringComplete}`).get().then(doc => {

        // If player was on the server pick some random message from the list and send it
        if (doc.exists) {
          var joinMessages = [
            `Look who is here, its ${player.username}`,
            `${player.username} We were expecting you ( ͡° ͜ʖ ͡°)`,
            `${player.username} seems OP - please nerf`
          ]

          // sendEverywhere(`${joinMessages[Math.floor(Math.random() * joinMessages.length)]}`, false, "welcome")
        }

        // If the player never was on the server(While the bot was online and existed) then welcome him and register,
        // that he was on the server
        else {
          // sendEverywhere(`Welcome to 3B3T, ${player.username}`, false, "welcome")
          db.collection("seen").doc(`${PlayerUUIDstringComplete}`).set({date: Date.now(), username: player.username})
        }
      })
    }
  })

  // When any player leaves, INCLUDING the bot itself
  bot.on("playerLeft", (player) => {

    // If the username is Bot itself, Dont leave it (?, english 100)
    if (player.username === bot.username) return

    // Pick some random message that will be said when the player leaves
    var leaveMessages = [
      `Sad to see you go, ${player.username}`,
      `see you next time, ${player.username}`,
      `well, ${player.username} left.`]

    // getthe UUID of the player
    var playerUUIDstring = `${player.uuid}`

    // Split the UUID by "-" and put them into string for later use
    var playerUUIDstringList = playerUUIDstring.split("-")
    var PlayerUUIDstringComplete = ""

    // Assemble the string with the UUID of the player
    for (i = 0; i < playerUUIDstringList.length; i++) {
      PlayerUUIDstringComplete += playerUUIDstringList[i]
    }

    sendEverywhere(`${leaveMessages[Math.floor(Math.random() * leaveMessages.length)]}`, false, "leave")
    db.collection("seen").doc(`${PlayerUUIDstringComplete}`).set({date: Date.now(), username: player.username})
  })

  // When the bot encounters an critical error, or is shutdown manually via the discord command, send embed
  bot.on("end", () => {
    var embed = new MessageEmbed()
    .setTitle("Bot Offline!")
    .setColor("#FF0000")
    .setFooter({ text: 'Made with ❤️ by galfar'})
    .setTimestamp()

    // var ch = client.channels.cache.get(channel.toString())
    // ch.send({embeds: [embed]})

    // Update the topic with the bot is offline
    // updateTopic(Object.keys(bot.players).length, bot.game.maxPlayers, lastTps, false)

    // Terminate the process to be sure
    // process.exit(1)
  })

  // When the bot encounters a minor error(non-crashing), log it
  bot.on("error", () => {
      console.error(err)
  })

  // When bot is kicked(for spamming, etc...), log the bot in back and log the error
  bot.on("kicked", (reason) => {
    console.info(JSON.parse(reason).text)

    createBot()
  } )

  // Login Discord bot
  client.login(process.argv[2])