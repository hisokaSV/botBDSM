const {VoiceConnection} = require('discord.js');
const { Command, CommandoMessage } = require("discord.js-commando");
const ytdl = require('ytdl-core-discord');

module.exports = class PlayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'play',
            aliases: ['p'],
            group: 'music',
            memberName: 'play',
            description: 'lis une musique depuis YouTube `-play` ou `-p` + url YouTube',
            args: [
                {
                    key: 'query',
                    prompt: 'Quel musique veux tu ecouter ?',
                    type: 'string'
                }
            ]
        });
    }

    /**
     * 
     * @param {CommandoMessage} message 
     * @param {String} query
     */
    async run(message, { query }) {
        const server = message.client.server;

        if (!message.member.voice.channel) {
            return message.say(':x: Tu dois ètre dans un salon vocal pour utiliser cette commande :x:');
        }

        await message.member.voice.channel.join().then((connection) => {
            if (server.currentVideo.url != "") {
                server.queue.push({ title: "", url: query});
                return message.say("Ajouté à la file d'attente");
            }
            server.currentVideo = { title: "", url: query};
            this.runVideo(message, connection, query);
        });
    }

    /**
     * 
     * @param {CommandoMessage} message 
     * @param {VoiceConnection} connection 
     * @param {*} video 
     */
    async runVideo(message, connection, videoUrl) {
        const server = message.client.server;
        const dispatcher = connection.play( await ytdl(videoUrl, {filter: 'audioonly' }), {type: 'opus' } )

        server.queue.shift();
        server.dispatcher = dispatcher;

        dispatcher.on('finish', () => {
            if (server.queue[0]) {
                server.currentVideo = server.queue[0];
                return this.runVideo(message, connection, server.currentVideo.url);                
            }
            else message.member.voice.channel.leave();
        });

        return message.say("En train de jouer :notes: ");
    }
}