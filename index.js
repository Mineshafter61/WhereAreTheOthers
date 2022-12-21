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

// Arrays to store IDs accessing different functions of the bot.
var id_new_item = [];
var id_item_date = [];

// Object to store temporary new item data
var temp_item_data = {
    id: -1,
    info: '',
    start: {},
    end: {}
};

// Function to update aliases.json
function updateAliases(id, first_name, last_name) {
    fs.readFile('./aliases.json', 'utf8', (aliasErr, aliasData) => {
        // error handling
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

// Function to write data to chart.json
function updateChart(id, payload, start, end) {
    fs.readFile('./chart.json', 'utf8', (err, data) => {
        // error handling
        if (err) console.log(`Error reading chart.json: ${err}`);

        else {
            // JSON representation
            const json = JSON.parse(data);

            // new data to be added
            let newData = {
                'info': payload,
                'start': start,
                'end': end
            };

            // append to user's data
            json[id].push(newData);

            // write new data back to the file, and handle errors.
            fs.writeFile('./chart.json', JSON.stringify(json, null, 2), (err) => {
                if (err) console.log(`Error writing chart.json: ${err}`);
            });
        }
    });
}

// Function to remove an item from chart.json
function removeItem(id, payload, start) {
    fs.readFile('./chart.json', 'utf8', (err, data) => {
        // error handling
        if (err) console.log(`Error reading chart.json: ${err}`);

        else {
            // JSON representation
            const json = JSON.parse(data);

            // remove item if it matches certain conditions
            for (let i = 0; i < json[id].length; i++) {
                if (json[id][i].info === payload && json[id][i].start === start) {
                    json[id].splice(i,1);
                    i--;
                }
            }

            // write new data back to the file, and handle errors.
            fs.writeFile('./chart.json', JSON.stringify(json, null, 2), (err) => {
                if (err) console.log(`Error writing chart.json: ${err}`);
            });
        }
    });
}

// start command
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
                json[user_id] = [];
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

    // Show buttons for next action
    bot.telegram.sendMessage(ctx.chat.id, 'What would you like to do today?', {
        reply_markup: {
            inline_keyboard: [
                // buttons (officially inline keyboard)
                [{ text: 'New item', callback_data: 'new_item' }],
                [{ text: 'Delete item', callback_data: 'delete_item' }],
                [{ text: 'View all items', callback_data: 'view_items' }]
            ]
        }
    });
});

// main menu (when cancel button is pressed)
bot.action('menu', (ctx) => {
    // Show buttons for next action
    bot.telegram.sendMessage(ctx.chat.id, 'What would you like to do today?', {
        reply_markup: {
            inline_keyboard: [
                // buttons (officially inline keyboard)
                [{ text: 'New item', callback_data: 'new_item' }],
                [{ text: 'Delete item', callback_data: 'delete_item' }],
                [{ text: 'View all items', callback_data: 'view_items' }]
            ]
        }
    });
});

// action called when the new item button is pressed
bot.action('new_item', (ctx) => {
    // Get user id
    let user_id = ctx.from.id;

    // Clear temp data
    temp_item_data = { id: -1, info: '', start: {}, end: {} };

    // Update the relevant array with user's ID
    id_new_item.push(user_id);

    // Tell user to key in the item
    ctx.reply('Key in the new item...');

    // required line to remove loading circle
    ctx.answerCbQuery();
});

// called when a message is sent.
bot.on('message', (ctx) => {
    // Get user id
    let user_id = ctx.from.id;

    // Check if the new item array contains the user id
    if (id_new_item.includes(user_id)) {

        // Get the new item and store it in the temp object
        let item = ctx.message.text;
        temp_item_data.id = user_id;
        temp_item_data.info = item;

        // Remove the user id from the array
        for (let i = 0; i < id_new_item.length; i++) {
            if (id_new_item[i] === user_id) {
                id_new_item.splice(i, 1);
                i--;
            }
        }

        // Tell user next action
        ctx.reply('Key in the start and end dates. Accepted formats: DD/MM-DD/MM (01/01-02/01), DD/MM (01/01), DD/MM AP-DD/MM AP (01/01 PM-02/01 AM), DD/MM AP (01/01 AM).');
        id_item_date.push(user_id);

    }

    // Check if the item date array contains the user id
    else if (id_item_date.includes(user_id)) {
        
        // Get the message
        let timeRange = ctx.message.text.split('-');

        // Get start date and time
        let startTime = timeRange[0];
        let endTime = timeRange.length == 2 ? timeRange[1] : timeRange[0];

        // Update the file
        updateChart(user_id, temp_item_data.info, startTime, endTime);

        // Remove the user id from the array
        for (let i = 0; i < id_item_date.length; i++) {
            if (id_item_date[i] === user_id) {
                id_item_date.splice(i, 1);
                i--;
            }
        }

        // Confirmation message and button to go back
        bot.telegram.sendMessage(ctx.chat.id, `Item recorded: ${temp_item_data.info} from ${startTime} to ${endTime}`, {
            reply_markup: {
                inline_keyboard: [
                    // buttons (officially inline keyboard)
                    [{ text: 'Back to Menu', callback_data: 'menu' }]
                ]
            }
        });

    }
});

// action called when the delete item button is pressed
bot.action('delete_item', (ctx) => {

    // get all items from the json file
    fs.readFile('./chart.json', 'utf8', (err, data) => {

        // handle errors
        if (err) console.log(`Error reading chart.json: ${err}`);
        else {
            // convert to json object
            const json = JSON.parse(data);

            // get all items belonging to the user
            let allItems = json[ctx.from.id];

            // send the list for user to click
            bot.telegram.sendMessage(ctx.chat.id, 'Which item would you like to delete?', {
                reply_markup: {
                    inline_keyboard: allItems.map((x, i) => ([{
                        text: x.start == x.end ? `${x.info} (${x.start})` : `${x.info} (${x.start}-${x.end})`,
                        callback_data: 'del_'+x.info+'_'+x.start
                    }]))
                }
            });

            // required line to remove loading circle
            ctx.answerCbQuery();

        }
    });
});

// called when an item is deleted
bot.on('callback_query', (ctx) => {
    let callback_data = ctx.callbackQuery.data;

    // check if the callback data matches the deletion callback
    if (callback_data.startsWith('del_')) {
        // get message contents in an array
        let item = callback_data.split('_');

        // remove the item
        removeItem(ctx.from.id, item[1], item[2]);

        // Confirmation message and button to go back
        bot.telegram.sendMessage(ctx.chat.id, `Item removed.`, {
            reply_markup: {
                inline_keyboard: [
                    // buttons (officially inline keyboard)
                    [{ text: 'Back to Menu', callback_data: 'menu' }]
                ]
            }
        });

    }
});

// action called when the view items button is pressed
bot.action('view_items', (ctx) => {
    // get all items from the json file
    let allItems = getAllItems(ctx.from.id);

    // required line to remove loading circle
    ctx.answerCbQuery();
});

// bot settings
bot.settings((ctx) => {
    // do shit
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// Callback loop to run the bot (in other programming languages this would be a 'while (true)' loop)
bot.launch();
