import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/Icon';
import { ThriftProduct, ThriftVendor } from '../types';

export const Thrift: React.FC = () => {
  const { thriftProducts, thriftVendors, addVendorApplication } = useApp();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Vendor registration states
  const [vendorForm, setVendorForm] = useState({
    vendorName: '',
    contact: '',
    category: 'clothing',
    description: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Selected Product Detail Modal state
  const [selectedProduct, setSelectedProduct] = useState<ThriftProduct | null>(null);

  // Filtering products
  const filteredProducts = thriftProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', label: 'Semua Koleksi' },
    { id: 'clothing', label: 'Pakaian / Tops' },
    { id: 'accessories', label: 'Aksesoris / Caps' },
    { id: 'shoes', label: 'Sepatu / Racing Boots' }
  ];

  const handleVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!vendorForm.vendorName.trim()) errors.vendorName = 'Nama brand vendor wajib diisi';
    if (!vendorForm.contact.trim()) {
      errors.contact = 'Nomor WhatsApp wajib diisi';
    } else if (!/^\+?[0-9]{9,15}$/.test(vendorForm.contact.replace(/[\s-]/g, ''))) {
      errors.contact = 'Format nomor WhatsApp tidak valid';
    }
    if (!vendorForm.description.trim()) {
      errors.description = 'Tulis deskripsi produk atau katalog thrift Anda';
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      addVendorApplication({
        vendor_name: vendorForm.vendorName,
        contact: vendorForm.contact,
        product_category: vendorForm.category,
        description: vendorForm.description
      });
      setIsSubmitting(false);
      setShowSuccessModal(true);

      // Reset Form
      setVendorForm({
        vendorName: '',
        contact: '',
        category: 'clothing',
        description: ''
      });
    }, 1200);
  };

  // Helper to open WhatsApp to order
  const handleContactSeller = (product: ThriftProduct) => {
    const vendor = thriftVendors.find(v => v.id === product.vendor_id) || {
      vendor_name: 'Seller TSF',
      contact: '6281234567890'
    };
    
    const formattedPrice = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(product.price);

    const text = `Halo ${vendor.vendor_name}, saya tertarik membeli produk *${product.name}* (${formattedPrice}) dengan kondisi [${product.condition}] yang dipajang di website TSF Bazar. Apakah barang ini masih tersedia?`;
    const waUrl = `https://wa.me/${vendor.contact}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="asphalt-texture min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. HERO BANNER */}
        <section className="bg-blue-sail text-ballroom rounded-none border-4 border-decor p-8 sm:p-12 mb-12 relative overflow-hidden shadow-[8px_8px_0_0_#BD1B1F]">
          <div className="absolute inset-0 grid-pattern opacity-10" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-4 text-center md:text-left max-w-2xl">
              <span className="inline-block bg-decor text-blue-sail font-mono font-black text-xs uppercase px-3 py-1 rounded-none border border-blue-sail tracking-wider">
                BAZAR & VINTAGE MARKET
              </span>
              <h1 className="font-display font-black text-4xl sm:text-5xl uppercase tracking-tight">
                TSF THRIFT <span className="text-decor">BAZAR</span>
              </h1>
              <p className="text-sm sm:text-base text-ballroom/80 font-sans leading-relaxed">
                Pusat perburuan pakaian balap retro, apparel vintage motorsport, sneakers langka, dan aksesoris street-wear keren. Temukan koleksi kurasi eksklusif dari seller-seller vintage terkemuka tanah air langsung di lokasi utama festival.
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1 font-mono text-xs text-decor font-bold">
                <span className="flex items-center space-x-1.5 bg-barbera/45 border border-decor/20 px-3 py-1.5 rounded-none">
                  <Icon name="Calendar" size={14} />
                  <span>25 - 30 Oktober 2026</span>
                </span>
                <span className="flex items-center space-x-1.5 bg-barbera/45 border border-decor/20 px-3 py-1.5 rounded-none text-ballroom">
                  <Icon name="MapPin" size={14} className="text-decor" />
                  <span>Area Paddock Utama TSF, Jakarta</span>
                </span>
              </div>
            </div>

            <button
              id="thrift-register-booth-scroll"
              onClick={() => {
                const el = document.getElementById('booth-form-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-decor hover:bg-decor/95 text-blue-sail font-display font-black text-xs uppercase px-8 py-4 rounded-none tracking-widest shrink-0 border-2 border-blue-sail shadow-[4px_4px_0_0_#BD1B1F] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              DAFTAR SEWA BOOTH
            </button>
          </div>
        </section>

        {/* 2. CATALOG HEADER: SEARCH & FILTERS */}
        <section className="mb-10 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="space-y-1 text-center md:text-left shrink-0">
              <h2 className="font-display font-black text-2xl text-blue-sail uppercase tracking-tight">KATALOG PRODUK RETRO</h2>
              <p className="text-xs text-blue-sail/70 font-sans">Kurasi produk retro racing, merch, & racing boots terbaik.</p>
            </div>

            {/* Search Input */}
            <div className="relative w-full max-w-md bg-white border-2 border-blue-sail rounded-none p-1 flex items-center shadow-[3px_3px_0_0_#2A4C9E]">
              <input
                id="product-search"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari kaos vintage, jaket F1, cap sparco..."
                className="flex-1 text-xs font-sans text-blue-sail px-3 py-1.5 outline-none"
              />
              <div className="p-2 text-blue-sail/40 shrink-0">
                <Icon name="Search" size={16} />
              </div>
            </div>
          </div>

          {/* Horizontal filter tabs */}
          <div className="flex flex-wrap gap-2.5">
            {categories.map(cat => (
              <button
                id={`cat-filter-${cat.id}`}
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 text-xs font-display font-bold uppercase tracking-wider rounded-none border-2 transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-blue-sail border-blue-sail text-decor font-black shadow-[3px_3px_0_0_#F6BB02]'
                    : 'bg-ballroom/40 border-blue-sail/30 text-blue-sail/80 hover:bg-ballroom/75 hover:text-blue-sail'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* 3. PRODUCT CATALOG GRID */}
        <section className="mb-20">
          {filteredProducts.length === 0 ? (
            /* EMPTY STATE */
            <div className="bg-ballroom rounded-none border-4 border-blue-sail p-12 text-center max-w-md mx-auto shadow-[6px_6px_0_0_#2A4C9E]">
              <Icon name="ShoppingBag" size={48} className="text-decor mx-auto mb-3 animate-pulse" />
              <h4 className="font-display font-bold text-lg text-blue-sail uppercase">Produk Tidak Ditemukan</h4>
              <p className="text-xs text-blue-sail/70 font-sans mt-1.5">
                Koleksi dengan pencarian "{searchQuery}" atau filter kategori ini belum tersedia atau sudah terjual. Coba kata kunci lainnya!
              </p>
            </div>
          ) : (
            /* PRODUCTS GRID */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(prod => {
                const vendor = thriftVendors.find(v => v.id === prod.vendor_id) || {
                  vendor_name: 'Vendor TSF',
                  booth_location: 'Booth TSF'
                };
                
                // Format price to Rupiah
                const formattedPrice = new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0
                }).format(prod.price);

                const isSold = prod.status === 'sold';

                return (
                  <div
                    id={`prod-card-${prod.id}`}
                    key={prod.id}
                    className="bg-ballroom rounded-none border-4 border-blue-sail overflow-hidden flex flex-col shadow-[4px_4px_0_0_#2A4C9E] group hover:shadow-[8px_8px_0_0_#2A4C9E] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all relative"
                  >
                    {/* SOLD OUT OVERLAY */}
                    {isSold && (
                      <div className="absolute inset-0 bg-black/75 z-10 flex items-center justify-center font-display font-black text-xl text-decor tracking-widest uppercase transform rotate-[-5deg]">
                        SOLD OUT
                      </div>
                    )}

                    {/* Image Box */}
                    <div className="h-56 overflow-hidden relative bg-white">
                      <img 
                        src={prod.image_url} 
                        alt={prod.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Micro overlay indicators */}
                      <div className="absolute bottom-3 left-3 bg-red-inferno text-ballroom text-[9px] font-mono font-bold px-2 py-0.5 rounded-none border border-red-700 uppercase tracking-wider">
                        Kondisi: {prod.condition.split(' ')[0]}
                      </div>
                      
                      <div className="absolute top-3 right-3 bg-blue-sail text-decor text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-none border border-decor uppercase tracking-wider">
                        {prod.category.toUpperCase()}
                      </div>
                    </div>

                    {/* Details content */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-4 text-blue-sail">
                      <div className="space-y-1">
                        <p className="text-[10px] font-mono font-bold text-red-inferno uppercase tracking-wide">
                          Seller: {vendor.vendor_name} ({vendor.booth_location})
                        </p>
                        <h3 className="font-display font-bold text-base leading-tight uppercase tracking-tight group-hover:text-red-inferno transition-colors">
                          {prod.name}
                        </h3>
                      </div>

                      <div className="border-t-2 border-blue-sail/20 pt-3.5 flex items-center justify-between">
                        <span className="font-display font-black text-lg text-blue-sail">
                          {formattedPrice}
                        </span>
                        
                        <div className="flex gap-1.5">
                          {/* Details btn */}
                          <button
                            id={`prod-detail-btn-${prod.id}`}
                            onClick={() => setSelectedProduct(prod)}
                            className="bg-blue-sail/10 hover:bg-blue-sail text-blue-sail hover:text-ballroom p-2 rounded-none border border-blue-sail/45 transition-colors cursor-pointer"
                            title="Detail Produk"
                          >
                            <Icon name="Info" size={14} />
                          </button>

                          {/* Contact seller WA */}
                          <button
                            id={`prod-wa-btn-${prod.id}`}
                            onClick={() => handleContactSeller(prod)}
                            className="bg-decor hover:bg-decor/95 text-blue-sail font-display font-black text-[10px] uppercase px-3 py-2 rounded-none border border-blue-sail tracking-widest shadow-[2px_2px_0_0_#2A4C9E] flex items-center space-x-1 cursor-pointer"
                          >
                            <Icon name="Phone" size={12} className="stroke-[2.5px]" />
                            <span>Tanya Seller</span>
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 4. VENDOR DIRECTORY */}
        <section className="mb-20">
          <div className="text-center space-y-2 mb-10">
            <span className="font-mono text-sm font-bold text-red-inferno tracking-widest uppercase">// VENDOR DIRECTORY</span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-blue-sail uppercase tracking-tight">DAFTAR BOOTH SELLER RESMI</h2>
            <div className="w-16 h-1.5 bg-decor mx-auto rounded-none border border-blue-sail" />
            <p className="text-xs text-blue-sail/70 font-sans mt-2">Kunjungi booth fisik seller retro di bawah di area utama TSF.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {thriftVendors.map(vendor => (
              <div key={vendor.id} className="bg-ballroom p-5 rounded-none border-4 border-blue-sail flex flex-col justify-between items-start space-y-4 shadow-[4px_4px_0_0_#F6BB02] hover:shadow-[6px_6px_0_0_#F6BB02] transition-shadow">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-blue-sail/10 text-blue-sail border border-blue-sail/35 rounded-none">
                      <Icon name="Store" size={18} />
                    </div>
                    <h3 className="font-display font-extrabold text-blue-sail uppercase text-base">{vendor.vendor_name}</h3>
                  </div>
                  <p className="text-xs text-blue-sail/80 font-sans">
                    Lokasi Booth Fisik: <strong>{vendor.booth_location}</strong>
                  </p>
                </div>
                
                <a
                  href={`https://wa.me/${vendor.contact}?text=Halo%20${encodeURIComponent(vendor.vendor_name)},%20saya%20melihat%20brand%20Anda%20di%20TSF%20Bazar.`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-mono font-bold text-red-inferno hover:text-barbera flex items-center space-x-1"
                >
                  <Icon name="Phone" size={12} />
                  <span>Hubungi Official Brand ({vendor.contact.substring(0, 5)}...)</span>
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* 5. VENDOR BOOTH REGISTRATION FORM */}
        <section id="booth-form-section" className="max-w-3xl mx-auto">
          <div className="bg-ballroom rounded-none border-4 border-blue-sail shadow-[8px_8px_0_0_#2A4C9E] overflow-hidden text-blue-sail">
            
            {/* Header Form */}
            <div className="bg-blue-sail text-ballroom p-6 border-b-4 border-decor relative">
              <div className="absolute inset-0 grid-pattern opacity-10" />
              <div className="relative z-10 flex items-center space-x-4">
                <div className="bg-decor text-blue-sail p-3 rounded-none border-2 border-blue-sail">
                  <Icon name="Store" size={28} className="stroke-[2.5px]" />
                </div>
                <div>
                  <h3 className="font-display font-black text-xl uppercase tracking-tight text-decor">
                    FORMULIR PENDAFTARAN BOOTH VENDOR
                  </h3>
                  <p className="text-xs text-ballroom/85 font-sans mt-0.5">
                    Bergabunglah membuka gerai di area sirkuit bazar utama TSF. Kuota booth sangat terbatas.
                  </p>
                </div>
              </div>
            </div>

            {/* Vendor Form Content */}
            <form onSubmit={handleVendorSubmit} className="p-6 sm:p-8 space-y-5 font-sans">
              
              {/* Brand Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wide">Nama Brand / Thrift Store *</label>
                <input
                  id="vendor-name"
                  type="text"
                  value={vendorForm.vendorName}
                  onChange={e => setVendorForm(prev => ({ ...prev, vendorName: e.target.value }))}
                  placeholder="Contoh: Veloce Vintage Jakarta / Retro Racing Club"
                  className={`w-full px-4 py-2.5 text-sm bg-white border-2 rounded-none outline-none transition-all ${
                    formErrors.vendorName ? 'border-red-inferno focus:shadow-[2px_2px_0_0_#BD1B1F]' : 'border-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]'
                  }`}
                />
                {formErrors.vendorName && <p className="text-red-inferno text-[10px] font-bold uppercase">{formErrors.vendorName}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Contacts WA */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wide">No. WhatsApp Hotline Brand *</label>
                  <input
                    id="vendor-contact"
                    type="text"
                    value={vendorForm.contact}
                    onChange={e => setVendorForm(prev => ({ ...prev, contact: e.target.value }))}
                    placeholder="Contoh: 081234567890"
                    className={`w-full px-4 py-2.5 text-sm bg-white border-2 rounded-none outline-none transition-all ${
                      formErrors.contact ? 'border-red-inferno focus:shadow-[2px_2px_0_0_#BD1B1F]' : 'border-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]'
                    }`}
                  />
                  {formErrors.contact && <p className="text-red-inferno text-[10px] font-bold uppercase">{formErrors.contact}</p>}
                </div>

                {/* Category Selection dropdown */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wide">Kategori Produk Utama *</label>
                  <select
                    id="vendor-category"
                    value={vendorForm.category}
                    onChange={e => setVendorForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2.5 text-sm bg-white border-2 border-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E] rounded-none outline-none transition-all font-medium"
                  >
                    <option value="clothing">Pakaian Retro (T-Shirt, Crewneck, Jacket)</option>
                    <option value="accessories">Aksesoris Retro (Racing Cap, Pin, Belt Bag)</option>
                    <option value="shoes">Sepatu / Racing Boots</option>
                    <option value="multi">Campuran / Multi-Category</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wide">Rincian Katalog & Portofolio Produk *</label>
                <textarea
                  id="vendor-description"
                  rows={4}
                  value={vendorForm.description}
                  onChange={e => setVendorForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Jelaskan jenis barang thrift yang ingin dijual, asal barang (local/import), kisaran harga jual, serta foto katalog Instagram brand Anda..."
                  className={`w-full px-4 py-3 text-sm bg-white border-2 rounded-none outline-none transition-all ${
                    formErrors.description ? 'border-red-inferno focus:shadow-[2px_2px_0_0_#BD1B1F]' : 'border-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]'
                  }`}
                />
                {formErrors.description && <p className="text-red-inferno text-[10px] font-bold uppercase">{formErrors.description}</p>}
              </div>

              {/* Submit */}
              <button
                id="vendor-submit"
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-decor hover:bg-decor/95 disabled:bg-decor/50 text-blue-sail font-display font-black text-sm uppercase py-4 rounded-none border-2 border-blue-sail tracking-wider shadow-[4px_4px_0_0_#BD1B1F] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-sail border-t-transparent" />
                    <span>MENGIRIM PENGAJUAN BOOTH...</span>
                  </>
                ) : (
                  <>
                    <Icon name="CheckCircle2" size={16} className="stroke-[2.5px]" />
                    <span>AJUKAN SEWA BOOTH THRIFT</span>
                  </>
                )}
              </button>

            </form>

          </div>
        </section>

      </div>

      {/* MODAL: PRODUCT DETAILS */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn font-sans text-blue-sail">
          <div className="bg-ballroom w-full max-w-lg rounded-none border-4 border-blue-sail shadow-[8px_8px_0_0_#2A4C9E] overflow-hidden">
            
            {/* Header Modal */}
            <div className="bg-blue-sail text-ballroom p-5 flex items-center justify-between border-b-4 border-decor">
              <h3 className="font-display font-bold text-base uppercase tracking-tight text-decor">
                Rincian Katalog Produk Thrift
              </h3>
              <button
                id="modal-prod-close"
                onClick={() => setSelectedProduct(null)}
                className="text-ballroom hover:text-decor p-1 transition-colors"
              >
                <Icon name="X" size={24} />
              </button>
            </div>

            {/* Content Modal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 bg-white">
              <div className="h-64 sm:h-auto bg-white border-b-2 sm:border-b-0 sm:border-r-2 border-blue-sail">
                <img 
                  src={selectedProduct.image_url} 
                  alt={selectedProduct.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="p-6 flex flex-col justify-between space-y-4 bg-ballroom">
                <div className="space-y-2">
                  <span className="bg-red-inferno text-ballroom font-mono text-[9px] font-bold px-2 py-1 rounded-none border border-red-700 uppercase tracking-widest inline-block">
                    {selectedProduct.category.toUpperCase()}
                  </span>
                  <h4 className="font-display font-bold text-lg uppercase tracking-tight leading-snug">
                    {selectedProduct.name}
                  </h4>
                  <p className="text-xs text-blue-sail/80 leading-normal">
                    Kondisi Barang: <strong>{selectedProduct.condition}</strong>
                  </p>
                  <p className="text-xs text-blue-sail/60 leading-normal">
                    Status: <strong className={selectedProduct.status === 'available' ? 'text-green-600' : 'text-red-600'}>
                      {selectedProduct.status === 'available' ? 'Tersedia' : 'Terjual'}
                    </strong>
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="font-display font-black text-2xl text-blue-sail">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0
                    }).format(selectedProduct.price)}
                  </p>
                  
                  <button
                    id="modal-prod-wa-cta"
                    onClick={() => {
                      handleContactSeller(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="w-full bg-decor hover:bg-decor/95 text-blue-sail font-display font-black text-xs uppercase py-3 rounded-none border-2 border-blue-sail shadow-[4px_4px_0_0_#BD1B1F] tracking-wider flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Icon name="Phone" size={14} className="stroke-[2.5px]" />
                    <span>BELI VIA WHATSAPP</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: SUCCESS REGISTER BOOTH */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn font-sans">
          <div className="bg-ballroom w-full max-w-md rounded-none border-4 border-blue-sail shadow-[8px_8px_0_0_#BD1B1F] p-6 text-center space-y-6">
            
            <div className="text-decor flex justify-center">
              <div className="bg-blue-sail p-4 rounded-none border-2 border-blue-sail text-decor animate-bounce">
                <Icon name="Store" size={48} className="stroke-[2.5px]" />
              </div>
            </div>

            <div className="space-y-2 text-blue-sail">
              <span className="font-mono text-[10px] font-bold text-red-inferno tracking-widest uppercase">REGISTRATION RECEIVED</span>
              <h3 className="font-display font-black text-xl uppercase tracking-tight">
                PENDAFTARAN BOOTH TERSIMPAN!
              </h3>
              <p className="text-xs sm:text-sm text-blue-sail/80 leading-relaxed">
                Formulir pengajuan booth tenant brand thrift Anda sudah masuk dalam daftar tunggu kurasi TSF Bazar 2026. Tim kurator logistik kami akan menganalisis profil katalog brand Anda dan segera berkoordinasi mengenai pembagian lokasi tenant fisik melalui kontak WhatsApp yang terdaftar.
              </p>
            </div>

            <button
              id="modal-vendor-success-close"
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-decor hover:bg-decor/95 text-blue-sail font-display font-black text-xs uppercase py-3.5 rounded-none border-2 border-blue-sail shadow-[4px_4px_0_0_#8B011A] tracking-widest transition-colors cursor-pointer"
            >
              KEMBALI KE BAZAR
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
