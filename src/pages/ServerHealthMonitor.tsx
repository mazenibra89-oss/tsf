import React, { useState, useEffect } from 'react';
import { Icon } from '../components/Icon';

export const ServerHealthMonitor: React.FC = () => {
  const [serverHealth, setServerHealth] = useState<any>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [serverLogsList, setServerLogsList] = useState<any[]>([]);
  const [logFilterLevel, setLogFilterLevel] = useState<string>('all');
  const [logSearchText, setLogSearchText] = useState<string>('');
  const [isCleaningBlobs, setIsCleaningBlobs] = useState(false);
  const [cleanBlobResult, setCleanBlobResult] = useState<string>('');
  const [autoRefreshHealth, setAutoRefreshHealth] = useState(true);

  const fetchServerHealth = async () => {
    setHealthLoading(true);
    try {
      const res = await fetch('/api/system/health');
      if (res.ok) {
        const data = await res.json();
        setServerHealth(data);
      }
    } catch (e) {
      console.error('Failed to fetch server health', e);
    } finally {
      setHealthLoading(false);
    }
  };

  const fetchServerLogs = async (level = logFilterLevel, search = logSearchText) => {
    try {
      const params = new URLSearchParams();
      if (level && level !== 'all') params.append('level', level);
      if (search) params.append('search', search);
      params.append('limit', '300');

      const res = await fetch(`/api/system/logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setServerLogsList(data.logs || []);
      }
    } catch (e) {
      console.error('Failed to fetch server logs', e);
    }
  };

  const handleCleanBlobs = async () => {
    if (!confirm('Peringatan: Aksi ini akan membersihkan data string Base64 lama di database yang membuat memori RAM server membengkak. Lanjutkan?')) return;
    setIsCleaningBlobs(true);
    setCleanBlobResult('');
    try {
      const res = await fetch('/api/system/clean-blobs', { method: 'POST' });
      const data = await res.json();
      setCleanBlobResult(data.message || 'Pembersihan selesai.');
      await fetchServerHealth();
      await fetchServerLogs(logFilterLevel, logSearchText);
    } catch (e: any) {
      setCleanBlobResult('Gagal: ' + e.message);
    } finally {
      setIsCleaningBlobs(false);
    }
  };

  const handleClearLogs = async () => {
    if (!confirm('Yakin ingin membersihkan riwayat log server di memori?')) return;
    try {
      const res = await fetch('/api/system/logs/clear', { method: 'POST' });
      if (res.ok) {
        setServerLogsList([]);
        await fetchServerHealth();
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchServerHealth();
    fetchServerLogs(logFilterLevel, logSearchText);
  }, []);

  useEffect(() => {
    if (autoRefreshHealth) {
      const interval = setInterval(() => {
        fetchServerHealth();
        fetchServerLogs(logFilterLevel, logSearchText);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefreshHealth, logFilterLevel, logSearchText]);

  return (
    <div className="min-h-screen bg-ballroom font-sans text-blue-sail py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Bar */}
        <div className="bg-blue-sail text-ballroom border-4 border-decor p-6 sm:p-8 shadow-[8px_8px_0_0_#BD1B1F] relative overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-10" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-decor text-blue-sail font-display font-black text-xs px-2.5 py-0.5 border border-blue-sail uppercase">
                  OPEN DIAGNOSTIC CONSOLE
                </span>
                <span className="bg-emerald-500 text-white font-mono text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                  NO AUTH REQUIRED
                </span>
              </div>
              <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-decor">
                SERVER HEALTH &amp; LIVE LOG VIEWER
              </h1>
              <p className="text-xs sm:text-sm text-ballroom/80 max-w-2xl leading-relaxed">
                Pemantauan real-time pemakaian memori server, koneksi database, sisa blob Base64 pemicu crash, serta konsol log server langsung dari browser tanpa login.
              </p>
            </div>

            {/* Quick Action Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setAutoRefreshHealth(!autoRefreshHealth)}
                className={`px-4 py-2.5 text-xs font-display font-bold uppercase border-2 flex items-center gap-2 cursor-pointer transition-all ${
                  autoRefreshHealth
                    ? 'bg-emerald-600 text-white border-white shadow-[3px_3px_0_0_#065f46]'
                    : 'bg-white/10 text-white border-white/30 hover:bg-white/20'
                }`}
              >
                <Icon name="RefreshCw" size={14} className={autoRefreshHealth ? 'animate-spin' : ''} />
                <span>Auto-Refresh (5s): {autoRefreshHealth ? 'AKTIF' : 'OFF'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  fetchServerHealth();
                  fetchServerLogs(logFilterLevel, logSearchText);
                }}
                disabled={healthLoading}
                className="bg-decor hover:bg-decor/90 text-blue-sail font-display font-black text-xs uppercase px-5 py-2.5 border-2 border-blue-sail shadow-[4px_4px_0_0_#BD1B1F] flex items-center gap-2 cursor-pointer transition-all"
              >
                <Icon name="RefreshCw" size={14} className={healthLoading ? 'animate-spin' : ''} />
                <span>REFRESH MANUAL</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {serverHealth ? (
          <div className="space-y-6">

            {/* Status Summary Banner */}
            <div className={`p-5 border-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              serverHealth.status === 'healthy'
                ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-[6px_6px_0_0_#059669]'
                : serverHealth.status === 'warning'
                  ? 'bg-amber-50 border-amber-500 text-amber-950 shadow-[6px_6px_0_0_#d97706]'
                  : 'bg-red-50 border-red-inferno text-red-950 shadow-[6px_6px_0_0_#BD1B1F]'
            }`}>
              <div className="flex items-center gap-3">
                <span className={`w-4 h-4 rounded-full shrink-0 ${
                  serverHealth.status === 'healthy'
                    ? 'bg-emerald-500'
                    : serverHealth.status === 'warning'
                      ? 'bg-amber-500 animate-pulse'
                      : 'bg-red-600 animate-ping'
                }`} />
                <div>
                  <span className="font-mono text-[10px] uppercase font-bold tracking-widest block opacity-75">
                    DIAGNOSTIC STATUS
                  </span>
                  <h3 className="font-display font-black text-xl uppercase tracking-tight">
                    {serverHealth.status === 'healthy'
                      ? 'SERVER NORMAL & STABIL'
                      : serverHealth.status === 'warning'
                        ? 'PERINGATAN: RISIKO MEMORI PENUH'
                        : 'KRITIS: POTENSI SERVER DOWN / RESTART'}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono font-bold">
                <span>Uptime: {Math.floor(serverHealth.uptimeSeconds / 3600)} jam {Math.floor((serverHealth.uptimeSeconds % 3600) / 60)} menit</span>
                <span>•</span>
                <span>Diperbarui: {new Date(serverHealth.timestamp).toLocaleTimeString('id-ID')}</span>
              </div>
            </div>

            {/* Core Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* RAM Node.js */}
              <div className="bg-white border-4 border-blue-sail p-5 shadow-[4px_4px_0_0_#2A4C9E] flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-blue-sail/60">RAM PROCESS (RSS)</span>
                  <Icon name="Zap" size={16} className="text-decor" />
                </div>
                <div>
                  <p className="font-display font-black text-3xl text-blue-sail">
                    {serverHealth.processMemory.rssMB} <span className="text-base font-normal">MB</span>
                  </p>
                  <div className="w-full bg-gray-200 h-2.5 mt-2 overflow-hidden border border-blue-sail/30">
                    <div
                      className={`h-full transition-all duration-500 ${
                        serverHealth.processMemory.rssMB > 500
                          ? 'bg-red-500'
                          : serverHealth.processMemory.rssMB > 250
                            ? 'bg-amber-500'
                            : 'bg-blue-sail'
                      }`}
                      style={{ width: `${Math.min(100, (serverHealth.processMemory.rssMB / 1024) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-[10px] font-mono text-blue-sail/70 space-y-0.5 border-t border-blue-sail/10 pt-2">
                  <div className="flex justify-between">
                    <span>Heap Digunakan:</span>
                    <strong>{serverHealth.processMemory.heapUsedMB} MB</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Heap Total:</span>
                    <strong>{serverHealth.processMemory.heapTotalMB} MB</strong>
                  </div>
                </div>
              </div>

              {/* Database Status & Latency */}
              <div className="bg-white border-4 border-blue-sail p-5 shadow-[4px_4px_0_0_#F6BB02] flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-blue-sail/60">STATUS DATABASE</span>
                  <Icon name="Database" size={16} className="text-blue-sail" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${serverHealth.database.status === 'ok' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <p className="font-display font-black text-2xl text-blue-sail uppercase">
                      {serverHealth.database.status === 'ok' ? 'TERHUBUNG' : 'DISCONNECTED'}
                    </p>
                  </div>
                  <p className="font-mono text-sm text-blue-sail mt-1">
                    Latency: <strong className="text-emerald-700">{serverHealth.database.latencyMs} ms</strong>
                  </p>
                </div>
                <div className="text-[10px] font-mono text-blue-sail/70 space-y-0.5 border-t border-blue-sail/10 pt-2">
                  <div className="flex justify-between">
                    <span>Total Pendaftar:</span>
                    <strong>{serverHealth.database.totalRegisteredTeams} Tim</strong>
                  </div>
                  {serverHealth.database.sqliteSizeBytes && (
                    <div className="flex justify-between">
                      <span>Ukuran File DB:</span>
                      <strong>{(serverHealth.database.sqliteSizeBytes / (1024 * 1024)).toFixed(2)} MB</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Host OS Memory */}
              <div className="bg-white border-4 border-blue-sail p-5 shadow-[4px_4px_0_0_#2A4C9E] flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-blue-sail/60">RAM SERVER GLOBAL</span>
                  <Icon name="Sliders" size={16} className="text-blue-sail" />
                </div>
                <div>
                  <p className="font-display font-black text-3xl text-blue-sail">
                    {serverHealth.systemMemory.usedPercent}% <span className="text-base font-normal">Used</span>
                  </p>
                  <p className="text-xs font-mono text-blue-sail/70 mt-1">
                    Free: <strong>{serverHealth.systemMemory.freeMB} MB</strong> dari {serverHealth.systemMemory.totalMB} MB
                  </p>
                </div>
                <div className="text-[10px] font-mono text-blue-sail/70 space-y-0.5 border-t border-blue-sail/10 pt-2">
                  <div className="flex justify-between">
                    <span>CPU Cores:</span>
                    <strong>{serverHealth.cpuCount} Core</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Load Avg:</span>
                    <strong>{(serverHealth.loadAverage || []).map((l: number) => l.toFixed(2)).join(', ') || '-'}</strong>
                  </div>
                </div>
              </div>

              {/* Blob Base64 Tracker */}
              <div className={`border-4 p-5 shadow-[4px_4px_0_0_#8B011A] flex flex-col justify-between space-y-3 ${
                serverHealth.database.base64BlobsDetected > 0
                  ? 'bg-red-50 border-red-inferno text-red-950'
                  : 'bg-emerald-50 border-emerald-600 text-emerald-950'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase opacity-75">DETEKTOR BASE64 DB</span>
                  <Icon name="AlertTriangle" size={16} className={serverHealth.database.base64BlobsDetected > 0 ? 'text-red-inferno' : 'text-emerald-600'} />
                </div>
                <div>
                  <p className="font-display font-black text-3xl">
                    {serverHealth.database.base64BlobsDetected} <span className="text-base font-normal">File</span>
                  </p>
                  <p className="text-xs font-mono mt-1 opacity-80">
                    Est. Ukuran: <strong>{serverHealth.database.approximateBlobKBytes} KB</strong>
                  </p>
                </div>
                <div className="text-[10px] font-mono opacity-80 border-t border-current/20 pt-2">
                  {serverHealth.database.base64BlobsDetected > 0 ? (
                    <span className="bg-red-inferno text-white px-1.5 py-0.5 uppercase font-bold text-[9px]">
                      Pemicu Utama Server Down
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-bold">
                      Database Bersih & Aman
                    </span>
                  )}
                </div>
              </div>

            </div>

            {/* Base64 Cleaning Tool Banner */}
            {serverHealth.database.base64BlobsDetected > 0 && (
              <div className="bg-amber-50 border-4 border-amber-500 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-[6px_6px_0_0_#d97706]">
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex items-center gap-2">
                    <Icon name="AlertTriangle" size={20} className="text-amber-800 shrink-0" />
                    <h4 className="font-display font-black text-base uppercase text-amber-950">
                      TINDAKAN PERBAIKAN: DITEMUKAN {serverHealth.database.base64BlobsDetected} BERKAS BASE64 DI DALAM DATABASE
                    </h4>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed font-sans">
                    Data file Base64 yang pernah diunggah peserta sebelum sistem beralih ke link Google Drive masih tersimpan di kolom tabel database. Ketika pengunjung memuat data web, payload ini ikut ditarik dan menyebabkan pemakaian RAM server melompat drastis hingga Node.js crash. Klik tombol di samping untuk menormalkan data tersebut.
                  </p>
                  {cleanBlobResult && (
                    <div className="mt-2 p-2 bg-white border-2 border-emerald-500 text-xs font-mono font-bold text-emerald-800 inline-block">
                      ✓ {cleanBlobResult}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleCleanBlobs}
                  disabled={isCleaningBlobs}
                  className="bg-red-inferno hover:bg-red-700 text-white font-display font-black text-xs uppercase px-6 py-4 border-2 border-blue-sail shadow-[4px_4px_0_0_#2A4C9E] shrink-0 cursor-pointer flex items-center gap-2 transition-all active:translate-x-0.5 active:translate-y-0.5"
                >
                  <Icon name="Trash2" size={16} />
                  <span>{isCleaningBlobs ? 'SEDANG MEMBERSIHKAN...' : 'BERSIHKAN BASE64 DI DB SEKARANG'}</span>
                </button>
              </div>
            )}

            {/* Runtime System Info Card */}
            <div className="bg-white border-4 border-blue-sail p-6 shadow-[6px_6px_0_0_#2A4C9E] space-y-4">
              <div className="flex items-center justify-between border-b-2 border-blue-sail/20 pb-3">
                <h3 className="font-display font-black text-sm uppercase text-blue-sail flex items-center gap-2">
                  <Icon name="Wrench" size={16} />
                  <span>INFORMASI LINGKUNGAN RUNTIME SERVER</span>
                </h3>
                <span className="font-mono text-[10px] text-blue-sail/60 uppercase">
                  Platform: {serverHealth.platform}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div className="bg-blue-sail/5 p-3 border border-blue-sail/20">
                  <span className="text-[10px] text-blue-sail/60 uppercase block font-bold">Node.js Version</span>
                  <strong className="text-blue-sail text-sm">{serverHealth.nodeVersion}</strong>
                </div>
                <div className="bg-blue-sail/5 p-3 border border-blue-sail/20">
                  <span className="text-[10px] text-blue-sail/60 uppercase block font-bold">CPU Core Count</span>
                  <strong className="text-blue-sail text-sm">{serverHealth.cpuCount} Core</strong>
                </div>
                <div className="bg-blue-sail/5 p-3 border border-blue-sail/20">
                  <span className="text-[10px] text-blue-sail/60 uppercase block font-bold">Captured Logs</span>
                  <strong className="text-blue-sail text-sm">{serverHealth.logsSummary.totalCaptured} baris</strong>
                </div>
                <div className="bg-blue-sail/5 p-3 border border-blue-sail/20">
                  <span className="text-[10px] text-blue-sail/60 uppercase block font-bold">Error Count</span>
                  <strong className={`text-sm ${serverHealth.logsSummary.errors > 0 ? 'text-red-inferno font-black' : 'text-emerald-700'}`}>
                    {serverHealth.logsSummary.errors} Error
                  </strong>
                </div>
              </div>
            </div>

            {/* Live Terminal Log Console */}
            <div className="bg-gray-950 border-4 border-blue-sail shadow-[8px_8px_0_0_#BD1B1F] p-5 sm:p-6 space-y-4">
              
              {/* Terminal Header & Filter Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
                  </div>
                  <span className="font-mono text-xs text-gray-200 font-bold uppercase tracking-wider">
                    TERMINAL LOG SERVER APLIKASI (LIVE CAPTURE)
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={logFilterLevel}
                    onChange={e => {
                      const val = e.target.value;
                      setLogFilterLevel(val);
                      fetchServerLogs(val, logSearchText);
                    }}
                    className="bg-gray-900 border border-gray-700 text-xs font-mono text-gray-200 px-3 py-1.5 outline-none cursor-pointer"
                  >
                    <option value="all">Semua Level</option>
                    <option value="error">Hanya Error</option>
                    <option value="warn">Hanya Warning</option>
                    <option value="info">Hanya Info</option>
                  </select>

                  <input
                    type="text"
                    value={logSearchText}
                    onChange={e => {
                      const val = e.target.value;
                      setLogSearchText(val);
                      fetchServerLogs(logFilterLevel, val);
                    }}
                    placeholder="Filter teks log..."
                    className="bg-gray-900 border border-gray-700 text-xs font-mono text-gray-200 px-3 py-1.5 outline-none w-36 sm:w-56 focus:border-decor"
                  />

                  <button
                    type="button"
                    onClick={handleClearLogs}
                    className="bg-gray-800 hover:bg-red-900 text-gray-300 hover:text-white text-xs font-mono px-3 py-1.5 border border-gray-600 cursor-pointer transition-colors"
                  >
                    Clear Log
                  </button>
                </div>
              </div>

              {/* Terminal Logs Output Box */}
              <div className="font-mono text-xs text-green-400 bg-black/95 p-4 sm:p-5 border border-gray-800 max-h-[480px] overflow-y-auto space-y-1.5 leading-relaxed selection:bg-emerald-800 selection:text-white">
                {serverLogsList.length === 0 ? (
                  <div className="text-gray-500 italic py-8 text-center space-y-2">
                    <Icon name="Inbox" size={24} className="mx-auto opacity-40" />
                    <p>Tidak ada log yang tercatat atau log sesuai filter tidak ditemukan.</p>
                  </div>
                ) : (
                  serverLogsList.map((log) => {
                    const timeStr = new Date(log.timestamp).toLocaleTimeString('id-ID');
                    const isErr = log.level === 'error';
                    const isWarn = log.level === 'warn';

                    return (
                      <div
                        key={log.id}
                        className={`flex items-start gap-2 border-b border-gray-900/80 pb-1.5 ${
                          isErr ? 'text-red-400 bg-red-950/20 px-1' : isWarn ? 'text-yellow-300' : 'text-emerald-300'
                        }`}
                      >
                        <span className="text-gray-500 text-[10px] shrink-0 font-sans select-none">
                          [{timeStr}]
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.2 shrink-0 ${
                            isErr
                              ? 'bg-red-900 text-white'
                              : isWarn
                                ? 'bg-yellow-900 text-yellow-100'
                                : 'bg-emerald-950 text-emerald-300'
                          }`}
                        >
                          {log.level}
                        </span>
                        <span className="break-all whitespace-pre-wrap flex-1">
                          {log.message}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Terminal Footer Info */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[11px] font-mono text-gray-400 pt-2 border-t border-gray-800/80 gap-2">
                <span>
                  Menampilkan <strong>{serverLogsList.length}</strong> entri log terakhir (Maksimal 500 entri dalam in-memory ring buffer)
                </span>
                <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  LIVE LOG CAPTURE ACTIVE
                </span>
              </div>
            </div>

          </div>
        ) : (
          <div className="text-center py-20 bg-white border-4 border-blue-sail space-y-4">
            <Icon name="Loader2" size={36} className="animate-spin text-blue-sail mx-auto" />
            <p className="font-display font-bold text-base uppercase text-blue-sail">
              Sedang mengambil data kesehatan server & log dari backend...
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
