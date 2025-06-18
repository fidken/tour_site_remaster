// admin.js
const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { uploadTour, uploadAvatar } = require("../middlewares/fileUpload");
const { readData, writeData } = require("../data/dataHandler");
const fs = require("fs");
const path = require("path");

const USERS_FILE = "data-users.json";
const CONFIG_FILE = "config.json";
const TOURS_FILE = "data-tours.json";
const ORDERS_FILE = "data-orders.json";

// Middleware
router.use(bodyParser.urlencoded({ extended: true }));

// Главная страница админки
router.get("/", authMiddleware.requireAdmin, (req, res) => {
  res.render("admin", { title: "Регистрация" });
});

// Редактирование профилей
router.get("/profiles-edit", authMiddleware.requireAdmin, (req, res) => {
  const users = readData(USERS_FILE);
  res.render("profiles-edit", { users });
});

// Редактирование туров
router.get("/tours-edit", authMiddleware.requireAdmin, (req, res) => {
  const config = readData(CONFIG_FILE);
  res.render("tours-edit", { tourTypes: config });
});

function formatDate(inputDate) {
  const months = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
  ];

  const date = new Date(inputDate);
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year} год`;
}

// Список заказов
router.get("/order-list", authMiddleware.requireAdmin, (req, res) => {
  // Пример: Чтение данных из JSON файла
  const ORDERS_FILE = JSON.parse(
    fs.readFileSync("./data/data-orders.json", "utf-8")
  );
  const USERS_FILE = JSON.parse(
    fs.readFileSync("./data/data-users.json", "utf-8")
  );
  const ordersWithUserDetails = ORDERS_FILE.map((order) => {
    const user = USERS_FILE.find(
      (user) => user.id.toString() === order.user_id.toString()
    );
    return {
      ...order,
      userDetails: user
        ? {
            firstName: user.first_name,
            lastName: user.last_name,
            phone: user.phone,
            email: user.email,
          }
        : null,
    };
  });

  res.render("order-list", { orders: ordersWithUserDetails, formatDate });
});

router.get("/user/:id", (req, res) => {
  const user = users.find((u) => u.id == req.params.id);
  if (user) {
    res.render("user", { user });
  } else {
    res.status(404).send("User not found");
  }
});

router.get("/order/:id", (req, res) => {
  const order = orders.find((o) => o.id == req.params.id);
  if (order) {
    res.render("order", { order, users });
  } else {
    res.status(404).send("Order not found");
  }
});

router.post("/update", (req, res) => {
  const { id, status, payment_status, total_amount } = req.body;
  const order = orders.find((o) => o.id == id);
  if (order) {
    order.status = status || order.status;
    order.payment_status = payment_status || order.payment_status;
    order.total_amount = total_amount || order.total_amount;
  }
  res.redirect(`/admin/order/${id}`);
});

router.get("/api/tours", (req, res) => {
  try {
    const tours = readData(TOURS_FILE);
    res.json(tours);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/tours/:id", (req, res) => {
  try {
    const tours = readData(TOURS_FILE);
    const tour = tours.find((t) => t.id === parseInt(req.params.id));
    if (!tour) {
      return res.status(404).json({ error: "Tour not found" });
    }
    console.log(tour);
    res.json(tour);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/tours", uploadTour.array("add-images", 5), (req, res) => {
  try {
    const tours = readData(TOURS_FILE);
    const updatedData = req.body;

    // Преобразование полей в нужные типы
    updatedData.duration = parseInt(updatedData.duration, 10);
    updatedData.price = parseFloat(updatedData.price);

    // Если `types` переданы как массив, сохраняем их напрямую
    updatedData.types = Array.isArray(updatedData.types)
      ? updatedData.types
      : [];

    // Преобразуем города в массив
    updatedData.cities = updatedData.cities
      ? updatedData.cities.split(",").map((c) => c.trim())
      : [];

    // Обработка загруженных изображений
    if (req.files && req.files.length > 0) {
      updatedData.images = req.files.map((file) => file.filename);
    }

    const newTour = {
      id: tours.length ? tours[tours.length - 1].id + 1 : 1,
      ...updatedData,
    };

    // Сохраняем новый тур
    tours.push(newTour);
    writeData(TOURS_FILE, tours);

    res.status(201).json(newTour);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновление тура
router.put("/api/tours/:id", uploadTour.array("edit-images", 5), (req, res) => {
  try {
    const tours = readData(TOURS_FILE);
    const index = tours.findIndex((t) => t.id === parseInt(req.params.id, 10));

    if (index === -1) {
      return res.status(404).json({ error: "Tour not found" });
    }

    // Парсинг данных из тела запроса
    const updatedData = req.body;

    // Конвертируем числовые значения
    updatedData.duration = parseInt(updatedData.duration, 10);
    updatedData.price = parseFloat(updatedData.price);

    // Конвертируем массивы
    updatedData.types = Array.isArray(updatedData.types)
      ? updatedData.types
      : updatedData.types.split(",").map((t) => t.trim());
    updatedData.cities = Array.isArray(updatedData.cities)
      ? updatedData.cities
      : updatedData.cities.split(",").map((c) => c.trim());
    updatedData.long_description = Array.isArray(updatedData.long_description)
      ? updatedData.long_description
      : JSON.parse(updatedData.long_description || "[]");
    updatedData.start_date = Array.isArray(updatedData.start_date)
      ? updatedData.start_date
      : JSON.parse(updatedData.start_date || "[]");

    // Обработка загруженных изображений
    if (req.files && req.files.length > 0) {
      updatedData.images = req.files.map((file) => file.filename);
    }

    // Обновляем данные
    tours[index] = {
      ...tours[index],
      ...updatedData,
      id: tours[index].id, // Сохраняем ID
    };

    writeData(TOURS_FILE, tours);
    res.json(tours[index]);
  } catch (error) {
    console.error("Error updating tour:", error);
    res.status(500).json({ error: error.message });
  }
});

// Удаление тура
router.delete("/api/tours/:id", (req, res) => {
  try {
    let tours = readData(TOURS_FILE);
    const index = tours.findIndex((t) => t.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ error: "Tour not found" });
    }

    const tour = tours[index];
    if (tour.images && Array.isArray(tour.images)) {
      tour.images.forEach((image) => {
        const imagePath = path.join(__dirname, "../public/img/tour", image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });
    }

    tours = tours.filter((t) => t.id !== parseInt(req.params.id));
    writeData(TOURS_FILE, tours);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить всех пользователей
router.get("/api/users", (req, res) => {
  try {
    const users = readData(USERS_FILE);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить пользователя по ID
router.get("/api/users/:id", (req, res) => {
  try {
    const users = readData(USERS_FILE);
    const user = users.find((u) => u.id === parseInt(req.params.id, 10));
    console.log(user);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Добавить нового пользователя
router.post("/api/users", (req, res) => {
  try {
    const users = readData(USERS_FILE);
    const newUser = {
      id: users.length ? users[users.length - 1].id + 1 : 1,
      first_name: req.body.first_name || "",
      last_name: req.body.last_name || "",
      email: req.body.email || "",
      phone: req.body.phone || "",
      password: req.body.password || "",
      avatar: req.body.avatar || "",
      admin: req.body.admin === "true",
      orders: [],
    };

    users.push(newUser);
    writeData(USERS_FILE, users);

    res.status(201).json(newUser);
  } catch (error) {
    console.log("Провал!");
    res.status(500).json({ error: error.message });
  }
});

// Обновить пользователя
router.put("/api/users/:id", uploadAvatar.single("avatar"), (req, res) => {
  console.log("[DEBUG] req.params.id:", req.params.id);
  console.log("[DEBUG] Файл:", req.file);
  console.log("[DEBUG] БОИ>:", req.body);

  if (!req.file) {
    return res.status(400).json({ message: "Файл не загружен" });
  }

  try {
    const profileList = readData(USERS_FILE);
    const userIndex = profileList.profiles.findIndex(
      (u) => u.userId === parseInt(req.params.id)
    );

    if (userIndex === -1) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    const user = profileList.profiles[userIndex];

    // Обновляем данные пользователя
    user.avatarUrl = `/img/avatar/${req.file.filename}`;
    profileList.profiles[userIndex] = { ...user, ...req.body };

    dataHandler.writeData(USERS_FILE, profileList);

    res.json({ message: "Профиль обновлён", user });
  } catch (err) {
    console.error("[ERROR] Ошибка при обработке:", err);
    res
      .status(500)
      .json({ message: "Внутренняя ошибка сервера", error: err.message });
  }
});

// Удалить пользователя
router.delete("/api/users/:id", (req, res) => {
  try {
    let users = readData(USERS_FILE);
    const index = users.findIndex((u) => u.id === parseInt(req.params.id, 10));
    if (index === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    users = users.filter((u) => u.id !== parseInt(req.params.id, 10));
    writeData(USERS_FILE, users);

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Статистика
router.get("/stats", authMiddleware.requireAdmin, (req, res) => {
  res.render("stats", { title: "Регистрация" });
});

module.exports = router;
