import React from 'react';
import { Shield, FileText, CheckCircle } from 'lucide-react';

const TermsPage: React.FC = () => {
    return (
        <div className="container" style={{ maxWidth: '800px', padding: '4rem 2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <div style={{ width: '64px', height: '64px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                    <FileText size={32} />
                </div>
                <h1>Terms of Service</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="glass" style={{ padding: '3rem', lineHeight: '1.8' }}>
                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle size={20} color="var(--accent-primary)" />
                        1. Acceptance of Terms
                    </h2>
                    <p>
                        By accessing and using this e-commerce platform ("the Platform"), you agree to be bound by these Terms of Service.
                        If you do not agree, please do not use the Platform.
                    </p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle size={20} color="var(--accent-primary)" />
                        2. SaaS Multi-Tenancy
                    </h2>
                    <p>
                        The Platform is a multi-tenant software-as-a-service. Each store owner ("Merchant") operates their own distinct instance.
                        We provide the technology, but we do not participate in the transactions between Merchants and their Customers.
                    </p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle size={20} color="var(--accent-primary)" />
                        3. Payment Processing
                    </h2>
                    <p>
                        Merchants are required to connect their own Stripe accounts. All revenue flows directly to the Merchant.
                        The Platform provider is not a payment facilitator and has no access to your funds.
                    </p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle size={20} color="var(--accent-primary)" />
                        4. Account Security
                    </h2>
                    <p>
                        You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                    </p>
                </section>

                <div style={{ marginTop: '4rem', padding: '2rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '1rem', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <Shield size={24} style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }} />
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        Questions about these terms? Contact legal@ordernest.com
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
