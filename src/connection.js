const prepareConnectionInvitation = (orderID) => {
    console.debug("Sending connection invitation by orderID, orderID >>", orderID)
    return {
        agentURL: "controller:2222/",
        orderID: orderID,//TODO connection specific connectionID
    }
}

const isConnectionEstablished = (orderID) =>{
    console.debug("Checking Connection by orderID, orderID >>", orderID)
    //TODO should be another collection in Mongo "Connection" (relation "Connection" one-2-many "Order")

    console.debug("Connection is established, orderID >>", orderID)
    return true
}

module.exports = {
    prepareConnectionInvitation,
    isConnectionEstablished,
};