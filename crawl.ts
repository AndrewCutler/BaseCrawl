import Nightmare = require('nightmare');

const express = require('express');
const _Nightmare = require('nightmare');

const isDebug = process.argv[2] === 'debug';
const debugOptions = {
    show: true,
    openDevTools: {
        mode: 'detach'
    },
}
const nightmare: Nightmare = new _Nightmare(isDebug ? debugOptions : { show: false });
const server = express();

let getStandardSeasonRows;
const baseUrl = 'https://www.baseball-reference.com';

// TODO: install concurrently or osome other way to restart on save

server.get('/search/:name', async ({ params: { name } }, res) => {
    await nightmare.goto(baseUrl);
    await nightmare.wait();
    await nightmare.type('.search .ac-input', name);
    await nightmare.wait('.ac-dataset-br__players .ac-suggestions');
    const result = await nightmare.evaluate(() => Array.from(document.querySelectorAll('.ac-suggestion')).map(e => ({ name: (e as any).__value, id: (e as any).__data.i })))


    res.send(result);
});

server.listen(3000, () => console.log('Started sever on port 3000.'));
