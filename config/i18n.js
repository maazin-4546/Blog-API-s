const i18next = require("i18next");
const Backend = require("i18next-fs-backend");
const middleware = require("i18next-http-middleware");
const path = require("path");

i18next
    .use(Backend)
    .use(middleware.LanguageDetector)
    .init({
        fallbackLng: "en", // Default language
        preload: ["en", "fr"], // Languages to preload
        backend: {
            loadPath: path.join(__dirname, "../locales/{{lng}}/translation.json"),
        },
        detection: {
            order: ["querystring", "header"], // ?lng=fr OR Accept-Language
            caches: false,
        },
        debug: false, // Set to true for debugging
    });

    
module.exports = {
    i18next,
    i18nMiddleware: middleware.handle(i18next),
};
