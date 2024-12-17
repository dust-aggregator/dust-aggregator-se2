import { NextPage } from 'next';

const Privacy: NextPage = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-montserrat px-6 py-12 lg:px-24 lg:py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-center">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last Updated: 22/11</p>
        
        <p className="mb-6">
          Welcome to Dust.fun (“we,” “our,” or “the platform”). This Privacy Policy explains how we collect, use, 
          and protect your information when you access or use Dust.fun. By using the platform, you agree to the 
          terms outlined in this Privacy Policy. If you do not agree with these terms, please do not use the platform.
        </p>

        <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
        <p className="mb-4">
          When you use Dust.fun, we may collect the following types of information:
        </p>
        <ol className="list-decimal list-inside mb-6">
          <li className="mb-4">
            <strong>Personal Information</strong>
            <ul className="list-disc list-inside ml-4">
              <li>Wallet addresses you use to interact with the platform.</li>
              <li>Transaction data, including token types and amounts.</li>
            </ul>
          </li>
          <li>
            <strong>Non-Personal Information</strong>
            <ul className="list-disc list-inside ml-4">
              <li>Usage data collected via Google Analytics, including:</li>
              <li>Browser type and version.</li>
              <li>Device type and operating system.</li>
              <li>IP address (anonymized when possible).</li>
              <li>Pages viewed and time spent on the platform.</li>
              <li>Referral sources (e.g., the website or app that directed you to Dust.fun).</li>
            </ul>
          </li>
        </ol>

        <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
        <ol className="list-decimal list-inside mb-6">
          <li className="mb-4">
            <strong>Platform Operations</strong>
            <ul className="list-disc list-inside ml-4">
              <li>To facilitate transactions and provide the services offered by Dust.fun.</li>
            </ul>
          </li>
          <li className="mb-4">
            <strong>Analytics and Improvements</strong>
            <ul className="list-disc list-inside ml-4">
              <li>To analyze user behavior and improve the platform’s functionality and user experience.</li>
            </ul>
          </li>
          <li>
            <strong>Compliance</strong>
            <ul className="list-disc list-inside ml-4">
              <li>To ensure compliance with applicable laws and regulations.</li>
            </ul>
          </li>
        </ol>

        <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
        <p className="mb-4">
          We do not sell or share your personal or non-personal information with third parties, except in the following situations:
        </p>
        <ol className="list-decimal list-inside mb-6">
          <li className="mb-4">
            <strong>Service Providers</strong>
            <ul className="list-disc list-inside ml-4">
              <li>We may share non-personal data (e.g., analytics data) with service providers like Google Analytics for platform improvements.</li>
            </ul>
          </li>
          <li className="mb-4">
            <strong>Legal Compliance</strong>
            <ul className="list-disc list-inside ml-4">
              <li>If required by law or regulation, we may disclose information to comply with legal obligations.</li>
            </ul>
          </li>
          <li>
            <strong>Business Transfers</strong>
            <ul className="list-disc list-inside ml-4">
              <li>In the event of a merger, acquisition, or sale of assets, your data may be transferred to the acquiring entity.</li>
            </ul>
          </li>
        </ol>

        <h2 className="text-2xl font-semibold mb-4">4. Data Storage and Retention</h2>
        <ol className="list-decimal list-inside mb-6">
          <li className="mb-4">
            <strong>Storage</strong>
            <ul className="list-disc list-inside ml-4">
              <li>Information collected through Google Analytics is stored securely on Google’s servers.</li>
            </ul>
          </li>
          <li>
            <strong>Retention</strong>
            <ul className="list-disc list-inside ml-4">
              <li>Non-personal data is retained for analytical purposes for as long as necessary to improve the platform. Wallet and transaction data are not retained beyond their use for the services you initiate.</li>
            </ul>
          </li>
        </ol>

        <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
        <p className="mb-4">
          Depending on your jurisdiction, you may have the following rights:
        </p>
        <ol className="list-decimal list-inside mb-6">
          <li className="mb-4">
            <strong>Access and Rectification</strong>
            <ul className="list-disc list-inside ml-4">
              <li>You can request to view or correct the data we store about you.</li>
            </ul>
          </li>
          <li>
            <strong>Data Deletion</strong>
            <ul className="list-disc list-inside ml-4">
              <li>You may request that we delete your data, subject to legal and operational limitations.</li>
            </ul>
          </li>
        </ol>
        <p className="mb-6">
          For any requests regarding your data, please contact us at <a href="mailto:support@dust.fun" className="text-blue-600 hover:underline">support@dust.fun</a>.
        </p>

        <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking Technologies</h2>
        <p className="mb-6">
          Dust.fun does not use cookies. However, third-party services like Google Analytics may use tracking technologies to 
          collect non-personal information. By using the platform, you consent to their data collection practices.
        </p>

        <h2 className="text-2xl font-semibold mb-4">7. Security Measures</h2>
        <p className="mb-6">
          We take reasonable steps to protect your information, including:
        </p>
        <ul className="list-disc list-inside mb-6 ml-4">
          <li>Utilizing encryption for transactions conducted on the platform.</li>
          <li>Implementing secure data access protocols to prevent unauthorized use.</li>
        </ul>
        <p className="mb-6">
          However, no system is completely secure, and we cannot guarantee the absolute security of your data.
        </p>

        <h2 className="text-2xl font-semibold mb-4">8. Changes to This Privacy Policy</h2>
        <p className="mb-6">
          We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated “Last Updated” date. 
          Continued use of the platform constitutes your acceptance of the revised policy.
        </p>

        <h2 className="text-2xl font-semibold mb-4">9. Governing Law</h2>
        <p className="mb-6">
          This Privacy Policy is governed by the laws of the British Virgin Islands (BVI). Any disputes arising from 
          this Privacy Policy will be resolved under BVI jurisdiction.
        </p>
      </div>
    </div>
  );
};

export default Privacy;
