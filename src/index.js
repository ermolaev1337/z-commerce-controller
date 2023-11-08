require('dotenv').config()
const express = require('express');
const cors = require('cors');
const {createOrder} = require("./mongo");

const app = express();
app.use(cors());


app.get('/create-order', async (req, res) => {//TODO: should be post but we don't care
    const orderId = await createOrder()
    const response = await fetch(`http://localhost:4444/connection-invitation?orderId=${orderId}`)
    const connectionInvitation = await response.json()
    console.debug(connectionInvitation)

    res.redirect(`http://localhost:3333/?connection-invitation=${btoa(JSON.stringify(connectionInvitation))}`);

    console.debug(`
    /create-order
    `)
})

//TODO: add tis additional step that the proof request is initiated after the connection is confirmed from the Controller
const initiateProofRequest = (orderId) =>{

}

app.get('/confirm-connection', (req, res) => {//TODO: handle update of the order ID in the
    const orderId = req.query.orderId
    console.log()
    res.send('Connection confirmed');

    initiateProofRequest()

    console.debug(`
    /confirm-connection
    orderId: ${orderId}
    `)
})

app.listen(process.env.CONTROLLER_PORT, () =>
    console.log(`Example app listening on port ${process.env.CONTROLLER_PORT}!`),
)