const {isConnectionEstablished} = require("./connection");
const requestAttributePresentation = (orderID) => {
    console.debug("Requesting Attribute Presentation by orderID, orderID >>", orderID)
    isConnectionEstablished(orderID);
    //TODO this func should trigger a pop up in the Wallet via web hook, when connection is established
}

const verifierURL = process.env.HEIMDALL_VERIFIER_URL
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');

//TODO something goes wrong here with the file uploading, it's a temp solution to upload the files, it does not support long filenames etc.
const uploadAttributePresentationToVerifierHeimdall = async (fileName, attributePresentation) => {
    const tempFilePath = path.join(__dirname, fileName);
    await fs.writeFile(tempFilePath, JSON.stringify(attributePresentation));
    const curlCommand = `curl -s --request POST "http://${verifierURL}/upload/file?name=${fileName}" --form "uplfile=@${fileName}"`;

    await exec(curlCommand, async (error, stdout, stderr) => {
        await fs.unlink(tempFilePath)
        if (error) {
            throw error
        }
        if (stderr) {
            throw stderr
        }
        console.log(`stdout: ${stdout}`);
    });
}

const verifyAttributePresentation = async (orderID, attributePresentation) => {
    console.debug("Verifying Attribute Presentation by orderID, orderID >>", orderID)

    const attributePresentationFileName = `${orderID}.json`
    await uploadAttributePresentationToVerifierHeimdall(attributePresentationFileName, attributePresentation)

    const verificationResultFileName = `${orderID}.txt`
    const verificationResultResponse = await fetch(`http://${verifierURL}/heimdalljs/verify?path=${attributePresentationFileName}&name=${verificationResultFileName}`)
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