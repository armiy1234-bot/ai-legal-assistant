export interface Category {
  id: string;
  label: string;
  labelEn: string;
  icon: string;
  description: string;
  descriptionEn: string;
  prompt: string;
  color: string;
}

export const categories: Category[] = [
  {
    id: 'civil',
    label: 'Гражданское право',
    labelEn: 'Civil Law',
    icon: 'FileText',
    description: 'Договоры, собственность, наследство, займы',
    descriptionEn: 'Contracts, property, inheritance, loans',
    prompt: 'Ответьте с учётом Гражданского кодекса РФ (ГК РФ), главы о договорах, обязательствах, праве собственности и наследовании.',
    color: 'bg-blue-500',
  },
  {
    id: 'family',
    label: 'Семейное право',
    labelEn: 'Family Law',
    icon: 'Heart',
    description: 'Развод, алименты, опека, раздел имущества',
    descriptionEn: 'Divorce, alimony, custody, property division',
    prompt: 'Ответьте с учётом Семейного кодекса РФ (СК РФ): брак, развод, алименты (ст. 80-120), опека, раздел имущества супругов.',
    color: 'bg-pink-500',
  },
  {
    id: 'labor',
    label: 'Трудовое право',
    labelEn: 'Labor Law',
    icon: 'Briefcase',
    description: 'Увольнение, зарплата, отпуск, дискриминация',
    descriptionEn: 'Dismissal, salary, vacation, discrimination',
    prompt: 'Ответьте с учётом Трудового кодекса РФ (ТК РФ): трудовой договор, увольнение (ст. 71-84), зарплата, отпуск, охрана труда.',
    color: 'bg-amber-500',
  },
  {
    id: 'criminal',
    label: 'Уголовное право',
    labelEn: 'Criminal Law',
    icon: 'Shield',
    description: 'Защита обвиняемого, жалобы, адвокат',
    descriptionEn: 'Defense, appeals, attorney',
    prompt: 'Ответьте с учётом Уголовного кодекса РФ (УК РФ), УПК РФ: составы преступлений, меры пресечения, защита прав обвиняемого, апелляции.',
    color: 'bg-red-500',
  },
  {
    id: 'housing',
    label: 'Жилищное право',
    labelEn: 'Housing Law',
    icon: 'Home',
    description: 'Выселение, приватизация, ЖКХ, соседи',
    descriptionEn: 'Eviction, privatization, utilities, neighbors',
    prompt: 'Ответьте с учётом Жилищного кодекса РФ (ЖК РФ): найм жилья, выселение, приватизация, ЖКХ, права собственников, ТСЖ.',
    color: 'bg-emerald-500',
  },
  {
    id: 'traffic',
    label: 'ДТП и страхование',
    labelEn: 'Traffic & Insurance',
    icon: 'Car',
    description: 'Аварии, ОСАГО, КАСКО, штрафы ГИБДД',
    descriptionEn: 'Accidents, OSAGO, KASKO, traffic fines',
    prompt: 'Ответьте с учётом КоАП РФ (дорожная часть), закона об ОСАГО, ПДД: ДТП, страховые выплаты, штрафы ГИБДД, лишение прав.',
    color: 'bg-orange-500',
  },
  {
    id: 'admin',
    label: 'Административное',
    labelEn: 'Administrative',
    icon: 'Gavel',
    description: 'Штрафы, обжалование, лицензии',
    descriptionEn: 'Fines, appeals, licenses',
    prompt: 'Ответьте с учётом Кодекса об административных правонарушениях РФ (КоАП РФ): штрафы, административный арест, обжалование, лицензирование.',
    color: 'bg-purple-500',
  },
  {
    id: 'business',
    label: 'Бизнес и налоги',
    labelEn: 'Business & Taxes',
    icon: 'Building2',
    description: 'ИП, ООО, налоги, проверки',
    descriptionEn: 'Sole proprietorship, LLC, taxes, inspections',
    prompt: 'Ответьте с учётом Налогового кодекса РФ (НК РФ), ГК РФ (юрлица), закона об ООО: регистрация бизнеса, налоги, проверки, банкротство.',
    color: 'bg-cyan-500',
  },
];

export function getCategoryById(id: string): Category | undefined {
  return categories.find(c => c.id === id);
}
