import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
    ArrowDownLeft,
    ArrowRight,
    ArrowUpRight,
    BookOpen,
    CheckCircle2,
    Circle,
    Clock3,
    Coffee,
    FileText,
    Plus,
    Sparkles,
    Trash2,
    Wallet,
} from 'lucide-react';
import { Sidebar } from './Components/Layout/Sidebar';
import { Navbar } from './Components/Layout/Navbar';
import { AuthPage } from './Components/UI/AuthPage';
import { Modal } from './Components/UI/Modal';
import { ThemeProvider } from './Contexts/ThemeContext';
import { api } from './Services/api';
import { formatDate, formatRupiah } from './Services/formatters';
import '../css/app.css';

const today = new Date();
const dateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
const monthKey = (date) => date.slice(0, 7);
const currentMonth = monthKey(dateKey(today));

function App() {
    const [user, setUser] = useState(null);
    const [activePage, setActivePage] = useState('dashboard');
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [modalAction, setModalAction] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [notes, setNotes] = useState([]);
    const [isBootstrapping, setIsBootstrapping] = useState(true);
    const [bootstrapError, setBootstrapError] = useState('');
    const [requestError, setRequestError] = useState('');
    const [formError, setFormError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState({ title: '', body: '', amount: '', date: dateKey(today), category: 'Makanan' });

    const applyBootstrap = (data) => {
        setUser(data.user);
        setTasks(data.tasks);
        setTransactions(data.transactions);
        setNotes(data.notes);
    };

    const loadBootstrap = async () => {
        applyBootstrap(await api.bootstrap());
        setBootstrapError('');
        setRequestError('');
    };

    useEffect(() => {
        let isCurrent = true;
        api.bootstrap()
            .then((data) => {
                if (isCurrent) applyBootstrap(data);
            })
            .catch((error) => {
                if (isCurrent && error.status !== 401) setBootstrapError(error.message);
            })
            .finally(() => {
                if (isCurrent) setIsBootstrapping(false);
            });

        return () => {
            isCurrent = false;
        };
    }, []);

    const monthTransactions = transactions.filter((item) => monthKey(item.date) === currentMonth);
    const income = monthTransactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
    const expenses = monthTransactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
    const pendingTasks = tasks.filter((task) => !task.done);
    const pageInfo = {
        dashboard: ['Ringkasan', 'Satu tempat untuk melihat hal-hal pentingmu.'],
        tasks: ['Daftar Tugas', 'Langkah kecil hari ini, kemajuan besar nanti.'],
        finance: ['Catatan Keuangan', 'Kenali ke mana uangmu pergi dan datang.'],
        notes: ['Catatan & Jurnal', 'Simpan pikiran, ide, dan momen berharga.'],
        reports: ['Laporan Bulanan', 'Lihat perjalanan keuanganmu bulan ini.'],
    };

    const openAction = (action) => {
        setForm({ title: '', body: '', amount: '', date: dateKey(today), category: action === 'income' ? 'Gaji' : 'Makanan' });
        setFormError('');
        setModalAction(action);
    };

    const saveAction = async (event) => {
        event.preventDefault();
        setFormError('');
        setIsSaving(true);

        try {
            if (modalAction === 'task') {
                const task = await api.createTask({ title: form.title.trim(), date: form.date });
                setTasks((items) => [task, ...items]);
            } else if (modalAction === 'income' || modalAction === 'expense') {
                const transaction = await api.createTransaction({
                    title: form.title.trim(),
                    category: form.category,
                    amount: Number(form.amount),
                    type: modalAction,
                    date: form.date,
                });
                setTransactions((items) => [transaction, ...items]);
            } else if (modalAction === 'note') {
                const note = await api.createNote({
                    title: form.title.trim(),
                    body: form.body.trim(),
                    date: form.date,
                });
                setNotes((items) => [note, ...items]);
            } else {
                throw new Error('Jenis catatan tidak dikenali.');
            }

            setModalAction(null);
        } catch (error) {
            setFormError(Object.values(error.errors || {}).flat()[0] || error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const toggleTask = async (id) => {
        try {
            const task = tasks.find((item) => item.id === id);
            if (!task) throw new Error('Tugas tidak ditemukan.');
            const updated = await api.updateTask(id, { done: !task.done });
            setTasks((items) => items.map((item) => item.id === id ? updated : item));
            setRequestError('');
        } catch (error) {
            setRequestError(error.message);
        }
    };

    const removeTask = async (id) => {
        try {
            await api.deleteTask(id);
            setTasks((items) => items.filter((task) => task.id !== id));
            setRequestError('');
        } catch (error) {
            setRequestError(error.message);
        }
    };

    const removeTransaction = async (id) => {
        try {
            await api.deleteTransaction(id);
            setTransactions((items) => items.filter((item) => item.id !== id));
            setRequestError('');
        } catch (error) {
            setRequestError(error.message);
        }
    };

    const removeNote = async (id) => {
        try {
            await api.deleteNote(id);
            setNotes((items) => items.filter((note) => note.id !== id));
            setRequestError('');
        } catch (error) {
            setRequestError(error.message);
        }
    };

    const logout = async () => {
        try {
            await api.logout();
            setUser(null);
            setTasks([]);
            setTransactions([]);
            setNotes([]);
            setActivePage('dashboard');
        } catch (error) {
            setRequestError(error.message);
        }
    };

    const quickAction = (action) => openAction(action);
    const titles = pageInfo[activePage] || pageInfo.dashboard;

    if (isBootstrapping) {
        return <div className="auth-loading"><Sparkles size={24} className="text-blue-600" />Memuat JurnalKu...</div>;
    }

    if (bootstrapError) {
        return (
            <div className="auth-loading">
                <p role="alert">{bootstrapError}</p>
                <button type="button" onClick={() => { setIsBootstrapping(true); loadBootstrap().catch((error) => setBootstrapError(error.message)).finally(() => setIsBootstrapping(false)); }} className="auth-retry">Coba lagi</button>
            </div>
        );
    }

    if (!user) {
        return <AuthPage onAuthenticated={loadBootstrap} />;
    }

    return (
        <div className="min-h-screen theme-app">
            <div className="mx-auto flex min-h-screen max-w-[1600px]">
                <Sidebar
                    activePage={activePage}
                    setActivePage={setActivePage}
                    isMobileOpen={isMobileOpen}
                    setIsMobileOpen={setIsMobileOpen}
                    onQuickAction={quickAction}
                    user={user}
                    onLogout={logout}
                />
                <div className="min-w-0 flex-1">
                    <Navbar title={titles[0]} subtitle={titles[1]} onMenuClick={() => setIsMobileOpen(true)} onQuickAction={quickAction} />
                    <main className="mx-auto max-w-7xl p-4 sm:p-7 lg:p-9">
                        {requestError && <div role="alert" className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"><span>{requestError}</span><button type="button" aria-label="Tutup pesan" onClick={() => setRequestError('')}><span aria-hidden="true">×</span></button></div>}
                        {activePage === 'dashboard' && (
                            <Dashboard
                                income={income}
                                expenses={expenses}
                                pendingTasks={pendingTasks}
                                tasks={tasks}
                                transactions={transactions}
                                notes={notes}
                                setActivePage={setActivePage}
                                onQuickAction={quickAction}
                                toggleTask={toggleTask}
                            />
                        )}
                        {activePage === 'tasks' && <TasksPage tasks={tasks} onToggle={toggleTask} onRemove={removeTask} onAdd={() => quickAction('task')} />}
                        {activePage === 'finance' && <FinancePage transactions={transactions} onRemove={removeTransaction} onAdd={quickAction} />}
                        {activePage === 'notes' && <NotesPage notes={notes} onRemove={removeNote} onAdd={() => quickAction('note')} />}
                        {activePage === 'reports' && <ReportsPage transactions={transactions} income={income} expenses={expenses} />}
                    </main>
                    <footer className="px-6 pb-6 text-center text-xs theme-text-muted">Dibuat dengan tenang, untuk hari yang lebih tertata.</footer>
                </div>
            </div>

            <Modal
                isOpen={Boolean(modalAction)}
                onClose={() => setModalAction(null)}
                title={actionTitle(modalAction)}
                description={actionDescription(modalAction)}
            >
                <form onSubmit={saveAction} className="space-y-4">
                    <label className="block space-y-1.5 text-xs font-semibold theme-text-secondary">
                        {modalAction === 'note' ? 'Judul catatan' : modalAction === 'task' ? 'Nama tugas' : 'Nama transaksi'}
                        <input
                            autoFocus
                            required
                            value={form.title}
                            onChange={(event) => setForm({ ...form, title: event.target.value })}
                            placeholder={modalAction === 'task' ? 'Contoh: Olahraga 20 menit' : modalAction === 'note' ? 'Apa yang ingin kamu ingat?' : 'Contoh: Makan siang'}
                            className="w-full rounded-xl border px-3.5 py-3 text-sm font-normal outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 theme-border theme-surface theme-text"
                        />
                    </label>
                    {(modalAction === 'income' || modalAction === 'expense') && (
                        <div className="grid grid-cols-2 gap-3">
                            <label className="block space-y-1.5 text-xs font-semibold theme-text-secondary">
                                Jumlah (Rp)
                                <input type="number" min="1" required value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="0" className="w-full rounded-xl border px-3.5 py-3 text-sm font-normal outline-none focus:border-blue-500 theme-border theme-surface theme-text" />
                            </label>
                            <label className="block space-y-1.5 text-xs font-semibold theme-text-secondary">
                                Kategori
                                <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="w-full rounded-xl border px-3 py-3 text-sm font-normal outline-none theme-border theme-surface theme-text">
                                    {(modalAction === 'income' ? ['Gaji', 'Freelance', 'Investasi', 'Lainnya'] : ['Makanan', 'Belanja', 'Transportasi', 'Tagihan', 'Lainnya']).map((category) => <option key={category}>{category}</option>)}
                                </select>
                            </label>
                        </div>
                    )}
                    {modalAction === 'note' && (
                        <label className="block space-y-1.5 text-xs font-semibold theme-text-secondary">
                            Isi catatan
                            <textarea required rows="4" value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} placeholder="Tulis dengan bebas..." className="w-full resize-y rounded-xl border px-3.5 py-3 text-sm font-normal outline-none focus:border-blue-500 theme-border theme-surface theme-text" />
                        </label>
                    )}
                    {modalAction !== 'note' && (
                        <label className="block space-y-1.5 text-xs font-semibold theme-text-secondary">
                            Tanggal
                            <input type="date" required value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="w-full rounded-xl border px-3.5 py-3 text-sm font-normal outline-none focus:border-blue-500 theme-border theme-surface theme-text" />
                        </label>
                    )}
                    {formError && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</p>}
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" disabled={isSaving} onClick={() => setModalAction(null)} className="rounded-xl border px-4 py-2.5 text-sm font-semibold theme-border theme-text-secondary">Batal</button>
                        <button type="submit" disabled={isSaving} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60">{isSaving ? 'Menyimpan...' : 'Simpan'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

function actionTitle(action) {
    return ({ task: 'Tambah tugas', income: 'Catat pemasukan', expense: 'Catat pengeluaran', note: 'Tulis catatan' })[action] || 'Tambah catatan';
}
function actionDescription(action) {
    return ({ task: 'Tentukan satu hal kecil yang ingin kamu selesaikan.', income: 'Catat uang yang masuk.', expense: 'Catat pengeluaranmu agar tetap terpantau.', note: 'Tuangkan ide atau ceritamu di sini.' })[action] || 'Catat hal baru.';
}

function SectionHeading({ eyebrow, title, action, onAction }) {
    return (
        <div className="mb-5 flex items-end justify-between gap-3">
            <div>
                {eyebrow && <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600">{eyebrow}</p>}
                <h3 className="text-lg font-bold tracking-tight theme-text">{title}</h3>
            </div>
            {action && <button type="button" onClick={onAction} className="flex shrink-0 items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">{action}<ArrowRight size={14} /></button>}
        </div>
    );
}

function StatCard({ label, value, icon: Icon, tone, helper }) {
    return (
        <div className="theme-surface rounded-2xl border p-5 shadow-sm shadow-slate-900/[0.02]">
            <div className="flex items-start justify-between">
                <p className="text-sm font-medium theme-text-secondary">{label}</p>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}><Icon size={17} /></div>
            </div>
            <p className="mt-4 text-2xl font-bold tracking-tight theme-text">{value}</p>
            <p className="mt-1 text-xs theme-text-muted">{helper}</p>
        </div>
    );
}

function Dashboard({ income, expenses, pendingTasks, tasks, transactions, notes, setActivePage, onQuickAction, toggleTask }) {
    const doneToday = tasks.filter((task) => task.done && task.dueDate === dateKey(today)).length;
    const greeting = today.getHours() < 11 ? 'Selamat pagi' : today.getHours() < 15 ? 'Selamat siang' : today.getHours() < 18 ? 'Selamat sore' : 'Selamat malam';

    return (
        <div className="space-y-8">
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 text-white shadow-lg shadow-blue-900/10 sm:p-8">
                <div className="relative z-10 max-w-xl">
                    <div className="mb-3 flex items-center gap-2 text-sm text-blue-100"><Sparkles size={15} /> Ruang untuk harimu</div>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{greeting} 👋</h1>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-blue-100">Pelan-pelan saja. Kamu sudah melakukan yang terbaik—pilih satu hal yang ingin kamu mulai hari ini.</p>
                    <button type="button" onClick={() => onQuickAction('task')} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50"><Plus size={16} /> Tambah tugas</button>
                </div>
                <div className="pointer-events-none absolute -right-5 -top-16 h-64 w-64 rounded-full border border-white/10" />
                <div className="pointer-events-none absolute -right-1 -top-10 h-52 w-52 rounded-full border border-white/10" />
                <div className="pointer-events-none absolute -bottom-24 right-20 h-56 w-56 rounded-full bg-white/[0.06]" />
                <Coffee className="absolute bottom-7 right-8 hidden h-24 w-24 text-white/15 sm:block" strokeWidth={1} />
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Pemasukan bulan ini" value={formatRupiah(income)} icon={ArrowDownLeft} tone="bg-emerald-50 text-emerald-600" helper="Uang yang berhasil kamu kumpulkan" />
                <StatCard label="Pengeluaran bulan ini" value={formatRupiah(expenses)} icon={ArrowUpRight} tone="bg-rose-50 text-rose-600" helper="Tetap sadar, tanpa perlu menghakimi" />
                <StatCard label="Sisa dana" value={formatRupiah(income - expenses)} icon={Wallet} tone="bg-blue-50 text-blue-600" helper="Pemasukan dikurangi pengeluaran" />
                <StatCard label="Tugas selesai hari ini" value={`${doneToday} tugas`} icon={CheckCircle2} tone="bg-amber-50 text-amber-600" helper={`${pendingTasks.length} tugas masih menunggu`} />
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="theme-surface rounded-2xl border p-5 sm:p-6">
                    <SectionHeading eyebrow="Satu per satu" title="Fokus hari ini" action="Semua tugas" onAction={() => setActivePage('tasks')} />
                    <div className="space-y-1">
                        {tasks.slice(0, 4).map((task) => (
                            <TaskRow key={task.id} task={task} onToggle={toggleTask} />
                        ))}
                        {tasks.length === 0 && <EmptyState icon={CheckCircle2} text="Belum ada tugas. Mulai dari satu hal kecil." />}
                    </div>
                </div>
                <div className="theme-surface rounded-2xl border p-5 sm:p-6">
                    <SectionHeading eyebrow="Biar tetap sadar" title="Ringkasan uang" action="Lihat semua" onAction={() => setActivePage('finance')} />
                    <div className="mb-4 grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-emerald-50/70 p-3.5"><p className="text-xs text-emerald-700">Masuk</p><p className="mt-1 font-bold text-emerald-800">{formatRupiah(income)}</p></div>
                        <div className="rounded-xl bg-rose-50/70 p-3.5"><p className="text-xs text-rose-700">Keluar</p><p className="mt-1 font-bold text-rose-800">{formatRupiah(expenses)}</p></div>
                    </div>
                    <div className="space-y-3">
                        {transactions.slice(0, 3).map((item) => <TransactionRow key={item.id} item={item} />)}
                        {transactions.length === 0 && <EmptyState icon={Wallet} text="Belum ada transaksi yang dicatat." />}
                    </div>
                </div>
            </section>

            <section className="grid gap-6 md:grid-cols-2">
                <div className="theme-surface flex items-center gap-4 rounded-2xl border p-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600"><BookOpen size={20} /></div>
                    <div className="min-w-0 flex-1"><p className="font-bold theme-text">Jurnal harianmu</p><p className="mt-1 text-xs theme-text-muted">{notes.length ? `Ada ${notes.length} catatan tersimpan untuk dibaca lagi.` : 'Simpan satu pemikiran dari hari ini.'}</p></div>
                    <button type="button" aria-label="Tulis catatan" onClick={() => onQuickAction('note')} className="rounded-xl p-2 text-blue-600 theme-surface-hover"><Plus size={18} /></button>
                </div>
                <div className="theme-surface flex items-center gap-4 rounded-2xl border p-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600"><FileText size={20} /></div>
                    <div className="min-w-0 flex-1"><p className="font-bold theme-text">Refleksi kecil</p><p className="mt-1 text-xs theme-text-muted">Hari ini, apa satu hal yang terasa cukup baik?</p></div>
                    <button type="button" onClick={() => setActivePage('notes')} className="rounded-xl p-2 text-blue-600 theme-surface-hover" aria-label="Buka jurnal"><ArrowRight size={18} /></button>
                </div>
            </section>
        </div>
    );
}

function TaskRow({ task, onToggle, onRemove }) {
    return (
        <div className="group flex items-center gap-3 rounded-xl px-2 py-3 transition hover:bg-black/[0.025]">
            <button type="button" aria-label={task.done ? 'Tandai belum selesai' : 'Tandai selesai'} onClick={() => onToggle(task.id)} className={`shrink-0 ${task.done ? 'text-emerald-500' : 'theme-text-muted hover:text-blue-600'}`}>
                {task.done ? <CheckCircle2 size={20} /> : <Circle size={20} />}
            </button>
            <span className={`min-w-0 flex-1 text-sm ${task.done ? 'text-slate-400 line-through' : 'theme-text'}`}>{task.title}</span>
            <span className="hidden text-xs theme-text-muted sm:block">{!task.dueDate ? 'Tanpa tenggat' : task.dueDate === dateKey(today) ? 'Hari ini' : formatDate(task.dueDate, { day: 'numeric', month: 'short' })}</span>
            {onRemove && <button type="button" aria-label={`Hapus ${task.title}`} onClick={() => onRemove(task.id)} className="rounded-lg p-1.5 text-slate-400 opacity-0 transition hover:text-rose-500 group-hover:opacity-100"><Trash2 size={15} /></button>}
        </div>
    );
}

function TransactionRow({ item, onRemove }) {
    const isIncome = item.type === 'income';
    return (
        <div className="group flex items-center gap-3 py-2">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                {isIncome ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}
            </div>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold theme-text">{item.title}</p><p className="mt-0.5 text-xs theme-text-muted">{item.category} · {formatDate(item.date, { day: 'numeric', month: 'short' })}</p></div>
            <span className={`whitespace-nowrap text-sm font-semibold ${isIncome ? 'text-emerald-600' : 'theme-text'}`}>{isIncome ? '+' : '−'}{formatRupiah(item.amount)}</span>
            {onRemove && <button type="button" aria-label={`Hapus ${item.title}`} onClick={() => onRemove(item.id)} className="rounded-lg p-1.5 text-slate-400 opacity-0 transition hover:text-rose-500 group-hover:opacity-100"><Trash2 size={15} /></button>}
        </div>
    );
}

function EmptyState({ icon: Icon, text }) {
    return <div className="flex flex-col items-center justify-center py-9 text-center"><Icon size={24} className="mb-2 theme-text-muted" /><p className="max-w-xs text-sm theme-text-muted">{text}</p></div>;
}

function PageIntro({ label, title, text, action, onAction }) {
    return <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-1 text-xs font-semibold text-blue-600">{label}</p><h1 className="text-2xl font-bold tracking-tight theme-text">{title}</h1><p className="mt-1 text-sm theme-text-muted">{text}</p></div><button type="button" onClick={onAction} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"><Plus size={16} />{action}</button></div>;
}

function TasksPage({ tasks, onToggle, onRemove, onAdd }) {
    const open = tasks.filter((task) => !task.done);
    const done = tasks.filter((task) => task.done);
    return (
        <div>
            <PageIntro label="Ruang fokus" title="Daftar tugas" text="Kamu tidak harus menyelesaikan semuanya sekaligus." action="Tambah tugas" onAction={onAdd} />
            <div className="grid gap-6 lg:grid-cols-2">
                {[['Perlu dikerjakan', open], ['Selesai', done]].map(([title, list]) => (
                    <section key={title} className="theme-surface rounded-2xl border p-5 sm:p-6">
                        <div className="mb-3 flex items-center justify-between"><h2 className="font-bold theme-text">{title}</h2><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{list.length}</span></div>
                        {list.length ? list.map((task) => <TaskRow key={task.id} task={task} onToggle={onToggle} onRemove={onRemove} />) : <EmptyState icon={CheckCircle2} text={title === 'Selesai' ? 'Tugas yang tuntas akan muncul di sini.' : 'Semua beres untuk sekarang. Nikmati jedanya.'} />}
                    </section>
                ))}
            </div>
        </div>
    );
}

function FinancePage({ transactions, onRemove, onAdd }) {
    const totalIncome = transactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = transactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
    return (
        <div>
            <PageIntro label="Ruang keuangan" title="Catatan keuangan" text="Mencatat bukan berarti membatasi—ini cara memahami kebiasaanmu." action="Tambah transaksi" onAction={() => onAdd('expense')} />
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <StatCard label="Total pemasukan" value={formatRupiah(totalIncome)} icon={ArrowDownLeft} tone="bg-emerald-50 text-emerald-600" helper="Semua catatan pemasukan" />
                <StatCard label="Total pengeluaran" value={formatRupiah(totalExpenses)} icon={ArrowUpRight} tone="bg-rose-50 text-rose-600" helper="Semua catatan pengeluaran" />
                <StatCard label="Sisa dana" value={formatRupiah(totalIncome - totalExpenses)} icon={Wallet} tone="bg-blue-50 text-blue-600" helper="Pemasukan dikurangi pengeluaran" />
            </div>
            <div className="theme-surface rounded-2xl border p-5 sm:p-6">
                <div className="mb-3 flex items-center justify-between"><h2 className="font-bold theme-text">Semua transaksi</h2><div className="flex gap-2"><button type="button" onClick={() => onAdd('income')} className="rounded-lg border px-3 py-2 text-xs font-semibold text-emerald-700 theme-border">+ Pemasukan</button><button type="button" onClick={() => onAdd('expense')} className="rounded-lg border px-3 py-2 text-xs font-semibold text-rose-600 theme-border">+ Pengeluaran</button></div></div>
                {transactions.length ? <div className="divide-y theme-border">{transactions.map((item) => <TransactionRow key={item.id} item={item} onRemove={onRemove} />)}</div> : <EmptyState icon={Wallet} text="Belum ada transaksi. Catatan pertamamu bisa dimulai sekarang." />}
            </div>
        </div>
    );
}

function NotesPage({ notes, onRemove, onAdd }) {
    return (
        <div>
            <PageIntro label="Ruang refleksi" title="Catatan & jurnal" text="Tidak perlu sempurna. Tulis saja apa yang sedang ada di pikiran." action="Tulis catatan" onAction={onAdd} />
            {notes.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{notes.map((note, index) => (
                <article key={note.id} className={`group relative rounded-2xl border p-5 ${index % 3 === 0 ? 'bg-amber-50/70 border-amber-100' : index % 3 === 1 ? 'theme-surface theme-border' : 'bg-blue-50/60 border-blue-100'}`}>
                    <div className="mb-4 flex items-center justify-between"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 text-amber-600"><BookOpen size={17} /></div><button type="button" aria-label={`Hapus catatan ${note.title}`} onClick={() => onRemove(note.id)} className="rounded-lg p-1.5 text-slate-400 opacity-0 transition hover:text-rose-500 group-hover:opacity-100"><Trash2 size={15} /></button></div>
                    <h2 className="font-bold theme-text">{note.title}</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed theme-text-secondary">{note.body}</p><p className="mt-5 text-xs theme-text-muted">{formatDate(note.date, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </article>
            ))}</div> : <div className="theme-surface rounded-2xl border p-10"><EmptyState icon={BookOpen} text="Belum ada catatan. Sisihkan waktu sejenak untuk menulis." /></div>}
        </div>
    );
}

function ReportsPage({ transactions, income, expenses }) {
    const monthly = useMemo(() => {
        return Array.from({ length: 6 }, (_, index) => {
            const date = new Date(today.getFullYear(), today.getMonth() - (5 - index), 1);
            const key = monthKey(dateKey(date));
            const rows = transactions.filter((item) => monthKey(item.date) === key);
            return {
                label: new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(date),
                income: rows.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0),
                expenses: rows.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0),
            };
        });
    }, [transactions]);
    const maxValue = Math.max(1, ...monthly.flatMap((item) => [item.income, item.expenses]));
    const expensesByCategory = transactions.filter((item) => item.type === 'expense').reduce((groups, item) => ({ ...groups, [item.category]: (groups[item.category] || 0) + item.amount }), {});
    const categoryEntries = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1]);
    return (
        <div>
            <PageIntro label="Ruang refleksi" title="Laporan keuangan" text="Angka hanya cerita—gunakan untuk melihat kebiasaan, bukan menghakimi diri." />
            <section className="mb-6 grid gap-4 sm:grid-cols-2"><StatCard label="Pemasukan bulan ini" value={formatRupiah(income)} icon={ArrowDownLeft} tone="bg-emerald-50 text-emerald-600" helper="Bulan berjalan" /><StatCard label="Pengeluaran bulan ini" value={formatRupiah(expenses)} icon={ArrowUpRight} tone="bg-rose-50 text-rose-600" helper="Bulan berjalan" /></section>
            <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                <section className="theme-surface rounded-2xl border p-5 sm:p-6">
                    <div className="mb-7"><h2 className="font-bold theme-text">Arus uang</h2><p className="mt-1 text-xs theme-text-muted">Pemasukan dan pengeluaran enam bulan terakhir</p></div>
                    <div className="flex h-52 items-end justify-around gap-3 border-b pb-2 theme-border">
                        {monthly.map((item) => <div key={item.label} className="flex h-full flex-1 items-end justify-center gap-1.5">
                            <div title={`Pemasukan ${formatRupiah(item.income)}`} className="w-4 rounded-t-md bg-emerald-400/80 sm:w-7" style={{ height: `${Math.max(item.income ? 8 : 2, (item.income / maxValue) * 100)}%` }} />
                            <div title={`Pengeluaran ${formatRupiah(item.expenses)}`} className="w-4 rounded-t-md bg-rose-300 sm:w-7" style={{ height: `${Math.max(item.expenses ? 8 : 2, (item.expenses / maxValue) * 100)}%` }} />
                        </div>)}
                    </div>
                    <div className="mt-3 flex justify-around">{monthly.map((item, index) => <span key={`${item.label}-${index}`} className="flex-1 text-center text-xs theme-text-muted">{item.label}</span>)}</div>
                    <div className="mt-5 flex justify-center gap-5 text-xs theme-text-secondary"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" />Pemasukan</span><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-rose-300" />Pengeluaran</span></div>
                </section>
                <section className="theme-surface rounded-2xl border p-5 sm:p-6">
                    <h2 className="font-bold theme-text">Pengeluaran per kategori</h2><p className="mb-5 mt-1 text-xs theme-text-muted">Dari semua transaksi yang dicatat</p>
                    {categoryEntries.length ? <div className="space-y-4">{categoryEntries.map(([category, amount], index) => <div key={category}><div className="mb-1.5 flex justify-between gap-2 text-xs"><span className="font-medium theme-text">{category}</span><span className="theme-text-secondary">{formatRupiah(amount)}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${['bg-blue-500', 'bg-violet-400', 'bg-amber-400', 'bg-emerald-400'][index % 4]}`} style={{ width: `${Math.max(4, (amount / Math.max(...categoryEntries.map(([, value]) => value))) * 100)}%` }} /></div></div>)}</div> : <EmptyState icon={Wallet} text="Kategori pengeluaranmu akan muncul setelah ada transaksi." />}
                </section>
            </div>
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-blue-900"><Clock3 size={18} className="mt-0.5 shrink-0 text-blue-600" /><p>Data tersimpan hanya di browser/perangkat ini. Laporan ini membantu melihat catatan yang sudah kamu masukkan, bukan data rekening bank.</p></div>
        </div>
    );
}

function Root() {
    return <ThemeProvider><App /></ThemeProvider>;
}

createRoot(document.getElementById('root')).render(<Root />);
