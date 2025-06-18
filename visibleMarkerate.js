//Это вторичный код не связанный с проектом напрямую, чтобы легко проставить для свойства visible "true"
const fs = require("fs");
const path = require("path");

// Путь к файлу с данными
const filePath = path.join(__dirname, "data", "data-tours.json");

// Функция для обновления объектов
function updateVisibility(filePath) {
  try {
    // Читаем данные из файла
    const data = fs.readFileSync(filePath, "utf8");
    const tours = JSON.parse(data);

    // Проставляем "visible": true для всех объектов
    const updatedTours = tours.map((tour) => ({ ...tour, visible: "true" }));

    // Сохраняем обновлённые данные обратно в файл
    fs.writeFileSync(filePath, JSON.stringify(updatedTours, null, 2), "utf8");
    console.log("Все объекты успешно обновлены.");
  } catch (error) {
    console.error("Ошибка при обновлении объектов:", error.message);
  }
}

// Вызываем функцию
updateVisibility(filePath);
