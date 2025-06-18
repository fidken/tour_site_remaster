const express = require('express');
const router = express.Router();
const { uploadAvatar } = require('../middlewares/fileUpload');
const { registerProfile } = require('../controllers/profileController');

// Регистрация пользователя
router.post('/profile-registration', uploadAvatar.single('avatar'), registerProfile);

module.exports = router;
