import React, { useState, useEffect } from 'react';

function isMatt(name) {
  if (!name) return false;
  const n = name.toLowerCase();
  return n.includes('matt') || n.includes('code');
}

function isChris(name) {
  if (!name) return false;
  const n = name.toLowerCase();
  return n.includes('chris') || n.includes('isley');
}

function getStageBadgeClass(stageLabel) {
  const s = (stageLabel || '').toLowerCase();
  if (s.includes('prospect') || s.includes('appoint')) return 'stage-prospecting';
  if (s.includes('new') || s.includes('qualified') || s.includes('presentation')) return 'stage-new';
  if (s.includes('loi') || s.includes('bid') || s.includes('decision') || s.includes('contract')) return 'stage-loi';
  if (s.includes('won') || s.includes('closed won')) return 'stage-new';
  if (s.includes('lost') || s.includes('closed lost')) return 'stage-existing';
  return 'stage-existing';
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
        if (data.lastUpdated) setLastUpdated(new Date(data.lastUpdated));
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const mattDeals = hubspotData ? hubspotData.deals.filter(d => isMatt(d.ownerName)) : [];
  const chrisDeals = hubspotData ? hubspotData.deals.filter(d => isChris(d.ownerName)) : [];
  const mattContacts = hubspotData ? hubspotData.contacts.filter(c => isMatt(c.ownerName)) : [];
  const chrisContacts = hubspotData ? hubspotData.contacts.filter(c => isChris(c.ownerName)) : [];

  const fmt = (n) => n >= 1e6 ? '$' + (n/1e6).toFixed(2) + 'M' : n >= 1e3 ? '$' + (n/1e3).toFixed(0) + 'K' : '$' + n;
  const total = (deals) => deals.reduce((s, d) => s + (d.amount || 0), 0);
  const mattTotal = total(mattDeals);
  const chrisTotal = total(chrisDeals);
  const combinedTotal = mattTotal + chrisTotal;

  const fmtDate = (d) => !d ? '' : d.toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true
  });

  const Card = ({ title, value, sub, color }) => (
    <div className="metric-card">
      <div className="metric-title">{title}</div>
      <div className="metric-value" style={{color}}>{value}</div>
      {sub && <div className="metric-subtitle">{sub}</div>}
    </div>
  );

  const DealRow = ({ deal }) => (
    <tr>
      <td className="deal-name">{deal.name}</td>
      <td className="deal-amount">{fmt(deal.amount || 0)}</td>
      <td><span className={'stage-badge ' + getStageBadgeClass(deal.stageLabel || deal.stage)}>{deal.stageLabel || deal.stage}</span></td>
      <td>{Math.round((deal.probability || 0) * 100)}%</td>
      <td><a href={'https://app.hubspot.com/contacts/8298615/record/0-3/' + deal.id} target="_blank" rel="noopener noreferrer" className="hubspot-btn">Open</a></td>
    </tr>
  );

  const ContactCard = ({ c }) => (
    <div className="contact-card">
      <div className="contact-name">{c.name}</div>
      {c.company && <div className="contact-company">{c.company}</div>}
      {c.title && <div className="contact-title">{c.title}</div>}
      <div className="contact-status">{c.status}</div>
    </div>
  );

  return (
    <div className="dashboard-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@300;400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        :root { --g: #6B8E23; --gb: #7FB800; --gd: #4A6617; --black: #000; --gray: #1a1a1a; --gray2: #2a2a2a; }
        body { background: var(--black); color: var(--g); font-family: 'Rajdhani', sans-serif; }
        .dashboard-container { min-height: 100vh; background: linear-gradient(135deg, #000 0%, #0a0a0a 50%, #000 100%); }
        .header { background: rgba(0,0,0,0.95); border-bottom: 3px solid var(--g); padding: 1.5rem 3rem; position: sticky; top: 0; z-index: 100; backdrop-filter: blur(10px); }
        .header-content { display: flex; justify-content: space-between; align-items: center; max-width: 1800px; margin: 0 auto; }
        .logo { font-family: 'Bebas Neue', sans-serif; font-size: 2.5rem; letter-spacing: 2px; background: linear-gradient(135deg, var(--gb) 0%, var(--g) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .tagline { font-size: 0.9rem; color: #888; font-weight: 300; letter-spacing: 1px; margin-top: 0.25rem; }
        .header-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem; }
        .founders-note { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.5rem; background: rgba(107,142,35,0.1); border: 1px solid var(--g); border-radius: 8px; font-size: 0.9rem; font-weight: 500; color: var(--gb); }
        .last-updated { font-size: 0.8rem; color: #666; text-align: right; }
        .last-updated strong { color: var(--g); }
        .nav-tabs { display: flex; gap: 0.5rem; padding: 2rem 3rem 0; max-width: 1800px; margin: 0 auto; }
        .tab { padding: 1rem 2rem; background: var(--gray); border: 2px solid transparent; color: #888; cursor: pointer; font-size: 1rem; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; transition: all 0.3s; }
        .tab:hover { border-color: var(--g); color: var(--g); }
        .tab.active { background: var(--g); color: var(--black); border-color: var(--g); }
        .content { padding: 2rem 3rem; max-width: 1800px; margin: 0 auto; }
        .loading-state { display: flex; align-items: center; justify-content: center; padding: 4rem; color: var(--g); font-size: 1.5rem; font-family: 'Bebas Neue', sans-serif; }
        .error-state { padding: 2rem; color: #ff6b6b; background: rgba(255,107,107,0.1); border: 1px solid rgba(255,107,107,0.3); border-radius: 8px; margin: 2rem 0; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
        .metric-card { background: linear-gradient(135deg, var(--gray) 0%, var(--gray2) 100%); padding: 1.75rem; border: 2px solid rgba(107,142,35,0.3); border-radius: 12px; transition: all 0.3s; }
        .metric-card:hover { border-color: var(--g); box-shadow: 0 8px 30px rgba(107,142,35,0.25); transform: translateY(-4px); }
        .metric-title { font-size: 0.9rem; color: #888; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 500; margin-bottom: 1rem; }
        .metric-value { font-size: 2.5rem; font-weight: 700; font-family: 'Bebas Neue', sans-serif; margin-bottom: 0.5rem; }
        .metric-subtitle { font-size: 0.85rem; color: #666; }
        .deals-section { margin-bottom: 3rem; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid var(--g); }
        .section-title { font-size: 1.75rem; font-weight: 700; color: var(--g); text-transform: uppercase; letter-spacing: 2px; font-family: 'Bebas Neue', sans-serif; }
        .section-total { font-size: 1.5rem; font-weight: 700; color: var(--gb); font-family: 'Bebas Neue', sans-serif; }
        .deals-table { background: linear-gradient(135deg, var(--gray) 0%, var(--gray2) 100%); border: 2px solid rgba(107,142,35,0.3); border-radius: 12px; overflow: hidden; margin-bottom: 2rem; }
        table { width: 100%; border-collapse: collapse; }
        thead { background: rgba(107,142,35,0.15); border-bottom: 2px solid var(--g); }
        th { padding: 1.25rem 1.5rem; text-align: left; font-weight: 700; color: var(--g); text-transform: uppercase; letter-spacing: 1.5px; font-size: 0.85rem; }
        td { padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(107,142,35,0.1); color: #ccc; font-weight: 500; }
        tbody tr:hover { background: rgba(107,142,35,0.08); }
        .deal-name { font-weight: 600; color: #fff; }
        .deal-amount { font-weight: 700; color: var(--gb); font-size: 1.05rem; }
        .stage-badge { padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; display: inline-block; white-space: nowrap; }
        .stage-prospecting { background: rgba(107,142,35,0.2); color: var(--gb); }
        .stage-new { background: rgba(127,184,0,0.25); color: #7FB800; }
        .stage-loi { background: rgba(74,102,23,0.3); color: #A8D800; }
        .stage-existing { background: rgba(107,142,35,0.35); color: #8FBC00; }
        .hubspot-btn { padding: 0.5rem 1.25rem; background: var(--g); color: var(--black); border: none; border-radius: 6px; font-weight: 700; font-size: 0.8rem; cursor: pointer; text-transform: uppercase; text-decoration: none; display: inline-block; }
        .hubspot-btn:hover { background: var(--gb); }
        .contacts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1rem; }
        .contact-card { background: linear-gradient(135deg, var(--gray) 0%, var(--gray2) 100%); padding: 1.25rem; border: 2px solid rgba(107,142,35,0.2); border-radius: 10px; transition: all 0.3s; }
        .contact-card:hover { border-color: var(--g); }
        .contact-name { font-weight: 700; color: var(--gb); font-size: 1.1rem; margin-bottom: 0.5rem; }
        .contact-company { font-weight: 600; color: #fff; font-size: 0.95rem; margin-bottom: 0.25rem; }
        .contact-title { color: #888; font-size: 0.85rem; margin-bottom: 0.75rem; }
        .contact-status { display: inline-block; padding: 0.35rem 0.85rem; background: rgba(107,142,35,0.2); color: var(--g); border-radius: 5px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
      `}</style>
      <div className="header">
        <div className="header-content">
          <div>
            <div className="logo">TEMEKA GROUP</div>
            <div className="tagline">Executive Sales Dashboard</div>
          </div>
          <div className="header-right">
            <div className="founders-note">Live HubSpot Data</div>
            <div className="last-updated">
              <strong>Last Updated:</strong> {lastUpdated ? fmtDate(lastUpdated) : (loading ? 'Loading...' : 'Unknown')}
            </div>
          </div>
        </div>
      </div>
      <div className="nav-tabs">
        {[['overview','Overview'],['matt',"Matt's Deals"],['chris',"Chris's Deals"],['contacts','Prospecting']].map(([k,l]) => (
          <button key={k} className={'tab' + (activeTab === k ? ' active' : '')} onClick={() => setActiveTab(k)}>{l}</button>
        ))}
      </div>
      <div className="content">
        {loading && <div className="loading-state">Loading live HubSpot data...</div>}
        {error && !loading && <div className="error-state">Error: {error}</div>}
        {!loading && activeTab === 'overview' && (
          <React.Fragment>
            <div className="metrics-grid">
              <Card title="Combined Pipeline" value={fmt(combinedTotal)} sub={(mattDeals.length + chrisDeals.length) + ' total deals'} color="var(--gb)" />
              <Card title="Matt's Pipeline" value={fmt(mattTotal)} sub={mattDeals.length + ' deals'} color="var(--g)" />
              <Card title="Chris's Pipeline" value={fmt(chrisTotal)} sub={chrisDeals.length + ' deals'} color="var(--g)" />
              <Card title="Active Prospects" value={mattContacts.length + chrisContacts.length} sub="Total contacts" color="var(--gb)" />
            </div>
            <div className="deals-section">
              <div className="section-header"><div className="section-title">Top 5 Opportunities</div></div>
              <div className="deals-table">
                <table>
                  <thead><tr><th>Deal Name</th><th>Amount</th><th>Stage</th><th>Probability</th><th>View</th></tr></thead>
                  <tbody>{[...mattDeals, ...chrisDeals].sort((a,b) => b.amount - a.amount).slice(0,5).map((d,i) => <DealRow key={i} deal={d} />)}</tbody>
                </table>
              </div>
            </div>
          </React.Fragment>
        )}
        {!loading && activeTab === 'matt' && (
          <div className="deals-section">
            <div className="section-header">
              <div className="section-title">Matt Code - Active Deals</div>
              <div className="section-total">{fmt(mattTotal)}</div>
            </div>
            <div className="deals-table">
              <table>
                <thead><tr><th>Deal Name</th><th>Amount</th><th>Stage</th><th>Probability</th><th>View</th></tr></thead>
                <tbody>{mattDeals.map((d,i) => <DealRow key={i} deal={d} />)}</tbody>
              </table>
            </div>
          </div>
        )}
        {!loading && activeTab === 'chris' && (
          <div className="deals-section">
            <div className="section-header">
              <div className="section-title">Chris Isley - Active Deals</div>
              <div className="section-total">{fmt(chrisTotal)}</div>
            </div>
            <div className="deals-table">
              <table>
                <thead><tr><th>Deal Name</th><th>Amount</th><th>Stage</th><th>Probability</th><th>View</th></tr></thead>
                <tbody>{chrisDeals.map((d,i) => <DealRow key={i} deal={d} />)}</tbody>
              </table>
            </div>
          </div>
        )}
        {!loading && activeTab === 'contacts' && (
          <React.Fragment>
            <div className="deals-section">
              <div className="section-header">
                <div className="section-title">Matt's Active Prospects</div>
                <div className="section-total">{mattContacts.length} Contacts</div>
              </div>
              <div className="contacts-grid">{mattContacts.map((c,i) => <ContactCard key={i} c={c} />)}</div>
            </div>
            <div className="deals-section" style={{marginTop:'3rem'}}>
              <div className="section-header">
                <div className="section-title">Chris's Active Prospects</div>
                <div className="section-total">{chrisContacts.length} Contacts</div>
              </div>
              <div className="contacts-grid">{chrisContacts.map((c,i) => <ContactCard key={i} c={c} />)}</div>
            </div>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}
