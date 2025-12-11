document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById('saveBtn');
    const birthInput = document.getElementById('birthDate');
    const locationSelect = document.getElementById('locationSelect');
    const themeSelect = document.getElementById('themeSelect');

    // Load existing settings
    const savedBirth = localStorage.getItem('starlog_birth');
    const savedLocation = localStorage.getItem('starlog_location_name');
    const savedTheme = localStorage.getItem('starlog_theme_mode');

    if (savedBirth) birthInput.value = savedBirth;
    if (savedLocation) locationSelect.value = savedLocation;
    if (savedTheme) themeSelect.value = savedTheme;

    saveBtn.addEventListener('click', () => {
        const birth = birthInput.value;
        const locName = locationSelect.value;
        const themeMode = themeSelect.value;

        if (!birth || !locName) {
            alert('全ての項目を入力してください。');
            return;
        }

        const locData = LOCATIONS[locName];
        if (!locData) {
            alert('不正な場所が選択されました。');
            return;
        }

        localStorage.setItem('starlog_birth', birth);
        localStorage.setItem('starlog_location_name', locName);
        localStorage.setItem('starlog_lat', locData.lat);
        localStorage.setItem('starlog_lng', locData.lng);
        localStorage.setItem('starlog_theme_mode', themeMode);

        // Calculate and save zodiac
        const zodiac = getZodiacFromBirth(birth);
        if (zodiac) {
            localStorage.setItem('starlog_zodiac_jp', zodiac.jp);
            localStorage.setItem('starlog_zodiac_en', zodiac.en);
        }

        // Redirect to home
        window.location.href = 'home.html';
    });
});
