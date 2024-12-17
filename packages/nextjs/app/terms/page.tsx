import { NextPage } from 'next';

const Terms: NextPage = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-montserrat px-6 py-12 lg:px-24 lg:py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-center">Terms and Conditions</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: 22/11</p>
        
        <p className="mb-6">
          Welcome to Dust.fun (“we,” “our,” or “the platform”). By accessing or using Dust.fun, you agree to these Terms and Conditions (“Terms”). 
          If you do not agree with these Terms, do not use the platform.
        </p>

        <h2 className="text-2xl font-semibold mb-4">1. Scope of Service</h2>
        <p className="mb-6">
          Dust.fun is a decentralized Web3 platform that enables users to consolidate small token balances (“dust”) across multiple blockchains 
          into a single token. The platform acts as an intermediary, facilitating these transactions through integrated blockchain technologies. 
          Dust.fun does not provide financial, legal, or investment advice.
        </p>

        <h2 className="text-2xl font-semibold mb-4">2. Eligibility</h2>
        <p className="mb-4">
          You may not use Dust.fun if:
        </p>
        <ul className="list-disc list-inside mb-6 ml-4">
          <li>You are located in a jurisdiction where cryptocurrency-related activities or similar transactions are prohibited by law.</li>
          <li>You are under the legal age to engage in such activities in your jurisdiction.</li>
        </ul>
        <p className="mb-6">
          By using the platform, you confirm that you meet these eligibility criteria.
        </p>

        <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
        <p className="mb-4">
          By using Dust.fun, you agree to:
        </p>
        <ol className="list-decimal list-inside mb-6 ml-4">
          <li>Comply with all applicable laws and regulations regarding cryptocurrency use in your jurisdiction.</li>
          <li>Acknowledge and accept all risks associated with blockchain transactions, including potential partial or total loss of funds.</li>
        </ol>

        <h2 className="text-2xl font-semibold mb-4">4. Risks and Disclaimers</h2>
        <p className="mb-4">
          By using Dust.fun, you acknowledge and accept the following risks:
        </p>
        <ol className="list-decimal list-inside mb-6 ml-4">
          <li className="mb-4">
            <strong>Loss of Tokens</strong><br />
            Transactions conducted through the platform may result in partial or total loss of tokens due to user error, company error, or 
            unforeseen technical issues. You agree to hold Dust.fun harmless in such cases.
          </li>
          <li className="mb-4">
            <strong>Price Discrepancy</strong><br />
            The price previewed on the platform may differ significantly from the actual transaction price due to liquidity and market 
            fluctuations. By proceeding with the transaction, you accept this risk.
          </li>
          <li className="mb-4">
            <strong>Third-Party Integration Risks</strong><br />
            Dust.fun integrates with third-party wallets and protocols. We are not liable for issues arising from these integrations.
          </li>
          <li className="mb-4">
            <strong>Irreversibility of Transactions</strong><br />
            Blockchain transactions are irreversible. Once executed, they cannot be undone or refunded.
          </li>
          <li>
            <strong>Role as an Intermediary</strong><br />
            Dust.fun is solely an intermediary facilitating transactions. We are not liable for errors, losses, or other issues arising 
            during these transactions.
          </li>
        </ol>

        <h2 className="text-2xl font-semibold mb-4">5. Fees</h2>
        <p className="mb-4">
          By using Dust.fun, you agree to the following fee structure:
        </p>
        <ol className="list-decimal list-inside mb-6 ml-4">
          <li className="mb-4">
            Fees are subject to change at any time without prior notice.
          </li>
          <li className="mb-4">
            Fees are non-refundable and will be deducted from the transaction’s total amount after the swap is completed.
          </li>
          <li>
            Displayed fees are final and do not include additional costs such as blockchain gas fees or cross-chain transaction fees, 
            which are incurred separately.
          </li>
        </ol>

        <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
        <ol className="list-decimal list-inside mb-6 ml-4">
          <li className="mb-4">
            Dust.fun reserves all rights to its intellectual property, including logos, designs, smart contracts, and platform technology.
          </li>
          <li className="mb-4">
            Users are prohibited from copying, reverse-engineering, or using Dust.fun’s smart contracts or platform for unauthorized purposes.
          </li>
          <li>
            Users may not use the platform for activities that violate applicable laws or these Terms.
          </li>
        </ol>

        <h2 className="text-2xl font-semibold mb-4">7. Liability Limitations</h2>
        <ol className="list-decimal list-inside mb-6 ml-4">
          <li className="mb-4">
            Dust.fun is provided “AS IS” and “AS AVAILABLE” without any warranties or guarantees of uptime, performance, or availability.
          </li>
          <li className="mb-4">
            We are not obligated to maintain the platform or provide support services.
          </li>
          <li>
            Dust.fun is not responsible for any direct, indirect, incidental, or consequential damages arising from your use of the platform.
          </li>
        </ol>

        <h2 className="text-2xl font-semibold mb-4">8. Modifications to Terms</h2>
        <p className="mb-6">
          We reserve the right to update or modify these Terms at any time without prior notice. Continued use of the platform 
          constitutes your acceptance of the revised Terms.
        </p>

        <h2 className="text-2xl font-semibold mb-4">9. Governing Law</h2>
        <p className="mb-6">
          These Terms are governed by and construed under the laws of the British Virgin Islands (BVI). Any disputes arising 
          under these Terms will be resolved under BVI jurisdiction.
        </p>

        <h2 className="text-2xl font-semibold mb-4">10. Indemnification</h2>
        <p className="mb-6">
          You agree to indemnify and hold harmless Dust.fun, its operators, and affiliates from any claims, losses, damages, 
          liabilities, or expenses arising from your use of the platform or violation of these Terms.
        </p>

        <h2 className="text-2xl font-semibold mb-4">11. Termination</h2>
        <p className="mb-6">
          We reserve the right to restrict or terminate access to Dust.fun for any user or wallet at any time, for any reason, 
          without prior notice.
        </p>

        <h2 className="text-2xl font-semibold mb-4">12. Entire Agreement</h2>
        <p>
          These Terms constitute the entire agreement between you and Dust.fun, superseding any prior agreements, 
          representations, or understandings.
        </p>
      </div>
    </div>
  );
};

export default Terms;
