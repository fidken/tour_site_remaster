// Импортируем необходимые модули
const express = require("express"); // Основной фреймворк для создания сервера
const path = require("path"); // Модуль для работы с путями файловой системы
const session = require("express-session"); // Модуль для управления сессиями
const fs = require("fs");
const { uploadAvatar } = require("./middlewares/fileUpload");
const archiver = require("archiver");
const nodemailer = require("nodemailer");

// Настройка SMTP-транспортера для Mail.ru
const transporter = nodemailer.createTransport({
  host: "smtp.mail.ru",
  port: 465,
  secure: true, // true для портов 465, false для 587
  auth: {
    user: "info.komilfotours@mail.ru", // Ваша почта
    pass: "QdBLHXVtLzx0tkzcH4TX", // Ваш пароль
  },
});
const DATA_FILE_NAME = "data-orders.json";
const bodyParser = require("body-parser");

// Импортируем обработчик данных
const dataHandler = require("./data/dataHandler");

// Импортируем маршруты
const adminRouter = require("./routes/admin"); // Маршруты для администраторов
const mainRouter = require("./routes/main"); // Основные маршруты приложения
const profileRoutes = require("./routes/profileRoutes");

// Импортируем промежуточное ПО для аутентификации
const authMiddleware = require("./middlewares/authMiddleware");

const app = express();

// Установка Pug в качестве движка шаблонов
app.set("view engine", "pug");
app.set("views", "./views");

// Функция для чтения данных из JSON-файла

