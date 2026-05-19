'use client'

import React, { useState, useEffect } from 'react';
import { 
  Users, Building2, Search, Plus, MapPin, 
  Phone, X, FileText, Check, RefreshCw, Filter, ArrowRight
} from 'lucide-react';
import { 
  Property, Client, addProperty, addClient, getProperties, 
  getClients, updatePropertyStatus, updateClientStatus, updateClientNotes,
  deleteProperty, deleteClient, getMatchesForClient, 
  getMatchesForProperty, MatchResult
} from './actions';

interface CrmDashboardProps {
  initialProperties: Property[];
  initialClients: Client[];
}

const TASHKENT_RAYONS = [
  "Любой (Istalgan)", "Центр (Markaz)",
  "Chilonzor", "Yunusobod", "Mirzo Ulugbek", "Yakkasaray", 
  "Mirobod", "Olmazor", "Shayxontohur", "Uchtepa", 
  "Sergeli", "Yashnobod", "Bektemir", "Yangihayot"
];

const TRANSLATIONS = {
  uz: {
    clients: "Mijozlar",
    properties: "Ob'ektlar",
    newClient: "Yangi Mijoz",
    newProperty: "Yangi Ob'ekt",
    search: "Qidiruv (Ism, telefon, izohlar, hudud...)",
    statusNew: "Yangi",
    statusNegotiating: "Muzokara",
    statusClosed: "Yopilgan",
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
    filters: "Filtrlar:"
  },
  ru: {
    clients: "Клиенты",
    properties: "Объекты",
    newClient: "Новый Клиент",
    newProperty: "Новый Объект",
    search: "Поиск (Имя, телефон, заметки, район...)",
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
    filters: "Фильтры:"
  }
};

