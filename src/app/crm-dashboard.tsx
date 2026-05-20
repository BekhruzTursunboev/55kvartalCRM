'use client'

import React, { useState, useEffect } from 'react';
import { 
  Users, Building2, Search, Plus, MapPin, 
  Phone, X, Check, RefreshCw, Filter, ArrowRight,
  BarChart3, Megaphone, Copy, Edit3, Database, 
  ExternalLink, ChevronDown, Sparkles, TrendingUp, DollarSign, Tag, Info,
  Menu, Send, Download, Printer
} from 'lucide-react';
import { 
  Property, Client, addProperty, addClient, getProperties, 
  getClients, updatePropertyStatus, updateClientStatus, updateClientNotes,
  deleteProperty, deleteClient, getMatchesForClient, 
  getMatchesForProperty, MatchResult, seedDatabase, updateProperty, updateClient
} from './actions';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface CrmDashboardProps {
  initialProperties: Property[];
  initialClients: Client[];
}

const TASHKENT_RAYONS = [
  "Любой (Istalgan)", "Центar (Markaz)",
  "Chilonzor", "Yunusobod", "Mirzo Ulugbek", "Yakkasaray", 
  "Mirobod", "Olmazor", "Shayxontohur", "Uchtepa", 
  "Sergeli", "Yashnobod", "Bektemir", "Yangihayot"
];

const TRANSLATIONS = {
  uz: {
    dashboard: "Tahlil",
    clients: "Mijozlar",
    properties: "Ob'ektlar",
    marketing: "E'lonlar reyestri",
    newClient: "Yangi Mijoz",
    newProperty: "Yangi Ob'ekt",
    search: "Qidiruv (Ism, telefon, tuman...)",
    statusNew: "Yangi",
    statusNegotiating: "Muzokara",
    statusClosed: "Bitim",
    statusArchived: "Arxiv",
    budget: "Byudjet",
    notes: "Eslatmalar",
    matchedProperties: "Mos Ob'ektlar",
    matchedClients: "Mos Mijozlar",
    noMatches: "Mosliklar topilmadi",
    save: "Saqlash",
    cancel: "Bekor qilish",
    delete: "O'chirish",
    phone: "Telefon",
    area: "Maydon",
    rooms: "Xonalar",
    price: "Narx",
    owner: "Egasi",
    refresh: "Yangilash",
    copied: "Nusxalandi",
    lang: "RU",
    allCategories: "Barcha Kategoriyalar",
    allDeals: "Barcha Bitimlar",
    allLocations: "Barcha Hududlar",
    filters: "Filtrlar:",
    analytics: "Tahlil & Statistika",
    totalProperties: "Jami Ob'ektlar",
    totalClients: "Jami Mijozlar",
    budgetUnderManagement: "Boshqaruvdagi Byudjet",
    dealDistribution: "Bitimlar Taqsimoti",
    saleBuy: "Sotuv / Xarid",
    rent: "Ijara",
    categoryDistribution: "Kategoriya Taqsimoti",
    activeListings: "Faol Ob'ektlar",
    postTextUz: "Matn (O'zbekcha)",
    postTextRu: "Matn (Ruscha)",
    telegramChannel: "Telegram Kanal",
    olxAd: "OLX E'lon",
    published: "E'lon qilingan",
    notPublished: "E'lon qilinmagan",
    copyText: "Matnni nusxalash",
    savePost: "E'lonni saqlash",
    matchingFactorsTitle: "Moslik sabablari:",
    edit: "Tahrirlash",
    editClient: "Mijoz ma'lumotlarini tahrirlash",
    editProperty: "Ob'ekt ma'lumotlarini tahrirlash",
    seedData: "Namunaviy ma'lumotlarni yuklash",
    seedPrompt: "Ma'lumotlar bazasi bo'sh. Tizimni sinab ko'rish uchun 1 bosishda Toshkent bo'yicha real namunaviy ma'lumotlarni yuklang!",
    seedSuccess: "Namunaviy ma'lumotlar muvaffaqiyatli yuklandi!"
  },
  ru: {
    dashboard: "Аналитика",
    clients: "Клиенты",
    properties: "Объекты",
    marketing: "Реестр публикаций",
    newClient: "Новый Клиент",
    newProperty: "Новый Объект",
    search: "Поиск (Имя, телефон, район...)",
    statusNew: "Новые",
    statusNegotiating: "Переговоры",
    statusClosed: "Закрытые",
    statusArchived: "Архив",
    budget: "Бюджет",
    notes: "Заметки",
    matchedProperties: "Подходящие Объекты",
    matchedClients: "Подходящие Клиенты",
    noMatches: "Совпадений нет",
    save: "Сохранить",
    cancel: "Отмена",
    delete: "Удалить",
    phone: "Телефон",
    area: "Площадь",
    rooms: "Комнаты",
    price: "Цена",
    owner: "Владелец",
    refresh: "Обновить",
    copied: "Скопировано",
    lang: "UZ",
    allCategories: "Все Категории",
    allDeals: "Все Сделки",
    allLocations: "Все Локации",
    filters: "Фильтры:",
    analytics: "Аналитика и Статистика",
    totalProperties: "Всего Объектов",
    totalClients: "Всего Клиентов",
    budgetUnderManagement: "Бюджет в Управлении",
    dealDistribution: "Распределение Сделок",
    saleBuy: "Продажа / Покупка",
    rent: "Аренда",
    categoryDistribution: "Распределение Категорий",
    activeListings: "Активные Объекты",
    postTextUz: "Текст (Узбекский)",
    postTextRu: "Текст (Русский)",
    telegramChannel: "Telegram Канал",
    olxAd: "Объявление OLX",
    published: "Опубликовано",
    notPublished: "Не опубликовано",
    copyText: "Копировать текст",
    savePost: "Сохранить публикацию",
    matchingFactorsTitle: "Факторы совпадения:",
    edit: "Редактировать",
    editClient: "Редактировать клиента",
    editProperty: "Редактировать объект",
    seedData: "Загрузить демо-данные",
    seedPrompt: "База данных пуста. Загрузите реальные демо-данные по Ташкенту в 1 клик для тестирования системы!",
    seedSuccess: "Демо-данные успешно загружены!"
  }
};

