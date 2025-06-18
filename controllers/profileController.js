const dataHandler = require('../data/dataHandler');
const { uploadAvatar } = require('../middlewares/fileUpload');

// Регистрация пользователя
const registerProfile = (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body;
  if (!firstName || !lastName || !email || !phone || !password) {
    return res.status(400).json({ success: false, message: 'Все поля обязательны для заполнения' });
  }
  const profileList = dataHandler.readData('data-profiles.json');
  const newUserId = profileList.profiles.length ? profileList.profiles[profileList.profiles.length - 1].userId + 1 : 1;
  const avatarUrl = req.file ? `/img/avatar/${req.file.filename}` : '/img/avatar/default-avatar.jpg';

  const newUser = {
    userId: newUserId,
    firstName,
    lastName,
    email,
    phoneNumber: phone,
    password,
    avatarUrl,
    ordersId: [],
  };

  profileList.profiles.push(newUser);
  dataHandler.writeData('data-profiles.json', profileList);

  res.status(201).json({ success: true, message: 'Пользователь успешно зарегистрирован' });
};

module.exports = { registerProfile };
