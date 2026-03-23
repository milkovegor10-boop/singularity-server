document.addEventListener('DOMContentLoaded', () => {
    // === КОНФИГ ===
    const IP = '5.83.140.250';
    const PORT = '25757';
    const TG_TOKEN = '8679920729:AAEnd-Nxe9moClDCo2WO8ZXIM8Caxi2XR3M';
    const TG_CHAT_ID = '5050019900';

    const modal = document.getElementById('modalOverlay');
    const chatWin = document.getElementById('chatWindow');
    const chatBody = document.getElementById('chatBody');
    const chatInput = document.getElementById('chatInput');
    const playerCount = document.getElementById('player-count');
    const serverStatusBox = document.querySelector('.server-status');
    
    let lastUpdateId = 0;

    // === 1. ОНЛАЙН И СПИСОК ИГРОКОВ (ПОД ПЛАШКОЙ) ===
    const updateOnline = () => {
        if (!playerCount) return;

        fetch(`https://mcapi.us/server/status?ip=${IP}&port=${PORT}`)
            .then(r => r.json())
            .then(d => {
                if (d.online) {
                    playerCount.innerText = `${d.players.now} / ${d.players.max}`;
                    
                    // Ищем или создаем контейнер ПОД статусом
                    let headContainer = document.getElementById('online-heads');
                    if (!headContainer) {
                        headContainer = document.createElement('div');
                        headContainer.id = 'online-heads';
                        // Вставляем сразу после блока .server-status
                        serverStatusBox.after(headContainer);
                    }
                    
                    headContainer.innerHTML = ''; // Очистка

                    if (d.players.sample && d.players.sample.length > 0) {
                        headContainer.style.display = 'flex'; // Показываем, если есть игроки
                        d.players.sample.forEach(player => {
                            const img = document.createElement('img');
                            img.src = `https://mc-heads.net/avatar/${player.name}/32`;
                            img.className = 'online-player-head';
                            img.title = player.name;
                            headContainer.appendChild(img);
                        });
                    } else {
                        headContainer.style.display = 'none'; // Скрываем, если пусто
                    }
                } else {
                    playerCount.innerText = "Offline";
                    const hc = document.getElementById('online-heads');
                    if (hc) hc.style.display = 'none';
                }
            })
            .catch(() => {
                playerCount.innerText = "Error";
            });
    };

    updateOnline();
    setInterval(updateOnline, 30000);

    // === 2. МОДАЛЬНОЕ ОКНО ===
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('a')) return;
            const name = card.querySelector('.username').innerText;
            const img = card.querySelector('.avatar').src;
            const desc = card.getAttribute('data-description') || "Участник Singularity.";

            document.getElementById('modalUsername').innerText = name;
            document.getElementById('modalAvatar').src = img;
            document.querySelector('.modal-description').innerText = desc;

            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // === 3. ЧАТ С ПОДДЕРЖКОЙ ===
    const addMessage = (text, type) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${type}`;
        msgDiv.innerText = text;
        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    };

    window.sendToTg = async () => {
        const text = chatInput.value.trim();
        if(!text) return;
        addMessage(text, 'user');
        chatInput.value = '';
        try {
            await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ chat_id: TG_CHAT_ID, text: `📩 Сообщение с сайта:\n${text}` })
            });
        } catch(e) { addMessage("Ошибка отправки.", "system"); }
    };

    chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') window.sendToTg(); });

    const checkTgUpdates = async () => {
        try {
            const response = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/getUpdates?offset=${lastUpdateId + 1}`);
            const data = await response.json();
            if (data.result) {
                data.result.forEach(update => {
                    lastUpdateId = update.update_id;
                    if (update.message && update.message.text && String(update.message.chat.id) === TG_CHAT_ID) {
                        addMessage(`Админ: ${update.message.text}`, 'system');
                    }
                });
            }
        } catch (e) {}
    };
    setInterval(checkTgUpdates, 5000);

    // Управление окнами
    const closeAll = () => {
        modal.classList.remove('active');
        chatWin.classList.remove('active');
        document.body.style.overflow = '';
    };

    document.getElementById('modalClose').onclick = closeAll;
    document.getElementById('closeChat').onclick = closeAll;
    document.getElementById('chatBtn').onclick = () => chatWin.classList.toggle('active');
    modal.onclick = (e) => { if(e.target === modal) closeAll(); };
    document.addEventListener('keydown', (e) => { if(e.key === "Escape") closeAll(); });
});
