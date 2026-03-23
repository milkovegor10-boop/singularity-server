document.addEventListener('DOMContentLoaded', () => {
    // === КОНФИГ ===
    const IP = '5.83.140.250';
    const PORT = '25757';
    const TG_TOKEN = '8679920729:AAEnd-Nxe9moClDCo2WO8ZXIM8Caxi2XR3M';
    const TG_CHAT_ID = '5050019900';

    // Элементы
    const modal = document.getElementById('modalOverlay');
    const chatWin = document.getElementById('chatWindow');
    const chatBody = document.getElementById('chatBody');
    const chatInput = document.getElementById('chatInput');
    const playerCount = document.getElementById('player-count');
    
    let lastUpdateId = 0;

    // === 1. ОНЛАЙН СЕРВЕРА ===
    const updateOnline = () => {
        if (!playerCount) return;
        fetch(`https://mcapi.us/server/status?ip=${IP}&port=${PORT}`)
            .then(r => r.json())
            .then(d => {
                playerCount.innerText = d.online ? `${d.players.now} / ${d.players.max}` : "Offline";
            }).catch(() => playerCount.innerText = "Error");
    };
    updateOnline();
    setInterval(updateOnline, 30000);

    // === 2. МОДАЛЬНОЕ ОКНО (Описание игроков) ===
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Если кликнули по ссылке (YouTube), не открываем модалку
            if (e.target.closest('a')) return;

            const name = card.querySelector('.username').innerText;
            const img = card.querySelector('.avatar').src;
            const desc = card.getAttribute('data-description') || "Игрок сервера Singularity.";

            const mName = document.getElementById('modalUsername');
            const mImg = document.getElementById('modalAvatar');
            const mDesc = document.querySelector('.modal-description');

            if (mName) mName.innerText = name;
            if (mImg) mImg.src = img;
            if (mDesc) mDesc.innerText = desc;

            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // Функция закрытия всего
    const closeAll = () => {
        if (modal) modal.classList.remove('active');
        if (chatWin) chatWin.classList.remove('active');
        document.body.style.overflow = '';
    };

    // Слушатели на закрытие
    const mCloseBtn = document.getElementById('modalClose');
    const cCloseBtn = document.getElementById('closeChat');
    
    if (mCloseBtn) mCloseBtn.onclick = closeAll;
    if (cCloseBtn) cCloseBtn.onclick = closeAll;
    if (modal) modal.onclick = (e) => { if(e.target === modal) closeAll(); };
    
    document.addEventListener('keydown', (e) => { 
        if(e.key === "Escape") closeAll(); 
    });

    // === 3. ЛОГИКА ЧАТА ===
    const addMessage = (text, type) => {
        if (!chatBody) return;
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${type}`;
        msgDiv.innerText = text;
        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    };

    window.sendToTg = async () => {
        if (!chatInput) return;
        const text = chatInput.value.trim();
        if(!text) return;

        addMessage(text, 'user');
        chatInput.value = '';

        try {
            await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ chat_id: TG_CHAT_ID, text: `👤 Сообщение с сайта:\n${text}` })
            });
        } catch(e) { 
            addMessage("Ошибка отправки.", "system");
        }
    };

    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') window.sendToTg();
        });
    }

    const checkTgUpdates = async () => {
        try {
            const response = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/getUpdates?offset=${lastUpdateId + 1}`);
            const data = await response.json();
            if (data.result && data.result.length > 0) {
                data.result.forEach(update => {
                    lastUpdateId = update.update_id;
                    if (update.message && update.message.text) {
                        addMessage(`Админ: ${update.message.text}`, 'system');
                    }
                });
            }
        } catch (e) {}
    };
    setInterval(checkTgUpdates, 5000);

    const chatBtn = document.getElementById('chatBtn');
    if (chatBtn && chatWin) {
        chatBtn.onclick = () => chatWin.classList.toggle('active');
    }
});
