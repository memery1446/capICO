import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "Total Raised": "Total Raised",
      "Tokens Sold": "Tokens Sold",
      "Time Remaining": "Time Remaining",
      "Soft Cap": "Soft Cap",
      "Fundraising Progress": "Fundraising Progress",
      "ICO is active": "ICO is active",
      "ICO is not active": "ICO is not active",
      "Soft cap reached": "Soft cap reached",
      "Soft cap not reached": "Soft cap not reached",
    }
  },
  es: {
    translation: {
      "Total Raised": "Total Recaudado",
      "Tokens Sold": "Tokens Vendidos",
      "Time Remaining": "Tiempo Restante",
      "Soft Cap": "Tope Mínimo",
      "Fundraising Progress": "Progreso de Recaudación",
      "ICO is active": "ICO está activa",
      "ICO is not active": "ICO no está activa",
      "Soft cap reached": "Tope mínimo alcanzado",
      "Soft cap not reached": "Tope mínimo no alcanzado",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

