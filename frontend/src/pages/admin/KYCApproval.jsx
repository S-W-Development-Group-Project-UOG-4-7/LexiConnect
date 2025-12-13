import { useState } from 'react';
import AdminHeader from '../../components/AdminHeader';
import './KYCApproval.css';

const KYCApproval = () => {
  const [activeTab, setActiveTab] = useState('pending');

  const kycData = {
    pending: [
      {
        id: 1,
        name: 'Arjun Silva',
        email: 'arjun@law.lk',
        degree: 'LLB',
        barId: 'BAR2022010',
        specializations: ['Immigration Law', 'Corporate Law'],
        location: { city: 'Nugegoda', district: 'Colombo' },
        languages: ['English'],
        rating: 4.7,
        reviews: 28,
        status: 'pending',
        image: '👨‍💼'
      }
    ],
    approved: [
      {
        id: 2,
        name: 'Priya Jayawardena',
        email: 'priya@law.lk',
        degree: 'LLB (Hons), Attorney-at-Law',
        barId: 'BAR2021001',
        specializations: ['Corporate Law', 'Contract Law'],
        location: { city: 'Colombo', district: 'Colombo' },
        languages: ['English', 'Sinhala', 'Tamil'],
        rating: 4.8,
        reviews: 45,
        status: 'approved',
        image: '👩‍💼'
      },
      {
        id: 3,
        name: 'Rohan Perera',
        email: 'rohan@law.lk',
        degree: 'LLB, LLM',
        barId: 'BAR2021002',
        specializations: ['Criminal Law', 'Family Law'],
        location: { city: 'Kandy', district: 'Kandy' },
        languages: ['English', 'Sinhala'],
        rating: 4.6,
        reviews: 32,
        status: 'approved',
        image: '👨‍💼'
      },
      {
        id: 4,
        name: 'Nimalka Fernando',
        email: 'nimalka@law.lk',
        degree: 'LLB (Hons), Attorney-at-Law',
        barId: 'BAR2021003',
        specializations: ['Property Law', 'Tax Law'],
        location: { city: 'Galle', district: 'Galle' },
        languages: ['English', 'Sinhala', 'Tamil'],
        rating: 4.9,
        reviews: 56,
        status: 'approved',
        image: '👩‍💼'
      }
    ],
    rejected: []
  };

  const tabs = [
    { id: 'pending', label: 'Pending', count: kycData.pending.length },
    { id: 'approved', label: 'Approved', count: kycData.approved.length },
    { id: 'rejected', label: 'Rejected', count: kycData.rejected.length },
    { id: 'all', label: 'All', count: Object.values(kycData).flat().length }
  ];

  const getCurrentData = () => {
    if (activeTab === 'all') {
      return Object.values(kycData).flat();
    }
    return kycData[activeTab] || [];
  };

  const handleApprove = (id) => {
    console.log('Approve KYC:', id);
    // TODO: Implement approve logic
  };

  const handleReject = (id) => {
    console.log('Reject KYC:', id);
    // TODO: Implement reject logic
  };

  const handleViewDocuments = (id) => {
    console.log('View documents:', id);
    // TODO: Implement view documents logic
  };

  return (
    <div className="kyc-approval-page">
      <div className="diamond-pattern"></div>
      <AdminHeader />
      
      <main className="kyc-approval-main">
        <div className="kyc-approval-container">
          {/* Page Title */}
          <h1 className="kyc-page-title">KYC Approval</h1>

          {/* Filter Tabs */}
          <div className="kyc-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`kyc-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* KYC Cards */}
          <div className="kyc-cards-list">
            {getCurrentData().map((kyc) => (
              <div key={kyc.id} className="kyc-card">
                <div className="kyc-card-left">
                  <div className="kyc-avatar">
                    <span className="kyc-avatar-icon">{kyc.image}</span>
                  </div>

                  <div className="kyc-info">
                    <div className="kyc-name-row">
                      <h3 className="kyc-name">{kyc.name}</h3>
                      <span className={`badge badge-${kyc.status}`}>
                        {kyc.status === 'pending' && '🕐 '}
                        {kyc.status.charAt(0).toUpperCase() + kyc.status.slice(1)}
                      </span>
                    </div>

                    <p className="kyc-degree">{kyc.degree}</p>

                    <div className="kyc-specializations">
                      {kyc.specializations.map((spec, idx) => (
                        <span key={idx} className="kyc-spec-tag">{spec}</span>
                      ))}
                    </div>

                    <div className="kyc-contact-info">
                      <div className="kyc-contact-item">
                        <span className="kyc-contact-icon">👤</span>
                        <span>{kyc.email}</span>
                      </div>
                      <div className="kyc-contact-item">
                        <span className="kyc-contact-icon">📍</span>
                        <span>{kyc.location.city}, {kyc.location.district}</span>
                      </div>
                    </div>

                    <div className="kyc-rating">
                      Rating: {kyc.rating} ({kyc.reviews} reviews)
                    </div>
                  </div>
                </div>

                <div className="kyc-card-right">
                  <div className="kyc-details">
                    <div className="kyc-detail-item">
                      <span className="kyc-detail-icon">#</span>
                      <span>Bar ID: {kyc.barId}</span>
                    </div>
                    <div className="kyc-detail-item">
                      <span className="kyc-detail-icon">📄</span>
                      <span>Languages: {kyc.languages.join(', ')}</span>
                    </div>
                  </div>

                  <div className="kyc-actions">
                    {kyc.status === 'pending' && (
                      <>
                        <button
                          className="btn btn-success approve-btn"
                          onClick={() => handleApprove(kyc.id)}
                        >
                          <span>✓</span>
                          <span>Approve</span>
                        </button>
                        <button
                          className="btn btn-danger reject-btn"
                          onClick={() => handleReject(kyc.id)}
                        >
                          <span>✕</span>
                          <span>Reject</span>
                        </button>
                      </>
                    )}
                    <button
                      className="btn btn-secondary view-docs-btn"
                      onClick={() => handleViewDocuments(kyc.id)}
                    >
                      <span>📄</span>
                      <span>View Documents</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {getCurrentData().length === 0 && (
              <div className="no-kyc-data">
                <p>No {activeTab} KYC applications found.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default KYCApproval;


