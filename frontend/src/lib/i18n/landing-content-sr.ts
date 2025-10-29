/**
 * Serbian Cyrillic Content for BZR Portal Landing Page
 * Locale: sr-Cyrl-RS
 *
 * All user-facing text for landing page marketing content
 */

export const landingContentSr = {
  // Navigation
  nav: {
    home: 'Почетна',
    features: 'Функционалности',
    pricing: 'Цене',
    about: 'О нама',
    contact: 'Контакт',
    login: 'Пријава',
    register: 'Региструјте се',
  },

  // Hero Section (Homepage)
  hero: {
    headline: 'Израда Акта о процени ризика за 5 минута са AI',
    subheadline: '10× брже од ручног рада. Мобилна платформа за БЗР инспекторе и предузећа.',
    ctaPrimary: 'Почните бесплатно',
    ctaSecondary: 'Погледајте демо',
    demoPlaceholder: 'Видео демо: Скенирајте Образац 6 телефоном → AI OCR екстракција → Аутоматска база података',
  },

  // Value Propositions (Homepage)
  valueProps: {
    sectionTitle: 'Зашто БЗР Портал?',
    ai: {
      title: '10× брже са AI',
      description: 'Акт о процени ризика генерисан за 5 минута уместо 2+ сата ручног рада. DeepSeek R1 AI аутоматски попуњава све секције.',
      icon: 'sparkles',
    },
    mobile: {
      title: 'Радите са телефона',
      description: 'Теренски рад без лаптопа. Скенирајте папирне документе (Образац 6), фотографишите опрему, QR кодови. Offline PWA мод.',
      icon: 'smartphone',
    },
    legal: {
      title: 'Усаглашено са законом',
      description: 'Правилник о БЗР (2023), Закон о безбедности и здрављу на раду. Сви обрасци и шаблониvalidовани од стране правних експерата.',
      icon: 'shield-check',
    },
  },

  // Comparison Table (Homepage)
  comparison: {
    sectionTitle: 'БЗР Портал vs Конкуренција',
    subtitle: 'Зашто смо бољи од bzrplatforma.rs и ручног рада',
    features: {
      aiGeneration: 'AI генерисање докумената',
      mobileOCR: 'Mobile OCR скенирање',
      offlineMode: 'Offline режим рада',
      cameraIntegration: 'Камера за фотографисање опреме',
      qrScanning: 'QR код скенирање',
      multiTenant: 'Multi-tenancy (предузећа)',
      rbac: 'Контрола приступа (RBAC)',
      legalCompliance: 'Правна усаглашеност',
      pricing: 'Цена (месечно)',
    },
    columns: {
      bzrPortal: 'БЗР Портал',
      bzrplatforma: 'bzrplatforma.rs',
      manual: 'Ручни рад (Word)',
    },
    values: {
      yes: 'Да',
      no: 'Не',
      partial: 'Делимично',
      free: 'Бесплатно',
      paid: '3000-6000 РСД',
      expensive: '2+ сата рада',
    },
  },

  // Pricing Section (Homepage & /pricing page)
  pricing: {
    sectionTitle: 'Транспарентне цене',
    subtitle: '14 дана бесплатно. Без скривених трошкова.',
    trial: {
      name: 'Trial',
      price: 'Бесплатно',
      duration: '14 дана',
      features: [
        'Све функционалности',
        'До 10 радника',
        'Основна подршка (email)',
        'AI генерисање докумената',
        'Mobile OCR скенирање',
      ],
      cta: 'Почните бесплатно',
      highlighted: false,
    },
    professional: {
      name: 'Professional',
      price: '3000-6000 РСД',
      duration: 'месечно',
      priceNote: 'Зависи од броја запослених',
      features: [
        'Све Trial функционалности',
        'Неограничен број радника',
        'Приоритетна подршка (24/7)',
        'Offline PWA мод',
        'QR код скенирање опреме',
        'Multi-tenancy (више предузећа)',
        'Извоз у Excel/Word/PDF',
      ],
      cta: 'Изаберите план',
      highlighted: true,
    },
    pricingTiers: [
      { employees: '0-50', price: '3000 РСД/месечно' },
      { employees: '51-200', price: '4500 РСД/месечно' },
      { employees: '201+', price: '6000 РСД/месечно' },
    ],
  },

  // FAQ Section (Homepage & /pricing page)
  faq: {
    sectionTitle: 'Често постављана питања',
    items: [
      {
        question: 'Да ли је БЗР Портал усаглашен са српским законима?',
        answer: 'Да. Сви обрасци и шаблони су validовани према Правилнику о БЗР (2023) и Закону о безбедности и здрављу на раду. Редовно ажурирамо платформу са новим законским променама.',
      },
      {
        question: 'Колико времена треба за генерисање Акта о процени ризика?',
        answer: 'Са AI асистентом, процес траје 5-10 минута. Ручни рад обично захтева 2+ сата за исти документ.',
      },
      {
        question: 'Да ли могу да радим offline (без интернета)?',
        answer: 'Да. PWA (Progressive Web App) мод омогућава offline рад. Измене се аутоматски синхронизују када се вратите online.',
      },
      {
        question: 'Да ли могу да извезем документе у Word/Excel/PDF?',
        answer: 'Да. Professional план подржава извоз у све стандардне формате (Word DOCX, Excel XLSX, PDF).',
      },
      {
        question: 'Колико кошта Trial период?',
        answer: 'Trial је 100% бесплатан 14 дана. Не треба кредитна картица. Можете отказати у било ком тренутку.',
      },
    ],
  },

  // Final CTA Section (Homepage)
  finalCta: {
    headline: 'Спремни да убрзате процес БЗР процене?',
    subheadline: 'Придружите се стотинама предузећа која већ користе БЗР Портал.',
    ctaPrimary: 'Почните бесплатно (14 дана)',
    ctaSecondary: 'Контактирајте нас',
  },

  // Footer
  footer: {
    tagline: 'AI-Powered платформа за безбедност и здравље на раду',
    copyright: '© 2025 БЗР Портал. Сва права задржана.',
    links: {
      product: {
        title: 'Производ',
        items: [
          { label: 'Функционалности', href: '/features' },
          { label: 'Цене', href: '/pricing' },
          { label: 'FAQ', href: '/pricing#faq' },
        ],
      },
      company: {
        title: 'Компанија',
        items: [
          { label: 'О нама', href: '/about' },
          { label: 'Контакт', href: '/contact' },
        ],
      },
      legal: {
        title: 'Правно',
        items: [
          { label: 'Приватност', href: '/privacy' },
          { label: 'Услови коришћења', href: '/terms' },
        ],
      },
    },
    social: {
      linkedin: 'https://linkedin.com/company/bzr-portal',
      github: 'https://github.com/bzr-portal',
    },
  },

  // Contact Form (/contact page)
  contact: {
    pageTitle: 'Контактирајте нас',
    pageDescription: 'Имате питања? Пошаљите нам поруку и одговорићемо у року од 24 сата.',
    form: {
      nameLabel: 'Име и презиме',
      namePlaceholder: 'Марко Марковић',
      nameRequired: 'Име је обавезно',
      emailLabel: 'Email адреса',
      emailPlaceholder: 'marko@primer.rs',
      emailRequired: 'Email је обавезан',
      emailInvalid: 'Email адреса није валидна',
      companyLabel: 'Назив компаније (опционо)',
      companyPlaceholder: 'Пример ДОО',
      messageLabel: 'Порука',
      messagePlaceholder: 'Занима ме више информација о вашој платформи...',
      messageRequired: 'Порука је обавезна',
      messageMinLength: 'Порука мора имати најмање 10 карактера',
      submitButton: 'Пошаљи',
      submitting: 'Шаљем...',
      successMessage: 'Порука је послата. Одговорићемо у року од 24 сата.',
      errorMessage: 'Грешка при слању поруке. Покушајте поново.',
      rateLimitError: 'Превише захтева. Покушајте поново за 15 минута.',
    },
  },

  // Features Page (/features)
  features: {
    pageTitle: 'Функционалности',
    pageDescription: 'Све што вам треба за управљање безбедношћу и здрављем на раду',
    sections: {
      riskAssessment: {
        title: 'Akt o Proceni Rizika (AI генерисање)',
        description: 'AI асистент анализира Образац 6, идентификује опасности и генерише комплетан Акт о процени ризika за 5 минута.',
        features: [
          'DeepSeek R1 / Claude AI интеграција',
          'Аутоматска идентификација опасности',
          'Препоруке за мере безбедности',
          'Генерисање у DOCX/PDF форматима',
        ],
      },
      mobileFirst: {
        title: 'Mobile-First дизајн',
        description: 'Радите директно са терена користећи телефон или таблет. Offline мод омогућава рад без интернета.',
        features: [
          'PWA (Progressive Web App)',
          'OCR скенирање папирних докумената',
          'QR код скенирање опреме',
          'Камера интеграција за фотографисање',
          'Offline синхронизација',
        ],
      },
      multiTenancy: {
        title: 'Multi-Tenancy за предузећа',
        description: 'Управљајте подацима за више предузећа из једног налога. Идеално за БЗР инспекторе и консултантске агенције.',
        features: [
          'Изолација података по предузећу',
          'RBAC контрола приступа',
          'Admin, Inspector, Viewer улоге',
          'Audit log свих измена',
        ],
      },
      security: {
        title: 'Безбедност података',
        description: 'Enterprise-grade безбедност са енкрипцијом осетљивих података (JMBG, здравствене информације).',
        features: [
          'AES-256 енкрипција JMBG бројева',
          'PostgreSQL RLS (Row Level Security)',
          'Суваbase multi-region backup',
          'GDPR усаглашеност',
        ],
      },
    },
  },

  // About Page (/about)
  about: {
    pageTitle: 'О нама',
    pageDescription: 'Мисија БЗР Портала је да модернизује процес безбедности и здравља на раду у Србији.',
    mission: {
      title: 'Наша мисија',
      description: 'Верујемо да безбедност на раду не би требало да буде бирократски терет. Користећи AI и mobile-first технологије, чинимо БЗР процену брзом, јефтином и приступачном за сва предузећа.',
    },
    story: {
      title: 'Наша прича',
      description: 'БЗР Портал је настао из фрустрације са постојећим решењима која су спора, скупа и тешка за коришћење. Наш тим инжењера и БЗР стручњака створио је платформу која комбинује најновије AI технологије са дубоким разумевањем српских закона о безбедности на раду.',
    },
    team: {
      title: 'Тим',
      description: 'Тим инжењера, дизајнера и БЗР експерата посвећених модернизацији безбедности на раду.',
    },
  },

  // 404 Not Found Page
  notFound: {
    title: '404 - Страница није пронађена',
    description: 'Страница коју тражите не постоји или је премештена.',
    homeButton: 'Назад на почетну',
    contactButton: 'Контактирајте нас',
  },
};

export type LandingContent = typeof landingContentSr;
