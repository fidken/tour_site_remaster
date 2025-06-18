// main.js
const express = require("express");
const router = express.Router();
const dataHandler = require("../data/dataHandler");
const authMiddleware = require("../middlewares/authMiddleware");
const { uploadAvatar } = require("../middlewares/fileUpload"); // Middleware для загрузки аватара

// Подключение базы данных
const tours = dataHandler.readData("data-tours.json");
// Чтение данных пользователей
const users = dataHandler.readData("data-users.json");

const CONFIG_FILE = "config.json";
// Определяем функцию formatDate
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

router.get("/", (req, res) => {
  const tours = dataHandler.readData("data-tours.json");
  const tourTypes = dataHandler.readData(CONFIG_FILE);

  // Фильтрация по признаку "visible": "true"
  const visibleTours = tours.filter((tour) => tour.visible === "true");
  console.log(visibleTours);
  res.render("index", {
    tours: visibleTours,
    tourTypes,
    isHomePage: true,
    formatDate,
  });
});

router.get("/registration", (req, res) => {
  res.render("registration", { title: "Регистрация" });
});

router.get("/login", (req, res) => {
  res.render("login", { title: "Вход" });
});

router.get("/booking", (req, res) => {
  res.render("booking", { title: "Бронирование и оплата" });
});

// Обработчик формы входа
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);

  const users = dataHandler.readData("data-users.json");
  // Проверка наличия пользователя с такими данными
  const user = users.find(
    (user) => user.email === email && user.password === password
  );

  if (user) {
    // Установка сессии
    req.session.userId = user.id;
    req.session.isAdmin = user.admin;
    res.redirect("/"); // Редирект на главную страницу после успешного входа
  } else {
    // Возврат на страницу входа с ошибкой
    res.status(401).send("Неверный email или пароль");
  }
});

// Обработчик выхода
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Ошибка при уничтожении сессии:", err);
      return res.status(500).send("Ошибка выхода");
    }
    // Удаляем cookie сессии
    res.clearCookie("connect.sid"); // Имя cookie из настроек express-session
    res.redirect("/login"); // Перенаправление на страницу входа
  });
});

router.get("/cart", (req, res) => {
  res.render("cart", { title: "Корзина" });
});

// Функция для получения пользователя по ID
const getUserById = (userId) => {
  const users = dataHandler.readData("data-users.json");
  return users.find((user) => user.id === userId);
};

// Функция для получения заказов пользователя по его ID
const getOrdersByUserId = (userId) => {
  // Приведение userId к строке для унификации
  const userIdStr = String(userId);

  // Проверка на валидность userId
  if (!userIdStr) {
    throw new Error("Invalid user ID provided");
  }

  // Чтение данных из файла
  const orders = dataHandler.readData("data-orders.json");

  // Проверка, что данные загружены корректно
  if (!Array.isArray(orders)) {
    throw new Error("Failed to load orders data");
  }

  // Фильтрация заказов по user_id
  const userOrders = orders.filter(
    (order) => String(order.user_id) === userIdStr
  );

  return userOrders;
};

router.get("/profile", authMiddleware.requireAuth, (req, res) => {
  const userId = req.session.userId; // Получение ID пользователя из сессии
  const user = getUserById(userId); // Получаем данные пользователя
  const orders = getOrdersByUserId(userId); // Получаем заказы пользователя

  // Объявляем объект статусов вне цикла each
  let statusTranslation = {
    active: "Новый",
    inactive: "В работе",
    pending: "Подтверждено",
    not_confirmed: "Не подтверждено",
    completed: "Оплата получена",
    "in-progress": "Ожидаем оплаты",
    cancelled: "Отмена",
  };
  if (!user) {
    return res.status(404).send("Пользователь не найден");
  }
  console.log(user);
  console.log(orders);
  res.render("profile", {
    title: "Профиль",
    user: user,
    orders: orders,
    statusTranslation,
  });
});

router.get("/tour/:id", (req, res) => {
  const tourId = req.params.id;
  const tours = dataHandler.readData("data-tours.json");
  const tour = tours.find((t) => t.id === parseInt(tourId));
  console.log(tour);

  if (!tour) {
    return res.status(404).send("Тур не найден");
  }

  res.render("tour", { tour, formatDate });
});

router.post(
  "/profile-registration",
  uploadAvatar.single("avatar"),
  (req, res) => {
    try {
      const profileList = dataHandler.readData("data-users.json");
      const { firstName, lastName, email, phone, password } = req.body;

      // Проверяем обязательные поля
      if (![firstName, lastName, email, phone, password].every(Boolean)) {
        return res.status(400).json({
          success: false,
          message: "Все поля обязательны для заполнения",
        });
      }

      // Проверка на уникальность email и телефона
      const isEmailExist = profileList.some((user) => user.email === email);
      const isPhoneExist = profileList.some((user) => user.phone === phone);

      if (isEmailExist) {
        return res
          .status(400)
          .json({ success: false, message: "Этот email уже используется" });
      }

      if (isPhoneExist) {
        return res.status(400).json({
          success: false,
          message: "Этот номер телефона уже используется",
        });
      }

      const newUserId = (profileList.at(-1)?.id || 0) + 1; // Определяем новый ID
      const avatar = req.file ? req.file.filename : "default-avatar.jpg";

      // Создаем нового пользователя
      const newUser = {
        id: newUserId,
        first_name: firstName,
        last_name: lastName,
        phone,
        password, // Здесь рекомендуется хэшировать пароль перед сохранением
        email,
        orders: [],
        admin: false,
        avatar,
      };

      profileList.push(newUser);
      dataHandler.writeData("data-users.json", profileList);

      // res.status(201).json({ success: true, message: 'Пользователь успешно зарегистрирован' });
      res.redirect("/login");
    } catch (error) {
      console.error("[ERROR]", error);
      res
        .status(500)
        .json({ success: false, message: "Внутренняя ошибка сервера" });
    }
  }
);

module.exports = router;
