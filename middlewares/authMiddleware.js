// middleware/authMiddleware.js
module.exports = {
    checkAuth(req, res, next) {
        // Проверка авторизации
        res.locals.isAuthenticated = req.session?.userId ? true : false;
        res.locals.isAdmin = req.session?.isAdmin || false; // Если пользователь админ
        next();
    },

    requireAuth(req, res, next) {
        // Редирект на страницу входа, если пользователь не авторизован
        if (!req.session?.userId) {
            return res.redirect('/login');
        }
        next();
    },

    requireAdmin(req, res, next) {
        // Редирект на главную, если пользователь не админ
        if (!req.session?.isAdmin) {
            return res.redirect('/');
        }
        next();
    }
};
