const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();

app.use(cors());
app.use(express.json());

const frontendDir = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendDir));

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;
    const cleanEmail = typeof email === 'string' ? email.trim() : '';

    if (!name || !cleanEmail || !message) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) {
        return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    try {
        await transporter.sendMail({
            from: `"${name}" <${process.env.EMAIL_USER}>`,
            replyTo: cleanEmail,
            to: process.env.EMAIL_USER,
            subject: `Portfolio Message from ${name}`,
            text: `Sender Name: ${name}\nSender Email: ${cleanEmail}\n\nMessage:\n${message}`,
        });

        res.status(200).json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Mail error:', error);
        res.status(500).json({ success: false, message: 'Failed to send email.' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});