export default function CrmDashboard({ initialProperties, initialClients }: CrmDashboardProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const clientId = parseInt(draggableId);
    const newStatus = destination.droppableId;
    
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, status: newStatus } : c));
    
    try {
      await updateClientStatus(clientId, newStatus);
    } catch (e) {
      console.error(e);
    }
  };

  const [lang, setLang] = useState<'uz' | 'ru'>('uz');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const t = TRANSLATIONS[lang];

  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients' | 'properties' | 'marketing'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Advanced Filters
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDeal, setFilterDeal] = useState('all');
  const [filterRayon, setFilterRayon] = useState('all');

  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [clientMatches, setClientMatches] = useState<MatchResult[]>([]);
  const [propertyMatches, setPropertyMatches] = useState<MatchResult[]>([]);
  const [expandedMatchId, setExpandedMatchId] = useState<number | null>(null);

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isPropModalOpen, setIsPropModalOpen] = useState(false);
  
  // Sorting Option
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'area-asc' | 'area-desc' | 'sqm-asc' | 'sqm-desc'>('newest');
  
  // Deterministic formatters to completely solve Next.js Hydration Mismatch
  const formatNumber = (num: number | string | null | undefined): string => {
    if (num === null || num === undefined) return '0';
    const parsed = typeof num === 'number' ? num : Number(num);
    if (isNaN(parsed)) return '0';
    return parsed.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const formatPrice = (price: number | string | null | undefined): string => {
    return `$${formatNumber(price)}`;
  };

  // Editing Modals
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  // Marketing Registry States
  const [marketingProperty, setMarketingProperty] = useState<Property | null>(null);
  const [marketingCopyUz, setMarketingCopyUz] = useState('');
  const [marketingCopyRu, setMarketingCopyRu] = useState('');
  const [telegramStatus, setTelegramStatus] = useState(false);
  const [telegramLink, setTelegramLink] = useState('');
  const [olxStatus, setOlxStatus] = useState(false);
  const [olxLink, setOlxLink] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [copiedLang, setCopiedLang] = useState<'uz' | 'ru' | null>(null);
  
  const [notesTimeout, setNotesTimeout] = useState<NodeJS.Timeout | null>(null);

  const refreshData = async () => {
    setLoading(true);
    const [props, cls] = await Promise.all([getProperties(), getClients()]);
    setProperties(props);
    setClients(cls);
    setLoading(false);
  };

  useEffect(() => {
    async function fetchClientMatches() {
      if (selectedClient?.id) {
        const results = await getMatchesForClient(selectedClient.id);
        setClientMatches(results);
      }
    }
    fetchClientMatches();
    setExpandedMatchId(null);
  }, [selectedClient?.id]);

  useEffect(() => {
    async function fetchPropMatches() {
      if (selectedProperty?.id) {
        const results = await getMatchesForProperty(selectedProperty.id);
        setPropertyMatches(results);
      }
    }
    fetchPropMatches();
    setExpandedMatchId(null);
  }, [selectedProperty?.id]);

  const handleNotesChange = (clientId: number, newNotes: string) => {
    setSelectedClient(prev => prev ? { ...prev, notes: newNotes } : null);
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, notes: newNotes } : c));
    if (notesTimeout) clearTimeout(notesTimeout);
    const timeout = setTimeout(async () => {
      await updateClientNotes(clientId, newNotes);
    }, 800);
    setNotesTimeout(timeout);
  };

  const handleClientStatusChange = async (clientId: number, newStatus: string) => {
    setSelectedClient(prev => prev ? { ...prev, status: newStatus } : null);
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, status: newStatus } : c));
    await updateClientStatus(clientId, newStatus);
  };

  const handlePropertyStatusChange = async (propId: number, newStatus: string) => {
    setSelectedProperty(prev => prev ? { ...prev, status: newStatus } : null);
    setProperties(prev => prev.map(p => p.id === propId ? { ...p, status: newStatus } : p));
    await updatePropertyStatus(propId, newStatus);
  };

  const deleteSelectedClient = async () => {
    if (!selectedClient?.id) return;
    if (!confirm(t.delete + '?')) return;
    await deleteClient(selectedClient.id);
    setSelectedClient(null);
    await refreshData();
  };

  const deleteSelectedProperty = async () => {
    if (!selectedProperty?.id) return;
    if (!confirm(t.delete + '?')) return;
    await deleteProperty(selectedProperty.id);
    setSelectedProperty(null);
    await refreshData();
  };

  // --- ALGORITHMIC SEARCH ENGINE ---
  const filterTokens = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);

  const filteredClients = clients.filter(c => {
    if (filterCategory !== 'all' && c.category !== filterCategory) return false;
    if (filterDeal !== 'all' && c.deal_type !== filterDeal) return false;
    if (filterRayon !== 'all' && (!c.rayons || !c.rayons.includes(filterRayon))) return false;

    if (filterTokens.length === 0) return true;
    const searchString = `
      ${c.name} ${c.phone} ${c.notes || ''} 
      ${c.price_min} ${c.price_max} 
      ${c.category} ${c.deal_type} 
      ${c.rayons?.join(' ') || ''}
    `.toLowerCase();
    
    return filterTokens.every(token => searchString.includes(token));
  });

  const filteredProperties = properties.filter(p => {
    if (filterCategory !== 'all' && p.category !== filterCategory) return false;
    if (filterDeal !== 'all' && p.deal_type !== filterDeal) return false;
    if (filterRayon !== 'all' && p.rayon !== filterRayon) return false;

    if (filterTokens.length === 0) return true;
    const searchString = `
      ${p.title} ${p.rayon} ${p.price} ${p.area} 
      ${p.contact_name || ''} ${p.contact_phone || ''}
      ${p.category} ${p.deal_type}
    `.toLowerCase();
    
    return filterTokens.every(token => searchString.includes(token));
  });

  // --- SORTING ALGORITHM ---
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'area-asc') return a.area - b.area;
    if (sortBy === 'area-desc') return b.area - a.area;
    
    const sqmA = a.area > 0 ? Math.round(a.price / a.area) : 0;
    const sqmB = b.area > 0 ? Math.round(b.price / b.area) : 0;
    if (sortBy === 'sqm-asc') return sqmA - sqmB;
    if (sortBy === 'sqm-desc') return sqmB - sqmA;
    
    return 0; // fallback to newest
  });

  const sortedClients = [...filteredClients].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price_max - b.price_max;
    if (sortBy === 'price-desc') return b.price_max - a.price_max;
    if (sortBy === 'area-asc') return a.min_area - b.min_area;
    if (sortBy === 'area-desc') return b.min_area - a.min_area;
    return 0;
  });

  const pipelineNew = sortedClients.filter(c => c.status === 'active' || !c.status);
  const pipelinePadbor = sortedClients.filter(c => c.status === 'padbor');
  const pipelinePokaz = sortedClients.filter(c => c.status === 'pokaz');
  const pipelineNegotiating = sortedClients.filter(c => c.status === 'negotiating');
  const pipelineClosed = sortedClients.filter(c => c.status === 'completed');
  const pipelineArchived = sortedClients.filter(c => c.status === 'archived');

  // Generate marketing copies
  const generatePostTexts = (prop: Property) => {
    const isRent = prop.deal_type === 'rent';
    const isZhiloy = prop.category === 'zhiloy';
    const priceText = `$${formatNumber(prop.price)}${isRent ? '/oy' : ''}`;
    const priceTextRu = `$${formatNumber(prop.price)}${isRent ? '/мес' : ''}`;
    
    const rayonUz = prop.rayon === 'Центр (Markaz)' ? 'Tashkent Markazi' : `${prop.rayon} tumani`;
    const rayonRu = prop.rayon === 'Центр (Markaz)' ? 'Центр Ташкента' : `${prop.rayon} район`;

    const typeUz = prop.type === 'apartment' ? 'Kvartira' : prop.type === 'house' ? 'Hovli / Uchastka' : prop.type === 'office' ? 'Ofis' : 'Tijorat joyi';
    const typeRu = prop.type === 'apartment' ? 'Квартира' : prop.type === 'house' ? 'Дом / Участок' : prop.type === 'office' ? 'Офис' : 'Коммерческое помещение';

    const uzTemplate = `🌟 **#OBYEKT E'LONI - 55 Kvartal**

🏢 **Turi:** ${typeUz} (${isZhiloy ? 'Turar joy' : 'No-turar joy'})
📍 **Manzil:** ${rayonUz} ${prop.orientir ? `(Mo'ljal: ${prop.orientir})` : ''}
📐 **Maydoni:** ${prop.area} m²
🚪 **Xonalar soni:** ${prop.rooms ? `${prop.rooms} xona` : 'Erkin loyiha'}
📶 **Qavat:** ${prop.floor ? `${prop.floor}-qavat` : 'N/A'} (Jami: ${prop.max_floor || 'N/A'})

💵 **Narxi:** ${priceText} (${isRent ? 'Ijara' : 'Sotuv'})
📞 **Aloqa:** ${prop.contact_name || '55 Kvartal Agentlik'}
📱 **Telefon:** ${prop.contact_phone}

✨ *55Kvartal professional ko'chmas mulk agentligi. Biz bilan eng yaxshi variantlarni topasiz!*`;

    const ruTemplate = `🌟 **#ОБЪЕКТ ОБЪЯВЛЕНИЕ - 55 Kvartal**

🏢 **Тип объекта:** ${typeRu} (${isZhiloy ? 'Жилой фонд' : 'Нежилой фонд'})
📍 **Адрес:** ${rayonRu} ${prop.orientir ? `(Ориентир: ${prop.orientir})` : ''}
📐 **Площадь:** ${prop.area} м²
🚪 **Количество комнат:** ${prop.rooms ? `${prop.rooms} ком.` : 'Свободная планировка'}
📶 **Этаж:** ${prop.floor ? `${prop.floor}-этаж` : 'N/A'} (Всего: ${prop.max_floor || 'N/A'})

💵 **Цена:** ${priceTextRu} (${isRent ? 'Аренда' : 'Продажа'})
📞 **Контакты:** ${prop.contact_name || '55 Kvartal Агентство'}
📱 **Телефон:** ${prop.contact_phone}

✨ *55Kvartal профессиональное агентство недвижимости. С нами вы найдете лучший вариант!*`;

    return { uzTemplate, ruTemplate };
  };

  // Open marketing drawer and initialize states
  const openMarketingDrawer = (prop: Property) => {
    setMarketingProperty(prop);
    const defaultCopies = generatePostTexts(prop);
    
    // Check if custom copies are saved in property details
    const details = prop.details || {};
    const savedPosts = details.marketing_posts || {};
    
    setMarketingCopyUz(savedPosts.custom_copy_uz || defaultCopies.uzTemplate);
    setMarketingCopyRu(savedPosts.custom_copy_ru || defaultCopies.ruTemplate);
    setTelegramStatus(savedPosts.telegram?.published || false);
    setTelegramLink(savedPosts.telegram?.link || '');
    setOlxStatus(savedPosts.olx?.published || false);
    setOlxLink(savedPosts.olx?.link || '');
  };

  const handleSaveMarketingData = async () => {
    if (!marketingProperty?.id) return;
    
    const updatedDetails = {
      ...(marketingProperty.details || {}),
      marketing_posts: {
        custom_copy_uz: marketingCopyUz,
        custom_copy_ru: marketingCopyRu,
        telegram: {
          published: telegramStatus,
          link: telegramLink,
          published_at: telegramStatus ? new Date().toISOString() : null
        },
        olx: {
          published: olxStatus,
          link: olxLink,
          published_at: olxStatus ? new Date().toISOString() : null
        }
      }
    };

    const updatedProp: Property = {
      ...marketingProperty,
      details: updatedDetails
    };

    setLoading(true);
    const res = await updateProperty(marketingProperty.id, updatedProp);
    setLoading(false);
    
    if (res.success) {
      alert(lang === 'uz' ? "E'lon saqlandi!" : "Публикация сохранена!");
      setMarketingProperty(null);
      await refreshData();
    } else {
      alert("Error: " + res.error);
    }
  };

  // Clipboard copy helper
  const copyToClipboard = (text: string, id: number, language: 'uz' | 'ru') => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setCopiedLang(language);
    setTimeout(() => {
      setCopiedId(null);
      setCopiedLang(null);
    }, 1500);
  };

  // Export to CSV utility
  const exportToCSV = () => {
    const isClient = activeTab === 'clients';
    const data = isClient ? clients : properties;
    if (!data.length) return alert('No data to export!');

    const headers = isClient 
      ? ['ID', 'Name', 'Phone', 'Category', 'Deal Type', 'Min Price', 'Max Price', 'Status', 'Notes']
      : ['ID', 'Title', 'Category', 'Deal Type', 'Price', 'Area', 'Rooms', 'Rayon', 'Phone'];

    const rows = data.map((item: any) => {
      if (isClient) {
        return [
          item.id, `"${item.name}"`, item.phone, item.category, item.deal_type, 
          item.price_min || '', item.price_max, item.status || 'active', `"${(item.notes || '').replace(/"/g, '""')}"`
        ];
      } else {
        return [
          item.id, `"${item.title.replace(/"/g, '""')}"`, item.category, item.deal_type, 
          item.price, item.area, item.rooms || '', item.rayon, item.contact_phone
        ];
      }
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `55Kvartal_${isClient ? 'Clients' : 'Properties'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metric aggregates for dashboard
  const activePropertiesCount = properties.filter(p => p.status === 'active').length;
  const archivedPropertiesCount = properties.filter(p => p.status === 'archived').length;
  const activeClientsCount = clients.filter(c => ['active', 'padbor', 'pokaz', 'negotiating'].includes(c.status || 'active')).length;
  const closedClientsCount = clients.filter(c => c.status === 'completed').length;

  const totalClientsBudget = clients
    .filter(c => ['active', 'padbor', 'pokaz', 'negotiating'].includes(c.status || 'active'))
    .reduce((sum, c) => sum + Number(c.price_max), 0);

  const activePropertiesVolume = properties
    .filter(p => p.status === 'active')
    .reduce((sum, p) => sum + Number(p.price), 0);

  const dealTypeRentCount = properties.filter(p => p.deal_type === 'rent' && p.status === 'active').length;
  const dealTypeSaleCount = properties.filter(p => p.deal_type === 'sale' && p.status === 'active').length;

  const catZhiloyCount = properties.filter(p => p.category === 'zhiloy' && p.status === 'active').length;
  const catNezhiloyCount = properties.filter(p => p.category === 'nezhiloy' && p.status === 'active').length;

  return (
    <div className="flex h-screen bg-[#F9F8F6] text-[#1C2421] font-sans overflow-hidden selection:bg-[#1C2421] selection:text-white print:h-auto print:overflow-visible">
      
      {/* SIDEBAR BACKDROP - FOR MOBILE VIEWPORT DRAWER CLOSING */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-[#1C2421]/30 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* CLIENT DRAWER BACKDROP - FOR MOBILE/TABLET VIEWPORTS */}
      {selectedClient && (
        <div 
          className="fixed inset-0 bg-[#1C2421]/30 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
          onClick={() => setSelectedClient(null)}
        />
      )}

      {/* PROPERTY DRAWER BACKDROP - FOR MOBILE/TABLET VIEWPORTS */}
      {selectedProperty && (
        <div 
          className="fixed inset-0 bg-[#1C2421]/30 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
          onClick={() => setSelectedProperty(null)}
        />
      )}

      {/* SIDEBAR - WARM ALABASTER & FOREST INK STYLE */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-68 border-r border-[#4D6256]/15 bg-[#1C2421] text-slate-300 flex flex-col shrink-0 shadow-xl transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out print:hidden`}>
        <div className="h-16 flex items-center px-6 border-b border-[#2A3530] gap-2 font-black text-xl tracking-tight text-white">
          <span className="flex items-center justify-center bg-[#4D6256] text-white w-8 h-8 rounded-lg shadow-md font-extrabold font-mono">55</span>
          <span>55kvartal</span>
          <span className="text-[#A5C0B0] font-medium text-[10px] border border-[#A5C0B0]/40 rounded px-1 py-0.5 tracking-normal font-mono">CRM</span>
          
          {/* Close Sidebar button inside mobile viewports */}
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1.5 hover:bg-[#2A3530] rounded-lg text-slate-400 hover:text-white ml-auto transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 py-6 px-4 flex flex-col gap-2">
          <button
            onClick={() => { setActiveTab('dashboard'); setSelectedClient(null); setSelectedProperty(null); setIsSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'dashboard' ? 'bg-[#2A3530] text-[#A5C0B0] border-l-4 border-[#A5C0B0] shadow-md' : 'hover:bg-[#2A3530] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3"><BarChart3 className="w-4 h-4" /> {t.dashboard}</div>
          </button>

          <button
            onClick={() => { setActiveTab('clients'); setSelectedClient(null); setSelectedProperty(null); setIsSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'clients' ? 'bg-[#2A3530] text-[#A5C0B0] border-l-4 border-[#A5C0B0] shadow-md' : 'hover:bg-[#2A3530] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3"><Users className="w-4 h-4" /> {t.clients}</div>
          </button>

          <button
            onClick={() => { setActiveTab('properties'); setSelectedClient(null); setSelectedProperty(null); setIsSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'properties' ? 'bg-[#2A3530] text-[#A5C0B0] border-l-4 border-[#A5C0B0] shadow-md' : 'hover:bg-[#2A3530] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3"><Building2 className="w-4 h-4" /> {t.properties}</div>
          </button>

          <button
            onClick={() => { setActiveTab('marketing'); setSelectedClient(null); setSelectedProperty(null); setIsSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'marketing' ? 'bg-[#2A3530] text-[#A5C0B0] border-l-4 border-[#A5C0B0] shadow-md' : 'hover:bg-[#2A3530] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3"><Megaphone className="w-4 h-4" /> {t.marketing}</div>
          </button>
        </nav>

        {/* Language Switcher Only */}
        <div className="p-4 border-t border-[#2A3530] flex flex-col gap-2">
          <button
            onClick={() => setLang(lang === 'uz' ? 'ru' : 'uz')}
            className="w-full py-2.5 px-3 bg-[#2A3530] border border-[#4D6256]/20 text-xs font-black rounded-lg hover:border-[#A5C0B0] hover:text-white transition-all tracking-wider text-center cursor-pointer"
          >
            {t.lang}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F9F8F6]">
        {/* TOP BAR */}
        <header className="h-16 border-b border-[#4D6256]/15 flex items-center justify-between px-6 bg-white shrink-0 z-10 shadow-xs">
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile Hamburger menu */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-[#1C2421] hover:bg-[#4D6256]/10 rounded-xl transition-colors cursor-pointer mr-1"
              title="Menu"
            >
              <Menu className="w-5.5 h-5.5" />
            </button>

            <div className="relative w-full max-w-xl">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder={t.search} 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-[#4D6256]/20 rounded-xl bg-[#F9F8F6] focus:bg-white focus:outline-none focus:border-[#4D6256] focus:ring-4 focus:ring-[#4D6256]/5 transition-all text-[#1C2421] placeholder-slate-400 font-medium"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={exportToCSV} className="flex items-center gap-1.5 px-3 py-1.5 border border-[#4D6256]/20 text-[#4D6256] hover:bg-[#4D6256]/10 rounded-xl transition-all text-xs font-bold cursor-pointer print:hidden" title="Export CSV Data">
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
            <button onClick={refreshData} className="p-2 text-slate-400 hover:text-[#1C2421] hover:bg-[#4D6256]/10 rounded-xl transition-all print:hidden" title={t.refresh}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => activeTab === 'clients' ? setIsClientModalOpen(true) : setIsPropModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#1C2421] hover:bg-[#2A3530] text-white text-sm font-semibold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {activeTab === 'clients' ? t.newClient : t.newProperty}
            </button>
          </div>
        </header>

        {/* FILTERS BAR (Show only in List tabs) */}
        {(activeTab === 'clients' || activeTab === 'properties' || activeTab === 'marketing') && (
          <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-3 shrink-0 scrollbar-none overflow-x-auto shadow-sm w-full print:hidden">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mr-2">
              <Filter className="w-3.5 h-3.5" /> {t.filters}
            </span>
            <select 
              value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
              className="text-xs font-bold bg-[#F9F8F6] border border-[#4D6256]/20 rounded-lg px-3 py-2 outline-none focus:border-[#4D6256] cursor-pointer hover:bg-[#4D6256]/5 transition-all text-[#1C2421]"
            >
              <option value="all">{t.allCategories}</option>
              <option value="zhiloy">Жилой (Zhiloy)</option>
              <option value="nezhiloy">Нежилой (Nezhiloy)</option>
            </select>
            <select 
              value={filterDeal} onChange={e => setFilterDeal(e.target.value)}
              className="text-xs font-bold bg-[#F9F8F6] border border-[#4D6256]/20 rounded-lg px-3 py-2 outline-none focus:border-[#4D6256] cursor-pointer hover:bg-[#4D6256]/5 transition-all text-[#1C2421]"
            >
              <option value="all">{t.allDeals}</option>
              <option value="buy">Buy / Sale</option>
              <option value="rent">Rent</option>
            </select>
            <select 
              value={filterRayon} onChange={e => setFilterRayon(e.target.value)}
              className="text-xs font-bold bg-[#F9F8F6] border border-[#4D6256]/20 rounded-lg px-3 py-2 outline-none focus:border-[#4D6256] cursor-pointer hover:bg-[#4D6256]/5 transition-all text-[#1C2421]"
            >
              <option value="all">{t.allLocations}</option>
              {TASHKENT_RAYONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            {/* Premium Sorting Dropdown (Connected to state and bilingual) */}
            <div className="ml-auto flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Sort:</span>
              <select 
                value={sortBy} onChange={e => setSortBy(e.target.value as any)}
                className="text-xs font-bold bg-[#F9F8F6] border border-[#4D6256]/20 rounded-lg px-3 py-2 outline-none focus:border-[#4D6256] cursor-pointer hover:bg-[#4D6256]/5 transition-all text-[#1C2421]"
              >
                <option value="newest">Yangi (Newest)</option>
                <option value="price-asc">Narx: o'sish (Price: Low to High)</option>
                <option value="price-desc">Narx: kamayish (Price: High to Low)</option>
                <option value="area-asc">Maydon: kichikroq (Area: Small to Large)</option>
                <option value="area-desc">Maydon: kattaroq (Area: Large to Small)</option>
                {activeTab === 'properties' && <option value="sqm-asc">m² narxi: o'sish (Price/m²: Low to High)</option>}
                {activeTab === 'properties' && <option value="sqm-desc">m² narxi: kamayish (Price/m²: High to Low)</option>}
              </select>
            </div>
          </div>
        )}

        {/* TAB WORKSPACE */}
        <div className="flex-1 overflow-hidden relative">
          
          {/* 1. ANALYTICS DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div className="h-full overflow-y-auto p-6 flex flex-col gap-6">
              
              {/* Aggregates row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-[#4D6256]/15 shadow-xs flex items-center justify-between hover:border-[#4D6256]/40 transition-all">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.totalProperties}</span>
                    <span className="text-4xl font-black text-[#1C2421] mt-1.5">{formatNumber(activePropertiesCount)}</span>
                    <span className="text-[10px] text-slate-400 font-bold mt-2">{formatNumber(archivedPropertiesCount)} Archived</span>
                  </div>
                  <div className="p-3 bg-[#4D6256]/5 border border-[#4D6256]/15 text-[#4D6256] rounded-xl"><Building2 className="w-6 h-6" /></div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-[#4D6256]/15 shadow-xs flex items-center justify-between hover:border-[#4D6256]/40 transition-all">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.totalClients}</span>
                    <span className="text-4xl font-black text-[#1C2421] mt-1.5">{formatNumber(activeClientsCount)}</span>
                    <span className="text-[10px] text-emerald-750 font-extrabold mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {formatNumber(closedClientsCount)} Bitim yopildi</span>
                  </div>
                  <div className="p-3 bg-[#4D6256]/5 border border-[#4D6256]/15 text-[#4D6256] rounded-xl"><Users className="w-6 h-6" /></div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-[#4D6256]/15 shadow-xs flex items-center justify-between hover:border-[#4D6256]/40 transition-all">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.activeListings} (Vol)</span>
                    <span className="text-4xl font-black text-[#1C2421] mt-1.5 font-mono">{formatPrice(activePropertiesVolume)}</span>
                    <span className="text-[10px] text-slate-400 font-bold mt-2">{formatNumber(dealTypeSaleCount)} Sotuv / {formatNumber(dealTypeRentCount)} Ijara</span>
                  </div>
                  <div className="p-3 bg-[#4D6256]/5 border border-[#4D6256]/15 text-[#4D6256] rounded-xl"><DollarSign className="w-6 h-6" /></div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-[#4D6256]/15 shadow-xs flex items-center justify-between hover:border-[#4D6256]/40 transition-all">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.budgetUnderManagement}</span>
                    <span className="text-4xl font-black text-[#1C2421] mt-1.5 font-mono">{formatPrice(totalClientsBudget)}</span>
                    <span className="text-[10px] text-slate-400 font-bold mt-2">Max client target liquidity</span>
                  </div>
                  <div className="p-3 bg-[#4D6256]/5 border border-[#4D6256]/15 text-[#4D6256] rounded-xl"><Tag className="w-6 h-6" /></div>
                </div>
              </div>

              {/* Graphical Summaries row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Deal distributions */}
                <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6">
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-5 flex items-center gap-2">
                    <Info className="w-4 h-4 text-sky-500" /> {t.dealDistribution} (Bitimlar taqsimoti)
                  </h3>
                  <div className="flex flex-col gap-5">
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-600 mb-2">
                        <span>Sotuv / Xarid (Sale / Buy)</span>
                        <span>{dealTypeSaleCount} ta ({Math.round(dealTypeSaleCount / (activePropertiesCount || 1) * 100)}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${(dealTypeSaleCount / (activePropertiesCount || 1)) * 100}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-600 mb-2">
                        <span>Ijara (Rent)</span>
                        <span>{dealTypeRentCount} ta ({Math.round(dealTypeRentCount / (activePropertiesCount || 1) * 100)}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden">
                        <div className="bg-orange-500 h-full rounded-full transition-all duration-500" style={{ width: `${(dealTypeRentCount / (activePropertiesCount || 1)) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category distributions */}
                <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6">
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-5 flex items-center gap-2">
                    <Info className="w-4 h-4 text-sky-500" /> {t.categoryDistribution} (Zhiloy vs Nezhiloy)
                  </h3>
                  <div className="flex flex-col gap-5">
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-600 mb-2">
                        <span>Turar Joy (Жилой фонд)</span>
                        <span>{catZhiloyCount} ta ({Math.round(catZhiloyCount / (activePropertiesCount || 1) * 100)}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${(catZhiloyCount / (activePropertiesCount || 1)) * 100}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-600 mb-2">
                        <span>No-turar Joy (Нежилой фонд)</span>
                        <span>{catNezhiloyCount} ta ({Math.round(catNezhiloyCount / (activePropertiesCount || 1) * 100)}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden">
                        <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${(catNezhiloyCount / (activePropertiesCount || 1)) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Popular Tashkent Districts in demand */}
              <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6">
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-4">Toshkent tumanlari bo'yicha ko'rsatkich</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {TASHKENT_RAYONS.filter(r => !r.includes('Любой') && !r.includes('Центar')).map(rayon => {
                    const count = properties.filter(p => p.rayon.toLowerCase() === rayon.toLowerCase() && p.status === 'active').length;
                    return (
                      <div key={rayon} className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-center flex flex-col justify-center shadow-xs">
                        <span className="text-xs font-black text-slate-800">{rayon}</span>
                        <span className="text-lg font-black text-slate-900 mt-1">{count} <span className="text-[10px] text-slate-400 font-semibold">ta</span></span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* 2. CLIENTS PIPELINE (KANBAN BOARD) */}
          {activeTab === 'clients' && isMounted && (
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="h-full flex overflow-x-auto p-6 gap-6 scrollbar-thin">
                {[
                  { id: 'active', title: t.statusNew || 'Yangi', items: pipelineNew, borderStyle: 'border-t-[#4D6256]' },
                  { id: 'padbor', title: 'Padbor', items: pipelinePadbor, borderStyle: 'border-t-blue-400' },
                  { id: 'pokaz', title: 'Pokaz', items: pipelinePokaz, borderStyle: 'border-t-purple-400' },
                  { id: 'negotiating', title: t.statusNegotiating || 'Muzokara', items: pipelineNegotiating, borderStyle: 'border-t-[#A5C0B0]' },
                  { id: 'completed', title: t.statusClosed || 'Yopildi', items: pipelineClosed, borderStyle: 'border-t-[#1C2421]' },
                  { id: 'archived', title: t.statusArchived || 'Arxiv', items: pipelineArchived, borderStyle: 'border-t-slate-400' },
                ].map(column => (
                  <Droppable droppableId={column.id} key={column.id}>
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 min-w-[280px] max-w-[350px] flex flex-col ${snapshot.isDraggingOver ? 'bg-slate-50 ring-2 ring-[#4D6256]/20' : ''} rounded-xl transition-colors duration-200`}
                      >
                        <div className="flex items-center justify-between mb-4 px-1">
                          <h3 className="text-xs font-extrabold text-[#1C2421] uppercase tracking-widest">{column.title}</h3>
                          <span className="text-[10px] font-extrabold bg-[#4D6256]/10 text-[#4D6256] px-2 py-0.5 rounded-full">{column.items.length}</span>
                        </div>
                        <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-6 scrollbar-none min-h-[200px]">
                          {column.items.map((client, index) => (
                            <Draggable key={client.id} draggableId={client.id!.toString()} index={index}>
                              {(provided, snapshot) => (
                                <div 
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => setSelectedClient(client)}
                                  className={`bg-white border-t-2 ${column.borderStyle} border-x border-b p-4.5 rounded-xl shadow-sm cursor-grab active:cursor-grabbing transition-all ${
                                    snapshot.isDragging ? 'rotate-2 scale-105 shadow-xl ring-2 ring-[#4D6256]' : 'hover:-translate-y-0.5 hover:shadow-md border-[#4D6256]/10 hover:border-[#4D6256]/30'
                                  }`}
                                  style={{...provided.draggableProps.style}}
                                >
                                  <div className="flex justify-between items-start mb-2.5">
                                     <span className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-[#4D6256]/5 border border-[#4D6256]/15 text-[#1C2421]">
                                       {client.category === 'zhiloy' ? 'Жилой (Turar)' : 'Нежилой (Tijorat)'}
                                     </span>
                                     <span className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-[#4D6256]/5 text-[#4D6256] border border-[#4D6256]/20">
                                       {client.deal_type === 'rent' ? 'Rent' : 'Buy'}
                                     </span>
                                  </div>
                                  <div className="font-black text-lg mb-1 text-[#1C2421] tracking-tight leading-snug">{client.name}</div>
                                  <div className="text-xs text-slate-500 mb-3 flex items-center gap-1.5 font-semibold">
                                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {client.phone}
                                  </div>
                                  <div className="text-sm font-black text-[#4D6256] bg-[#4D6256]/5 border border-[#4D6256]/20 px-3 py-1.5 rounded-lg inline-block font-mono w-full text-center">
                                    {client.price_min ? `${formatPrice(client.price_min)} - ` : ''}{formatPrice(client.price_max)} {client.deal_type === 'rent' ? '/mo' : ''}
                                  </div>
                                  {client.notes && (
                                    <div className="mt-3 text-xs text-slate-600 line-clamp-2 border-t border-slate-100 pt-2.5 leading-relaxed font-medium">
                                      {client.notes}
                                    </div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            </DragDropContext>
          )}

          {/* 3. PROPERTIES GRID LIST */}
          {activeTab === 'properties' && (
            <div className="h-full overflow-y-auto p-6 scrollbar-thin">
              {sortedProperties.length === 0 ? (
                <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-2xl">
                  <Building2 className="w-10 h-10 mx-auto text-slate-300" />
                  <h3 className="font-bold text-slate-900 mt-3">Hech qanday ob'ekt topilmadi</h3>
                  <p className="text-xs text-slate-400 mt-1">Yangi ob'ekt qo'shing yoki qidiruv parametrlarini o'zgartiring.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {sortedProperties.map(prop => {
                    const pricePerM2 = prop.area > 0 ? Math.round(prop.price / prop.area) : 0;
                    return (
                      <div 
                        key={prop.id}
                        onClick={() => setSelectedProperty(prop)}
                        className={`bg-white border p-5 rounded-xl shadow-xs cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between ${
                          selectedProperty?.id === prop.id ? 'ring-2 ring-[#4D6256] border-[#4D6256]' : 'border-[#4D6256]/10 hover:border-[#4D6256]/30'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${prop.category === 'zhiloy' ? 'bg-[#4D6256]/5 text-[#4D6256] border border-[#4D6256]/25' : 'bg-[#1C2421]/5 text-[#1C2421] border border-[#1C2421]/20'}`}>
                              {prop.category === 'zhiloy' ? 'Жилой (Turar)' : 'Нежилой (Tijorat)'}
                            </span>
                            <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${prop.status === 'active' ? 'bg-[#4D6256]/10 text-[#4D6256] border border-[#4D6256]/15' : 'bg-slate-50 text-slate-400 border border-slate-200'}`}>
                              {prop.status === 'active' ? 'Active' : 'Archive'}
                            </span>
                          </div>
                          
                          <div className="font-extrabold text-base mb-1.5 text-[#1C2421] leading-snug">{prop.title}</div>
                          
                          <div className="text-xs text-slate-500 mb-2 flex items-center gap-1.5 font-semibold">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" /> {prop.rayon}
                          </div>
                          
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-[10px] font-extrabold text-[#4D6256] bg-[#4D6256]/5 border border-[#4D6256]/20 px-2.5 py-0.5 rounded font-mono">
                              {formatPrice(pricePerM2)}/m²
                            </span>
                            <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest bg-slate-50 border border-slate-200/50 px-2 py-0.5 rounded">
                              {prop.deal_type === 'rent' ? 'Rent' : 'Sale'}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-4 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100/80">
                            <div className="flex flex-col">
                              <span className="text-[9px] text-slate-400 uppercase font-bold">{t.area}</span> 
                              <span className="font-bold text-[#1C2421]">{prop.area} m²</span>
                            </div>
                            {prop.rooms && (
                              <div className="flex flex-col">
                                <span className="text-[9px] text-slate-400 uppercase font-bold">{t.rooms}</span> 
                                <span className="font-bold text-[#1C2421]">{prop.rooms} xona</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-2xl font-black text-[#1C2421] border-t border-slate-100 pt-3 flex items-center justify-between">
                          <span className="font-mono">{formatPrice(prop.price)}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">{prop.deal_type === 'rent' ? '/mo' : ''}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 4. POST REGISTRY (MARKETING MANAGER) */}
          {activeTab === 'marketing' && (
            <div className="h-full overflow-y-auto p-6 scrollbar-thin">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* List of properties ready for Telegram / OLX */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-sky-500" /> {t.marketing} (Marketing ro'yxati)
                  </h3>
                  <div className="flex flex-col gap-3.5 overflow-y-auto max-h-[70vh] pr-2 scrollbar-thin">
                    {filteredProperties.map(prop => {
                      const details = prop.details || {};
                      const marketing = details.marketing_posts || {};
                      const tgPub = marketing.telegram?.published;
                      const olxPub = marketing.olx?.published;
                      
                      return (
                        <div 
                          key={prop.id}
                          onClick={() => openMarketingDrawer(prop)}
                          className={`bg-white border p-4.5 rounded-xl shadow-xs cursor-pointer hover:border-slate-400 transition-all ${
                            marketingProperty?.id === prop.id ? 'ring-2 ring-slate-900 border-slate-900' : 'border-slate-200'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-black text-slate-900">{prop.title}</span>
                            <span className="text-xs font-mono font-bold text-slate-950">{formatPrice(prop.price)}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-semibold mb-3 flex items-center gap-1.5">
                            <MapPin className="w-3 h-3" /> {prop.rayon} • {prop.area} m²
                          </div>
                          
                          {/* Post status badges */}
                          <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
                            <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md flex items-center gap-1 ${
                              tgPub ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-slate-50 text-slate-400 border border-slate-100'
                            }`}>
                              Telegram {tgPub ? '✅' : '❌'}
                            </span>
                            <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md flex items-center gap-1 ${
                              olxPub ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-400 border border-slate-100'
                            }`}>
                              OLX {olxPub ? '✅' : '❌'}
                            </span>
                            
                            <button 
                              type="button" 
                              onClick={(e) => {
                                e.stopPropagation();
                                const copies = generatePostTexts(prop);
                                copyToClipboard(copies.uzTemplate, prop.id!, 'uz');
                              }}
                              className="text-[9px] font-extrabold text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-black px-2 py-0.5 rounded-md ml-auto flex items-center gap-1 transition-all"
                            >
                              {copiedId === prop.id ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
                              Copy Copy (UZ)
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Edit marketing texts / links */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
                  {marketingProperty ? (
                    <>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                          <h4 className="font-extrabold text-slate-900 leading-snug">{marketingProperty.title}</h4>
                          <span className="text-xs font-semibold text-slate-400">Manage Marketing & Ad Copies</span>
                        </div>
                        <button onClick={() => setMarketingProperty(null)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-black transition-all">
                          <X className="w-4.5 h-4.5" />
                        </button>
                      </div>

                      {/* UZ/RU Custom Copy Textareas */}
                      <div className="flex flex-col gap-4.5">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            {t.postTextUz} 
                            <div className="ml-auto flex items-center gap-2">
                              <button 
                                onClick={() => copyToClipboard(marketingCopyUz, marketingProperty.id!, 'uz')}
                                className="text-[9px] text-sky-600 font-extrabold uppercase hover:underline flex items-center gap-0.5 cursor-pointer"
                              >
                                {copiedId === marketingProperty.id && copiedLang === 'uz' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                {t.copyText}
                              </button>
                              <a 
                                href={`https://t.me/share/url?url=&text=${encodeURIComponent(marketingCopyUz)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[9px] text-[#4D6256] font-extrabold uppercase hover:underline flex items-center gap-0.5 cursor-pointer"
                              >
                                <Send className="w-3 h-3" />
                                Share
                              </a>
                            </div>
                          </label>
                          <textarea 
                            value={marketingCopyUz}
                            onChange={e => setMarketingCopyUz(e.target.value)}
                            className="w-full text-xs font-medium font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-slate-900 min-h-[140px] resize-y leading-relaxed"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            {t.postTextRu}
                            <div className="ml-auto flex items-center gap-2">
                              <button 
                                onClick={() => copyToClipboard(marketingCopyRu, marketingProperty.id!, 'ru')}
                                className="text-[9px] text-sky-600 font-extrabold uppercase hover:underline flex items-center gap-0.5 cursor-pointer"
                              >
                                {copiedId === marketingProperty.id && copiedLang === 'ru' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                {t.copyText}
                              </button>
                              <a 
                                href={`https://t.me/share/url?url=&text=${encodeURIComponent(marketingCopyRu)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[9px] text-[#4D6256] font-extrabold uppercase hover:underline flex items-center gap-0.5 cursor-pointer"
                              >
                                <Send className="w-3 h-3" />
                                Share
                              </a>
                            </div>
                          </label>
                          <textarea 
                            value={marketingCopyRu}
                            onChange={e => setMarketingCopyRu(e.target.value)}
                            className="w-full text-xs font-medium font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-slate-900 min-h-[140px] resize-y leading-relaxed"
                          />
                        </div>
                      </div>

                      {/* Publishing tracking form */}
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-4.5 flex flex-col gap-4">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Publishing Status Tracker</span>
                        
                        <div className="flex flex-col gap-2.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer">
                              <input type="checkbox" checked={telegramStatus} onChange={e => setTelegramStatus(e.target.checked)} className="rounded text-slate-900 focus:ring-0 w-4 h-4 cursor-pointer" />
                              {t.telegramChannel} ({t.published})
                            </label>
                          </div>
                          {telegramStatus && (
                            <input 
                              type="text" 
                              placeholder="Channel post link (e.g. t.me/...)" 
                              value={telegramLink}
                              onChange={e => setTelegramLink(e.target.value)}
                              className="text-xs font-medium border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white outline-none focus:border-slate-900"
                            />
                          )}
                        </div>

                        <div className="flex flex-col gap-2.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer">
                              <input type="checkbox" checked={olxStatus} onChange={e => setOlxStatus(e.target.checked)} className="rounded text-slate-900 focus:ring-0 w-4 h-4 cursor-pointer" />
                              {t.olxAd} ({t.published})
                            </label>
                          </div>
                          {olxStatus && (
                            <input 
                              type="text" 
                              placeholder="OLX ad link..." 
                              value={olxLink}
                              onChange={e => setOlxLink(e.target.value)}
                              className="text-xs font-medium border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white outline-none focus:border-slate-900"
                            />
                          )}
                        </div>
                      </div>

                      <button 
                        type="button" 
                        onClick={handleSaveMarketingData}
                        className="w-full py-2.5 bg-[#1C2421] hover:bg-[#2A3530] text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {t.savePost}
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-24 text-slate-400">
                      <Megaphone className="w-12 h-12 mx-auto mb-4 text-slate-200 animate-bounce" />
                      <h4 className="font-bold text-slate-900">Marketing Panel</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">Ob'ektlardan birini tanlang va professional Telegram/OLX e'lonlarini avtomatik yarating.</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

        </div>
      </main>

      {/* 5. RIGHT DRAWER: CLIENT DETAILS */}
      {selectedClient && (
        <aside className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] border-l border-[#4D6256]/15 bg-white flex flex-col shrink-0 shadow-2xl animate-fade-in-right md:relative md:z-20">
          <div className="h-16 border-b border-[#4D6256]/15 flex items-center justify-between px-6 shrink-0 bg-[#F9F8F6]">
            <h2 className="font-black text-xs uppercase tracking-wider text-[#4D6256]">{t.clients} Details</h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setEditingClient(selectedClient)} 
                className="p-1.5 hover:bg-[#4D6256]/10 rounded-lg text-slate-500 hover:text-[#1C2421] transition-colors cursor-pointer"
                title={t.edit}
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button onClick={() => setSelectedClient(null)} className="p-1.5 hover:bg-[#4D6256]/10 rounded-lg text-slate-500 hover:text-[#1C2421] transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 scrollbar-thin">
            <div>
              <h1 className="text-2xl font-black mb-1.5 text-[#1C2421] tracking-tight leading-tight">{selectedClient.name}</h1>
              <a href={`tel:${selectedClient.phone}`} className="text-xs font-bold text-[#4D6256] hover:text-[#1C2421] flex items-center gap-2 mb-4 w-fit px-2.5 py-1 bg-[#4D6256]/5 rounded-lg border border-[#4D6256]/15 font-mono">
                <Phone className="w-3.5 h-3.5" /> {selectedClient.phone}
              </a>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Pipeline Status</label>
                <select 
                  value={selectedClient.status || 'active'}
                  onChange={(e) => handleClientStatusChange(selectedClient.id!, e.target.value)}
                  className="text-xs font-bold bg-white border border-[#4D6256]/20 rounded-xl px-3 py-2.5 outline-none focus:border-[#4D6256] shadow-xs cursor-pointer w-full text-[#1C2421]"
                >
                  <option value="active">{t.statusNew} (Active)</option>
                  <option value="padbor">Padbor</option>
                  <option value="pokaz">Pokaz</option>
                  <option value="negotiating">{t.statusNegotiating} (In Progress)</option>
                  <option value="completed">{t.statusClosed} (Won)</option>
                  <option value="archived">{t.statusArchived} (Lost)</option>
                </select>
              </div>
            </div>

            {/* Criteria display */}
            <div className="bg-[#F9F8F6] border border-[#4D6256]/15 rounded-2xl p-5 text-xs shadow-xs">
              <h3 className="text-[9px] font-extrabold text-[#4D6256] uppercase tracking-widest mb-3.5">Client Requirements</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase block mb-0.5">Category</span>
                  <span className="font-bold text-[#1C2421]">{selectedClient.category === 'zhiloy' ? 'Жилой (Turar)' : 'Нежилой (Tijorat)'}</span>
                </div>
                <div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase block mb-0.5">Deal Type</span>
                  <span className="font-bold text-[#1C2421] capitalize">{selectedClient.deal_type}</span>
                </div>
                <div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase block mb-0.5">{t.budget}</span>
                  <span className="font-mono font-black text-[#1C2421]">{selectedClient.price_min ? `${formatPrice(selectedClient.price_min)} - ` : ''}{formatPrice(selectedClient.price_max)}</span>
                </div>
                <div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase block mb-0.5">{t.area}</span>
                  <span className="font-bold text-[#1C2421]">&gt;= {selectedClient.min_area} m²</span>
                </div>
                {selectedClient.rooms && (
                  <div>
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase block mb-0.5">{t.rooms}</span>
                    <span className="font-bold text-[#1C2421]">{selectedClient.rooms}</span>
                  </div>
                )}
                {selectedClient.orientir && (
                  <div className="col-span-2">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase block mb-0.5">Orientir</span>
                    <span className="font-semibold text-[#1C2421] leading-relaxed block">{selectedClient.orientir}</span>
                  </div>
                )}
                <div className="col-span-2">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase block mb-1.5">Locations (Rayons)</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedClient.rayons?.length ? selectedClient.rayons.map(r => (
                      <span key={r} className="text-[10px] font-bold bg-[#4D6256] text-white px-2 py-0.5 rounded">{r}</span>
                    )) : <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded">Any Location</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes textarea with autosaving */}
            <div>
              <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 block">{t.notes} (Auto-saving)</label>
              <textarea
                value={selectedClient.notes || ''}
                onChange={(e) => handleNotesChange(selectedClient.id!, e.target.value)}
                placeholder="Start typing client notes here..."
                className="w-full text-xs font-semibold p-4 border border-[#4D6256]/20 rounded-2xl min-h-[100px] outline-none focus:border-[#4D6256] focus:bg-white resize-y transition-shadow bg-[#F9F8F6] text-[#1C2421] leading-relaxed"
              />
            </div>

            {/* Matches with detailed factors dropdown */}
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                  {t.matchedProperties}
                </label>
                <span className="text-[10px] font-extrabold bg-[#4D6256] text-white px-2.5 py-0.5 rounded-full shadow-xs">{clientMatches.length}</span>
              </div>
              
              {clientMatches.length === 0 ? (
                <div className="text-xs text-slate-400 py-8 text-center border-2 border-dashed border-[#4D6256]/15 rounded-2xl font-semibold">{t.noMatches}</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {clientMatches.map((m, i) => (
                    <div 
                      key={i} 
                      onClick={() => setExpandedMatchId(expandedMatchId === m.property!.id ? null : m.property!.id!)}
                      className="border border-[#4D6256]/15 rounded-xl p-3.5 text-xs flex flex-col gap-1.5 relative bg-white shadow-xs hover:border-[#4D6256] transition-colors cursor-pointer group"
                    >
                      <div className="absolute top-0 right-0 bg-[#4D6256] text-white text-[9px] font-extrabold px-2.5 py-1 rounded-bl-xl rounded-tr-xl flex items-center gap-1 shadow-sm font-mono">
                        {m.score}% Match
                      </div>
                      <div className="font-bold text-[#1C2421] pr-16 truncate group-hover:underline flex items-center gap-1">
                        {m.property!.title}
                      </div>
                      <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1"><MapPin className="w-3 h-3" /> {m.property!.rayon}</div>
                      <div className="font-mono font-black text-[#1C2421] mt-1">{formatPrice(m.property!.price)}</div>
                      
                      {/* Matching factors toggler */}
                      <div className="flex items-center gap-1 text-[10px] text-[#4D6256] font-bold mt-1">
                        {t.matchingFactorsTitle} <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedMatchId === m.property!.id ? 'rotate-180' : ''}`} />
                      </div>

                      {expandedMatchId === m.property!.id && (
                        <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-1 bg-[#F9F8F6] p-2.5 rounded-lg">
                          {m.matchingFactors.map((factor, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-[10px] text-slate-600 font-semibold">
                              <span className="text-[#4D6256] font-black">✓</span> {factor}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mt-auto pt-8 flex justify-center border-t border-slate-100">
               <button onClick={deleteSelectedClient} className="text-xs font-extrabold text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-xl transition-all cursor-pointer">
                 Delete Client permanently
               </button>
            </div>
          </div>
        </aside>
      )}

      {/* 6. RIGHT DRAWER: PROPERTY DETAILS */}
      {selectedProperty && (
        <aside className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] border-l border-[#4D6256]/15 bg-white flex flex-col shrink-0 shadow-2xl animate-fade-in-right md:relative md:z-20 print:block print:absolute print:inset-0 print:w-full print:bg-white print:z-[9999] print:shadow-none print:border-none">
          <div className="h-16 border-b border-[#4D6256]/15 flex items-center justify-between px-6 shrink-0 bg-[#F9F8F6]">
            <h2 className="font-black text-xs uppercase tracking-wider text-[#4D6256]">{t.properties} Details</h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => window.print()} 
                className="p-1.5 hover:bg-[#4D6256]/10 rounded-lg text-slate-500 hover:text-[#1C2421] transition-colors cursor-pointer print:hidden"
                title="Print Detail Sheet"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setEditingProperty(selectedProperty)} 
                className="p-1.5 hover:bg-[#4D6256]/10 rounded-lg text-slate-500 hover:text-[#1C2421] transition-colors cursor-pointer print:hidden"
                title={t.edit}
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button onClick={() => setSelectedProperty(null)} className="p-1.5 hover:bg-[#4D6256]/10 rounded-lg text-slate-500 hover:text-[#1C2421] transition-colors cursor-pointer print:hidden">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 scrollbar-thin text-[#1C2421]">
            <div>
              <h1 className="text-2xl font-black mb-2 text-[#1C2421] tracking-tight leading-tight">{selectedProperty.title}</h1>
              <div className="text-2xl font-mono font-black text-[#1C2421] mb-4">{formatPrice(selectedProperty.price)}</div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Listing Status</label>
                <select 
                  value={selectedProperty.status || 'active'}
                  onChange={(e) => handlePropertyStatusChange(selectedProperty.id!, e.target.value)}
                  className="text-xs font-bold bg-white border border-[#4D6256]/20 rounded-xl px-3 py-2.5 outline-none focus:border-[#4D6256] shadow-xs cursor-pointer w-full text-[#1C2421]"
                >
                  <option value="active">Active Listing</option>
                  <option value="archived">Archived / Sold</option>
                </select>
              </div>
            </div>

            {/* Criteria Specs */}
            <div className="bg-[#F9F8F6] border border-[#4D6256]/15 rounded-2xl p-5 text-xs shadow-xs">
              <h3 className="text-[9px] font-extrabold text-[#4D6256] uppercase tracking-widest mb-3.5">Property Specs</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase block mb-0.5">Category</span>
                  <span className="font-bold text-[#1C2421]">{selectedProperty.category === 'zhiloy' ? 'Жилой (Turar)' : 'Нежилой (Tijorat)'}</span>
                </div>
                <div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase block mb-0.5">Deal Type</span>
                  <span className="font-bold text-[#1C2421] capitalize">{selectedProperty.deal_type}</span>
                </div>
                <div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase block mb-0.5">Location</span>
                  <span className="font-bold text-[#1C2421] flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {selectedProperty.rayon}</span>
                </div>
                {selectedProperty.orientir && (
                  <div>
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase block mb-0.5">Orientir</span>
                    <span className="font-bold text-[#1C2421]">{selectedProperty.orientir}</span>
                  </div>
                )}
                <div>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase block mb-0.5">{t.area}</span>
                  <span className="font-black text-[#1C2421]">{selectedProperty.area} m²</span>
                </div>
                {selectedProperty.rooms && (
                  <div>
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase block mb-0.5">{t.rooms}</span>
                    <span className="font-black text-[#1C2421]">{selectedProperty.rooms} xona</span>
                  </div>
                )}
                {selectedProperty.floor !== null && (
                  <div>
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase block mb-0.5">Qavat (Floor)</span>
                    <span className="font-bold text-[#1C2421]">{selectedProperty.floor} / {selectedProperty.max_floor || 'N/A'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Owner Contact */}
            <div className="border border-[#4D6256]/15 rounded-2xl p-5 text-xs shadow-xs bg-white">
               <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2">Owner Contact</span>
               <div className="font-bold text-[#1C2421] mb-1.5">{selectedProperty.contact_name || 'No name provided'}</div>
               <a href={`tel:${selectedProperty.contact_phone}`} className="text-xs font-bold text-[#1C2421] hover:text-black flex items-center gap-1.5 w-fit px-2.5 py-1 bg-[#4D6256]/5 border border-[#4D6256]/15 rounded-lg font-mono">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> {selectedProperty.contact_phone}
              </a>
            </div>

            {/* Matches with detailed factors dropdown */}
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                  {t.matchedClients}
                </label>
                <span className="text-[10px] font-extrabold bg-[#4D6256] text-white px-2.5 py-0.5 rounded-full shadow-xs">{propertyMatches.length}</span>
              </div>
              
              {propertyMatches.length === 0 ? (
                <div className="text-xs text-slate-400 py-8 text-center border-2 border-dashed border-[#4D6256]/15 rounded-2xl font-semibold">{t.noMatches}</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {propertyMatches.map((m, i) => (
                    <div 
                      key={i} 
                      onClick={() => setExpandedMatchId(expandedMatchId === m.client!.id ? null : m.client!.id!)}
                      className="border border-[#4D6256]/15 rounded-xl p-3.5 text-xs flex flex-col gap-1.5 relative bg-white shadow-xs hover:border-[#4D6256] transition-colors cursor-pointer group"
                    >
                      <div className="absolute top-0 right-0 bg-[#4D6256] text-white text-[9px] font-extrabold px-2.5 py-1 rounded-bl-xl rounded-tr-xl flex items-center gap-1 shadow-sm font-mono">
                        {m.score}% Match
                      </div>
                      <div className="font-bold text-[#1C2421] pr-16 group-hover:underline">{m.client!.name}</div>
                      <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {m.client!.phone}</div>
                      <div className="font-mono font-black text-[#1C2421] mt-1">{formatPrice(m.client!.price_min)} - {formatPrice(m.client!.price_max)}</div>
                      
                      {/* Factors toggler */}
                      <div className="flex items-center gap-1 text-[10px] text-[#4D6256] font-bold mt-1">
                        {t.matchingFactorsTitle} <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedMatchId === m.client!.id ? 'rotate-180' : ''}`} />
                      </div>

                      {expandedMatchId === m.client!.id && (
                        <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-1 bg-[#F9F8F6] p-2.5 rounded-lg">
                          {m.matchingFactors.map((factor, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-[10px] text-slate-600 font-semibold">
                              <span className="text-[#4D6256] font-black">✓</span> {factor}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mt-auto pt-8 flex justify-center border-t border-slate-100">
               <button onClick={deleteSelectedProperty} className="text-xs font-extrabold text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-xl transition-all cursor-pointer">
                 Delete Property permanently
               </button>
            </div>
          </div>
        </aside>
      )}

      {/* 7. CLIENT CREATION MODAL */}
      <SimpleClientModal 
        isOpen={isClientModalOpen} 
        onClose={() => setIsClientModalOpen(false)} 
        onSuccess={async () => { setIsClientModalOpen(false); await refreshData(); }} 
      />
      
      {/* 8. PROPERTY CREATION MODAL */}
      <SimplePropertyModal 
        isOpen={isPropModalOpen} 
        onClose={() => setIsPropModalOpen(false)} 
        onSuccess={async () => { setIsPropModalOpen(false); await refreshData(); }} 
      />

      {/* 9. CLIENT EDITING MODAL */}
      {editingClient && (
        <EditClientModal 
          client={editingClient}
          isOpen={!!editingClient}
          onClose={() => setEditingClient(null)}
          onSuccess={async () => { setEditingClient(null); setSelectedClient(null); await refreshData(); }}
        />
      )}

      {/* 10. PROPERTY EDITING MODAL */}
      {editingProperty && (
        <EditPropertyModal 
          property={editingProperty}
          isOpen={!!editingProperty}
          onClose={() => setEditingProperty(null)}
          onSuccess={async () => { setEditingProperty(null); setSelectedProperty(null); await refreshData(); }}
        />
      )}
      
    </div>
  );
}

// ------------------------------------------------------------------------------------------------
// PREMIUM CLIENT / PROPERTY CREATION MODALS
// ------------------------------------------------------------------------------------------------

function SimpleClientModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
  const [form, setForm] = useState({
    name: '', phone: '', category: 'zhiloy', type: 'any', deal_type: 'buy',
    price_min: '', price_max: '', rayons: [] as string[], min_area: '', rooms: '', notes: '', orientir: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.price_max) return alert('Name, Phone, and Max Budget are required.');
    
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addClient({
        name: form.name, phone: form.phone, category: form.category as any, type: form.type === 'any' ? null : form.type,
        deal_type: form.deal_type as any, price_min: Number(form.price_min) || 0, price_max: Number(form.price_max),
        rayons: form.rayons, orientir: form.orientir || '', min_area: Number(form.min_area) || 0, rooms: form.rooms || null,
        details: {}, notes: form.notes
      });
      onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleRayon = (r: string) => {
    setForm(prev => {
      if (r === 'Любой (Istalgan)') return { ...prev, rayons: [r] };
      const newRayons = prev.rayons.includes(r) ? prev.rayons.filter(x => x !== r) : [...prev.rayons.filter(x => x !== 'Любой (Istalgan)'), r];
      return { ...prev, rayons: newRayons };
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-xl p-8 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Yangi Mijoz Talabi (New Client)</h2>
          <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"><X className="w-4 h-4"/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-semibold text-slate-700">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">F.I.SH. (Client Name) *</label>
              <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:border-slate-900 bg-slate-50 font-bold focus:bg-white transition-all text-xs" placeholder="E.g., Farhod Jalolov" />
            </div>
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Telefon (Phone) *</label>
              <input required type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:border-slate-900 bg-slate-50 font-bold focus:bg-white transition-all text-xs" placeholder="+998 90 123 45 67" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Kategoriya</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full border border-slate-200 rounded-lg p-1.5 bg-white text-xs font-bold">
                <option value="zhiloy">Жилой (Turar)</option>
                <option value="nezhiloy">Нежилой (Tijorat)</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Bitim Turi</label>
              <select value={form.deal_type} onChange={e => setForm({...form, deal_type: e.target.value})} className="w-full border border-slate-200 rounded-lg p-1.5 bg-white text-xs font-bold">
                <option value="buy">Xarid qilish (Buy)</option>
                <option value="rent">Ijaraga olish (Rent)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Min Byudjet ($)</label>
              <input type="number" value={form.price_min} onChange={e => setForm({...form, price_min: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:border-slate-900 font-mono text-xs focus:bg-white transition-all font-bold" placeholder="0" />
            </div>
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Max Byudjet ($) *</label>
              <input required type="number" value={form.price_max} onChange={e => setForm({...form, price_max: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:border-slate-900 font-mono text-xs focus:bg-white transition-all font-black text-slate-900" placeholder="100000" />
            </div>
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Min Maydon (m²)</label>
              <input type="number" value={form.min_area} onChange={e => setForm({...form, min_area: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:border-slate-900 font-mono text-xs focus:bg-white transition-all font-bold" placeholder="50" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Xonalar (e.g. "2,3")</label>
              <input type="text" value={form.rooms} onChange={e => setForm({...form, rooms: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:border-slate-900 focus:bg-white transition-all text-xs" placeholder="any yoki 2,3" />
            </div>
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Orientir (Mo'ljal)</label>
              <input type="text" value={form.orientir} onChange={e => setForm({...form, orientir: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:border-slate-900 focus:bg-white transition-all text-xs" placeholder="E.g., Metro yaqinida" />
            </div>
          </div>
          
          <div>
             <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-2.5">Tumanlar (Locations)</label>
             <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto p-2 bg-[#F9F8F6] border border-[#4D6256]/15 rounded-lg">
                {TASHKENT_RAYONS.map(r => (
                  <button 
                    key={r} type="button" 
                    onClick={() => toggleRayon(r)}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                      form.rayons.includes(r) ? 'bg-[#4D6256] text-white border-[#4D6256] shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {r}
                  </button>
                ))}
             </div>
          </div>
          
          <div>
            <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Izoh / Qo'shimcha eslatmalar (Notes)</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full border border-slate-200 p-3 rounded-lg outline-none focus:border-slate-900 resize-none font-semibold text-xs leading-relaxed focus:bg-white transition-all text-[#1C2421]" rows={3} placeholder="Mijoz talablari haqida batafsil ma'lumotlar..." />
          </div>
          
          <div className="flex justify-end gap-3 mt-4 pt-5 border-t border-slate-100">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 font-bold transition-all cursor-pointer">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-[#1C2421] hover:bg-[#2A3530] text-white rounded-xl font-bold shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">{isSubmitting ? 'Saving...' : 'Save Client'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SimplePropertyModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
  const [form, setForm] = useState({
    title: '', category: 'zhiloy', type: 'apartment', deal_type: 'sale',
    price: '', rayon: 'Yakkasaray', area: '', rooms: '', contact_name: '', contact_phone: '', orientir: '', floor: '', max_floor: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.area || !form.contact_phone) return alert('Fill required fields');
    
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addProperty({
        title: form.title, category: form.category as any, type: form.type, deal_type: form.deal_type as any,
        price: Number(form.price), rayon: form.rayon, orientir: form.orientir || '', rooms: Number(form.rooms) || null,
        area: Number(form.area), floor: Number(form.floor) || null, max_floor: Number(form.max_floor) || null, details: {},
        contact_name: form.contact_name, contact_phone: form.contact_phone
      });
      onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-xl p-8 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Yangi Ko'chmas Mulk (New Property)</h2>
          <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"><X className="w-4 h-4"/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-semibold text-slate-700">
          <div>
            <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Sarlavha (Title) *</label>
            <input required type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:border-slate-900 bg-slate-50 focus:bg-white font-bold transition-all text-xs" placeholder="E.g., Mirobod tumanida 3 xonali evro-uy" />
          </div>

          <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Kategoriya</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full border border-slate-200 rounded-lg p-1.5 bg-white text-xs font-bold">
                <option value="zhiloy">Жилой (Turar)</option>
                <option value="nezhiloy">Нежилой (Tijorat)</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Turi (Type)</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full border border-slate-200 rounded-lg p-1.5 bg-white text-xs font-bold">
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="office">Office</option>
                <option value="storage">Storage</option>
                <option value="salon">Salon</option>
                <option value="catering">Catering / Cafe</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Bitim Turi</label>
              <select value={form.deal_type} onChange={e => setForm({...form, deal_type: e.target.value})} className="w-full border border-slate-200 rounded-lg p-1.5 bg-white text-xs font-bold">
                <option value="sale">Sotuv (Sale)</option>
                <option value="rent">Ijara (Rent)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Narx ($) *</label>
              <input required type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:border-slate-900 font-mono text-xs focus:bg-white transition-all font-black text-slate-950" placeholder="65000" />
            </div>
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Tuman (Rayon)</label>
               <select value={form.rayon} onChange={e => setForm({...form, rayon: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:border-slate-900 bg-white cursor-pointer font-bold text-xs">
                  {TASHKENT_RAYONS.filter(r => !r.includes('Любой') && !r.includes('Центar')).map(r => <option key={r} value={r}>{r}</option>)}
               </select>
            </div>
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Mo'ljal (Orientir)</label>
              <input type="text" value={form.orientir} onChange={e => setForm({...form, orientir: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:border-slate-900 focus:bg-white transition-all text-xs" placeholder="E.g., Korzinka yaqinida" />
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Maydon (m²) *</label>
              <input required type="number" value={form.area} onChange={e => setForm({...form, area: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:border-slate-900 font-mono text-xs focus:bg-white transition-all font-bold" placeholder="75" />
            </div>
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Xonalar</label>
              <input type="number" value={form.rooms} onChange={e => setForm({...form, rooms: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:border-slate-900 font-mono text-xs focus:bg-white transition-all font-bold" placeholder="3" />
            </div>
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Qavat (Floor)</label>
              <input type="number" value={form.floor} onChange={e => setForm({...form, floor: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:border-slate-900 font-mono text-xs focus:bg-white transition-all" placeholder="3" />
            </div>
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Qavatlar soni</label>
              <input type="number" value={form.max_floor} onChange={e => setForm({...form, max_floor: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:border-slate-900 font-mono text-xs focus:bg-white transition-all" placeholder="9" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Mulk Egasi Ismi (Owner Name)</label>
              <input type="text" value={form.contact_name} onChange={e => setForm({...form, contact_name: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:border-slate-900 bg-white font-bold text-xs" placeholder="Dilshod aka" />
            </div>
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Telefon (Phone) *</label>
              <input required type="text" value={form.contact_phone} onChange={e => setForm({...form, contact_phone: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:border-slate-900 bg-white font-bold text-xs" placeholder="+998 90 999 99 99" />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-4 pt-5 border-t border-slate-100">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 font-bold transition-all cursor-pointer">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-[#1C2421] hover:bg-[#2A3530] text-white rounded-xl font-bold shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">{isSubmitting ? 'Saving...' : 'Save Property'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------------------------------
// PREMIUM EDITING MODALS
// ------------------------------------------------------------------------------------------------

interface EditClientModalProps {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function EditClientModal({ client, isOpen, onClose, onSuccess }: EditClientModalProps) {
  const [form, setForm] = useState({
    name: client.name,
    phone: client.phone,
    category: client.category,
    type: client.type || 'any',
    deal_type: client.deal_type,
    price_min: String(client.price_min),
    price_max: String(client.price_max),
    rayons: client.rayons || [],
    orientir: client.orientir || '',
    min_area: String(client.min_area || '0'),
    rooms: client.rooms || 'any',
    notes: client.notes || '',
    status: client.status || 'active'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.price_max) return alert('Name, Phone and Max Budget are required.');

    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await updateClient(client.id!, {
        name: form.name,
        phone: form.phone,
        category: form.category as any,
        type: form.type === 'any' ? null : form.type,
        deal_type: form.deal_type as any,
        price_min: Number(form.price_min) || 0,
        price_max: Number(form.price_max),
        rayons: form.rayons,
        orientir: form.orientir,
        min_area: Number(form.min_area) || 0,
        rooms: form.rooms === 'any' ? null : form.rooms,
        details: client.details || {},
        notes: form.notes,
        status: form.status
      });
      onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleRayon = (r: string) => {
    setForm(prev => {
      if (r === 'Любой (Istalgan)') return { ...prev, rayons: [r] };
      const newRayons = prev.rayons.includes(r) ? prev.rayons.filter(x => x !== r) : [...prev.rayons.filter(x => x !== 'Любой (Istalgan)'), r];
      return { ...prev, rayons: newRayons };
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-xl p-8 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Mijoz Tahrirlash (Edit Client)</h2>
          <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"><X className="w-4 h-4"/></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-semibold text-slate-700">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">F.I.SH. (Client Name) *</label>
              <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:border-slate-900 bg-slate-50 focus:bg-white font-bold transition-all text-xs" />
            </div>
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Telefon (Phone) *</label>
              <input required type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:border-slate-900 bg-slate-50 focus:bg-white transition-all text-xs" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Kategoriya</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value as any})} className="w-full border border-slate-200 rounded-lg p-1.5 bg-white text-xs font-bold">
                <option value="zhiloy">Жилой (Turar)</option>
                <option value="nezhiloy">Нежилой (Tijorat)</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Bitim Turi</label>
              <select value={form.deal_type} onChange={e => setForm({...form, deal_type: e.target.value as any})} className="w-full border border-slate-200 rounded-lg p-1.5 bg-white text-xs font-bold">
                <option value="buy">Xarid qilish (Buy)</option>
                <option value="rent">Ijaraga olish (Rent)</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full border border-slate-200 rounded-lg p-1.5 bg-white text-xs font-bold">
                <option value="active">Active</option>
                <option value="padbor">Padbor</option>
                <option value="pokaz">Pokaz</option>
                <option value="negotiating">Negotiating</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Min Byudjet ($)</label>
              <input type="number" value={form.price_min} onChange={e => setForm({...form, price_min: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:border-slate-900 font-mono text-xs focus:bg-white transition-all font-bold" />
            </div>
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Max Byudjet ($) *</label>
              <input required type="number" value={form.price_max} onChange={e => setForm({...form, price_max: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:border-slate-900 font-mono text-xs focus:bg-white transition-all font-black text-slate-950" />
            </div>
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Min Maydon (m²)</label>
              <input type="number" value={form.min_area} onChange={e => setForm({...form, min_area: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:border-slate-900 font-mono text-xs focus:bg-white transition-all font-bold" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Xonalar</label>
              <input type="text" value={form.rooms} onChange={e => setForm({...form, rooms: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:border-slate-900 focus:bg-white transition-all text-xs" />
            </div>
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Orientir</label>
              <input type="text" value={form.orientir} onChange={e => setForm({...form, orientir: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:border-slate-900 focus:bg-white transition-all text-xs" />
            </div>
          </div>

          <div>
             <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-2.5">Tumanlar (Rayons)</label>
             <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto p-2 bg-[#F9F8F6] border border-[#4D6256]/15 rounded-lg">
                {TASHKENT_RAYONS.map(r => (
                  <button 
                    key={r} type="button" 
                    onClick={() => toggleRayon(r)}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                      form.rayons.includes(r) ? 'bg-[#4D6256] text-white border-[#4D6256] shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {r}
                  </button>
                ))}
             </div>
          </div>

          <div>
            <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Izoh / Qo'shimcha eslatmalar (Notes)</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full border border-slate-200 p-3 rounded-lg outline-none focus:border-slate-900 resize-none font-semibold text-xs leading-relaxed focus:bg-white transition-all text-[#1C2421]" rows={3} />
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-5 border-t border-slate-100">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 font-bold transition-all cursor-pointer">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-[#1C2421] hover:bg-[#2A3530] text-white rounded-xl font-bold shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">{isSubmitting ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface EditPropertyModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function EditPropertyModal({ property, isOpen, onClose, onSuccess }: EditPropertyModalProps) {
  const [form, setForm] = useState({
    title: property.title,
    category: property.category,
    type: property.type,
    deal_type: property.deal_type,
    price: String(property.price),
    rayon: property.rayon,
    orientir: property.orientir || '',
    area: String(property.area),
    rooms: String(property.rooms || ''),
    floor: String(property.floor || ''),
    max_floor: String(property.max_floor || ''),
    contact_name: property.contact_name || '',
    contact_phone: property.contact_phone,
    status: property.status || 'active'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.area || !form.contact_phone) return alert('Fill required fields');

    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await updateProperty(property.id!, {
        title: form.title,
        category: form.category as any,
        type: form.type,
        deal_type: form.deal_type as any,
        price: Number(form.price),
        rayon: form.rayon,
        orientir: form.orientir,
        rooms: Number(form.rooms) || null,
        area: Number(form.area),
        floor: Number(form.floor) || null,
        max_floor: Number(form.max_floor) || null,
        details: property.details || {},
        contact_name: form.contact_name,
        contact_phone: form.contact_phone,
        status: form.status
      });
      onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-xl p-8 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Ob'ekt Tahrirlash (Edit Property)</h2>
          <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"><X className="w-4 h-4"/></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-semibold text-slate-700">
          <div>
            <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Sarlavha (Title) *</label>
            <input required type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:border-slate-900 bg-slate-50 focus:bg-white font-bold transition-all text-xs" />
          </div>

          <div className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Kategoriya</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value as any})} className="w-full border border-slate-200 rounded-lg p-1.5 bg-white text-xs font-bold">
                <option value="zhiloy">Жилой (Turar)</option>
                <option value="nezhiloy">Нежилой (Tijorat)</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Turi (Type)</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full border border-slate-200 rounded-lg p-1.5 bg-white text-xs font-bold">
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="office">Office</option>
                <option value="storage">Storage</option>
                <option value="salon">Salon</option>
                <option value="catering">Catering</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Bitim Turi</label>
              <select value={form.deal_type} onChange={e => setForm({...form, deal_type: e.target.value as any})} className="w-full border border-slate-200 rounded-lg p-1.5 bg-white text-xs font-bold">
                <option value="sale">Sotuv (Sale)</option>
                <option value="rent">Ijara (Rent)</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full border border-slate-200 rounded-lg p-1.5 bg-white text-xs font-bold">
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Narx ($) *</label>
              <input required type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:border-slate-900 font-mono text-xs focus:bg-white transition-all font-black text-slate-950" />
            </div>
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Tuman (Rayon)</label>
               <select value={form.rayon} onChange={e => setForm({...form, rayon: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:border-slate-900 bg-white cursor-pointer font-bold text-xs">
                  {TASHKENT_RAYONS.filter(r => !r.includes('Любой') && !r.includes('Центar')).map(r => <option key={r} value={r}>{r}</option>)}
               </select>
            </div>
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Mo'ljal (Orientir)</label>
              <input type="text" value={form.orientir} onChange={e => setForm({...form, orientir: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:border-slate-900 focus:bg-white transition-all text-xs" />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Maydon (m²) *</label>
              <input required type="number" value={form.area} onChange={e => setForm({...form, area: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:border-slate-900 font-mono text-xs focus:bg-white transition-all font-bold" placeholder="75" />
            </div>
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Xonalar</label>
              <input type="number" value={form.rooms} onChange={e => setForm({...form, rooms: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:border-slate-900 font-mono text-xs focus:bg-white transition-all font-bold" />
            </div>
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Qavat (Floor)</label>
              <input type="number" value={form.floor} onChange={e => setForm({...form, floor: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:border-slate-900 font-mono text-xs focus:bg-white transition-all" />
            </div>
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Qavatlar soni</label>
              <input type="number" value={form.max_floor} onChange={e => setForm({...form, max_floor: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:border-slate-900 font-mono text-xs focus:bg-white transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Mulk Egasi Ismi</label>
              <input type="text" value={form.contact_name} onChange={e => setForm({...form, contact_name: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:border-slate-900 bg-white font-bold text-xs" />
            </div>
            <div>
              <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Telefon (Phone) *</label>
              <input required type="text" value={form.contact_phone} onChange={e => setForm({...form, contact_phone: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-lg outline-none focus:border-slate-900 bg-white font-bold text-xs" />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-5 border-t border-slate-100">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 font-bold transition-all cursor-pointer">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-[#1C2421] hover:bg-[#2A3530] text-white rounded-xl font-bold shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">{isSubmitting ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
