import React, { useState } from 'react';
import { ArrowRight, BookOpen, CheckCircle2, Sparkles } from 'lucide-react';
import { api } from '../../Services/api';

export const AuthPage = ({ onAuthenticated }) => {
    const [mode, setMode] = useState('login');
    const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isRegistering = mode === 'register';

    const submit = async (event) => {
        event.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const credentials = isRegistering
                ? form
                : { email: form.email, password: form.password };
            if (isRegistering) {
                await api.register(credentials);
            } else {
                await api.login(credentials);
            }
            await onAuthenticated();
        } catch (requestError) {
            const validationMessage = Object.values(requestError.errors || {}).flat()[0];
            setError(validationMessage || requestError.message || 'Tidak dapat memproses permintaan.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-card">
                <div className="auth-brand">
                    <div className="auth-logo"><Sparkles size={21} /></div>
                    <div>
                        <p className="auth-brand-name">Jurnal<span>Ku</span></p>
                        <p className="auth-brand-tagline">Ruang kecil untuk bertumbuh</p>
                    </div>
                </div>

                <div className="auth-intro">
                    <div className="auth-eyebrow"><BookOpen size={14} /> Catatanmu, tetap milikmu</div>
                    <h1>{isRegistering ? 'Mulai dari sini.' : 'Senang melihatmu lagi.'}</h1>
                    <p>{isRegistering ? 'Buat akun untuk menjaga tugas, keuangan, dan jurnalmu tetap tersimpan.' : 'Masuk untuk melanjutkan perjalananmu.'}</p>
                </div>

                <form onSubmit={submit} className="auth-form">
                    {isRegistering && (
                        <label>
                            Nama
                            <input
                                autoComplete="name"
                                required
                                maxLength="100"
                                value={form.name}
                                onChange={(event) => setForm({ ...form, name: event.target.value })}
                                placeholder="Nama kamu"
                            />
                        </label>
                    )}
                    <label>
                        Email
                        <input
                            type="email"
                            autoComplete="email"
                            required
                            value={form.email}
                            onChange={(event) => setForm({ ...form, email: event.target.value })}
                            placeholder="nama@email.com"
                        />
                    </label>
                    <label>
                        Kata sandi
                        <input
                            type="password"
                            autoComplete={isRegistering ? 'new-password' : 'current-password'}
                            required
                            minLength="8"
                            value={form.password}
                            onChange={(event) => setForm({ ...form, password: event.target.value })}
                            placeholder="Minimal 8 karakter"
                        />
                    </label>
                    {isRegistering && (
                        <label>
                            Ulangi kata sandi
                            <input
                                type="password"
                                autoComplete="new-password"
                                required
                                minLength="8"
                                value={form.password_confirmation}
                                onChange={(event) => setForm({ ...form, password_confirmation: event.target.value })}
                                placeholder="Ketik ulang kata sandi"
                            />
                        </label>
                    )}

                    {error && <p role="alert" className="auth-error">{error}</p>}

                    <button type="submit" disabled={isSubmitting} className="auth-submit">
                        {isSubmitting ? 'Mohon tunggu...' : isRegistering ? 'Buat akun' : 'Masuk'}
                        {!isSubmitting && <ArrowRight size={16} />}
                    </button>
                </form>

                <p className="auth-switch">
                    {isRegistering ? 'Sudah punya akun?' : 'Belum punya akun?'}
                    <button type="button" onClick={() => { setMode(isRegistering ? 'login' : 'register'); setError(''); }}>
                        {isRegistering ? 'Masuk' : 'Buat akun'}
                    </button>
                </p>

                <div className="auth-privacy"><CheckCircle2 size={14} /> Data akun dipisahkan dan dilindungi kata sandi.</div>
            </section>
            <p className="auth-footer">Satu tempat yang tenang untuk mengatur hal-hal penting.</p>
        </main>
    );
};
