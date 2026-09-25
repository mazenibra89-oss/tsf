const fs = require('fs');

const path = '/Users/ibra/Documents/WEB/TSF/tsf/src/pages/Admin.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add fetch condition
content = content.replace(
  `} else if (activeTab === 'pe1' && (!pe1Registrations || pe1Registrations.length === 0)) {
      setTabLoading(true);
      fetchPE1Registrations().finally(() => setTabLoading(false));
    } else if (activeTab === 'competitions'`,
  `} else if (activeTab === 'pe1' && (!pe1Registrations || pe1Registrations.length === 0)) {
      setTabLoading(true);
      fetchPE1Registrations().finally(() => setTabLoading(false));
    } else if (activeTab === 'pe2' && (!pe2Registrations || pe2Registrations.length === 0)) {
      setTabLoading(true);
      fetchPE2Registrations().finally(() => setTabLoading(false));
    } else if (activeTab === 'competitions'`
);

// 2. Add side menu button
content = content.replace(
  `          <button
            onClick={() => setActiveTab('pe1')}
            className={\`w-full text-left px-4 py-3 rounded-none border-2 flex items-center space-x-2.5 transition-all cursor-pointer \${activeTab === 'pe1'
                ? 'bg-decor border-blue-sail text-blue-sail shadow-[3px_3px_0_0_#BD1B1F]'
                : 'bg-transparent border-transparent text-ballroom hover:bg-barbera/40 hover:border-ballroom/15'
              }\`}
          >
            <Icon name="Briefcase" size={16} />
            <span>Pendaftar PE1 CEO For A Day</span>
          </button>`,
  `          <button
            onClick={() => setActiveTab('pe1')}
            className={\`w-full text-left px-4 py-3 rounded-none border-2 flex items-center space-x-2.5 transition-all cursor-pointer \${activeTab === 'pe1'
                ? 'bg-decor border-blue-sail text-blue-sail shadow-[3px_3px_0_0_#BD1B1F]'
                : 'bg-transparent border-transparent text-ballroom hover:bg-barbera/40 hover:border-ballroom/15'
              }\`}
          >
            <Icon name="Briefcase" size={16} />
            <span>Pendaftar PE1 CEO For A Day</span>
          </button>

          <button
            onClick={() => setActiveTab('pe2')}
            className={\`w-full text-left px-4 py-3 rounded-none border-2 flex items-center space-x-2.5 transition-all cursor-pointer \${activeTab === 'pe2'
                ? 'bg-decor border-blue-sail text-blue-sail shadow-[3px_3px_0_0_#BD1B1F]'
                : 'bg-transparent border-transparent text-ballroom hover:bg-barbera/40 hover:border-ballroom/15'
              }\`}
          >
            <Icon name="Briefcase" size={16} />
            <span>Pendaftar PE2 Impacture</span>
          </button>`
);

