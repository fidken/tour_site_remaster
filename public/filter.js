document.addEventListener('DOMContentLoaded', () => {
  const filterForm = document.getElementById('filter-form');
  const noResultsContainer = document.getElementById('filter-no-results');
  const tours = JSON.parse(localStorage.getItem('tours')) || [];

  document.getElementById('apply-filters').addEventListener('click', () => {
    const startDateInput = document.getElementById('start-date').value;
    const durationInput = parseInt(document.getElementById('duration').value, 10);
    const selectedTypes = Array.from(document.getElementById('types').selectedOptions).map(opt => opt.value);
    const priceMin = parseFloat(document.getElementById('price-min').value) || 0;
    const priceMax = parseFloat(document.getElementById('price-max').value) || Infinity;

    // Фильтрация данных
    const filteredTours = tours.filter(tour => {
      // Проверка даты начала тура
      if (startDateInput) {
        const inputDate = new Date(startDateInput).setHours(0, 0, 0, 0);
        const hasMatchingDate = tour.start_date.some(date => new Date(date).setHours(0, 0, 0, 0) === inputDate);
        if (!hasMatchingDate) return false;
      }

      // Проверка длительности
      if (durationInput && tour.duration < durationInput) {
        return false;
      }

      // Проверка типов тура
      if (selectedTypes.length > 0) {
        const hasAllTypes = selectedTypes.every(type => tour.types.includes(type));
        if (!hasAllTypes) return false;
      }

      // Проверка диапазона цен
      if (tour.price < priceMin || tour.price > priceMax) {
        return false;
      }

      return true;
    });

    // Обновление отображения
    const tourCards = document.querySelectorAll('.tour-card');
    let filteredCount = 0;

    tourCards.forEach(card => {
      const tour = tours.find(t => t.id == card.dataset.tourId);
      const isVisible = filteredTours.includes(tour);
      card.style.display = isVisible ? '' : 'none';
      if (isVisible) filteredCount++;
    });

    // Отображение уведомления, если ничего не найдено
    noResultsContainer.classList.toggle('hidden', filteredCount !== 0);
  });

  // Сброс фильтров
  document.getElementById('reset-filters').addEventListener('click', () => {
    const tourCards = document.querySelectorAll('.tour-card');
    tourCards.forEach(card => (card.style.display = ''));
    noResultsContainer.classList.add('hidden');
    filterForm.reset();
  });
});
