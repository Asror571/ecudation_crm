import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const browserLanguage =
  typeof navigator === 'undefined' ? 'uz' : navigator.language.toLowerCase();
const language = browserLanguage.startsWith('ru') ? 'ru' : 'uz';

const resources = {
  uz: {
    translation: {
      app: {
        name: 'Education CRM',
      },
      auth: {
        subtitle: "O'quv markazlari uchun boshqaruv tizimi",
        email: 'Email',
        emailPlaceholder: 'Email manzil',
        password: 'Parol',
        passwordPlaceholder: 'Parol',
        login: 'Tizimga kirish',
        loggingIn: 'Kirilmoqda...',
        loginFailed: 'Kirish amalga oshmadi. Email yoki parolni tekshiring.',
        networkError: "Serverga ulanib bo'lmadi. Keyinroq qayta urinib ko'ring.",
        logout: 'Tizimdan chiqish',
        restoringSession: 'Sessiya tekshirilmoqda',
      },
      dashboard: {
        title: 'Boshqaruv paneli',
      },
      roles: {
        super_admin: 'Super administrator',
        workspace_super_admin: 'Ish maydoni super administratori',
        admin: 'Administrator',
      },
    },
  },
  ru: {
    translation: {
      app: {
        name: 'Education CRM',
      },
      auth: {
        subtitle: 'Система управления для учебных центров',
        email: 'Email',
        emailPlaceholder: 'Электронная почта',
        password: 'Пароль',
        passwordPlaceholder: 'Пароль',
        login: 'Войти',
        loggingIn: 'Выполняется вход...',
        loginFailed: 'Не удалось войти. Проверьте email и пароль.',
        networkError: 'Не удалось подключиться к серверу. Попробуйте позже.',
        logout: 'Выйти из системы',
        restoringSession: 'Проверка сессии',
      },
      dashboard: {
        title: 'Панель управления',
      },
      roles: {
        super_admin: 'Суперадминистратор',
        workspace_super_admin: 'Суперадминистратор рабочего пространства',
        admin: 'Администратор',
      },
    },
  },
};

void i18n.use(initReactI18next).init({
  resources,
  lng: language,
  fallbackLng: 'uz',
  supportedLngs: ['uz', 'ru'],
  initAsync: false,
  interpolation: {
    escapeValue: false,
  },
}).then(() => {
  document.documentElement.lang = i18n.resolvedLanguage ?? 'uz';
  document.title = i18n.t('app.name');
});

export default i18n;
