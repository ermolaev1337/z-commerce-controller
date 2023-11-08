const {isConnectionEstablished} = require("./connection");
const requestAttributePresentation = (orderID) => {
    console.debug("Requesting Attribute Presentation by orderID, orderID >>", orderID)
    isConnectionEstablished(orderID);
    //TODO this func should trigger a pop up in the Wallet via web hook, when connection is established
}

const verifierURL = process.env.HEIMDALL_VERIFIER_URL

const uploadAttributePresentationToVerifierHeimdall = async (fileName, attributePresentation) => {
    const data = new FormData();
    data.append(fileName, attributePresentation);

    const uploadingResponse = await fetch(`http://${verifierURL}/upload/file?name=${fileName}`,{
        method: 'POST',
        body: data,
    });
    const uploadingResult = await uploadingResponse.json();
    console.debug("uploadingResult", uploadingResult)
}

const verifyAttributePresentation = async (orderID, attributePresentation) => {
    console.debug("Verifying Attribute Presentation by orderID, orderID >>", orderID)

    const attributePresentationFileName = `pres_attribute_before_revocation.json`
    // const attributePresentationFileName = `attribute-presentation-${orderID}.json`
    // await uploadAttributePresentationToVerifierHeimdall(attributePresentationFileName, attributePresentation)

    const verificationResultFileName = `attribute-presentation-${orderID}.txt`
    const verificationResultResponse = await fetch(`http://${verifierURL}/heimdalljs/verify?path=${attributePresentationFileName}&name=${verificationResultFileName}`)
    const verificationResult = await verificationResultResponse.json()
    console.debug("Attribute Presentation verified by orderID, orderID >>", orderID)
    console.debug("Verification result, verificationResult >>", verificationResult)
    return {result: Boolean(verificationResult)}
}

module.exports = {
    requestAttributePresentation,
    verifyAttributePresentation,
};