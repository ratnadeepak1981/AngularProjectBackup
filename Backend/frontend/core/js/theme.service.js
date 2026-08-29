/**
 * ==========================================================================
 * Campus Services Portal - Theme Customizer Service
 * Allows live customization of brand color themes and font scaling.
 * ==========================================================================
 */

const ThemeService = (function () {
    const THEMES = {
        OXFORD: 'oxford-navy',
        CAMBRIDGE: 'cambridge-emerald',
        HARVARD: 'harvard-crimson',
        MIT: 'mit-cyber-dark',
        STANFORD: 'stanford-cardinal'
    };

    function initTheme() {
        const savedTheme = localStorage.getItem('userPortalTheme') || THEMES.OXFORD;
        setTheme(savedTheme);
    }

    function setTheme(themeKey) {
        document.documentElement.setAttribute('data-theme', themeKey);
        localStorage.setItem('userPortalTheme', themeKey);

        const themeSelector = document.getElementById('select-university-theme');
        if (themeSelector) {
            themeSelector.value = themeKey;
        }
    }

    return {
        initTheme,
        setTheme,
        THEMES
    };
})();

document.addEventListener('DOMContentLoaded', ThemeService.initTheme);
