// UI functions
function showMessage(message, duration = 2000) {
    const messageElement = document.createElement('div');
    messageElement.className = 'game-message';
    messageElement.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 15px 30px;
        border-radius: 5px;
        z-index: 1000;
        animation: slideDown 0.5s ease-out;
    `;
    messageElement.textContent = message;
    document.body.appendChild(messageElement);

    setTimeout(() => {
        messageElement.style.animation = 'slideUp 0.5s ease-out';
        setTimeout(() => messageElement.remove(), 500);
    }, duration);
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from { transform: translate(-50%, -50px); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
    }
    @keyframes slideUp {
        from { transform: translate(-50%, 0); opacity: 1; }
        to { transform: translate(-50%, -50px); opacity: 0; }
    }
`;
document.head.appendChild(style);    location.reload(); // Reload the game (or handle restart)
}

