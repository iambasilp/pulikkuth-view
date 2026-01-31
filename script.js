// Data Source
const data = window.customersData || [];

// DOM Elements
const els = {
    input: document.getElementById('searchInput'),
    results: document.getElementById('searchResults'),
    drawer: document.getElementById('detailsDrawer'),
    drawerContent: document.getElementById('drawerContent'),
    closeDrawer: document.getElementById('closeDrawer'),
    drawerCall: document.getElementById('drawerCall'),
    drawerLoc: document.getElementById('drawerLoc'),
    voiceBtn: document.getElementById('voiceBtn'),
    themeToggle: document.getElementById('themeToggle')
};

// Theme Logic
const theme = {
    toggle: () => {
        const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
        const newTheme = isDark ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        theme.updateIcon(newTheme);
    },
    init: () => {
        const savedTheme = localStorage.getItem('theme');
        // Default to dark if no match, matching original design
        if (savedTheme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
            theme.updateIcon('light');
        } else {
            document.documentElement.removeAttribute('data-theme');
            theme.updateIcon('dark');
        }
    },
    updateIcon: (mode) => {
        const icon = els.themeToggle.querySelector('i');
        if (mode === 'light') {
            icon.className = 'fa-solid fa-sun';
        } else {
            icon.className = 'fa-solid fa-moon';
        }
    }
};

// Initialize
function init() {
    setGreeting();
    theme.init();
    updateDataStatus();
    setupListeners();
    setupVoiceSearch();
    // Optional: Focus input on load
    els.input.focus();
}

