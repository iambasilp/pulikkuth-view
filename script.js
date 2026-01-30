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
    drawerLoc: document.getElementById('drawerLoc')
};

// Initialize
function init() {
    setupListeners();
    // Optional: Focus input on load
    els.input.focus();
}

function setupListeners() {
    // Search Input Listener
    els.input.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();

        if (query.length === 0) {
            hideResults();
            return;
        }

        const matches = filterData(query);
        renderResults(matches);
    });

    // Close Dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!els.input.contains(e.target) && !els.results.contains(e.target)) {
            hideResults();
        }
    });

    // Focus input -> Show results if text exists
    els.input.addEventListener('focus', () => {
        if (els.input.value.trim().length > 0) {
            els.results.classList.remove('hidden');
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
}

function filterData(query) {
    // Max results to show in dropdown to keep it performant
    const MAX_RESULTS = 20;

    return data.filter(item => {
        // Safe check for properties
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

function renderResults(results) {
    if (results.length === 0) {
        els.results.innerHTML = `<div class="no-results">No customers found.</div>`;
        els.results.classList.remove('hidden');
        return;
    }

    els.results.innerHTML = results.map(item => `
        <div class="result-item" onclick="viewDetails('${item.LOCATION || ''}','${escapeHtml(JSON.stringify(item))}')">
            <div class="result-info">
                <h4>${item['CUSTOMER NAME']}</h4>
                <p>${item.PLACE} • ${item.ROUTE}</p>
            </div>
            <i class="fa-solid fa-chevron-right result-arrow"></i>
        </div>
    `).join('');

    els.results.classList.remove('hidden');
}

function hideResults() {
    els.results.classList.add('hidden');
}

// Global scope for onclick
window.viewDetails = (location, itemStr) => {
    // Decode the item
    const item = JSON.parse(decodeHtml(itemStr));

    // Populate Drawer
    // Handle Avatar (check if valid URL or just filename)
    let avatarSrc = item.PHOTO;
    if (!avatarSrc || !avatarSrc.startsWith('http')) {
        // If empty or local file, use UI Avatars fallback
        avatarSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(item['CUSTOMER NAME'])}&background=random`;
    }

    els.drawerContent.innerHTML = `
        <div class="drawer-profile-header" style="text-align:center; margin-bottom:20px;">
            <img src="${avatarSrc}" style="width:80px; height:80px; border-radius:50%; margin-bottom:10px; object-fit:cover;">
            <h2 style="margin-bottom:5px;">${item['CUSTOMER NAME']}</h2>
            <p style="color:var(--text-secondary);">${item.CATEGORY}</p>
        </div>

        <div class="detail-section">
            <div class="detail-label">CONTACT</div>
            <div class="detail-value" style="font-size:1.2rem;">${item['MOBILE NUMBER']}</div>
        </div>

        <div class="detail-section">
            <div class="detail-label">LOCATION</div>
            <div class="detail-value">${item.PLACE}</div>
        </div>

        <div class="detail-section">
            <div class="detail-label">ROUTE</div>
            <div class="detail-value highlight">${item.ROUTE}</div>
        </div>
        
        <div class="detail-section" style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <div>
                <div class="detail-label">SALES EXEC</div>
                <div class="detail-value">${getExecutiveLink(item['SALES EXECUTIVE'])}</div>
            </div>
            <div>
                 <div class="detail-label">TYPE</div>
                <div class="detail-value">${item['TYPE OF SALES'] || 'N/A'}</div>
            </div>
        </div>
        
        <div class="detail-section" style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <div>
                <div class="detail-label" style="color:#22c55e;">RATE (GREEN)</div>
                <div class="detail-value">${item['RATE GREEN']}</div>
            </div>
            <div>
                 <div class="detail-label" style="color:#f59e0b;">RATE (ORANGE)</div>
                <div class="detail-value">${item['RATE ORANGE']}</div>
            </div>
        </div>
    `;

    // Actions
    els.drawerCall.href = `tel:${item['MOBILE NUMBER']}`;
    els.drawerLoc.href = item.LOCATION || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.PLACE + ' ' + item.ROUTE)}`;

    // Show Drawer
    els.drawer.classList.add('active');

    // Hide dropdown
    hideResults();
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
