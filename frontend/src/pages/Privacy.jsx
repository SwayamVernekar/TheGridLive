import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, UserCheck, FileText } from 'lucide-react';

export function Privacy() {
  const overview = [
    {
      icon: <Shield className="w-8 h-8 text-f1red mx-auto" />,
      title: 'Data Protection',
      description: 'We secure your data with industry-standard measures',
    },
    {
      icon: <Lock className="w-8 h-8 text-f1red mx-auto" />,
      title: 'Secure Access',
      description: 'Only authorized personnel can access sensitive information',
    },
    {
      icon: <Eye className="w-8 h-8 text-f1red mx-auto" />,
      title: 'Transparency',
      description: 'We are clear about what data we collect and why',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        className="glass-strong rounded-xl p-8 md:p-12 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <h1 className="text-4xl font-bold text-f1light">Privacy Policy</h1>
          <p className="text-f1light/70 mt-4 max-w-3xl">
            Your privacy is important to us. This Privacy Policy explains how TheGridLive collects, uses, and protects your personal information.
          </p>
        </div>
      </motion.div>

      {/* Quick Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        {overview.map((item, index) => (
          <motion.div
            key={index}
            className="glass-strong rounded-xl p-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            {item.icon}
            <h3 className="text-xl font-bold text-f1light mt-3">{item.title}</h3>
            <p className="text-f1light/70 mt-1">{item.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <motion.div
        className="glass-strong rounded-xl p-8 md:p-12 space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Personal Information */}
        <section>
          <h2 className="text-3xl font-bold text-f1light mb-4">Information We Collect</h2>
          <div className="space-y-4 text-f1light/80">
            <div className="glass-light rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2">Account Information</h3>
              <p className="mb-2">We collect:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Email address</li>
                <li>Username and display name</li>
                <li>Profile preferences (favorite driver, team)</li>
                <li>Password (encrypted and never stored in plain text)</li>
              </ul>
            </div>

            <div className="glass-light rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2">Usage Data</h3>
              <p className="mb-2">To improve your experience, we collect:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Pages visited and features used</li>
                <li>Race predictions and podium picks</li>
                <li>Interaction with live race data</li>
                <li>Device information and browser type</li>
              </ul>
            </div>

            <div className="glass-light rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2">Social Features</h3>
              <p className="mb-2">When you use Team Radio and social features:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Messages and chat history</li>
                <li>Reactions and interactions</li>
                <li>Public profile information</li>
              </ul>
            </div>
          </div>
        </section>

        {/* How We Use Information */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-8 h-8 text-f1red" />
            <h2 className="text-3xl font-bold text-f1light">How We Use Your Information</h2>
          </div>
          <div className="space-y-3 text-f1light/80">
            {[
              { title: 'Personalization', desc: 'To customize your dashboard, recommendations, and race predictions' },
              { title: 'Communication', desc: 'To send race updates, feature announcements, and important notifications' },
              { title: 'Analytics', desc: 'To understand usage patterns and improve our platform' },
              { title: 'Security', desc: 'To protect your account and prevent fraudulent activity' },
            ].map((item, index) => (
              <div key={index} className="glass-light rounded-lg p-4 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-f1red mt-2 flex-shrink-0" />
                <div>
                  <p className="font-bold text-f1light">{item.title}</p>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Data Protection */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-8 h-8 text-f1red" />
            <h2 className="text-3xl font-bold text-f1light">Data Protection & Security</h2>
          </div>
          <div className="space-y-4 text-f1light/80">
            <p>We implement industry-standard security measures to protect your personal information:</p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: '🔐 Encryption', desc: 'All data transmitted using SSL/TLS encryption' },
                { title: '🛡️ Firewalls', desc: 'Protected by enterprise-grade security systems' },
                { title: '🔑 Access Control', desc: 'Strict authentication and authorization protocols' },
                { title: '📊 Regular Audits', desc: 'Continuous security monitoring and testing' },
              ].map((item, index) => (
                <div key={index} className="glass-light rounded-lg p-4">
                  <p className="font-bold text-f1light mb-2">{item.title}</p>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Your Rights */}
        <section>
          <h2 className="text-3xl font-bold text-f1light mb-4">Your Privacy Rights</h2>
          <div className="space-y-3 text-f1light/80">
            <p>You have the right to:</p>
            <div className="glass-light rounded-lg p-6 space-y-3">
              {[
                { title: 'Access', desc: 'Access your personal data at any time' },
                { title: 'Correct', desc: 'Correct inaccurate or incomplete information' },
                { title: 'Delete', desc: 'Delete your account and associated data' },
                { title: 'Export', desc: 'Export your data in a portable format' },
                { title: 'Opt-out', desc: 'Opt-out of marketing communications' },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="text-f1red font-bold">→</span>
                  <p><strong>{item.title}</strong> {item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cookies */}
        <section>
          <h2 className="text-3xl font-bold text-f1light mb-4">Cookies & Tracking</h2>
          <div className="space-y-4 text-f1light/80">
            <p>We use cookies and similar technologies to enhance your experience. You can control cookie preferences through your browser settings.</p>
            <div className="glass-light rounded-lg p-6">
              <p className="font-bold text-f1light mb-2">Types of Cookies We Use:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Essential cookies for core functionality</li>
                <li>Analytics cookies to understand usage</li>
                <li>Preference cookies to remember your settings</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="glass-light rounded-lg p-6">
          <h2 className="text-2xl font-bold text-f1light mb-4">Questions About Privacy?</h2>
          <p className="text-f1light/80 mb-4">If you have any questions about this Privacy Policy or how we handle your data, please contact us:</p>
          <p className="text-f1red font-bold">privacy@thegridlive.com</p>
        </section>
      </motion.div>
    </div>
  );
}