app.get("/index-all-tours", async (req, res) => {
  try {
    console.log("Что то в этом есть");
    const tours = dataHandler.readData("data-tours.json");
    // Фильтрация по признаку "visible": "true"
    console.log(typeof tours[0].visible);
    const visibleTours = tours.filter((tour) => tour.visible === "true");
    console.log("Отправка туров:", visibleTours);
    res.json(visibleTours);
  } catch (error) {
    console.error("Ошибка при отправке туров:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Настройка сессий
app.use(
  session({
    secret: "your-secret-key", // Любая строка, используемая для подписи cookie
    resave: false, // Не сохранять сессию повторно, если не было изменений
    saveUninitialized: false, // Не сохранять пустую сессию
    cookie: { secure: false }, // Установите true, если используется HTTPS
  })
);

// Симуляция авторизации
// app.use((req, res, next) => {
//     if (!req.session.userId) {
//         req.session.userId = 1; // Симуляция ID авторизованного пользователя
//         req.session.isAdmin = true; // Симуляция админа
//     }
//     next();
// });

// Подключение middleware
app.use(authMiddleware.checkAuth);
app.use(bodyParser.json());

// Подключение статических файлов
app.use(express.static(path.join(__dirname, "public")));
app.use("/files", express.static(path.join(__dirname, "files")));
app.use(
  "/img/avatar",
  express.static(path.join(__dirname, "public/img/avatar"))
);
app.use("/img/tour", express.static(path.join(__dirname, "public/img/tour")));

// Подключение маршрутов
app.use("/admin", adminRouter);
app.use("/", mainRouter);

// Определяем путь к директории с JSON-файлами
const JSON_DIR = path.join(__dirname, "data");
console.log(`JSON directory: ${JSON_DIR}`);

// Роут для получения списка доступных файлов
app.get("/files", (req, res) => {
  fs.readdir(JSON_DIR, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read directory" });
    }
    const jsonFiles = files.filter((file) => file.endsWith(".json"));
    res.json(jsonFiles);
  });
});

// Роут для скачивания конкретного файла
app.get("/download/:filename", (req, res) => {
  const { filename } = req.params;

  if (path.extname(filename) !== ".json") {
    return res.status(400).json({ error: "Only JSON files can be downloaded" });
  }

  const filePath = path.join(JSON_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  res.download(filePath, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Failed to download file");
    }
  });
});

// Маршрут для скачивания изображений
app.get("/api/download-images", (req, res) => {
  const output = fs.createWriteStream(path.join(__dirname, "images.zip"));
  const archive = archiver("zip", { zlib: { level: 9 } });

  output.on("close", () => {
    console.log(`Archive created, total bytes: ${archive.pointer()}`);
    res.download(path.join(__dirname, "images.zip"), "images.zip", (err) => {
      if (err) {
        console.error(err);
      }
      fs.unlinkSync(path.join(__dirname, "images.zip")); // Удалить архив после скачивания
    });
  });

  archive.on("error", (err) => {
    console.error(err);
    res.status(500).send("Error while creating archive");
  });

  archive.pipe(output);

  // Добавляем папки к архиву
  archive.directory(path.join(__dirname, "public/img/tour"), "tour");
  archive.directory(path.join(__dirname, "public/img/avatar"), "avatar");

  archive.finalize();
});
// Роут для отправки заказов
// app.post('/api/orders', (req, res) => {
//   try {
//       console.log("Получен запрос: " + JSON.stringify(req.body));
//       const cart = req.body; // Получаем массив заказов из тела запроса

//       if (!cart || !cart.length) {
//           return res.status(400).json({ message: 'Корзина пуста, нет заказов для отправки.' });
//       }

//       // Получаем данные о пользователе
//       const userId = 2; // Симуляция пользователя с ID 2
//       const users = dataHandler.readData('data-users.json');

//       // Проверяем, существует ли такой пользователь
//       const user = users.find(user => user.id === userId);
//       if (!user) {
//           return res.status(400).json({ message: 'Пользователь не найден.' });
//       }

//       const orders = dataHandler.readData('data-orders.json');
//       const newOrders = [];

//       // Создаем заказы
//       cart.forEach((tour, index) => {
//           const newOrder = {
//               id: (orders.length + 1).toString(), // Новый ID заказа как строка
//               tour_id: tour.id.toString(),
//               user_id: userId.toString(),
//               user_comment: tour.comment || "Без комментариев",
//               people_count: tour.quantity.toString(),
//               total_service_cost: (tour.price * tour.quantity).toString(), // Общая стоимость услуги
//               amount_paid: "0", // Сумма, пока не оплачена
//               admin_comment_public: "",
//               admin_comment_private: "",
//               status: "active", // Статус заказа
//               processing_status: "in-progress" // Статус обработки
//           };

//           orders.push(newOrder);
//           newOrders.push(newOrder.id);

//           // Прикрепляем заказ к пользователю
//           user.orders.push(newOrder.id);
//       });

//       // Записываем новые данные в файлы
//       dataHandler.writeData('data-orders.json', orders);
//       dataHandler.writeData('data-users.json', users);

//       // Отправляем успешный ответ
//       res.status(200).json({ message: 'Заказы успешно отправлены!', orders: newOrders });
//   } catch (error) {
//       console.error('Ошибка при обработке заказов:', error);
//       res.status(500).json({ message: 'Произошла ошибка при обработке заказов.' });
//   }
// });

app.post("/api/orders", (req, res) => {
  try {
    console.log("Получен запрос: " + JSON.stringify(req.body));
    const cart = req.body; // Получаем массив заказов из тела запроса

    if (!cart || !cart.length) {
      return res
        .status(400)
        .json({ message: "Корзина пуста, нет заказов для отправки." });
    }

    // const userId = 3; // Симуляция пользователя с ID 2
    const users = dataHandler.readData("data-users.json");
    const user = users.find((user) => user.id === req.session.userId);

    if (!user) {
      return res.status(400).json({ message: "Пользователь не найден." });
    }

    const orders = dataHandler.readData("data-orders.json");
    const newOrders = [];

    // Создаем заказы
    cart.forEach((tour, index) => {
      const newOrder = {
        id: (orders.length + 1).toString(),
        tour_id: tour.id.toString(),
        user_id: req.session.userId.toString(),
        user_comment: tour.comment || "Без комментариев",
        selected_dates: tour.dates || "Ошибка выбора дат",
        people_count: tour.quantity.toString(),
        total_service_cost: (tour.price * tour.quantity).toString(),
        amount_paid: "0",
        admin_comment_public: "",
        admin_comment_private: "",
        status: "active",
        processing_status: "Ожидаем оплаты",
      };

      orders.push(newOrder);
      newOrders.push(newOrder.id);
      user.orders.push(newOrder.id);
    });

    // Записываем новые данные
    dataHandler.writeData("data-orders.json", orders);
    dataHandler.writeData("data-users.json", users);

    // Формируем данные для письма
    const orderDetails = cart
      .map(
        (tour, index) => `
          Тур ${index + 1}: ${tour.name}
          Дата: ${tour.date}
          Количество участников: ${tour.quantity}
      `
      )
      .join("\n");

    const mailOptions = {
      from: '"Комильфо Турс" <info.komilfotours@mail.ru>',
      to: user.email,
      subject: "Заявка на бронирование в работе",
      text: `
                ${user.first_name}, здравствуйте!

                Благодарим вас за выбор турагентства "Комильфо"! Ваш заказ был успешно оформлен, и в ближайшее время наши менеджеры свяжутся с вами для подтверждения.

                Вы можете отслеживать статус вашего бронирования и получить дополнительную информацию в своем личном кабинете по следующей ссылке:
                https://toursitealpha-production.up.railway.app/login

                Мы надеемся, что ваши путешествия с нами будут незабываемыми! Если у вас возникнут вопросы, пожалуйста, свяжитесь с нами по телефону +7 (4012) 378-368 или электронной почте info.komilfotours@mail.ru.

                С уважением,
                Команда турагентства "Комильфо"
            `,
    };
    //Отправка туров
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Ошибка при отправке письма:", error);
        // Проверяем, был ли уже отправлен ответ
        if (!res.headersSent) {
          return res
            .status(500)
            .json({ message: "Произошла ошибка при отправке письма." });
        }
      }

      // Проверяем, был ли уже отправлен ответ
      if (!res.headersSent) {
        console.log("Письмо успешно отправлено:", info.response);
        res
          .status(200)
          .json({ message: "Заказы успешно отправлены!", orders: newOrders });
      }
    });
  } catch (error) {
    console.error("Ошибка при обработке заказов:", error);
    res
      .status(500)
      .json({ message: "Произошла ошибка при обработке заказов." });
  }
});

