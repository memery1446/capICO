import React from 'react';

const LandingPage = ({ onEnterDApp }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left side - Title and description */}
      <div className="w-1/2 flex flex-col justify-center items-center p-8 bg-blue-600 text-white">
        <div className="max-w-md">
          <h1 className="text-8xl font-bold mb-4">CapICO</h1>
          <p className="text-4xl mb-8">
            Advanced ICO Platform for Seamless Token Launches
          </p>
          <button
            onClick={onEnterDApp}
            className="bg-white text-blue-600 px-6 py-2 rounded-full text-lg font-semibold hover:bg-blue-100 transition-colors"
          >
            Enter DApp
          </button>
        </div>
      </div>

      {/* Right side - Feature bullets */}
      <div className="w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-lg">
          <h2 className="text-7xl font-bold mb-8 text-gray-800">Key Features</h2>
          <ul className="space-y-6">
            <FeatureBullet icon="🔗" text="Smart Contract Integration" />
            <FeatureBullet icon="⚙️" text="Customizable ICO Parameters" />
            <FeatureBullet icon="📊" text="Tiered Pricing System" />
            <FeatureBullet icon="🔒" text="Token Vesting & Lockup" />
            <FeatureBullet icon="👥" text="Referral System" />
            <FeatureBullet icon="📈" text="Real-time Analytics" />
          </ul>
        </div>
      </div>
    </div>
  );
};

const FeatureBullet = ({ icon, text }) => (
  <li className="flex items-center text-gray-700">
    <span className="text-4xl mr-6">{icon}</span>
    <span className="text-2xl">{text}</span>
  </li>
);

export default LandingPage;

