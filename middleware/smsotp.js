const axios = require('axios');
const User = require('../Models/userModel')

// Function to generate a random 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000);

async function sendOTP(toMobileNo, otp) {
  if (toMobileNo == '8012981059' || toMobileNo == '8012981059') { //surya number - 123456
    otp = '123456';
  }
  const apiUrl = 'http://login4.spearuc.com/MOBILE_APPS_API/sms_api.php';
  const params = {
    type: 'smsquicksend',
    authKey: 'GbdmTSsqJnDlk9Y9GkDk',
    sender: 'YAARIS',
    to_mobileno: toMobileNo,
    sms_text: `Dear user, Your OTP is ${otp}. Please verify. For your registration, it is valid for 10 minutes. YAARISHHH`,
    t_id: '1707171342391196572',
  };
  try {
    const response = await axios.get(apiUrl, { params });
    if (response.data.status === 'success') {
      console.log('OTP sent successfully');
      return true;
    } else {
      console.error('Failed to send OTP:', response.data.Message);
      return false;
    }
  } catch (error) {
    console.error('Error sending OTP:', error.message);
    return false;
  }
}

module.exports = { sendOTP };
