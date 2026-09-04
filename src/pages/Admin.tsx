import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/Icon';
import { TablePagination } from '../components/TablePagination';
import { Division, ThriftProduct, ThriftVendor, FormQuestionsConfig, QuestionConfig } from '../types';

const SerializedAnswersViewer: React.FC<{ serializedText: string }> = ({ serializedText }) => {
  if (!serializedText) {
    return <p className="text-xs text-blue-sail/50 italic">Belum mengisi jawaban.</p>;
  }

  // If it's not a serialized answer, just render it as is
  if (!serializedText.includes('[PERTANYAAN')) {
    return (
      <div className="bg-white p-3 border border-blue-sail/10 text-xs font-medium text-blue-sail whitespace-pre-wrap">
        {serializedText}
      </div>
    );
  }

  const blocks = serializedText.split(/\[PERTANYAAN\s+\d+\]/i);
  const parsed: { question: string; answer: string }[] = [];

  blocks.forEach((block) => {
    const trimmed = block.trim();
    if (!trimmed) return;

    const parts = trimmed.split(/\[JAWABAN\]/i);
    const question = parts[0]?.trim() || 'Pertanyaan';
    const answer = parts[1]?.trim() || '-';
    parsed.push({ question, answer });
  });

  return (
    <div className="space-y-4 font-sans text-left">
      {parsed.map((item, idx) => {
        const isStudyCase = item.question.toLowerCase().includes('study case:');
        let displayQuestion = item.question;
        if (isStudyCase) {
          displayQuestion = item.question.replace(/^study case:\s*/i, '');
        }

        return (
          <div key={idx} className="bg-white border-2 border-blue-sail/10 hover:border-blue-sail/20 transition-all p-4 space-y-3 shadow-[3px_3px_0_0_rgba(42,76,158,0.05)]">
            {/* Header / Question Part */}
            <div className="space-y-1.5 border-b border-blue-sail/5 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="bg-blue-sail text-white font-mono text-[9px] font-bold px-1.5 py-0.5 border border-blue-sail">
                  Q{idx + 1}
                </span>
                {isStudyCase && (
                  <span className="bg-red-inferno text-white font-mono text-[8px] font-bold px-1.5 py-0.5 border border-red-inferno tracking-wider">
                    STUDY CASE
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-blue-sail uppercase tracking-wide leading-relaxed">
                {displayQuestion}
              </p>
            </div>

            {/* Answer Part */}
            <div className="bg-blue-sail/5 p-3 border-l-4 border-blue-sail/50 space-y-1">
              <p className="text-[10px] font-bold text-blue-sail/40 uppercase tracking-wide font-mono">Jawaban Pelamar:</p>
              <p className="text-xs text-blue-sail font-medium leading-relaxed whitespace-pre-wrap italic">
                "{item.answer}"
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const parseQuestionText = (text: string) => {
  const isStudyCase = text.toLowerCase().startsWith('study case:');
  let cleanText = text;
  if (isStudyCase) {
    cleanText = text.replace(/^study case:\s*/i, '');
  }

  // Support explicit delimiters '|||'
  if (cleanText.includes('|||')) {
    const parts = cleanText.split('|||');
    const background = parts[0]?.trim() || '';
    const rawQuestions = parts[1]?.trim() || '';
    const questions = rawQuestions
      .split('\n')
      .map(q => q.trim())
      .filter(Boolean);

    return {
      isStudyCase,
      background,
      questions,
      listItems: [],
      hasContent: text.trim().length > 0
    };
  }

  // No delimiter: return cleanText as a single question
  return {
    isStudyCase,
    background: '',
    questions: [cleanText.trim()],
    listItems: [],
    hasContent: text.trim().length > 0
  };
};

const FormattedQuestionPreview: React.FC<{ text: string }> = ({ text }) => {
  const parsed = parseQuestionText(text);

  if (!parsed.hasContent) return null;

  return (
    <div className="mt-2 space-y-2 p-3 bg-blue-sail/[0.03] border-2 border-dashed border-red-inferno/30 text-[11px] text-blue-sail animate-fadeIn">
      <div className="font-bold text-red-inferno uppercase font-mono tracking-wider flex items-center gap-1">
        <span>🚨 PREVIEW TAMPILAN STUDY CASE (DI FORM)</span>
      </div>
      
      {parsed.background && (
        <div className="bg-white p-2 border border-blue-sail/10">
          <span className="font-mono text-[8px] font-bold text-blue-sail/45 block uppercase mb-1">Konteks / Skenario:</span>
          <p className="whitespace-pre-line text-blue-sail/90 leading-normal font-medium">{parsed.background}</p>
        </div>
      )}

      {parsed.listItems.length > 0 && (
        <div className="space-y-1 bg-white p-2 border border-blue-sail/10">
          <span className="font-mono text-[8px] font-bold text-blue-sail/45 block uppercase">Daftar Kendala / Masalah:</span>
          <ul className="list-decimal list-inside space-y-0.5 text-blue-sail/90 leading-normal font-medium">
            {parsed.listItems.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {parsed.questions.length > 0 && (
        <div className="bg-red-inferno/5 border border-red-inferno/10 p-2 text-blue-sail font-semibold">
          <span className="font-mono text-[8px] font-bold text-red-inferno block uppercase mb-1">Tugas & Instruksi Penyelesaian:</span>
          <div className="space-y-1">
            {parsed.questions.map((q, idx) => (
              <p key={idx}>{parsed.questions.length > 1 ? `${idx + 1}. ` : ''}{q}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const Admin: React.FC = () => {
  const {
    phases,
    divisions,
    staffApplications,
    ambassadorApplications,
    pe1Registrations,
    refreshState,
    subEvents,
    competitions,
    competitionRegistrations,
    thriftProducts,
    thriftVendors,
    vendorApplications,
    setActivePhase,
    addDivision,
    updateDivision,
    deleteDivision,
    addThriftVendor,
    updateThriftVendor,
    deleteThriftVendor,
    addThriftProduct,
    updateThriftProduct,
    deleteThriftProduct,
    updateStaffApplicationStatus,
    updateStaffApplicationBerkas,
    updateAmbassadorApplicationStatus,
    updatePE1RegistrationStatus,
    formQuestions,
    updateFormQuestions,
    resetToDefault,
    adminUsers,
    fetchAdminUsers,
    fetchStaffApplications,
    fetchAmbassadorApplications,
    fetchPE1Registrations,
    fetchCompetitionRegistrations,
    updateCompetitionRegistrationStatus,
    metrics,
    loading
  } = useApp();

  const [tabLoading, setTabLoading] = useState(false);
  const [adminUsersList, setAdminUsersList] = useState<import('../types').User[]>([]);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [adminAccounts, setAdminAccounts] = useState<{username: string}[]>([]);
  const [selectedCompDetail, setSelectedCompDetail] = useState<import('../types').CompetitionRegistration | null>(null);
  const [viewingFile, setViewingFile] = useState<{ url: string; title: string; fileName?: string } | null>(null);

  // Filter States for Competition Registrations
  const [compFilterType, setCompFilterType] = useState<'all' | 'BPC' | 'BCC'>('all');
  const [compFilterCategory, setCompFilterCategory] = useState<'all' | 'SMA/Sederajat' | 'Mahasiswa'>('all');
  const [compFilterPreliminary, setCompFilterPreliminary] = useState<'all' | 'pending' | 'passed' | 'rejected'>('all');
  const [compFilterPayment, setCompFilterPayment] = useState<'all' | 'none' | 'pending' | 'verified'>('all');
  const [compFilterSemifinal, setCompFilterSemifinal] = useState<'all' | 'pending' | 'passed' | 'rejected'>('all');
  const [compFilterFinal, setCompFilterFinal] = useState<'all' | 'pending' | 'passed' | 'rejected'>('all');
  const [compSearchQuery, setCompSearchQuery] = useState('');

  const SAMPLE_DOC_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%232A4C9E"/><rect x="20" y="20" width="560" height="360" fill="%23FFF" stroke="%23F6BB02" stroke-width="4"/><text x="50%" y="80" font-family="sans-serif" font-size="22" font-weight="bold" fill="%232A4C9E" text-anchor="middle">TDC SUMMIT FEST 2026</text><text x="50%" y="120" font-family="sans-serif" font-size="16" font-weight="bold" fill="%23BD1B1F" text-anchor="middle">BERKAS PRATINJAU PENDAFTARAN KOMPETISI</text><line x1="50" y1="140" x2="550" y2="140" stroke="%232A4C9E" stroke-width="2"/><text x="60" y="180" font-family="sans-serif" font-size="14" fill="%23333">Status Berkas: Terverifikasi Sistem</text><text x="60" y="220" font-family="sans-serif" font-size="14" fill="%23333">Tipe Berkas: Kartu Identitas / KTM / Persyaratan Lomba</text><text x="60" y="260" font-family="sans-serif" font-size="14" fill="%23333">Status Validasi: Sesuai Ketentuan Pedoman</text><rect x="60" y="300" width="480" height="40" fill="%23F6BB02"/><text x="50%" y="325" font-family="sans-serif" font-size="14" font-weight="bold" fill="%232A4C9E" text-anchor="middle">DOC VERIFIED BY TDC COMMITTEE 2026</text></svg>`;

  const getParsedLeader = (reg: any) => {
    if (!reg || !reg.leader_data) return {};
    if (typeof reg.leader_data === 'string') {
      try { return JSON.parse(reg.leader_data); } catch { return {}; }
    }
    return reg.leader_data || {};
  };

  const getParsedMembers = (reg: any) => {
    if (!reg || !reg.members_data) return [];
    if (typeof reg.members_data === 'string') {
      try { return JSON.parse(reg.members_data); } catch { return []; }
    }
    return Array.isArray(reg.members_data) ? reg.members_data : [];
  };

  const openDoc = (fileUrl?: string, docTitle?: string, fileName?: string) => {
    if (!fileUrl) {
      alert(`Berkas "${docTitle || 'Dokumen'}" belum diunggah.`);
      return;
    }
    
    // Jika URL adalah link (seperti Google Drive), buka di tab baru karena iframe Google Drive akan diblokir
    if (fileUrl.startsWith('http')) {
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    
    // Jika Base64 (kode lama), gunakan modal iframe
    setViewingFile({
      url: fileUrl,
      title: docTitle || 'Pratinjau Berkas',
      fileName: fileName || 'berkas_pendaftaran.pdf'
    });
  };

  useEffect(() => {
    refreshState();
    setIsFetchingUsers(true);
    fetchAdminUsers()
      .then(res => {
        if (res && res.length > 0) setAdminUsersList(res);
      })
      .finally(() => setIsFetchingUsers(false));
  }, [isAuthenticated]);

  useEffect(() => {
    if (adminUsers && adminUsers.length > 0) {
      setAdminUsersList(adminUsers);
    }
  }, [adminUsers]);

  useEffect(() => {
    const token = localStorage.getItem('tsf_admin_token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    const fetchAdmins = async () => {
      if (!isAuthenticated) return;
      try {
        const token = localStorage.getItem('tsf_admin_token');
        const res = await fetch('/api/auth/admins', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAdminAccounts(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAdmins();
  }, [isAuthenticated]);

  // Active sub-dashboard section tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'ambassadors' | 'pe1' | 'staff' | 'competitions' | 'accounts' | 'divisions' | 'form-control' | 'server-health' | 'user-accounts'>('overview');

  // ON-DEMAND (LAZY) DATA LOADING BY ACTIVE TAB
  useEffect(() => {
    if (!isAuthenticated) return;

    if (activeTab === 'staff' && staffApplications.length === 0) {
      setTabLoading(true);
      fetchStaffApplications().finally(() => setTabLoading(false));
    } else if (activeTab === 'ambassadors' && (!ambassadorApplications || ambassadorApplications.length === 0)) {
      setTabLoading(true);
      fetchAmbassadorApplications().finally(() => setTabLoading(false));
    } else if (activeTab === 'pe1' && (!pe1Registrations || pe1Registrations.length === 0)) {
      setTabLoading(true);
      fetchPE1Registrations().finally(() => setTabLoading(false));
    } else if (activeTab === 'competitions' && competitionRegistrations.length === 0) {
      setTabLoading(true);
      fetchCompetitionRegistrations().finally(() => setTabLoading(false));
    } else if (activeTab === 'user-accounts' && adminUsersList.length === 0) {
      setIsFetchingUsers(true);
      fetchAdminUsers()
        .then(res => { if (res) setAdminUsersList(res); })
        .finally(() => setIsFetchingUsers(false));
    }
  }, [activeTab, isAuthenticated]);

  // Server Health & Logs State
  const [serverHealth, setServerHealth] = useState<any>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [serverLogsList, setServerLogsList] = useState<any[]>([]);
  const [logFilterLevel, setLogFilterLevel] = useState<string>('all');
  const [logSearchText, setLogSearchText] = useState<string>('');
  const [isCleaningBlobs, setIsCleaningBlobs] = useState(false);
  const [cleanBlobResult, setCleanBlobResult] = useState<string>('');
  const [autoRefreshHealth, setAutoRefreshHealth] = useState(false);

  // Staff Applications Filtering, Sorting & Pagination States
  const [filterDivision, setFilterDivision] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [searchStaffQuery, setSearchStaffQuery] = useState<string>('');
  const [staffSortField, setStaffSortField] = useState<'name' | 'date' | 'status' | 'nim'>('date');
  const [staffSortOrder, setStaffSortOrder] = useState<'asc' | 'desc'>('desc');
  const [staffPage, setStaffPage] = useState<number>(1);
  const [staffPageSize, setStaffPageSize] = useState<number>(10);

  // Ambassador Applications Filtering, Sorting & Pagination States
  const [filterAmbassadorRole, setFilterAmbassadorRole] = useState<string>('');
  const [filterAmbassadorStatus, setFilterAmbassadorStatus] = useState<string>('');
  const [searchAmbassadorQuery, setSearchAmbassadorQuery] = useState<string>('');
  const [ambassadorSortField, setAmbassadorSortField] = useState<'name' | 'date' | 'status' | 'role'>('date');
  const [ambassadorSortOrder, setAmbassadorSortOrder] = useState<'asc' | 'desc'>('desc');
  const [ambassadorPage, setAmbassadorPage] = useState<number>(1);
  const [ambassadorPageSize, setAmbassadorPageSize] = useState<number>(10);
  const [selectedAmbassadorApp, setSelectedAmbassadorApp] = useState<any>(null);

  // PE1 Registrations Filtering, Sorting & Pagination States
  const [filterPE1Package, setFilterPE1Package] = useState<string>('');
  const [filterPE1Status, setFilterPE1Status] = useState<string>('');
  const [searchPE1Query, setSearchPE1Query] = useState<string>('');
  const [pe1SortField, setPE1SortField] = useState<'name' | 'date' | 'status' | 'package'>('date');
  const [pe1SortOrder, setPE1SortOrder] = useState<'asc' | 'desc'>('desc');
  const [pe1Page, setPE1Page] = useState<number>(1);
  const [pe1PageSize, setPE1PageSize] = useState<number>(10);
  const [selectedPE1Reg, setSelectedPE1Reg] = useState<any>(null);

  // Competition Registrations Sorting & Pagination States
  const [compSortField, setCompSortField] = useState<'date' | 'team_name' | 'leader_name' | 'institution' | 'type' | 'status'>('date');
  const [compSortOrder, setCompSortOrder] = useState<'asc' | 'desc'>('desc');
  const [compPage, setCompPage] = useState<number>(1);
  const [compPageSize, setCompPageSize] = useState<number>(10);

  // Vendor Applications Search, Sorting & Pagination States
  const [vendorSearchQuery, setVendorSearchQuery] = useState<string>('');
  const [vendorSortField, setVendorSortField] = useState<'name' | 'date' | 'category'>('date');
  const [vendorSortOrder, setVendorSortOrder] = useState<'asc' | 'desc'>('desc');
  const [vendorPage, setVendorPage] = useState<number>(1);
  const [vendorPageSize, setVendorPageSize] = useState<number>(10);

  // User Accounts Search, Sorting & Pagination States
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');
  const [userSortField, setUserSortField] = useState<'name' | 'email' | 'date' | 'provider' | 'created_at'>('date');
  const [userSortOrder, setUserSortOrder] = useState<'asc' | 'desc'>('desc');
  const [userPage, setUserPage] = useState<number>(1);
  const [userPageSize, setUserPageSize] = useState<number>(10);

  // Admin CMS Accounts Search, Sorting & Pagination States
  const [adminAccSearchQuery, setAdminAccSearchQuery] = useState<string>('');
  const [adminAccSortOrder, setAdminAccSortOrder] = useState<'asc' | 'desc'>('asc');
  const [adminAccPage, setAdminAccPage] = useState<number>(1);
  const [adminAccPageSize, setAdminAccPageSize] = useState<number>(10);

  // Form Questions Config states
  const [formSubTab, setFormSubTab] = useState<'dataDiri' | 'generalTask' | 'berkas' | 'divisionTasks'>('dataDiri');
  const [localFormConfig, setLocalFormConfig] = useState<FormQuestionsConfig | null>(null);
  const [selectedConfigDivision, setSelectedConfigDivision] = useState<string>('');

  const getSelectableDivisionTaskKeys = () => {
    const keys = new Set<string>();

    divisions.forEach(div => {
      if (div.sub_divisions && div.sub_divisions.length > 0) {
        div.sub_divisions.forEach(sub => {
          const subName = typeof sub === 'string' ? sub : sub.name;
          keys.add(subName);
        });
      } else {
        keys.add(div.name);
      }
    });

    if (localFormConfig) {
      Object.keys(localFormConfig.divisionTasks).forEach(key => keys.add(key));
    }

    return Array.from(keys);
  };

  useEffect(() => {
    if (formQuestions) {
      setLocalFormConfig(JSON.parse(JSON.stringify(formQuestions)));
    }
  }, [formQuestions, activeTab]);

  useEffect(() => {
    if (!localFormConfig) return;

    const keys = getSelectableDivisionTaskKeys();
    if (!selectedConfigDivision || !keys.includes(selectedConfigDivision)) {
      setSelectedConfigDivision(keys[0] || '');
    }
  }, [localFormConfig, divisions, selectedConfigDivision]);

  const handleDataDiriChange = (id: string, field: 'label' | 'placeholder' | 'required', value: any) => {
    if (!localFormConfig) return;
    setLocalFormConfig(prev => {
      if (!prev) return null;
      const updated = prev.dataDiri.map(item => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      });
      return { ...prev, dataDiri: updated };
    });
  };

  const handleAddDataDiriField = () => {
    if (!localFormConfig) return;
    const newField = {
      id: `custom-${Date.now()}`,
      label: 'Pertanyaan baru',
      type: 'text' as const,
      placeholder: 'Isi jawaban di sini...',
      required: true
    };

    setLocalFormConfig(prev => {
      if (!prev) return null;
      return { ...prev, dataDiri: [...prev.dataDiri, newField] };
    });
  };

  const handleDeleteDataDiriField = (id: string) => {
    if (!localFormConfig) return;
    setLocalFormConfig(prev => {
      if (!prev) return null;
      return { ...prev, dataDiri: prev.dataDiri.filter(item => item.id !== id) };
    });
  };

  const handleGeneralTaskChange = (id: string, field: 'text' | 'placeholder' | 'required', value: any) => {
    if (!localFormConfig) return;
    setLocalFormConfig(prev => {
      if (!prev) return null;
      const updated = prev.generalTask.map(item => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      });
      return { ...prev, generalTask: updated };
    });
  };

  const handleAddGeneralTaskQuestion = () => {
    if (!localFormConfig) return;
    const newQuestion: QuestionConfig = {
      id: `custom-${Date.now()}`,
      text: 'Pertanyaan baru...',
      type: 'text',
      placeholder: 'Tuliskan jawaban Anda di sini...',
      required: true
    };

    setLocalFormConfig(prev => {
      if (!prev) return null;
      return { ...prev, generalTask: [...prev.generalTask, newQuestion] };
    });
  };

  const handleDeleteGeneralTaskQuestion = (id: string) => {
    if (!localFormConfig) return;
    setLocalFormConfig(prev => {
      if (!prev) return null;
      return { ...prev, generalTask: prev.generalTask.filter(item => item.id !== id) };
    });
  };

  const handleBerkasChange = (id: string, field: 'label' | 'placeholder' | 'required', value: any) => {
    if (!localFormConfig) return;
    setLocalFormConfig(prev => {
      if (!prev) return null;
      const updated = prev.berkas.map(item => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      });
      return { ...prev, berkas: updated };
    });
  };

  const handleAddBerkasField = () => {
    if (!localFormConfig) return;
    const newField = {
      id: `custom-${Date.now()}`,
      label: 'Berkas tambahan',
      type: 'text' as const,
      placeholder: 'Contoh: drive.google.com/...',
      required: true
    };

    setLocalFormConfig(prev => {
      if (!prev) return null;
      return { ...prev, berkas: [...prev.berkas, newField] };
    });
  };

  const handleDeleteBerkasField = (id: string) => {
    if (!localFormConfig) return;
    setLocalFormConfig(prev => {
      if (!prev) return null;
      return { ...prev, berkas: prev.berkas.filter(item => item.id !== id) };
    });
  };

  const handleDivisionQuestionChange = (divName: string, qId: string, field: 'text' | 'type' | 'options' | 'required', value: any) => {
    if (!localFormConfig) return;
    setLocalFormConfig(prev => {
      if (!prev) return null;
      const questions = prev.divisionTasks[divName] || [];
      const updatedQuestions = questions.map(q => {
        if (q.id === qId) {
          if (field === 'options') {
            const opts = typeof value === 'string' ? value.split(',').map((s: string) => s.trim()).filter(Boolean) : value;
            return { ...q, options: opts };
          }
          return { ...q, [field]: value };
        }
        return q;
      });
      return {
        ...prev,
        divisionTasks: {
          ...prev.divisionTasks,
          [divName]: updatedQuestions
        }
      };
    });
  };

  const handleAddDivisionQuestion = (divName: string) => {
    if (!localFormConfig) return;
    const newQuestion: QuestionConfig = {
      id: `q-${Date.now()}`,
      text: 'Pertanyaan baru...',
      type: 'text'
    };
    setLocalFormConfig(prev => {
      if (!prev) return null;
      const questions = prev.divisionTasks[divName] || [];
      return {
        ...prev,
        divisionTasks: {
          ...prev.divisionTasks,
          [divName]: [...questions, newQuestion]
        }
      };
    });
  };

  const handleDeleteDivisionQuestion = (divName: string, qId: string) => {
    if (!localFormConfig) return;
    setLocalFormConfig(prev => {
      if (!prev) return null;
      const questions = prev.divisionTasks[divName] || [];
      return {
        ...prev,
        divisionTasks: {
          ...prev.divisionTasks,
          [divName]: questions.filter(q => q.id !== qId)
        }
      };
    });
  };

  const handleSaveFormConfig = () => {
    if (!localFormConfig) return;
    updateFormQuestions(localFormConfig);
    alert('Pengaturan pertanyaan form berhasil disimpan!');
  };

  // Selected applicant detail modal state
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);

  // Modal / Form state for Div CRUD
  const [isDivModalOpen, setIsDivModalOpen] = useState(false);
  const [divForm, setDivForm] = useState<{
    id: string;
    name: string;
    description: string;
    quota: number;
    icon_name: string;
    sub_divisions: any[];
    jobdesk: string[];
    skills: string;
  }>({
    id: '',
    name: '',
    description: '',
    quota: 0,
    icon_name: 'Users',
    sub_divisions: [],
    jobdesk: [],
    skills: ''
  });

  // Modal / Form state for Thrift Prod CRUD
  const [isProdModalOpen, setIsProdModalOpen] = useState(false);
  const [prodForm, setProdForm] = useState({ id: '', name: '', price: 100000, condition: '9/10', category: 'clothing', image_url: '', vendor_id: '', status: 'available' as const });

  // Modal / Form state for Thrift Vendor CRUD
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [vendorFormState, setVendorFormState] = useState({ id: '', vendor_name: '', booth_location: '', contact: '', status: 'active' as const });
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('tsf_admin_token', data.token);
        localStorage.setItem('tsf_admin_username', data.username);
        setIsAuthenticated(true);
        setLoginError('');
      } else {
        const data = await res.json();
        setLoginError(data.message || 'Username atau kata sandi salah!');
      }
    } catch (err) {
      setLoginError('Koneksi ke server gagal.');
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('tsf_admin_token');
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => {});
    } catch (err) {}

    localStorage.removeItem('tsf_admin_token');
    localStorage.removeItem('tsf_admin_username');
    setIsAuthenticated(false);
  };

  // Server Health & Logs Fetchers
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
      params.append('limit', '250');

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
    if (!confirm('Peringatan: Aksi ini akan membersihkan berkas string base64 berat yang lama tersimpan di database dan menggantinya dengan penanda aman. Lanjutkan?')) return;
    setIsCleaningBlobs(true);
    setCleanBlobResult('');
    try {
      const res = await fetch('/api/system/clean-blobs', { method: 'POST' });
      const data = await res.json();
      setCleanBlobResult(data.message || 'Pembersihan selesai.');
      await fetchServerHealth();
    } catch (e: any) {
      setCleanBlobResult('Gagal: ' + e.message);
    } finally {
      setIsCleaningBlobs(false);
    }
  };

  const handleClearLogs = async () => {
    if (!confirm('Yakin ingin membersihkan tampilan riwayat log server?')) return;
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
    if (activeTab === 'server-health' && isAuthenticated) {
      fetchServerHealth();
      fetchServerLogs(logFilterLevel, logSearchText);
    }
  }, [activeTab, isAuthenticated]);

  useEffect(() => {
    if (activeTab === 'server-health' && autoRefreshHealth) {
      const interval = setInterval(() => {
        fetchServerHealth();
        fetchServerLogs(logFilterLevel, logSearchText);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab, autoRefreshHealth, logFilterLevel, logSearchText]);

  // CSV Exporter Helper
  const downloadCSV = (filename: string, headers: string[], rows: string[][]) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportStaffCSV = () => {
    const headers = ['Nama Lengkap', 'NRP', 'Fakultas', 'Departemen', 'Jurusan', 'No WA', 'Email', 'Divisi P1', 'Divisi P2', 'Motivasi', 'Folder Google Drive', 'Status', 'Tanggal Daftar'];
    const rows = filteredStaffApplications.map(app => [
      app.full_name,
      app.nim,
      app.faculty || '-',
      app.department || '-',
      app.major,
      app.phone,
      app.email,
      app.division_priority_1,
      app.division_priority_2,
      app.motivation,
      app.drive_folder_link || '-',
      app.status,
      new Date(app.submitted_at).toLocaleDateString('id-ID')
    ]);
    downloadCSV('TSF_Pendaftar_Staff.csv', headers, rows);
  };

  const exportCompCSV = () => {
    const headers = ['Nama Tim', 'Ketua Tim', 'Anggota', 'Instansi', 'No WA', 'Email', 'Cabang Kompetisi', 'Bukti Transfer', 'Tanggal Daftar'];
    const rows = competitionRegistrations.map(reg => {
      const comp = competitions.find(c => c.id === reg.category_id);
      return [
        reg.team_name,
        reg.leader_name,
        reg.members.join(', '),
        reg.institution,
        reg.contact,
        reg.email,
        comp ? comp.title : 'Kategori Tidak Ditemukan',
        reg.payment_proof_url,
        new Date(reg.submitted_at).toLocaleDateString('id-ID')
      ];
    });
    downloadCSV('TSF_Pendaftar_Kompetisi.csv', headers, rows);
  };

  const exportVendorCSV = () => {
    const headers = ['Nama Brand', 'Kontak WA', 'Kategori', 'Katalog/Deskripsi', 'Tanggal Daftar'];
    const rows = vendorApplications.map(app => [
      app.vendor_name,
      app.contact,
      app.product_category,
      app.description,
      new Date(app.submitted_at).toLocaleDateString('id-ID')
    ]);
    downloadCSV('TSF_Sewa_Booth_Vendor.csv', headers, rows);
  };

  const exportAmbassadorCSV = () => {
    const headers = [
      'Peran Pilihan', 'Nama Lengkap', 'Email', 'No WA', 'NRP/Kelas', 'Departemen/Sekolah', 'Fakultas',
      'Instagram', 'TikTok', 'Folder Drive', 'Reels Video', 'Komitmen Skala', 'Alasan Komitmen',
      'Strategi Promosi', 'Jenis Konten', 'Harapan', 'Sumber Info', 'Status', 'Tanggal Daftar'
    ];
    const rows = (ambassadorApplications || []).map(app => [
      app.role_choice,
      app.full_name,
      app.email,
      app.whatsapp,
      app.nrp || app.grade_class || '-',
      app.department || app.school || '-',
      app.faculty || '-',
      app.instagram || '-',
      app.tiktok || '-',
      app.drive_folder_url,
      app.reels_video_url,
      app.q4_commitment_scale || '-',
      app.q5_commitment_reason || '-',
      app.q6_promotion_strategy || '-',
      app.q7_content_type_strategy || '-',
      app.q8_additional_benefits || '-',
      app.q9_info_source === 'Teman' ? `Teman: ${app.q9_info_source_friend}` : (app.q9_info_source || '-'),
      app.status,
      new Date(app.submitted_at).toLocaleDateString('id-ID')
    ]);
    downloadCSV('TSF_Pendaftar_Ambassador_Influencer.csv', headers, rows);
  };

  const exportPE1CSV = () => {
    const headers = [
      'ID', 'Nama Lengkap', 'Email', 'No WhatsApp', 'Status Saat Ini', 'Instansi', 'Jurusan', 'Kota',
      'Paket Bundling', 'Instagram Username', 'Link Drive Bukti Social', 'Metode Bayar', 'Link Drive Bukti Bayar',
      'Status Pendaftaran', 'Tanggal Submit'
    ];
    const rows = (pe1Registrations || []).map(r => [
      r.id,
      r.full_name,
      r.email,
      r.whatsapp,
      r.status_current,
      r.institution,
      r.major || '-',
      r.city,
      r.package_choice,
      r.instagram_username || '-',
      r.social_proof_drive_url || '-',
      r.payment_method || '-',
      r.payment_proof_url || '-',
      r.status,
      new Date(r.submitted_at).toLocaleDateString('id-ID')
    ]);
    downloadCSV('TSF_Pendaftar_PE1_CEO_For_A_Day.csv', headers, rows);
  };

  // Division submit
  const handleDivSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (divForm.id) {
      updateDivision({
        id: divForm.id,
        name: divForm.name,
        description: divForm.description,
        quota: 0,
        icon_name: divForm.icon_name,
        sub_divisions: divForm.sub_divisions,
        jobdesk: divForm.jobdesk,
        skills: divForm.skills
      });
    } else {
      addDivision({
        name: divForm.name,
        description: divForm.description,
        quota: 0,
        icon_name: divForm.icon_name,
        sub_divisions: divForm.sub_divisions,
        jobdesk: divForm.jobdesk,
        skills: divForm.skills
      });
    }
    setIsDivModalOpen(false);
    setDivForm({ id: '', name: '', description: '', quota: 0, icon_name: 'Users', sub_divisions: [], jobdesk: [], skills: '' });
  };

  // Product submit
  const handleProdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const imageToUse = prodForm.image_url || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=600';
    if (prodForm.id) {
      updateThriftProduct({
        ...prodForm,
        image_url: imageToUse,
        price: Number(prodForm.price)
      });
    } else {
      addThriftProduct({
        name: prodForm.name,
        price: Number(prodForm.price),
        condition: prodForm.condition,
        category: prodForm.category,
        image_url: imageToUse,
        vendor_id: prodForm.vendor_id || thriftVendors[0]?.id || 'v-1',
        status: prodForm.status
      });
    }
    setIsProdModalOpen(false);
    setProdForm({ id: '', name: '', price: 100000, condition: '9/10', category: 'clothing', image_url: '', vendor_id: '', status: 'available' });
  };

  // Vendor submit
  const handleVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (vendorFormState.id) {
      updateThriftVendor(vendorFormState);
    } else {
      addThriftVendor({
        vendor_name: vendorFormState.vendor_name,
        booth_location: vendorFormState.booth_location,
        contact: vendorFormState.contact,
        status: vendorFormState.status
      });
    }
    setIsVendorModalOpen(false);
    setVendorFormState({ id: '', vendor_name: '', booth_location: '', contact: '', status: 'active' });
  };

  if (!isAuthenticated) {
    /* LOGIN SCREEN */
    return (
      <div className="asphalt-texture min-h-screen flex items-center justify-center p-4">
        <div className="bg-blue-sail text-ballroom w-full max-w-sm border-4 border-decor p-8 rounded-none shadow-[8px_8px_0_0_#BD1B1F] relative overflow-hidden font-sans">
          <div className="absolute inset-0 grid-pattern opacity-10" />
          
          <div className="relative z-10 text-center space-y-6">
            <div className="flex justify-center">
              <div className="bg-decor text-blue-sail p-3 rounded-none border-2 border-blue-sail font-display font-black text-2xl">
                TSF
              </div>
            </div>

            <div className="space-y-1.5">
              <h1 className="font-display font-black text-xl uppercase tracking-wider text-decor">CMS CONTROL CENTER</h1>
              <p className="text-xs text-ballroom/75 leading-relaxed">Masukkan kata sandi kepanitiaan untuk mengontrol status event dan mengunduh database.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1 text-left">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-decor">USERNAME ADMIN</label>
                <input
                  id="admin-username-input"
                  type="text"
                  value={usernameInput}
                  onChange={e => setUsernameInput(e.target.value)}
                  placeholder="Username"
                  className="w-full px-4 py-2.5 text-sm bg-white border-2 border-decor text-blue-sail rounded-none outline-none font-mono focus:shadow-[2px_2px_0_0_#F6BB02]"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-decor">KATA SANDI PANITIA</label>
                <input
                  id="admin-password-input"
                  type="password"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  placeholder="Kata Sandi"
                  className="w-full px-4 py-2.5 text-sm bg-white border-2 border-decor text-blue-sail rounded-none outline-none font-mono focus:shadow-[2px_2px_0_0_#F6BB02]"
                />
              </div>

              {loginError && <p className="text-red-inferno font-mono font-bold text-[10px] uppercase text-left">{loginError}</p>}

              <button
                id="admin-login-btn"
                type="submit"
                className="w-full bg-decor hover:bg-decor/95 text-blue-sail font-display font-black text-xs uppercase py-3 rounded-none border-2 border-blue-sail tracking-widest shadow-[4px_4px_0_0_#BD1B1F] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              >
                VERIFIKASI & MASUK
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --- 1. AMBASSADOR APPLICATIONS ---
  const filteredAmbassadors = useMemo(() => {
    const list = (ambassadorApplications || []).filter(app => {
      if (!app) return false;
      if (filterAmbassadorRole && app.role_choice !== filterAmbassadorRole) return false;
      if (filterAmbassadorStatus && app.status !== filterAmbassadorStatus) return false;
      if (searchAmbassadorQuery) {
        const q = searchAmbassadorQuery.toLowerCase();
        const matchName = app.full_name ? app.full_name.toLowerCase().includes(q) : false;
        const matchEmail = app.email ? app.email.toLowerCase().includes(q) : false;
        const matchNrp = app.nrp ? app.nrp.toLowerCase().includes(q) : false;
        const matchSchool = app.school ? app.school.toLowerCase().includes(q) : false;
        const matchWa = app.whatsapp ? app.whatsapp.toLowerCase().includes(q) : false;
        if (!matchName && !matchEmail && !matchNrp && !matchSchool && !matchWa) return false;
      }
      return true;
    });

    list.sort((a, b) => {
      let valA: any = '';
      let valB: any = '';
      if (ambassadorSortField === 'name') {
        valA = a.full_name || '';
        valB = b.full_name || '';
      } else if (ambassadorSortField === 'role') {
        valA = a.role_choice || '';
        valB = b.role_choice || '';
      } else if (ambassadorSortField === 'status') {
        valA = a.status || '';
        valB = b.status || '';
      } else {
        valA = new Date(a.submitted_at || 0).getTime();
        valB = new Date(b.submitted_at || 0).getTime();
      }

      if (valA < valB) return ambassadorSortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return ambassadorSortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [ambassadorApplications, filterAmbassadorRole, filterAmbassadorStatus, searchAmbassadorQuery, ambassadorSortField, ambassadorSortOrder]);

  const paginatedAmbassadors = useMemo(() => {
    const start = (ambassadorPage - 1) * ambassadorPageSize;
    return filteredAmbassadors.slice(start, start + ambassadorPageSize);
  }, [filteredAmbassadors, ambassadorPage, ambassadorPageSize]);

  // --- 2. PE1 REGISTRATIONS ---
  const filteredPE1Regs = useMemo(() => {
    const list = (pe1Registrations || []).filter(reg => {
      if (!reg) return false;
      if (filterPE1Package && reg.package_choice !== filterPE1Package) return false;
      if (filterPE1Status && reg.status !== filterPE1Status) return false;
      if (searchPE1Query) {
        const q = searchPE1Query.toLowerCase();
        const matchName = reg.full_name ? reg.full_name.toLowerCase().includes(q) : false;
        const matchEmail = reg.email ? reg.email.toLowerCase().includes(q) : false;
        const matchInst = reg.institution ? reg.institution.toLowerCase().includes(q) : false;
        const matchCity = reg.city ? reg.city.toLowerCase().includes(q) : false;
        const matchWa = reg.whatsapp ? reg.whatsapp.toLowerCase().includes(q) : false;
        if (!matchName && !matchEmail && !matchInst && !matchCity && !matchWa) return false;
      }
      return true;
    });

    list.sort((a, b) => {
      let valA: any = '';
      let valB: any = '';
      if (pe1SortField === 'name') {
        valA = a.full_name || '';
        valB = b.full_name || '';
      } else if (pe1SortField === 'package') {
        valA = a.package_choice || '';
        valB = b.package_choice || '';
      } else if (pe1SortField === 'status') {
        valA = a.status || '';
        valB = b.status || '';
      } else {
        valA = new Date(a.submitted_at || 0).getTime();
        valB = new Date(b.submitted_at || 0).getTime();
      }

      if (valA < valB) return pe1SortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return pe1SortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [pe1Registrations, filterPE1Package, filterPE1Status, searchPE1Query, pe1SortField, pe1SortOrder]);

  const paginatedPE1Regs = useMemo(() => {
    const start = (pe1Page - 1) * pe1PageSize;
    return filteredPE1Regs.slice(start, start + pe1PageSize);
  }, [filteredPE1Regs, pe1Page, pe1PageSize]);

  // --- 3. STAFF APPLICATIONS ---
  const filteredStaffApplications = useMemo(() => {
    const list = staffApplications.filter(app => {
      if (filterDivision) {
        if (filterPriority === 'p1') {
          if (app.division_priority_1 !== filterDivision) return false;
        } else if (filterPriority === 'p2') {
          if (app.division_priority_2 !== filterDivision) return false;
        } else {
          if (app.division_priority_1 !== filterDivision && app.division_priority_2 !== filterDivision) return false;
        }
      }

      if (searchStaffQuery) {
        const q = searchStaffQuery.toLowerCase();
        const matchName = app.full_name?.toLowerCase().includes(q);
        const matchNim = app.nim?.toLowerCase().includes(q);
        const matchEmail = app.email?.toLowerCase().includes(q);
        const matchPhone = app.phone?.toLowerCase().includes(q);
        const matchDept = app.department?.toLowerCase().includes(q) || app.major?.toLowerCase().includes(q);
        if (!matchName && !matchNim && !matchEmail && !matchPhone && !matchDept) return false;
      }

      return true;
    });

    list.sort((a, b) => {
      // If filtering by division without specific priority, prioritize p1 over p2
      if (filterDivision && !filterPriority && staffSortField === 'date') {
        const aIsP1 = a.division_priority_1 === filterDivision;
        const bIsP1 = b.division_priority_1 === filterDivision;
        if (aIsP1 && !bIsP1) return -1;
        if (!aIsP1 && bIsP1) return 1;
      }

      let valA: any = '';
      let valB: any = '';
      if (staffSortField === 'name') {
        valA = a.full_name || '';
        valB = b.full_name || '';
      } else if (staffSortField === 'nim') {
        valA = a.nim || '';
        valB = b.nim || '';
      } else if (staffSortField === 'status') {
        valA = a.status || '';
        valB = b.status || '';
      } else {
        valA = new Date(a.submitted_at || 0).getTime();
        valB = new Date(b.submitted_at || 0).getTime();
      }

      if (valA < valB) return staffSortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return staffSortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [staffApplications, filterDivision, filterPriority, searchStaffQuery, staffSortField, staffSortOrder]);

  const paginatedStaffApplications = useMemo(() => {
    const start = (staffPage - 1) * staffPageSize;
    return filteredStaffApplications.slice(start, start + staffPageSize);
  }, [filteredStaffApplications, staffPage, staffPageSize]);

  // --- 4. COMPETITION REGISTRATIONS ---
  const filteredCompetitionRegistrations = useMemo(() => {
    const list = competitionRegistrations.filter(reg => {
      const compType = reg.competition_type || (reg.category_id?.includes('BCC') ? 'BCC' : 'BPC');
      const eduCat = reg.education_category || (reg.category_id?.includes('SMA') ? 'SMA/Sederajat' : 'Mahasiswa');

      if (compFilterType !== 'all' && compType !== compFilterType) return false;
      if (compFilterCategory !== 'all' && eduCat !== compFilterCategory) return false;
      
      const prelimStatus = reg.status_preliminary || 'pending';
      if (compFilterPreliminary !== 'all' && prelimStatus !== compFilterPreliminary) return false;

      const payStatus = reg.payment_semifinal_status || 'none';
      if (compFilterPayment !== 'all' && payStatus !== compFilterPayment) return false;

      const semiStatus = reg.status_semifinal || 'pending';
      if (compFilterSemifinal !== 'all' && semiStatus !== compFilterSemifinal) return false;

      const finalStatus = reg.status_final || 'pending';
      if (compFilterFinal !== 'all' && finalStatus !== compFilterFinal) return false;

      if (compSearchQuery.trim() !== '') {
        const q = compSearchQuery.toLowerCase();
        const matchName = reg.team_name?.toLowerCase().includes(q);
        const matchLeader = reg.leader_name?.toLowerCase().includes(q);
        const matchInst = reg.institution?.toLowerCase().includes(q);
        const matchEmail = reg.email?.toLowerCase().includes(q);
        const matchContact = reg.contact?.toLowerCase().includes(q);
        if (!matchName && !matchLeader && !matchInst && !matchEmail && !matchContact) return false;
      }

      return true;
    });

    list.sort((a, b) => {
      let valA: any = '';
      let valB: any = '';
      if (compSortField === 'team_name') {
        valA = a.team_name || '';
        valB = b.team_name || '';
      } else if (compSortField === 'leader_name') {
        valA = a.leader_name || '';
        valB = b.leader_name || '';
      } else if (compSortField === 'institution') {
        valA = a.institution || '';
        valB = b.institution || '';
      } else if (compSortField === 'type') {
        valA = a.competition_type || '';
        valB = b.competition_type || '';
      } else if (compSortField === 'status') {
        valA = a.status_stage || a.status_preliminary || '';
        valB = b.status_stage || b.status_preliminary || '';
      } else {
        valA = new Date(a.submitted_at || 0).getTime();
        valB = new Date(b.submitted_at || 0).getTime();
      }

      if (valA < valB) return compSortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return compSortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [competitionRegistrations, compFilterType, compFilterCategory, compFilterPreliminary, compFilterPayment, compFilterSemifinal, compFilterFinal, compSearchQuery, compSortField, compSortOrder]);

  const paginatedCompetitionRegistrations = useMemo(() => {
    const start = (compPage - 1) * compPageSize;
    return filteredCompetitionRegistrations.slice(start, start + compPageSize);
  }, [filteredCompetitionRegistrations, compPage, compPageSize]);

  // --- 5. VENDOR BOOTH APPLICATIONS ---
  const filteredVendorApplications = useMemo(() => {
    const list = vendorApplications.filter(app => {
      if (!vendorSearchQuery) return true;
      const q = vendorSearchQuery.toLowerCase();
      const matchBrand = app.vendor_name?.toLowerCase().includes(q);
      const matchContact = app.contact?.toLowerCase().includes(q);
      const matchCat = app.product_category?.toLowerCase().includes(q);
      const matchDesc = app.description?.toLowerCase().includes(q);
      return matchBrand || matchContact || matchCat || matchDesc;
    });

    list.sort((a, b) => {
      let valA: any = '';
      let valB: any = '';
      if (vendorSortField === 'name') {
        valA = a.vendor_name || '';
        valB = b.vendor_name || '';
      } else if (vendorSortField === 'category') {
        valA = a.product_category || '';
        valB = b.product_category || '';
      } else {
        valA = new Date(a.submitted_at || 0).getTime();
        valB = new Date(b.submitted_at || 0).getTime();
      }

      if (valA < valB) return vendorSortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return vendorSortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [vendorApplications, vendorSearchQuery, vendorSortField, vendorSortOrder]);

  const paginatedVendorApplications = useMemo(() => {
    const start = (vendorPage - 1) * vendorPageSize;
    return filteredVendorApplications.slice(start, start + vendorPageSize);
  }, [filteredVendorApplications, vendorPage, vendorPageSize]);

  // --- 5. USER ACCOUNTS ---
  const filteredAdminUsersList = useMemo(() => {
    const list = adminUsersList.filter(user => {
      if (!userSearchQuery) return true;
      const q = userSearchQuery.toLowerCase();
      const matchId = user.id?.toLowerCase().includes(q);
      const matchName = user.name?.toLowerCase().includes(q);
      const matchEmail = user.email?.toLowerCase().includes(q);
      const matchProv = user.auth_provider?.toLowerCase().includes(q);
      return matchId || matchName || matchEmail || matchProv;
    });

    list.sort((a, b) => {
      let valA: any = '';
      let valB: any = '';
      if (userSortField === 'name') {
        valA = a.name || '';
        valB = b.name || '';
      } else if (userSortField === 'email') {
        valA = a.email || '';
        valB = b.email || '';
      } else if (userSortField === 'provider') {
        valA = a.auth_provider || '';
        valB = b.auth_provider || '';
      } else {
        valA = new Date(a.created_at || 0).getTime();
        valB = new Date(b.created_at || 0).getTime();
      }

      if (valA < valB) return userSortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return userSortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [adminUsersList, userSearchQuery, userSortField, userSortOrder]);

  const paginatedAdminUsersList = useMemo(() => {
    const start = (userPage - 1) * userPageSize;
    return filteredAdminUsersList.slice(start, start + userPageSize);
  }, [filteredAdminUsersList, userPage, userPageSize]);

  // --- 6. ADMIN CMS ACCOUNTS ---
  const filteredAdminAccounts = useMemo(() => {
    const list = adminAccounts.filter(acc => {
      if (!adminAccSearchQuery) return true;
      return acc.username.toLowerCase().includes(adminAccSearchQuery.toLowerCase());
    });

    list.sort((a, b) => {
      if (a.username.toLowerCase() === 'admin') return -1;
      if (b.username.toLowerCase() === 'admin') return 1;
      const res = a.username.localeCompare(b.username);
      return adminAccSortOrder === 'asc' ? res : -res;
    });

    return list;
  }, [adminAccounts, adminAccSearchQuery, adminAccSortOrder]);

  const paginatedAdminAccounts = useMemo(() => {
    const start = (adminAccPage - 1) * adminAccPageSize;
    return filteredAdminAccounts.slice(start, start + adminAccPageSize);
  }, [filteredAdminAccounts, adminAccPage, adminAccPageSize]);

  return (
    <div className="min-h-screen bg-ballroom font-sans text-blue-sail flex flex-col lg:flex-row">
      
      {/* SIDE NAV FOR CMS */}
      <aside className="w-full lg:w-64 bg-blue-sail text-ballroom border-b-4 lg:border-b-0 lg:border-r-4 border-decor shrink-0">
        <div className="p-6 border-b border-ballroom/10 relative">
          <div className="absolute inset-0 grid-pattern opacity-10" />
          <div className="relative z-10 flex items-center space-x-2">
            <div className="bg-decor text-blue-sail px-2.5 py-0.5 rounded-none border border-blue-sail font-display font-black tracking-tighter text-lg">
              TSF
            </div>
            <span className="font-display font-black text-sm tracking-widest uppercase text-decor">CMS PANEL</span>
          </div>
        </div>

        <nav className="p-4 space-y-2 font-sans font-bold text-xs uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full text-left px-4 py-3 rounded-none border-2 flex items-center space-x-2.5 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-decor border-blue-sail text-blue-sail shadow-[3px_3px_0_0_#BD1B1F]'
                : 'bg-transparent border-transparent text-ballroom hover:bg-barbera/40 hover:border-ballroom/15'
            }`}
          >
            <Icon name="Sliders" size={16} />
            <span>Kontrol Utama / Fase</span>
          </button>

          <button
            onClick={() => setActiveTab('ambassadors')}
            className={`w-full text-left px-4 py-3 rounded-none border-2 flex items-center space-x-2.5 transition-all cursor-pointer ${
              activeTab === 'ambassadors'
                ? 'bg-decor border-blue-sail text-blue-sail shadow-[3px_3px_0_0_#BD1B1F]'
                : 'bg-transparent border-transparent text-ballroom hover:bg-barbera/40 hover:border-ballroom/15'
            }`}
          >
            <Icon name="Award" size={16} />
            <span>Pendaftar Ambassador</span>
          </button>

          <button
            onClick={() => setActiveTab('pe1')}
            className={`w-full text-left px-4 py-3 rounded-none border-2 flex items-center space-x-2.5 transition-all cursor-pointer ${
              activeTab === 'pe1'
                ? 'bg-decor border-blue-sail text-blue-sail shadow-[3px_3px_0_0_#BD1B1F]'
                : 'bg-transparent border-transparent text-ballroom hover:bg-barbera/40 hover:border-ballroom/15'
            }`}
          >
            <Icon name="Briefcase" size={16} />
            <span>Pendaftar PE1 CEO For A Day</span>
          </button>

          <button
            onClick={() => setActiveTab('staff')}
            className={`w-full text-left px-4 py-3 rounded-none border-2 flex items-center space-x-2.5 transition-all cursor-pointer ${
              activeTab === 'staff'
                ? 'bg-decor border-blue-sail text-blue-sail shadow-[3px_3px_0_0_#BD1B1F]'
                : 'bg-transparent border-transparent text-ballroom hover:bg-barbera/40 hover:border-ballroom/15'
            }`}
          >
            <Icon name="Users" size={16} />
            <span>Pendaftar Staff</span>
          </button>

          <button
            onClick={() => setActiveTab('competitions')}
            className={`w-full text-left px-4 py-3 rounded-none border-2 flex items-center space-x-2.5 transition-all cursor-pointer ${
              activeTab === 'competitions'
                ? 'bg-decor border-blue-sail text-blue-sail shadow-[3px_3px_0_0_#BD1B1F]'
                : 'bg-transparent border-transparent text-ballroom hover:bg-barbera/40 hover:border-ballroom/15'
            }`}
          >
            <Icon name="Trophy" size={16} />
            <span>Pendaftar Competition</span>
          </button>

          <button
            onClick={() => setActiveTab('user-accounts')}
            className={`w-full text-left px-4 py-3 rounded-none border-2 flex items-center space-x-2.5 transition-all cursor-pointer ${
              activeTab === 'user-accounts'
                ? 'bg-decor border-blue-sail text-blue-sail shadow-[3px_3px_0_0_#BD1B1F]'
                : 'bg-transparent border-transparent text-ballroom hover:bg-barbera/40 hover:border-ballroom/15'
            }`}
          >
            <Icon name="Users" size={16} />
            <span>Akun Pendaftar</span>
          </button>

          <button
            onClick={() => setActiveTab('accounts')}
            className={`w-full text-left px-4 py-3 rounded-none border-2 flex items-center space-x-2.5 transition-all cursor-pointer ${
              activeTab === 'accounts'
                ? 'bg-decor border-blue-sail text-blue-sail shadow-[3px_3px_0_0_#BD1B1F]'
                : 'bg-transparent border-transparent text-ballroom hover:bg-barbera/40 hover:border-ballroom/15'
            }`}
          >
            <Icon name="UserPlus" size={16} />
            <span>Tambahkan Akun</span>
          </button>

          <button
            onClick={() => setActiveTab('divisions')}
            className={`w-full text-left px-4 py-3 rounded-none border-2 flex items-center space-x-2.5 transition-all cursor-pointer ${
              activeTab === 'divisions'
                ? 'bg-decor border-blue-sail text-blue-sail shadow-[3px_3px_0_0_#BD1B1F]'
                : 'bg-transparent border-transparent text-ballroom hover:bg-barbera/40 hover:border-ballroom/15'
            }`}
          >
            <Icon name="CalendarRange" size={16} />
            <span>Manajemen Divisi</span>
          </button>

          <button
            onClick={() => setActiveTab('form-control')}
            className={`w-full text-left px-4 py-3 rounded-none border-2 flex items-center space-x-2.5 transition-all cursor-pointer ${
              activeTab === 'form-control'
                ? 'bg-decor border-blue-sail text-blue-sail shadow-[3px_3px_0_0_#BD1B1F]'
                : 'bg-transparent border-transparent text-ballroom hover:bg-barbera/40 hover:border-ballroom/15'
            }`}
          >
            <Icon name="Settings" size={16} />
            <span>Pengaturan Form</span>
          </button>

          <button
            onClick={() => setActiveTab('server-health')}
            className={`w-full text-left px-4 py-3 rounded-none border-2 flex items-center space-x-2.5 transition-all cursor-pointer ${
              activeTab === 'server-health'
                ? 'bg-decor border-blue-sail text-blue-sail shadow-[3px_3px_0_0_#BD1B1F]'
                : 'bg-transparent border-transparent text-ballroom hover:bg-barbera/40 hover:border-ballroom/15'
            }`}
          >
            <Icon name="Radio" size={16} />
            <div className="flex items-center justify-between w-full">
              <span>Kesehatan & Log Server</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
          </button>

          <div className="pt-6 border-t border-ballroom/10 mt-6">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 rounded-none flex items-center space-x-2.5 bg-red-inferno/10 text-red-inferno hover:bg-red-inferno hover:text-ballroom transition-all border-2 border-red-inferno cursor-pointer shadow-[3px_3px_0_0_#8B011A]"
            >
              <Icon name="LogOut" size={14} />
              <span>Keluar (Logout)</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* DASHBOARD AREA */}
      <main className="flex-1 p-6 lg:p-8 space-y-8 overflow-x-hidden">
        
        {/* 1. SECTION TAB: OVERVIEW / ACTIVE PHASE CONTROLLER */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="font-display font-black text-2xl uppercase">DASHBOARD & KONTROL FASE</h2>
              <p className="text-xs text-blue-sail/60">Pilih fase event yang sedang aktif di website secara dinamis.</p>
            </div>

            {/* LIVE DATA CARD METRICS SUMMARY */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-ballroom p-5 rounded-none border-4 border-blue-sail shadow-[4px_4px_0_0_#2A4C9E] flex items-center space-x-4">
                <div className="p-3 bg-blue-sail/5 text-blue-sail rounded-none border border-blue-sail/25 shrink-0">
                  <Icon name="Users" size={24} />
                </div>
                <div>
                  <span className="block text-[10px] font-mono uppercase text-blue-sail/50">Pendaftar Staff</span>
                  {loading ? (
                    <div className="h-7 w-20 bg-blue-sail/20 rounded animate-pulse mt-1" />
                  ) : (
                    <span className="block font-display font-black text-2xl text-blue-sail">
                      {metrics?.staffCount ?? staffApplications.length} Orang
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-ballroom p-5 rounded-none border-4 border-blue-sail shadow-[4px_4px_0_0_#F6BB02] flex items-center space-x-4">
                <div className="p-3 bg-decor/10 text-decor rounded-none border border-blue-sail/25 shrink-0">
                  <Icon name="Trophy" size={24} className="text-blue-sail" />
                </div>
                <div>
                  <span className="block text-[10px] font-mono uppercase text-blue-sail/50">Pendaftar Competition</span>
                  {loading ? (
                    <div className="h-7 w-20 bg-blue-sail/20 rounded animate-pulse mt-1" />
                  ) : (
                    <span className="block font-display font-black text-2xl text-blue-sail">
                      {metrics?.compCount ?? competitionRegistrations.length} Tim
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-ballroom p-5 rounded-none border-4 border-blue-sail shadow-[4px_4px_0_0_#BD1B1F] flex items-center space-x-4">
                <div className="p-3 bg-red-inferno/5 text-red-inferno rounded-none border border-blue-sail/25 shrink-0">
                  <Icon name="UserPlus" size={24} />
                </div>
                <div>
                  <span className="block text-[10px] font-mono uppercase text-blue-sail/50">Akun Admin Aktif</span>
                  <span className="block font-display font-black text-2xl text-blue-sail">{adminAccounts.length} Akun</span>
                </div>
              </div>
            </div>

            {/* DYNAMIC ACTIVE PHASE CONTROLLER BANNER */}
            <div className="bg-ballroom p-6 sm:p-8 rounded-none border-4 border-blue-sail shadow-[8px_8px_0_0_#2A4C9E] space-y-6">
              <div className="flex items-center space-x-3.5 border-b-2 border-blue-sail/10 pb-4">
                <div className="p-2 bg-decor text-blue-sail rounded-none border border-blue-sail">
                  <Icon name="Sliders" size={20} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg uppercase">Status Keaktifan Lini Masa (CMS)</h3>
                  <p className="text-xs text-blue-sail/70">Aktifkan salah satu tahapan di bawah ini. Tombol navigasi 'Daftar Sekarang' & Banner di Home otomatis mengarah ke halaman tahapan aktif.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {phases.map((phase) => {
                  const isActive = phase.status === 'active';
                  return (
                    <div
                      key={phase.id}
                      onClick={() => setActivePhase(phase.name)}
                      className={`cursor-pointer p-4 rounded-none border-2 border-blue-sail flex flex-col justify-between h-36 transition-all ${
                        isActive 
                          ? 'bg-blue-sail border-decor text-ballroom shadow-[4px_4px_0_0_#F6BB02]' 
                          : 'bg-white border-blue-sail/30 hover:border-blue-sail hover:shadow-[3px_3px_0_0_#2A4C9E] text-blue-sail'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-[9px] font-bold tracking-wider uppercase">
                            {isActive ? '● SEDANG AKTIF' : 'NONAKTIF'}
                          </span>
                          <input
                            type="radio"
                            name="activePhaseCMS"
                            checked={isActive}
                            onChange={() => setActivePhase(phase.name)}
                            className="h-4.5 w-4.5 text-decor border-blue-sail/25 rounded-full focus:ring-0"
                          />
                        </div>
                        <h4 className="font-display font-bold text-base uppercase leading-tight mt-1">{phase.label}</h4>
                      </div>

                      <div className="font-mono text-[9px] border-t border-current/10 pt-2 flex justify-between items-center">
                        <span>Fase: {phase.name === 'staff_recruitment' ? 'Staff' : phase.name.toUpperCase()}</span>
                        <Icon name="ArrowRight" size={12} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SECTION TAB: AMBASSADOR & INFLUENCER APPLICATIONS */}
        {activeTab === 'ambassadors' && (
          <div className="space-y-6">
            {/* Top Header & Export */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-ballroom p-6 border-4 border-blue-sail shadow-[6px_6px_0_0_#2A4C9E]">
              <div>
                <h2 className="font-display font-black text-2xl uppercase tracking-tight text-blue-sail">
                  Pendaftar Ambassador & Influencer
                </h2>
                <p className="text-xs text-blue-sail/70 mt-1 font-sans">
                  Manajemen data calon Campus Influencer (ITS 2026) dan Student Ambassador (SMA/SMK Surabaya).
                </p>
              </div>

              <button
                type="button"
                onClick={exportAmbassadorCSV}
                className="bg-decor hover:bg-decor/90 text-blue-sail font-display font-black text-xs uppercase px-5 py-3 border-2 border-blue-sail shadow-[4px_4px_0_0_#BD1B1F] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center space-x-2 cursor-pointer"
              >
                <Icon name="Download" size={16} />
                <span>EKSPOR CSV (EXCEL)</span>
              </button>
            </div>

            {/* Stats Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 border-2 border-blue-sail shadow-[3px_3px_0_0_#2A4C9E]">
                <span className="block text-[10px] font-mono font-bold uppercase text-blue-sail/60">TOTAL PENDAFTAR</span>
                <span className="block font-display font-black text-2xl text-blue-sail">{(ambassadorApplications || []).length}</span>
              </div>
              <div className="bg-white p-4 border-2 border-blue-sail shadow-[3px_3px_0_0_#2A4C9E]">
                <span className="block text-[10px] font-mono font-bold uppercase text-blue-sail/60">CAMPUS INFLUENCER</span>
                <span className="block font-display font-black text-2xl text-blue-sail">
                  {(ambassadorApplications || []).filter(a => a.role_choice === 'Campus Influencer').length}
                </span>
              </div>
              <div className="bg-white p-4 border-2 border-blue-sail shadow-[3px_3px_0_0_#2A4C9E]">
                <span className="block text-[10px] font-mono font-bold uppercase text-blue-sail/60">STUDENT AMBASSADOR</span>
                <span className="block font-display font-black text-2xl text-blue-sail">
                  {(ambassadorApplications || []).filter(a => a.role_choice === 'Student Ambassador').length}
                </span>
              </div>
              <div className="bg-white p-4 border-2 border-blue-sail shadow-[3px_3px_0_0_#2A4C9E]">
                <span className="block text-[10px] font-mono font-bold uppercase text-emerald-600">DITERIMA (ACCEPTED)</span>
                <span className="block font-display font-black text-2xl text-emerald-600">
                  {(ambassadorApplications || []).filter(a => a.status === 'accepted').length}
                </span>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="bg-white p-4 border-4 border-blue-sail shadow-[4px_4px_0_0_#2A4C9E] flex flex-wrap items-center gap-3">
              {/* Role filter */}
              <div className="flex items-center space-x-2">
                <label className="text-xs font-mono font-bold uppercase text-blue-sail">Peran:</label>
                <select
                  value={filterAmbassadorRole}
                  onChange={(e) => {
                    setFilterAmbassadorRole(e.target.value);
                    setAmbassadorPage(1);
                  }}
                  className="p-2 border-2 border-blue-sail text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="">Semua Peran</option>
                  <option value="Campus Influencer">Campus Influencer (ITS)</option>
                  <option value="Student Ambassador">Student Ambassador (SMA/SMK)</option>
                </select>
              </div>

              {/* Status filter */}
              <div className="flex items-center space-x-2">
                <label className="text-xs font-mono font-bold uppercase text-blue-sail">Status:</label>
                <select
                  value={filterAmbassadorStatus}
                  onChange={(e) => {
                    setFilterAmbassadorStatus(e.target.value);
                    setAmbassadorPage(1);
                  }}
                  className="p-2 border-2 border-blue-sail text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="">Semua Status</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Diterima (Accepted)</option>
                  <option value="rejected">Ditolak (Rejected)</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center space-x-2">
                <label className="text-xs font-mono font-bold uppercase text-blue-sail">Urutkan:</label>
                <select
                  value={ambassadorSortField}
                  onChange={(e) => setAmbassadorSortField(e.target.value as any)}
                  className="p-2 border-2 border-blue-sail text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="date">Tanggal Daftar</option>
                  <option value="name">Nama Lengkap</option>
                  <option value="role">Peran Pilihan</option>
                  <option value="status">Status</option>
                </select>
                <button
                  type="button"
                  onClick={() => setAmbassadorSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="p-2 bg-ballroom border-2 border-blue-sail text-xs font-mono font-bold hover:bg-decor transition-all cursor-pointer"
                  title={`Urutan: ${ambassadorSortOrder === 'asc' ? 'A-Z / Lama ke Baru' : 'Z-A / Terbaru'}`}
                >
                  {ambassadorSortOrder === 'asc' ? '▲ ASC' : '▼ DESC'}
                </button>
              </div>

              {/* Search */}
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  value={searchAmbassadorQuery}
                  onChange={(e) => {
                    setSearchAmbassadorQuery(e.target.value);
                    setAmbassadorPage(1);
                  }}
                  placeholder="Cari nama, email, NRP/sekolah, WA..."
                  className="w-full p-2 border-2 border-blue-sail text-xs outline-none"
                />
              </div>

              {/* Refresh Sync Button */}
              <button
                type="button"
                onClick={() => {
                  setTabLoading(true);
                  fetchAmbassadorApplications().finally(() => setTabLoading(false));
                }}
                className="bg-blue-sail hover:bg-decor hover:text-blue-sail text-white font-mono font-bold text-xs px-3 py-2 border-2 border-blue-sail flex items-center space-x-1.5 cursor-pointer transition-all shrink-0"
              >
                <Icon name="RefreshCw" size={14} className={tabLoading ? "animate-spin" : ""} />
                <span>{tabLoading ? 'Memuat...' : 'Sinkronkan'}</span>
              </button>
            </div>

            {/* Table Data */}
            <div className="bg-white border-4 border-blue-sail shadow-[6px_6px_0_0_#2A4C9E] overflow-hidden">
              {tabLoading ? (
                <div className="p-12 text-center text-blue-sail space-y-3">
                  <div className="w-8 h-8 border-4 border-blue-sail border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-semibold">Memuat data pendaftar ambassador...</p>
                </div>
              ) : filteredAmbassadors.length === 0 ? (
                <div className="p-12 text-center text-blue-sail">
                  <Icon name="Award" size={40} className="text-blue-sail/30 mx-auto mb-2" />
                  <p className="text-sm font-semibold">Belum Ada Data Pendaftar Ambassador / Influencer</p>
                  <p className="text-xs text-blue-sail/60 mt-1">Data tidak ditemukan atau tidak cocok dengan filter pencarian.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-sans border-collapse">
                      <thead className="bg-blue-sail text-ballroom uppercase font-display font-bold border-b-4 border-decor">
                        <tr>
                          <th className="p-4 cursor-pointer select-none hover:bg-blue-sail/90" onClick={() => {
                            if (ambassadorSortField === 'name') setAmbassadorSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                            else { setAmbassadorSortField('name'); setAmbassadorSortOrder('asc'); }
                          }}>
                            <div className="flex items-center gap-1.5">
                              <span>Identitas Pendaftar</span>
                              {ambassadorSortField === 'name' && (ambassadorSortOrder === 'asc' ? '▲' : '▼')}
                            </div>
                          </th>
                          <th className="p-4 cursor-pointer select-none hover:bg-blue-sail/90" onClick={() => {
                            if (ambassadorSortField === 'role') setAmbassadorSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                            else { setAmbassadorSortField('role'); setAmbassadorSortOrder('asc'); }
                          }}>
                            <div className="flex items-center gap-1.5">
                              <span>Peran & Akademik</span>
                              {ambassadorSortField === 'role' && (ambassadorSortOrder === 'asc' ? '▲' : '▼')}
                            </div>
                          </th>
                          <th className="p-4">Kontak & Sosmed</th>
                          <th className="p-4">Berkas & Video</th>
                          <th className="p-4 cursor-pointer select-none hover:bg-blue-sail/90" onClick={() => {
                            if (ambassadorSortField === 'status') setAmbassadorSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                            else { setAmbassadorSortField('status'); setAmbassadorSortOrder('asc'); }
                          }}>
                            <div className="flex items-center gap-1.5">
                              <span>Status</span>
                              {ambassadorSortField === 'status' && (ambassadorSortOrder === 'asc' ? '▲' : '▼')}
                            </div>
                          </th>
                          <th className="p-4">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-blue-sail/15">
                        {paginatedAmbassadors.map((app) => (
                          <tr key={app.id} className="hover:bg-gray-50/60">
                            <td className="p-4 space-y-1">
                              <p className="font-bold text-blue-sail text-sm">{app.full_name}</p>
                              <p className="font-mono text-[10px] text-blue-sail/60">{app.email}</p>
                              <span className="inline-block text-[10px] font-mono text-blue-sail/40">Tgl: {new Date(app.submitted_at).toLocaleDateString('id-ID')}</span>
                            </td>
                            <td className="p-4 space-y-1">
                              <span className={`inline-block font-mono text-[10px] font-bold px-2 py-0.5 border ${
                                app.role_choice === 'Campus Influencer'
                                  ? 'bg-red-inferno text-white border-blue-sail'
                                  : 'bg-decor text-blue-sail border-blue-sail'
                              }`}>
                                {app.role_choice}
                              </span>
                              {app.role_choice === 'Campus Influencer' ? (
                                <p className="text-[11px] font-mono text-blue-sail/80">
                                  NRP: {app.nrp} ({app.department} / {app.faculty})
                                </p>
                              ) : (
                                <p className="text-[11px] font-mono text-blue-sail/80">
                                  {app.grade_class} — {app.school}
                                </p>
                              )}
                            </td>
                            <td className="p-4 space-y-1">
                              <a href={`https://${app.whatsapp}`} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline font-mono text-xs font-bold block">
                                WA: {app.whatsapp}
                              </a>
                              {app.instagram && <p className="text-[10px] text-blue-sail/70">IG: {app.instagram}</p>}
                              {app.tiktok && <p className="text-[10px] text-blue-sail/70">TT: {app.tiktok}</p>}
                            </td>
                            <td className="p-4 space-y-1">
                              <a href={app.drive_folder_url} target="_blank" rel="noreferrer" className="text-blue-sail hover:underline font-bold text-[11px] flex items-center space-x-1">
                                <Icon name="ExternalLink" size={12} />
                                <span>Folder Drive</span>
                              </a>
                              <a href={app.reels_video_url} target="_blank" rel="noreferrer" className="text-red-inferno hover:underline font-bold text-[11px] flex items-center space-x-1">
                                <Icon name="Video" size={12} />
                                <span>Reels Video</span>
                              </a>
                            </td>
                            <td className="p-4">
                              <span className={`inline-block font-mono text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider border ${
                                app.status === 'accepted'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-500'
                                  : app.status === 'rejected'
                                  ? 'bg-red-100 text-red-800 border-red-500'
                                  : 'bg-amber-100 text-amber-800 border-amber-500'
                              }`}>
                                {app.status === 'accepted' ? 'DITERIMA' : app.status === 'rejected' ? 'DITOLAK' : 'PENDING'}
                              </span>
                            </td>
                            <td className="p-4">
                              <button
                                type="button"
                                onClick={() => setSelectedAmbassadorApp(app)}
                                className="bg-blue-sail hover:bg-decor hover:text-blue-sail text-ballroom font-mono text-xs font-bold px-3 py-1.5 border border-blue-sail transition-all flex items-center space-x-1 cursor-pointer"
                              >
                                <Icon name="Eye" size={12} />
                                <span>Detail</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <TablePagination
                    currentPage={ambassadorPage}
                    totalPages={Math.ceil(filteredAmbassadors.length / ambassadorPageSize) || 1}
                    totalItems={filteredAmbassadors.length}
                    pageSize={ambassadorPageSize}
                    onPageChange={setAmbassadorPage}
                    onPageSizeChange={setAmbassadorPageSize}
                  />
                </>
              )}
            </div>
          </div>
        )}

        {/* SECTION TAB: PE1 CEO FOR A DAY APPLICATIONS */}
        {activeTab === 'pe1' && (
          <div className="space-y-6">
            {/* Top Header & Export */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-ballroom p-6 border-4 border-blue-sail shadow-[6px_6px_0_0_#2A4C9E]">
              <div>
                <h2 className="font-display font-black text-2xl uppercase tracking-tight text-blue-sail">
                  Pendaftar Pre-Event 1 (CEO For A Day)
                </h2>
                <p className="text-xs text-blue-sail/70 mt-1 font-sans">
                  Manajemen data peserta webinar CEO For A Day: "Brand Yourself, Lead the Future".
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTabLoading(true);
                    fetchPE1Registrations().finally(() => setTabLoading(false));
                  }}
                  className="bg-blue-sail hover:bg-decor hover:text-blue-sail text-white font-mono font-bold text-xs px-4 py-3 border-2 border-blue-sail shadow-[4px_4px_0_0_#BD1B1F] flex items-center space-x-1.5 cursor-pointer transition-all shrink-0"
                >
                  <Icon name="RefreshCw" size={14} className={tabLoading ? "animate-spin" : ""} />
                  <span>{tabLoading ? 'Memuat Data...' : 'Sinkronkan'}</span>
                </button>

                <button
                  type="button"
                  onClick={exportPE1CSV}
                  className="bg-decor hover:bg-decor/90 text-blue-sail font-display font-black text-xs uppercase px-5 py-3 border-2 border-blue-sail shadow-[4px_4px_0_0_#BD1B1F] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <Icon name="Download" size={16} />
                  <span>EKSPOR CSV (EXCEL)</span>
                </button>
              </div>
            </div>

            {/* Stats Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="bg-white p-4 border-2 border-blue-sail shadow-[3px_3px_0_0_#2A4C9E]">
                <span className="block text-[10px] font-mono font-bold uppercase text-blue-sail/60">TOTAL PENDAFTAR</span>
                <span className="block font-display font-black text-2xl text-blue-sail">{(pe1Registrations || []).length}</span>
              </div>
              <div className="bg-white p-4 border-2 border-blue-sail shadow-[3px_3px_0_0_#2A4C9E]">
                <span className="block text-[10px] font-mono font-bold uppercase text-emerald-600">ASPIRING (FREE)</span>
                <span className="block font-display font-black text-2xl text-emerald-600">
                  {(pe1Registrations || []).filter(r => r.package_choice === 'Aspiring CEO').length}
                </span>
              </div>
              <div className="bg-white p-4 border-2 border-blue-sail shadow-[3px_3px_0_0_#2A4C9E]">
                <span className="block text-[10px] font-mono font-bold uppercase text-blue-600">RISING CEO</span>
                <span className="block font-display font-black text-2xl text-blue-600">
                  {(pe1Registrations || []).filter(r => r.package_choice === 'Rising CEO').length}
                </span>
              </div>
              <div className="bg-white p-4 border-2 border-blue-sail shadow-[3px_3px_0_0_#2A4C9E]">
                <span className="block text-[10px] font-mono font-bold uppercase text-purple-600">STRATEGIC CEO</span>
                <span className="block font-display font-black text-2xl text-purple-600">
                  {(pe1Registrations || []).filter(r => r.package_choice === 'Strategic CEO').length}
                </span>
              </div>
              <div className="bg-white p-4 border-2 border-blue-sail shadow-[3px_3px_0_0_#2A4C9E]">
                <span className="block text-[10px] font-mono font-bold uppercase text-amber-600">ABSOLUTE CEO</span>
                <span className="block font-display font-black text-2xl text-amber-600">
                  {(pe1Registrations || []).filter(r => r.package_choice === 'Absolute CEO').length}
                </span>
              </div>
            </div>

            {/* Filter Controls Bar */}
            <div className="bg-white p-4 border-4 border-blue-sail shadow-[4px_4px_0_0_#2A4C9E] flex flex-wrap items-center gap-3">
              <div className="w-full md:w-44 space-y-1">
                <label className="block text-[10px] font-mono font-bold uppercase text-blue-sail/70">FILTER PAKET</label>
                <select
                  value={filterPE1Package}
                  onChange={(e) => {
                    setFilterPE1Package(e.target.value);
                    setPE1Page(1);
                  }}
                  className="w-full bg-white border-2 border-blue-sail text-xs font-sans p-2 outline-none"
                >
                  <option value="">Semua Paket</option>
                  <option value="Aspiring CEO">Aspiring CEO (Free)</option>
                  <option value="Rising CEO">Rising CEO (22K)</option>
                  <option value="Strategic CEO">Strategic CEO (39K)</option>
                  <option value="Absolute CEO">Absolute CEO (49K)</option>
                </select>
              </div>

              <div className="w-full md:w-44 space-y-1">
                <label className="block text-[10px] font-mono font-bold uppercase text-blue-sail/70">STATUS VERIFIKASI</label>
                <select
                  value={filterPE1Status}
                  onChange={(e) => {
                    setFilterPE1Status(e.target.value);
                    setPE1Page(1);
                  }}
                  className="w-full bg-white border-2 border-blue-sail text-xs font-sans p-2 outline-none"
                >
                  <option value="">Semua Status</option>
                  <option value="pending">Pending (Perlu Verifikasi)</option>
                  <option value="confirmed">Confirmed (Disetujui)</option>
                  <option value="rejected">Rejected (Ditolak)</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="w-full md:w-56 space-y-1">
                <label className="block text-[10px] font-mono font-bold uppercase text-blue-sail/70">URUTKAN DATA</label>
                <div className="flex items-center gap-1.5">
                  <select
                    value={pe1SortField}
                    onChange={(e) => setPE1SortField(e.target.value as any)}
                    className="flex-1 bg-white border-2 border-blue-sail text-xs font-sans p-2 outline-none"
                  >
                    <option value="date">Tanggal Daftar</option>
                    <option value="name">Nama Pendaftar</option>
                    <option value="package">Pilihan Paket</option>
                    <option value="status">Status Verifikasi</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setPE1SortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="p-2 bg-ballroom border-2 border-blue-sail text-xs font-mono font-bold hover:bg-decor transition-all cursor-pointer shrink-0"
                    title={`Urutan: ${pe1SortOrder === 'asc' ? 'A-Z / Terlama' : 'Z-A / Terbaru'}`}
                  >
                    {pe1SortOrder === 'asc' ? '▲ ASC' : '▼ DESC'}
                  </button>
                </div>
              </div>

              <div className="flex-1 min-w-[200px] space-y-1">
                <label className="block text-[10px] font-mono font-bold uppercase text-blue-sail/70">CARI PENDAFTAR</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari nama, email, instansi, kota..."
                    value={searchPE1Query}
                    onChange={(e) => {
                      setSearchPE1Query(e.target.value);
                      setPE1Page(1);
                    }}
                    className="w-full bg-white border-2 border-blue-sail text-xs font-sans p-2 pl-8 outline-none"
                  />
                  <Icon name="Search" size={14} className="absolute left-2.5 top-2.5 text-blue-sail/50" />
                </div>
              </div>
            </div>

            {/* Applications Table */}
            <div className="bg-ballroom border-4 border-blue-sail shadow-[6px_6px_0_0_#2A4C9E] overflow-hidden">
              {tabLoading ? (
                <div className="p-12 text-center text-blue-sail space-y-3">
                  <div className="w-8 h-8 border-4 border-blue-sail border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-semibold">Memuat data pendaftar PE1 CEO For A Day...</p>
                </div>
              ) : filteredPE1Regs.length === 0 ? (
                <div className="p-12 text-center text-blue-sail/60">
                  <Icon name="Inbox" size={40} className="mx-auto mb-3 text-blue-sail/30" />
                  <p className="text-sm font-semibold">Belum Ada Data Pendaftar PE1</p>
                  <p className="text-xs text-blue-sail/40 mt-1">Data tidak ditemukan atau tidak sesuai filter pencarian.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-blue-sail text-ballroom font-mono text-[10px] uppercase tracking-wider border-b-2 border-blue-sail">
                          <th className="p-3">No</th>
                          <th className="p-3 cursor-pointer select-none hover:bg-blue-sail/90" onClick={() => {
                            if (pe1SortField === 'name') setPE1SortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                            else { setPE1SortField('name'); setPE1SortOrder('asc'); }
                          }}>
                            <div className="flex items-center gap-1.5">
                              <span>Pendaftar</span>
                              {pe1SortField === 'name' && (pe1SortOrder === 'asc' ? '▲' : '▼')}
                            </div>
                          </th>
                          <th className="p-3">Status / Instansi</th>
                          <th className="p-3 cursor-pointer select-none hover:bg-blue-sail/90" onClick={() => {
                            if (pe1SortField === 'package') setPE1SortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                            else { setPE1SortField('package'); setPE1SortOrder('asc'); }
                          }}>
                            <div className="flex items-center gap-1.5">
                              <span>Paket</span>
                              {pe1SortField === 'package' && (pe1SortOrder === 'asc' ? '▲' : '▼')}
                            </div>
                          </th>
                          <th className="p-3">Metode Bayar</th>
                          <th className="p-3 cursor-pointer select-none hover:bg-blue-sail/90" onClick={() => {
                            if (pe1SortField === 'status') setPE1SortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                            else { setPE1SortField('status'); setPE1SortOrder('asc'); }
                          }}>
                            <div className="flex items-center gap-1.5">
                              <span>Status Verifikasi</span>
                              {pe1SortField === 'status' && (pe1SortOrder === 'asc' ? '▲' : '▼')}
                            </div>
                          </th>
                          <th className="p-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-blue-sail/10 font-sans text-xs">
                        {paginatedPE1Regs.map((reg, idx) => (
                          <tr key={reg.id} className="hover:bg-blue-sail/5 transition-colors">
                            <td className="p-3 font-mono font-bold">{(pe1Page - 1) * pe1PageSize + idx + 1}</td>
                            <td className="p-3">
                              <p className="font-bold text-blue-sail">{reg.full_name}</p>
                              <p className="text-[11px] text-blue-sail/60">{reg.email}</p>
                              <p className="text-[11px] text-blue-sail/60 font-mono">WA: {reg.whatsapp}</p>
                            </td>
                            <td className="p-3">
                              <span className="inline-block bg-blue-sail/10 text-blue-sail font-mono text-[10px] font-bold px-2 py-0.5 uppercase mb-1">
                                {reg.status_current}
                              </span>
                              <p className="text-xs font-semibold">{reg.institution}</p>
                              {reg.major && <p className="text-[11px] text-blue-sail/60">{reg.major}</p>}
                              <p className="text-[10px] text-blue-sail/50">📍 {reg.city}</p>
                            </td>
                            <td className="p-3">
                              <span className={`inline-block font-mono text-[10px] font-bold px-2 py-1 border border-blue-sail uppercase ${
                                reg.package_choice === 'Aspiring CEO'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : reg.package_choice === 'Rising CEO'
                                    ? 'bg-blue-100 text-blue-800'
                                    : reg.package_choice === 'Strategic CEO'
                                      ? 'bg-purple-100 text-purple-800'
                                      : 'bg-amber-100 text-amber-800'
                              }`}>
                                {reg.package_choice}
                              </span>
                            </td>
                            <td className="p-3 font-mono">
                              {reg.payment_method ? (
                                <span className="font-bold">{reg.payment_method}</span>
                              ) : (
                                <span className="text-blue-sail/40 italic">Free Task</span>
                              )}
                            </td>
                            <td className="p-3">
                              <select
                                value={reg.status}
                                onChange={(e) => updatePE1RegistrationStatus(reg.id, e.target.value as any)}
                                className={`font-mono text-[11px] font-bold px-2 py-1 border border-blue-sail outline-none uppercase cursor-pointer ${
                                  reg.status === 'confirmed'
                                    ? 'bg-emerald-500 text-white'
                                    : reg.status === 'rejected'
                                      ? 'bg-red-600 text-white'
                                      : 'bg-amber-400 text-blue-sail'
                                }`}
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="rejected">Rejected</option>
                              </select>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedPE1Reg(reg)}
                                className="bg-blue-sail hover:bg-barbera text-ballroom font-mono text-[10px] font-bold px-3 py-1.5 border border-blue-sail shadow-[2px_2px_0_0_#BD1B1F] uppercase tracking-wider cursor-pointer"
                              >
                                Detail
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <TablePagination
                    currentPage={pe1Page}
                    totalPages={Math.ceil(filteredPE1Regs.length / pe1PageSize) || 1}
                    totalItems={filteredPE1Regs.length}
                    pageSize={pe1PageSize}
                    onPageChange={setPE1Page}
                    onPageSizeChange={setPE1PageSize}
                  />
                </>
              )}
            </div>
          </div>
        )}

        {/* 2. SECTION TAB: STAFF APPLICATIONS & CSV EXPORT */}
        {activeTab === 'staff' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <h2 className="font-display font-black text-2xl uppercase">DATA PENDAFTAR STAFF TSF</h2>
                <p className="text-xs text-blue-sail/60">Tinjau seluruh pengajuan rekrutmen staff, ganti status penyeleksian, dan ekspor spreadsheets.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTabLoading(true);
                    fetchStaffApplications().finally(() => setTabLoading(false));
                  }}
                  className="bg-blue-sail hover:bg-decor hover:text-blue-sail text-white font-mono font-bold text-xs px-4 py-2.5 border-2 border-blue-sail shadow-[3px_3px_0_0_#BD1B1F] flex items-center space-x-1.5 cursor-pointer transition-all shrink-0"
                >
                  <Icon name="RefreshCw" size={14} className={tabLoading ? "animate-spin" : ""} />
                  <span>{tabLoading ? 'Memuat...' : 'Sinkronkan'}</span>
                </button>

                <button
                  id="staff-export-csv"
                  onClick={exportStaffCSV}
                  className="bg-green-600 hover:bg-green-700 text-white font-display font-bold text-xs uppercase px-5 py-2.5 rounded-none border-2 border-blue-sail tracking-widest flex items-center space-x-1.5 shadow-[3px_3px_0_0_#2A4C9E] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <Icon name="Download" size={14} className="stroke-[2.5px]" />
                  <span>EKSPOR CSV (EXCEL)</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            {staffApplications.length > 0 && (
              <div className="bg-ballroom p-4 border-4 border-blue-sail shadow-[4px_4px_0_0_#2A4C9E] flex flex-col md:flex-row md:items-end gap-3 text-blue-sail">
                <div className="flex-1 space-y-1.5 min-w-[200px]">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-blue-sail/70">
                    Filter Divisi / Subdivisi:
                  </label>
                  <select
                    value={filterDivision}
                    onChange={e => {
                      setFilterDivision(e.target.value);
                      if (!e.target.value) {
                        setFilterPriority('');
                      }
                      setStaffPage(1);
                    }}
                    className="w-full px-3 py-2 text-xs bg-white border-2 border-blue-sail rounded-none font-semibold outline-none focus:shadow-[2px_2px_0_0_#2A4C9E] cursor-pointer"
                  >
                    <option value="">-- Tampilkan Semua Divisi / Subdivisi --</option>
                    {divisions.map(d => {
                      if (d.sub_divisions && d.sub_divisions.length > 0) {
                        return (
                          <optgroup key={d.id} label={d.name} className="font-mono font-bold text-[10px] uppercase bg-ballroom text-blue-sail">
                            {d.sub_divisions.map((sub, idx) => {
                              const subName = typeof sub === 'string' ? sub : sub.name;
                              return (
                                <option key={`${d.id}-${idx}`} value={subName} className="font-sans normal-case text-xs bg-white text-blue-sail">
                                  {subName}
                                </option>
                              );
                            })}
                          </optgroup>
                        );
                      } else {
                        return (
                          <option key={d.id} value={d.name} className="font-sans font-semibold text-xs">
                            {d.name}
                          </option>
                        );
                      }
                    })}
                  </select>
                </div>

                <div className="w-full md:w-52 space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-blue-sail/70">
                    Prioritas Pilihan:
                  </label>
                  <select
                    value={filterPriority}
                    onChange={e => {
                      setFilterPriority(e.target.value);
                      setStaffPage(1);
                    }}
                    disabled={!filterDivision}
                    className="w-full px-3 py-2 text-xs bg-white border-2 border-blue-sail rounded-none font-semibold outline-none focus:shadow-[2px_2px_0_0_#2A4C9E] cursor-pointer disabled:bg-gray-100 disabled:border-blue-sail/20 disabled:text-blue-sail/30 disabled:cursor-not-allowed"
                  >
                    <option value="">Semua (Pilihan 1 & 2)</option>
                    <option value="p1">Hanya Pilihan 1</option>
                    <option value="p2">Hanya Pilihan 2</option>
                  </select>
                </div>

                {/* Sort By */}
                <div className="w-full md:w-56 space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-blue-sail/70">
                    Urutkan Pelamar:
                  </label>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={staffSortField}
                      onChange={e => setStaffSortField(e.target.value as any)}
                      className="flex-1 px-3 py-2 text-xs bg-white border-2 border-blue-sail rounded-none font-semibold outline-none cursor-pointer"
                    >
                      <option value="date">Tanggal Submit</option>
                      <option value="name">Nama Pelamar</option>
                      <option value="nim">NRP Pelamar</option>
                      <option value="status">Status Seleksi</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => setStaffSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                      className="p-2 bg-ballroom border-2 border-blue-sail text-xs font-mono font-bold hover:bg-decor transition-all cursor-pointer shrink-0"
                      title={`Urutan: ${staffSortOrder === 'asc' ? 'A-Z / Terlama' : 'Z-A / Terbaru'}`}
                    >
                      {staffSortOrder === 'asc' ? '▲ ASC' : '▼ DESC'}
                    </button>
                  </div>
                </div>

                {/* Search */}
                <div className="flex-1 min-w-[200px] space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-blue-sail/70">
                    Cari Pelamar:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Cari nama, NRP, jurusan, email..."
                      value={searchStaffQuery}
                      onChange={e => {
                        setSearchStaffQuery(e.target.value);
                        setStaffPage(1);
                      }}
                      className="w-full px-3 py-2 pl-8 text-xs bg-white border-2 border-blue-sail rounded-none outline-none"
                    />
                    <Icon name="Search" size={14} className="absolute left-2.5 top-2.5 text-blue-sail/50" />
                  </div>
                </div>

                {/* Reset Button */}
                {(filterDivision || filterPriority || searchStaffQuery) && (
                  <button
                    type="button"
                    onClick={() => {
                      setFilterDivision('');
                      setFilterPriority('');
                      setSearchStaffQuery('');
                      setStaffPage(1);
                    }}
                    className="bg-red-inferno hover:bg-barbera text-white font-mono font-bold text-[10px] uppercase px-4 py-2 rounded-none border border-red-inferno tracking-wide flex items-center justify-center space-x-1.5 transition-all shadow-[2px_2px_0_0_#BD1B1F] cursor-pointer h-[38px] shrink-0"
                  >
                    <Icon name="XCircle" size={14} />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            )}

            {/* Table data */}
            <div className="bg-white rounded-none border-4 border-blue-sail shadow-[6px_6px_0_0_#2A4C9E] overflow-hidden">
              {tabLoading ? (
                <div className="p-12 text-center text-blue-sail space-y-3">
                  <div className="w-8 h-8 border-4 border-blue-sail border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-semibold">Memuat data pelamar staff...</p>
                </div>
              ) : staffApplications.length === 0 ? (
                <div className="p-12 text-center">
                  <Icon name="Users" size={40} className="text-blue-sail/30 mx-auto mb-2" />
                  <p className="text-sm font-semibold">Belum Ada Pelamar Staff Terdaftar</p>
                  <p className="text-xs text-blue-sail/50 mt-1">Coba isi Formulir Pendaftaran Staff di menu utama untuk merekam data simulasi.</p>
                </div>
              ) : filteredStaffApplications.length === 0 ? (
                <div className="p-12 text-center text-blue-sail">
                  <Icon name="Search" size={40} className="text-blue-sail/30 mx-auto mb-2" />
                  <p className="text-sm font-semibold">Tidak ada pelamar yang cocok</p>
                  <p className="text-xs text-blue-sail/50 mt-1">Gunakan tombol 'Reset Filter' untuk melihat seluruh pelamar kembali.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterDivision('');
                      setFilterPriority('');
                      setSearchStaffQuery('');
                      setStaffPage(1);
                    }}
                    className="mt-4 bg-blue-sail hover:bg-red-inferno text-white font-mono font-bold text-[10px] uppercase px-4 py-2 rounded-none border border-blue-sail transition-all shadow-[2px_2px_0_0_#BD1B1F] cursor-pointer inline-flex items-center space-x-1"
                  >
                    <Icon name="XCircle" size={12} />
                    <span>Reset Filter</span>
                  </button>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-sans border-collapse">
                      <thead className="bg-blue-sail text-ballroom uppercase font-display font-bold border-b-4 border-decor">
                        <tr>
                          <th className="p-4 cursor-pointer select-none hover:bg-blue-sail/90" onClick={() => {
                            if (staffSortField === 'name') setStaffSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                            else { setStaffSortField('name'); setStaffSortOrder('asc'); }
                          }}>
                            <div className="flex items-center gap-1.5">
                              <span>Pelamar</span>
                              {staffSortField === 'name' && (staffSortOrder === 'asc' ? '▲' : '▼')}
                            </div>
                          </th>
                          <th className="p-4">Akademik & Fakultas</th>
                          <th className="p-4">Prioritas 1 & 2</th>
                          <th className="p-4">Alasan / Motivasi</th>
                          <th className="p-4">CV File</th>
                          <th className="p-4 cursor-pointer select-none hover:bg-blue-sail/90" onClick={() => {
                            if (staffSortField === 'status') setStaffSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                            else { setStaffSortField('status'); setStaffSortOrder('asc'); }
                          }}>
                            <div className="flex items-center gap-1.5">
                              <span>Status Seleksi</span>
                              {staffSortField === 'status' && (staffSortOrder === 'asc' ? '▲' : '▼')}
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-blue-sail/15">
                        {paginatedStaffApplications.map(app => (
                          <tr key={app.id} className="hover:bg-gray-50/50">
                            <td className="p-4 space-y-1 max-w-[180px]">
                              <p className="font-bold text-blue-sail uppercase">{app.full_name}</p>
                              <p className="font-mono text-[10px] text-blue-sail/50 font-semibold">NRP: {app.nim}</p>
                              <p className="font-mono text-[10px] text-blue-sail/50">WA: {app.phone}</p>
                              <p className="font-mono text-[10px] text-blue-sail/50">{app.email}</p>
                              <button
                                onClick={() => setSelectedApplicant(app)}
                                className="mt-2 w-full bg-blue-sail hover:bg-red-inferno text-white font-mono font-bold text-[10px] uppercase py-1 px-2 border border-blue-sail hover:border-red-inferno transition-all flex items-center justify-center space-x-1 cursor-pointer"
                              >
                                <Icon name="Eye" size={12} />
                                <span>Lihat Jawaban</span>
                              </button>
                            </td>
                            <td className="p-4 space-y-0.5">
                              <p className="font-bold text-red-inferno text-xs uppercase">{app.faculty || 'FSAD'}</p>
                              <p className="font-semibold text-blue-sail">{app.department || app.major}</p>
                            </td>
                            <td className="p-4 space-y-1">
                              <p className="text-red-inferno font-semibold">P1: {app.division_priority_1}</p>
                              <p className="text-blue-sail/60 font-semibold">P2: {app.division_priority_2}</p>
                            </td>
                            <td className="p-4 max-w-[240px]">
                              <p className="line-clamp-3 leading-relaxed text-blue-sail/80 italic font-medium">"{app.motivation}"</p>
                            </td>
                            <td className="p-4">
                              {(app.cv_link || app.file_url) ? (
                                <a
                                  href={app.cv_link || app.file_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-red-inferno hover:text-barbera font-mono font-bold flex items-center space-x-1"
                                >
                                  <Icon name="FileText" size={14} />
                                  <span>CV / Link</span>
                                </a>
                              ) : (
                                <span className="text-blue-sail/40 font-mono">None</span>
                              )}
                            </td>
                            <td className="p-4 space-y-2">
                              {/* Dropdown status changer */}
                              <select
                                value={app.status}
                                onChange={e => updateStaffApplicationStatus(app.id, e.target.value as any)}
                                className={`px-2.5 py-1.5 font-bold uppercase rounded-none border-2 text-[10px] outline-none font-mono ${
                                  app.status === 'accepted' 
                                    ? 'bg-green-50 border-green-400 text-green-700 focus:shadow-[2px_2px_0_0_#15803d]' 
                                    : app.status === 'rejected'
                                      ? 'bg-red-50 border-red-400 text-red-600 focus:shadow-[2px_2px_0_0_#b91c1c]'
                                      : 'bg-yellow-50 border-yellow-400 text-yellow-700 focus:shadow-[2px_2px_0_0_#ca8a04]'
                                }`}
                              >
                                <option value="pending">PENDING / WAITLIST</option>
                                <option value="accepted">ACCEPTED / LOLOS</option>
                                <option value="rejected">REJECTED / GAGAL</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <TablePagination
                    currentPage={staffPage}
                    totalPages={Math.ceil(filteredStaffApplications.length / staffPageSize) || 1}
                    totalItems={filteredStaffApplications.length}
                    pageSize={staffPageSize}
                    onPageChange={setStaffPage}
                    onPageSizeChange={setStaffPageSize}
                  />
                </>
              )}
            </div>
          </div>
        )}

        {/* 3. SECTION TAB: COMPETITIONS REGISTRATIONS & VENDOR SEWA BOOTH */}
        {activeTab === 'competitions' && (
          <div className="space-y-8">
            
            {/* LOMBA DATABASE */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <h2 className="font-display font-black text-xl uppercase">PENDAFTAR COMPETITION BPC / BCC</h2>
                  <p className="text-xs text-blue-sail/60">Daftar seluruh tim yang mendaftar Business Plan Competition (BPC) dan Business Case Competition (BCC) TSF 2026.</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTabLoading(true);
                      fetchCompetitionRegistrations().finally(() => setTabLoading(false));
                    }}
                    className="bg-blue-sail hover:bg-decor hover:text-blue-sail text-white font-mono font-bold text-xs px-4 py-2.5 border-2 border-blue-sail shadow-[3px_3px_0_0_#BD1B1F] flex items-center space-x-1.5 cursor-pointer transition-all shrink-0"
                  >
                    <Icon name="RefreshCw" size={14} className={tabLoading ? "animate-spin" : ""} />
                    <span>{tabLoading ? 'Memuat...' : 'Sinkronkan'}</span>
                  </button>

                  <button
                    id="comp-export-csv"
                    onClick={exportCompCSV}
                    className="bg-green-600 hover:bg-green-700 text-white font-display font-bold text-xs uppercase px-5 py-2.5 rounded-none border-2 border-blue-sail tracking-widest flex items-center space-x-1.5 shadow-[3px_3px_0_0_#2A4C9E] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer"
                  >
                    <Icon name="Download" size={14} className="stroke-[2.5px]" />
                    <span>EKSPOR CSV LOMBA</span>
                  </button>
                </div>
              </div>

              {/* Filter & Search Panel for Competition */}
              <div className="bg-ballroom border-4 border-blue-sail p-4 sm:p-5 shadow-[6px_6px_0_0_#2A4C9E] space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-blue-sail/20 pb-3">
                  <div className="flex items-center gap-2">
                    <Icon name="Filter" size={18} className="text-red-inferno" />
                    <h3 className="font-display font-black text-sm uppercase text-blue-sail">
                      FILTER &amp; PENCARIAN TIM PENDAFTAR
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-sail text-decor font-display font-black text-[11px] px-3 py-1 border border-decor uppercase">
                      MENAMPILKAN {filteredCompetitionRegistrations.length} DARI {competitionRegistrations.length} TIM
                    </span>
                    {(compFilterType !== 'all' || compFilterCategory !== 'all' || compFilterPreliminary !== 'all' || compFilterPayment !== 'all' || compFilterSemifinal !== 'all' || compFilterFinal !== 'all' || compSearchQuery !== '') && (
                      <button
                        type="button"
                        onClick={() => {
                          setCompFilterType('all');
                          setCompFilterCategory('all');
                          setCompFilterPreliminary('all');
                          setCompFilterPayment('all');
                          setCompFilterSemifinal('all');
                          setCompFilterFinal('all');
                          setCompSearchQuery('');
                        }}
                        className="bg-red-inferno hover:bg-red-700 text-white font-display font-bold text-[10px] uppercase px-2.5 py-1 border border-blue-sail flex items-center gap-1 cursor-pointer"
                      >
                        <Icon name="RotateCcw" size={12} />
                        <span>RESET FILTER</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-sail/50" />
                  <input
                    type="text"
                    placeholder="Cari berdasarkan nama tim, ketua, email, nomor whatsapp, atau institusi..."
                    value={compSearchQuery}
                    onChange={e => setCompSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border-2 border-blue-sail text-xs font-sans font-semibold text-blue-sail placeholder-blue-sail/40 focus:outline-none focus:border-decor"
                  />
                </div>

                {/* Dropdown Filters Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 gap-2.5 text-xs">
                  {/* Cabang Lomba */}
                  <div className="space-y-1">
                    <label className="font-display font-bold text-[10px] text-blue-sail/70 uppercase block">Cabang Lomba</label>
                    <select
                      value={compFilterType}
                      onChange={e => {
                        setCompFilterType(e.target.value as any);
                        setCompPage(1);
                      }}
                      className="w-full bg-white border border-blue-sail p-1.5 font-sans font-bold text-[11px] text-blue-sail"
                    >
                      <option value="all">Semua Cabang</option>
                      <option value="BPC">BPC (Business Plan)</option>
                      <option value="BCC">BCC (Business Case)</option>
                    </select>
                  </div>

                  {/* Jenjang */}
                  <div className="space-y-1">
                    <label className="font-display font-bold text-[10px] text-blue-sail/70 uppercase block">Jenjang Pendidikan</label>
                    <select
                      value={compFilterCategory}
                      onChange={e => {
                        setCompFilterCategory(e.target.value as any);
                        setCompPage(1);
                      }}
                      className="w-full bg-white border border-blue-sail p-1.5 font-sans font-bold text-[11px] text-blue-sail"
                    >
                      <option value="all">Semua Jenjang</option>
                      <option value="SMA/Sederajat">SMA / Sederajat</option>
                      <option value="Mahasiswa">Mahasiswa</option>
                    </select>
                  </div>

                  {/* Preliminary */}
                  <div className="space-y-1">
                    <label className="font-display font-bold text-[10px] text-blue-sail/70 uppercase block">Status Preliminary</label>
                    <select
                      value={compFilterPreliminary}
                      onChange={e => {
                        setCompFilterPreliminary(e.target.value as any);
                        setCompPage(1);
                      }}
                      className="w-full bg-white border border-blue-sail p-1.5 font-sans font-bold text-[11px] text-blue-sail"
                    >
                      <option value="all">Semua Preliminary</option>
                      <option value="pending">Kondisi Awal (Pending)</option>
                      <option value="passed">✓ Lolos Preliminary</option>
                      <option value="rejected">✕ Tidak Lolos Preliminary</option>
                    </select>
                  </div>

                  {/* Pembayaran Semi Final */}
                  <div className="space-y-1">
                    <label className="font-display font-bold text-[10px] text-blue-sail/70 uppercase block">Bayar Semi Final</label>
                    <select
                      value={compFilterPayment}
                      onChange={e => {
                        setCompFilterPayment(e.target.value as any);
                        setCompPage(1);
                      }}
                      className="w-full bg-white border border-blue-sail p-1.5 font-sans font-bold text-[11px] text-blue-sail"
                    >
                      <option value="all">Semua Bayar</option>
                      <option value="none">Belum Bayar</option>
                      <option value="pending">Menunggu Verifikasi</option>
                      <option value="verified">✓ Diverifikasi</option>
                    </select>
                  </div>

                  {/* Semi Final */}
                  <div className="space-y-1">
                    <label className="font-display font-bold text-[10px] text-blue-sail/70 uppercase block">Status Semi Final</label>
                    <select
                      value={compFilterSemifinal}
                      onChange={e => {
                        setCompFilterSemifinal(e.target.value as any);
                        setCompPage(1);
                      }}
                      className="w-full bg-white border border-blue-sail p-1.5 font-sans font-bold text-[11px] text-blue-sail"
                    >
                      <option value="all">Semua Semi Final</option>
                      <option value="pending">Pending Semi Final</option>
                      <option value="passed">✓ Lolos Semi Final</option>
                      <option value="rejected">✕ Tidak Lolos Semi Final</option>
                    </select>
                  </div>

                  {/* Final */}
                  <div className="space-y-1">
                    <label className="font-display font-bold text-[10px] text-blue-sail/70 uppercase block">Status Grand Final</label>
                    <select
                      value={compFilterFinal}
                      onChange={e => {
                        setCompFilterFinal(e.target.value as any);
                        setCompPage(1);
                      }}
                      className="w-full bg-white border border-blue-sail p-1.5 font-sans font-bold text-[11px] text-blue-sail"
                    >
                      <option value="all">Semua Grand Final</option>
                      <option value="pending">Pending Final</option>
                      <option value="passed">✓ Lolos Final (Juara)</option>
                      <option value="rejected">✕ Tidak Lolos Final</option>
                    </select>
                  </div>

                  {/* Urutkan Berdasarkan */}
                  <div className="space-y-1 col-span-2">
                    <label className="font-display font-bold text-[10px] text-blue-sail/70 uppercase block">Urutkan Data</label>
                    <div className="flex gap-1">
                      <select
                        value={compSortField}
                        onChange={e => setCompSortField(e.target.value as any)}
                        className="flex-1 bg-white border border-blue-sail p-1.5 font-sans font-bold text-[11px] text-blue-sail"
                      >
                        <option value="date">Waktu Pendaftaran</option>
                        <option value="team_name">Nama Tim</option>
                        <option value="leader_name">Nama Ketua</option>
                        <option value="institution">Institusi</option>
                        <option value="type">Cabang Lomba</option>
                        <option value="status">Status Tahapan</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => setCompSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        className="px-2 bg-blue-sail text-decor font-mono font-bold text-xs border border-blue-sail hover:bg-red-inferno hover:text-white transition-all cursor-pointer shrink-0"
                        title={compSortOrder === 'asc' ? 'Urutan: A-Z / Terlama' : 'Urutan: Z-A / Terbaru'}
                      >
                        {compSortOrder === 'asc' ? '▲ ASC' : '▼ DESC'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table Data */}
              <div className="bg-white rounded-none border-4 border-blue-sail shadow-[6px_6px_0_0_#2A4C9E] overflow-hidden">
                {tabLoading ? (
                  <div className="p-12 text-center text-blue-sail space-y-3">
                    <div className="w-8 h-8 border-4 border-blue-sail border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm font-semibold">Memuat data pendaftar kompetisi...</p>
                  </div>
                ) : filteredCompetitionRegistrations.length === 0 ? (
                  <div className="p-12 text-center space-y-3">
                    <Icon name="Trophy" size={40} className="text-blue-sail/30 mx-auto" />
                    <div>
                      <p className="text-sm font-semibold text-blue-sail">
                        {competitionRegistrations.length === 0 ? 'Belum Ada Tim Pendaftar Yang Terdeteksi' : 'Tidak Ada Tim Yang Sesuai Filter & Pencarian'}
                      </p>
                      <p className="text-xs text-blue-sail/50 mt-1">
                        {competitionRegistrations.length === 0
                          ? 'Silakan refresh atau pastikan koneksi backend server aktif.'
                          : `Terdapat total ${competitionRegistrations.length} tim terdaftar, tetapi tidak ada yang cocok dengan kombinasi filter saat ini.`}
                      </p>
                    </div>
                    {competitionRegistrations.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setCompFilterType('all');
                          setCompFilterCategory('all');
                          setCompFilterPreliminary('all');
                          setCompFilterPayment('all');
                          setCompFilterSemifinal('all');
                          setCompFilterFinal('all');
                          setCompSearchQuery('');
                          setCompPage(1);
                        }}
                        className="bg-decor hover:bg-decor/90 text-blue-sail font-display font-black text-xs uppercase px-5 py-2.5 border-2 border-blue-sail shadow-[3px_3px_0_0_#BD1B1F] cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Icon name="RotateCcw" size={14} />
                        <span>TAMPILKAN SEMUA {competitionRegistrations.length} TIM (RESET FILTER)</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-sans border-collapse">
                        <thead className="bg-blue-sail text-ballroom uppercase font-display font-bold border-b-4 border-decor">
                          <tr>
                            <th className="p-4 cursor-pointer select-none hover:bg-blue-sail/90" onClick={() => {
                              if (compSortField === 'team_name') setCompSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                              else { setCompSortField('team_name'); setCompSortOrder('asc'); }
                            }}>
                              <div className="flex items-center gap-1.5">
                                <span>Identitas Tim</span>
                                {compSortField === 'team_name' && (compSortOrder === 'asc' ? '▲' : '▼')}
                              </div>
                            </th>
                            <th className="p-4 cursor-pointer select-none hover:bg-blue-sail/90" onClick={() => {
                              if (compSortField === 'type') setCompSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                              else { setCompSortField('type'); setCompSortOrder('asc'); }
                            }}>
                              <div className="flex items-center gap-1.5">
                                <span>Cabang &amp; Jenjang</span>
                                {compSortField === 'type' && (compSortOrder === 'asc' ? '▲' : '▼')}
                              </div>
                            </th>
                            <th className="p-4">Detail Jawaban</th>
                            <th className="p-4">Task Preliminary</th>
                            <th className="p-4 cursor-pointer select-none hover:bg-blue-sail/90" onClick={() => {
                              if (compSortField === 'status') setCompSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                              else { setCompSortField('status'); setCompSortOrder('asc'); }
                            }}>
                              <div className="flex items-center gap-1.5">
                                <span>Status &amp; Kontrol Kelolosan</span>
                                {compSortField === 'status' && (compSortOrder === 'asc' ? '▲' : '▼')}
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-blue-sail/15">
                          {paginatedCompetitionRegistrations.map(reg => {
                            const compType = reg.competition_type || (reg.category_id?.includes('BCC') ? 'BCC' : 'BPC');
                            const eduCat = reg.education_category || (reg.category_id?.includes('SMA') ? 'SMA/Sederajat' : 'Mahasiswa');
                            const isBPC = compType === 'BPC';

                            return (
                              <tr key={reg.id} className="hover:bg-gray-50/50">
                                <td className="p-4 space-y-1">
                                  <p className="font-bold text-blue-sail uppercase text-sm">{reg.team_name}</p>
                                  <p className="font-medium text-blue-sail/80">Ketua: {reg.leader_name}</p>
                                  <p className="font-mono text-[10px] text-blue-sail/60">WA: {reg.contact}</p>
                                  <p className="font-mono text-[10px] text-blue-sail/60">{reg.email}</p>
                                </td>
                                <td className="p-4 space-y-1">
                                  <span className="bg-blue-sail text-decor font-display font-black text-[10px] px-2.5 py-1 uppercase border border-decor inline-block">
                                    {compType}
                                  </span>
                                  <p className="text-[11px] font-sans font-bold text-blue-sail/70">{eduCat}</p>
                                  <p className="text-[10px] font-sans text-blue-sail/50">Institusi: {reg.institution}</p>
                                </td>
                                <td className="p-4">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedCompDetail(reg)}
                                    className="bg-blue-sail hover:bg-barbera text-decor font-display font-black text-xs px-3.5 py-2 uppercase border border-blue-sail shadow-[3px_3px_0_0_#F6BB02] flex items-center gap-1.5 cursor-pointer shrink-0"
                                  >
                                    <Icon name="FileText" size={14} />
                                    <span>LIHAT DETAIL JAWABAN</span>
                                  </button>
                                </td>
                                <td className="p-4 space-y-1">
                                  {reg.preliminary_file_url ? (
                                    <div>
                                      <button
                                        type="button"
                                        onClick={() => openDoc(reg.preliminary_file_url, `Berkas Preliminary ${isBPC ? 'BMC' : 'Executive Summary'} - ${reg.team_name}`)}
                                        className="bg-decor text-blue-sail hover:bg-decor/90 font-display font-black text-[10px] px-2.5 py-1 uppercase border border-blue-sail inline-flex items-center gap-1 cursor-pointer"
                                      >
                                        <Icon name="FileCheck" size={12} />
                                        <span>LIHAT {isBPC ? 'BMC' : 'EXEC SUMMARY'}</span>
                                      </button>
                                      <p className="text-[10px] font-sans text-emerald-700 font-bold mt-1">✓ Sudah Mengumpulkan</p>
                                    </div>
                                  ) : (
                                    <span className="bg-gray-100 text-gray-500 font-display text-[10px] px-2 py-0.5 border border-gray-300 uppercase inline-block">
                                      Belum Submit
                                    </span>
                                  )}
                                </td>
                                <td className="p-4 space-y-2">
                                  <div className="flex flex-col gap-2 min-w-[170px]">
                                    {/* Preliminary Stage Controller */}
                                    <div className="space-y-1">
                                      <span className="text-[9px] font-display font-extrabold text-blue-sail/60 uppercase block">1. Preliminary Stage:</span>
                                      <div className="flex flex-col gap-1">
                                        <button
                                          onClick={() => updateCompetitionRegistrationStatus(reg.id, { status_preliminary: 'pending', status_stage: 'preliminary' })}
                                          className={`px-2 py-1 text-[9px] font-display font-bold uppercase border cursor-pointer ${
                                            (!reg.status_preliminary || reg.status_preliminary === 'pending')
                                              ? 'bg-amber-100 text-amber-800 border-amber-400 font-black'
                                              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                          }`}
                                        >
                                          ↺ Kondisi Awal (Pending)
                                        </button>
                                        <button
                                          onClick={() => updateCompetitionRegistrationStatus(reg.id, { status_preliminary: 'passed', status_stage: 'semifinal' })}
                                          className={`px-2 py-1 text-[9px] font-display font-bold uppercase border cursor-pointer ${
                                            reg.status_preliminary === 'passed'
                                              ? 'bg-emerald-600 text-white border-emerald-700 font-black'
                                              : 'bg-white text-emerald-700 border-emerald-400 hover:bg-emerald-50'
                                          }`}
                                        >
                                          ✓ Lolos Preliminary
                                        </button>
                                        <button
                                          onClick={() => updateCompetitionRegistrationStatus(reg.id, { status_preliminary: 'rejected', status_stage: 'preliminary' })}
                                          className={`px-2 py-1 text-[9px] font-display font-bold uppercase border cursor-pointer ${
                                            reg.status_preliminary === 'rejected'
                                              ? 'bg-red-inferno text-white border-red-700 font-black'
                                              : 'bg-white text-red-600 border-red-300 hover:bg-red-50'
                                          }`}
                                        >
                                          ✕ Tidak Lolos Preliminary
                                        </button>
                                      </div>
                                    </div>

                                    {/* Semi Final Stage Controller (If Lolos Preliminary) */}
                                    {reg.status_preliminary === 'passed' && (
                                      <div className="space-y-1 pt-1.5 border-t-2 border-dashed border-blue-sail/20">
                                        <span className="text-[9px] font-display font-extrabold text-blue-sail/60 uppercase block">2. Semi Final Stage:</span>
                                        <div className="flex flex-col gap-1">
                                          <button
                                            onClick={() => updateCompetitionRegistrationStatus(reg.id, { status_semifinal: 'pending', status_stage: 'semifinal' })}
                                            className={`px-2 py-1 text-[9px] font-display font-bold uppercase border cursor-pointer ${
                                              (!reg.status_semifinal || reg.status_semifinal === 'pending')
                                                ? 'bg-amber-100 text-amber-800 border-amber-400 font-black'
                                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                            }`}
                                          >
                                            ↺ Kondisi Awal Semi Final
                                          </button>
                                          <button
                                            onClick={() => updateCompetitionRegistrationStatus(reg.id, { status_semifinal: 'passed', status_stage: 'final' })}
                                            className={`px-2 py-1 text-[9px] font-display font-bold uppercase border cursor-pointer ${
                                              reg.status_semifinal === 'passed'
                                                ? 'bg-emerald-600 text-white border-emerald-700 font-black'
                                                : 'bg-white text-emerald-700 border-emerald-400 hover:bg-emerald-50'
                                            }`}
                                          >
                                            ✓ Lolos Semi Final
                                          </button>
                                          <button
                                            onClick={() => updateCompetitionRegistrationStatus(reg.id, { status_semifinal: 'rejected', status_stage: 'semifinal' })}
                                            className={`px-2 py-1 text-[9px] font-display font-bold uppercase border cursor-pointer ${
                                              reg.status_semifinal === 'rejected'
                                                ? 'bg-red-inferno text-white border-red-700 font-black'
                                                : 'bg-white text-red-600 border-red-300 hover:bg-red-50'
                                            }`}
                                          >
                                            ✕ Tidak Lolos Semi Final
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                    {/* Final Stage Controller (If Lolos Semi Final) */}
                                    {reg.status_semifinal === 'passed' && (
                                      <div className="space-y-1 pt-1.5 border-t-2 border-dashed border-blue-sail/20">
                                        <span className="text-[9px] font-display font-extrabold text-blue-sail/60 uppercase block">3. Grand Final Stage:</span>
                                        <div className="flex flex-col gap-1">
                                          <button
                                            onClick={() => updateCompetitionRegistrationStatus(reg.id, { status_final: 'pending', status_stage: 'final' })}
                                            className={`px-2 py-1 text-[9px] font-display font-bold uppercase border cursor-pointer ${
                                              (!reg.status_final || reg.status_final === 'pending')
                                                ? 'bg-amber-100 text-amber-800 border-amber-400 font-black'
                                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                            }`}
                                          >
                                            ↺ Kondisi Awal Final
                                          </button>
                                          <button
                                            onClick={() => updateCompetitionRegistrationStatus(reg.id, { status_final: 'passed', status_stage: 'final' })}
                                            className={`px-2 py-1 text-[9px] font-display font-bold uppercase border cursor-pointer ${
                                              reg.status_final === 'passed'
                                                ? 'bg-purple-700 text-white border-purple-800 font-black'
                                                : 'bg-white text-purple-700 border-purple-400 hover:bg-purple-50'
                                            }`}
                                          >
                                            🏆 Lolos Final (Juara)
                                          </button>
                                          <button
                                            onClick={() => updateCompetitionRegistrationStatus(reg.id, { status_final: 'rejected', status_stage: 'final' })}
                                            className={`px-2 py-1 text-[9px] font-display font-bold uppercase border cursor-pointer ${
                                              reg.status_final === 'rejected'
                                                ? 'bg-red-inferno text-white border-red-700 font-black'
                                                : 'bg-white text-red-600 border-red-300 hover:bg-red-50'
                                            }`}
                                          >
                                            ✕ Tidak Lolos Final
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <TablePagination
                      currentPage={compPage}
                      totalPages={Math.ceil(filteredCompetitionRegistrations.length / compPageSize) || 1}
                      totalItems={filteredCompetitionRegistrations.length}
                      pageSize={compPageSize}
                      onPageChange={setCompPage}
                      onPageSizeChange={setCompPageSize}
                    />
                  </>
                )}
              </div>
            </div>



            {/* SEWA BOOTH VENDOR DATABASE */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <h2 className="font-display font-black text-xl uppercase">PENGAJUAN SEWA BOOTH VENDOR</h2>
                  <p className="text-xs text-blue-sail/60">Tinjau proposal brand thrift baru yang mengajukan sewa gerai bazar utama.</p>
                </div>

                <button
                  id="vendor-export-csv"
                  onClick={exportVendorCSV}
                  className="bg-green-600 hover:bg-green-700 text-white font-display font-bold text-xs uppercase px-5 py-2.5 rounded-none border-2 border-blue-sail tracking-widest flex items-center space-x-1.5 shadow-[3px_3px_0_0_#2A4C9E] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <Icon name="Download" size={14} className="stroke-[2.5px]" />
                  <span>EKSPOR CSV BOOTH</span>
                </button>
              </div>

              {/* Search & Sort Panel for Vendor */}
              <div className="bg-ballroom border-4 border-blue-sail p-4 shadow-[6px_6px_0_0_#2A4C9E] flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[240px] relative">
                  <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-sail/50" />
                  <input
                    type="text"
                    placeholder="Cari brand thrift, deskripsi, kategori, atau nomor WA..."
                    value={vendorSearchQuery}
                    onChange={e => {
                      setVendorSearchQuery(e.target.value);
                      setVendorPage(1);
                    }}
                    className="w-full pl-9 pr-4 py-2 bg-white border-2 border-blue-sail text-xs font-sans font-semibold text-blue-sail placeholder-blue-sail/40 focus:outline-none focus:border-decor"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-display font-bold uppercase text-blue-sail/70">Urutkan:</span>
                  <select
                    value={vendorSortField}
                    onChange={e => setVendorSortField(e.target.value as any)}
                    className="bg-white border-2 border-blue-sail p-2 font-sans font-bold text-xs text-blue-sail"
                  >
                    <option value="name">Nama Brand</option>
                    <option value="category">Kategori Produk</option>
                    <option value="date">Terbaru</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setVendorSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="p-2 bg-blue-sail text-decor font-mono font-bold text-xs border-2 border-blue-sail hover:bg-red-inferno hover:text-white transition-all cursor-pointer"
                    title={vendorSortOrder === 'asc' ? 'Urutan: A-Z / Terlama' : 'Urutan: Z-A / Terbaru'}
                  >
                    {vendorSortOrder === 'asc' ? '▲ ASC' : '▼ DESC'}
                  </button>

                  {vendorSearchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setVendorSearchQuery('');
                        setVendorPage(1);
                      }}
                      className="bg-red-inferno hover:bg-red-700 text-white font-display font-bold text-[10px] uppercase px-3 py-2 border-2 border-blue-sail flex items-center gap-1 cursor-pointer"
                    >
                      <Icon name="RotateCcw" size={12} />
                      <span>RESET</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Table Data */}
              <div className="bg-white rounded-none border-4 border-blue-sail shadow-[6px_6px_0_0_#2A4C9E] overflow-hidden">
                {vendorApplications.length === 0 ? (
                  <div className="p-12 text-center">
                    <Icon name="Store" size={40} className="text-blue-sail/30 mx-auto mb-2" />
                    <p className="text-sm font-semibold">Belum Ada Vendor Booth Mengajukan</p>
                    <p className="text-xs text-blue-sail/50 mt-1">Isi Formulir pendaftaran vendor di menu Thrift Bazar untuk merekam data simulasi.</p>
                  </div>
                ) : filteredVendorApplications.length === 0 ? (
                  <div className="p-12 text-center space-y-3">
                    <Icon name="Search" size={40} className="text-blue-sail/30 mx-auto" />
                    <p className="text-sm font-semibold text-blue-sail">Tidak ada vendor yang cocok dengan pencarian "{vendorSearchQuery}"</p>
                    <button
                      type="button"
                      onClick={() => {
                        setVendorSearchQuery('');
                        setVendorPage(1);
                      }}
                      className="bg-decor text-blue-sail font-display font-bold text-xs uppercase px-4 py-2 border-2 border-blue-sail shadow-[2px_2px_0_0_#BD1B1F] cursor-pointer"
                    >
                      Reset Pencarian
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-sans border-collapse">
                        <thead className="bg-blue-sail text-ballroom uppercase font-display font-bold border-b-4 border-decor">
                          <tr>
                            <th className="p-4 cursor-pointer select-none hover:bg-blue-sail/90" onClick={() => {
                              if (vendorSortField === 'name') setVendorSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                              else { setVendorSortField('name'); setVendorSortOrder('asc'); }
                            }}>
                              <div className="flex items-center gap-1.5">
                                <span>Brand Thrift / Pendaftar</span>
                                {vendorSortField === 'name' && (vendorSortOrder === 'asc' ? '▲' : '▼')}
                              </div>
                            </th>
                            <th className="p-4 cursor-pointer select-none hover:bg-blue-sail/90" onClick={() => {
                              if (vendorSortField === 'category') setVendorSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                              else { setVendorSortField('category'); setVendorSortOrder('asc'); }
                            }}>
                              <div className="flex items-center gap-1.5">
                                <span>Kategori Produk</span>
                                {vendorSortField === 'category' && (vendorSortOrder === 'asc' ? '▲' : '▼')}
                              </div>
                            </th>
                            <th className="p-4">Proposal / Deskripsi Katalog</th>
                            <th className="p-4">WhatsApp Contact</th>
                            <th className="p-4">Aksi Hubungi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-blue-sail/15">
                          {paginatedVendorApplications.map(app => (
                            <tr key={app.id} className="hover:bg-gray-50/50">
                              <td className="p-4">
                                <p className="font-bold text-blue-sail uppercase">{app.vendor_name}</p>
                                <p className="text-[10px] text-blue-sail/50 font-mono mt-0.5">ID: {app.id}</p>
                              </td>
                              <td className="p-4">
                                <span className="bg-red-inferno text-ballroom font-mono text-[9px] font-bold px-2.5 py-1 rounded-none border border-red-700 uppercase tracking-widest inline-block">
                                  {app.product_category}
                                </span>
                              </td>
                              <td className="p-4 max-w-[280px]">
                                <p className="leading-relaxed text-blue-sail/85 italic font-medium">"{app.description}"</p>
                              </td>
                              <td className="p-4 font-mono font-bold">
                                {app.contact}
                              </td>
                              <td className="p-4">
                                <a
                                  href={`https://wa.me/${app.contact}?text=Halo%20${encodeURIComponent(app.vendor_name)},%20kami%20dari%20logistik%20Panitia%20TSF%20Bazar%20terkait%20pengajuan%20booth.`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="bg-decor hover:bg-decor/95 text-blue-sail font-display font-black text-[10px] px-3 py-1.5 rounded-none border border-blue-sail uppercase tracking-wider inline-block shadow-[2px_2px_0_0_#2A4C9E] cursor-pointer"
                                >
                                  Chat WhatsApp
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <TablePagination
                      currentPage={vendorPage}
                      totalPages={Math.ceil(filteredVendorApplications.length / vendorPageSize) || 1}
                      totalItems={filteredVendorApplications.length}
                      pageSize={vendorPageSize}
                      onPageChange={setVendorPage}
                      onPageSizeChange={setVendorPageSize}
                    />
                  </>
                )}
              </div>
            </div>

          </div>
        )}

        {/* 3.5 SECTION TAB: AKUN USER PENDAFTAR */}
        {(activeTab as string) === 'user-accounts' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-ballroom border-4 border-blue-sail p-6 shadow-[6px_6px_0_0_#2A4C9E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-black text-2xl uppercase text-blue-sail">
                  DAFTAR AKUN USER PENDAFTAR ({adminUsersList.length})
                </h3>
                <p className="text-xs text-blue-sail/70 font-sans mt-0.5">
                  Daftar seluruh akun user yang telah terregistrasi via Email di sistem TSF 2026.
                </p>
              </div>
              <button
                onClick={() => fetchAdminUsers().then(res => { if (res) setAdminUsersList(res); })}
                className="bg-decor hover:bg-decor/90 text-blue-sail font-display font-black text-xs uppercase px-4 py-2.5 border-2 border-blue-sail shadow-[2px_2px_0_0_#BD1B1F] cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Icon name="RefreshCw" size={14} />
                <span>REFRESH AKUN</span>
              </button>
            </div>

            {/* Search & Sort Bar for User Accounts */}
            <div className="bg-ballroom border-4 border-blue-sail p-4 shadow-[6px_6px_0_0_#2A4C9E] flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[240px] relative">
                <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-sail/50" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama user, email, atau ID user..."
                  value={userSearchQuery}
                  onChange={e => {
                    setUserSearchQuery(e.target.value);
                    setUserPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 bg-white border-2 border-blue-sail text-xs font-sans font-semibold text-blue-sail placeholder-blue-sail/40 focus:outline-none focus:border-decor"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-display font-bold uppercase text-blue-sail/70">Urutkan:</span>
                <select
                  value={userSortField}
                  onChange={e => setUserSortField(e.target.value as any)}
                  className="bg-white border-2 border-blue-sail p-2 font-sans font-bold text-xs text-blue-sail"
                >
                  <option value="name">Nama User</option>
                  <option value="email">Email</option>
                  <option value="created_at">Tanggal Daftar</option>
                </select>
                <button
                  type="button"
                  onClick={() => setUserSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="p-2 bg-blue-sail text-decor font-mono font-bold text-xs border-2 border-blue-sail hover:bg-red-inferno hover:text-white transition-all cursor-pointer"
                  title={userSortOrder === 'asc' ? 'Urutan: A-Z / Terlama' : 'Urutan: Z-A / Terbaru'}
                >
                  {userSortOrder === 'asc' ? '▲ ASC' : '▼ DESC'}
                </button>

                {userSearchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setUserSearchQuery('');
                      setUserPage(1);
                    }}
                    className="bg-red-inferno hover:bg-red-700 text-white font-display font-bold text-[10px] uppercase px-3 py-2 border-2 border-blue-sail flex items-center gap-1 cursor-pointer"
                  >
                    <Icon name="RotateCcw" size={12} />
                    <span>RESET</span>
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-none border-4 border-blue-sail shadow-[6px_6px_0_0_#2A4C9E] overflow-hidden">
              {adminUsersList.length === 0 ? (
                <div className="p-12 text-center">
                  <Icon name="Users" size={40} className="text-blue-sail/30 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-blue-sail">Belum Ada Akun User Terdaftar</p>
                  <p className="text-xs text-blue-sail/50 mt-1">Akun yang didaftarkan pengunjung akan otomatis muncul di tabel ini.</p>
                </div>
              ) : filteredAdminUsersList.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <Icon name="Search" size={40} className="text-blue-sail/30 mx-auto" />
                  <p className="text-sm font-semibold text-blue-sail">Tidak ada user yang cocok dengan pencarian "{userSearchQuery}"</p>
                  <button
                    type="button"
                    onClick={() => {
                      setUserSearchQuery('');
                      setUserPage(1);
                    }}
                    className="bg-decor text-blue-sail font-display font-bold text-xs uppercase px-4 py-2 border-2 border-blue-sail shadow-[2px_2px_0_0_#BD1B1F] cursor-pointer"
                  >
                    Reset Pencarian
                  </button>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-sans border-collapse">
                      <thead className="bg-blue-sail text-ballroom uppercase font-display font-bold border-b-4 border-decor">
                        <tr>
                          <th className="p-4">ID User</th>
                          <th className="p-4 cursor-pointer select-none hover:bg-blue-sail/90" onClick={() => {
                            if (userSortField === 'name') setUserSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                            else { setUserSortField('name'); setUserSortOrder('asc'); }
                          }}>
                            <div className="flex items-center gap-1.5">
                              <span>Nama Lengkap</span>
                              {userSortField === 'name' && (userSortOrder === 'asc' ? '▲' : '▼')}
                            </div>
                          </th>
                          <th className="p-4 cursor-pointer select-none hover:bg-blue-sail/90" onClick={() => {
                            if (userSortField === 'email') setUserSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                            else { setUserSortField('email'); setUserSortOrder('asc'); }
                          }}>
                            <div className="flex items-center gap-1.5">
                              <span>Alamat Email</span>
                              {userSortField === 'email' && (userSortOrder === 'asc' ? '▲' : '▼')}
                            </div>
                          </th>
                          <th className="p-4">Metode Login</th>
                          <th className="p-4 cursor-pointer select-none hover:bg-blue-sail/90" onClick={() => {
                            if (userSortField === 'created_at') setUserSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                            else { setUserSortField('created_at'); setUserSortOrder('asc'); }
                          }}>
                            <div className="flex items-center gap-1.5">
                              <span>Tanggal Registrasi</span>
                              {userSortField === 'created_at' && (userSortOrder === 'asc' ? '▲' : '▼')}
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-blue-sail/15">
                        {paginatedAdminUsersList.map((user) => {
                          const formatDateSafe = (dateVal: any) => {
                            if (!dateVal) return '-';
                            let d = new Date(dateVal);
                            if (isNaN(d.getTime())) {
                              const num = Number(dateVal);
                              if (!isNaN(num)) d = new Date(num);
                            }
                            if (isNaN(d.getTime())) return String(dateVal);
                            return d.toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            });
                          };

                          return (
                            <tr key={user.id} className="hover:bg-gray-50/50">
                              <td className="p-4 font-mono font-bold text-blue-sail/60">
                                {user.id}
                              </td>
                              <td className="p-4 font-bold text-blue-sail uppercase">
                                {user.name}
                              </td>
                              <td className="p-4 font-sans text-blue-sail font-semibold">
                                {user.email}
                              </td>
                              <td className="p-4">
                                <span className={`px-2.5 py-1 text-[10px] font-display font-black uppercase border ${
                                  user.auth_provider === 'google'
                                    ? 'bg-blue-50 text-blue-600 border-blue-300'
                                    : 'bg-amber-50 text-amber-700 border-amber-300'
                                }`}>
                                  {user.auth_provider === 'google' ? 'Gmail / Google' : 'Email Manual'}
                                </span>
                              </td>
                              <td className="p-4 font-sans text-blue-sail/70 font-medium font-mono">
                                {formatDateSafe(user.created_at)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <TablePagination
                    currentPage={userPage}
                    totalPages={Math.ceil(filteredAdminUsersList.length / userPageSize) || 1}
                    totalItems={filteredAdminUsersList.length}
                    pageSize={userPageSize}
                    onPageChange={setUserPage}
                    onPageSizeChange={setUserPageSize}
                  />
                </>
              )}
            </div>
          </div>
        )}

        {/* 4. SECTION TAB: ACCOUNTS MANAGEMENT (ADD ADMIN ACCOUNTS) */}
        {activeTab === 'accounts' && (
          <div className="space-y-6 animate-fadeIn font-sans text-blue-sail">
            <div className="space-y-1">
              <h2 className="font-display font-black text-2xl uppercase">MANAJEMEN AKUN ADMIN CMS</h2>
              <p className="text-xs text-blue-sail/60">Tambahkan akun administrator baru atau hapus akun admin yang ada di sistem local storage.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form Tambah Akun */}
              <div className="lg:col-span-1 bg-ballroom p-6 border-4 border-blue-sail shadow-[6px_6px_0_0_#2A4C9E]">
                <h3 className="font-display font-black text-sm uppercase tracking-wider text-red-inferno border-b border-blue-sail/10 pb-2 mb-4 flex items-center gap-1.5">
                  <Icon name="UserPlus" size={16} />
                  <span>Tambah Akun Baru</span>
                </h3>
                
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const target = e.target as any;
                    const username = target.username.value.trim();
                    const password = target.password.value;
                    const confirmPass = target.confirmPassword.value;

                    if (!username || !password) {
                      alert('Username dan kata sandi wajib diisi!');
                      return;
                    }

                    if (password !== confirmPass) {
                      alert('Konfirmasi kata sandi tidak cocok!');
                      return;
                    }

                    if (adminAccounts.some(acc => acc.username.toLowerCase() === username.toLowerCase())) {
                      alert('Username sudah terdaftar!');
                      return;
                    }

                    try {
                      const token = localStorage.getItem('tsf_admin_token');
                      const res = await fetch('/api/auth/register', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ username, password })
                      });
                      if (res.ok) {
                        setAdminAccounts(prev => [...prev, { username }]);
                        target.reset();
                        alert(`Akun "${username}" berhasil ditambahkan.`);
                      } else {
                        const data = await res.json();
                        alert(data.message || 'Gagal menambahkan akun.');
                      }
                    } catch (err) {
                      alert('Koneksi ke server gagal.');
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-blue-sail/70">Username Admin</label>
                    <input
                      name="username"
                      type="text"
                      placeholder="Contoh: panitia_tsf"
                      className="w-full px-3 py-2 text-xs bg-white border-2 border-blue-sail rounded-none outline-none focus:shadow-[2px_2px_0_0_#2A4C9E]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-blue-sail/70">Kata Sandi</label>
                    <input
                      name="password"
                      type="password"
                      placeholder="Masukkan sandi..."
                      className="w-full px-3 py-2 text-xs bg-white border-2 border-blue-sail rounded-none outline-none focus:shadow-[2px_2px_0_0_#2A4C9E]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-blue-sail/70">Konfirmasi Kata Sandi</label>
                    <input
                      name="confirmPassword"
                      type="password"
                      placeholder="Ulangi sandi..."
                      className="w-full px-3 py-2 text-xs bg-white border-2 border-blue-sail rounded-none outline-none focus:shadow-[2px_2px_0_0_#2A4C9E]"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-decor hover:bg-decor/95 text-blue-sail font-display font-black text-xs uppercase py-2.5 rounded-none border-2 border-blue-sail tracking-widest shadow-[3px_3px_0_0_#BD1B1F] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer mt-2"
                  >
                    DAFTARKAN AKUN
                  </button>
                </form>
              </div>

              {/* Daftar Akun */}
              <div className="lg:col-span-2 bg-ballroom p-6 border-4 border-blue-sail shadow-[6px_6px_0_0_#F6BB02] space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-blue-sail/10 pb-2">
                  <h3 className="font-display font-black text-sm uppercase tracking-wider text-blue-sail flex items-center gap-1.5">
                    <Icon name="Users" size={16} />
                    <span>Daftar Akun Admin Aktif ({filteredAdminAccounts.length})</span>
                  </h3>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Icon name="Search" size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-blue-sail/50" />
                      <input
                        type="text"
                        placeholder="Cari username..."
                        value={adminAccSearchQuery}
                        onChange={e => {
                          setAdminAccSearchQuery(e.target.value);
                          setAdminAccPage(1);
                        }}
                        className="pl-7 pr-3 py-1 bg-white border border-blue-sail text-xs font-sans text-blue-sail placeholder-blue-sail/40 focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setAdminAccSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                      className="px-2 py-1 bg-blue-sail text-decor font-mono font-bold text-[10px] border border-blue-sail hover:bg-red-inferno hover:text-white transition-all cursor-pointer"
                      title={adminAccSortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                    >
                      {adminAccSortOrder === 'asc' ? '▲ A-Z' : '▼ Z-A'}
                    </button>
                    {adminAccSearchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setAdminAccSearchQuery('');
                          setAdminAccPage(1);
                        }}
                        className="bg-red-inferno text-white font-mono font-bold text-[10px] px-2 py-1 border border-blue-sail cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {filteredAdminAccounts.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <Icon name="Search" size={32} className="text-blue-sail/30 mx-auto" />
                    <p className="text-xs font-semibold text-blue-sail">Tidak ada akun yang cocok dengan "{adminAccSearchQuery}"</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b-2 border-blue-sail/25 font-display font-black uppercase text-[10px] tracking-wider">
                            <th className="p-3">No.</th>
                            <th className="p-3 cursor-pointer select-none hover:text-red-inferno" onClick={() => setAdminAccSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}>
                              <div className="flex items-center gap-1">
                                <span>Username</span>
                                <span>{adminAccSortOrder === 'asc' ? '▲' : '▼'}</span>
                              </div>
                            </th>
                            <th className="p-3">Kata Sandi</th>
                            <th className="p-3 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-sail/10">
                          {paginatedAdminAccounts.map((acc, idx) => {
                            const isPrimary = acc.username.toLowerCase() === 'admin';
                            const displayIdx = (adminAccPage - 1) * adminAccPageSize + idx + 1;
                            return (
                              <tr key={acc.username} className="hover:bg-blue-sail/[0.01]">
                                <td className="p-3 font-mono font-bold text-blue-sail/50">{displayIdx}</td>
                                <td className="p-3 font-semibold text-blue-sail">{acc.username}</td>
                                <td className="p-3 font-mono text-blue-sail/80">•••••••• (sandi)</td>
                                <td className="p-3 text-right">
                                  {isPrimary ? (
                                    <span className="text-[9px] font-mono text-blue-sail/40 uppercase font-bold italic bg-blue-sail/5 px-2 py-1 border border-blue-sail/10">
                                      Default Akun
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm(`Apakah Anda yakin ingin menghapus akun admin "${acc.username}"?`)) {
                                          const updated = adminAccounts.filter(a => a.username.toLowerCase() !== acc.username.toLowerCase());
                                          setAdminAccounts(updated);
                                          localStorage.setItem('tsf_admin_accounts', JSON.stringify(updated));
                                        }
                                      }}
                                      className="bg-red-50 hover:bg-red-inferno text-red-inferno hover:text-ballroom text-[10px] font-bold uppercase px-3 py-1.5 rounded-none border border-red-inferno transition-all cursor-pointer"
                                    >
                                      Hapus
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <TablePagination
                      currentPage={adminAccPage}
                      totalPages={Math.ceil(filteredAdminAccounts.length / adminAccPageSize) || 1}
                      totalItems={filteredAdminAccounts.length}
                      pageSize={adminAccPageSize}
                      onPageChange={setAdminAccPage}
                      onPageSizeChange={setAdminAccPageSize}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 5. SECTION TAB: DIVISIONS MANAGEMENT (CRUD) */}
        {activeTab === 'divisions' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <h2 className="font-display font-black text-2xl uppercase">MANAJEMEN DIVISI PANITIA</h2>
                <p className="text-xs text-blue-sail/60">Ubah divisi rekrutmen, kuota kepanitiaan, atau deskripsi tugas divisi secara dinamis.</p>
              </div>

              <button
                id="add-div-btn"
                onClick={() => {
                  setDivForm({ id: '', name: '', description: '', quota: 0, icon_name: 'Users', sub_divisions: [], jobdesk: [], skills: '' });
                  setIsDivModalOpen(true);
                }}
                className="bg-blue-sail hover:bg-barbera text-ballroom font-display font-black text-xs uppercase px-5 py-2.5 rounded-none border-2 border-decor tracking-widest flex items-center space-x-1.5 shadow-[3px_3px_0_0_#BD1B1F] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <Icon name="Plus" size={14} className="stroke-[3px]" />
                <span>TAMBAH DIVISI BARU</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {divisions.map(div => (
                <div key={div.id} className="bg-white p-5 rounded-none border-4 border-blue-sail flex flex-col justify-between items-start min-h-[16rem] h-auto shadow-[4px_4px_0_0_#BD1B1F] hover:shadow-[6px_6px_0_0_#BD1B1F] transition-all text-xs">
                  <div className="space-y-2 w-full">
                    <div className="flex items-center space-x-2">
                      <div className="bg-blue-sail/5 text-blue-sail p-1.5 rounded-none border border-blue-sail/20">
                        <Icon name={div.icon_name} size={16} />
                      </div>
                      <h4 className="font-display font-bold text-sm uppercase text-blue-sail truncate">{div.name}</h4>
                    </div>
                    <p className="line-clamp-3 leading-relaxed text-blue-sail/80 font-sans">{div.description}</p>
                    
                    {div.sub_divisions && div.sub_divisions.length > 0 && (
                      <div className="pt-2 space-y-1">
                        <p className="text-[10px] font-bold uppercase text-blue-sail/60 font-mono">Sub-Divisi:</p>
                        <div className="flex flex-wrap gap-1">
                          {div.sub_divisions.map((sub, idx) => (
                            <span key={idx} className="bg-blue-sail/5 text-blue-sail border border-blue-sail/15 text-[9px] px-1.5 py-0.5 font-sans font-medium">
                              {typeof sub === 'string' ? sub : sub.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t-2 border-blue-sail/10 pt-3 w-full flex items-center justify-end">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => {
                          setDivForm({
                            id: div.id,
                            name: div.name,
                            description: div.description,
                            quota: 0,
                            icon_name: div.icon_name,
                            sub_divisions: div.sub_divisions || [],
                            jobdesk: div.jobdesk || [],
                            skills: div.skills || ''
                          });
                          setIsDivModalOpen(true);
                        }}
                        className="bg-blue-sail/5 hover:bg-blue-sail hover:text-ballroom p-2 text-blue-sail rounded-none border border-blue-sail transition-colors cursor-pointer"
                      >
                        <Icon name="Edit" size={12} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Yakin hapus divisi "${div.name}"? Pelamar yang memilih divisi ini mungkin terganggu.`)) {
                            deleteDivision(div.id);
                          }
                        }}
                        className="bg-red-50 hover:bg-red-inferno hover:text-ballroom p-2 text-red-inferno rounded-none border border-red-inferno transition-colors cursor-pointer"
                      >
                        <Icon name="Trash2" size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. SECTION TAB: FORM CONTROL (QUESTION CONFIG) */}
        {activeTab === 'form-control' && localFormConfig && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <h2 className="font-display font-black text-2xl uppercase">PENGATURAN PERTANYAAN FORM</h2>
                <p className="text-xs text-blue-sail/60">Ubah label, placeholder, dan pertanyaan khusus per divisi pada formulir pendaftaran staff.</p>
              </div>

              <button
                onClick={handleSaveFormConfig}
                className="bg-decor hover:bg-decor/95 text-blue-sail font-display font-black text-xs uppercase px-6 py-3 rounded-none border-2 border-blue-sail tracking-widest flex items-center space-x-1.5 shadow-[3px_3px_0_0_#BD1B1F] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              >
                <Icon name="Save" size={14} className="stroke-[3px]" />
                <span>SIMPAN PERUBAHAN FORM</span>
              </button>
            </div>

            {/* Inner Sub-navigation Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-blue-sail/10 pb-4">
              {(['dataDiri', 'generalTask', 'berkas', 'divisionTasks'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFormSubTab(tab)}
                  className={`px-4 py-2 border-2 text-xs uppercase font-mono font-bold transition-all cursor-pointer ${
                    formSubTab === tab
                      ? 'bg-blue-sail text-white border-blue-sail shadow-[2px_2px_0_0_#BD1B1F]'
                      : 'bg-white text-blue-sail border-blue-sail/20 hover:border-blue-sail'
                  }`}
                >
                  {tab === 'dataDiri' && 'Data Diri'}
                  {tab === 'generalTask' && 'General Task'}
                  {tab === 'berkas' && 'Berkas & Dokumen'}
                  {tab === 'divisionTasks' && 'Division Task'}
                </button>
              ))}
            </div>

            {/* Form Fields container */}
            <div className="bg-white border-4 border-blue-sail p-6 shadow-[4px_4px_0_0_#2A4C9E] font-sans text-xs text-blue-sail">
              
              {/* DATA DIRI SUB-TAB */}
              {formSubTab === 'dataDiri' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-3 border-b border-blue-sail/10 pb-2">
                    <h3 className="font-display font-black text-sm uppercase tracking-wide flex items-center gap-1.5 text-red-inferno">
                      <Icon name="User" size={16} />
                      <span>Konfigurasi Form Data Diri</span>
                    </h3>
                    <button
                      type="button"
                      onClick={handleAddDataDiriField}
                      className="bg-blue-sail hover:bg-barbera text-white font-mono font-bold text-[10px] uppercase px-3 py-1.5 rounded-none border border-blue-sail tracking-wide flex items-center space-x-1 transition-all cursor-pointer"
                    >
                      <Icon name="Plus" size={12} className="stroke-[3px]" />
                      <span>Tambah Field</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {localFormConfig.dataDiri.map(field => (
                      <div key={field.id} className="space-y-3 bg-blue-sail/[0.02] p-4 border border-blue-sail/15">
                        <div className="flex justify-between items-center border-b border-blue-sail/10 pb-1.5">
                          <span className="font-mono font-bold text-red-inferno uppercase text-[10px]">ID: {field.id}</span>
                          <div className="flex items-center gap-2">
                            <span className="bg-blue-sail/10 px-2 py-0.5 font-bold uppercase text-[9px]">Field</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteDataDiriField(field.id)}
                              className="bg-red-inferno/10 hover:bg-red-inferno text-red-inferno hover:text-white p-1 rounded-none border border-red-inferno transition-all cursor-pointer"
                              title="Hapus Field"
                            >
                              <Icon name="Trash2" size={12} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="block font-bold uppercase tracking-wide text-blue-sail/70">Label Pertanyaan</label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={e => handleDataDiriChange(field.id, 'label', e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-white border-2 border-blue-sail rounded-none outline-none focus:shadow-[2px_2px_0_0_#2A4C9E]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block font-bold uppercase tracking-wide text-blue-sail/70">Placeholder / Petunjuk</label>
                          <input
                            type="text"
                            value={field.placeholder || ''}
                            onChange={e => handleDataDiriChange(field.id, 'placeholder', e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-white border-2 border-blue-sail rounded-none outline-none focus:shadow-[2px_2px_0_0_#2A4C9E]"
                          />
                        </div>

                        <div className="flex items-center pt-1">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={field.required !== false}
                              onChange={e => handleDataDiriChange(field.id, 'required', e.target.checked)}
                              className="h-3.5 w-3.5 border-2 border-blue-sail rounded-none"
                            />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-sail/75">Wajib Diisi (Required)</span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* GENERAL TASK SUB-TAB */}
              {formSubTab === 'generalTask' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-3 border-b border-blue-sail/10 pb-2">
                    <h3 className="font-display font-black text-sm uppercase tracking-wide flex items-center gap-1.5 text-red-inferno">
                      <Icon name="FileQuestion" size={16} />
                      <span>Konfigurasi Form General Task</span>
                    </h3>
                    <button
                      type="button"
                      onClick={handleAddGeneralTaskQuestion}
                      className="bg-blue-sail hover:bg-barbera text-white font-mono font-bold text-[10px] uppercase px-3 py-1.5 rounded-none border border-blue-sail tracking-wide flex items-center space-x-1 transition-all cursor-pointer"
                    >
                      <Icon name="Plus" size={12} className="stroke-[3px]" />
                      <span>Tambah Soal</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {localFormConfig.generalTask.map((q, idx) => (
                      <div key={q.id} className="space-y-3 bg-blue-sail/[0.02] p-4 border border-blue-sail/15">
                        <div className="flex justify-between items-center border-b border-blue-sail/10 pb-1.5">
                          <span className="font-mono font-bold text-red-inferno uppercase text-[10px]">No. {idx + 1} (ID: {q.id})</span>
                          <div className="flex items-center gap-2">
                            <span className="bg-blue-sail/10 px-2 py-0.5 font-bold uppercase text-[9px]">Soal</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteGeneralTaskQuestion(q.id)}
                              className="bg-red-inferno/10 hover:bg-red-inferno text-red-inferno hover:text-white p-1 rounded-none border border-red-inferno transition-all cursor-pointer"
                              title="Hapus Soal"
                            >
                              <Icon name="Trash2" size={12} />
                            </button>
                          </div>
                        </div>

                        {(() => {
                          const isStudyCase = q.text.toLowerCase().startsWith('study case:');
                          if (!isStudyCase) {
                            return (
                              <div className="space-y-1">
                                <label className="block font-bold uppercase tracking-wide text-blue-sail/70">Teks Pertanyaan</label>
                                <textarea
                                  rows={2}
                                  value={q.text}
                                  onChange={e => handleGeneralTaskChange(q.id, 'text', e.target.value)}
                                  className="w-full px-3 py-2 text-xs bg-white border-2 border-blue-sail rounded-none outline-none focus:shadow-[2px_2px_0_0_#2A4C9E]"
                                />
                                <div className="flex items-center gap-4 mt-1.5">
                                  <label className="flex items-center gap-1.5 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={false}
                                      onChange={() => {
                                        handleGeneralTaskChange(q.id, 'text', `Study Case: ${q.text}`);
                                      }}
                                      className="h-3.5 w-3.5 border-2 border-blue-sail rounded-none"
                                    />
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-sail/75">Format Soal Studi Kasus (Study Case)</span>
                                  </label>
                                </div>
                              </div>
                            );
                          }

                          const clean = q.text.replace(/^study case:\s*/i, '');
                          const hasDelimiter = clean.includes('|||');
                          const parts = clean.split('|||');
                          const contextVal = hasDelimiter ? parts[0].trim() : '';
                          const tasksVal = hasDelimiter ? parts[1].trim() : clean.trim();

                          return (
                            <div className="space-y-3 p-3 bg-red-inferno/[0.02] border border-red-inferno/10">
                              <div className="flex justify-between items-center border-b border-red-inferno/10 pb-1.5">
                                <span className="text-[10px] font-extrabold text-red-inferno uppercase tracking-wider">🛠️ PENGATURAN STUDY CASE</span>
                                <label className="flex items-center gap-1.5 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={true}
                                    onChange={() => {
                                      handleGeneralTaskChange(q.id, 'text', tasksVal);
                                    }}
                                    className="h-3.5 w-3.5 border-2 border-red-inferno rounded-none"
                                  />
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-inferno/75">Format Soal Studi Kasus (Study Case)</span>
                                </label>
                              </div>

                              <div className="flex items-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (hasDelimiter) {
                                      handleGeneralTaskChange(q.id, 'text', `Study Case: ${tasksVal}`);
                                    } else {
                                      handleGeneralTaskChange(q.id, 'text', `Study Case: Skenario baru di sini... ||| ${tasksVal}`);
                                    }
                                  }}
                                  className="text-[9px] font-extrabold bg-blue-sail text-white px-2 py-1 uppercase tracking-wide hover:bg-barbera cursor-pointer active:translate-y-0.5 transition-all shadow-[1px_1px_0_0_#BD1B1F] flex items-center gap-1"
                                >
                                  {hasDelimiter ? '❌ Hapus Skenario / Konteks' : '➕ Tambah Skenario / Konteks'}
                                </button>
                              </div>

                              {hasDelimiter && (
                                <div className="space-y-1 bg-white p-2 border border-blue-sail/10 animate-fadeIn">
                                  <label className="block text-[9px] font-bold uppercase tracking-wide text-blue-sail/70">Konteks / Skenario</label>
                                  <textarea
                                    rows={3}
                                    value={contextVal}
                                    placeholder="Tuliskan latar belakang, cerita, atau deskripsi skenario di sini..."
                                    onChange={e => {
                                      handleGeneralTaskChange(q.id, 'text', `Study Case: ${e.target.value} ||| ${tasksVal}`);
                                    }}
                                    className="w-full px-2 py-1 text-xs bg-white border border-blue-sail rounded-none outline-none focus:shadow-[2px_2px_0_0_#2A4C9E]"
                                  />
                                </div>
                              )}

                              <div className="space-y-1 bg-white p-2 border border-blue-sail/10">
                                <label className="block text-[9px] font-bold uppercase tracking-wide text-blue-sail/70">
                                  Tugas & Instruksi Penyelesaian
                                </label>
                                <textarea
                                  rows={4}
                                  value={tasksVal}
                                  placeholder="Tuliskan pertanyaan/tugas. Gunakan enter (baris baru) untuk memisahkan setiap poin pertanyaan."
                                  onChange={e => {
                                    const newTasks = e.target.value;
                                    if (hasDelimiter) {
                                      handleGeneralTaskChange(q.id, 'text', `Study Case: ${contextVal} ||| ${newTasks}`);
                                    } else {
                                      handleGeneralTaskChange(q.id, 'text', `Study Case: ${newTasks}`);
                                    }
                                  }}
                                  className="w-full px-2 py-1 text-xs bg-white border border-blue-sail rounded-none outline-none focus:shadow-[2px_2px_0_0_#2A4C9E]"
                                />
                              </div>

                              <FormattedQuestionPreview text={q.text} />
                            </div>
                          );
                        })()}

                        {q.id !== 'commitmentScale' && q.id !== 'paidIkoma' && (
                          <div className="space-y-1">
                            <label className="block font-bold uppercase tracking-wide text-blue-sail/70">Placeholder / Petunjuk</label>
                            <input
                              type="text"
                              value={q.placeholder || ''}
                              onChange={e => handleGeneralTaskChange(q.id, 'placeholder', e.target.value)}
                              className="w-full px-3 py-2 text-xs bg-white border-2 border-blue-sail rounded-none outline-none focus:shadow-[2px_2px_0_0_#2A4C9E]"
                            />
                          </div>
                        )}

                        <div className="flex items-center pt-1">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={q.required !== false}
                              onChange={e => handleGeneralTaskChange(q.id, 'required', e.target.checked)}
                              className="h-3.5 w-3.5 border-2 border-blue-sail rounded-none"
                            />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-sail/75">Wajib Diisi (Required)</span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* BERKAS SUB-TAB */}
              {formSubTab === 'berkas' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-3 border-b border-blue-sail/10 pb-2">
                    <h3 className="font-display font-black text-sm uppercase tracking-wide flex items-center gap-1.5 text-red-inferno">
                      <Icon name="FileText" size={16} />
                      <span>Konfigurasi Form Unggah Berkas</span>
                    </h3>
                    <button
                      type="button"
                      onClick={handleAddBerkasField}
                      className="bg-blue-sail hover:bg-barbera text-white font-mono font-bold text-[10px] uppercase px-3 py-1.5 rounded-none border border-blue-sail tracking-wide flex items-center space-x-1 transition-all cursor-pointer"
                    >
                      <Icon name="Plus" size={12} className="stroke-[3px]" />
                      <span>Tambah Berkas</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {localFormConfig.berkas.map(field => (
                      <div key={field.id} className="space-y-3 bg-blue-sail/[0.02] p-4 border border-blue-sail/15">
                        <div className="flex justify-between items-center border-b border-blue-sail/10 pb-1.5">
                          <span className="font-mono font-bold text-red-inferno uppercase text-[10px]">ID: {field.id}</span>
                          <div className="flex items-center gap-2">
                            <span className="bg-blue-sail/10 px-2 py-0.5 font-bold uppercase text-[9px]">Input</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteBerkasField(field.id)}
                              className="bg-red-inferno/10 hover:bg-red-inferno text-red-inferno hover:text-white p-1 rounded-none border border-red-inferno transition-all cursor-pointer"
                              title="Hapus Input"
                            >
                              <Icon name="Trash2" size={12} />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block font-bold uppercase tracking-wide text-blue-sail/70">Label Pertanyaan</label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={e => handleBerkasChange(field.id, 'label', e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-white border-2 border-blue-sail rounded-none outline-none focus:shadow-[2px_2px_0_0_#2A4C9E]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block font-bold uppercase tracking-wide text-blue-sail/70">Placeholder / Petunjuk</label>
                          <input
                            type="text"
                            value={field.placeholder || ''}
                            onChange={e => handleBerkasChange(field.id, 'placeholder', e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-white border-2 border-blue-sail rounded-none outline-none focus:shadow-[2px_2px_0_0_#2A4C9E]"
                          />
                        </div>

                        <div className="flex items-center pt-1">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={field.required !== false}
                              onChange={e => handleBerkasChange(field.id, 'required', e.target.checked)}
                              className="h-3.5 w-3.5 border-2 border-blue-sail rounded-none"
                            />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-sail/75">Wajib Diisi (Required)</span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DIVISION TASKS SUB-TAB */}
              {formSubTab === 'divisionTasks' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-blue-sail/10 pb-4">
                    <h3 className="font-display font-black text-sm uppercase tracking-wide flex items-center gap-1.5 text-red-inferno">
                      <Icon name="Folders" size={16} />
                      <span>Pertanyaan Khusus Per Divisi</span>
                    </h3>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold uppercase tracking-wider text-[10px]">Pilih Divisi/Subdivisi:</span>
                      <select
                        value={selectedConfigDivision}
                        onChange={e => setSelectedConfigDivision(e.target.value)}
                        className="px-3 py-1.5 border-2 border-blue-sail bg-white rounded-none outline-none font-bold text-xs uppercase text-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]"
                      >
                        <option value="">-- Pilih --</option>
                        {divisions.map(d => (
                          d.sub_divisions && d.sub_divisions.length > 0 ? (
                            <optgroup key={d.id} label={d.name}>
                              {d.sub_divisions.map(sub => {
                                const subName = typeof sub === 'string' ? sub : sub.name;
                                return <option key={subName} value={subName}>{subName}</option>;
                              })}
                            </optgroup>
                          ) : (
                            <option key={d.id} value={d.name}>{d.name}</option>
                          )
                        ))}
                        {/* Fallback to keys in config if they are not in divisions */}
                        {Object.keys(localFormConfig.divisionTasks).map(key => {
                          const isSelectable = divisions.some(d => d.name === key || (d.sub_divisions || []).some(sub => (typeof sub === 'string' ? sub : sub.name) === key));
                          if (!isSelectable) {
                            return <option key={key} value={key}>{key}</option>;
                          }
                          return null;
                        })}
                      </select>
                    </div>
                  </div>

                  {selectedConfigDivision ? (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <span className="bg-decor text-blue-sail font-mono text-[10px] font-bold px-2 py-0.5 border border-blue-sail">
                          {selectedConfigDivision}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleAddDivisionQuestion(selectedConfigDivision)}
                          className="bg-blue-sail hover:bg-barbera text-white font-mono font-bold text-[10px] uppercase px-3 py-1.5 rounded-none border border-blue-sail tracking-wide flex items-center space-x-1 hover:-translate-y-0.5 transition-all cursor-pointer shadow-[2px_2px_0_0_#BD1B1F]"
                        >
                          <Icon name="Plus" size={12} className="stroke-[3px]" />
                          <span>Tambah Soal</span>
                        </button>
                      </div>

                      <div className="space-y-4">
                        {(localFormConfig.divisionTasks[selectedConfigDivision] || []).length === 0 ? (
                          <div className="text-center py-8 bg-blue-sail/[0.02] border border-dashed border-blue-sail/20 text-blue-sail/50 font-bold uppercase italic">
                            Belum ada pertanyaan khusus untuk divisi ini. Formulir pendaftaran akan menggunakan Pertanyaan Bawaan (Default).
                          </div>
                        ) : (
                          (localFormConfig.divisionTasks[selectedConfigDivision] || []).map((q, idx) => (
                            <div key={q.id} className="bg-blue-sail/[0.02] p-5 border border-blue-sail/15 space-y-4 relative">
                              <button
                                type="button"
                                onClick={() => handleDeleteDivisionQuestion(selectedConfigDivision, q.id)}
                                className="absolute top-4 right-4 bg-red-inferno/10 hover:bg-red-inferno text-red-inferno hover:text-white p-1.5 rounded-none border border-red-inferno transition-all cursor-pointer"
                                title="Hapus Pertanyaan"
                              >
                                <Icon name="Trash2" size={14} />
                              </button>

                              <div className="flex items-center space-x-2 border-b border-blue-sail/10 pb-2 w-[calc(100%-2.5rem)]">
                                <span className="bg-blue-sail text-white font-mono text-[10px] font-bold w-5 h-5 flex items-center justify-center shrink-0 border border-blue-sail">
                                  {idx + 1}
                                </span>
                                <span className="font-mono text-blue-sail/50 text-[10px] font-bold">ID: {q.id}</span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2 space-y-1">
                                  {(() => {
                                    const isStudyCase = q.text.toLowerCase().startsWith('study case:');
                                    if (!isStudyCase) {
                                      return (
                                        <div className="space-y-1">
                                          <label className="block font-bold uppercase tracking-wide text-blue-sail/70">Teks Pertanyaan</label>
                                          <textarea
                                            rows={3}
                                            value={q.text}
                                            onChange={e => handleDivisionQuestionChange(selectedConfigDivision, q.id, 'text', e.target.value)}
                                            className="w-full px-3 py-2 text-xs bg-white border-2 border-blue-sail rounded-none outline-none focus:shadow-[2px_2px_0_0_#2A4C9E]"
                                          />
                                          <div className="flex items-center gap-4 mt-1.5">
                                            <label className="flex items-center gap-1.5 cursor-pointer">
                                              <input
                                                type="checkbox"
                                                checked={false}
                                                onChange={() => {
                                                  handleDivisionQuestionChange(selectedConfigDivision, q.id, 'text', `Study Case: ${q.text}`);
                                                }}
                                                className="h-3.5 w-3.5 border-2 border-blue-sail rounded-none"
                                              />
                                              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-sail/75">Format Soal Studi Kasus (Study Case)</span>
                                            </label>
                                          </div>
                                        </div>
                                      );
                                    }

                                    const clean = q.text.replace(/^study case:\s*/i, '');
                                    const hasDelimiter = clean.includes('|||');
                                    const parts = clean.split('|||');
                                    const contextVal = hasDelimiter ? parts[0].trim() : '';
                                    const tasksVal = hasDelimiter ? parts[1].trim() : clean.trim();

                                    return (
                                      <div className="space-y-3 p-3 bg-red-inferno/[0.02] border border-red-inferno/10">
                                        <div className="flex justify-between items-center border-b border-red-inferno/10 pb-1.5">
                                          <span className="text-[10px] font-extrabold text-red-inferno uppercase tracking-wider">🛠️ PENGATURAN STUDY CASE</span>
                                          <label className="flex items-center gap-1.5 cursor-pointer">
                                            <input
                                              type="checkbox"
                                              checked={true}
                                              onChange={() => {
                                                handleDivisionQuestionChange(selectedConfigDivision, q.id, 'text', tasksVal);
                                              }}
                                              className="h-3.5 w-3.5 border-2 border-red-inferno rounded-none"
                                            />
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-red-inferno/75">Format Soal Studi Kasus (Study Case)</span>
                                          </label>
                                        </div>

                                        <div className="flex items-center">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              if (hasDelimiter) {
                                                handleDivisionQuestionChange(selectedConfigDivision, q.id, 'text', `Study Case: ${tasksVal}`);
                                              } else {
                                                handleDivisionQuestionChange(selectedConfigDivision, q.id, 'text', `Study Case: Skenario baru di sini... ||| ${tasksVal}`);
                                              }
                                            }}
                                            className="text-[9px] font-extrabold bg-blue-sail text-white px-2 py-1 uppercase tracking-wide hover:bg-barbera cursor-pointer active:translate-y-0.5 transition-all shadow-[1px_1px_0_0_#BD1B1F] flex items-center gap-1"
                                          >
                                            {hasDelimiter ? '❌ Hapus Skenario / Konteks' : '➕ Tambah Skenario / Konteks'}
                                          </button>
                                        </div>

                                        {hasDelimiter && (
                                          <div className="space-y-1 bg-white p-2 border border-blue-sail/10 animate-fadeIn">
                                            <label className="block text-[9px] font-bold uppercase tracking-wide text-blue-sail/70">Konteks / Skenario</label>
                                            <textarea
                                              rows={3}
                                              value={contextVal}
                                              placeholder="Tuliskan latar belakang, cerita, atau deskripsi skenario di sini..."
                                              onChange={e => {
                                                handleDivisionQuestionChange(selectedConfigDivision, q.id, 'text', `Study Case: ${e.target.value} ||| ${tasksVal}`);
                                              }}
                                              className="w-full px-2 py-1 text-xs bg-white border border-blue-sail rounded-none outline-none focus:shadow-[2px_2px_0_0_#2A4C9E]"
                                            />
                                          </div>
                                        )}

                                        <div className="space-y-1 bg-white p-2 border border-blue-sail/10">
                                          <label className="block text-[9px] font-bold uppercase tracking-wide text-blue-sail/70">
                                            Tugas & Instruksi Penyelesaian
                                          </label>
                                          <textarea
                                            rows={4}
                                            value={tasksVal}
                                            placeholder="Tuliskan pertanyaan/tugas. Gunakan enter (baris baru) untuk memisahkan setiap poin pertanyaan."
                                            onChange={e => {
                                              const newTasks = e.target.value;
                                              if (hasDelimiter) {
                                                handleDivisionQuestionChange(selectedConfigDivision, q.id, 'text', `Study Case: ${contextVal} ||| ${newTasks}`);
                                              } else {
                                                handleDivisionQuestionChange(selectedConfigDivision, q.id, 'text', `Study Case: ${newTasks}`);
                                              }
                                            }}
                                            className="w-full px-2 py-1 text-xs bg-white border border-blue-sail rounded-none outline-none focus:shadow-[2px_2px_0_0_#2A4C9E]"
                                          />
                                        </div>

                                        <FormattedQuestionPreview text={q.text} />
                                      </div>
                                    );
                                  })()}
                                </div>

                                <div className="space-y-3">
                                  <div className="space-y-1">
                                    <label className="block font-bold uppercase tracking-wide text-blue-sail/70">Tipe Input</label>
                                    <select
                                      value={q.type}
                                      onChange={e => handleDivisionQuestionChange(selectedConfigDivision, q.id, 'type', e.target.value as any)}
                                      className="w-full px-3 py-2 text-xs bg-white border-2 border-blue-sail rounded-none outline-none focus:shadow-[2px_2px_0_0_#2A4C9E]"
                                    >
                                      <option value="text">Teks Deskriptif (Textarea)</option>
                                      <option value="select">Pilihan Ganda (Dropdown Select)</option>
                                    </select>
                                  </div>

                                  {q.type === 'select' && (
                                    <div className="space-y-1 animate-fadeIn">
                                      <label className="block font-bold uppercase tracking-wide text-blue-sail/70">Opsi Pilihan (Pisahkan dengan koma)</label>
                                      <input
                                        type="text"
                                        placeholder="Contoh: Ya, Tidak, Mungkin"
                                        value={q.options?.join(', ') || ''}
                                        onChange={e => handleDivisionQuestionChange(selectedConfigDivision, q.id, 'options', e.target.value)}
                                        className="w-full px-3 py-2 text-xs bg-white border-2 border-blue-sail rounded-none outline-none focus:shadow-[2px_2px_0_0_#2A4C9E]"
                                      />
                                    </div>
                                  )}

                                  <div className="flex items-center pt-1.5">
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={q.required !== false}
                                        onChange={e => handleDivisionQuestionChange(selectedConfigDivision, q.id, 'required', e.target.checked)}
                                        className="h-3.5 w-3.5 border-2 border-blue-sail rounded-none"
                                      />
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-sail/75">Wajib Diisi (Required)</span>
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-blue-sail/[0.02] border border-dashed border-blue-sail/20 text-blue-sail/50 font-bold uppercase italic">
                      Silakan pilih divisi di sudut kanan atas untuk mengelola pertanyaan khusus.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSaveFormConfig}
                className="bg-decor hover:bg-decor/95 text-blue-sail font-display font-black text-xs uppercase px-8 py-4 rounded-none border-2 border-blue-sail tracking-widest flex items-center space-x-2 shadow-[4px_4px_0_0_#BD1B1F] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              >
                <Icon name="Save" size={16} className="stroke-[3px]" />
                <span>SIMPAN PERUBAHAN FORMULIR</span>
              </button>
            </div>
          </div>
        )}

        {/* 9. SECTION TAB: SERVER HEALTH MONITOR & REAL-TIME LOGS */}
        {activeTab === 'server-health' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-blue-sail/20 pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-red-inferno uppercase tracking-widest block">
                  SISTEM PEMANTAUAN & DIAGNOSIS
                </span>
                <h2 className="font-display font-black text-2xl uppercase tracking-tight text-blue-sail">
                  KESEHATAN SERVER & LOG SISTEM
                </h2>
                <p className="text-xs text-blue-sail/70 mt-1">
                  Diagnosa pemakaian RAM, status database, identifikasi penumpukan file base64, dan riwayat log error secara real-time.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAutoRefreshHealth(!autoRefreshHealth)}
                  className={`px-3 py-2 text-xs font-display font-bold uppercase border-2 flex items-center gap-1.5 cursor-pointer transition-all ${
                    autoRefreshHealth
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-[2px_2px_0_0_#065f46]'
                      : 'bg-white text-blue-sail border-blue-sail/30 hover:border-blue-sail'
                  }`}
                >
                  <Icon name="RefreshCw" size={14} className={autoRefreshHealth ? 'animate-spin' : ''} />
                  <span>Auto-Refresh (5s): {autoRefreshHealth ? 'ON' : 'OFF'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    fetchServerHealth();
                    fetchServerLogs(logFilterLevel, logSearchText);
                  }}
                  disabled={healthLoading}
                  className="bg-decor hover:bg-decor/90 text-blue-sail font-display font-black text-xs uppercase px-4 py-2 border-2 border-blue-sail shadow-[3px_3px_0_0_#BD1B1F] flex items-center gap-1.5 cursor-pointer"
                >
                  <Icon name="RefreshCw" size={14} className={healthLoading ? 'animate-spin' : ''} />
                  <span>REFRESH SEKARANG</span>
                </button>
              </div>
            </div>

            {/* Metric Cards Grid */}
            {serverHealth ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Status Global */}
                  <div className={`p-4 border-4 ${
                    serverHealth.status === 'healthy'
                      ? 'bg-emerald-50/80 border-emerald-600 text-emerald-950 shadow-[4px_4px_0_0_#059669]'
                      : serverHealth.status === 'warning'
                        ? 'bg-amber-50/80 border-amber-500 text-amber-950 shadow-[4px_4px_0_0_#d97706]'
                        : 'bg-red-50/80 border-red-inferno text-red-950 shadow-[4px_4px_0_0_#BD1B1F]'
                  }`}>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider block opacity-70">
                      STATUS KESEHATAN
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`w-3 h-3 rounded-full ${
                        serverHealth.status === 'healthy' ? 'bg-emerald-500' : serverHealth.status === 'warning' ? 'bg-amber-500' : 'bg-red-500 animate-ping'
                      }`} />
                      <span className="font-display font-black text-xl uppercase">
                        {serverHealth.status === 'healthy' ? 'STABIL / SEHAT' : serverHealth.status === 'warning' ? 'WASPADA (WARNING)' : 'KRITIS (DOWN RISK)'}
                      </span>
                    </div>
                    <p className="text-[11px] font-sans mt-2 opacity-80">
                      Uptime: {Math.floor(serverHealth.uptimeSeconds / 3600)} jam {Math.floor((serverHealth.uptimeSeconds % 3600) / 60)} menit
                    </p>
                  </div>

                  {/* RAM Process */}
                  <div className="bg-white p-4 border-4 border-blue-sail shadow-[4px_4px_0_0_#2A4C9E]">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-sail/60 block">
                      RAM NODE.JS (RSS)
                    </span>
                    <p className="font-display font-black text-2xl text-blue-sail mt-1">
                      {serverHealth.processMemory.rssMB} MB
                    </p>
                    <div className="w-full bg-gray-200 h-2 mt-2 rounded-none overflow-hidden">
                      <div
                        className={`h-full ${serverHealth.processMemory.rssMB > 500 ? 'bg-red-500' : serverHealth.processMemory.rssMB > 250 ? 'bg-amber-500' : 'bg-blue-sail'}`}
                        style={{ width: `${Math.min(100, (serverHealth.processMemory.rssMB / 1024) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] font-mono text-blue-sail/70 mt-1">
                      Heap Digunakan: {serverHealth.processMemory.heapUsedMB} MB
                    </p>
                  </div>

                  {/* Database & Latency */}
                  <div className="bg-white p-4 border-4 border-blue-sail shadow-[4px_4px_0_0_#F6BB02]">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-sail/60 block">
                      DATABASE & KONEKSI
                    </span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`w-2.5 h-2.5 rounded-full ${serverHealth.database.status === 'ok' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <p className="font-display font-black text-xl text-blue-sail uppercase">
                        {serverHealth.database.status === 'ok' ? 'TERHUBUNG' : 'ERROR'}
                      </p>
                    </div>
                    <p className="text-[11px] font-mono text-blue-sail/80 mt-2">
                      Latency: <span className="font-bold">{serverHealth.database.latencyMs} ms</span>
                    </p>
                    <p className="text-[10px] font-sans text-blue-sail/60">
                      Total Tim Terdaftar: {serverHealth.database.totalRegisteredTeams}
                    </p>
                  </div>

                  {/* Blob Base64 Detector */}
                  <div className={`p-4 border-4 shadow-[4px_4px_0_0_#8B011A] ${
                    serverHealth.database.base64BlobsDetected > 0
                      ? 'bg-red-50 border-red-inferno text-red-950'
                      : 'bg-emerald-50 border-emerald-600 text-emerald-950'
                  }`}>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider block opacity-70">
                      BERKAS BASE64 DI DATABASE
                    </span>
                    <p className="font-display font-black text-2xl mt-1">
                      {serverHealth.database.base64BlobsDetected} File Terdeteksi
                    </p>
                    <p className="text-[11px] font-mono mt-1">
                      Estimasi Ukuran: {serverHealth.database.approximateBlobKBytes} KB
                    </p>
                    {serverHealth.database.base64BlobsDetected > 0 && (
                      <span className="inline-block text-[9px] font-bold bg-red-inferno text-white px-1.5 py-0.5 mt-1 uppercase">
                        Pemicu Crash RAM
                      </span>
                    )}
                  </div>
                </div>

                {/* Legacy Base64 Sanitizer Banner */}
                {serverHealth.database.base64BlobsDetected > 0 && (
                  <div className="bg-amber-50 border-3 border-amber-500 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Icon name="AlertTriangle" size={18} className="text-amber-700 shrink-0" />
                        <h4 className="font-display font-black text-sm uppercase text-amber-900">
                          PERINGATAN: DITEMUKAN {serverHealth.database.base64BlobsDetected} FILE UPLOAD BERBENTUK BASE64
                        </h4>
                      </div>
                      <p className="text-xs font-sans text-amber-800 leading-relaxed max-w-3xl">
                        String Base64 yang tersimpan langsung di tabel database menyebabkan beban serialisasi JSON berukuran besar tiap kali klien memanggil state, yang memicu Out-Of-Memory (OOM) dan server down. Anda dapat membersihkan data base64 ini dengan aman.
                      </p>
                      {cleanBlobResult && (
                        <p className="text-xs font-mono font-bold text-emerald-700 mt-2 bg-white px-2 py-1 border border-emerald-400 inline-block">
                          {cleanBlobResult}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleCleanBlobs}
                      disabled={isCleaningBlobs}
                      className="bg-red-inferno hover:bg-red-700 text-white font-display font-black text-xs uppercase px-5 py-3 border-2 border-blue-sail shadow-[3px_3px_0_0_#2A4C9E] shrink-0 cursor-pointer flex items-center gap-2"
                    >
                      <Icon name="Trash2" size={16} />
                      <span>{isCleaningBlobs ? 'MEMBERSIHKAN...' : 'BERSIHKAN BASE64 DI DB'}</span>
                    </button>
                  </div>
                )}

                {/* Server Info Details Table */}
                <div className="bg-white border-4 border-blue-sail p-5 space-y-3 shadow-[6px_6px_0_0_#2A4C9E]">
                  <h3 className="font-display font-black text-sm uppercase text-blue-sail border-b-2 border-blue-sail/20 pb-2">
                    RINCIAN LINGKUNGAN RUNTIME SERVER
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                    <div>
                      <span className="text-gray-500 block text-[10px]">VERSI NODE.JS</span>
                      <strong className="text-blue-sail">{serverHealth.nodeVersion}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px]">SISTEM OPERASI</span>
                      <strong className="text-blue-sail">{serverHealth.platform}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px]">CPU CORES</span>
                      <strong className="text-blue-sail">{serverHealth.cpuCount} Core</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px]">RAM SERVER GLOBAL</span>
                      <strong className="text-blue-sail">
                        {serverHealth.systemMemory.usedPercent}% Digunakan ({serverHealth.systemMemory.freeMB} MB Free)
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Real-time Server Log Console */}
                <div className="bg-gray-950 border-4 border-blue-sail shadow-[8px_8px_0_0_#BD1B1F] p-4 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
                      <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span>
                      <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
                      <span className="font-mono text-xs text-gray-300 font-bold ml-2">
                        TERMINAL LOG SERVER APLIKASI (LIVE)
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
                        className="bg-gray-900 border border-gray-700 text-xs font-mono text-gray-200 px-2 py-1 outline-none"
                      >
                        <option value="all">Semua Level</option>
                        <option value="error">Hanya Error</option>
                        <option value="warn">Hanya Warn</option>
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
                        placeholder="Cari teks log..."
                        className="bg-gray-900 border border-gray-700 text-xs font-mono text-gray-200 px-2.5 py-1 outline-none w-36 sm:w-48"
                      />

                      <button
                        type="button"
                        onClick={handleClearLogs}
                        className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-[11px] font-mono px-2.5 py-1 border border-gray-600 cursor-pointer"
                      >
                        Clear Log
                      </button>
                    </div>
                  </div>

                  {/* Terminal Screen */}
                  <div className="font-mono text-xs text-green-400 bg-black/90 p-4 border border-gray-800 max-h-96 overflow-y-auto space-y-1.5 leading-relaxed selection:bg-emerald-800 selection:text-white">
                    {serverLogsList.length === 0 ? (
                      <p className="text-gray-500 italic py-4 text-center">
                        Belum ada riwayat log yang tercatat atau log telah dibersihkan.
                      </p>
                    ) : (
                      serverLogsList.map((log) => {
                        const timeStr = new Date(log.timestamp).toLocaleTimeString('id-ID');
                        const isErr = log.level === 'error';
                        const isWarn = log.level === 'warn';

                        return (
                          <div
                            key={log.id}
                            className={`flex items-start gap-2 border-b border-gray-900/80 pb-1 ${
                              isErr ? 'text-red-400 bg-red-950/20 px-1' : isWarn ? 'text-yellow-400' : 'text-emerald-300'
                            }`}
                          >
                            <span className="text-gray-500 text-[10px] shrink-0 font-sans select-none">
                              [{timeStr}]
                            </span>
                            <span
                              className={`text-[9px] font-bold uppercase px-1 py-0.2 shrink-0 ${
                                isErr ? 'bg-red-900 text-white' : isWarn ? 'bg-yellow-900 text-yellow-100' : 'bg-emerald-950 text-emerald-300'
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
                  <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 pt-1">
                    <span>Menampilkan {serverLogsList.length} entri log terakhir (Maksimal 500 di RAM buffer)</span>
                    <span className="text-emerald-400">● Live Capture Active</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-white border-4 border-blue-sail">
                <Icon name="Loader2" size={32} className="animate-spin text-blue-sail mx-auto mb-3" />
                <p className="font-display font-bold text-sm uppercase text-blue-sail">
                  Sedang mengambil data kesehatan server & log...
                </p>
              </div>
            )}
          </div>
        )}

      </main>


      {/* MODAL: DIVISIA ADD/EDIT */}
      {isDivModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn font-sans text-blue-sail">
          <div className="bg-ballroom w-full max-w-2xl rounded-none border-4 border-blue-sail shadow-[8px_8px_0_0_#2A4C9E] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-blue-sail text-ballroom p-5 flex justify-between items-center border-b-4 border-decor shrink-0">
              <h3 className="font-display font-black text-base uppercase tracking-tight text-decor">
                {divForm.id ? 'Edit Divisi Panitia' : 'Tambah Divisi Baru'}
              </h3>
              <button onClick={() => setIsDivModalOpen(false)} className="text-ballroom hover:text-decor p-1 cursor-pointer">
                <Icon name="X" size={24} />
              </button>
            </div>

            <form onSubmit={handleDivSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wide">Nama Divisi *</label>
                  <input
                    type="text"
                    required
                    value={divForm.name}
                    onChange={e => setDivForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Contoh: Acara (Event Planner)"
                    className="w-full px-3 py-2 text-xs bg-white border-2 border-blue-sail rounded-none outline-none text-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wide">Ikon Lucide *</label>
                  <select
                    value={divForm.icon_name}
                    onChange={e => setDivForm(prev => ({ ...prev, icon_name: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-white border-2 border-blue-sail rounded-none outline-none text-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]"
                  >
                    <option value="CalendarRange">CalendarRange</option>
                    <option value="MessageSquareShare">MessageSquareShare</option>
                    <option value="Radio">Radio</option>
                    <option value="BadgeDollarSign">BadgeDollarSign</option>
                    <option value="Wrench">Wrench</option>
                    <option value="Camera">Camera</option>
                    <option value="ShieldCheck">ShieldCheck</option>
                    <option value="Users">Users / Standard</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wide">Deskripsi Divisi (Tugas Pokok) *</label>
                <textarea
                  required
                  rows={3}
                  value={divForm.description}
                  onChange={e => setDivForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Isi tugas pokok divisi..."
                  className="w-full px-3 py-2 text-xs bg-white border-2 border-blue-sail rounded-none outline-none text-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wide">Jobdesk Divisi (Satu per baris) *</label>
                <textarea
                  required
                  rows={3}
                  value={(divForm.jobdesk || []).join('\n')}
                  onChange={e => setDivForm(prev => ({ ...prev, jobdesk: e.target.value.split('\n') }))}
                  placeholder="Contoh:&#10;Menyusun konsep acara&#10;Memastikan alur rundown"
                  className="w-full px-3 py-2 text-xs bg-white border-2 border-blue-sail rounded-none outline-none text-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wide">Kualifikasi/Skills Divisi *</label>
                <textarea
                  required
                  rows={2}
                  value={divForm.skills || ''}
                  onChange={e => setDivForm(prev => ({ ...prev, skills: e.target.value }))}
                  placeholder="Contoh: Kreativitas tinggi, berpikir kritis..."
                  className="w-full px-3 py-2 text-xs bg-white border-2 border-blue-sail rounded-none outline-none text-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]"
                />
              </div>

              {/* Sub-divisions Editor */}
              <div className="space-y-4 border-t border-blue-sail/20 pt-4">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-black uppercase tracking-wide text-red-inferno">Kelola Sub-Divisi</label>
                  <button
                    type="button"
                    onClick={() => {
                      const newSub = { name: 'Sub Divisi Baru', description: '', jobdesk: [], skills: '' };
                      setDivForm(prev => ({ ...prev, sub_divisions: [...(prev.sub_divisions || []), newSub] }));
                    }}
                    className="bg-blue-sail hover:bg-barbera text-white px-3 py-1.5 font-mono font-bold text-[10px] uppercase tracking-wide cursor-pointer transition-all flex items-center gap-1 border border-blue-sail"
                  >
                    <Icon name="Plus" size={10} /> Tambah Sub-divisi
                  </button>
                </div>

                {(!divForm.sub_divisions || divForm.sub_divisions.length === 0) ? (
                  <p className="text-[10px] text-blue-sail/50 italic font-medium">Belum ada sub-divisi (divisi umum tanpa sub-bagian).</p>
                ) : (
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                    {divForm.sub_divisions.map((sub: any, idx: number) => {
                      const subObj = typeof sub === 'string' 
                        ? { name: sub, description: '', jobdesk: [], skills: '' }
                        : sub;

                      return (
                        <div key={idx} className="bg-blue-sail/[0.02] p-4 border border-blue-sail/20 space-y-3 relative">
                          <button
                            type="button"
                            onClick={() => {
                              setDivForm(prev => ({
                                ...prev,
                                sub_divisions: (prev.sub_divisions || []).filter((_, i) => i !== idx)
                              }));
                            }}
                            className="absolute top-2 right-2 text-red-inferno hover:text-white bg-red-inferno/5 hover:bg-red-inferno border border-red-inferno px-2 py-0.5 text-[9px] font-mono font-bold transition-all cursor-pointer"
                          >
                            Hapus
                          </button>

                          <div className="text-[10px] font-mono font-bold text-blue-sail/50 uppercase">Sub-Divisi #{idx + 1}</div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wide text-blue-sail/70">Nama Sub-Divisi</label>
                            <input
                              type="text"
                              required
                              value={subObj.name || ''}
                              onChange={e => {
                                const val = e.target.value;
                                setDivForm(prev => {
                                  const updated = [...prev.sub_divisions];
                                  updated[idx] = { ...subObj, name: val };
                                  return { ...prev, sub_divisions: updated };
                                });
                              }}
                              placeholder="Nama sub-divisi..."
                              className="w-full px-2 py-1 text-xs bg-white border border-blue-sail rounded-none outline-none focus:shadow-[1.5px_1.5px_0_0_#2A4C9E]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wide text-blue-sail/70">Deskripsi Sub-Divisi</label>
                            <textarea
                              required
                              rows={2}
                              value={subObj.description || ''}
                              onChange={e => {
                                const val = e.target.value;
                                setDivForm(prev => {
                                  const updated = [...prev.sub_divisions];
                                  updated[idx] = { ...subObj, description: val };
                                  return { ...prev, sub_divisions: updated };
                                });
                              }}
                              placeholder="Tugas pokok sub-divisi..."
                              className="w-full px-2 py-1 text-xs bg-white border-blue-sail rounded-none outline-none focus:shadow-[1.5px_1.5px_0_0_#2A4C9E]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wide text-blue-sail/70">Jobdesk Sub-Divisi (Satu per baris)</label>
                            <textarea
                              required
                              rows={2}
                              value={(subObj.jobdesk || []).join('\n')}
                              onChange={e => {
                                const val = e.target.value.split('\n');
                                setDivForm(prev => {
                                  const updated = [...prev.sub_divisions];
                                  updated[idx] = { ...subObj, jobdesk: val };
                                  return { ...prev, sub_divisions: updated };
                                });
                              }}
                              placeholder="Jobdesk sub-divisi per baris..."
                              className="w-full px-2 py-1 text-xs bg-white border-blue-sail rounded-none outline-none focus:shadow-[1.5px_1.5px_0_0_#2A4C9E]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wide text-blue-sail/70">Kualifikasi/Skills Sub-Divisi</label>
                            <textarea
                              required
                              rows={2}
                              value={subObj.skills || ''}
                              onChange={e => {
                                const val = e.target.value;
                                setDivForm(prev => {
                                  const updated = [...prev.sub_divisions];
                                  updated[idx] = { ...subObj, skills: val };
                                  return { ...prev, sub_divisions: updated };
                                });
                              }}
                              placeholder="Kualifikasi sub-divisi..."
                              className="w-full px-2 py-1 text-xs bg-white border-blue-sail rounded-none outline-none focus:shadow-[1.5px_1.5px_0_0_#2A4C9E]"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="shrink-0 pt-2">
                <button
                  type="submit"
                  className="w-full bg-decor hover:bg-decor/95 text-blue-sail font-display font-black text-xs py-3 rounded-none border-2 border-blue-sail tracking-wider shadow-[3px_3px_0_0_#BD1B1F] active:translate-x-0.5 active:translate-y-0.5 transition-all uppercase cursor-pointer"
                >
                  SIMPAN PERUBAHAN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: THRIFT PRODUCT ADD/EDIT */}
      {isProdModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn font-sans text-blue-sail">
          <div className="bg-ballroom w-full max-w-md rounded-none border-4 border-blue-sail shadow-[8px_8px_0_0_#2A4C9E] overflow-hidden">
            <div className="bg-blue-sail text-ballroom p-5 flex justify-between items-center border-b-4 border-decor">
              <h3 className="font-display font-black text-base uppercase tracking-tight text-decor">
                {prodForm.id ? 'Edit Produk Thrift' : 'Tambah Produk Thrift Baru'}
              </h3>
              <button onClick={() => setIsProdModalOpen(false)} className="text-ballroom hover:text-decor p-1 cursor-pointer">
                <Icon name="X" size={24} />
              </button>
            </div>

            <form onSubmit={handleProdSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wide">Nama Produk *</label>
                <input
                  type="text"
                  required
                  value={prodForm.name}
                  onChange={e => setProdForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Contoh: Vintage Nascar T-Shirt XL"
                  className="w-full px-3 py-2 text-xs bg-white border-2 border-blue-sail rounded-none outline-none text-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wide">Harga (Rupiah) *</label>
                  <input
                    type="number"
                    required
                    value={prodForm.price}
                    onChange={e => setProdForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-xs bg-white border-2 border-blue-sail rounded-none outline-none text-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wide">Kondisi (Quality) *</label>
                  <input
                    type="text"
                    required
                    value={prodForm.condition}
                    onChange={e => setProdForm(prev => ({ ...prev, condition: e.target.value }))}
                    placeholder="Contoh: 9/10 Like New"
                    className="w-full px-3 py-2 text-xs bg-white border-2 border-blue-sail rounded-none outline-none text-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wide">Kategori Koleksi *</label>
                  <select
                    value={prodForm.category}
                    onChange={e => setProdForm(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-3 py-2 text-xs bg-white border-2 border-blue-sail rounded-none outline-none text-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]"
                  >
                    <option value="clothing">Pakaian / Clothing</option>
                    <option value="accessories">Aksesoris / Accessories</option>
                    <option value="shoes">Sepatu / Shoes</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wide">Brand Seller *</label>
                  <select
                    value={prodForm.vendor_id}
                    onChange={e => setProdForm(prev => ({ ...prev, vendor_id: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-white border-2 border-blue-sail rounded-none outline-none text-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]"
                  >
                    {thriftVendors.map(v => (
                      <option key={v.id} value={v.id}>{v.vendor_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wide">Status Barang *</label>
                  <select
                    value={prodForm.status}
                    onChange={e => setProdForm(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 text-xs bg-white border-2 border-blue-sail rounded-none outline-none text-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]"
                  >
                    <option value="available">Tersedia / Available</option>
                    <option value="sold">Terjual / Sold</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wide">Link URL Foto Produk</label>
                <input
                  type="url"
                  value={prodForm.image_url}
                  onChange={e => setProdForm(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-xs bg-white border-2 border-blue-sail rounded-none outline-none text-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-decor hover:bg-decor/95 text-blue-sail font-display font-black text-xs py-3 rounded-none border-2 border-blue-sail tracking-wider shadow-[3px_3px_0_0_#BD1B1F] active:translate-x-0.5 active:translate-y-0.5 transition-all uppercase mt-4 cursor-pointer"
              >
                SIMPAN CATALOG BARANG
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: THRIFT VENDOR ADD/EDIT */}
      {isVendorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn font-sans text-blue-sail">
          <div className="bg-ballroom w-full max-w-md rounded-none border-4 border-blue-sail shadow-[8px_8px_0_0_#2A4C9E] overflow-hidden">
            <div className="bg-blue-sail text-ballroom p-5 flex justify-between items-center border-b-4 border-decor">
              <h3 className="font-display font-black text-base uppercase tracking-tight text-decor">
                {vendorFormState.id ? 'Edit Brand Seller' : 'Tambah Seller Vendor Baru'}
              </h3>
              <button onClick={() => setIsVendorModalOpen(false)} className="text-ballroom hover:text-decor p-1 cursor-pointer">
                <Icon name="X" size={24} />
              </button>
            </div>

            <form onSubmit={handleVendorSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wide">Nama Brand / Vendor *</label>
                <input
                  type="text"
                  required
                  value={vendorFormState.vendor_name}
                  onChange={e => setVendorFormState(prev => ({ ...prev, vendor_name: e.target.value }))}
                  placeholder="Contoh: Veloce Vintage Co"
                  className="w-full px-3 py-2 text-xs bg-white border-2 border-blue-sail rounded-none outline-none text-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wide">Koordinat Booth *</label>
                  <input
                    type="text"
                    required
                    value={vendorFormState.booth_location}
                    onChange={e => setVendorFormState(prev => ({ ...prev, booth_location: e.target.value }))}
                    placeholder="Contoh: Booth Utama A-1"
                    className="w-full px-3 py-2 text-xs bg-white border-2 border-blue-sail rounded-none outline-none text-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wide">No WA (Format: 628...)</label>
                  <input
                    type="text"
                    required
                    value={vendorFormState.contact}
                    onChange={e => setVendorFormState(prev => ({ ...prev, contact: e.target.value }))}
                    placeholder="Contoh: 62812345678"
                    className="w-full px-3 py-2 text-xs bg-white border-2 border-blue-sail rounded-none outline-none text-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wide">Status Booth *</label>
                <select
                  value={vendorFormState.status}
                  onChange={e => setVendorFormState(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3 py-2 text-xs bg-white border-2 border-blue-sail rounded-none outline-none text-blue-sail focus:border-blue-sail focus:shadow-[2px_2px_0_0_#2A4C9E]"
                >
                  <option value="active">Aktif Berjualan / Active</option>
                  <option value="inactive">Tutup Sementara / Inactive</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-decor hover:bg-decor/95 text-blue-sail font-display font-black text-xs py-3 rounded-none border-2 border-blue-sail tracking-wider shadow-[3px_3px_0_0_#BD1B1F] active:translate-x-0.5 active:translate-y-0.5 transition-all uppercase mt-4 cursor-pointer"
              >
                SIMPAN BRAND SELLER
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: STAFF APPLICANT DETAIL */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn font-sans text-blue-sail">
          <div className="bg-ballroom w-full max-w-2xl rounded-none border-4 border-blue-sail shadow-[8px_8px_0_0_#2A4C9E] overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-blue-sail text-ballroom p-5 flex justify-between items-center border-b-4 border-decor shrink-0">
              <div className="space-y-0.5">
                <span className="bg-decor text-blue-sail font-mono text-[10px] font-bold px-1.5 py-0.5 border border-blue-sail uppercase">
                  Detail Aplikasi Staff
                </span>
                <h3 className="font-display font-black text-lg uppercase tracking-tight text-white">
                  {selectedApplicant.full_name}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedApplicant(null)} 
                className="text-ballroom hover:text-decor p-1 cursor-pointer bg-blue-sail/20 hover:bg-blue-sail/40 transition-all rounded-none border border-transparent hover:border-ballroom"
              >
                <Icon name="X" size={22} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              
              {/* Section 1: Data Diri */}
              <div className="space-y-3">
                <h4 className="font-display font-extrabold text-xs text-red-inferno uppercase tracking-wider border-b border-blue-sail/10 pb-1 flex items-center space-x-1.5">
                  <Icon name="User" size={14} />
                  <span>A. DATA DIRI</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-3 border border-blue-sail/10">
                  <div>
                    <p className="text-[10px] text-blue-sail/50 uppercase font-bold tracking-wide">Nama Lengkap</p>
                    <p className="font-semibold uppercase text-blue-sail text-xs">{selectedApplicant.full_name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-blue-sail/50 uppercase font-bold tracking-wide">NRP (NIM)</p>
                    <p className="font-mono font-semibold text-xs text-blue-sail">{selectedApplicant.nim}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-blue-sail/50 uppercase font-bold tracking-wide">Departemen</p>
                    <p className="font-semibold text-xs text-blue-sail">{selectedApplicant.department || selectedApplicant.major || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-blue-sail/50 uppercase font-bold tracking-wide">Fakultas</p>
                    <p className="font-semibold uppercase text-xs text-red-inferno">{selectedApplicant.faculty || 'FSAD'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-blue-sail/50 uppercase font-bold tracking-wide">Nomor WhatsApp</p>
                    <p className="font-mono text-xs text-blue-sail font-semibold">{selectedApplicant.phone}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-blue-sail/50 uppercase font-bold tracking-wide">Email Address</p>
                    <p className="font-mono text-xs text-blue-sail">{selectedApplicant.email}</p>
                  </div>
                </div>
              </div>

              {/* Section: Hasil Kelulusan Tahap Berkas (Admin Action) */}
              <div className="bg-decor/5 p-4 border-[2px] border-decor/20 space-y-3">
                <h4 className="font-display font-extrabold text-xs text-red-inferno uppercase tracking-wider border-b border-decor/10 pb-1.5 flex items-center space-x-1.5">
                  <Icon name="UserCheck" size={14} />
                  <span>KONTROL KELULUSAN TAHAP BERKAS (STAFF SELECTION)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-blue-sail/50 uppercase font-bold tracking-wide mb-1">
                      Status Kelulusan Berkas
                    </label>
                    <select
                      value={selectedApplicant.status_berkas || 'pending'}
                      onChange={(e) => {
                        const newStatus = e.target.value as any;
                        updateStaffApplicationBerkas(
                          selectedApplicant.id,
                          newStatus,
                          selectedApplicant.interview_schedule || '',
                          selectedApplicant.whatsapp_group_link || ''
                        );
                        setSelectedApplicant(prev => prev ? ({ ...prev, status_berkas: newStatus }) : null);
                      }}
                      className={`w-full px-3 py-1.5 text-xs font-bold uppercase rounded-none border-2 outline-none font-mono ${
                        selectedApplicant.status_berkas === 'lolos'
                          ? 'bg-green-50 border-green-400 text-green-700'
                          : selectedApplicant.status_berkas === 'gagal'
                            ? 'bg-red-50 border-red-400 text-red-600'
                            : 'bg-yellow-50 border-yellow-400 text-yellow-700'
                      }`}
                    >
                      <option value="pending">PENDING</option>
                      <option value="lolos">LOLOS SELEKSI</option>
                      <option value="gagal">TIDAK LOLOS</option>
                    </select>
                  </div>

                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-[10px] text-blue-sail/50 uppercase font-bold tracking-wide mb-1">
                      Jadwal Wawancara (Hanya jika Lolos)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Sabtu, 26 Juli 2026, 09:30 WIB (Zoom)"
                      value={selectedApplicant.interview_schedule || ''}
                      onChange={(e) => {
                        const newSched = e.target.value;
                        setSelectedApplicant(prev => prev ? ({ ...prev, interview_schedule: newSched }) : null);
                      }}
                      onBlur={() => {
                        updateStaffApplicationBerkas(
                          selectedApplicant.id,
                          selectedApplicant.status_berkas || 'pending',
                          selectedApplicant.interview_schedule || '',
                          selectedApplicant.whatsapp_group_link || ''
                        );
                      }}
                      className="w-full px-3 py-1.5 text-xs bg-white border-2 border-blue-sail/20 rounded-none outline-none font-sans text-blue-sail transition-all focus:border-blue-sail"
                    />
                  </div>

                  <div className="col-span-1 sm:col-span-3">
                    <label className="block text-[10px] text-blue-sail/50 uppercase font-bold tracking-wide mb-1">
                      Link Grup WhatsApp Koordinasi (Hanya jika Lolos)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: https://chat.whatsapp.com/..."
                      value={selectedApplicant.whatsapp_group_link || ''}
                      onChange={(e) => {
                        const newWa = e.target.value;
                        setSelectedApplicant(prev => prev ? ({ ...prev, whatsapp_group_link: newWa }) : null);
                      }}
                      onBlur={() => {
                        updateStaffApplicationBerkas(
                          selectedApplicant.id,
                          selectedApplicant.status_berkas || 'pending',
                          selectedApplicant.interview_schedule || '',
                          selectedApplicant.whatsapp_group_link || ''
                        );
                      }}
                      className="w-full px-3 py-1.5 text-xs bg-white border-2 border-blue-sail/20 rounded-none outline-none font-mono text-blue-sail transition-all focus:border-blue-sail"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Berkas & Dokumen Pelamar */}
              <div className="space-y-3">
                <h4 className="font-display font-extrabold text-xs text-red-inferno uppercase tracking-wider border-b border-blue-sail/10 pb-1 flex items-center space-x-1.5">
                  <Icon name="FileText" size={14} />
                  <span>BERKAS & DOKUMEN PENDUKUNG</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-3 border border-blue-sail/10">
                  <div className="col-span-1 md:col-span-2">
                    <p className="text-[10px] text-blue-sail/50 uppercase font-bold tracking-wide">Folder Google Drive Berkas Pendukung (KTM, CV, Repost, Twibbon, Bukti Follow)</p>
                    {selectedApplicant.drive_folder_link ? (
                      <a
                        href={selectedApplicant.drive_folder_link.startsWith('http') ? selectedApplicant.drive_folder_link : `https://${selectedApplicant.drive_folder_link}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-red-inferno hover:text-barbera font-mono text-xs font-bold flex items-center space-x-1.5 mt-1"
                      >
                        <Icon name="ExternalLink" size={14} />
                        <span>Buka Folder Google Drive</span>
                      </a>
                    ) : selectedApplicant.cv_link ? (
                      // Fallback to old CV link if it was submitted before this change
                      <div className="space-y-1 mt-1">
                        <p className="text-xs text-blue-sail/60 font-sans italic">Data lama (sebelum penggabungan folder):</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                          {selectedApplicant.ktm_krs_link && (
                            <a href={selectedApplicant.ktm_krs_link.startsWith('http') ? selectedApplicant.ktm_krs_link : `https://${selectedApplicant.ktm_krs_link}`} target="_blank" rel="noreferrer" className="text-red-inferno hover:text-barbera font-mono text-xs font-bold flex items-center gap-1">
                              <Icon name="ExternalLink" size={11} /> KTM
                            </a>
                          )}
                          {selectedApplicant.cv_link && (
                            <a href={selectedApplicant.cv_link.startsWith('http') ? selectedApplicant.cv_link : `https://${selectedApplicant.cv_link}`} target="_blank" rel="noreferrer" className="text-red-inferno hover:text-barbera font-mono text-xs font-bold flex items-center gap-1">
                              <Icon name="ExternalLink" size={11} /> CV
                            </a>
                          )}
                          {selectedApplicant.repost_link && (
                            <a href={selectedApplicant.repost_link.startsWith('http') ? selectedApplicant.repost_link : `https://${selectedApplicant.repost_link}`} target="_blank" rel="noreferrer" className="text-red-inferno hover:text-barbera font-mono text-xs font-bold flex items-center gap-1">
                              <Icon name="ExternalLink" size={11} /> Repost
                            </a>
                          )}
                          {selectedApplicant.twibbon_link && (
                            <a href={selectedApplicant.twibbon_link.startsWith('http') ? selectedApplicant.twibbon_link : `https://${selectedApplicant.twibbon_link}`} target="_blank" rel="noreferrer" className="text-red-inferno hover:text-barbera font-mono text-xs font-bold flex items-center gap-1">
                              <Icon name="ExternalLink" size={11} /> Twibbon
                            </a>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-blue-sail/40 font-mono text-xs">-</span>
                    )}
                  </div>
                  {selectedApplicant.file_url && (
                    <div className="col-span-1 md:col-span-2 border-t border-dashed border-blue-sail/10 pt-2 mt-1">
                      <p className="text-[10px] text-blue-sail/50 uppercase font-bold tracking-wide">CV / Berkas (Old File Upload)</p>
                      <a
                        href={selectedApplicant.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-red-inferno hover:text-barbera font-mono text-xs font-bold flex items-center space-x-1"
                      >
                        <Icon name="FileText" size={12} />
                        <span>Buka Link CV/Portofolio</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: General Task */}
              <div className="space-y-3">
                <h4 className="font-display font-extrabold text-xs text-red-inferno uppercase tracking-wider border-b border-blue-sail/10 pb-1 flex items-center space-x-1.5">
                  <Icon name="FileText" size={14} />
                  <span>B. GENERAL TASK (PERTANYAAN UMUM)</span>
                </h4>
                <div className="space-y-3 bg-white p-4 border border-blue-sail/10">
                  <div>
                    <p className="text-[10px] text-blue-sail/50 uppercase font-bold tracking-wide leading-relaxed">
                      1. Apa yang diketahui tentang TDC Summit Fest 2026?
                    </p>
                    <p className="text-xs text-blue-sail font-medium leading-relaxed mt-1 italic whitespace-pre-wrap">
                      "{selectedApplicant.general_knowledge || selectedApplicant.motivation || '-'}"
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-blue-sail/50 uppercase font-bold tracking-wide leading-relaxed">
                      2. Motivasi mendaftar sebagai bagian dari TDC Summit Fest 2026?
                    </p>
                    <p className="text-xs text-blue-sail font-medium leading-relaxed mt-1 italic whitespace-pre-wrap">
                      "{selectedApplicant.general_motivation || selectedApplicant.motivation || '-'}"
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-blue-sail/50 uppercase font-bold tracking-wide leading-relaxed">
                      3. Pengalaman dalam kepanitiaan atau organisasi (serta jobdesk)?
                    </p>
                    <p className="text-xs text-blue-sail font-medium leading-relaxed mt-1 italic whitespace-pre-wrap">
                      "{selectedApplicant.experience || '-'}"
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-blue-sail/50 uppercase font-bold tracking-wide leading-relaxed">
                      4. Sebutkan kelebihan & kekurangan diri
                    </p>
                    <p className="text-xs text-blue-sail font-medium leading-relaxed mt-1 italic whitespace-pre-wrap">
                      "{selectedApplicant.strengths_weaknesses || '-'}"
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-blue-sail/5">
                    <div>
                      <p className="text-[10px] text-blue-sail/50 uppercase font-bold tracking-wide">
                        5. Skala Komitmen (0-10)
                      </p>
                      <p className="text-xs font-mono font-bold text-red-inferno mt-0.5">
                        {selectedApplicant.commitment_scale !== undefined ? `${selectedApplicant.commitment_scale}/10` : '10/10'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-blue-sail/50 uppercase font-bold tracking-wide">
                        6. Sudah Bayar IKOMA ITS?
                      </p>
                      <p className="text-xs font-bold text-blue-sail mt-0.5 uppercase">
                        {selectedApplicant.paid_ikoma === 'yes' ? 'SUDAH BAYAR' : 'BELUM BAYAR'}
                      </p>
                      {selectedApplicant.paid_ikoma === 'yes' && selectedApplicant.ikoma_proof_url && (
                        <a
                          href={selectedApplicant.ikoma_proof_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-red-inferno hover:text-barbera font-mono text-[10px] font-bold flex items-center space-x-1 mt-1"
                        >
                          <Icon name="Image" size={10} />
                          <span>Lihat Bukti IKOMA</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] text-blue-sail/50 uppercase font-bold tracking-wide leading-relaxed">
                      7. Bentuk komitmen untuk TSF 2026
                    </p>
                    <p className="text-xs text-blue-sail font-medium leading-relaxed mt-1 italic whitespace-pre-wrap">
                      "{selectedApplicant.commitment_form || '-'}"
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-blue-sail/50 uppercase font-bold tracking-wide leading-relaxed">
                      8. Kesibukan saat ini dan 5 bulan ke depan
                    </p>
                    <p className="text-xs text-blue-sail font-medium leading-relaxed mt-1 italic whitespace-pre-wrap">
                      "{selectedApplicant.busy_schedule || '-'}"
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-blue-sail/50 uppercase font-bold tracking-wide leading-relaxed">
                      9. Memiliki Relasi Kenalan / Perusahaan?
                    </p>
                    <p className="text-xs text-blue-sail font-medium leading-relaxed mt-1 italic whitespace-pre-wrap">
                      "{selectedApplicant.relations || '-'}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 3: Division Tasks */}
              <div className="space-y-4">
                <h4 className="font-display font-extrabold text-xs text-red-inferno uppercase tracking-wider border-b border-blue-sail/10 pb-1 flex items-center space-x-1.5">
                  <Icon name="Award" size={14} />
                  <span>C. DIVISION TASK (TUGAS DIVISI SPESIFIK)</span>
                </h4>

                {/* Priority 1 Task */}
                <div className="space-y-3 bg-blue-sail/5 p-4 border border-blue-sail/10">
                  <div className="flex items-center space-x-2 border-b border-blue-sail/10 pb-2">
                    <span className="bg-decor text-blue-sail font-mono text-[10px] font-bold px-1.5 py-0.5 border border-blue-sail">
                      PRIORITAS 1
                    </span>
                    <span className="text-xs font-bold font-mono text-blue-sail uppercase tracking-wide">
                      {selectedApplicant.division_priority_1}
                    </span>
                  </div>
                  <div className="mt-2">
                    <SerializedAnswersViewer serializedText={selectedApplicant.div_task_answer_1} />
                  </div>
                </div>

                {/* Priority 2 Task */}
                <div className="space-y-3 bg-blue-sail/5 p-4 border border-blue-sail/10">
                  <div className="flex items-center space-x-2 border-b border-blue-sail/10 pb-2">
                    <span className="bg-decor text-blue-sail font-mono text-[10px] font-bold px-1.5 py-0.5 border border-blue-sail">
                      PRIORITAS 2
                    </span>
                    <span className="text-xs font-bold font-mono text-blue-sail uppercase tracking-wide">
                      {selectedApplicant.division_priority_2}
                    </span>
                  </div>
                  <div className="mt-2">
                    <SerializedAnswersViewer serializedText={selectedApplicant.div_task_answer_2} />
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-blue-sail/5 p-4 border-t border-blue-sail/10 flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-blue-sail font-mono">STATUS SELEKSI:</span>
                <select
                  value={selectedApplicant.status}
                  onChange={e => {
                    updateStaffApplicationStatus(selectedApplicant.id, e.target.value as any);
                    setSelectedApplicant(prev => ({ ...prev, status: e.target.value }));
                  }}
                  className={`px-3 py-1 text-xs font-bold uppercase rounded-none border-2 outline-none font-mono ${
                    selectedApplicant.status === 'accepted' 
                      ? 'bg-green-50 border-green-400 text-green-700 focus:shadow-[2px_2px_0_0_#15803d]' 
                      : selectedApplicant.status === 'rejected'
                        ? 'bg-red-50 border-red-400 text-red-600 focus:shadow-[2px_2px_0_0_#b91c1c]'
                        : 'bg-yellow-50 border-yellow-400 text-yellow-700 focus:shadow-[2px_2px_0_0_#ca8a04]'
                  }`}
                >
                  <option value="pending">PENDING</option>
                  <option value="accepted">ACCEPTED</option>
                  <option value="rejected">REJECTED</option>
                </select>
              </div>
              <button
                onClick={() => setSelectedApplicant(null)}
                className="bg-blue-sail hover:bg-blue-sail/95 text-white font-display font-black text-xs uppercase px-5 py-2.5 rounded-none border-2 border-blue-sail transition-all cursor-pointer"
              >
                TUTUP DETAIL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AMBASSADOR APPLICANT DETAIL MODAL */}
      {selectedAmbassadorApp && (
        <div className="fixed inset-0 bg-blue-sail/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-ballroom border-4 border-blue-sail shadow-[12px_12px_0_0_#BD1B1F] w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 text-blue-sail font-sans relative">
            <div className="flex justify-between items-start border-b-2 border-blue-sail/20 pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-red-inferno uppercase tracking-widest block mb-1">
                  DETAIL PENDAFTAR AMBASSADOR & INFLUENCER
                </span>
                <h3 className="font-display font-black text-2xl uppercase tracking-tight">
                  {selectedAmbassadorApp.full_name}
                </h3>
                <p className="font-mono text-xs text-blue-sail/70 mt-0.5">
                  Peran: <strong>{selectedAmbassadorApp.role_choice}</strong> | Email: {selectedAmbassadorApp.email}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAmbassadorApp(null)}
                className="bg-red-inferno text-ballroom p-2 border border-blue-sail hover:bg-red-700 transition-colors cursor-pointer"
              >
                <Icon name="X" size={18} />
              </button>
            </div>

            {/* Section 1: Data Diri */}
            <div className="bg-blue-sail/5 p-4 border-2 border-blue-sail space-y-2">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-blue-sail border-b border-blue-sail/10 pb-1">
                Data Diri & Identitas Pendaftar
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <p><strong>Nama Lengkap:</strong> {selectedAmbassadorApp.full_name}</p>
                <p><strong>Email:</strong> {selectedAmbassadorApp.email}</p>
                <p><strong>No WhatsApp:</strong> {selectedAmbassadorApp.whatsapp}</p>
                {selectedAmbassadorApp.role_choice === 'Campus Influencer' ? (
                  <>
                    <p><strong>NRP:</strong> {selectedAmbassadorApp.nrp || '-'}</p>
                    <p><strong>Departemen / Fakultas:</strong> {selectedAmbassadorApp.department} ({selectedAmbassadorApp.faculty})</p>
                  </>
                ) : (
                  <>
                    <p><strong>Kelas:</strong> {selectedAmbassadorApp.grade_class || '-'}</p>
                    <p><strong>Asal Sekolah:</strong> {selectedAmbassadorApp.school || '-'}</p>
                  </>
                )}
                <p><strong>Instagram:</strong> {selectedAmbassadorApp.instagram || '-'}</p>
                <p><strong>TikTok:</strong> {selectedAmbassadorApp.tiktok || '-'}</p>
              </div>
            </div>

            {/* Section 2: Jawaban Esai */}
            <div className="space-y-4">
              <h4 className="font-display font-black text-sm uppercase tracking-wider text-blue-sail border-b-2 border-blue-sail pb-1">
                Jawaban Pertanyaan Seleksi (Page 2)
              </h4>

              <div className="space-y-3 text-xs">
                <div className="bg-white p-3 border border-blue-sail/20">
                  <p className="font-bold uppercase text-[11px] text-blue-sail mb-1">1. Pemahaman tentang TSF 2026:</p>
                  <p className="text-blue-sail/90 whitespace-pre-wrap">{selectedAmbassadorApp.q1_tsf_knowledge || '-'}</p>
                </div>

                <div className="bg-white p-3 border border-blue-sail/20">
                  <p className="font-bold uppercase text-[11px] text-blue-sail mb-1">2. Pemahaman Peran {selectedAmbassadorApp.role_choice}:</p>
                  <p className="text-blue-sail/90 whitespace-pre-wrap">{selectedAmbassadorApp.q2_role_knowledge || '-'}</p>
                </div>

                <div className="bg-white p-3 border border-blue-sail/20">
                  <p className="font-bold uppercase text-[11px] text-blue-sail mb-1">3. Motivasi Mendaftar:</p>
                  <p className="text-blue-sail/90 whitespace-pre-wrap">{selectedAmbassadorApp.q3_motivation || '-'}</p>
                </div>

                <div className="bg-white p-3 border border-blue-sail/20 flex justify-between items-center">
                  <p className="font-bold uppercase text-[11px] text-blue-sail">4. Skala Komitmen (1-10):</p>
                  <span className="font-mono text-sm font-black bg-red-inferno text-white px-3 py-0.5">{selectedAmbassadorApp.q4_commitment_scale || '-'}/10</span>
                </div>

                <div className="bg-white p-3 border border-blue-sail/20">
                  <p className="font-bold uppercase text-[11px] text-blue-sail mb-1">5. Alasan Skala Komitmen:</p>
                  <p className="text-blue-sail/90 whitespace-pre-wrap">{selectedAmbassadorApp.q5_commitment_reason || '-'}</p>
                </div>

                <div className="bg-white p-3 border border-blue-sail/20">
                  <p className="font-bold uppercase text-[11px] text-blue-sail mb-1">6. Strategi Promosi TSF:</p>
                  <p className="text-blue-sail/90 whitespace-pre-wrap">{selectedAmbassadorApp.q6_promotion_strategy || '-'}</p>
                </div>

                <div className="bg-white p-3 border border-blue-sail/20">
                  <p className="font-bold uppercase text-[11px] text-blue-sail mb-1">7. Konsep & Jenis Konten:</p>
                  <p className="text-blue-sail/90 whitespace-pre-wrap">{selectedAmbassadorApp.q7_content_type_strategy || '-'}</p>
                </div>

                <div className="bg-white p-3 border border-blue-sail/20">
                  <p className="font-bold uppercase text-[11px] text-blue-sail mb-1">8. Manfaat Tambahan yang Diharapkan:</p>
                  <p className="text-blue-sail/90 whitespace-pre-wrap">{selectedAmbassadorApp.q8_additional_benefits || '-'}</p>
                </div>

                <div className="bg-white p-3 border border-blue-sail/20">
                  <p className="font-bold uppercase text-[11px] text-blue-sail mb-1">9. Sumber Informasi:</p>
                  <p className="text-blue-sail/90">
                    {selectedAmbassadorApp.q9_info_source === 'Teman'
                      ? `Teman (${selectedAmbassadorApp.q9_info_source_friend})`
                      : selectedAmbassadorApp.q9_info_source}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3: Links */}
            <div className="bg-decor/30 p-4 border-2 border-blue-sail space-y-2">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-blue-sail">
                Berkas & Link Video Reels (Page 3)
              </h4>
              <div className="flex flex-col sm:flex-row gap-4 pt-1">
                <a
                  href={selectedAmbassadorApp.drive_folder_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-blue-sail text-decor hover:bg-barbera font-display font-bold text-xs uppercase p-3 border border-blue-sail flex items-center justify-center space-x-2"
                >
                  <Icon name="Folder" size={16} />
                  <span>Buka Folder Drive</span>
                  <Icon name="ExternalLink" size={12} />
                </a>

                <a
                  href={selectedAmbassadorApp.reels_video_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-red-inferno text-white hover:bg-red-700 font-display font-bold text-xs uppercase p-3 border border-blue-sail flex items-center justify-center space-x-2"
                >
                  <Icon name="Video" size={16} />
                  <span>Tonton Reels Video</span>
                  <Icon name="ExternalLink" size={12} />
                </a>
              </div>
            </div>

            {/* Section 4: Status Actions */}
            <div className="pt-4 border-t-2 border-blue-sail/20 flex flex-wrap justify-between items-center gap-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold uppercase">Ubah Status:</span>
                <button
                  type="button"
                  onClick={async () => {
                    await updateAmbassadorApplicationStatus(selectedAmbassadorApp.id, 'accepted');
                    setSelectedAmbassadorApp(prev => prev ? { ...prev, status: 'accepted' } : null);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold px-3 py-1.5 border border-blue-sail shadow-[2px_2px_0_0_#000] cursor-pointer"
                >
                  ✓ Terima (Accepted)
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await updateAmbassadorApplicationStatus(selectedAmbassadorApp.id, 'rejected');
                    setSelectedAmbassadorApp(prev => prev ? { ...prev, status: 'rejected' } : null);
                  }}
                  className="bg-red-inferno hover:bg-red-700 text-white font-mono text-xs font-bold px-3 py-1.5 border border-blue-sail shadow-[2px_2px_0_0_#000] cursor-pointer"
                >
                  ✕ Tolak (Rejected)
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAmbassadorApp(null)}
                className="bg-ballroom hover:bg-decor/20 text-blue-sail font-mono text-xs font-bold px-4 py-2 border-2 border-blue-sail cursor-pointer"
              >
                Tutup Modal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PE1 REGISTRATION DETAIL MODAL */}
      {selectedPE1Reg && (
        <div className="fixed inset-0 bg-blue-sail/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-ballroom border-4 border-blue-sail shadow-[12px_12px_0_0_#BD1B1F] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 text-blue-sail font-sans relative">
            <div className="flex justify-between items-start border-b-2 border-blue-sail/20 pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-red-inferno uppercase tracking-widest block mb-1">
                  DETAIL PENDAFTAR PE1 (CEO FOR A DAY)
                </span>
                <h3 className="font-display font-black text-2xl uppercase tracking-tight">
                  {selectedPE1Reg.full_name}
                </h3>
                <p className="font-mono text-xs text-blue-sail/70 mt-0.5">
                  Paket: <strong>{selectedPE1Reg.package_choice}</strong> | Email: {selectedPE1Reg.email}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPE1Reg(null)}
                className="bg-red-inferno text-ballroom p-2 border border-blue-sail hover:bg-red-700 transition-colors cursor-pointer"
              >
                <Icon name="X" size={18} />
              </button>
            </div>

            {/* Section 1: Data Diri */}
            <div className="bg-blue-sail/5 p-4 border-2 border-blue-sail space-y-2">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-blue-sail border-b border-blue-sail/10 pb-1">
                Data Diri Peserta
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <p><strong>Nama Lengkap:</strong> {selectedPE1Reg.full_name}</p>
                <p><strong>Email:</strong> {selectedPE1Reg.email}</p>
                <p><strong>No WhatsApp:</strong> {selectedPE1Reg.whatsapp}</p>
                <p><strong>Status Saat Ini:</strong> {selectedPE1Reg.status_current}</p>
                <p><strong>Instansi:</strong> {selectedPE1Reg.institution}</p>
                {selectedPE1Reg.major && <p><strong>Jurusan / Prodi:</strong> {selectedPE1Reg.major}</p>}
                <p><strong>Kota Domisili:</strong> {selectedPE1Reg.city}</p>
                <p><strong>Waktu Submit:</strong> {new Date(selectedPE1Reg.submitted_at).toLocaleString('id-ID')}</p>
              </div>
            </div>

            {/* Section 2: Paket & Persyaratan */}
            <div className="bg-blue-sail/5 p-4 border-2 border-blue-sail space-y-2">
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-blue-sail border-b border-blue-sail/10 pb-1">
                Paket & Bukti Persyaratan / Pembayaran
              </h4>
              <div className="space-y-2 text-xs">
                <p><strong>Paket Dibatasi:</strong> <span className="font-bold text-red-inferno">{selectedPE1Reg.package_choice}</span></p>

                {selectedPE1Reg.selected_ebook && (
                  <div className="bg-amber-50 p-2.5 border-2 border-amber-400 text-amber-950 font-sans my-1">
                    <span className="font-mono text-[10px] uppercase font-bold text-amber-700 block">E-BOOK FORMULA PILIHAN PESERTA:</span>
                    <p className="font-bold text-xs mt-0.5">📚 {selectedPE1Reg.selected_ebook}</p>
                  </div>
                )}

                {selectedPE1Reg.package_choice === 'Aspiring CEO' ? (
                  <>
                    <p><strong>Instagram Username:</strong> {selectedPE1Reg.instagram_username || '-'}</p>
                    <div>
                      <strong>Link Drive Bukti Social Tasks:</strong>
                      {selectedPE1Reg.social_proof_drive_url ? (
                        <a href={selectedPE1Reg.social_proof_drive_url} target="_blank" rel="noreferrer"
                          className="block text-blue-600 font-bold underline break-all mt-0.5">
                          {selectedPE1Reg.social_proof_drive_url}
                        </a>
                      ) : <span className="text-gray-400"> -</span>}
                    </div>
                  </>
                ) : (
                  <>
                    <p><strong>Metode Pembayaran:</strong> {selectedPE1Reg.payment_method || '-'}</p>
                    <div>
                      <strong>Link Drive Bukti Pembayaran:</strong>
                      {selectedPE1Reg.payment_proof_url ? (
                        <a href={selectedPE1Reg.payment_proof_url} target="_blank" rel="noreferrer"
                          className="block text-blue-600 font-bold underline break-all mt-0.5">
                          {selectedPE1Reg.payment_proof_url}
                        </a>
                      ) : <span className="text-gray-400"> -</span>}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Status Update Control */}
            <div className="bg-decor/20 p-4 border-2 border-blue-sail flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase text-blue-sail/70 block">GANTI STATUS PENDAFTAR</span>
                <span className="font-display font-bold text-sm uppercase text-blue-sail">Status: {selectedPE1Reg.status}</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await updatePE1RegistrationStatus(selectedPE1Reg.id, 'confirmed');
                    setSelectedPE1Reg((prev: any) => ({ ...prev, status: 'confirmed' }));
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold px-3 py-1.5 border border-blue-sail cursor-pointer"
                >
                  ✓ Confirm (Setuju)
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await updatePE1RegistrationStatus(selectedPE1Reg.id, 'rejected');
                    setSelectedPE1Reg((prev: any) => ({ ...prev, status: 'rejected' }));
                  }}
                  className="bg-red-inferno hover:bg-red-700 text-white font-mono text-xs font-bold px-3 py-1.5 border border-blue-sail cursor-pointer"
                >
                  ✕ Reject (Tolak)
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedPE1Reg(null)}
                className="bg-ballroom hover:bg-decor/20 text-blue-sail font-mono text-xs font-bold px-4 py-2 border-2 border-blue-sail cursor-pointer"
              >
                Tutup Modal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPETITION REGISTRATION DETAIL JAWABAN MODAL */}
      {selectedCompDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-sail/80 backdrop-blur-xs">
          <div className="bg-ballroom border-4 border-blue-sail p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-[10px_10px_0_0_#BD1B1F]">
            <div className="flex items-center justify-between border-b-2 border-blue-sail/20 pb-4">
              <div>
                <span className="bg-decor text-blue-sail font-display font-black text-[10px] px-2.5 py-1 uppercase tracking-wider border border-blue-sail inline-block mb-1">
                  DETAIL JAWABAN PENDAFTAR TIM
                </span>
                <h3 className="font-display font-black text-2xl uppercase text-blue-sail">
                  {selectedCompDetail.team_name}
                </h3>
                <p className="text-xs font-sans text-blue-sail/70">
                  Cabang: <strong>{selectedCompDetail.competition_type || 'BPC'}</strong> | Kategori: <strong>{selectedCompDetail.education_category || 'Mahasiswa'}</strong> | Tanggal: {new Date(selectedCompDetail.submitted_at).toLocaleString('id-ID')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCompDetail(null)}
                className="bg-red-inferno text-white p-2 border border-blue-sail hover:bg-red-700 cursor-pointer"
              >
                <Icon name="X" size={18} />
              </button>
            </div>

            {/* Identitas Ketua Tim */}
            {(() => {
              const leaderObj = getParsedLeader(selectedCompDetail);
              return (
                <div className="bg-white border-2 border-blue-sail p-5 space-y-3 shadow-[4px_4px_0_0_#BD1B1F]">
                  <span className="bg-red-inferno text-white font-display font-black text-[10px] px-2.5 py-0.5 uppercase inline-block">
                    DATA KETUA TIM
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans text-blue-sail">
                    <div><strong className="font-display uppercase text-blue-sail">Nama Lengkap:</strong> {selectedCompDetail.leader_name}</div>
                    <div><strong className="font-display uppercase text-blue-sail">Institusi / Sekolah:</strong> {selectedCompDetail.institution}</div>
                    <div><strong className="font-display uppercase text-blue-sail">WhatsApp:</strong> {selectedCompDetail.contact}</div>
                    <div><strong className="font-display uppercase text-blue-sail">Email:</strong> {selectedCompDetail.email}</div>
                    {leaderObj.studentId && <div><strong className="font-display uppercase text-blue-sail">NRP / NIM:</strong> {leaderObj.studentId}</div>}
                    {leaderObj.major && <div><strong className="font-display uppercase text-blue-sail">Jurusan:</strong> {leaderObj.major}</div>}
                    {leaderObj.grade && <div><strong className="font-display uppercase text-blue-sail">Kelas:</strong> Kelas {leaderObj.grade}</div>}
                    {leaderObj.domicile && <div><strong className="font-display uppercase text-blue-sail">Domisili:</strong> {leaderObj.domicile}</div>}
                  </div>
                  {selectedCompDetail.payment_proof_url && (
                    <div className="pt-2 border-t border-blue-sail/10">
                      <button
                        type="button"
                        onClick={() => openDoc(selectedCompDetail.payment_proof_url, `KTM / Kartu Pelajar - ${selectedCompDetail.leader_name}`)}
                        className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-red-inferno hover:underline cursor-pointer"
                      >
                        <Icon name="FileText" size={14} />
                        <span>LIHAT KTM / KARTU PELAJAR KETUA</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Identitas Anggota Tim */}
            {(() => {
              const membersList = getParsedMembers(selectedCompDetail);
              return (
                <div className="space-y-4">
                  <h4 className="font-display font-black text-sm uppercase text-blue-sail">
                    DATA ANGGOTA TIM ({membersList.length} ANGGOTA)
                  </h4>
                  {membersList.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {membersList.map((m: any, idx: number) => (
                        <div key={idx} className="bg-white border-2 border-blue-sail p-4 space-y-2 shadow-[3px_3px_0_0_#2A4C9E]">
                          <span className="bg-blue-sail text-decor font-display font-black text-[10px] px-2 py-0.5 uppercase inline-block">
                            ANGGOTA {idx + 1}
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans text-blue-sail">
                            <div><strong>Nama:</strong> {m.fullName || m.name || '-'}</div>
                            <div><strong>Institusi/Sekolah:</strong> {m.institution || '-'}</div>
                            <div><strong>WhatsApp:</strong> {m.whatsapp || '-'}</div>
                            <div><strong>Email:</strong> {m.email || '-'}</div>
                            {m.studentId && <div><strong>NRP/NIM:</strong> {m.studentId}</div>}
                            {m.major && <div><strong>Jurusan:</strong> {m.major}</div>}
                            {m.grade && <div><strong>Kelas:</strong> Kelas {m.grade}</div>}
                            {m.domicile && <div><strong>Domisili:</strong> {m.domicile}</div>}
                          </div>
                          {m.cardFileUrl && (
                            <button
                              type="button"
                              onClick={() => openDoc(m.cardFileUrl, `KTM / Kartu Pelajar Anggota ${idx + 1} - ${m.fullName || m.name}`)}
                              className="inline-flex items-center gap-1 text-xs font-mono font-bold text-blue-600 hover:underline pt-1 cursor-pointer"
                            >
                              <Icon name="FileText" size={14} /> Lihat KTM / Kartu Pelajar Anggota {idx + 1}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white p-4 border border-blue-sail/20 text-xs font-sans text-gray-500 italic">
                      Pendaftaran tim ini hanya terdiri dari Ketua Tim.
                    </div>
                  )}
                </div>
              );
            })()}

              {/* Berkas Syarat Umum & Task Preliminary */}
              <div className="bg-blue-sail/5 border-2 border-blue-sail p-4 space-y-3">
                <h4 className="font-display font-black text-xs uppercase text-blue-sail">BERKAS PERSYARATAN &amp; TASK PRELIMINARY</h4>
                <div className="flex flex-wrap gap-4 text-xs font-mono">
                  {selectedCompDetail.ig_story_file_url && (
                    <button
                      type="button"
                      onClick={() => openDoc(selectedCompDetail.ig_story_file_url, 'Bukti IG Story')}
                      className="text-red-inferno font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Icon name="ExternalLink" size={14} /> Bukti IG Story (PDF)
                    </button>
                  )}
                  {selectedCompDetail.twibbon_file_url && (
                    <button
                      type="button"
                      onClick={() => openDoc(selectedCompDetail.twibbon_file_url, 'Bukti Twibbon Feeds')}
                      className="text-red-inferno font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Icon name="ExternalLink" size={14} /> Bukti Twibbon Feeds (PDF)
                    </button>
                  )}
                  {selectedCompDetail.ig_follow_file_url && (
                    <button
                      type="button"
                      onClick={() => openDoc(selectedCompDetail.ig_follow_file_url, 'Bukti Follow IG')}
                      className="text-red-inferno font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Icon name="ExternalLink" size={14} /> Bukti Follow IG (PDF)
                    </button>
                  )}
                </div>

                {selectedCompDetail.preliminary_file_url ? (
                  <div className="bg-white p-3 border border-blue-sail/30 flex items-center justify-between gap-3 mt-2">
                    <div>
                      <span className="font-display font-bold text-xs text-blue-sail uppercase block">
                        BERKAS PRELIMINARY ({selectedCompDetail.preliminary_file_type || 'BMC / Executive Summary'})
                      </span>
                      <span className="text-[11px] font-sans text-emerald-700 font-bold">
                        {selectedCompDetail.preliminary_file_name || 'Berkas_Preliminary.pdf'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => openDoc(selectedCompDetail.preliminary_file_url, selectedCompDetail.preliminary_file_name || 'Berkas Preliminary')}
                      className="bg-decor text-blue-sail font-display font-black text-xs uppercase px-4 py-2 border border-blue-sail shadow-[2px_2px_0_0_#BD1B1F] flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Icon name="FileCheck" size={14} />
                      <span>BUKA BERKAS PDF</span>
                    </button>
                  </div>
                ) : (
                  <p className="text-xs font-sans text-gray-500 font-bold">Tim belum mengumpulkan berkas Preliminary (BMC / Executive Summary).</p>
                )}

                {/* Semi Final Payment Proof Section */}
                {selectedCompDetail.payment_semifinal_url ? (
                  <div className="bg-emerald-50 p-3 border border-emerald-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-2">
                    <div>
                      <span className="font-display font-bold text-xs text-emerald-900 uppercase block">
                        BUKTI PEMBAYARAN REGISTRASI SEMI FINAL
                      </span>
                      <span className="text-[11px] font-mono text-emerald-800 font-bold">
                        Berkas: {selectedCompDetail.payment_semifinal_file_name || 'Bukti_Transfer.pdf'}
                      </span>
                      <span className={`text-[10px] font-display font-bold uppercase px-2 py-0.5 border ml-2 ${
                        selectedCompDetail.payment_semifinal_status === 'verified'
                          ? 'bg-emerald-600 text-white border-emerald-700'
                          : 'bg-amber-500 text-white border-amber-600'
                      }`}>
                        {selectedCompDetail.payment_semifinal_status === 'verified' ? '✓ DIVERIFIKASI' : 'MENUNGGU VERIFIKASI'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openDoc(selectedCompDetail.payment_semifinal_url, `Bukti Pembayaran Semi Final - ${selectedCompDetail.team_name}`, selectedCompDetail.payment_semifinal_file_name || 'bukti_transfer')}
                        className="bg-blue-sail text-decor font-display font-black text-xs uppercase px-3 py-1.5 border border-blue-sail flex items-center gap-1 cursor-pointer"
                      >
                        <Icon name="FileText" size={12} />
                        <span>PRATINJAU BUKTI</span>
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          await updateCompetitionRegistrationStatus(selectedCompDetail.id, { payment_semifinal_status: 'verified' });
                          setSelectedCompDetail(prev => prev ? { ...prev, payment_semifinal_status: 'verified' } : null);
                        }}
                        className={`font-display font-bold text-xs uppercase px-3 py-1.5 border cursor-pointer ${
                          selectedCompDetail.payment_semifinal_status === 'verified'
                            ? 'bg-emerald-700 text-white border-emerald-800'
                            : 'bg-white text-emerald-700 border-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        ✓ Setujui Pembayaran
                      </button>
                    </div>
                  </div>
                ) : selectedCompDetail.status_preliminary === 'passed' ? (
                  <p className="text-xs font-sans text-amber-800 bg-amber-50 border border-amber-300 p-2 font-bold mt-2">
                    Tim Lolos Preliminary tapi belum mengunggah bukti pembayaran Semi Final.
                  </p>
                ) : null}

                {/* Semi Final Task Submission File Section for Admin */}
                {selectedCompDetail.semifinal_file_url ? (
                  <div className="bg-purple-50 p-3 border border-purple-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-2">
                    <div>
                      <span className="font-display font-bold text-xs text-purple-900 uppercase block">
                        BERKAS SUBMISSION SEMI FINAL (PROPOSAL / SOLUSI STUDI KASUS)
                      </span>
                      <span className="text-[11px] font-mono text-purple-800 font-bold">
                        Berkas: {selectedCompDetail.semifinal_file_name || 'Berkas_SemiFinal.pdf'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => openDoc(selectedCompDetail.semifinal_file_url, `Berkas Semi Final - ${selectedCompDetail.team_name}`)}
                      className="bg-purple-700 hover:bg-purple-800 text-white font-display font-bold text-xs uppercase px-4 py-2 border border-blue-sail flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Icon name="FileCheck" size={14} />
                      <span>BUKA BERKAS SEMI FINAL PDF</span>
                    </button>
                  </div>
                ) : selectedCompDetail.payment_semifinal_status === 'verified' ? (
                  <p className="text-xs font-sans text-purple-800 bg-purple-50 border border-purple-300 p-2 font-bold mt-2">
                    Pembayaran Semi Final sudah terverifikasi. Tim belum mengunggah berkas submission Semi Final.
                  </p>
                ) : null}
            </div>

            {/* Stage Progression Controller inside Modal */}

            {/* Stage Progression Controller inside Modal */}
            <div className="bg-decor/20 border-2 border-blue-sail p-4 space-y-3">
              <h4 className="font-display font-black text-xs uppercase text-blue-sail">KONTROL STATUS KELOLOSAN TAHAP LOMBA</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-sans">
                
                {/* Preliminary */}
                <div className="bg-white p-3 border border-blue-sail space-y-1.5">
                  <span className="font-display font-bold text-[10px] text-blue-sail uppercase block">1. Preliminary Stage</span>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={async () => {
                        await updateCompetitionRegistrationStatus(selectedCompDetail.id, { status_preliminary: 'pending', status_stage: 'preliminary' });
                        setSelectedCompDetail(prev => prev ? { ...prev, status_preliminary: 'pending', status_stage: 'preliminary' } : null);
                      }}
                      className={`px-2 py-1 text-[9px] font-display font-bold uppercase border cursor-pointer ${
                        (!selectedCompDetail.status_preliminary || selectedCompDetail.status_preliminary === 'pending')
                          ? 'bg-amber-100 text-amber-800 border-amber-400 font-black'
                          : 'bg-white text-gray-600 border-gray-300'
                      }`}
                    >
                      ↺ Kondisi Awal
                    </button>
                    <button
                      onClick={async () => {
                        await updateCompetitionRegistrationStatus(selectedCompDetail.id, { status_preliminary: 'passed', status_stage: 'semifinal' });
                        setSelectedCompDetail(prev => prev ? { ...prev, status_preliminary: 'passed', status_stage: 'semifinal' } : null);
                      }}
                      className={`px-2 py-1 text-[9px] font-display font-bold uppercase border cursor-pointer ${
                        selectedCompDetail.status_preliminary === 'passed'
                          ? 'bg-emerald-600 text-white border-emerald-700 font-black'
                          : 'bg-white text-emerald-700 border-emerald-400'
                      }`}
                    >
                      ✓ Lolos Preliminary
                    </button>
                    <button
                      onClick={async () => {
                        await updateCompetitionRegistrationStatus(selectedCompDetail.id, { status_preliminary: 'rejected', status_stage: 'preliminary' });
                        setSelectedCompDetail(prev => prev ? { ...prev, status_preliminary: 'rejected', status_stage: 'preliminary' } : null);
                      }}
                      className={`px-2 py-1 text-[9px] font-display font-bold uppercase border cursor-pointer ${
                        selectedCompDetail.status_preliminary === 'rejected'
                          ? 'bg-red-inferno text-white border-red-700 font-black'
                          : 'bg-white text-red-600 border-red-300'
                      }`}
                    >
                      ✕ Tidak Lolos
                    </button>
                  </div>
                </div>

                {/* Semi Final */}
                <div className={`bg-white p-3 border space-y-1.5 ${selectedCompDetail.status_preliminary === 'passed' ? 'border-blue-sail' : 'border-gray-200 opacity-50'}`}>
                  <span className="font-display font-bold text-[10px] text-blue-sail uppercase block">2. Semi Final Stage</span>
                  {selectedCompDetail.status_preliminary === 'passed' ? (
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={async () => {
                          await updateCompetitionRegistrationStatus(selectedCompDetail.id, { status_semifinal: 'pending', status_stage: 'semifinal' });
                          setSelectedCompDetail(prev => prev ? { ...prev, status_semifinal: 'pending', status_stage: 'semifinal' } : null);
                        }}
                        className={`px-2 py-1 text-[9px] font-display font-bold uppercase border cursor-pointer ${
                          (!selectedCompDetail.status_semifinal || selectedCompDetail.status_semifinal === 'pending')
                            ? 'bg-amber-100 text-amber-800 border-amber-400 font-black'
                            : 'bg-white text-gray-600 border-gray-300'
                        }`}
                      >
                        ↺ Kondisi Awal Semi Final
                      </button>
                      <button
                        onClick={async () => {
                          await updateCompetitionRegistrationStatus(selectedCompDetail.id, { status_semifinal: 'passed', status_stage: 'final' });
                          setSelectedCompDetail(prev => prev ? { ...prev, status_semifinal: 'passed', status_stage: 'final' } : null);
                        }}
                        className={`px-2 py-1 text-[9px] font-display font-bold uppercase border cursor-pointer ${
                          selectedCompDetail.status_semifinal === 'passed'
                            ? 'bg-emerald-600 text-white border-emerald-700 font-black'
                            : 'bg-white text-emerald-700 border-emerald-400'
                        }`}
                      >
                        ✓ Lolos Semi Final
                      </button>
                      <button
                        onClick={async () => {
                          await updateCompetitionRegistrationStatus(selectedCompDetail.id, { status_semifinal: 'rejected', status_stage: 'semifinal' });
                          setSelectedCompDetail(prev => prev ? { ...prev, status_semifinal: 'rejected', status_stage: 'semifinal' } : null);
                        }}
                        className={`px-2 py-1 text-[9px] font-display font-bold uppercase border cursor-pointer ${
                          selectedCompDetail.status_semifinal === 'rejected'
                            ? 'bg-red-inferno text-white border-red-700 font-black'
                            : 'bg-white text-red-600 border-red-300'
                        }`}
                      >
                        ✕ Tidak Lolos Semi Final
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] font-sans text-gray-400 italic block">Terkunci hingga Lolos Preliminary</span>
                  )}
                </div>

                {/* Final */}
                <div className={`bg-white p-3 border space-y-1.5 ${selectedCompDetail.status_semifinal === 'passed' ? 'border-blue-sail' : 'border-gray-200 opacity-50'}`}>
                  <span className="font-display font-bold text-[10px] text-blue-sail uppercase block">3. Grand Final Stage</span>
                  {selectedCompDetail.status_semifinal === 'passed' ? (
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={async () => {
                          await updateCompetitionRegistrationStatus(selectedCompDetail.id, { status_final: 'pending', status_stage: 'final' });
                          setSelectedCompDetail(prev => prev ? { ...prev, status_final: 'pending', status_stage: 'final' } : null);
                        }}
                        className={`px-2 py-1 text-[9px] font-display font-bold uppercase border cursor-pointer ${
                          (!selectedCompDetail.status_final || selectedCompDetail.status_final === 'pending')
                            ? 'bg-amber-100 text-amber-800 border-amber-400 font-black'
                            : 'bg-white text-gray-600 border-gray-300'
                        }`}
                      >
                        ↺ Kondisi Awal Final
                      </button>
                      <button
                        onClick={async () => {
                          await updateCompetitionRegistrationStatus(selectedCompDetail.id, { status_final: 'passed', status_stage: 'final' });
                          setSelectedCompDetail(prev => prev ? { ...prev, status_final: 'passed', status_stage: 'final' } : null);
                        }}
                        className={`px-2 py-1 text-[9px] font-display font-bold uppercase border cursor-pointer ${
                          selectedCompDetail.status_final === 'passed'
                            ? 'bg-purple-700 text-white border-purple-800 font-black'
                            : 'bg-white text-purple-700 border-purple-400'
                        }`}
                      >
                        ✓ Lolos Final (Juara)
                      </button>
                      <button
                        onClick={async () => {
                          await updateCompetitionRegistrationStatus(selectedCompDetail.id, { status_final: 'rejected', status_stage: 'final' });
                          setSelectedCompDetail(prev => prev ? { ...prev, status_final: 'rejected', status_stage: 'final' } : null);
                        }}
                        className={`px-2 py-1 text-[9px] font-display font-bold uppercase border cursor-pointer ${
                          selectedCompDetail.status_final === 'rejected'
                            ? 'bg-red-inferno text-white border-red-700 font-black'
                            : 'bg-white text-red-600 border-red-300'
                        }`}
                      >
                        ✕ Tidak Lolos Final
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] font-sans text-gray-400 italic block">Terkunci hingga Lolos Semi Final</span>
                  )}
                </div>

              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCompDetail(null)}
                className="bg-decor hover:bg-decor/90 text-blue-sail font-display font-black text-xs uppercase px-6 py-2.5 border-2 border-blue-sail shadow-[3px_3px_0_0_#BD1B1F] cursor-pointer"
              >
                Tutup Detail Pendaftar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BERKAS FILE PREVIEW MODAL */}
      {viewingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-sail/90 backdrop-blur-sm">
          <div className="bg-ballroom border-4 border-blue-sail p-5 sm:p-6 max-w-4xl w-full max-h-[95vh] overflow-y-auto space-y-4 shadow-[12px_12px_0_0_#BD1B1F]">
            <div className="flex items-center justify-between border-b-2 border-blue-sail/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="bg-red-inferno text-white font-display font-black text-[10px] px-2.5 py-1 uppercase tracking-wider border border-blue-sail">
                  PRATINJAU BERKAS DOKUMEN
                </span>
                <h3 className="font-display font-black text-lg uppercase text-blue-sail truncate max-w-md sm:max-w-xl">
                  {viewingFile.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingFile(null)}
                className="bg-red-inferno text-white p-1.5 border border-blue-sail hover:bg-red-700 cursor-pointer"
              >
                <Icon name="X" size={18} />
              </button>
            </div>

            {/* Document Viewer Content */}
            <div className="bg-white border-2 border-blue-sail p-3">
              {viewingFile.url.startsWith('data:image/') || viewingFile.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) || viewingFile.fileName?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                <div className="bg-gray-900 border border-blue-sail/30 p-4 flex items-center justify-center min-h-[60vh]">
                  <img
                    src={viewingFile.url}
                    alt={viewingFile.title}
                    className="max-h-[70vh] max-w-full object-contain shadow-lg"
                  />
                </div>
              ) : viewingFile.url.startsWith('data:application/pdf') || viewingFile.url.startsWith('data:pdf') || viewingFile.url.endsWith('.pdf') || viewingFile.fileName?.endsWith('.pdf') || viewingFile.url.startsWith('data:application/') ? (
                <iframe
                  src={viewingFile.url}
                  title={viewingFile.title}
                  className="w-full h-[70vh] border border-blue-sail/30 bg-gray-50"
                />
              ) : (
                <div className="space-y-4 p-4 text-center">
                  <div className="bg-blue-sail/5 p-4 border border-blue-sail/20 inline-block text-left w-full">
                    <span className="bg-decor text-blue-sail font-display font-black text-[10px] px-2 py-0.5 uppercase border border-blue-sail inline-block mb-2">
                      INFORMASI BERKAS PENDAFTARAN
                    </span>
                    <p className="text-xs font-mono font-bold text-blue-sail">Nama Berkas: {viewingFile.fileName || viewingFile.title}</p>
                    <p className="text-xs font-sans text-blue-sail/70 mt-1">Status: Berkas telah tercatat di database pendaftaran tim.</p>
                  </div>
                  <div className="border-2 border-dashed border-blue-sail/30 p-4 bg-gray-50 flex justify-center">
                    <img src={SAMPLE_DOC_SVG} alt="Pratinjau Berkas" className="max-h-[50vh] w-auto border-2 border-blue-sail shadow-md" />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex gap-2">
                {(viewingFile.url.startsWith('data:') || viewingFile.url.startsWith('http') || viewingFile.url.startsWith('blob:')) && (
                  <button
                    type="button"
                    onClick={() => {
                      const win = window.open();
                      if (win) {
                        if (viewingFile.url.startsWith('data:application/pdf')) {
                          win.document.write(`<html><head><title>${viewingFile.title}</title></head><body style="margin:0;"><iframe src="${viewingFile.url}" width="100%" height="100%" frameborder="0"></iframe></body></html>`);
                        } else if (viewingFile.url.startsWith('data:image/')) {
                          win.document.write(`<html><head><title>${viewingFile.title}</title></head><body style="margin:0;display:flex;align-items:center;justify-content:center;background:#111;"><img src="${viewingFile.url}" style="max-width:100%;max-height:100vh;"/></body></html>`);
                        } else {
                          win.location.href = viewingFile.url;
                        }
                      }
                    }}
                    className="bg-blue-sail hover:bg-barbera text-decor font-display font-bold text-xs uppercase px-4 py-2 border border-blue-sail flex items-center gap-1.5 cursor-pointer"
                  >
                    <Icon name="ExternalLink" size={14} />
                    <span>BUKA DI TAB BARU</span>
                  </button>
                )}
                {viewingFile.url.startsWith('data:') && (() => {
                  const getExt = () => {
                    if (viewingFile.url.startsWith('data:image/jpeg') || viewingFile.url.startsWith('data:image/jpg')) return '.jpg';
                    if (viewingFile.url.startsWith('data:image/png')) return '.png';
                    if (viewingFile.url.startsWith('data:image/webp')) return '.webp';
                    if (viewingFile.url.startsWith('data:image/gif')) return '.gif';
                    if (viewingFile.url.startsWith('data:application/pdf')) return '.pdf';
                    if (viewingFile.fileName && viewingFile.fileName.includes('.')) return '.' + viewingFile.fileName.split('.').pop();
                    return '.pdf';
                  };
                  const ext = getExt();
                  const rawName = (viewingFile.fileName || 'berkas_pendaftaran').replace(/\.[^/.]+$/, '');
                  const downloadName = `${rawName}${ext}`;
                  return (
                    <a
                      href={viewingFile.url}
                      download={downloadName}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-xs uppercase px-4 py-2 border border-blue-sail flex items-center gap-1.5 cursor-pointer"
                    >
                      <Icon name="Download" size={14} />
                      <span>UNDUH BERKAS ({ext.toUpperCase().replace('.', '')})</span>
                    </a>
                  );
                })()}
              </div>

              <button
                type="button"
                onClick={() => setViewingFile(null)}
                className="bg-decor hover:bg-decor/90 text-blue-sail font-display font-black text-xs uppercase px-6 py-2 border-2 border-blue-sail cursor-pointer"
              >
                TUTUP PRATINJAU
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
