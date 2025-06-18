document.addEventListener('DOMContentLoaded', () => {
    const fileNameInput = document.getElementById('file-name');
    const fileContentDiv = document.getElementById('file-content');

    document.getElementById('load-file').addEventListener('click', () => {
        const fileName = fileNameInput.value.trim();

        if (!fileName) {
            alert('Please enter a file name!');
            return;
        }

        // Эмуляция загрузки файла (можно заменить на запрос к серверу)
        fetch(`/files/${fileName}`)
            .then(response => {
                if (!response.ok) throw new Error('File not found');
                return response.json();
            })
            .then(content => {
                // Сохранение в localStorage
                localStorage.setItem('fileContent', JSON.stringify(content, null, 2));

                // Отображение текста в блоке с форматированием
                fileContentDiv.textContent = JSON.stringify(content, null, 2);
                fileContentDiv.classList.remove('hidden');
            })
            .catch(error => {
                alert(`Error: ${error.message}`);
            });
    });

    // Загрузка из localStorage при загрузке страницы
    const storedContent = localStorage.getItem('fileContent');
    if (storedContent) {
        fileContentDiv.textContent = storedContent;
        fileContentDiv.classList.remove('hidden');
    }
});
