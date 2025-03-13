const axios = require("axios");
const User = require('../Models/userModel');
const jwt = require("jsonwebtoken");
const { randomUUID } = require('crypto');
const FormData = require('form-data');
const { Readable } = require("stream");

const BASE_URL = "https://www.truthscreen.com/v1/apicall/";
const username = "production1@analogueitsolutions.com";

function generateShortNumericID() {
    const id = randomUUID().replace(/\D/g, '');
    return id.substring(0, 12); // Limit ID length
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
            const authHeader = req.headers['authorization'];
            if (!authHeader) {
                return res.status(401).json({ message: 'Authorization token is missing' });
            }
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const serviceProviderId = decoded.id;
            const front_image = req.files ? req.files.front_image : null;
            const back_image = req.files ? req.files.back_image : null;
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
                        'username': username,
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
                            'username': username,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                if (tokenDecrypt.status === 200) {
                    const tsTransID = tokenDecrypt.data.msg.tsTransID;
                    const secretToken = tokenDecrypt.data.msg.secretToken;
                    const formData2 = new FormData();
                    formData2.append('token', secretToken);
                    const tokenEncrypt = await axios.post("https://www.truthscreen.com/api/v2.2/idocr/tokenEncrypt",
                        formData2,
                        {
                            headers: {
                                'username': username,
                                ...formData2.getHeaders(),
                            }
                        }
                    );
                    if (tokenEncrypt.status === 200) {
                        const encryptedSecretToken = tokenEncrypt.data;
                        const formData3 = new FormData();
                        formData3.append('tsTransID', tsTransID);
                        formData3.append('secretToken', encryptedSecretToken);
                        formData3.append("front_image", bufferToStream(front_image.data), {
                            filename: front_image.name || "front_image.jpg",
                            contentType: front_image.mimetype || "application/octet-stream",
                        });
                        formData3.append("back_image", bufferToStream(back_image.data), {
                            filename: back_image.name || "back_image.jpg",
                            contentType: back_image.mimetype || "application/octet-stream",
                        });
                        const passPortData = await axios.post("https://www.truthscreen.com/api/v2.2/idocr/verify",
                            formData3,
                            {
                                headers: {
                                    'username': username,
                                    ...formData2.getHeaders(),
                                }
                            }
                        );
                        if (passPortData.status === 200) {
                            const passportResponseData = passPortData.data.responseData;
                            const passPortDetails = await axios.post("https://www.truthscreen.com/InstantSearch/decrypt_encrypted_string",
                                { responseData: passportResponseData },
                                {
                                    headers: {
                                        'username': username,
                                        'Content-Type': 'application/json',
                                    }
                                }
                            )
                            if (passPortDetails.status === 200) {
                                const userPassportDetails = passPortDetails.data.msg;
    
                                const user = await User.findById(serviceProviderId);
                                if (!user) {
                                    return res.status(404).json({ error: "Service provider not found." });
                                }
                                user.passportDetails = userPassportDetails;
                                user.screen_status = "dashboard";
                                user.sp_authenticated = true;
                                await user.save();
                                return res.status(200).json({
                                    message: "Passport verified successfully",
                                    // details: userPassportDetails,
                                    screen_status: "dashboard"
                                });
                            }
                        } else {
                            console.error("Error in verifying the passport details");
                            return res.status(500).json({ error: "Failed to verify passport details" });
                        }
                    } else {
                        console.error("Error in encrypting the secret token");
                        return res.status(500).json({ error: "Failed to encrypt secret token" });
                    }
                } else {
                    console.error("Error in decrypting the response data");
                    return res.status(500).json({ error: "Failed to decrypt response data" });
                }
            } else {
                console.error("Error in generating the token");
                return res.status(500).json({ error: "Failed to generate token" });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
};