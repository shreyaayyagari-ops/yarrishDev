const axios = require("axios");
const { randomUUID } = require('crypto');
const User = require('../Models/userModel');

const BASE_URL = "https://www.truthscreen.com/v1/apicall/";
const username = "production1@analogueitsolutions.com";

function generateShortNumericID() {
    const id = randomUUID().replace(/\D/g, '');
    return id;
}

exports.aadhaarSendingOTP = async (aadhaarNumber) => {
    try {
        if (!aadhaarNumber) {
            return res.json({ status: true, message: "Invalid aadhaar number" });
        }
        if (!aadhaarNumber || aadhaarNumber.length !== 12 || !/^\d{12}$/.test(aadhaarNumber)) {
            return res.status(400).json({ status: true, message: "Invalid aadhaar number" });
        }
        try {
            const transID = generateShortNumericID();
            const encryptingResponse = await axios.post(`https://www.truthscreen.com/v1/apicall/encrypt`,
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
            )
            if (encryptingResponse.status === 200) {
                const requestData = encryptingResponse.data;
                const requestDataResponse = await axios.post(`https://www.truthscreen.com/v1/apicall/nid/aadhar_get_otp`,
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
                    const decryptDataResponse = await axios.post(`https://www.truthscreen.com/v1/apicall/decrypt`,
                        { "responseData": responseDataLink },
                        {
                            headers: {
                                'username': `${username}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    )
                    const decryptLink = decryptDataResponse.data.tsTransId;
                    console.log("decryptLink", decryptLink);
                    //save the above decrypt link in the data base
                    

                } else {
                    console.log("Getting error in aadhaar get otp");
                    return
                }
            } else {
                console.log("Error while encrypting the aadhaar number");
                return
            }
        } catch (error) {
            console.error(error);
            return res.status(400)
        }
    } catch (error) {
        console.log(error);
        return
    }
}

exports.aadhaarVerifyingOTP = async (decryptLink, otp) => {
    try {
        const OTP = parseInt(otp);
        const encryptAadhaarData = await axios.post("https://www.truthscreen.com/v1/apicall/encrypt",
            {
                "transId": decryptLink,
                "otp": OTP
            },
            {
                headers: {
                    'username': `${username}`,
                    'Content-Type': 'application/json'
                }
            }
        )
        if (encryptAadhaarData.status === 200) {
            const requestData = encryptAadhaarData.data;
            const submitOTP = await axios.post("https://www.truthscreen.com/v1/apicall/nid/aadhar_submit_otp",
                { "requestData": requestData },
                {
                    headers: {
                        'username': `${username}`,
                        'Content-Type': 'application/json'
                    }
                }
            )
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
                )
                if(aadhaarData.status === 200) {
                    console.log("successfully fetched the aadhaar details",aadhaarData.data)
                    return
                } else {
                    console.log("Error in while decrytping the response data url")
                    return
                }
            } else {
                console.log("Error in submitting the OTP");
                return
            }
            return
        } else {
            console.log("Error in encrypt data");
            return
        }
    } catch (error) {
        console.log(error);
        return
    }
}

    
