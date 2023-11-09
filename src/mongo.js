const mongoose = require('mongoose');

const mongoURL = process.env.MONGO_URL
const mongoUsername = process.env.MONGO_INITDB_ROOT_USERNAME
const mongoPassword = process.env.MONGO_INITDB_ROOT_PASSWORD

mongoose.connect(`mongodb://${mongoUsername}:${mongoPassword}@${mongoURL}`)
    .then(() => console.log('connected'))
    .catch(e => console.log(e));

const Order = mongoose.model('Order', {stage: Number});//TODO Connection and ProofRequest

const createOrder = async () => {
    const order = new Order({stage: 1})
    console.debug('Creating an order, order >> ', order)
    const result = await order.save()
    console.debug('Order created, id >> ', result.id)

    return result.id
}

const incrementOrderStage = async (orderID) => {
    console.debug('Incrementing the stage by orderID, orderID >> ', orderID)
    const order = await Order.findById(orderID)
    order.stage = order.stage + 1
    const result = await order.save()

    return result.id
}

module.exports = {
    createOrder,
    incrementOrderStage,
};