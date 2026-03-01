import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// HubSpot stage name mapping
const STAGE_LABELS = {
    'appointmentscheduled': 'Prospecting',
    'qualifiedtobuy': 'New Cust./New Opp',
    'presentationscheduled': 'New Cust./New Opp',
    'decisionmakerboughtin': 'LOI/Bid Stage',
    'contractsent': 'LOI/Bid Stage',
    'closedwon': 'Closed Won',
    'closedlost': 'Closed Lost',
    'New Cust./New Opp': 'New Cust./New Opp',
    'LOI/Bid Stage': 'LOI/Bid Stage',
    'Prospecting': 'Prospecting',
    'Exist Cust./New Opp': 'Exist Cust./New Opp',
};

function formatStageName(stage) {
    return STAGE_LABELS[stage] || stage || 'Prospecting';
}

// Known owner name patterns for Matt and Chris
function isMatt(ownerName) {
    if (!ownerName) return false;
    const n = ownerName.toLowerCase();
    return n.includes('matt') || n.includes('code');
}
function isChris(ownerName) {
    if (!ownerName) return false;
    const n = ownerName.toLowerCase();
    return n.includes('chris') || n.includes('isley');
}

export default function TemekaSalesDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [hubspotData, setHubspotData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
        async function loadData() {
                try {
                          setLoading(true);
                          const res = await fetch('/api/hubspot-data');
                          if (!res.ok) throw new Error('API returned ' + res.status);
                          const data = await res.json();
                          setHubspotData(data);
                          if (data.lastUpdated) {
                                      setLastUpdated(new Date(data.lastUpdated));
                          }
                          setError(null);
                } catch (err) {
                          console.error('Failed to load HubSpot data:', err);
                          setError(err.message);
                } finally {
                          setLoading(false);
                }
        }
        loadData();
  }, []);

  // Separate deals by owner
  const mattDeals = hubspotData
      ? hubspotData.deals.filter(d => isMatt(d.ownerName))
        : [];
    const chrisDeals = hubspotData
      ? hubspotData.deals.filter(d => isChris(d.ownerName))
          : [];
    const mattContacts = hubspotData
      ? hubspotData.contacts.filter(c => isMatt(c.ownerName))
          : [];
    const chrisContacts = hubspotData
      ? hubspotData.contacts.filter(c => isChris(c.ownerName))
          : [];

  const formatCurrency = (num) => {
        if (num >= 1000000) return '$' + (num / 1000000).toFixed(2) + 'M';
        if (num >= 1000) return '$' + (num / 1000).toFixed(0) + 'K';
        return '$' + num;
  };

  const getTotalPipeline = (deals) => deals.reduce((sum, d) => sum + (d.amount || 0), 0);
    const getAvgDealSize = (deals) => {
          const total = getTotalPipeline(deals);
          return deals.length > 0 ? total / deals.length : 0;
    };

  const mattTotal = getTotalPipeline(mattDeals);
    const chrisTotal = getTotalPipeline(chrisDeals);
    const combinedTotal = mattTotal + chrisTotal;

  const formatLastUpdated = (date) => {
        if (!date) return 'Loading...';
        return date.toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric',
                hour: 'numeric', minute: '2-digit', hour12: true
        });
  };

  const MetricCard = ({ title, value, subtitle, color }) => (
        <div className="metric-card">
              <div className="metric-title">{title}</div>div>
              <div className="metric-value" style={{ color }}>{value}</div>div>
          {subtitle && <div className="metric-subtitle">{subtitle}</div>div>}
        </div>div>
      );
  
    const getStageBadgeClass = (stage) => {
          const s = formatStageName(stage);
          if (s.includes('Prospect')) return 'stage-prospecting';
          if (s.includes('New')) return 'stage-new';
          if (s.includes('LOI')) return 'stage-loi';
          return 'stage-existing';
    };
  
    return (
          <div className="dashboard-container">
                <style>{`
                        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@300;400;500;600;700&display=swap');
                                * { margin: 0; padding: 0; box-sizing: border-box; }
                                        :root {
                                                  --temeka-green: #6B8E23;
                                                            --temeka-green-bright: #7FB800;
                                                                      --temeka-green-dark: #4A6617;
                                                                                --temeka-black: #000000;
                                                                                          --temeka-gray: #1a1a1a;
                                                                                                    --temeka-gray-light: #2a2a2a;
                                                                                                            }
                                                                                                                    body { background: var(--temeka-black); color: var(--temeka-green); font-family: 'Rajdhani', sans-serif; overflow-x: hidden; }
                                                                                                                            .dashboard-container { min-height: 100vh; background: linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%); position: relative; padding: 0; }
                                                                                                                                    .dashboard-container::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 400px; background: radial-gradient(ellipse at top, rgba(107, 142, 35, 0.12) 0%, transparent 60%); pointer-events: none; z-index: 0; }
                                                                                                                                            .header { background: rgba(0,0,0,0.95); border-bottom: 3px solid var(--temeka-green); padding: 1.5rem 3rem; position: sticky; top: 0; z-index: 100; backdrop-filter: blur(10px); }
                                                                                                                                                    .header-content { display: flex; justify-content: space-between; align-items: center; max-width: 1800px; margin: 0 auto; }
                                                                                                                                                            .logo { font-family: 'Bebas Neue', sans-serif; font-size: 2.5rem; font-weight: bold; letter-spacing: 2px; background: linear-gradient(135deg, var(--temeka-green-bright) 0%, var(--temeka-green) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
                                                                                                                                                                    .tagline { font-size: 0.9rem; color: #888; font-weight: 300; letter-spacing: 1px; margin-top: 0.25rem; }
                                                                                                                                                                            .header-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem; }
                                                                                                                                                                                    .founders-note { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.5rem; background: rgba(107,142,35,0.1); border: 1px solid var(--temeka-green); border-radius: 8px; font-size: 0.9rem; font-weight: 500; color: var(--temeka-green-bright); }
                                                                                                                                                                                            .last-updated { font-size: 0.8rem; color: #666; font-weight: 400; text-align: right; }
                                                                                                                                                                                                    .last-updated strong { color: var(--temeka-green); }
                                                                                                                                                                                                            .nav-tabs { display: flex; gap: 0.5rem; padding: 2rem 3rem 0; max-width: 1800px; margin: 0 auto; position: relative; z-index: 1; }
                                                                                                                                                                                                                    .tab { padding: 1rem 2rem; background: var(--temeka-gray); border: 2px solid transparent; color: #888; cursor: pointer; font-size: 1rem; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; transition: all 0.3s ease; }
                                                                                                                                                                                                                            .tab:hover { border-color: var(--temeka-green); color: var(--temeka-green); }
                                                                                                                                                                                                                                    .tab.active { background: var(--temeka-green); color: var(--temeka-black); border-color: var(--temeka-green); box-shadow: 0 0 20px rgba(107,142,35,0.4); }
                                                                                                                                                                                                                                            .content { padding: 2rem 3rem; max-width: 1800px; margin: 0 auto; position: relative; z-index: 1; }
                                                                                                                                                                                                                                                    .loading-state { display: flex; align-items: center; justify-content: center; padding: 4rem; color: var(--temeka-green); font-size: 1.5rem; font-family: 'Bebas Neue', sans-serif; letter-spacing: 2px; }
                                                                                                                                                                                                                                                            .error-state { display: flex; align-items: center; justify-content: center; padding: 2rem; color: #ff6b6b; font-size: 1rem; background: rgba(255,107,107,0.1); border: 1px solid rgba(255,107,107,0.3); border-radius: 8px; margin: 2rem 0; }
                                                                                                                                                                                                                                                                    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
                                                                                                                                                                                                                                                                            .metric-card { background: linear-gradient(135deg, var(--temeka-gray) 0%, var(--temeka-gray-light) 100%); padding: 1.75rem; border: 2px solid rgba(107,142,35,0.3); border-radius: 12px; transition: all 0.3s ease; }
                                                                                                                                                                                                                                                                                    .metric-card:hover { border-color: var(--temeka-green); box-shadow: 0 8px 30px rgba(107,142,35,0.25); transform: translateY(-4px); }
                                                                                                                                                                                                                                                                                            .metric-title { font-size: 0.9rem; color: #888; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 500; margin-bottom: 1rem; }
                                                                                                                                                                                                                                                                                                    .metric-value { font-size: 2.5rem; font-weight: 700; font-family: 'Bebas Neue', sans-serif; letter-spacing: 1px; margin-bottom: 0.5rem; }
                                                                                                                                                                                                                                                                                                            .metric-subtitle { font-size: 0.85rem; color: #666; font-weight: 400; }
                                                                                                                                                                                                                                                                                                                    .deals-section { margin-bottom: 3rem; }
                                                                                                                                                                                                                                                                                                                            .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid var(--temeka-green); }
                                                                                                                                                                                                                                                                                                                                    .section-title { font-size: 1.75rem; font-weight: 700; color: var(--temeka-green); text-transform: uppercase; letter-spacing: 2px; font-family: 'Bebas Neue', sans-serif; }
                                                                                                                                                                                                                                                                                                                                            .section-total { font-size: 1.5rem; font-weight: 700; color: var(--temeka-green-bright); font-family: 'Bebas Neue', sans-serif; }
                                                                                                                                                                                                                                                                                                                                                    .deals-table { background: linear-gradient(135deg, var(--temeka-gray) 0%, var(--temeka-gray-light) 100%); border: 2px solid rgba(107,142,35,0.3); border-radius: 12px; overflow: hidden; margin-bottom: 2rem; }
                                                                                                                                                                                                                                                                                                                                                            table { width: 100%; border-collapse: collapse; }
                                                                                                                                                                                                                                                                                                                                                                    thead { background: rgba(107,142,35,0.15); border-bottom: 2px solid var(--temeka-green); }
                                                                                                                                                                                                                                                                                                                                                                            th { padding: 1.25rem 1.5rem; text-align: left; font-weight: 700; color: var(--temeka-green); text-transform: uppercase; letter-spacing: 1.5px; font-size: 0.85rem; }
                                                                                                                                                                                                                                                                                                                                                                                    td { padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(107,142,35,0.1); color: #ccc; font-weight: 500; }
                                                                                                                                                                                                                                                                                                                                                                                            tbody tr:hover { background: rgba(107,142,35,0.08); }
                                                                                                                                                                                                                                                                                                                                                                                                    .deal-name { font-weight: 600; color: #fff; font-size: 1rem; }
                                                                                                                                                                                                                                                                                                                                                                                                            .deal-amount { font-weight: 700; color: var(--temeka-green-bright); font-size: 1.05rem; }
                                                                                                                                                                                                                                                                                                                                                                                                                    .stage-badge { padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block; white-space: nowrap; }
                                                                                                                                                                                                                                                                                                                                                                                                                            .stage-prospecting { background: rgba(107,142,35,0.2); color: var(--temeka-green-bright); }
                                                                                                                                                                                                                                                                                                                                                                                                                                    .stage-new { background: rgba(127,184,0,0.25); color: #7FB800; }
                                                                                                                                                                                                                                                                                                                                                                                                                                            .stage-loi { background: rgba(74,102,23,0.3); color: #A8D800; }
                                                                                                                                                                                                                                                                                                                                                                                                                                                    .stage-existing { background: rgba(107,142,35,0.35); color: #8FBC00; }
                                                                                                                                                                                                                                                                                                                                                                                                                                                            .hubspot-btn { padding: 0.5rem 1.25rem; background: var(--temeka-green); color: var(--temeka-black); border: none; border-radius: 6px; font-weight: 700; font-size: 0.8rem; cursor: pointer; text-transform: uppercase; letter-spacing: 1px; transition: all 0.3s ease; text-decoration: none; display: inline-block; }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                    .hubspot-btn:hover { background: var(--temeka-green-bright); box-shadow: 0 4px 15px rgba(107,142,35,0.4); transform: translateY(-2px); }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            .contacts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1rem; }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    .contact-card { background: linear-gradient(135deg, var(--temeka-gray) 0%, var(--temeka-gray-light) 100%); padding: 1.25rem; border: 2px solid rgba(107,142,35,0.2); border-radius: 10px; transition: all 0.3s ease; }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            .contact-card:hover { border-color: var(--temeka-green); box-shadow: 0 6px 20px rgba(107,142,35,0.2); }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    .contact-name { font-weight: 700; color: var(--temeka-green-bright); font-size: 1.1rem; margin-bottom: 0.5rem; }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            .contact-company { font-weight: 600; color: #fff; font-size: 0.95rem; margin-bottom: 0.25rem; }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    .contact-title { color: #888; font-size: 0.85rem; margin-bottom: 0.75rem; }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            .contact-status { display: inline-block; padding: 0.35rem 0.85rem; background: rgba(107,142,35,0.2); color: var(--temeka-green); border-radius: 5px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    @media (max-width: 768px) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              .header, .nav-tabs, .content { padding-left: 1.5rem; padding-right: 1.5rem; }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        .metrics-grid, .contacts-grid { grid-template-columns: 1fr; }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  table { font-size: 0.85rem; }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            th, td { padding: 1rem; }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          `}</style>style>
          
                <div className="header">
                        <div className="header-content">
                                  <div>
                                              <div className="logo">TEMEKA GROUP</div>div>
                                              <div className="tagline">Executive Sales Dashboard - Mike &amp; Paul</div>div>
                                  </div>div>
                                  <div className="header-right">
                                              <div className="founders-note">
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width:'20px',height:'20px'}}>
                                                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                                            </svg>svg>
                                                            <span>Live HubSpot Data</span>span>
                                              </div>div>
                                              <div className="last-updated">
                                                            <strong>Last Updated:</strong>strong> {lastUpdated ? formatLastUpdated(lastUpdated) : (loading ? 'Loading...' : 'Unknown')}
                                              </div>div>
                                  </div>div>
                        </div>div>
                </div>div>
          
                <div className="nav-tabs">
                  {[['overview','Overview'],['matt',"Matt's Deals"],['chris',"Chris's Deals"],['contacts','Prospecting']].map(([key,label]) => (
                      <button key={key} className={'tab' + (activeTab === key ? ' active' : '')} onClick={() => setActiveTab(key)}>{label}</button>button>
                    ))}
                </div>div>
          
                <div className="content">
                  {loading && (
                      <div className="loading-state">Loading live HubSpot data...</div>div>
                        )}
                  {error && !loading && (
                      <div className="error-state">Failed to load HubSpot data: {error}</div>div>
                        )}
                
                  {!loading && activeTab === 'overview' && (
                      <>
                                  <div className="metrics-grid">
                                                <MetricCard title="Combined Pipeline" value={formatCurrency(combinedTotal)} subtitle={(mattDeals.length + chrisDeals.length) + ' total active deals'} color="var(--temeka-green-bright)" />
                                                <MetricCard title="Matt's Pipeline" value={formatCurrency(mattTotal)} subtitle={mattDeals.length + ' deals | Avg: ' + formatCurrency(getAvgDealSize(mattDeals))} color="var(--temeka-green)" />
                                                <MetricCard title="Chris's Pipeline" value={formatCurrency(chrisTotal)} subtitle={chrisDeals.length + ' deals | Avg: ' + formatCurrency(getAvgDealSize(chrisDeals))} color="var(--temeka-green)" />
                                                <MetricCard title="Active Prospects" value={mattContacts.length + chrisContacts.length} subtitle="Contacts being actively prospected" color="var(--temeka-green-bright)" />
                                  </div>div>
                                  <div className="deals-section">
                                                <div className="section-header">
                                                                <div className="section-title">Top 5 Opportunities</div>div>
                                                </div>div>
                                                <div className="deals-table">
                                                                <table>
                                                                                  <thead><tr><th>Deal Name</th>th><th>Owner</th>th><th>Amount</th>th><th>Stage</th>th><th>View</th>th></tr>tr></thead>thead>
                                                                                  <tbody>
                                                                                    {[...mattDeals, ...chrisDeals].sort((a,b) => b.amount - a.amount).slice(0,5).map((deal, idx) => (
                                              <tr key={idx}>
                                                                      <td className="deal-name">{deal.name}</td>td>
                                                                      <td>{deal.ownerName}</td>td>
                                                                      <td className="deal-amount">{formatCurrency(deal.amount)}</td>td>
                                                                      <td><span className={'stage-badge ' + getStageBadgeClass(deal.stage)}>{formatStageName(deal.stage)}</span>span></td>td>
                                                                      <td><a href={'https://app.hubspot.com/contacts/8298615/record/0-3/' + deal.id} target="_blank" rel="noopener noreferrer" className="hubspot-btn">Open</a>a></td>td>
                                              </tr>tr>
                                            ))}
                                                                                    </tbody>tbody>
                                                                </table>table>
                                                </div>div>
                                  </div>div>
                      </>>
                    )}
                
                  {!loading && activeTab === 'matt' && (
                      <div className="deals-section">
                                  <div className="section-header">
                                                <div className="section-title">Matt Code - Active Deals</div>div>
                                                <div className="section-total">{formatCurrency(mattTotal)}</div>div>
                                  </div>div>
                                  <div className="deals-table">
                                                <table>
                                                                <thead><tr><th>Deal Name</th>th><th>Amount</th>th><th>Stage</th>th><th>Probability</th>th><th>View in HubSpot</th>th></tr>tr></thead>thead>
                                                                <tbody>
                                                                  {mattDeals.map((deal, idx) => (
                                            <tr key={idx}>
                                                                  <td className="deal-name">{deal.name}</td>td>
                                                                  <td className="deal-amount">{formatCurrency(deal.amount)}</td>td>
                                                                  <td><span className={'stage-badge ' + getStageBadgeClass(deal.stage)}>{formatStageName(deal.stage)}</span>span></td>td>
                                                                  <td>{Math.round(deal.probability * 100)}%</td>td>
                                                                  <td><a href={'https://app.hubspot.com/contacts/8298615/record/0-3/' + deal.id} target="_blank" rel="noopener noreferrer" className="hubspot-btn">Open Deal</a>a></td>td>
                                            </tr>tr>
                                          ))}
                                                                </tbody>tbody>
                                                </table>table>
                                  </div>div>
                      </div>div>
                        )}
                
                  {!loading && activeTab === 'chris' && (
                      <div className="deals-section">
                                  <div className="section-header">
                                                <div className="section-title">Chris Isley - Active Deals</div>div>
                                                <div className="section-total">{formatCurrency(chrisTotal)}</div>div>
                                  </div>div>
                                  <div className="deals-table">
                                                <table>
                                                                <thead><tr><th>Deal Name</th>th><th>Amount</th>th><th>Stage</th>th><th>Probability</th>th><th>View in HubSpot</th>th></tr>tr></thead>thead>
                                                                <tbody>
                                                                  {chrisDeals.map((deal, idx) => (
                                            <tr key={idx}>
                                                                  <td className="deal-name">{deal.name}</td>td>
                                                                  <td className="deal-amount">{formatCurrency(deal.amount)}</td>td>
                                                                  <td><span className={'stage-badge ' + getStageBadgeClass(deal.stage)}>{formatStageName(deal.stage)}</span>span></td>td>
                                                                  <td>{Math.round(deal.probability * 100)}%</td>td>
                                                                  <td><a href={'https://app.hubspot.com/contacts/8298615/record/0-3/' + deal.id} target="_blank" rel="noopener noreferrer" className="hubspot-btn">Open Deal</a>a></td>td>
                                            </tr>tr>
                                          ))}
                                                                </tbody>tbody>
                                                </table>table>
                                  </div>div>
                      </div>div>
                        )}
                
                  {!loading && activeTab === 'contacts' && (
                      <>
                                  <div className="deals-section">
                                                <div className="section-header">
                                                                <div className="section-title">Matt's Active Prospects</div>div>
                                                                <div className="section-total">{mattContacts.length} Contacts</div>div>
                                                </div>div>
                                                <div className="contacts-grid">
                                                  {mattContacts.map((contact, idx) => (
                                          <div key={idx} className="contact-card">
                                                              <div className="contact-name">{contact.name}</div>div>
                                            {contact.company && <div className="contact-company">{contact.company}</div>div>}
                                            {contact.title && <div className="contact-title">{contact.title}</div>div>}
                                                              <div className="contact-status">{contact.status}</div>div>
                                          </div>div>
                                        ))}
                                                </div>div>
                                  </div>div>
                                  <div className="deals-section" style={{ marginTop: '3rem' }}>
                                                <div className="section-header">
                                                                <div className="section-title">Chris's Active Prospects</div>div>
                                                                <div className="section-total">{chrisContacts.length} Contacts</div>div>
                                                </div>div>
                                                <div className="contacts-grid">
                                                  {chrisContacts.map((contact, idx) => (
                                          <div key={idx} className="contact-card">
                                                              <div className="contact-name">{contact.name}</div>div>
                                            {contact.company && <div className="contact-company">{contact.company}</div>div>}
                                            {contact.title && <div className="contact-title">{contact.title}</div>div>}
                                                              <div className="contact-status">{contact.status}</div>div>
                                          </div>div>
                                        ))}
                                                </div>div>
                                  </div>div>
                      </>>
                    )}
                </div>div>
          </div>div>
        );
}</></></div>
