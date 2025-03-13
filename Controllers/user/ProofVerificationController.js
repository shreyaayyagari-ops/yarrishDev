 const User = require('../../Models/userModel');
const axios = require("axios");
const jwt = require("jsonwebtoken");
const { randomUUID } = require('crypto');

const username = "production1@analogueitsolutions.com";

function generateShortNumericID() {
    const id = randomUUID().replace(/\D/g, '');
    return id;
}


module.exports = {
    aadhaarSendingOTP: async (req, res) => {
        try {
            const serviceProviderId = req.userId;
            const user = await User.findById(serviceProviderId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            const { aadhaarNumber } = req.body;
            if (!aadhaarNumber) {
                return res.status(400).json({ status: false, message: "Aadhaar number is required" });
            }
            if (aadhaarNumber.length !== 12 || !/^\d{12}$/.test(aadhaarNumber)) {
                return res.status(400).json({ status: false, message: "Invalid Aadhaar number" });
            }
            try {
                const transID = generateShortNumericID();
                const encryptingResponse = await axios.post('https://www.truthscreen.com/v1/apicall/encrypt',
                    {
                        "aadharNo": aadhaarNumber,
                        "transId": transID,
                        "docType": 211
                    },
                    {
                        headers: {
                            'username': `${username}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                if (encryptingResponse.status === 200) {
                    const requestData = encryptingResponse.data;
                    // console.log(encryptingResponse.data);
                    const requestDataResponse = await axios.post('https://www.truthscreen.com/v1/apicall/nid/aadhar_get_otp',
                        { "requestData": requestData },
                        {
                            headers: {
                                'username': `${username}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                    if (requestDataResponse.status === 200) {
                        const responseDataLink = requestDataResponse.data.responseData;
                        const decryptDataResponse = await axios.post('https://www.truthscreen.com/v1/apicall/decrypt',
                            { "responseData": responseDataLink },
                            {
                                headers: {
                                    'username': `${username}`,
                                    'Content-Type': 'application/json'
                                }
                            }
                        );
                        const decryptLink = decryptDataResponse.data.tsTransId;
                        user.decryptLink = decryptLink;
                        await user.save();
                        return res.status(200).json({ status: true, message: "OTP sent successfully"
                            // , data: decryptLink
                         });
                    } else {
                        console.log("Error in Aadhaar OTP retrieval");
                        return res.status(400).json({ status: false, message: "Failed to get OTP" });
                    }
                } else {
                    console.log("Error while encrypting the Aadhaar number");
                    return res.status(400).json({ status: false, message: "Failed to encrypt Aadhaar number" });
                }
            } catch (error) {
                console.error(error);
                return res.status(400).json({ status: false, message: "An error occurred while processing the request" });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    aadhaarVerifyingOTP: async (req, res) => {
        try {
            const { otp } = req.body;
            const authHeader = req.headers['authorization'];

            if (!authHeader) {
                return res.status(401).json({ message: 'Authorization token is missing' });
            } else {
                const token = authHeader.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const serviceProviderId = decoded.id;
                const user = await User.findById(serviceProviderId);

                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                } else {
                    const userDecryptLink = user.decryptLink;
                    // console.log(userDecryptLink);
                    if (!userDecryptLink) {
                        return res.status(400).json({ message: 'Decrypt link is not available for this user' });
                    } else {
                        const OTP = parseInt(otp);
                        const encryptAadhaarData = await axios.post("https://www.truthscreen.com/v1/apicall/encrypt",
                            {
                                "transId": userDecryptLink,
                                "otp": OTP
                            },
                            {
                                headers: {
                                    'username': `${username}`,
                                    'Content-Type': 'application/json'
                                }
                            }
                        );

                        if (encryptAadhaarData.status === 200) {
                            // console.log(encryptAadhaarData.data);
                            const requestData = encryptAadhaarData.data;
                            const submitOTP = await axios.post("https://www.truthscreen.com/v1/apicall/nid/aadhar_submit_otp",
                                { "requestData": requestData },
                                {
                                    headers: {
                                        'username': `${username}`,
                                        'Content-Type': 'application/json'
                                    }
                                }
                            );

                            if (submitOTP.status === 200) {
                                const responseData = submitOTP.data.responseData;
                                const aadhaarData = await axios.post("https://www.truthscreen.com/v1/apicall/decrypt",
                                    { responseData: responseData },
                                    {
                                        headers: {
                                            'username': `${username}`,
                                            'Content-Type': 'application/json'
                                        }
                                    }
                                );

                                if (aadhaarData.status === 200) {
                                    // console.log("successfully fetched the aadhaar details", aadhaarData.data);
                                    const decryptedAadhaarData = aadhaarData.data;
                                    const aadhaarNo = decryptedAadhaarData.aadhar_no;
                                    user.aadhar_no = aadhaarNo;
                                    user.aadhaarData = decryptedAadhaarData;
                                    user.sp_authenticated = true;
                                    user.screen_status = "dashboard";
                                    await user.save();

                                    return res.status(200).json({
                                        message: 'Aadhaar data successfully fetched and saved',
                                        screen_status: "dashboard"
                                    });
                                } else {
                                    return res.status(400).json({ message: 'Failed to decrypt Aadhaar data' });
                                }
                            } else {
                                return res.status(400).json({ message: 'Failed to submit Aadhaar OTP' });
                            }
                        } else {
                            return res.status(400).json({ message: 'Failed to encrypt Aadhaar data' });
                        }
                    }
                }
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: 'Multiple attempts failed. Please try again later',
            });
        }
    },

    verifyDrivingLicense: async (req, res) => {

        try {
            const authHeader = req.headers['authorization'];
            if (!authHeader) {
                return res.status(401).json({ message: 'Authorization token is missing' });
            }
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const serviceProviderId = decoded.id;

            const { drivingLicense, dob } = req.body;

            if (!drivingLicense || !dob) {
                return res.status(400).json({ message: 'drivingLicense, dob, and userId are required' });
            }
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
                );

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

                    if (decryptDataResponse.status === 200) {
                        const decryptedData = decryptDataResponse.data.msg;
                        // console.log(decryptedData);

                        const user = await User.findById(serviceProviderId);
                        if (user) {
                            user.drivers_license_no = drivingLicense;
                            user.screen_status = "dashboard";
                            user.sp_authenticated = true;
                            await user.save();
                            return res.status(200).json({ message: 'Driving license data verified and saved',
                                screen_status: "dashboard"
                             });
                        } else {
                            return res.status(400).json({ message: 'User not found' });
                        }
                    } else {
                        return res.status(400).json({ message: 'Error while decrypting the Driving license data' });
                    }
                } else {
                    return res.status(400).json({ message: 'Error while processing request data' });
                }
            } else {
                return res.status(400).json({ message: 'Error while encrypting the Driving license' });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }








}