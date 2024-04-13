'use strict';

import { Client, GatewayIntentBits } from 'discord.js';

const { CHANNELID_DISCORD, TOKEN_DISCORD } = process.env;

class LoggerService {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent
      ]
    });
    this.channelId = CHANNELID_DISCORD;

    this.client.on('ready', () => {
      console.log(`Logged in as ${this.client.user.tag}!`);
    });

    this.client.login(TOKEN_DISCORD);
  }

  async sendToFormatCode(logData) {
    const {
      code,
      message = 'This is some additional information about the code',
      title = 'Code Example'
    } = logData;

    const codeMessage = {
      content: message,
      embeds: [
        {
          color: parseInt('00ff00', 16), // Convert hexadecimal color code to integer
          title,
          description: '```json\n' + JSON.stringify(code, null, 2) + '\n```'
        }
      ]
    };
    this.sendToMessage(codeMessage);
  }

  async sendToMessage(message = 'message') {
    const channel = this.client.channels.cache.get(this.channelId);
    if (!channel) {
      console.error(`Could not find channel ${this.channelId}`);
      return;
    }
    // mesage user CHAT GPT API CALL
    channel.send(message).catch((e) => console.error(e));
  }
}

export default new LoggerService();
