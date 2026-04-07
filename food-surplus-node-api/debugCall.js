const axios = require('axios');

async function debugCall() {
    try {
        console.log("Sending POST Request...");
        const res = await axios.post('http://localhost:5000/api/auth/login', { username: 'admin', password: 'admin123' });
        console.log("Success:", res.data);
    } catch (err) {
        console.error("Error:", err.response?.data);
    }
}
debugCall();
