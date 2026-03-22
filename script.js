document.addEventListener('DOMContentLoaded', () => {
    const IP = '5.83.140.250';
    const PORT = '25757';

    // Функция получения онлайна
    function updateOnline() {
        const display = document.getElementById('player-count');
        
        fetch(`https://mcapi.us/server/status?ip=${IP}&port=${PORT}`)
            .then(response => response.json())
            .then(data => {
                if (data.online) {
                    display.innerText = `${data.players.now} / ${data.players.max}`;
                } else {
                    display.innerText = "Оффлайн";
                    display.style.color = "#ff4e00";
                }
            })
            .catch(() => {
                display.innerText = "Ошибка";
            });
    }

    // Обновляем при загрузке и каждые 30 секунд
    updateOnline();
    setInterval(updateOnline, 30000);

    // --- Остальной твой функционал ---

    // Открытие/закрытие чата
    const chatBtn = document.getElementById('chatBtn');
    const chatWindow = document.getElementById('chatWindow');
    const closeChat = document.getElementById('closeChat');

    chatBtn?.addEventListener('click', () => chatWindow.classList.toggle('active'));
    closeChat?.addEventListener('click', () => chatWindow.classList.remove('active'));

    // Плавный скролл
    document.getElementById('scrollBtn')?.addEventListener('click', () => {
        document.getElementById('team').scrollIntoView({ behavior: 'smooth' });
    });

    // Появление карточек
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.card').forEach(card => {
        card.style.opacity = "0";
        card.style.transform = "translateY(30px)";
        card.style.transition = "all 0.6s ease-out";
        observer.observe(card);
    });
});