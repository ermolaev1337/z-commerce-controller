require('dotenv').config()
const express = require('express');
const cors = require('cors');
const {createOrder, incrementOrderStage} = require("./mongo");
const {prepareConnectionInvitation} = require("./connection");
const {
    requestAttributePresentation,
    verifyAttributePresentation,
    getContent,
    isRevoked
} = require("./attribute-presentation");

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
    // res.send('Connection confirmed');

    //TODO webhooks, for now we send the proof request in response to the established connection
    const attributePresentationRequest = requestAttributePresentation(orderID)
    console.debug("Sending back Proof Request, attributePresentationRequest >>", JSON.stringify(attributePresentationRequest))
    res.json(attributePresentationRequest);

    console.debug(`
    /confirm-connection
    orderID: ${orderID}
    `)
})

const WS_SERVER = process.env.WS_SERVER

app.post('/submit-attribute-presentation', async (req, res) => {
    try{
        const orderID = req.query.orderID
        console.debug("/submit-attribute-presentation?orderID=", orderID)
        const attributePresentation = req.body
        console.debug("attributePresentation", attributePresentation)
        const isValid = await verifyAttributePresentation(orderID, attributePresentation, )

        if (isValid) {
            if (!isRevoked(attributePresentation)) {
                const content = getContent(attributePresentation)
                console.log(content)
                const verificationResultResponse = await fetch(`http://${WS_SERVER}/webhook/checkout-data`,{
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(attributePresentation),
                })
                const verificationResultResponseJson = await verificationResultResponse.json();
                console.debug("verificationResultResponseJson", verificationResultResponseJson)
                //TODO pass the data to the checkou§t page
            } else {
                console.error("Revoked Credential")
                const verificationResultResponse = await fetch(`http://${WS_SERVER}/webhook/checkout-data`,{
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({error:"Revoked"}),
                })
                const verificationResultResponseJson = await verificationResultResponse.json();

                console.debug("verificationResultResponseJson", verificationResultResponseJson)
            }
        } else {
            console.error("Non-valid Presentation")
            const verificationResultResponse = await fetch(`http://${WS_SERVER}/webhook/checkout-data`,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({error:"Invalid credential"}),
            })
            const verificationResultResponseJson = await verificationResultResponse.json();
            console.debug("verificationResultResponseJson", verificationResultResponseJson)
        }
        //TODO if is not valid or revoked - pass the error to the checkout
        res.json({result: isValid})
        // console.debug(`
        // /confirm-connection
        // orderID: ${orderID}
        // attributePresentation: ${JSON.stringify(attributePresentation)}
        // `)
    } catch (e) {
        console.error(e)
    }
})

app.get('/health', (req, res) => {
    res.status(200).send('Ok');
});

app.listen(process.env.CONTROLLER_PORT, () =>
    console.log(`Example app listening on port ${process.env.CONTROLLER_PORT}!`),
)