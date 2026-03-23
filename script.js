document.addEventListener('DOMContentLoaded', () => {
    // КОНФИГ
    const IP = '5.83.140.250';
    const PORT = '25757';
    const TG_TOKEN = '8679920729:AAEnd-Nxe9moClDCo2WO8ZXIM8Caxi2XR3M';
    const TG_CHAT_ID = '5050019900';

    const modal = document.getElementById('modalOverlay');
    const chatWin = document.getElementById('chatWindow');
    const chatBody = document.getElementById('chatBody');
    const chatInput = document.getElementById('chatInput');
    
    let lastUpdateId = 0; // Для отслеживания новых сообщений из ТГ

    // 1. ОНЛАЙН СЕРВЕРА
    const updateOnline = () => {
        fetch(`https://mcapi.us/server/status?ip=${IP}&port=${PORT}`)
            .then(r => r.json())
            .then(d => {
                document.getElementById('player-count').innerText = d.online ? `${d.players.now} / ${d.players.max}` : "Offline";
            }).catch(() => document.getElementById('player-count').innerText = "Error");
    };
    updateOnline();
    setInterval(updateOnline, 30000);

    // 2. ЛОГИКА ЧАТА (Отображение сообщений)
    const addMessage = (text, type) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${type}`; // type может быть 'user' или 'system'
        msgDiv.innerText = text;
        chatBody.appendChild(msgDiv);
        
        // Авто-скролл вниз
        chatBody.scrollTop = chatBody.scrollHeight;
    };

    // ОТПРАВКА В TELEGRAM
    window.sendToTg = async () => {
        const text = chatInput.value.trim();
        if(!text) return;

        // Добавляем сообщение в окно чата на сайте
        addMessage(text, 'user');
        chatInput.value = '';

        try {
            await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ 
                    chat_id: TG_CHAT_ID, 
                    text: `👤 Пользователь пишет:\n${text}` 
                })
            });
        } catch(e) { 
            addMessage("Ошибка отправки в систему.", "system");
        }
    };

    // Отправка по нажатию Enter
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') window.sendToTg();
    });

    // 3. ПОЛУЧЕНИЕ ОТВЕТА ИЗ TELEGRAM (Обратная связь)
    const checkTgUpdates = async () => {
        try {
            const response = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/getUpdates?offset=${lastUpdateId + 1}`);
            const data = await response.json();
            
            if (data.result && data.result.length > 0) {
                data.result.forEach(update => {
                    lastUpdateId = update.update_id;
                    // Если это текстовое сообщение и оно пришло от админа
                    if (update.message && update.message.text) {
                        addMessage(`Админ: ${update.message.text}`, 'system');
                    }
                });
            }
        } catch (e) {
            console.error("Ошибка проверки обновлений ТГ");
        }
    };

    // Проверяем новые сообщения от админа каждые 3 секунды
    setInterval(checkTgUpdates, 30000);

    // 4. МОДАЛЬНОЕ ОКНО
    document.querySelectorAll('.card').forEach(card => {
        card.onclick = (e) => {
            if (e.target.closest('a')) return;
            document.getElementById('modalUsername').innerText = card.querySelector('.username').innerText;
            document.getElementById('modalAvatar').src = card.querySelector('.avatar').src;
            document.querySelector('.modal-description').innerText = card.getAttribute('data-description') || "Игрок сервера Singularity.";
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        };
    });

    const closeAll = () => {
        modal.classList.remove('active');
        chatWin.classList.remove('active');
        document.body.style.overflow = '';
    };

    document.getElementById('modalClose').onclick = closeAll;
    modal.onclick = (e) => { if(e.target === modal) closeAll(); };
    document.addEventListener('keydown', (e) => { if(e.key === "Escape") closeAll(); });

    // Кнопки чата
    document.getElementById('chatBtn').onclick = () => chatWin.classList.toggle('active');
    document.getElementById('closeChat').onclick = closeAll;
});
