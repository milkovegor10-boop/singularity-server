// === 2. МОДАЛЬНОЕ ОКНО (ИГРОКИ И НОВОСТИ) ===
    const openModal = (title, description, avatarSrc = null) => {
        const modalUser = document.getElementById('modalUsername');
        const modalAv = document.getElementById('modalAvatar');
        const modalDesc = document.querySelector('.modal-description');

        if (modalUser) modalUser.innerText = title;
        if (modalDesc) modalDesc.innerText = description;
        
        if (modalAv) {
            if (avatarSrc) {
                modalAv.src = avatarSrc;
                modalAv.style.display = 'inline-block';
            } else {
                modalAv.style.display = 'none'; // Скрываем аватар для новостей
            }
        }
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    // Клик по карточкам игроков
    document.querySelectorAll('.card').forEach(card => {
        card.onclick = (e) => {
            if (e.target.closest('a')) return;
            const username = card.querySelector('.username').innerText;
            const avatar = card.querySelector('.avatar').src;
            const desc = card.getAttribute('data-description') || "Игрок сервера.";
            openModal(username, desc, avatar);
        };
    });

    // Клик по карточкам новостей
    document.querySelectorAll('.news-card').forEach(nCard => {
        nCard.onclick = () => {
            const title = nCard.querySelector('.news-title').innerText;
            const desc = nCard.getAttribute('data-description') || "Полный текст новости отсутствует.";
            openModal(title, desc, null); // Передаем null, чтобы скрыть аватарку
        };
    });
