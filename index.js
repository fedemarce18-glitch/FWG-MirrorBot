const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Bot is running'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// PUT YOUR CHANNEL IDS HERE
const SOURCE_CHANNELS = [
  '1183885569990873209',
  '1184817776318230558'
];
const DESTINATION_CHANNEL = "1445548584819757159";

client.on("messageCreate", async (msg) => {
  if (!SOURCE_CHANNELS.includes(msg.channel.id) || msg.author.bot) return;

  const dest = await client.channels.fetch(DESTINATION_CHANNEL);

  // forward attachments if any
  let files = [];
  msg.attachments.forEach(att => files.push(att.url));

  // send message content + attachments
  dest.send({
    content: `**${msg.author.username}** in #leaks:\n${msg.content || ""}`,
    files: files
  });
});

client.on('ready', () => {
  console.log(`Bot is online as ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
