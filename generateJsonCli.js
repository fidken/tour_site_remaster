//Генератор JSON, можно удалить и забыть о нём.
const fs = require("fs");

/**
 * Генерация JSON-файла с заданной структурой
 * @param {string} filename - Имя файла
 * @param {Array<string>} fields - Массив полей
 * @param {number} objectCount - Количество объектов
 */
function generateJsonFile(filename, fields, objectCount) {
  const data = [];

  for (let i = 0; i < objectCount; i++) {
    const obj = {};
    fields.forEach((field) => {
      obj[field] = `Value_${field}_${i + 1}`; // Генерация значения по полю
    });
    data.push(obj);
  }

  const jsonData = JSON.stringify({ data }, null, 2);

  fs.writeFile(filename, jsonData, "utf8", (err) => {
    if (err) {
      console.error(`Ошибка записи файла: ${err.message}`);
    } else {
      console.log(`JSON-файл "${filename}" успешно создан!`);
    }
  });
}

// Чтение аргументов из командной строки
const args = process.argv.slice(2); // Пропустить 'node' и имя файла скрипта
const [filename, fieldsString, objectCountString] = args;

// Валидация аргументов
if (
  !filename ||
  !fieldsString ||
  !objectCountString ||
  isNaN(Number(objectCountString))
) {
  console.error(
    "Использование: node script.js <имя_файла> <поля_через_запятую> <количество_объектов>"
  );
  process.exit(1);
}

const fields = fieldsString.split(","); // Преобразование строки полей в массив
const objectCount = Number(objectCountString);

generateJsonFile(filename, fields, objectCount);
