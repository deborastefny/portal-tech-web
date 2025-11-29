// --- PREPARAÇÃO DO TEMA ---
const currentTheme = localStorage.getItem('theme');
const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');

if (toggleSwitch && currentTheme === 'light-mode') {
    toggleSwitch.checked = true;
}

window.addEventListener('load', () => {
    
    // ==========================================================
    // 1. EFEITO DE TRANSIÇÃO SUAVE (FADE IN/OUT)
    // ==========================================================
    
    // Faz a página aparecer suavemente ao carregar
    setTimeout(() => {
        document.body.classList.remove('preload'); // Libera animações
        document.body.classList.add('loaded');     // Opacidade vai para 1
    }, 50);

    // Intercepta cliques nos links para fazer o Fade Out
    const links = document.querySelectorAll('a');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            // Só ativa se for um link interno válido (ex: 'cadastro.html')
            if (href && href !== '#' && !href.startsWith('http') && !href.includes('mailto')) {
                e.preventDefault(); // Pausa o clique
                
                // 1. Faz a página sumir suavemente
                document.body.classList.remove('loaded');

                // 2. Espera 400ms (tempo do CSS) e muda de página
                setTimeout(() => {
                    window.location.href = href;
                }, 400);
            }
        });
    });

    // ==========================================================
    // 2. LÓGICA DO TEMA CLARO/ESCURO
    // ==========================================================
    if (toggleSwitch) {
        toggleSwitch.addEventListener('change', (e) => {
            if (e.target.checked) {
                document.body.classList.add('light-mode');
                localStorage.setItem('theme', 'light-mode');
            } else {
                document.body.classList.remove('light-mode');
                localStorage.setItem('theme', null);
            }
        });
    }

    // ==========================================================
    // 3. RECUPERAÇÃO DE EMAIL
    // ==========================================================
    const params = new URLSearchParams(window.location.search);
    const emailVindoDaHome = params.get('email');
    const campoEmail = document.getElementById('email-input');
    
    if (emailVindoDaHome && campoEmail) {
        campoEmail.value = emailVindoDaHome;
    }

    // ==========================================================
    // 4. FAQ (Accordion)
    // ==========================================================
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            faqItems.forEach(otherItem => {
                if (otherItem !== item) otherItem.classList.remove('active');
            });
            item.classList.toggle('active');
        });
    });

    // ==========================================================
    // 5. MARQUEE INTERATIVO (Notícias)
    // ==========================================================
    const container = document.querySelector('.marquee-container');
    const content = document.querySelector('.marquee-content');

    if (container && content) {
        let currentPos = 0;      
        let targetSpeed = 0.5;   
        let currentSpeed = 0.5;  
        const baseSpeed = 0.5;   
        const fastSpeed = 5;     
        let halfWidth = content.scrollWidth / 2;

        function loop() {
            currentSpeed += (targetSpeed - currentSpeed) * 0.1;
            currentPos -= currentSpeed;
            if (currentPos <= -halfWidth) currentPos = 0; 
            if (currentPos > 0) currentPos = -halfWidth; 
            content.style.transform = `translateX(${currentPos}px)`;
            requestAnimationFrame(loop);
        }

        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            if (percent < 0.30) { targetSpeed = -fastSpeed; container.style.cursor = 'w-resize'; } 
            else if (percent > 0.70) { targetSpeed = fastSpeed; container.style.cursor = 'e-resize'; } 
            else { targetSpeed = 0; container.style.cursor = 'vertical-text'; }
        });

        container.addEventListener('mouseleave', () => { targetSpeed = baseSpeed; container.style.cursor = 'grab'; });
        window.addEventListener('resize', () => { halfWidth = content.scrollWidth / 2; });
        loop();
    }

    // ==========================================================
    // 6. CADASTRO (Validação)
    // ==========================================================
    const insightsForm = document.querySelector('.insights-form');
    const msgContainer = document.getElementById('form-messages');
    
    if (insightsForm) {
        insightsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nome = document.getElementById('nome').value.trim();
            const email = document.getElementById('email-input').value.trim();
            const senha = document.getElementById('senha').value.trim();
            const genero = document.getElementById('genero').value;
            
            let erros = [];
            if (!nome) erros.push("O campo Nome é obrigatório.");
            if (!genero) erros.push("Selecione um Gênero.");
            if (!email || !email.includes('@') || !email.includes('.')) erros.push("Por favor, insira um e-mail válido.");
            if (senha.length < 6) erros.push("A senha deve ter no mínimo 6 caracteres.");

            if (erros.length > 0) {
                msgContainer.style.display = 'block';
                msgContainer.innerHTML = '<ul>' + erros.map(e => `<li>${e}</li>`).join('') + '</ul>';
                insightsForm.style.animation = 'shake 0.3s ease';
                setTimeout(() => { insightsForm.style.animation = 'none'; }, 300);
                return;
            }

            msgContainer.style.display = 'none';
            const btn = insightsForm.querySelector('button');
            btn.innerText = 'Validando...'; btn.style.opacity = '0.7'; btn.style.cursor = 'wait';
            
            setTimeout(() => {
                const cardContent = document.querySelector('.neon-card-content');
                
                // MUDANÇA: Fade Out manual antes de redirecionar no sucesso
                document.body.classList.remove('loaded');
                
                setTimeout(() => {
                    window.location.href = 'interacao.html';
                }, 400);
                
            }, 1000);
        });
    }

    // ==========================================================
    // 7. HUB (Chat)
    // ==========================================================
    const hubSection = document.querySelector('.hub-section');
    if (hubSection) {
        const feedArea = document.querySelector('.feed-scroll-area');
        const btnCommit = document.querySelector('.btn-git-commit');
        const inputApelido = document.getElementById('hub-apelido');
        const inputMsg = document.getElementById('hub-msg');
        const replyStatusBar = document.getElementById('reply-status');
        const replyTargetName = document.getElementById('reply-target-name');
        const btnCancelReply = document.querySelector('.btn-cancel-reply-mode');
        let activeReplyThread = null;

        inputApelido.addEventListener('blur', () => {
            let val = inputApelido.value.trim();
            if (val && !val.startsWith('@')) inputApelido.value = '@' + val;
        });

        feedArea.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-reply')) {
                const postCard = e.target.closest('.post-card');
                activeReplyThread = e.target.closest('.post-thread');
                replyStatusBar.style.display = 'flex';
                replyTargetName.innerText = postCard.querySelector('.user-handle').innerText;
                inputMsg.focus();
            }
        });

        btnCancelReply.addEventListener('click', () => {
            activeReplyThread = null;
            replyStatusBar.style.display = 'none';
            inputMsg.value = '';
        });

        btnCommit.addEventListener('click', () => {
            let apelido = inputApelido.value.trim();
            if (!apelido) apelido = '@anonimo';
            if (!apelido.startsWith('@')) apelido = '@' + apelido;
            const msg = inputMsg.value.trim();
            if (!msg) { alert("Escreva algo!"); return; }

            const html = `<div class="post-card reply-card"><div class="post-header"><span class="user-handle" style="color: #00ff9d;">${apelido}</span><span class="post-time">Agora</span></div><p class="post-body">${msg}</p></div>`;
            
            if (activeReplyThread) {
                activeReplyThread.insertAdjacentHTML('beforeend', `<div class="post-reply" style="animation: fadeInUp 0.5s ease"><div class="reply-line"></div>${html}</div>`);
                activeReplyThread = null;
                replyStatusBar.style.display = 'none';
            } else {
                feedArea.insertAdjacentHTML('afterbegin', `<div class="post-thread" style="animation: fadeInUp 0.5s ease"><div class="post-card"><div class="post-header"><span class="user-handle">${apelido}</span><span class="post-time">Agora</span></div><p class="post-body">${msg}</p><div class="post-actions"><button class="btn-reply">responder</button></div></div></div>`);
                feedArea.scrollTo({ top: 0, behavior: 'smooth' });
            }
            inputMsg.value = '';
        });
    }
   // ==========================================================
    // 6. MENU HAMBÚRGUER (Mobile & Auto-Fechamento)
    // ==========================================================
    const hamburger = document.querySelector('.hamburger-menu');
    const navMenu = document.querySelector('.nav-right');
    let isScrolling;

    if (hamburger && navMenu) {
        // Abrir/Fechar ao clicar no ícone
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita que o clique propague para o window
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Fechar ao clicar nos links
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // --- NOVO: FECHAR MENU AO ROLAR PARA BAIXO ---
        window.addEventListener('scroll', () => {
            // Só executa se o menu estiver aberto
            if (navMenu.classList.contains('active')) {
                // Limpa o timeout anterior para não piscar
                window.clearTimeout(isScrolling);

                // Define um novo timeout. Se o usuário parar de rolar por 66ms, o menu fecha.
                // Isso evita fechar o menu se for apenas um "toque" sem querer na tela.
                isScrolling = setTimeout(() => {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                }, 100);
            }
        }, { passive: true }); // 'passive: true' melhora a performance da rolagem
    }
});