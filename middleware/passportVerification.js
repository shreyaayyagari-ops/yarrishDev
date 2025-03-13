const axios = require("axios");
const { randomUUID } = require('crypto');
const FormData = require('form-data');

const BASE_URL = "https://www.truthscreen.com/v1/apicall/";
const username = "production1@analogueitsolutions.com";

function generateShortNumericID() {
    const id = randomUUID().replace(/\D/g, '');
    return id;
}


exports.passportVerification = async (front_image, back_image) => {
    try {
        const front_image = front_image;
        const back_image = back_image;
        const transID = generateShortNumericID();
        const formData = new FormData();
        formData.append('transID', transID);
        formData.append('docType', '5');
        const generateToken = await axios.post("https://www.truthscreen.com/api/v2.2/idocr/token",
            formData,
            {
                headers: {
                    'username': `${username}`,
                    ...formData.getHeaders(),
                }
            }
        );
        if (generateToken.status === 200) {
            const responseData = generateToken.data.responseData;
            const tokenDecrypt = await axios.post("https://www.truthscreen.com/InstantSearch/decrypt_encrypted_string",
                { responseData: responseData },
                {
                    headers: {
                        'username': `${username}`,
                        'Content-Type': 'application/json'
                    }
                }
            )
            if (tokenDecrypt.status === 200) {
                const secretToken = tokenDecrypt.data.msg.secretToken;
                const tsTransID = tokenDecrypt.data.msg.tsTransID;
                // save the above transID and Secret Token
                // console.log(secretToken);
                // console.log(tsTransID);
                const formData2 = new FormData();
                formData2.append('secretToken', secretToken);
                const tokenEncrypt = await axios.post("https://www.truthscreen.com/api/v2.2/idocr/tokenEncrypt",
                    formData2,
                    {
                        headers: {
                            'username': `${username}`,
                            ...formData.getHeaders(),
                        }
                    }
                );
                if (tokenEncrypt.status === 200) {
                    const encryptedSecretToken = tokenEncrypt.data;
                    const formData3 = new FormData();
                    formData3.append('tsTransID', tsTransID);
                    formData3.append("secretToken", encryptedSecretToken);
                    const passPortData = await axios.post("https://www.truthscreen.com/api/v2.2/idocr/verify",
                        formData3,
                        {
                            headers: {
                                'username': `${username}`,
                                ...formData.getHeaders(),
                            }
                        }
                    );
                    return
                } else {
                    return
                }
            } else {
                return
            }
        } else {
            return
        }
    } catch (error) {
        console.log(error);
        return
    }
}