const mongoose = require('mongoose');
mongoose.connect('mongodb://root:example@localhost:27017')
    .then(()=>console.log('connected'))
    .catch(e=>console.log(e));

const Order = mongoose.model('Order', {name: String});

const createOrder = async () =>{
    const order = new Order({name:'test'})
    console.debug('Creating an order, order >> ', order)
    const result = await order.save()
    console.debug('Order created, id >> ', result.id)
}

module.exports = {
    createOrder
};
