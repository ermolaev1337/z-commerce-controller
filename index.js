require('dotenv').config()
const express = require('express');
const {createOrder} = require("./mongo");

const app = express();

app.get('/create-order', async (req, res) => {//TODO: should be post but we don't care
    await createOrder()
    await new Promise(resolve => setTimeout(()=>{//TODO: talks to the ACAPy-like wrapper of teh Heimdall and returns the "envelop"
        const connectionInvitationURL = ''
        console.debug('Heimdall things have been processed')
        resolve()
    }, 1000))
    return res.redirect('http://localhost:1337/connection');
});

app.get('/create-proof-request', (req, res) => {//TODO: should be post but we don't care
    return res.send('Create proof request');
});

app.listen(process.env.PORT, () =>
    console.log(`Example app listening on port ${process.env.PORT}!`),
);