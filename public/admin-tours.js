document.addEventListener("DOMContentLoaded", () => {
  const fetchTourButton = document.getElementById("fetch-tour");
  const deleteTourButton = document.getElementById("delete-tour");
  const toursContainer = document.getElementById("toursContainer");
  const saveTourButton = document.getElementById("save-tour");

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
    return `${date.getDate()} ${
      months[date.getMonth()]
    } ${date.getFullYear()} год`;
  }

  const toggleDetails = (tourId) => {
    const details = document.getElementById(`details-${tourId}`);
    details.style.display =
      details.style.display === "block" ? "none" : "block";
  };

  const fetchTours = async () => {
    try {
      const response = await fetch("/admin/api/tours");
      if (!response.ok) throw new Error("Failed to fetch tours");
      const tours = await response.json();

      toursContainer.innerHTML = tours
        .map(
          (tour, index) => `
        <div class="tour-card" data-tour-id="${tour.id}">
          <h2>${index + 1}. ${tour.name}</h2>
          <button class="toggle-details" data-id="${
            tour.id
          }">Показать детали</button>
          <div class="tour-details" id="details-${
            tour.id
          }" style="display: none;">
            <div class="slider-container">
              ${tour.images
                .map(
                  (image, imgIndex) => `
                <img 
                  src="/img/tour/${image}" 
                  alt="Тур ${tour.name}" 
                  class="slide${imgIndex === 0 ? " active" : ""}"
                />
              `
                )
                .join("")}
              <button class="slider-btn" id="prev" data-direction="-1">‹</button>
              <button class="slider-btn" id="next" data-direction="1">›</button>
            </div>
            <p><strong>Дата начала:</strong> ${tour.start_date
              .map((date) => formatDate(date))
              .join(", ")}</p>
            <p><strong>Длительность:</strong> ${tour.duration} дней</p>
            <p><strong>Города:</strong> ${tour.cities.join(", ")}</p>
            <p><strong>Типы:</strong> ${tour.types.join(", ")}</p>
            <p><strong>Цена:</strong> ${tour.price} ₽</p>
            <p><strong>Оператор:</strong> ${tour.operator}</p>
            <p><strong>Описание:</strong> ${tour.short_description}</p>
            <p><strong>Детальное описание:</strong> ${tour.long_description.join(
              " "
            )}</p>
            <a class="tour-link" href="/tour/${tour.id}">Подробнее</a>
          </div>
        </div>
      `
        )
        .join("");

      toursContainer.querySelectorAll(".toggle-details").forEach((button) => {
        button.addEventListener("click", () =>
          toggleDetails(button.dataset.id)
        );
      });

      toursContainer.querySelectorAll(".slider-btn").forEach((button) => {
        button.addEventListener("click", (event) => {
          const direction = parseInt(event.target.dataset.direction, 10);
          const sliderContainer = event.target.closest(".slider-container");
          const slides = sliderContainer.querySelectorAll("img.slide");
          let activeIndex = Array.from(slides).findIndex((slide) =>
            slide.classList.contains("active")
          );

          slides[activeIndex].classList.remove("active");
          activeIndex =
            (activeIndex + direction + slides.length) % slides.length;
          slides[activeIndex].classList.add("active");
        });
      });
    } catch (error) {
      console.error("Error fetching tours:", error);
    }
  };

  // Форматирование дат из строки в массив
  function parseDates(datesString) {
    return datesString.split(",").map((date) => date.trim());
  }

  // Преобразование строки в массив
  function parseArray(input) {
    return input.split(",").map((item) => item.trim());
  }

  // Преобразование массива в JSON-строку
  function formatArray(input) {
    return JSON.stringify(parseArray(input));
  }

  // Загрузка данных тура
  fetchTourButton.addEventListener("click", async () => {
    const tourId = document.getElementById("edit-tour-id").value.trim();
    if (!tourId) {
      alert("Введите ID тура.");
      return;
    }

    try {
      const response = await fetch(`/admin/api/tours/${tourId}`);
      if (!response.ok) throw new Error("Тур не найден");
      const tour = await response.json();

      document.getElementById("edit-name").value = tour.name;
      document.getElementById("edit-start_date").value =
        tour.start_date.join(", ");
      document.getElementById("edit-duration").value = tour.duration;
      document.getElementById("edit-short-description").value =
        tour.short_description; // Функция для парсинга текста с разделителем
      document.getElementById("edit-visible").checked = tour.visible;

      function parseLongDescription(descriptionArray, separator = "---") {
        // Ожидаем, что descriptionArray — это массив строк
        return descriptionArray.join(`\n${separator}\n`);
      }

      // Интеграция с DOM
      const longDescription = tour.long_description; // Предполагается, что это массив строк
      const separator = "---"; // Задаём разделитель

      // Парсим текст и устанавливаем его в поле ввода
      document.getElementById("edit-long-description").value =
        parseLongDescription(longDescription, separator);

      document.getElementById("edit-operator").value = tour.operator;
      document.getElementById("edit-price").value = tour.price;
      document.getElementById("edit-types").value = tour.types.join(", ");
      document.getElementById("edit-cities").value = tour.cities.join(", ");
    } catch (error) {
      console.error("Ошибка при загрузке тура:", error);
      alert("Ошибка: Тур не найден.");
    }
  });

  // Сохранение изменений
  // Функция для разбора текста из textarea в массив по разделителю
  function parseTextareaToDescriptionArray(text, separator = "---") {
    return text
      .split(`\n${separator}\n`)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  saveTourButton.addEventListener("click", async () => {
    const tourId = document.getElementById("edit-tour-id").value.trim();
    if (!tourId) {
      alert("Введите ID тура.");
      return;
    }

    const formData = new FormData();
    formData.append("name", document.getElementById("edit-name").value);
    // Очищаем пробелы в датах перед отправкой
    const startDateText = document
      .getElementById("edit-start_date")
      .value.split(",");
    const cleanedStartDate = startDateText.map((date) => date.trim()); // Убираем лишние пробелы
    formData.append("start_date", JSON.stringify(cleanedStartDate));
    formData.append("duration", document.getElementById("edit-duration").value);
    formData.append(
      "short_description",
      document.getElementById("edit-short-description").value
    );

    // Парсим long_description с помощью вашей функции
    const longDescriptionText = document.getElementById(
      "edit-long-description"
    ).value;
    const parsedLongDescription = parseTextareaToDescriptionArray(
      longDescriptionText,
      "---"
    );
    formData.append("long_description", JSON.stringify(parsedLongDescription));

    formData.append("operator", document.getElementById("edit-operator").value);
    formData.append("price", document.getElementById("edit-price").value);
    formData.append(
      "types",
      document.getElementById("edit-types").value.split(",").join(",")
    );
    formData.append(
      "cities",
      document.getElementById("edit-cities").value.split(",").join(",")
    );
    formData.append("visible", document.getElementById("edit-visible").checked);

    const files = document.querySelector('input[type="file"]').files;
    for (let i = 0; i < files.length; i++) {
      formData.append("edit-images", files[i]);
    }

    try {
      const response = await fetch(`/admin/api/tours/${tourId}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) throw new Error("Ошибка при сохранении тура");
      alert("Тур успешно обновлён!");
    } catch (error) {
      console.error("Ошибка при сохранении тура:", error);
      alert("Ошибка при сохранении тура.");
    }
  });

  // Функция для парсинга long_description
  function parseTextareaToDescriptionArray(text, separator = "---") {
    return text
      .split(`\n${separator}\n`)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  // Удаление тура
  deleteTourButton.addEventListener("click", async () => {
    const tourId = document.getElementById("edit-tour-id").value.trim();
    if (!tourId) {
      alert("Введите ID тура.");
      return;
    }

    try {
      const response = await fetch(`/admin/api/tours/${tourId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Ошибка при удалении тура");
      alert("Тур успешно удалён!");
    } catch (error) {
      console.error("Ошибка при удалении тура:", error);
      alert("Ошибка при удалении тура.");
    }
  });
  // Начальная загрузка туров
  fetchTours();
});