export default function CrmDashboard({ initialProperties, initialClients }: CrmDashboardProps) {
  const [lang, setLang] = useState<'uz' | 'ru'>('uz');
  const t = TRANSLATIONS[lang];

  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [activeTab, setActiveTab] = useState<'clients' | 'properties'>('clients');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Advanced Filters
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDeal, setFilterDeal] = useState('all');
  const [filterRayon, setFilterRayon] = useState('all');

  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isPropModalOpen, setIsPropModalOpen] = useState(false);
  
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
        setMatches(results);
      }
    }
    fetchClientMatches();
  }, [selectedClient?.id]);

  useEffect(() => {
    async function fetchPropMatches() {
      if (selectedProperty?.id) {
        const results = await getMatchesForProperty(selectedProperty.id);
        setMatches(results);
      }
    }
    fetchPropMatches();
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
    // 1. Dropdown Filters
    if (filterCategory !== 'all' && c.category !== filterCategory) return false;
    if (filterDeal !== 'all' && c.deal_type !== filterDeal) return false;
    if (filterRayon !== 'all' && (!c.rayons || !c.rayons.includes(filterRayon))) return false;

    // 2. Token-based Multi-field Search
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
    // 1. Dropdown Filters
    if (filterCategory !== 'all' && p.category !== filterCategory) return false;
    if (filterDeal !== 'all' && p.deal_type !== filterDeal) return false;
    if (filterRayon !== 'all' && p.rayon !== filterRayon) return false;

    // 2. Token-based Multi-field Search
    if (filterTokens.length === 0) return true;
    const searchString = `
      ${p.title} ${p.rayon} ${p.price} ${p.area} 
      ${p.contact_name || ''} ${p.contact_phone || ''}
      ${p.category} ${p.deal_type}
    `.toLowerCase();
    
    return filterTokens.every(token => searchString.includes(token));
  });

  const pipelineNew = filteredClients.filter(c => c.status === 'active' || !c.status);
  const pipelineNegotiating = filteredClients.filter(c => c.status === 'negotiating');
  const pipelineClosed = filteredClients.filter(c => c.status === 'completed');
  const pipelineArchived = filteredClients.filter(c => c.status === 'archived');

  return (
    <div className="flex h-screen bg-white text-black font-sans overflow-hidden selection:bg-black selection:text-white">
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-gray-200 bg-[#FCFCFC] flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 font-extrabold text-lg tracking-tighter">
          55kvartal <span className="text-gray-400 ml-1 font-medium">CRM</span>
        </div>
        
        <nav className="flex-1 py-6 px-4 flex flex-col gap-2">
          <button
            onClick={() => { setActiveTab('clients'); setSelectedClient(null); setSelectedProperty(null); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'clients' ? 'bg-black text-white shadow-md' : 'text-gray-600 hover:bg-gray-200 hover:text-black'
            }`}
          >
            <div className="flex items-center gap-3"><Users className="w-4 h-4" /> {t.clients}</div>
            {activeTab === 'clients' && <ArrowRight className="w-4 h-4 text-gray-400" />}
          </button>
          <button
            onClick={() => { setActiveTab('properties'); setSelectedClient(null); setSelectedProperty(null); }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'properties' ? 'bg-black text-white shadow-md' : 'text-gray-600 hover:bg-gray-200 hover:text-black'
            }`}
          >
            <div className="flex items-center gap-3"><Building2 className="w-4 h-4" /> {t.properties}</div>
            {activeTab === 'properties' && <ArrowRight className="w-4 h-4 text-gray-400" />}
          </button>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setLang(lang === 'uz' ? 'ru' : 'uz')}
            className="w-full py-2 px-3 bg-white border border-gray-300 rounded-lg text-xs font-bold hover:border-black transition-colors"
          >
            {t.lang}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F9FAFB]">
        {/* TOP BAR */}
        <header className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white shrink-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-xl">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder={t.search} 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all shadow-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={refreshData} className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-all" title={t.refresh}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => activeTab === 'clients' ? setIsClientModalOpen(true) : setIsPropModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              {activeTab === 'clients' ? t.newClient : t.newProperty}
            </button>
          </div>
        </header>

        {/* FILTERS BAR */}
        <div className="bg-white border-b border-gray-200 px-6 py-2.5 flex items-center gap-3 shrink-0">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mr-2">
            <Filter className="w-3.5 h-3.5" /> {t.filters}
          </span>
          <select 
            value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
            className="text-xs font-semibold bg-gray-50 border border-gray-300 rounded-md px-3 py-1.5 outline-none focus:border-black cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <option value="all">{t.allCategories}</option>
            <option value="zhiloy">Жилой (Zhiloy)</option>
            <option value="nezhiloy">Нежилой (Nezhiloy)</option>
          </select>
          <select 
            value={filterDeal} onChange={e => setFilterDeal(e.target.value)}
            className="text-xs font-semibold bg-gray-50 border border-gray-300 rounded-md px-3 py-1.5 outline-none focus:border-black cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <option value="all">{t.allDeals}</option>
            <option value="buy">Buy / Sale</option>
            <option value="rent">Rent</option>
          </select>
          <select 
            value={filterRayon} onChange={e => setFilterRayon(e.target.value)}
            className="text-xs font-semibold bg-gray-50 border border-gray-300 rounded-md px-3 py-1.5 outline-none focus:border-black cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <option value="all">{t.allLocations}</option>
            {TASHKENT_RAYONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {/* WORKSPACE */}
        <div className="flex-1 overflow-hidden relative">
          
          {/* CLIENTS KANBAN BOARD */}
          {activeTab === 'clients' && (
            <div className="h-full flex overflow-x-auto p-6 gap-6">
              {[
                { title: t.statusNew, items: pipelineNew },
                { title: t.statusNegotiating, items: pipelineNegotiating },
                { title: t.statusClosed, items: pipelineClosed },
                { title: t.statusArchived, items: pipelineArchived },
              ].map(column => (
                <div key={column.title} className="flex-1 min-w-[280px] max-w-[350px] flex flex-col">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-widest">{column.title}</h3>
                    <span className="text-[10px] font-bold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{column.items.length}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-6">
                    {column.items.map(client => (
                      <div 
                        key={client.id}
                        onClick={() => setSelectedClient(client)}
                        className={`bg-white border p-4 rounded-xl shadow-sm cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${
                          selectedClient?.id === client.id ? 'border-black ring-2 ring-black/10' : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                           <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${client.category === 'zhiloy' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                             {client.category === 'zhiloy' ? 'Жилой' : 'Нежилой'}
                           </span>
                           <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${client.deal_type === 'rent' ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'}`}>
                             {client.deal_type === 'rent' ? 'Rent' : 'Buy'}
                           </span>
                        </div>
                        <div className="font-bold text-sm mb-1.5 text-gray-900">{client.name}</div>
                        <div className="text-xs text-gray-500 mb-3 flex items-center gap-1.5 font-medium">
                          <Phone className="w-3.5 h-3.5 text-gray-400" /> {client.phone}
                        </div>
                        <div className="text-xs font-bold text-gray-900 bg-gray-50 px-2.5 py-1.5 rounded-md border border-gray-100 inline-block font-mono">
                          ${client.price_min ? `${client.price_min} - ` : ''}{client.price_max} {client.deal_type === 'rent' ? '/mo' : ''}
                        </div>
                        {client.notes && (
                          <div className="mt-3 text-xs text-gray-600 line-clamp-2 border-t border-gray-100 pt-2.5 leading-relaxed">
                            {client.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PROPERTIES LIST */}
          {activeTab === 'properties' && (
            <div className="h-full overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProperties.map(prop => (
                  <div 
                    key={prop.id}
                    onClick={() => setSelectedProperty(prop)}
                    className={`bg-white border p-5 rounded-xl shadow-sm cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between ${
                      selectedProperty?.id === prop.id ? 'border-black ring-2 ring-black/10' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${prop.category === 'zhiloy' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                          {prop.category === 'zhiloy' ? 'Жилой' : 'Нежилой'}
                        </span>
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${prop.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                          {prop.status === 'active' ? 'Active' : 'Archive'}
                        </span>
                      </div>
                      <div className="font-bold text-sm mb-1.5 text-gray-900 leading-snug">{prop.title}</div>
                      <div className="text-xs text-gray-500 mb-4 flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" /> {prop.rayon}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-4 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                        <div className="flex flex-col"><span className="text-[10px] text-gray-400 uppercase font-bold">{t.area}</span> <span className="font-bold text-gray-900">{prop.area} m²</span></div>
                        {prop.rooms && <div className="flex flex-col"><span className="text-[10px] text-gray-400 uppercase font-bold">{t.rooms}</span> <span className="font-bold text-gray-900">{prop.rooms}</span></div>}
                      </div>
                    </div>
                    <div className="text-lg font-extrabold text-black border-t border-gray-100 pt-3 flex items-center justify-between">
                      <span className="font-mono">${prop.price.toLocaleString()}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{prop.deal_type === 'rent' ? '/mo' : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* RIGHT DRAWER: CLIENT DETAILS */}
      {selectedClient && (
        <aside className="w-[400px] border-l border-gray-200 bg-white flex flex-col shrink-0 shadow-2xl z-20 animate-fade-in-right relative">
          <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 shrink-0 bg-gray-50/50">
            <h2 className="font-bold text-sm uppercase tracking-wider text-gray-500">{t.clients} Detail</h2>
            <button onClick={() => setSelectedClient(null)} className="p-1.5 hover:bg-gray-200 rounded-md text-gray-500 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
            
            {/* Header Info */}
            <div>
              <h1 className="text-2xl font-black mb-1.5 text-gray-900 tracking-tight">{selectedClient.name}</h1>
              <a href={`tel:${selectedClient.phone}`} className="text-sm font-medium text-gray-600 hover:text-black flex items-center gap-2 mb-4 w-fit px-2 py-1 bg-gray-50 rounded-md border border-gray-200">
                <Phone className="w-3.5 h-3.5" /> {selectedClient.phone}
              </a>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pipeline Status</label>
                <select 
                  value={selectedClient.status || 'active'}
                  onChange={(e) => handleClientStatusChange(selectedClient.id!, e.target.value)}
                  className="text-sm font-bold bg-white border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-black shadow-sm transition-all cursor-pointer w-full"
                >
                  <option value="active">{t.statusNew} (Active)</option>
                  <option value="negotiating">{t.statusNegotiating} (In Progress)</option>
                  <option value="completed">{t.statusClosed} (Won)</option>
                  <option value="archived">{t.statusArchived} (Lost)</option>
                </select>
              </div>
            </div>

            {/* Criteria */}
            <div className="bg-[#F9FAFB] border border-gray-200 rounded-xl p-5 text-sm shadow-sm">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Client Requirements</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Type</span>
                  <span className="font-semibold text-gray-900">{selectedClient.category === 'zhiloy' ? 'Жилой' : 'Нежилой'} - <span className="capitalize">{selectedClient.deal_type}</span></span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">{t.budget}</span>
                  <span className="font-mono font-bold text-black">${selectedClient.price_min || 0} - ${selectedClient.price_max}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Locations (Rayons)</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedClient.rayons?.length ? selectedClient.rayons.map(r => (
                      <span key={r} className="text-xs font-bold bg-black text-white px-2 py-0.5 rounded-md">{r}</span>
                    )) : <span className="text-xs font-bold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-md">Any Location</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Editor */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">{t.notes} (Auto-saving)</label>
              <textarea
                value={selectedClient.notes || ''}
                onChange={(e) => handleNotesChange(selectedClient.id!, e.target.value)}
                placeholder="Start typing to auto-save notes..."
                className="w-full text-sm font-medium p-4 border border-gray-300 rounded-xl min-h-[120px] outline-none focus:border-black focus:ring-2 focus:ring-black/5 resize-y transition-shadow bg-gray-50 focus:bg-white leading-relaxed"
              />
            </div>

            {/* Matches */}
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-gray-200 pb-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {t.matchedProperties}
                </label>
                <span className="text-[10px] font-bold bg-black text-white px-2 py-0.5 rounded-full">{matches.length}</span>
              </div>
              
              {matches.length === 0 ? (
                <div className="text-sm text-gray-500 py-6 text-center border-2 border-dashed border-gray-200 rounded-xl font-medium">{t.noMatches}</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {matches.map((m, i) => (
                    <div key={i} className="border border-gray-200 rounded-xl p-3.5 text-sm flex flex-col gap-1.5 relative bg-white shadow-sm hover:border-black transition-colors cursor-pointer group">
                      <div className="absolute top-0 right-0 bg-black text-white text-[10px] font-bold px-2 py-1 rounded-bl-xl rounded-tr-xl flex items-center gap-1 shadow-sm">
                        {m.score}% Match
                      </div>
                      <div className="font-bold text-gray-900 pr-16 truncate group-hover:underline">{m.property!.title}</div>
                      <div className="text-xs text-gray-500 font-medium flex items-center gap-1"><MapPin className="w-3 h-3" /> {m.property!.rayon}</div>
                      <div className="font-mono font-bold text-black mt-1">${m.property!.price.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Delete button */}
            <div className="mt-auto pt-8 flex justify-center">
               <button onClick={deleteSelectedClient} className="text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-all">
                 Delete Client Permanently
               </button>
            </div>
          </div>
        </aside>
      )}

      {/* RIGHT DRAWER: PROPERTY DETAILS */}
      {selectedProperty && (
        <aside className="w-[400px] border-l border-gray-200 bg-white flex flex-col shrink-0 shadow-2xl z-20 animate-fade-in-right relative">
          <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 shrink-0 bg-gray-50/50">
            <h2 className="font-bold text-sm uppercase tracking-wider text-gray-500">{t.properties} Detail</h2>
            <button onClick={() => setSelectedProperty(null)} className="p-1.5 hover:bg-gray-200 rounded-md text-gray-500 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
            
            {/* Header Info */}
            <div>
              <h1 className="text-2xl font-black mb-2 text-gray-900 tracking-tight leading-tight">{selectedProperty.title}</h1>
              <div className="text-2xl font-mono font-bold text-black mb-4">${selectedProperty.price.toLocaleString()}</div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Listing Status</label>
                <select 
                  value={selectedProperty.status || 'active'}
                  onChange={(e) => handlePropertyStatusChange(selectedProperty.id!, e.target.value)}
                  className="text-sm font-bold bg-white border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-black shadow-sm transition-all cursor-pointer w-full"
                >
                  <option value="active">Active Listing</option>
                  <option value="archived">Archived / Sold</option>
                </select>
              </div>
            </div>

            {/* Criteria */}
            <div className="bg-[#F9FAFB] border border-gray-200 rounded-xl p-5 text-sm shadow-sm">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Property Specs</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Type</span>
                  <span className="font-semibold text-gray-900">{selectedProperty.category === 'zhiloy' ? 'Жилой' : 'Нежилой'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Location</span>
                  <span className="font-semibold text-gray-900 flex items-center gap-1"><MapPin className="w-3 h-3 text-gray-400" /> {selectedProperty.rayon}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">{t.area}</span>
                  <span className="font-bold text-black">{selectedProperty.area} m²</span>
                </div>
                {selectedProperty.rooms && (
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">{t.rooms}</span>
                    <span className="font-bold text-black">{selectedProperty.rooms}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact */}
            <div className="border border-gray-200 rounded-xl p-5 text-sm shadow-sm bg-white">
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Owner Contact</span>
               <div className="font-bold text-gray-900 mb-1.5">{selectedProperty.contact_name || 'No name provided'}</div>
               <a href={`tel:${selectedProperty.contact_phone}`} className="text-sm font-bold text-black hover:underline flex items-center gap-1.5 w-fit px-2 py-1 bg-gray-50 rounded-md border border-gray-200">
                <Phone className="w-3.5 h-3.5" /> {selectedProperty.contact_phone}
              </a>
            </div>

            {/* Matches */}
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-gray-200 pb-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {t.matchedClients}
                </label>
                <span className="text-[10px] font-bold bg-black text-white px-2 py-0.5 rounded-full">{matches.length}</span>
              </div>
              {matches.length === 0 ? (
                <div className="text-sm text-gray-500 py-6 text-center border-2 border-dashed border-gray-200 rounded-xl font-medium">{t.noMatches}</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {matches.map((m, i) => (
                    <div key={i} className="border border-gray-200 rounded-xl p-3.5 text-sm flex flex-col gap-1.5 relative bg-white shadow-sm hover:border-black transition-colors cursor-pointer group">
                      <div className="absolute top-0 right-0 bg-black text-white text-[10px] font-bold px-2 py-1 rounded-bl-xl rounded-tr-xl flex items-center gap-1 shadow-sm">
                        {m.score}% Match
                      </div>
                      <div className="font-bold text-gray-900 pr-16 group-hover:underline">{m.client!.name}</div>
                      <div className="text-xs text-gray-500 font-medium flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-400" /> {m.client!.phone}</div>
                      <div className="font-mono font-bold text-black mt-1">${m.client!.price_min} - ${m.client!.price_max}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mt-auto pt-8 flex justify-center">
               <button onClick={deleteSelectedProperty} className="text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-all">
                 Delete Property Permanently
               </button>
            </div>
          </div>
        </aside>
      )}

      {/* SIMPLE FORMS (Client & Property) */}
      <SimpleClientModal 
        isOpen={isClientModalOpen} 
        onClose={() => setIsClientModalOpen(false)} 
        onSuccess={async () => { setIsClientModalOpen(false); await refreshData(); }} 
      />
      
      <SimplePropertyModal 
        isOpen={isPropModalOpen} 
        onClose={() => setIsPropModalOpen(false)} 
        onSuccess={async () => { setIsPropModalOpen(false); await refreshData(); }} 
      />
      
    </div>
  );
}

// ------------------------------------------------------------------------------------------------
// PREMIUM MODALS
// ------------------------------------------------------------------------------------------------

function SimpleClientModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
  const [form, setForm] = useState({
    name: '', phone: '', category: 'zhiloy', type: 'apartment', deal_type: 'buy',
    price_min: '', price_max: '', rayons: [] as string[], min_area: '', rooms: '', notes: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.price_max) return alert('Name, Phone, and Max Budget are required.');
    
    await addClient({
      name: form.name, phone: form.phone, category: form.category as any, type: form.type,
      deal_type: form.deal_type as any, price_min: Number(form.price_min) || 0, price_max: Number(form.price_max),
      rayons: form.rayons, orientir: '', min_area: Number(form.min_area) || 0, rooms: form.rooms || null,
      details: {}, notes: form.notes
    });
    onSuccess();
  };

  const toggleRayon = (r: string) => {
    setForm(prev => {
      if (r === 'Любой (Istalgan)') return { ...prev, rayons: [r] };
      const newRayons = prev.rayons.includes(r) ? prev.rayons.filter(x => x !== r) : [...prev.rayons.filter(x => x !== 'Любой (Istalgan)'), r];
      return { ...prev, rayons: newRayons };
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-xl p-8 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">New Client Request</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"><X className="w-4 h-4"/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Name *</label>
              <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all font-medium" placeholder="Client name" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Phone *</label>
              <input required type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all font-medium" placeholder="+998 90 123 45 67" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-5 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Category</label>
              <div className="flex bg-gray-200/50 p-1 rounded-lg">
                <button type="button" onClick={() => setForm({...form, category: 'zhiloy'})} className={`flex-1 py-1.5 text-center rounded-md text-xs font-bold transition-all ${form.category === 'zhiloy' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}>Жилой</button>
                <button type="button" onClick={() => setForm({...form, category: 'nezhiloy'})} className={`flex-1 py-1.5 text-center rounded-md text-xs font-bold transition-all ${form.category === 'nezhiloy' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}>Нежилой</button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Deal Type</label>
              <div className="flex bg-gray-200/50 p-1 rounded-lg">
                <button type="button" onClick={() => setForm({...form, deal_type: 'buy'})} className={`flex-1 py-1.5 text-center rounded-md text-xs font-bold transition-all ${form.deal_type === 'buy' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}>Buy</button>
                <button type="button" onClick={() => setForm({...form, deal_type: 'rent'})} className={`flex-1 py-1.5 text-center rounded-md text-xs font-bold transition-all ${form.deal_type === 'rent' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}>Rent</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Min Budget ($)</label>
              <input type="number" value={form.price_min} onChange={e => setForm({...form, price_min: e.target.value})} className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:border-black focus:ring-2 focus:ring-black/5 font-mono font-medium" placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Max Budget ($) *</label>
              <input required type="number" value={form.price_max} onChange={e => setForm({...form, price_max: e.target.value})} className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:border-black focus:ring-2 focus:ring-black/5 font-mono font-bold" placeholder="150000" />
            </div>
          </div>
          
          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2.5">Locations (Rayons)</label>
             <div className="flex flex-wrap gap-2">
                {TASHKENT_RAYONS.map(r => (
                  <button 
                    key={r} type="button" 
                    onClick={() => toggleRayon(r)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${form.rayons.includes(r) ? 'bg-black text-white border-black shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:bg-gray-50'}`}
                  >
                    {r}
                  </button>
                ))}
             </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-black focus:ring-2 focus:ring-black/5 resize-none font-medium text-sm leading-relaxed" rows={3} placeholder="Add specific client requests here..." />
          </div>
          
          <div className="flex justify-end gap-3 mt-4 pt-5 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-bold transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 font-bold shadow-md transition-all active:scale-95">Save Client</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SimplePropertyModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
  const [form, setForm] = useState({
    title: '', category: 'zhiloy', type: 'apartment', deal_type: 'sale',
    price: '', rayon: 'Центр (Markaz)', area: '', rooms: '', contact_name: '', contact_phone: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.area || !form.contact_phone) return alert('Fill required fields');
    
    await addProperty({
      title: form.title, category: form.category as any, type: form.type, deal_type: form.deal_type as any,
      price: Number(form.price), rayon: form.rayon, orientir: '', rooms: Number(form.rooms) || null,
      area: Number(form.area), floor: null, max_floor: null, details: {},
      contact_name: form.contact_name, contact_phone: form.contact_phone
    });
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-xl p-8 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">New Property Listing</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"><X className="w-4 h-4"/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-sm">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Title *</label>
            <input required type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:border-black focus:ring-2 focus:ring-black/5 font-medium" placeholder="E.g., 3-room apartment in Novostroyka" />
          </div>

          <div className="grid grid-cols-2 gap-5 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Category</label>
              <div className="flex bg-gray-200/50 p-1 rounded-lg">
                <button type="button" onClick={() => setForm({...form, category: 'zhiloy'})} className={`flex-1 py-1.5 text-center rounded-md text-xs font-bold transition-all ${form.category === 'zhiloy' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}>Жилой</button>
                <button type="button" onClick={() => setForm({...form, category: 'nezhiloy'})} className={`flex-1 py-1.5 text-center rounded-md text-xs font-bold transition-all ${form.category === 'nezhiloy' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}>Нежилой</button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Deal Type</label>
              <div className="flex bg-gray-200/50 p-1 rounded-lg">
                <button type="button" onClick={() => setForm({...form, deal_type: 'sale'})} className={`flex-1 py-1.5 text-center rounded-md text-xs font-bold transition-all ${form.deal_type === 'sale' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}>Sale</button>
                <button type="button" onClick={() => setForm({...form, deal_type: 'rent'})} className={`flex-1 py-1.5 text-center rounded-md text-xs font-bold transition-all ${form.deal_type === 'rent' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}>Rent</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Price ($) *</label>
              <input required type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:border-black focus:ring-2 focus:ring-black/5 font-mono font-bold" placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Rayon</label>
               <select value={form.rayon} onChange={e => setForm({...form, rayon: e.target.value})} className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:border-black focus:ring-2 focus:ring-black/5 bg-white font-medium cursor-pointer">
                  {TASHKENT_RAYONS.filter(r => !r.includes('Любой')).map(r => <option key={r} value={r}>{r}</option>)}
               </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Area (m²) *</label>
              <input required type="number" value={form.area} onChange={e => setForm({...form, area: e.target.value})} className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:border-black focus:ring-2 focus:ring-black/5 font-mono font-medium" placeholder="75" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Rooms</label>
              <input type="number" value={form.rooms} onChange={e => setForm({...form, rooms: e.target.value})} className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:border-black focus:ring-2 focus:ring-black/5 font-mono font-medium" placeholder="3" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Owner Name</label>
              <input type="text" value={form.contact_name} onChange={e => setForm({...form, contact_name: e.target.value})} className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:border-black focus:ring-2 focus:ring-black/5 font-medium" placeholder="Alisher" />
            </div>
             <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Phone *</label>
              <input required type="text" value={form.contact_phone} onChange={e => setForm({...form, contact_phone: e.target.value})} className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:border-black focus:ring-2 focus:ring-black/5 font-medium" placeholder="+998 90 000 00 00" />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-4 pt-5 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-bold transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 font-bold shadow-md transition-all active:scale-95">Save Property</button>
          </div>
        </form>
      </div>
    </div>
  );
}
