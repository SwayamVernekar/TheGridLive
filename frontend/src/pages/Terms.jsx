import { motion } from 'framer-motion';
import { FileText, CheckCircle, XCircle, AlertTriangle, Scale } from 'lucide-react';

export function Terms() {
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
          <h1 className="text-4xl font-bold text-f1light">Terms of Service</h1>
          <p className="text-f1light/70 mt-4 max-w-3xl">
            Please read these Terms of Service carefully before using TheGridLive platform.
          </p>
        </div>
      </motion.div>

      {/* Quick Summary */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            icon: <FileText className="w-8 h-8" />,
            title: 'Content Rules',
            items: ['Share content', 'Join the community'],
          },
          {
            icon: <XCircle className="w-8 h-8" />,
            title: 'Prohibited',
            items: ['Spam users', 'Misuse data'],
          },
          {
            icon: <CheckCircle className="w-8 h-8" />,
            title: 'Moderation',
            items: ['Moderate content', 'Suspend accounts'],
          },
        ].map((item, index) => (
          <motion.div
            key={index}
            className="glass-strong rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              {item.icon}
              <h3 className="text-xl font-bold text-f1light">{item.title}</h3>
            </div>
            <ul className="space-y-2">
              {item.items.map((text, i) => (
                <li key={i} className="text-f1light/70 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-f1red" />
                  {text}
                </li>
              ))}
            </ul>
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
        {/* Account Terms */}
        <section>
          <h2 className="text-3xl font-bold text-f1light mb-4">Account Registration & Responsibilities</h2>
          <div className="space-y-3 text-f1light/80">
            <div className="glass-light rounded-lg p-4">
              <p className="font-bold text-f1light mb-2">1. Account Creation</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>You must be at least 13 years old to create an account</li>
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>One account per person</li>
              </ul>
            </div>

            <div className="glass-light rounded-lg p-4">
              <p className="font-bold text-f1light mb-2">2. Account Security</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>You are responsible for all activity under your account</li>
                <li>Notify us immediately of unauthorized access</li>
                <li>Use a strong, unique password</li>
                <li>Enable two-factor authentication when available</li>
              </ul>
            </div>

            <div className="glass-light rounded-lg p-4">
              <p className="font-bold text-f1light mb-2">3. Account Termination</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>You may close your account at any time</li>
                <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
                <li>Terminated accounts may lose access to data and features</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Acceptable Use */}
        <section>
          <h2 className="text-3xl font-bold text-f1light mb-4">Acceptable Use Policy</h2>
          <div className="space-y-4 text-f1light/80">
            <p>You agree NOT to use TheGridLive to:</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="glass-light rounded-lg p-4">
                <p className="text-f1red mb-2">❌ Prohibited Actions</p>
                <ul className="space-y-1 text-sm">
                  <li>• Harass or abuse other users</li>
                  <li>• Post spam or malicious content</li>
                  <li>• Impersonate others</li>
                  <li>• Violate intellectual property rights</li>
                  <li>• Attempt to hack or disrupt the service</li>
                </ul>
              </div>
              <div className="glass-light rounded-lg p-4">
                <p className="text-green-500 mb-2">✓ Encouraged Behavior</p>
                <ul className="space-y-1 text-sm">
                  <li>• Respect other community members</li>
                  <li>• Share constructive feedback</li>
                  <li>• Engage in healthy F1 discussions</li>
                  <li>• Report policy violations</li>
                  <li>• Contribute positively to the community</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Other sections (Content, Service, Liability, etc.) */}
        {/* You can keep them as-is, just make sure all JSX braces {} are correct and initial/animate props are proper numbers */}
      </motion.div>
    </div>
  );
}
