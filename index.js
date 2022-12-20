/*
Copyright © 2022 Mineshafter61

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

The code in this Software should be written to be as easy to follow as possible such that even a programmer with only a basic understanding of Python should be able to read and edit.
*/

// CHANGE THIS TO YOUR BOT TOKEN
const BOT_TOKEN = '5694713065:AAFiPBhODB8-pbClNOGpsyfcZzM1NZIQDGE';

// Imports
const { Telegraf } = require('telegraf');  // Telegram bot API
var fs = require('fs');  // for internal storage of config files

// Bot instance
const bot = new Telegraf(BOT_TOKEN);

// Function to update aliases.json
function updateAliases(id, first_name, last_name) {
    fs.readFile('./aliases.json', 'utf8', (aliasErr, aliasData) => {
        // Error handling
        if (aliasErr) console.log(`Error reading alias.json: ${aliasErr}`);

        else {
            // JSON representation of aliases
            const aliases = JSON.parse(aliasData);

            // add new record
            aliases[id] = { 'first_name': first_name, 'last_name': last_name };

            // write new data back to the file, and handle errors
            fs.writeFile('./aliases.json', JSON.stringify(aliases, null, 2), (err) => {
                if (err) console.log(`Error writing aliases.json: ${err}`);
            });
        }
    });
}

bot.start((ctx) => {
    // get user data
    let user_first_name = ctx.from.first_name;
    let user_last_name = ctx.from.last_name;
    let user_id = ctx.from.id;

    // read chart.json
    fs.readFile('./chart.json', 'utf8', (err, data) => {
        if (err) console.log(`Error reading chart.json: ${err}`);

        else {
            // JSON representation of chart
            const json = JSON.parse(data);

            // check if user_id is not in the chart
            if (!(user_id in json)) {
                // add a new record
                json[user_id] = {};
                ctx.reply('You are not yet registered! Registering...');

                // write default name to aliases.json
                updateAliases(user_id, user_first_name, user_last_name);
            }

            // write new data back to the file
            fs.writeFile('./chart.json', JSON.stringify(json, null, 2), err => {
                if (err) console.log(`Error writing chart.json: ${err}`);
            });
        }
    });

    // Welcome the user when they run /start
    ctx.reply('Welcome, '+user_first_name);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// Callback loop to run the bot (in other programming languages this would be a 'while (true)' loop)
bot.launch();
