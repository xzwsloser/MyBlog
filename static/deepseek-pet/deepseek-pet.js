(() => {
    const root = document.querySelector('.deepseek-pet');
    if (!root) {
        return;
    }

    const sprite = root.querySelector('[data-dsp-sprite]');
    const stage = root.querySelector('[data-dsp-stage]');
    const character = root.querySelector('[data-dsp-character]');
    const message = root.querySelector('[data-dsp-message]');
    const announcer = root.querySelector('[data-dsp-announcer]');
    const minimizeButton = root.querySelector('[data-dsp-minimize]');
    const restoreButton = document.querySelector('[data-dsp-restore]');
    const searchInput = document.getElementById('searchInput');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const petScript = document.currentScript
        || Array.from(document.scripts).find((script) => script.src.includes('deepseek-pet/deepseek-pet.js'));
    const assetBase = new URL('img/', petScript.src);
    const asset = (name) => new URL(name, assetBase).href;

    const STORAGE = {
        minimized: 'deepseek-pet:minimized',
        scale: 'deepseek-pet:scale'
    };
    const page = root.dataset.page || 'blog';
    const intro = root.dataset.intro || '今天也要读点新东西呀。';
    const sources = {
        idle: asset('idle.webp'),
        blink: asset('idle-blink.webp'),
        cheerful: asset('cheerful.webp'),
        thinking: asset('thinking.webp'),
        coding: asset('coding.webp'),
        sleeping: asset('sleeping.webp')
    };

    const COPY = {
        home: {
            reactions: ['cheerful', 'coding', 'thinking'],
            clicks: ['在的，想从哪篇开始？', '我陪你一起逛逛。', '今天也要有一点新收获。', '慢慢读，不着急。'],
            idle: ['要不要从最新的一篇开始？', '读累了就看看窗外。', '我安静待在右下角。', '发现喜欢的文章，记得收藏呀。']
        },
        blog: {
            reactions: ['coding', 'cheerful', 'thinking'],
            clicks: ['文章都在这里，挑一篇吧。', '这篇看起来不错。', '要一起读吗？', '你的下一篇文章正在等你。'],
            idle: ['好文章值得慢慢读。', '翻一翻，也许会遇到惊喜。', '今天想读技术还是随笔？', '我在陪你找下一篇文章。']
        },
        archives: {
            reactions: ['thinking', 'cheerful', 'coding'],
            clicks: ['旧文章也值得重读。', '要按年份翻翻看吗？', '时间会把好想法藏进旧笔记里。', '也许有一篇你忘了的。'],
            idle: ['从哪一年开始翻呢？', '旧笔记里常有新发现。', '要不要找一篇很久没看的？', '归档像一条时间线。']
        },
        search: {
            reactions: ['thinking', 'coding', 'cheerful'],
            clicks: ['搜索框在等你输入关键词。', '想找什么？我帮你留意。', '换个关键词也许会更快。', '找到结果后记得告诉我。'],
            idle: ['输入关键词，我帮你守着。', '找不到的话，换个词试试？', '搜索框已经准备好了。', '我在等你的搜索。']
        },
        tags: {
            reactions: ['cheerful', 'thinking', 'coding'],
            clicks: ['每个标签都是一条小路。', '挑一个感兴趣的主题吧。', '好想法常藏在交叉点。', '标签会把相似的文章聚在一起。'],
            idle: ['从一个标签出发吧。', '今天想看哪类文章？', '标签页像一张知识地图。', '也许会发现新的兴趣。']
        },
        about: {
            reactions: ['cheerful', 'thinking', 'coding'],
            clicks: ['很高兴在这里遇见你。', '想认识博主？这一页可以慢慢看。', '这里写着博主的故事。', '你好呀，新朋友。'],
            idle: ['这一页可以慢慢看。', '想更了解博主吗？', '很高兴在这里遇见你。', '故事通常从这里开始。']
        }
    };
    const copy = COPY[page] || COPY.blog;
    const clickLines = [...copy.clicks, '点我做什么呀？', '我在这儿呢。'];
    const safeStorage = {
        get(key) {
            try {
                return window.localStorage.getItem(key);
            } catch {
                return null;
            }
        },
        set(key, value) {
            try {
                window.localStorage.setItem(key, value);
            } catch {
                // Storage can be unavailable in private browsing modes.
            }
        }
    };

    let currentSprite = 'idle';
    let resting = true;
    let searching = false;
    let minimized = false;
    let idleCount = 0;
    let scale = clamp(Number(safeStorage.get(STORAGE.scale)) || 1, 0.72, 1.32);
    let reactionTimer = 0;
    let blinkTimer = 0;
    let blinkRestoreTimer = 0;
    let idleTimer = 0;
    let idleRestoreTimer = 0;
    let typeTimer = 0;
    let typeRun = 0;
    let searchTimer = 0;

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    function pick(items) {
        return items[Math.floor(Math.random() * items.length)];
    }

    function currentSearch() {
        return searchInput ? searchInput.value.trim() : '';
    }

    function announce(text) {
        if (!announcer) {
            return;
        }
        announcer.textContent = '';
        window.setTimeout(() => {
            announcer.textContent = text;
        }, 20);
    }

    function typeMessage(text, instant = reduceMotion) {
        const value = String(text).trim().slice(0, 120);
        window.clearInterval(typeTimer);
        typeRun += 1;
        const run = typeRun;

        if (instant || !message) {
            if (message) {
                message.textContent = value;
                message.classList.remove('is-typing');
            }
            announce(value);
            return;
        }

        message.textContent = '';
        message.classList.add('is-typing');
        let cursor = 0;
        typeTimer = window.setInterval(() => {
            if (run !== typeRun) {
                window.clearInterval(typeTimer);
                return;
            }
            cursor += 1;
            message.textContent = value.slice(0, cursor);
            if (cursor >= value.length) {
                window.clearInterval(typeTimer);
                message.classList.remove('is-typing');
            }
        }, 26);
        announce(value);
    }

    function setSprite(name) {
        if (!sprite || !sources[name] || name === currentSprite) {
            return;
        }
        currentSprite = name;
        sprite.src = sources[name];
    }

    function bounce() {
        root.classList.remove('is-reacting');
        void root.offsetWidth;
        root.classList.add('is-reacting');
        window.setTimeout(() => root.classList.remove('is-reacting'), 720);
    }

    function stopTimers() {
        window.clearTimeout(reactionTimer);
        window.clearTimeout(blinkTimer);
        window.clearTimeout(blinkRestoreTimer);
        window.clearTimeout(idleTimer);
        window.clearTimeout(idleRestoreTimer);
    }

    function returnToRest() {
        resting = true;
        setSprite('idle');
        scheduleBlink();
        scheduleIdle();
    }

    function react(name, text, duration = 3200) {
        if (minimized) {
            return;
        }
        resting = false;
        searching = false;
        window.clearTimeout(reactionTimer);
        window.clearTimeout(blinkTimer);
        window.clearTimeout(blinkRestoreTimer);
        window.clearTimeout(idleTimer);
        setSprite(name);
        bounce();
        typeMessage(text);
        reactionTimer = window.setTimeout(() => {
            const query = currentSearch();
            if (query) {
                searching = true;
                setSprite('thinking');
                typeMessage(`正在找「${query.slice(0, 18)}」…`, true);
                return;
            }
            returnToRest();
        }, duration);
    }

    function scheduleBlink() {
        window.clearTimeout(blinkTimer);
        if (reduceMotion || minimized) {
            return;
        }
        blinkTimer = window.setTimeout(() => {
            if (resting && !searching && !document.hidden && currentSprite === 'idle') {
                setSprite('blink');
                blinkRestoreTimer = window.setTimeout(() => {
                    if (currentSprite === 'blink') {
                        setSprite('idle');
                    }
                }, 150);
            }
            scheduleBlink();
        }, 2800 + Math.random() * 3600);
    }

    function scheduleIdle() {
        window.clearTimeout(idleTimer);
        if (reduceMotion || minimized) {
            return;
        }
        idleTimer = window.setTimeout(() => {
            const busyElement = document.activeElement?.matches('input, textarea, select');
            if (document.hidden || searching || !resting || busyElement) {
                scheduleIdle();
                return;
            }
            idleCount += 1;
            const napping = idleCount % 4 === 0;
            setSprite(napping ? 'sleeping' : 'thinking');
            typeMessage(napping ? '我先眯一小会儿…' : pick(copy.idle));
            window.clearTimeout(idleRestoreTimer);
            idleRestoreTimer = window.setTimeout(() => {
                if (resting && !searching) {
                    setSprite('idle');
                }
            }, napping ? 8500 : 3600);
            scheduleIdle();
        }, 28000 + Math.random() * 18000);
    }

    function applyScale(value) {
        scale = clamp(value, 0.72, 1.32);
        character.style.setProperty('--deepseek-pet-scale', scale.toFixed(2));
        safeStorage.set(STORAGE.scale, scale.toFixed(2));
    }

    function refreshSearchState() {
        if (minimized) {
            return;
        }
        window.clearTimeout(searchTimer);
        window.clearTimeout(reactionTimer);
        searchTimer = window.setTimeout(() => {
            const query = currentSearch();
            if (!query) {
                searching = false;
                resting = true;
                setSprite('idle');
                typeMessage(intro);
                scheduleBlink();
                scheduleIdle();
                return;
            }
            searching = true;
            resting = false;
            window.clearTimeout(blinkTimer);
            window.clearTimeout(blinkRestoreTimer);
            window.clearTimeout(idleTimer);
            setSprite('thinking');
            typeMessage(`正在找「${query.slice(0, 18)}」…`, true);
        }, 260);
    }

    function setMinimized(value, silent = false) {
        minimized = value;
        root.hidden = value;
        restoreButton.hidden = !value;
        root.classList.remove('is-reacting');
        safeStorage.set(STORAGE.minimized, value ? '1' : '0');
        stopTimers();

        if (value || silent) {
            return;
        }
        searching = false;
        resting = true;
        setSprite('idle');
        typeMessage(intro);
        scheduleBlink();
        scheduleIdle();
    }

    Object.values(sources).forEach((source) => {
        if (!source) {
            return;
        }
        const preload = new Image();
        preload.src = source;
    });

    applyScale(scale);
    setMinimized(safeStorage.get(STORAGE.minimized) === '1', true);

    if (!minimized) {
        typeMessage(intro);
        scheduleBlink();
        scheduleIdle();
    }

    character.addEventListener('click', () => {
        react(pick(copy.reactions), pick(clickLines));
    });

    stage.addEventListener('wheel', (event) => {
        if (event.ctrlKey || event.deltaY === 0) {
            return;
        }
        event.preventDefault();
        applyScale(scale + (event.deltaY < 0 ? 0.05 : -0.05));
    }, { passive: false });

    minimizeButton.addEventListener('click', () => setMinimized(true));
    restoreButton.addEventListener('click', () => {
        setMinimized(false);
        character.focus({ preventScroll: true });
    });

    if (searchInput) {
        searchInput.addEventListener('input', refreshSearchState);
        searchInput.addEventListener('search', refreshSearchState);
    }

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && !minimized) {
            scheduleBlink();
            scheduleIdle();
        }
    });
})();
