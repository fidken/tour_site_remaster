document.addEventListener("DOMContentLoaded", () => {
  // Функция загрузки туров из JSON и сохранения в localStorage
  async function fetchAndStoreTours() {
    try {
      const response = await fetch("/index-all-tours");
      if (!response.ok) throw new Error("Ошибка загрузки туров");

      const tours = await response.json();
      localStorage.setItem("tours", JSON.stringify(tours));
    } catch (error) {
      console.error("Ошибка при загрузке туров:", error);
      alert("Не удалось загрузить туры.");
    }
  }

  // Функция фильтрации и обновления отображения туров
  function filterTours(filterFunction) {
    const tours = JSON.parse(localStorage.getItem("tours")) || [];
    const tourCards = document.querySelectorAll(".tour-card");

    tourCards.forEach((card, index) => {
      const tour = tours[index]; // Связь между карточкой и туром по индексу
      if (filterFunction(tour)) {
        card.style.display = ""; // Показываем карточку
      } else {
        card.style.display = "none"; // Скрываем карточку
      }
    });
  }

  // Пример использования фильтрации
  function applyFilterByCity(city) {
    filterTours((tour) => tour.cities.includes(city));
  }

  // Функция добавления тура в корзину
  function addTourToCart(tourId) {
    const tours = JSON.parse(localStorage.getItem("tours")) || [];
    const tour = tours.find((t) => t.id === Number(tourId)); // Сравниваем с числовым ID
    if (!tour) {
      console.error(`Тур с ID ${tourId} не найден.`);
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(tour);
    localStorage.setItem("cart", JSON.stringify(cart));
    showPopupNotification(`Тур "${tour.name}" добавлен в корзину!`, "success");
  }

  // Добавление обработчиков для кнопок "Добавить в корзину"
  document.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", () => {
      // Извлекаем ID тура из атрибута data-tour-id родительского элемента
      const tourId = button.closest(".tour-card").getAttribute("data-tour-id");
      if (tourId) {
        addTourToCart(tourId);
      } else {
        console.error("ID тура не найден в data-tour-id.");
      }
    });
  });

  // Проверка наличия туров в localStorage и загрузка при необходимости
  if (!localStorage.getItem("tours")) {
    fetchAndStoreTours();
  }
});
