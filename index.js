// ---------------------------
// EXPRESS KEEP-ALIVE SERVER
// ---------------------------
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Bot is running'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

// ---------------------------
// DISCORD MIRROR BOT
// ---------------------------
const fs = require('fs');
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Channel IDs
const SOURCE_CHANNELS = [
  '1183885569990873209',
  '1184817776318230558'
];

const DESTINATION_CHANNEL = "1445548584819757159";

// Load mirrored message IDs
let mirrored = [];
if (fs.existsSync('mirrored.json')) {
  mirrored = JSON.parse(fs.readFileSync('mirrored.json'));
}

// ---------------------------
// MIRROR NEW MESSAGES ONLY
// LIMIT: FIRST 500 PER CHANNEL
// ---------------------------
client.on("messageCreate", async (msg) => {
  if (!SOURCE_CHANNELS.includes(msg.channel.id) || msg.author.bot) return;

  // Skip messages already mirrored
  if (mirrored.includes(msg.id)) return;

  // Limit: only process last 500 messages per channel
  // If mirrored <500 for this channel, it's fine
  const channelMirrors = mirrored.filter(id => id.startsWith(msg.channel.id));
  if (channelMirrors.length >= 500) return;

  const dest = await client.channels.fetch(DESTINATION_CHANNEL);

  // Forward attachments
  let files = [];
  msg.attachments.forEach(att => files.push(att.url));

  // Send mirrored message
  await dest.send({
    content: `**${msg.author.username}** in #leaks:\n${msg.content || ""}`,
    files: files
  });

  // Save mirrored message ID (tag with channel ID for limiting)
  mirrored.push(msg.channel.id + ":" + msg.id);
  fs.writeFileSync('mirrored.json', JSON.stringify(mirrored));
});

// ---------------------------
// BOT READY
// ---------------------------
client.on('ready', () => {
  console.log(`Bot is online as ${client.user.tag}`);
});

// ---------------------------
// LOGIN
// ---------------------------
client.login(process.env.DISCORD_TOKEN);
