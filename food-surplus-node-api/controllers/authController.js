const { sequelize, User, Restaurant, NGO } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/emailService');

exports.registerUser = async (req, res) => {
    // Start a transaction
    const t = await sequelize.transaction();

    try {
        const { username, password, email, contactNumber, role, address, registrationCertificate } = req.body;
        const documentUrl = req.file ? `/uploads/${req.file.filename}` : null;

        // Check if user exists by username or email
        let user = await User.findOne({ 
            where: { 
                [Op.or]: [
                    { username },
                    { email }
                ] 
            } 
        });

        if (user) {
            await t.rollback();
            if (user.username === username) return res.status(400).json({ msg: 'A user with this name already exists' });
            if (user.email === email) return res.status(400).json({ msg: 'This email is already in use' });
        }

        // Check if other critical details are duplicates in Restaurant or NGO tables
        const duplicateConditions = [];
        if (contactNumber) duplicateConditions.push({ contactNumber });
        if (address) duplicateConditions.push({ address });
        if (registrationCertificate) duplicateConditions.push({ registrationCertificate });

        if (duplicateConditions.length > 0) {
            const duplicateRestaurant = await Restaurant.findOne({ where: { [Op.or]: duplicateConditions } });
            if (duplicateRestaurant) {
                await t.rollback();
                if (contactNumber && duplicateRestaurant.contactNumber === contactNumber) return res.status(400).json({ msg: 'Contact number already in use by a Restaurant' });
                if (address && duplicateRestaurant.address === address) return res.status(400).json({ msg: 'Address already registered to a Restaurant' });
                if (registrationCertificate && duplicateRestaurant.registrationCertificate === registrationCertificate) return res.status(400).json({ msg: 'Certificate ID already in use by a Restaurant' });
            }

            const duplicateNGO = await NGO.findOne({ where: { [Op.or]: duplicateConditions } });
            if (duplicateNGO) {
                await t.rollback();
                if (contactNumber && duplicateNGO.contactNumber === contactNumber) return res.status(400).json({ msg: 'Contact number already in use by an NGO' });
                if (address && duplicateNGO.address === address) return res.status(400).json({ msg: 'Address already registered to an NGO' });
                if (registrationCertificate && duplicateNGO.registrationCertificate === registrationCertificate) return res.status(400).json({ msg: 'Certificate ID already in use by an NGO' });
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user with transaction
        user = await User.create({
            username,
            email,
            password: hashedPassword,
            role
        }, { transaction: t });

        // Create associated profile based on role with transaction
        if (role === 'RESTAURANT') {
            await Restaurant.create({
                userId: user.userId, // Matches the field name in model
                restaurantName: username,
                address: address || '',
                contactNumber: contactNumber || '',
                registrationCertificate: registrationCertificate || '',
                documentUrl: documentUrl || ''
            }, { transaction: t });
        } else if (role === 'NGO') {
            await NGO.create({
                userId: user.userId, // Matches the field name in model
                ngoName: username,
                address: address || '',
                contactNumber: contactNumber || '',
                registrationCertificate: registrationCertificate || '',
                documentUrl: documentUrl || ''
            }, { transaction: t });
        }

        // Commit the transaction
        await t.commit();

        // Send Welcome & Pending Verification Email
        if (email) {
            await sendEmail({
                email: email,
                subject: 'Registration Received - Pending Admin Approval',
                message: `Hello ${username},\n\nThank you for joining the Food Surplus Network!\n\nYour application and compliance documents are currently under review by our administration team. This process typically takes 24-48 hours. Once approved, you will be fully unlocked to participate in the network.\n\nThank you for helping us make a difference!`
            });
        }

        // Create token
        const payload = {
            user: {
                id: user.userId,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.userId, username: user.username, role: user.role } });
            }
        );
    } catch (err) {
        // Rollback on error
        await t.rollback();
        console.error('Registration Error:', err);
        // Send actual error message for debugging
        res.status(500).send('Server Error: ' + err.message);
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const cleanUsername = username ? username.trim() : '';

        // Check user
        const user = await User.findOne({ where: { username: cleanUsername } });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials (User not found)' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials (Password mismatch)' });
        }

        // Return token
        const payload = {
            user: {
                id: user.userId,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.userId, username: user.username, role: user.role } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] },
            include: [
                { model: Restaurant, required: false },
                { model: NGO, required: false }
            ]
        });
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.updateRegistration = async (req, res) => {
    try {
        const { address, registrationCertificate } = req.body;
        const documentUrl = req.file ? `/uploads/${req.file.filename}` : null;
        const userId = req.user.id; // From auth middleware

        // Find user to check role
        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        let profile = null;

        if (user.role === 'RESTAURANT') {
            profile = await Restaurant.findOne({ where: { userId } });
        } else if (user.role === 'NGO') {
            profile = await NGO.findOne({ where: { userId } });
        }

        if (!profile) {
            return res.status(404).json({ msg: 'Profile not found' });
        }

        if (profile.verificationStatus !== 'REJECTED' && profile.verificationStatus !== 'REVERTED') {
            return res.status(400).json({ msg: 'You can only update your registration if it was reverted or rejected.' });
        }

        profile.address = address;
        profile.registrationCertificate = registrationCertificate;
        if (documentUrl) {
            profile.documentUrl = documentUrl;
        }
        
        // Reset the status to pending for admin re-review
        profile.verificationStatus = 'PENDING';
        profile.adminMessage = null;

        await profile.save();

        res.json({ msg: 'Registration updated successfully. Status is now PENDING review.' });
    } catch (err) {
        console.error('Update Registration Error:', err);
        res.status(500).send('Server Error: ' + err.message);
    }
};

exports.checkDuplicates = async (req, res) => {
    try {
        const { email, contactNumber, username, password } = req.body;
        
        if (email) {
            const user = await User.findOne({ where: { email } });
            if (user) return res.status(400).json({ msg: 'This email is already in use' });
        }
        
        if (contactNumber) {
            const rest = await Restaurant.findOne({ where: { contactNumber } });
            if (rest) return res.status(400).json({ msg: 'Contact number already in use by a Restaurant' });
            
            const ngo = await NGO.findOne({ where: { contactNumber } });
            if (ngo) return res.status(400).json({ msg: 'Contact number already in use by an NGO' });
        }
        
        if (username) {
            const user = await User.findOne({ where: { username } });
            if (user) return res.status(400).json({ msg: 'A user with this name already exists' });
        }
        
        if (password) {
            // Check all users' hashed passwords sequentially to guarantee uniqueness globally
            const users = await User.findAll({ attributes: ['password'] });
            for (let u of users) {
                const isMatch = await bcrypt.compare(password, u.password);
                if (isMatch) return res.status(400).json({ msg: 'This password is already taken, please use another password' });
            }
        }
        
        res.json({ msg: 'OK' });
    } catch (err) {
        console.error('Check Duplicates Error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};
