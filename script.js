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
    
    let lastUpdateId = 0;
    let sentMessagesIds = []; // Храним ID сообщений этого пользователя
    let isCooldown = false;   // Флаг задержки

    // === 1. ОНЛАЙН С ГОЛОВАМИ ===
    const updateOnline = () => {
        if (!playerCount) return;

        fetch(`https://mcapi.us/server/status?ip=${IP}&port=${PORT}`)
            .then(r => r.json())
            .then(d => {
                const statusBox = document.querySelector('.server-status');
                if (d.online) {
                    playerCount.innerText = `${d.players.now} / ${d.players.max}`;
                    let headContainer = document.getElementById('online-heads');
                    if (!headContainer && statusBox) {
                        headContainer = document.createElement('div');
                        headContainer.id = 'online-heads';
                        statusBox.parentNode.insertBefore(headContainer, statusBox.nextSibling);
                    }
                    if (headContainer) {
                        headContainer.innerHTML = ''; 
                        if (d.players.sample && d.players.sample.length > 0) {
                            headContainer.style.display = 'flex';
                            d.players.sample.forEach(p => {
                                const img = document.createElement('img');
                                img.src = `https://mc-heads.net/avatar/${p.name}/32`;
                                img.className = 'online-player-head';
                                img.title = p.name;
                                headContainer.appendChild(img);
                            });
                        } else {
                            headContainer.style.display = 'none';
                        }
                    }
                } else {
                    playerCount.innerText = "Offline";
                    const hc = document.getElementById('online-heads');
                    if (hc) hc.style.display = 'none';
                }
            }).catch(e => console.log("MC API Error:", e));
    };

    updateOnline();
    setInterval(updateOnline, 30000);

    // === 2. МОДАЛЬНОЕ ОКНО ===
    document.querySelectorAll('.card').forEach(card => {
        card.onclick = (e) => {
            if (e.target.closest('a')) return;
            const modalUser = document.getElementById('modalUsername');
            const modalAv = document.getElementById('modalAvatar');
            if(modalUser) modalUser.innerText = card.querySelector('.username').innerText;
            if(modalAv) modalAv.src = card.querySelector('.avatar').src;
            document.querySelector('.modal-description').innerText = card.getAttribute('data-description') || "Игрок сервера.";
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        };
    });

    // === 3. ЧАТ С ПОДДЕРЖКОЙ (С АДРЕСНЫМ ОТВЕТОМ И КУЛДАУНОМ) ===
    const addMessage = (text, type) => {
        if (!chatBody) return;
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${type}`;
        msgDiv.innerText = text;
        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    };

    window.sendToTg = async () => {
        const text = chatInput.value.trim();
        if(!text) return;

        if(isCooldown) {
            addMessage("Подождите 5 сек...", "system");
            return;
        }

        addMessage(text, 'user');
        chatInput.value = '';
        
        // Включаем задержку 5 секунд
        isCooldown = true;
        chatInput.disabled = true; 
        setTimeout(() => { 
            isCooldown = false; 
            chatInput.disabled = false;
            chatInput.focus();
        }, 5000);

        try {
            const response = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ 
                    chat_id: TG_CHAT_ID, 
                    text: `📩 Сообщение с сайта:\n${text}` 
                })
            });
            const data = await response.json();
            if(data.ok) {
                // Запоминаем ID сообщения, чтобы опознать ответ админа именно на него
                sentMessagesIds.push(data.result.message_id);
            }
        } catch(e) { 
            addMessage("Ошибка сети.", "system"); 
        }
    };

    if (chatInput) {
        chatInput.onkeypress = (e) => { if(e.key === 'Enter') window.sendToTg(); };
    }

    // === 4. ЗАКРЫТИЕ И УПРАВЛЕНИЕ ===
    const closeAll = () => {
        if (modal) modal.classList.remove('active');
        if (chatWin) chatWin.classList.remove('active');
        document.body.style.overflow = '';
    };

    const mClose = document.getElementById('modalClose');
    const cClose = document.getElementById('closeChat');
    const cBtn = document.getElementById('chatBtn');

    if (mClose) mClose.onclick = closeAll;
    if (cClose) cClose.onclick = closeAll;
    if (cBtn) cBtn.onclick = () => chatWin.classList.toggle('active');
    if (modal) modal.onclick = (e) => { if(e.target === modal) closeAll(); };
    document.onkeydown = (e) => { if(e.key === "Escape") closeAll(); };

    // === 5. ПРОВЕРКА ОТВЕТОВ (ФИЛЬТР ПО REPLY) ===
    const checkTgUpdates = async () => {
        try {
            const r = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/getUpdates?offset=${lastUpdateId + 1}`);
            const d = await r.json();
            if (d.result) {
                d.result.forEach(u => {
                    lastUpdateId = u.update_id;
                    const msg = u.message;

                    // Если это сообщение, у него есть текст и оно является ОТВЕТОМ
                    if (msg && msg.text && msg.reply_to_message) {
                        const replyId = msg.reply_to_message.message_id;
                        
                        // Если админ ответил на сообщение, которое отправил этот конкретный юзер
                        if (sentMessagesIds.includes(replyId)) {
                            addMessage(`Админ: ${msg.text}`, 'system');
                            // Убираем ID из списка, чтобы не дублировать ответ (по желанию)
                            sentMessagesIds = sentMessagesIds.filter(id => id !== replyId);
                        }
                    }
                });
            }
        } catch(e) {}
    };
    setInterval(checkTgUpdates, 5000);
});
