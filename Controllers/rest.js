const axios = require("axios");
const { randomUUID } = require('crypto');
const FormData = require('form-data');
const { Readable } = require("stream");

const BASE_URL = "https://www.truthscreen.com/v1/apicall/";
const username = "production1@analogueitsolutions.com";

function generateShortNumericID() {
    const id = randomUUID().replace(/\D/g, '');
    return id;
}

function bufferToStream(buffer) {
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null); // Signals the end of the stream
    return readable;
}

module.exports = {
    verifyPassport: async (req, res) => {
        try {
            const { front_image, back_image } = req.files;
            // const front_image = req.files.front_image;
            // const back_image = req.files.back_image;
            // console.log("front_image", front_image);
            // console.log("back_image", back_image);
            if (!front_image || !back_image) {
                return res.status(400).json({ error: "Front and back images are required." });
            }
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
                        const tsTransID = tokenDecrypt.data.msg.tsTransID;
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
                        if (passPortData.status === 200) {
                            // console.log(passPortData);
                            return res.status(200).json({ passPortData: passPortData.data });
                        } else {
                            console.log("Error in verifying the passport details");
                            return
                        }
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
}