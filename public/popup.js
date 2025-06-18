function showPopupNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `popup-notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}
