import React from 'react';
import { Shield, Lock, EyeOff } from 'lucide-react';

const PrivacyPage: React.FC = () => {
    return (
        <div className="container" style={{ maxWidth: '800px', padding: '4rem 2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <div style={{ width: '64px', height: '64px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                    <Lock size={32} />
                </div>
                <h1>Privacy Policy</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="glass" style={{ padding: '3rem', lineHeight: '1.8' }}>
                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Shield size={20} color="var(--success)" />
                        1. Data Collection
                    </h2>
                    <p>
                        We collect minimal personal data required to operate the service: email, name, and store configuration.
                        We do not sell your data to third parties.
                    </p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Shield size={20} color="var(--success)" />
                        2. Stripe Integration
                    </h2>
                    <p>
                        When you connect Stripe, we store only the API keys necessary to facilitate orders.
                        Payment card details never pass through our servers and are handled entirely by Stripe.
                    </p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Shield size={20} color="var(--success)" />
                        3. Cookies & Tracking
                    </h2>
                    <p>
                        We use essential cookies for authentication and performance. We do not use third-party tracking or advertising cookies.
                    </p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Shield size={20} color="var(--success)" />
                        4. Data Export & Deletion
                    </h2>
                    <p>
                        As part of our commitment to GDPR compliance, you have the right to export your data or delete your account at any time.
                    </p>
                </section>

                <div style={{ marginTop: '4rem', padding: '2rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '1rem', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <EyeOff size={24} style={{ marginBottom: '1rem', color: 'var(--success)' }} />
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        Concerned about your privacy? Contact privacy@ordernest.com
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
