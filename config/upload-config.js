const multer = require("multer");
const fs = require("fs");
const path = require("path");
const dataHandler = require('../data/dataHandler');

// Настройки хранения для аватаров
const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dest = path.join(__dirname, '../public/img/avatar');
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        if (req.params.id) {
            const fileExt = path.extname(file.originalname);
            cb(null, `user${req.params.id}${fileExt}`);
        } else {
            const profileList = dataHandler.readData('data-profiles.json');
            const newUserId = profileList.profiles.length > 0
                ? profileList.profiles[profileList.profiles.length - 1].userId + 1
                : 1;
            cb(null, `user${newUserId}.jpg`);
        }
    },
});

// Настройки хранения для изображений туров
const tourStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dest = path.join(__dirname, '../public/img/tour');
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const tourId = req.params.id;
        const tourFolder = path.join(__dirname, '../public/img/tour');
        const existingFiles = fs.readdirSync(tourFolder)
            .filter(f => f.startsWith(`tour${tourId}-`) && f.endsWith(path.extname(file.originalname)));
        const nextIndex = existingFiles.length + 1;
        cb(null, `tour${tourId}-${nextIndex}${path.extname(file.originalname)}`);
    },
});

module.exports = { avatarStorage, tourStorage };
