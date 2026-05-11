const HEX = "0123456789abcdefABCDEF";

const generateOTP = () => {
    let OTP = "";
    for (let i = 0; i < 6; i++) {
        OTP += HEX[Math.floor(Math.random() * 16)];
    }
    return OTP;
};

module.exports = generateOTP;