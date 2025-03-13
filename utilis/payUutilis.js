const crypto = require('crypto');

const { clientKey, salt } = require('../Config/payUConfig');

function generateHash(data) {
  const hashString = `${clientKey}|${data.txnid}|${data.amount}|${data.productinfo}|${data.firstname}|${data.email}|||||||||||${salt}`;
  return crypto.createHash('sha512').update(hashString).digest('hex');
}

  
  module.exports = { generateHash };