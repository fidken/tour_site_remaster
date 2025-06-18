const fs = require("fs");
const path = require("path");
const multer = require("multer");
const dataHandler = require("../data/dataHandler");
// Чтение данных о турах
const tours = dataHandler.readData("data-tours.json");
// Настройка для аватаров
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(__dirname, "../public/img/avatar");
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname);
    console.log(req.params.id);
    const fileName = req.params.id
      ? `user${req.params.id}${fileExt}`
      : `user${Date.now()}${fileExt}`;
    cb(null, fileName);
  },
});

const uploadAvatar = multer({ storage: avatarStorage });

const tourStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    let tourId = req.params.id;

    // Генерация ID, если создается новый тур
    if (!tourId) {
      const maxId = tours.reduce((max, tour) => Math.max(max, tour.id), 0);
      tourId = maxId + 1;
      req.generatedId = tourId; // Сохраняем новый ID в запросе
    }

    const dest = path.join(__dirname, "../public/img/tour");
    try {
      if (!req.filesCleared) {
        if (fs.existsSync(dest)) {
          const filesToDelete = fs
            .readdirSync(dest)
            .filter((file) => file.startsWith(`tour${tourId}-`));
          for (const file of filesToDelete) {
            await fs.promises.unlink(path.join(dest, file));
          }
        } else {
          await fs.promises.mkdir(dest, { recursive: true });
        }
        req.filesCleared = true;
      }

      cb(null, dest);
    } catch (error) {
      console.error("Ошибка при очистке файлов:", error);
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const dest = path.join(__dirname, "../public/img/tour");
    const tourId = req.params.id || req.generatedId; // Используем либо переданный, либо сгенерированный ID
    const fileExt = path.extname(file.originalname);

    try {
      const files = fs.existsSync(dest)
        ? fs
            .readdirSync(dest)
            .filter((file) => file.startsWith(`tour${tourId}-`))
        : [];
      const nextIndex = files.length + 1;

      cb(null, `tour${tourId}-${nextIndex}${fileExt}`);
    } catch (error) {
      console.error("Ошибка при создании имени файла:", error);
      cb(error);
    }
  },
});

const uploadTour = multer({ storage: tourStorage, limits: { files: 5 } });

module.exports = { uploadAvatar, uploadTour };