app.post("/profile/:id", uploadAvatar.single("avatar"), (req, res) => {
  console.log(req.body);
  const { firstName, lastName, email, phone, id } = req.body;
  let avatar = req.body.avatar;

  avatar = `user${id}.jpg`;
  fs.readFile(
    path.join(__dirname, "data/data-users.json"),
    "utf8",
    (err, data) => {
      if (err) {
        return res.status(500).send("Error reading user data");
      }

      let users = JSON.parse(data);
      const userIndex = users.findIndex((user) => user.id === parseInt(id));

      if (userIndex !== -1) {
        // Обновление данных пользователя
        users[userIndex] = {
          ...users[userIndex],
          avatar,
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
        };

        // Запись обновленных данных в файл
        fs.writeFile(
          path.join(__dirname, "data/data-users.json"),
          JSON.stringify(users, null, 2),
          (err) => {
            if (err) {
              return res.status(500).send("Error saving user data");
            }
            res.redirect("/profile");
          }
        );
      } else {
        res.status(404).send("User not found");
      }
    }
  );
});

// Функция для записи данных в JSON-файл

// Маршрут для обновления заказа
app.post("/save-order", (req, res) => {
  const updates = req.body;

  // Проверка наличия ID
  if (!updates.id) {
    return res.status(400).json({ error: "Order ID is required." });
  }

  try {
    // Чтение текущих данных
    const orders = dataHandler.readData(DATA_FILE_NAME);

    console.log(updates.id);
    // Поиск заказа по ID
    const orderIndex = orders.findIndex((order) => order.id === updates.id);

    if (orderIndex === -1) {
      return res.status(404).json({ error: "Order not found." });
    }

    // Преобразуем текстовый visible в булевый тип, если он существует
    if (updates.visible !== undefined) {
      updates.visible = updates.visible === "true";
    }

    // Обновление только переданных полей
    orders[orderIndex] = { ...orders[orderIndex], ...updates };

    // Запись обновленных данных обратно в файл
    dataHandler.writeData(DATA_FILE_NAME, orders);
    const users = dataHandler.readData("data-users.json");
    const userId = orders[orderIndex].user_id; // Предполагается, что user_id указан в заказе

    // Находим пользователя по ID
    const user = users.find((user) => user.id === Number(userId));

    if (user) {
      console.log("Пользователь найден:", user);
      console.log("Email пользователя:", user.email);
    } else {
      console.error("Пользователь с указанным user_id не найден.");
    }

    const mailOptions = {
      from: '"Комильфо Турс" <info.komilfotours@mail.ru>',
      to: user.email,
      subject: "Информация по бронированию",
      text: `
            ${user.first_name}, здравствуйте!

            Мы хотим сообщить вам, что статус вашего заказа был обновлен. 

            Вы можете отслеживать статус вашего бронирования и получить дополнительную информацию в своем личном кабинете по следующей ссылке:
            https://toursitealpha-production.up.railway.app/login

            Мы надеемся, что ваши путешествия с нами будут незабываемыми! Если у вас возникнут вопросы, пожалуйста, свяжитесь с нами по телефону +7 (4012) 378-368 или электронной почте info.komilfotours@mail.ru.

            С уважением,
            Команда турагентства "Комильфо"
        `,
    };

    // Отправляем письмо
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Ошибка при отправке письма:", error);
        // Проверяем, был ли уже отправлен ответ
        if (!res.headersSent) {
          return res
            .status(500)
            .json({ message: "Произошла ошибка при отправке письма." });
        }
      }

      // Проверяем, был ли уже отправлен ответ
      if (!res.headersSent) {
        console.log("Письмо успешно отправлено:", info.response);
        res
          .status(200)
          .json({ message: "Заказы успешно отправлены!", orders: newOrders });
      }
    });

    return res.status(200).json({
      message: "Order updated successfully.",
      order: orders[orderIndex],
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while updating the order." });
  }
});
// Запуск сервера
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
