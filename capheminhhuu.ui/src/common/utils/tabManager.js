const TAB_KEY = 'tabId';
const TAB_BIRTH_KEY = 'tabBirth';

function generateTabId() {
    return 'tab-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
}

function initTabId() {
    const existingId = sessionStorage.getItem(TAB_KEY);
    const existingBirth = sessionStorage.getItem(TAB_BIRTH_KEY);
    const now = Date.now();

    if (!existingId) {
        const newId = generateTabId();
        sessionStorage.setItem(TAB_KEY, newId);
        sessionStorage.setItem(TAB_BIRTH_KEY, now.toString());
        return newId;
    }

    // Anti-duplicate: detect tab duplicate qua performance.timeOrigin
    const pageStartTime = Math.floor(performance.timeOrigin);
    const birthTime = parseInt(existingBirth || '0');

    if (Math.abs(pageStartTime - birthTime) > 5000) {
        const newId = generateTabId();
        sessionStorage.setItem(TAB_KEY, newId);
        sessionStorage.setItem(TAB_BIRTH_KEY, now.toString());
        return newId;
    }

    return existingId;
}

function getTabId() {
    return sessionStorage.getItem(TAB_KEY) || initTabId();
}

// Khởi tạo ngay khi module load
initTabId();

const tabManager = { getTabId };

export default tabManager;
