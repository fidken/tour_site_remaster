document.addEventListener('DOMContentLoaded', () => {
    const addUserButton = document.getElementById('add-user');
    const fetchUserButton = document.getElementById('fetch-user');
    const saveUserButton = document.getElementById('save-user');
    const deleteUserButton = document.getElementById('delete-user');
    const usersContainer = document.getElementById('usersContainer');
  
    const fetchUsers = async () => {
      try {
        const response = await fetch('/admin/api/users');
        if (!response.ok) throw new Error('Failed to fetch users');
        const users = await response.json();
  
        usersContainer.innerHTML = users.map((user, index) => `
          <div class="user-card" data-user-id="${user.id}">
            <h2>${index + 1}. ${user.first_name} ${user.last_name}</h2>
            <button class="toggle-details" data-id="${user.id}">Показать детали</button>
            <div class="user-details" id="details-${user.id}" style="display: none;">
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>Телефон:</strong> ${user.phone}</p>
              <p><strong>Администратор:</strong> ${user.admin ? 'Да' : 'Нет'}</p>
              <p><strong>Заказы:</strong> ${user.orders.length > 0 ? user.orders.join(', ') : 'Нет заказов'}</p>
              <img src="/img/avatar/${user.avatar}" alt="${user.first_name}" class="user-avatar" />
            </div>
          </div>
        `).join('');
  
        usersContainer.querySelectorAll('.toggle-details').forEach(button => {
          button.addEventListener('click', () => {
            const details = document.getElementById(`details-${button.dataset.id}`);
            details.style.display = details.style.display === 'block' ? 'none' : 'block';
          });
        });
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
  
    addUserButton.addEventListener('click', async () => {
      const form = document.getElementById('add-user-form');
      const formData = new FormData(form);
  
      try {
        const response = await fetch('/admin/api/users', {
          method: 'POST',
          body: formData
        });
        if (!response.ok) throw new Error('Failed to add user');
        alert('Пользователь добавлен!');
        fetchUsers();
      } catch (error) {
        console.error('Error adding user:', error);
        alert('Ошибка при добавлении пользователя.');
      }
    });
  
    fetchUserButton.addEventListener('click', async () => {
      try {
        const userId = document.getElementById('edit-user-id').value;
        alert(userId)
        const response = await fetch(`/admin/api/users/${userId}`);
        if (!response.ok) throw new Error('User not found');
        const user = await response.json();
        console.log(user)
        
        document.getElementById('edit-user-id').value = user.id;
        document.getElementById('edit-first-name').value = user.first_name;
        document.getElementById('edit-last-name').value = user.last_name;
        document.getElementById('edit-email').value = user.email;
        document.getElementById('edit-phone').value = user.phone;
        document.getElementById('edit-password').value = user.password;
        document.getElementById('edit-admin').checked = user.admin;
  
        // Аватар и заказы остаются для отображения, но не редактируются
      } catch (error) {
        console.error('Error fetching user:', error);
        alert('Пользователь не найден.');
      }
    });
  
    saveUserButton.addEventListener('click', async () => {
      const form = document.getElementById('edit-user-form');
      const formData = new FormData(form);
      console.log(formData)
      const userId = document.getElementById('edit-user-id').value;
      alert(userId)
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
      try {
        const response = await fetch(`/admin/api/users/${userId}`, {
          method: 'PUT',
          body: formData
        });
        if (!response.ok) throw new Error('Failed to save user');
        alert('Пользователь обновлён!');
        fetchUsers();
      } catch (error) {
        console.error('Error saving user:', error);
        alert('Ошибка при обновлении пользователя.');
      }
    });
  
    deleteUserButton.addEventListener('click', async () => {
      try {
        const userId = document.getElementById('edit-user-id').value;
        const response = await fetch(`/admin/api/users/${userId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete user');
        alert('Пользователь удалён!');
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Ошибка при удалении пользователя.');
      }
    });
  
    // Начальная загрузка пользователей
    fetchUsers();
  });
  