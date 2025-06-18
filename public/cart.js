document.addEventListener("DOMContentLoaded", () => {
  const cartContainer = document.getElementById("cartContainer");
  const sendOrdersButton = document.getElementById("sendOrders");
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
  // Функция для отображения корзины
  function renderCart() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (!cart.length) {
      cartContainer.innerHTML =
        "<p>Нет заказов в корзине. Добавьте туры для отображения.</p>";
      return;
    }

    cartContainer.innerHTML = ""; // Очищаем контейнер перед рендерингом

    // cart.forEach((item, index) => {
    //     const card = document.createElement('div');
    //     card.classList.add('tour-card');
    //     card.setAttribute('data-tour-id', item.id);

    //     card.innerHTML = `
    //         <div class="slider-container">
    //             ${item.images.map((image, imgIndex) => `
    //                 <img src="/img/tour/${image}" alt="Тур ${item.name}" class="slide${imgIndex === 0 ? ' active' : ''}">
    //             `).join('')}
    //             <button class="slider-btn" id="prev" onclick="showSlide(this.parentElement, -1)">‹</button>
    //             <button class="slider-btn" id="next" onclick="showSlide(this.parentElement, 1)">›</button>
    //         </div>
    //         <h2>${item.name}</h2>
    //         <p><strong>Дата начала:</strong> ${formatDate(item.start_date[0])}</p>
    //         <p><strong>Длительность:</strong> ${item.duration} дней</p>
    //         <p><strong>Города:</strong> ${item.cities.join(', ')}</p>
    //         <p><strong>Цена:</strong> ${item.price} ₽</p>
    //         <p><strong>Описание:</strong> ${item.short_description}</p>
    //         <a class="tour-link" href="/tour/${item.id}">Подробнее</a>
    //         <div class="quantity-controls">
    //                 <label for="quantity-${index}">Количество людей:</label>
    //                 <input id="quantity-${index}" type="number" min="1" value="${item.quantity || 1}" class="quantity-input" data-index="${index}">
    //         </div>
    //         <div class="comment-controls">
    //             <label for="comment-${index}">Комментарий:</label>
    //             <textarea id="comment-${index}" placeholder="Добавьте комментарий..." class="comment-input" data-index="${index}">${item.comment || ''}</textarea>
    //         </div>
    //         <button class="remove-from-cart" data-index="${index}">Удалить из корзины</button>
    //     `;

    //     cartContainer.appendChild(card);
    // });

    cart.forEach((item, index) => {
      const card = document.createElement("div");
      card.classList.add("tour-card");
      card.setAttribute("data-tour-id", item.id);

      card.innerHTML = `
            <div class="slider-container">
                ${item.images
                  .map(
                    (image, imgIndex) => `
                    <img src="/img/tour/${image}" alt="Тур ${
                      item.name
                    }" class="slide${imgIndex === 0 ? " active" : ""}">
                `
                  )
                  .join("")}
                <button class="slider-btn" id="prev" onclick="showSlide(this.parentElement, -1)">‹</button>
                <button class="slider-btn" id="next" onclick="showSlide(this.parentElement, 1)">›</button>
            </div>
            <h2>${item.name}</h2>
            <p><strong>Длительность:</strong> ${item.duration} дней</p>
            <p><strong>Города:</strong> ${item.cities.join(", ")}</p>
            <p><strong>Цена:</strong> ${item.price} ₽</p>
            <p><strong>Описание:</strong> ${item.short_description}</p>
            <a class="tour-link" href="/tour/${item.id}">Подробнее</a>
            <div class="quantity-controls">
                <label for="quantity-${index}">Количество людей:</label>
                <input id="quantity-${index}" type="number" min="1" value="${
        item.quantity || 1
      }" class="quantity-input" data-index="${index}">
            </div>
            <div class="comment-controls">
                <label for="comment-${index}">Комментарий:</label>
                <textarea id="comment-${index}" placeholder="Добавьте комментарий..." class="comment-input" data-index="${index}">${
        item.comment || ""
      }</textarea>
            </div>
            <div class="date-controls">
                <label for="date-select-${index}">Выберите дату начала тура (можно несколько, зажав ctrl):</label>
                <select id="date-select-${index}" class="date-select" multiple data-index="${index}">
                    ${item.start_date
                      .map(
                        (date) => `
                        <option value="${date}">${formatDate(date)}</option>
                    `
                      )
                      .join("")}
                </select>
            </div>
            <button class="remove-from-cart" data-index="${index}">Удалить из корзины</button>
        `;

      cartContainer.appendChild(card);
    });

    addCartEventListeners();
  }

  // Обработчики для удаления тура из корзины
  function addCartEventListeners() {
    document.querySelectorAll(".comment-input").forEach((input) => {
      input.addEventListener("input", (e) => {
        const index = e.target.dataset.index;
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        cart[index].comment = e.target.value;
        localStorage.setItem("cart", JSON.stringify(cart));
      });
    });

    document.querySelectorAll(".remove-from-cart").forEach((button) => {
      button.addEventListener("click", (e) => {
        const index = e.target.dataset.index;
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        cart.splice(index, 1);
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
      });
    });
  }

  // Обработка кнопки "Отправить заказы"
  sendOrdersButton.addEventListener("click", () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (!cart.length) {
      alert("Корзина пуста. Нечего отправлять.");
      return;
    }

    // Добавляем комментарии и количество участников для каждого заказа
    const updatedCart = cart.map((item, index) => {
      const quantityInput = document.querySelector(`#quantity-${index}`);
      const commentInput = document.querySelector(`#comment-${index}`);
      const dateSelect = document.querySelector(`#date-select-${index}`);

      // Преобразование выбранных дат в текст
      // Извлечение выбранных дат в виде массива
      const selectedDates = Array.from(dateSelect?.selectedOptions || []).map(
        (option) => option.value
      );

      return {
        ...item,
        quantity: parseInt(quantityInput?.value, 10) || 1,
        comment: commentInput?.value || "",
        dates: selectedDates, // Используем текстовое представление
      };
    });

    console.log("Отправка заказов:", updatedCart); // Для отладки, данные перед отправкой
    console.log("Отправка заказов:", JSON.stringify(updatedCart));
    // Отправка на сервер
    fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedCart),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        alert("Заказы успешно отправлены!");
        console.log("Ответ сервера:", data);

        // Очистка корзины и рендер обновлённой корзины
        localStorage.removeItem("cart");
        renderCart();
      })
      .catch((error) => {
        console.error("Ошибка при отправке:", error);
        alert("Произошла ошибка при отправке заказов. Попробуйте ещё раз.");
      });
  });

  // Инициализация
  renderCart();
});
