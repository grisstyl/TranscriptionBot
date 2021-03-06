const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const yaml = require('js-yaml');
const PastebinAPI = require('pastebin-js');

let config;
let pastebinKey = '';
let botKey = '';
let pastebin = null;

client.on('message', message => {
    if (message.content.toLowerCase() === '-transcript') {
        message.channel.fetchMessages()
            .then(messages => {
                let text = "";

                for (let [key, value] of messages) {
                    const date = new Date(value.createdTimestamp);
                    let dateString = `${date.getDate()}/${date.getMonth()} ${date.getHours()}h ${date.getMinutes()}m`;

                    text += `${value.author.tag} at ${dateString}: ${value.content}\n`;
                }

                pastebin.createPaste({
                        text: text,
                        title: "Transcript",
                        format: null,
                        privacy: 1
                    })
                    .then(data => {
                        console.log(`Created paste: ${data}`);

                        message.author.send(`Transcript: ${data}`)
                            .then(() => console.log(`Sent user "${message.author.tag}" transcript.`))
                            .catch((err) => {
                                console.log(`Could not PM transcript, falling back to message in channel: ${err}`);
                                message.reply(data).fail((err) => console.log(`Uh oh! Something went wrong: ${err}`));
                            });
                    })
                    .fail(err => {
                        console.log(`Failed to create paste: ${err}`);
                    });
            })
            .catch(err => {
                console.log(`Failed to fetch messages: ${err}`);
            });

        message.delete()
            .then(() => console.log('Deleted message'))
            .catch(err => console.log(`Could not delete message: ${err}`));
    }
});

try {
    config = yaml.safeLoad(fs.readFileSync('configuration.yml', 'utf8'))

    if (typeof config === 'undefined') {
        console.log('You must set up a configuration.yml!');
    } else {
        pastebinKey = config.pastebinKey;
        botKey = config.botKey;

        client.login(botKey)
            .then(() => {
                pastebin = new PastebinAPI(pastebinKey);

                console.log(`Bot logged in.`);
            });
    }
} catch (e) {
    console.log('Could not load configuration.yml, please model yours after configuration.example.yml');
}