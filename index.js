// CHANGE THIS TO YOUR BOT TOKEN
const BOT_TOKEN = '5694713065:AAFiPBhODB8-pbClNOGpsyfcZzM1NZIQDGE';

const { Telegraf } = require('telegraf');
var fs = require('fs');  // for internal storage of config files
const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
    let user_first_name = ctx.from.first_name;
    let user_last_name = ctx.from.last_name;
    let user_id = ctx.from.id;
    ctx.reply('Welcome, '+user_first_name);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

bot.launch();