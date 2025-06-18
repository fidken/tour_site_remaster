function showSlide(slider, direction) {
  const images = slider.querySelectorAll(".slide");
  if (images.length === 0) return;
  let currentIndex = Array.from(images).findIndex((img) =>
    img.classList.contains("active")
  );

  images[currentIndex].classList.remove("active");
  currentIndex = (currentIndex + direction + images.length) % images.length;
  images[currentIndex].classList.add("active");
}

// Для возможности подключения к другим файлам
window.globalShowSlide = showSlide;