// 3. Add PE2 Table View right before staff table view
const pe2TableView = `
        {/* 2.5 SECTION TAB: PE2 */}
        {activeTab === 'pe2' && (
          <div className="space-y-6">
            
            <div className="bg-white border-4 border-blue-sail p-4 sm:p-5 shadow-[6px_6px_0_0_#BD1B1F] space-y-4">
              <div className="flex items-center gap-2 border-b-2 border-blue-sail/20 pb-3">
                <Icon name="Settings" size={20} className="text-red-inferno" />
                <h2 className="font-display font-black text-lg uppercase text-blue-sail">PENGATURAN PENDAFTARAN PE2</h2>
              </div>
              <div className="flex flex-wrap gap-4">
                {[
                  { key: 'pe2_registration_open', label: 'BUKA PENDAFTARAN PE2', icon: 'Ticket' }
                ].map(setting => {
                  const isOpen = systemSettings?.[setting.key] === 'true';
                  return (
                    <div key={setting.key} className={\`border-2 p-4 flex flex-col items-center justify-center gap-3 text-center transition-all \${isOpen ? 'border-emerald-600 bg-emerald-50' : 'border-red-600 bg-red-50'}\`}>
                      <Icon name={setting.icon as any} size={24} className={isOpen ? 'text-emerald-700' : 'text-red-700'} />
                      <span className={\`font-display font-bold text-[10px] uppercase \${isOpen ? 'text-emerald-900' : 'text-red-900'}\`}>{setting.label}</span>
                      
                      <button
                        type="button"
                        onClick={() => updateSystemSetting(setting.key, isOpen ? 'false' : 'true')}
                        className={\`mt-1 font-display font-bold text-xs uppercase px-4 py-1.5 border-2 cursor-pointer transition-all shadow-[2px_2px_0_0_#000] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none \${isOpen ? 'bg-emerald-600 text-white border-emerald-800' : 'bg-red-600 text-white border-red-800'}\`}
                      >
                        {isOpen ? '🟢 TERBUKA' : '🔴 DITUTUP'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <h2 className="font-display font-black text-2xl text-blue-sail uppercase tracking-tight drop-shadow-sm flex items-center gap-3">
                  <Icon name="Briefcase" size={28} className="text-decor" />
                  DATABASE PE2
                </h2>
                <div className="flex gap-4 font-mono text-sm font-bold mt-2">
                  <span className="bg-blue-sail text-white px-3 py-1">Total Pendaftar: {(pe2Registrations || []).length}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => refreshState()}
                  className="bg-white border-2 border-blue-sail text-blue-sail hover:bg-gray-50 px-4 py-2 font-mono font-bold text-sm flex items-center gap-2 shadow-[2px_2px_0_0_#1E2A4F] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                >
                  <Icon name="RefreshCw" size={16} className={isFetchingUsers ? 'animate-spin' : ''} /> Refresh
                </button>
              </div>
            </div>

            {/* Filter controls */}
            <div className="bg-white p-4 border-2 border-blue-sail/20 flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Cari nama / email..."
                value={searchPE2Query}
                onChange={e => setSearchPE2Query(e.target.value)}
                className="flex-1 border-2 border-blue-sail p-2 font-mono text-sm outline-none focus:border-decor focus:bg-blue-50"
              />
              <select
                value={filterPE2Set}
                onChange={e => setFilterPE2Set(e.target.value)}
                className="border-2 border-blue-sail p-2 font-mono text-sm outline-none"
              >
                <option value="all">Semua Paket</option>
                <option value="Single Set">Single Set</option>
                <option value="Couple Set">Couple Set</option>
              </select>
              <select
                value={filterPE2Status}
                onChange={e => setFilterPE2Status(e.target.value)}
                className="border-2 border-blue-sail p-2 font-mono text-sm outline-none"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="overflow-x-auto border-2 border-blue-sail bg-white">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-blue-sail text-white font-mono text-xs uppercase tracking-wider">
                  <tr>
                    <th className="p-3 whitespace-nowrap">No</th>
                    <th className="p-3 border-l border-white/20 whitespace-nowrap">Tgl Daftar</th>
                    <th className="p-3 border-l border-white/20 whitespace-nowrap">Paket</th>
                    <th className="p-3 border-l border-white/20 min-w-[200px]">Data Pendaftar</th>
                    <th className="p-3 border-l border-white/20 whitespace-nowrap">Bukti Bayar</th>
                    <th className="p-3 border-l border-white/20 whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="font-sans text-sm divide-y divide-blue-sail/20">
                  {paginatedPE2Regs.map((reg, idx) => (
                    <tr key={reg.id} className="hover:bg-blue-50 transition-colors group">
                      <td className="p-3 font-mono font-bold">{(pe2Page - 1) * pe2PageSize + idx + 1}</td>
                      <td className="p-3 border-l border-blue-sail/20 text-xs">
                        {new Date(reg.submitted_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-3 border-l border-blue-sail/20 font-mono font-bold whitespace-nowrap">
                        <span className={\`px-2 py-1 text-[10px] \${reg.set_type === 'Single Set' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-purple-100 text-purple-800 border-purple-300'} border\`}>
                          {reg.set_type}
                        </span>
                      </td>
                      <td className="p-3 border-l border-blue-sail/20 space-y-1">
                        <div>
                          <strong>{reg.p1_name}</strong><br/>
                          <a href={\`mailto:\${reg.p1_email}\`} className="text-blue-600 hover:underline">{reg.p1_email}</a> | <a href={\`https://wa.me/\${reg.p1_whatsapp}\`} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">{reg.p1_whatsapp}</a><br/>
                          <span className="text-xs text-gray-500">{reg.p1_institution}</span>
                        </div>
                        {reg.set_type === 'Couple Set' && (
                          <div className="pt-2 mt-2 border-t border-dashed border-gray-300">
                            <strong>{reg.p2_name}</strong><br/>
                            <a href={\`mailto:\${reg.p2_email}\`} className="text-blue-600 hover:underline">{reg.p2_email}</a> | <a href={\`https://wa.me/\${reg.p2_whatsapp}\`} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">{reg.p2_whatsapp}</a><br/>
                            <span className="text-xs text-gray-500">{reg.p2_institution}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-3 border-l border-blue-sail/20">
                        {reg.payment_proof_url ? (
                          <a href={reg.payment_proof_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 px-2 py-1 rounded border border-blue-300 whitespace-nowrap">
                            <Icon name="ExternalLink" size={12} /> Cek Drive
                          </a>
                        ) : (
                          <span className="text-gray-400 italic text-xs">Kosong</span>
                        )}
                      </td>
                      <td className="p-3 border-l border-blue-sail/20 whitespace-nowrap">
                        <select
                          value={reg.status}
                          onChange={(e) => {
                            if (window.confirm(\`Yakin ingin mengubah status \${reg.p1_name} menjadi \${e.target.value}?\`)) {
                              updatePE2RegistrationStatus(reg.id, e.target.value as any);
                            }
                          }}
                          className={\`text-xs font-mono font-bold p-1 border \${
                            reg.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                            reg.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-300' :
                            'bg-yellow-100 text-yellow-800 border-yellow-300'
                          } outline-none cursor-pointer\`}
                        >
                          <option value="pending">PENDING</option>
                          <option value="confirmed">CONFIRMED</option>
                          <option value="rejected">REJECTED</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {paginatedPE2Regs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-blue-sail/50 font-mono italic">
                        Tidak ada data yang ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredPE2Regs.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 border-2 border-blue-sail/20">
                <span className="font-mono text-sm text-blue-sail">
                  Menampilkan {(pe2Page - 1) * pe2PageSize + 1} - {Math.min(pe2Page * pe2PageSize, filteredPE2Regs.length)} dari {filteredPE2Regs.length}
                </span>
                <div className="flex items-center gap-4">
                  <select 
                    value={pe2PageSize} 
                    onChange={e => { setPE2PageSize(Number(e.target.value)); setPE2Page(1); }}
                    className="border border-blue-sail/30 font-mono text-sm p-1"
                  >
                    <option value={10}>10 baris</option>
                    <option value={20}>20 baris</option>
                    <option value={50}>50 baris</option>
                    <option value={100}>100 baris</option>
                  </select>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => setPE2Page(p => Math.max(1, p - 1))}
                      disabled={pe2Page === 1}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 border border-gray-300"
                    >
                      &lt;
                    </button>
                    <button 
                      onClick={() => setPE2Page(p => Math.min(Math.ceil(filteredPE2Regs.length / pe2PageSize) || 1, p + 1))}
                      disabled={pe2Page >= (Math.ceil(filteredPE2Regs.length / pe2PageSize) || 1)}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 border border-gray-300"
                    >
                      &gt;
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
`;

content = content.replace(
  `{/* --- 3. STAFF APPLICATIONS --- */}`,
  pe2TableView + '\n        {/* --- 3. STAFF APPLICATIONS --- */}'
);

fs.writeFileSync(path, content, 'utf8');
console.log('Admin.tsx patched successfully');
