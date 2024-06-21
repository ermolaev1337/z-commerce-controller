const {isConnectionEstablished} = require("./connection");


const AttributePresentation = {challenge: 14612461246, expiration: 12}//TODO make a collection in mongo, retrieve by Proof Request id for each user

const requestAttributePresentation = (orderID) => {
    console.debug("Requesting Attribute Presentation by orderID, orderID >>", orderID)
    isConnectionEstablished(orderID);
    //TODO this func should trigger a pop up in the Wallet via web hook, when connection is established

    return AttributePresentation
}

const verifierURL = process.env.HEIMDALL_VERIFIER_URL
const fs = require('fs').promises;
const path = require('path');
const {exec} = require('child_process');

//TODO something goes wrong here with the file uploading, it's a temp solution to upload the files, it does not support long filenames etc.
const uploadAttributePresentationToVerifierHeimdall = async (fileName, attributePresentation) => {
    const tempFilePath = "/app/tmp/" + fileName;
    await fs.writeFile(tempFilePath, JSON.stringify(attributePresentation));
    const curlCommand = `curl -s --request POST "http://${verifierURL}/upload/file?name=${fileName}" --form "uplfile=@${tempFilePath}"`;

    await exec(curlCommand, async (error, stdout, stderr) => {
        if (error) {
            throw error
        }
        if (stderr) {
            throw stderr
        }
        console.log(`stdout: ${stdout}`);
    });
}

const verifyAttributePresentation = async (orderID, attributePresentation, ) => {
    console.debug("Verifying Attribute Presentation by orderID, orderID >>", orderID)

    const attributePresentationFileName = `${orderID}.json`
    await uploadAttributePresentationToVerifierHeimdall(attributePresentationFileName, attributePresentation)

    const challenge = AttributePresentation.challenge//TODO request Proof Request entity here and get the preliminarily given challenge for verifivation

    const verificationResultFileName = `${orderID}.txt`
    const verificationResultResponse = await fetch(`http://${verifierURL}/heimdalljs/verify?path=${attributePresentationFileName}&name=${verificationResultFileName}&publicKey=issuer_pk.json&challenge=${challenge}`)
    console.debug("verificationResultResponse", verificationResultResponse)
    const verificationResult = await verificationResultResponse.json()
    console.debug("Attribute Presentation verified by orderID, orderID >>", orderID)
    console.debug("Verification result, verificationResult >>", verificationResult)
    return Boolean(verificationResult)
}

const isRevoked = (attributePresentation) => attributePresentation.output.meta.revoked

const getContent = (attributePresentation) => attributePresentation.output.content

module.exports = {
    requestAttributePresentation,
    verifyAttributePresentation,
    isRevoked,
    getContent,
};