"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer = require('nodemailer');
const tslib_1 = require("tslib");
const discord_js_1 = require("discord.js");
const config_1 = tslib_1.__importDefault(require("./config"));
const commands_1 = tslib_1.__importDefault(require("./commands"));
const { intents, prefix, token } = config_1.default;
const client = new discord_js_1.Client({
    intents,
    presence: {
        status: 'online',
        activities: [{
                name: `${prefix}help`,
                type: 'LISTENING'
            }]
    }
});

function isLetter(c) {
  return c.toLowerCase() != c.toUpperCase();
}

function parsenetid(nick) {
  if(isnetidvalid(nick))
  {
    if( (!(nick.indexOf('-') > -1) && !(nick.indexOf('|') > -1) ) )
                  {
                    return console.log('not formatted');
                  }
                  var partsArray;
                  if(nick.indexOf('-') > -1)
                  {
                    partsArray = nick.split('-');
                  } else if(nick.indexOf('|') > -1)
                  {
                    partsArray = nick.split('|');
                  } else
                  {
                    return console.log('how tf did i get here');
                  }
                  
                const netid = partsArray[1];
                var netid_trimmed = netid;
                if(netid_trimmed.at(0) == ' ')
                {
                  netid_trimmed = netid_trimmed.substring(1);
                }
                while(netid_trimmed.at(netid_trimmed.length-1) == ' ')
                  {
                    netid_trimmed = netid_trimmed.substring(0, netid_trimmed.length-1);
                  }
    return netid_trimmed;
  } else {
    return 'invalid';
  }
}

function isnetidvalid(nick) {
  if( (!(nick.indexOf('-') > -1) && !(nick.indexOf('|') > -1) ) )
                  {
                    return console.log('not formatted');
                  }
                  var partsArray;
                  if(nick.indexOf('-') > -1)
                  {
                    partsArray = nick.split('-');
                  } else if(nick.indexOf('|') > -1)
                  {
                    partsArray = nick.split('|');
                  } else
                  {
                    return console.log('how tf did i get here');
                  }
                  
                const netid = partsArray[1];
                if(netid.length >= 7)
                {
                  var place = 0;
                  var upper = 5;
                  console.log(netid);
                  if(netid.at(0) == ' ')
                  {
                    place++;
                    upper++;
                  }
                  if(!isLetter(netid.at(upper-1))) //to account for last names with only 3 letters
                  {
                    upper--;
                    if(!isLetter(netid.at(upper-1))) //to account for last names with only 2 letters
                  {
                    upper--;
                  }
                    console.log(netid);
                    console.log('3 or 2 letter last name');
                  }
                  for(place; place < upper; place++)
                    {
                      if(!isLetter(netid.at(place)))
                      {
                        return false;
                      }
                    }
                  for(place; place < upper+3; place++)
                    {
                      if(isLetter(netid.at(place)))
                      {
                        return false;
                      }
                    }
                  return true;
                }
}

function verifyEmail(netid) 
{
  var transporter = nodemailer.createTransport({
  service: env.ORG_EMAIL_SERV,
  auth: {
    user: env.ORG_EMAIL,
    pass: env.ORG_EMAIL_PASS
  }
});
  var mailOptions = {
  from: env.ORG_EMAIL,
  to: netid.concat('@ucr.edu'),
  subject: 'Verification email for HCR',
  text: 'TESTING TESTING 123'
};
  transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
}


client.on('ready', () => {
    console.log(`Logged in as: ${client.user?.tag}`);
});
client.on('messageCreate', async (message) => {
    if (message.author.bot)
        return;
    if (message.content.startsWith(prefix)) {
        const args = message.content.slice(prefix.length).split(' ');
        const command = args.shift();
        switch (command) {
            case 'ping':
                const msg = await message.reply('Pinging...');
                await msg.edit(`Pong! The round trip took ${Date.now() - msg.createdTimestamp}ms.`);
                break;
            case 'say':
            case 'repeat':
                if (args.length > 0)
                    await message.channel.send(args.join(' '));
                else
                    await message.reply('You did not send a message to repeat, cancelling command.');
                break;
            case 'help':
                const embed = (0, commands_1.default)(message);
                embed.setThumbnail(client.user.displayAvatarURL());
                await message.channel.send({ embeds: [embed] });
                break;
          case 'verify':
                const nick = message.member.nickname;
                console.log(nick);
                if(!nick)
                {
                  nick = message.member.displayName;
                    if(!nick)
                    {
                      return console.log('null displayname'.concat(' ', message.member.user.username));
                    }
                }
                if(isnetidvalid(nick))
                {
                  message.channel.send('verification successful');
                  let role = message.guild.roles.cache.find(r => r.name === "Verified");
                  message.member.roles.add(role).catch(console.error);
                } else {
                  message.channel.send('verification failed');
                }
                break;
            case 'verall':
                message.channel.send('verifying all users');
                const gid = message.guildId;
                const guild = client.guilds.cache.find((g) => g.id === gid);
                if(!guild) {
                  console.log('could not find guild with id: ');
                  return console.log(gid);
                }
                guild.members.fetch()
                .then((members) => members.forEach((member) => {
                  var nick = member.nickname;
                  if(!nick)
                  {
                    nick = member.displayName;
                    if(!nick)
                    {
                      return console.log('null displayname'.concat(' ', member.user.username));
                    }
                  }
                  if(isnetidvalid(nick))
                  {
                     message.channel.send('verification successful'.concat(' ', nick));
                  let role = message.guild.roles.cache.find(r => r.name === "Verified");
                  member.roles.add(role).catch(console.error); 
                  } else {
                    message.channel.send('verification failed'.concat(' ', nick));
                  }
                }),
                );
                message.channel.send('done');
                break;
              case 'verify_by_email':
                const nick = message.member.nickname;
                console.log(nick);
                if(!nick)
                {
                  nick = message.member.displayName;
                    if(!nick)
                    {
                      return console.log('null displayname'.concat(' ', message.member.user.username));
                    }
                }
                if(isnetidvalid(nick))
                {
                  message.channel.send('netid verification successful');
                  let role = message.guild.roles.cache.find(r => r.name === "Verified");
                  var netid = parsenetid(nick);
                  verifyEmail(netid);
            message.member.roles.add(role).catch(console.error);
                } else {
                  message.channel.send('verification failed');
                }
                break;
        }
    }
});
client.login(token);
//# sourceMappingURL=index.js.map