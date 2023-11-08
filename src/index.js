require('dotenv').config()
const express = require('express');
const cors = require('cors');
const {createOrder, incrementOrderStage} = require("./mongo");
const {prepareConnectionInvitation} = require("./connection");
const {requestAttributePresentation, verifyAttributePresentation} = require("./attribute-presentation");

const app = express();
app.use(cors());
app.use(express.json())


app.get('/create-order', async (req, res) => {//TODO: should be post but we don't care
    const orderID = await createOrder()
    console.debug("/create-order?orderID=", orderID)
    const connectionInvitation = prepareConnectionInvitation(orderID)
    console.debug("connectionInvitation", connectionInvitation)
    res.json(connectionInvitation)
    console.debug(`
    /create-order
    `)
})

app.get('/confirm-connection', async (req, res) => {
    const orderID = req.query.orderID
    console.debug("/confirm-connection?orderID=", orderID)
    await incrementOrderStage(orderID)
    res.send('Connection confirmed');

    requestAttributePresentation(orderID)

    console.debug(`
    /confirm-connection
    orderID: ${orderID}
    `)
})

app.post('/submit-attribute-presentation', async (req, res) => {
    const orderID = req.query.orderID
    console.debug("/submit-attribute-presentation?orderID=", orderID)
    const attributePresentation = req.body
    console.debug("attributePresentation", attributePresentation)
    const verificationResult = await verifyAttributePresentation(orderID, attributePresentation)

    res.json(verificationResult);

    console.debug(`
    /confirm-connection
    orderID: ${orderID}
    attributePresentation: ${JSON.stringify(attributePresentation)}
    `)
})

app.listen(process.env.CONTROLLER_PORT, () =>
    console.log(`Example app listening on port ${process.env.CONTROLLER_PORT}!`),
)