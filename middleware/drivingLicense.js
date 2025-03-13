const axios = require("axios");
const { randomUUID } = require('crypto');

const username = "production1@analogueitsolutions.com";

function generateShortNumericID() {
    const id = randomUUID().replace(/\D/g, '');
    return id;
}

exports.verifyDrivingLicense = async (drivingLicense, dob) => {//dob : dd-mm-yyyy
    try {
        const transID = generateShortNumericID();
        const encryptDrivingLicenseData = await axios.post("https://www.truthscreen.com/InstantSearch/encrypted_string",
            {
                "transID": transID,
                "docType": "326",
                "docNumber": drivingLicense,
                "dob": dob
            },
            {
                headers: {
                    'username': `${username}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        if (encryptDrivingLicenseData.status === 200) {
            const requestData = encryptDrivingLicenseData.data;
            const requestDataResponse = await axios.post("https://www.truthscreen.com/api/v2.2/idsearch",
                { "requestData": requestData },
                {
                    headers: {
                        'username': `${username}`,
                        'Content-Type': 'application/json'
                    }
                }
            )
            if (requestDataResponse.status === 200) {
                const responseDataLink = requestDataResponse.data.responseData;
                const decryptDataResponse = await axios.post("https://www.truthscreen.com/InstantSearch/decrypt_encrypted_string",
                    { "responseData": responseDataLink },
                    {
                        headers: {
                            'username': `${username}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                if(decryptDataResponse.status === 200) {
                    console.log("Driving license data",decryptDataResponse.data.msg);
                    return
                } else {
                    console.log("Error while decrypting the Driving license data");
                    return
                }
            } else {
                console.log("Getting error in request data");
                return
            }
        } else {
            console.log("Error while encrypting the Driving license");
            return
        }
    } catch (error) {
        console.log(error);
        return
    }
}