function updateDataStatus() {
    // ... existing updateDataStatus ...

    // ... existing setupVoiceSearch ...

    // ... existing setGreeting ...

    // ... existing viewDetails logic ...
    window.viewDetails = (location, itemStr) => {
        const item = JSON.parse(decodeHtml(itemStr));
        window.currentItem = item; // Store for actions

        let delay = 0;
        const getDelay = () => {
            delay += 0.04;
            return `${delay}s`;
        };

        els.drawerContent.innerHTML = `
        <div class="drawer-profile-header animate-in" style="text-align:center; margin-bottom:24px; animation-delay: ${getDelay()};">
            <h2 style="margin-bottom:8px; font-size:1.5rem;">${item['CUSTOMER NAME']}</h2>
            <p style="color:var(--text-secondary); font-size:1.1rem;"><i class="fa-solid fa-location-dot" style="margin-right:5px; font-size:0.9em;"></i>${item.PLACE}</p>
        </div >

        <div class="detail-row animate-in" style="animation-delay: ${getDelay()};">
            <div class="detail-label">CONTACT</div>
            <div class="detail-value" onclick="copyToClipboard('${item['MOBILE NUMBER']}')" style="cursor:pointer; display:flex; align-items:center; justify-content:flex-end; gap:8px;">
                ${item['MOBILE NUMBER']} <i class="fa-regular fa-copy" style="font-size:0.8em; opacity:0.5;"></i>
            </div>
        </div>

        <div class="detail-row animate-in" style="animation-delay: ${getDelay()};">
            <div class="detail-label">CATEGORY</div>
            <div class="detail-value">${item.CATEGORY}</div>
        </div>

        <div class="detail-row animate-in" style="animation-delay: ${getDelay()};">
            <div class="detail-label">ROUTE</div>
            <div class="detail-value highlight">${item.ROUTE}</div>
        </div>
        
        <div class="detail-row animate-in" style="animation-delay: ${getDelay()};">
            <div class="detail-label">SALES EXEC</div>
            <div class="detail-value">${getExecutiveLink(item['SALES EXECUTIVE'])}</div>
        </div>

        <div class="detail-row animate-in" style="animation-delay: ${getDelay()};">
             <div class="detail-label">TYPE</div>
            <div class="detail-value">${item['TYPE OF SALES'] || 'N/A'}</div>
        </div>
        
        <div class="animate-in" style="margin-top:24px; display:grid; grid-template-columns: 1fr 1fr; gap:12px; animation-delay: ${getDelay()};">
            <div style="text-align:center; padding:12px; background:rgba(34, 197, 94, 0.1); border-radius:12px; border:1px solid rgba(34, 197, 94, 0.2);">
                <div class="detail-label" style="color:#22c55e; margin-bottom:4px;">RATE (GREEN)</div>
                <div class="detail-value" style="color:#4ade80;">${item['RATE GREEN']}</div>
            </div>
            <div style="text-align:center; padding:12px; background:rgba(245, 158, 11, 0.1); border-radius:12px; border:1px solid rgba(245, 158, 11, 0.2);">
                 <div class="detail-label" style="color:#f59e0b; margin-bottom:4px;">RATE (ORANGE)</div>
                <div class="detail-value" style="color:#fbbf24;">${item['RATE ORANGE']}</div>
            </div>
        </div>
        

        `;

        els.drawerCall.href = `tel:${item['MOBILE NUMBER']} `;
        els.drawerLoc.href = item.LOCATION || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.PLACE + ' ' + item.ROUTE)}`;

        els.drawer.classList.add('active');
        hideResults();

        // Ensure we don't clear history/favs here logic is separate
    };
    const statusEl = document.getElementById('dataStatus');
    if (statusEl) {
        statusEl.innerText = `Searching database of ${data.length.toLocaleString()} customers`;
        statusEl.style.opacity = '1';
    }
}

function setupVoiceSearch() {
    const voiceBtn = document.getElementById('voiceBtn');
    if (!('webkitSpeechRecognition' in window)) {
        voiceBtn.style.display = 'none'; // Hide if not supported
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';

    voiceBtn.addEventListener('click', () => {
        if (voiceBtn.classList.contains('listening')) {
            recognition.stop();
        } else {
            recognition.start();
        }
    });

    recognition.onstart = () => {
        voiceBtn.classList.add('listening');
        els.input.placeholder = "Listening...";
    };

    recognition.onend = () => {
        voiceBtn.classList.remove('listening');
        els.input.placeholder = "Search by Name, Place, or Phone...";
        els.input.focus();
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        els.input.value = transcript;
        els.input.dispatchEvent(new Event('input')); // Trigger search
    };
}

function setGreeting() {
    const hour = new Date().getHours();
    let greeting = 'Customer Search';
    const subtitle = document.querySelector('.search-subtitle');

    if (hour < 12) greeting = 'Good Morning';
    else if (hour < 18) greeting = 'Good Afternoon';
    else greeting = 'Good Evening';

    if (subtitle) {
        subtitle.innerHTML = `<span style="opacity:0.6; display:block; font-size:0.8em; font-weight:400; margin-bottom:5px;">${greeting}</span>Customer Search`;
    }
}

function setupListeners() {
    // Search Input Listener
    els.input.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();

        if (query.length === 0) {
            showHistory(); // Back to history if cleared
            return;
        }

        debouncedFilter(query);
    });

    // Close Dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!els.input.contains(e.target) && !els.results.contains(e.target) && e.target.id !== 'voiceBtn' && !e.target.closest('#voiceBtn')) {
            hideResults();
        }
    });

    // Focus input -> Show results if text exists
    els.input.addEventListener('focus', () => {
        if (els.input.value.trim().length > 0) {
            els.results.classList.remove('hidden');
        } else {
            showHistory();
        }
    });

    // Drawer Listeners
    els.closeDrawer.addEventListener('click', closeDrawer);

    // Close Drawer when clicking outside (on the overlay part if we had one, 
    // but here we just have a side drawer. Let's add Escape key support)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeDrawer();
            hideResults();
        }
    });

    // Theme Toggle
    if (els.themeToggle) {
        els.themeToggle.addEventListener('click', theme.toggle);
    }
}

// Keyboard Navigation
els.input.addEventListener('keydown', (e) => {
    const results = els.results.querySelectorAll('.result-item');
    if (results.length === 0) return;

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % results.length;
        updateSelection(results);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = (selectedIndex - 1 + results.length) % results.length;
        updateSelection(results);
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
            results[selectedIndex].click();
            els.input.blur();
        }
    }
});


// State for keyboard nav
let selectedIndex = -1;

function updateSelection(results) {
    results.forEach((el, index) => {
        if (index === selectedIndex) {
            el.classList.add('selected');
            el.scrollIntoView({ block: 'nearest' });
        } else {
            el.classList.remove('selected');
        }
    });
}

// Debounce Utility
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// --- History Management ---
function getHistory() {
    try {
        return JSON.parse(localStorage.getItem('searchHistory') || '[]');
    } catch { return []; }
}

function addToHistory(item) {
    let history = getHistory();
    // Unique by name+phone to avoid duplicates
    history = history.filter(h => h['CUSTOMER NAME'] !== item['CUSTOMER NAME']);
    history.unshift(item);
    if (history.length > 5) history.pop(); // Keep last 5
    localStorage.setItem('searchHistory', JSON.stringify(history));
}

function clearHistory() {
    localStorage.removeItem('searchHistory');
    hideResults();
}

function showHistory() {
    const history = getHistory();
    if (history.length === 0) {
        hideResults();
        return;
    }

    els.results.innerHTML = `
        <div class="dropdown-header">
            <span>Recent Searches</span>
            <span class="clear-history" onclick="event.stopPropagation(); clearHistory()">Clear</span>
        </div>
    ` + history.map((item, index) => `
        <div class="result-item animate-in" style="animation-delay: ${index * 0.03}s" onclick="viewDetails('${item.LOCATION || ''}','${escapeHtml(JSON.stringify(item))}')">
            <div class="result-info">
                <h4><i class="fa-solid fa-clock-rotate-left" style="margin-right:8px; font-size:0.8em; opacity:0.6;"></i>${item['CUSTOMER NAME']}</h4>
                <p>${item.PLACE}</p>
            </div>
            <i class="fa-solid fa-chevron-right result-arrow"></i>
        </div>
    `).join('');

    els.results.classList.remove('hidden');
}

// --- Highlighting Logic ---
function highlightText(text, query) {
    if (!query || query.length < 1) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="highlight-match">$1</span>');
}

const debouncedFilter = debounce((query) => {
    const matches = filterData(query);
    renderResults(matches, query);
}, 250); // 250ms delay for snappiness

function filterData(query) {
    // Max results to show in dropdown
    const MAX_RESULTS = 20;

    return data.filter(item => {
        const name = (item['CUSTOMER NAME'] || '').toLowerCase();
        const place = (item['PLACE'] || '').toLowerCase();
        const phone = (item['MOBILE NUMBER'] || '');
        const route = (item['ROUTE'] || '').toLowerCase();

        return name.includes(query) ||
            place.includes(query) ||
            phone.includes(query) ||
            route.includes(query);
    }).slice(0, MAX_RESULTS);
}

function renderResults(results, query = '') {
    // Reset selection on new search
    selectedIndex = -1;

    if (results.length === 0) {
        els.results.innerHTML = `
            <div class="no-results animate-in">
                <i class="fa-solid fa-magnifying-glass" style="font-size:2rem; margin-bottom:10px; opacity:0.3;"></i>
                <p>No customers found</p>
            </div>
        `;
        els.results.classList.remove('hidden');
        return;
    }

    els.results.innerHTML = results.map((item, index) => `
        <div class="result-item animate-in" style="animation-delay: ${index * 0.03}s" onclick="addToHistory(JSON.parse('${escapeHtml(JSON.stringify(item))}')); viewDetails('${item.LOCATION || ''}','${escapeHtml(JSON.stringify(item))}')">
            <div class="result-info">
                <h4>${highlightText(item['CUSTOMER NAME'], query)}</h4>
                <p>${highlightText(item.PLACE, query)}</p>
            </div>
            <i class="fa-solid fa-chevron-right result-arrow"></i>
        </div>
    `).join('');

    els.results.classList.remove('hidden');
}

function hideResults() {
    els.results.classList.add('hidden');
    selectedIndex = -1;
}

// Clipboard Action
window.copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        showToast(`Copied: ${text}`);
    });
};

function showToast(message) {
    // Create toast element on fly
    const toast = document.createElement('div');
    toast.className = 'toast animate-in';
    toast.innerText = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px) translateX(-50%)';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// Global scope for onclick
window.viewDetails = (location, itemStr) => {
    const item = JSON.parse(decodeHtml(itemStr));
    window.currentItem = item; // Store for actions

    let delay = 0;
    const getDelay = () => {
        delay += 0.04;
        return `${delay}s`;
    };

    const isFav = isFavorite(item);
    const favIconClass = isFav ? 'fa-solid fa-star' : 'fa-regular fa-star';
    const favBtn = document.getElementById('favBtn');

    // Update existing button state
    if (favBtn) {
        favBtn.innerHTML = `<i class="${favIconClass}"></i>`;
        if (isFav) favBtn.classList.add('active');
        else favBtn.classList.remove('active');
    }

    // Nearby Logic
    const nearby = data.filter(d => d.PLACE === item.PLACE && d['CUSTOMER NAME'] !== item['CUSTOMER NAME']).slice(0, 5);
    let nearbyHtml = '';
    if (nearby.length > 0) {
        nearbyHtml = `
            <div class="nearby-section animate-in" style="animation-delay: ${getDelay()};">
                <div class="nearby-title">Also in ${item.PLACE}</div>
                <div class="nearby-scroll">
                    ${nearby.map(n => `
                        <div class="nearby-card" onclick="viewDetails('${n.LOCATION || ''}','${escapeHtml(JSON.stringify(n))}')">
                            <h5>${n['CUSTOMER NAME']}</h5>
                            <p>${n.ROUTE}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    els.drawerContent.innerHTML = `
        <div class="drawer-profile-header animate-in" style="text-align:center; margin-bottom:24px; animation-delay: ${getDelay()};">
            <h2 style="margin-bottom:8px; font-size:1.5rem;">${item['CUSTOMER NAME']}</h2>
            <p style="color:var(--text-secondary); font-size:1.1rem;"><i class="fa-solid fa-location-dot" style="margin-right:5px; font-size:0.9em;"></i>${item.PLACE}</p>
        </div>

        <div class="detail-row animate-in" style="animation-delay: ${getDelay()};">
            <div class="detail-label">CONTACT</div>
            <div class="detail-value" onclick="copyToClipboard('${item['MOBILE NUMBER']}')" style="cursor:pointer; display:flex; align-items:center; justify-content:flex-end; gap:8px;">
                ${item['MOBILE NUMBER']} <i class="fa-regular fa-copy" style="font-size:0.8em; opacity:0.5;"></i>
            </div>
        </div>

        <div class="detail-row animate-in" style="animation-delay: ${getDelay()};">
            <div class="detail-label">CATEGORY</div>
            <div class="detail-value">${item.CATEGORY}</div>
        </div>

        <div class="detail-row animate-in" style="animation-delay: ${getDelay()};">
            <div class="detail-label">ROUTE</div>
            <div class="detail-value highlight">${item.ROUTE}</div>
        </div>
        
        <div class="detail-row animate-in" style="animation-delay: ${getDelay()};">
            <div class="detail-label">SALES EXEC</div>
            <div class="detail-value">${getExecutiveLink(item['SALES EXECUTIVE'])}</div>
        </div>

        <div class="detail-row animate-in" style="animation-delay: ${getDelay()};">
             <div class="detail-label"> CUSTOMER TYPE</div>
            <div class="detail-value">${item['TYPE OF SALES'] || 'N/A'}</div>
        </div>
        
        <div class="animate-in" style="margin-top:24px; display:grid; grid-template-columns: 1fr 1fr; gap:12px; animation-delay: ${getDelay()};">
            <div style="text-align:center; padding:12px; background:rgba(34, 197, 94, 0.1); border-radius:12px; border:1px solid rgba(34, 197, 94, 0.2);">
                <div class="detail-label" style="color:#22c55e; margin-bottom:4px;">RATE (GREEN)</div>
                <div class="detail-value" style="color:#4ade80;">${item['RATE GREEN']}</div>
            </div>
            <div style="text-align:center; padding:12px; background:rgba(245, 158, 11, 0.1); border-radius:12px; border:1px solid rgba(245, 158, 11, 0.2);">
                 <div class="detail-label" style="color:#f59e0b; margin-bottom:4px;">RATE (ORANGE)</div>
                <div class="detail-value" style="color:#fbbf24;">${item['RATE ORANGE']}</div>
            </div>
        </div>
        

    `;

    els.drawerCall.href = `tel:${item['MOBILE NUMBER']}`;
    els.drawerLoc.href = item.LOCATION || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.PLACE + ' ' + item.ROUTE)}`;

    els.drawer.classList.add('active');
    hideResults();

    // Store current item for actions
    window.currentItem = item;
};

// --- External Integrations ---
window.shareContact = async () => {
    const item = window.currentItem;
    if (!item) return;

    const mapLink = item.LOCATION || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.PLACE + ' ' + item.ROUTE)}`;

    const shareData = {
        title: item['CUSTOMER NAME'],
        text: `👤 ${item['CUSTOMER NAME']}\n📞 ${item['MOBILE NUMBER']}\n📍 ${item['PLACE']}\n🛣️ ${item['ROUTE']}\n🔗 Location Link: ${mapLink}`,
        url: window.location.href
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            console.log('Share canceled');
        }
    } else {
        copyToClipboard(`${shareData.title}\n${shareData.text}`);
        showToast('Details copied to clipboard');
    }
};

function getExecutiveLink(name) {
    if (!name) return '-';

    const phones = {
        'NASEEF': '9048324644',
        'SHIBIN': '9947196277',
        'DILEEP': '8593097111'
    };

    const cleanName = name.trim().toUpperCase();
    const phone = phones[cleanName];

    if (phone) {
        return `<a href="tel:${phone}" style="color:var(--accent); text-decoration:none; display:flex; align-items:center; gap:5px;">
                    <i class="fa-solid fa-phone" style="font-size:0.8em; margin-right:5px;"></i>${name}
                </a>`;
    }
    return name;
}

function closeDrawer() {
    els.drawer.classList.remove('active');
}

// Helpers for escaping HTML in onclick
function escapeHtml(str) {
    return str.replace(/'/g, "&apos;").replace(/"/g, "&quot;");
}

function decodeHtml(str) {
    return str.replace(/&apos;/g, "'").replace(/&quot;/g, '"');
}

// Start
init();
