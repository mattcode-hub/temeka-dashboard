import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function TemekaSalesDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const mattDeals = [
    { id: 56611843634, name: 'Urbn Outfitters', amount: 1752108, stage: 'New Cust./New Opp', probability: 85 },
    { id: 49700743749, name: 'Nadira Sutton - Turn Key Dispensary', amount: 165000, stage: 'New Cust./New Opp', probability: 75 },
    { id: 56162807553, name: 'Sun Buds', amount: 50000, stage: 'New Cust./New Opp', probability: 60 },
    { id: 46902166359, name: 'Princess Polly', amount: 100000, stage: 'New Cust./New Opp', probability: 70 },
    { id: 46563878426, name: 'Big Jules Dispensary', amount: 169034, stage: 'LOI/Bid Stage', probability: 80 },
    { id: 54263629687, name: 'GP6 Wellness', amount: 300000, stage: 'Prospecting', probability: 40 },
    { id: 54223752576, name: 'Jake Stocking', amount: 100000, stage: 'Prospecting', probability: 35 },
    { id: 53886970485, name: 'Pet Supermarket', amount: 0, stage: 'Prospecting', probability: 30 },
    { id: 53382768290, name: 'Tailored Brands', amount: 0, stage: 'Prospecting', probability: 25 },
    { id: 52218606124, name: 'RTO Dispensary', amount: 5000, stage: 'Prospecting', probability: 30 },
    { id: 51832015776, name: 'Nifty Goods', amount: 4000, stage: 'Prospecting', probability: 30 },
    { id: 47433616477, name: 'Falcon Rappaport & Berkman', amount: 50000, stage: 'Prospecting', probability: 25 },
    { id: 45968168288, name: 'Levels Dispensary California', amount: 50000, stage: 'Prospecting', probability: 30 }
  ];

  const chrisDeals = [
    { id: 48536521299, name: 'HF Dispensary, LLC', amount: 60000, stage: 'New Cust./New Opp', probability: 70 },
    { id: 56611543100, name: 'Mango Cannabis - MN', amount: 100000, stage: 'New Cust./New Opp', probability: 65 },
    { id: 47879683857, name: 'Snowbird Cannabis LLC', amount: 65000, stage: 'New Cust./New Opp', probability: 75 },
    { id: 30832263458, name: 'Nug Dispensaries', amount: 0, stage: 'New Cust./New Opp', probability: 50 },
    { id: 29547250492, name: 'Better States Dispensary', amount: 7500, stage: 'New Cust./New Opp', probability: 80 },
    { id: 48473774654, name: 'Highline Collective LLC', amount: 120000, stage: 'LOI/Bid Stage', probability: 85 },
    { id: 42446288817, name: 'Deep Roots Harvest', amount: 10000, stage: 'LOI/Bid Stage', probability: 70 },
    { id: 38529683977, name: 'Native Land Cheefin Brand', amount: 100000, stage: 'LOI/Bid Stage', probability: 75 },
    { id: 37144370711, name: 'Hyperwolf', amount: 120000, stage: 'LOI/Bid Stage', probability: 80 },
    { id: 32153519727, name: 'Bless Wellness (NM)', amount: 83075, stage: 'LOI/Bid Stage', probability: 75 },
    { id: 31085875033, name: 'Quality Control Dispensary (NM)', amount: 53696, stage: 'LOI/Bid Stage', probability: 70 },
    { id: 46291942496, name: 'Cannasnowta', amount: 80000, stage: 'LOI/Bid Stage', probability: 80 },
    { id: 56611543653, name: 'Boys and Girls Club Costa Mesa', amount: 10000, stage: 'Exist Cust./New Opp', probability: 90 },
    { id: 46557985869, name: 'Jungle Kingdom #2', amount: 60000, stage: 'Exist Cust./New Opp', probability: 85 },
    { id: 33618530212, name: 'Montana Kush #4 - Helena, MT', amount: 30000, stage: 'Exist Cust./New Opp', probability: 75 }
  ];

  const mattContacts = [
    { name: 'Traci Smith', company: 'Urbn Outfitters', title: 'Director, Development Procurement', status: 'Open Deal' },
    { name: 'Eric Ryant', company: 'Sun Buds', title: '', status: 'Prospecting' },
    { name: 'Jake Stocking', company: '', title: 'License Holder', status: 'Prospecting' },
    { name: 'Anand Patel', company: 'GP6 Wellness', title: 'CEO', status: 'Prospecting' },
    { name: 'Lisa Ly', company: 'Pet Supermarket', title: 'VP of Real Estate and Construction', status: 'Prospecting' },
    { name: 'Melissa J Schor', company: 'Tailored Brands', title: 'Senior Procurement Manager, Construction', status: 'Connected' },
    { name: 'Amanda Cooper', company: 'Barnes & Noble', title: 'Director, Purchasing & Store Development', status: 'Prospecting' },
    { name: 'Emily Ring', company: 'Princess Polly', title: 'Designer', status: 'Open Deal' },
    { name: 'David Akenhead', company: 'Princess Polly', title: 'Director of Construction', status: 'Open Deal' },
    { name: 'Mark Medley', company: 'Nifty Goods (usenifty.com)', title: 'CEO', status: 'Prospecting' },
    { name: 'Nadira Sutton', company: '', title: 'Owner', status: 'Prospecting' }
  ];

  const chrisContacts = [
    { name: 'Valennis Garcia', company: 'Johnny Was', title: 'Director of Retail operations', status: 'Attempted Contact' },
    { name: 'Emily Johanns Dougherty', company: 'Kendra Scott', title: 'Senior Director of Retail Operations', status: 'Attempted Contact' },
    { name: 'Jason Reidel', company: 'Gorjana', title: 'CEO', status: 'Bad Timing' },
    { name: 'Corinne Suarez', company: 'Marine Layer', title: 'Head of Retail, VP', status: 'Attempted Contact' },
    { name: 'Jon L', company: 'Vuori', title: 'VP, Infrastructure & Operations', status: 'Attempted Contact' },
    { name: 'Tony Stokley', company: 'Tecovas Inc.', title: 'Assistant Construction Manager', status: 'Attempted Contact' },
    { name: 'Kevin Pattah', company: 'Mango Cannabis', title: 'Owner', status: 'Prospecting' },
    { name: 'Joshua Gleiber', company: 'HF Dispensary, LLC', title: 'Owner', status: 'Prospecting' },
    { name: 'Adam Prchal', company: 'Alaska Kush Company', title: 'Owner', status: 'Prospecting' },
    { name: 'Yosi Elharar', company: 'CannaBaska', title: 'Owner', status: 'Prospecting' },
    { name: 'Heather Spencer', company: 'Deep Roots Harvest', title: 'District Manager', status: 'In Progress' },
    { name: 'Leo Guzman', company: 'Bless Wellness', title: 'Owner', status: 'In Progress' }
  ];

  const formatCurrency = (num) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num}`;
  };

  const getTotalPipeline = (deals) => deals.reduce((sum, d) => sum + d.amount, 0);
  const getAvgDealSize = (deals) => {
    const total = getTotalPipeline(deals);
    return deals.length > 0 ? total / deals.length : 0;
  };

  const mattTotal = getTotalPipeline(mattDeals);
  const chrisTotal = getTotalPipeline(chrisDeals);
  const combinedTotal = mattTotal + chrisTotal;

  const MetricCard = ({ title, value, subtitle, color }) => (
    <div className="metric-card">
      <div className="metric-title">{title}</div>
      <div className="metric-value" style={{ color }}>{value}</div>
      {subtitle && <div className="metric-subtitle">{subtitle}</div>}
    </div>
  );

  const getStageBadgeClass = (stage) => {
    if (stage.includes('Prospect')) return 'stage-prospecting';
    if (stage.includes('New')) return 'stage-new';
    if (stage.includes('LOI')) return 'stage-loi';
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
        .founders-note { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.5rem; background: rgba(107,142,35,0.1); border: 1px solid var(--temeka-green); border-radius: 8px; font-size: 0.9rem; font-weight: 500; color: var(--temeka-green-bright); }
        .nav-tabs { display: flex; gap: 0.5rem; padding: 2rem 3rem 0; max-width: 1800px; margin: 0 auto; position: relative; z-index: 1; }
        .tab { padding: 1rem 2rem; background: var(--temeka-gray); border: 2px solid transparent; color: #888; cursor: pointer; font-size: 1rem; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; transition: all 0.3s ease; }
        .tab:hover { border-color: var(--temeka-green); color: var(--temeka-green); }
        .tab.active { background: var(--temeka-green); color: var(--temeka-black); border-color: var(--temeka-green); box-shadow: 0 0 20px rgba(107,142,35,0.4); }
        .content { padding: 2rem 3rem; max-width: 1800px; margin: 0 auto; position: relative; z-index: 1; }
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
      `}</style>

      <div className="header">
        <div className="header-content">
          <div>
            <div className="logo">TEMEKA GROUP</div>
            <div className="tagline">Executive Sales Dashboard - Mike &amp; Paul</div>
          </div>
          <div className="founders-note">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width:'20px',height:'20px'}}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span>Live HubSpot Data</span>
          </div>
        </div>
      </div>

      <div className="nav-tabs">
        {[['overview','Overview'],['matt',"Matt's Deals"],['chris',"Chris's Deals"],['contacts','Prospecting']].map(([key,label]) => (
          <button key={key} className={`tab ${activeTab === key ? 'active' : ''}`} onClick={() => setActiveTab(key)}>{label}</button>
        ))}
      </div>

      <div className="content">
        {activeTab === 'overview' && (
          <>
            <div className="metrics-grid">
              <MetricCard title="Combined Pipeline" value={formatCurrency(combinedTotal)} subtitle={`${mattDeals.length + chrisDeals.length} total active deals`} color="var(--temeka-green-bright)" />
              <MetricCard title="Matt's Pipeline" value={formatCurrency(mattTotal)} subtitle={`${mattDeals.length} deals | Avg: ${formatCurrency(getAvgDealSize(mattDeals))}`} color="var(--temeka-green)" />
              <MetricCard title="Chris's Pipeline" value={formatCurrency(chrisTotal)} subtitle={`${chrisDeals.length} deals | Avg: ${formatCurrency(getAvgDealSize(chrisDeals))}`} color="var(--temeka-green)" />
              <MetricCard title="Active Prospects" value={mattContacts.length + chrisContacts.length} subtitle="Contacts being actively prospected" color="var(--temeka-green-bright)" />
            </div>
            <div className="deals-section">
              <div className="section-header">
                <div className="section-title">Top 5 Opportunities</div>
              </div>
              <div className="deals-table">
                <table>
                  <thead><tr><th>Deal Name</th><th>Owner</th><th>Amount</th><th>Stage</th><th>View</th></tr></thead>
                  <tbody>
                    {[...mattDeals, ...chrisDeals].sort((a, b) => b.amount - a.amount).slice(0, 5).map((deal, idx) => (
                      <tr key={idx}>
                        <td className="deal-name">{deal.name}</td>
                        <td>{mattDeals.includes(deal) ? 'Matt Code' : 'Chris Isley'}</td>
                        <td className="deal-amount">{formatCurrency(deal.amount)}</td>
                        <td><span className={`stage-badge ${getStageBadgeClass(deal.stage)}`}>{deal.stage}</span></td>
                        <td><a href={`https://app.hubspot.com/contacts/8298615/record/0-3/${deal.id}`} target="_blank" rel="noopener noreferrer" className="hubspot-btn">Open</a></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'matt' && (
          <div className="deals-section">
            <div className="section-header">
              <div className="section-title">Matt Code - Active Deals</div>
              <div className="section-total">{formatCurrency(mattTotal)}</div>
            </div>
            <div className="deals-table">
              <table>
                <thead><tr><th>Deal Name</th><th>Amount</th><th>Stage</th><th>Probability</th><th>View in HubSpot</th></tr></thead>
                <tbody>
                  {mattDeals.map((deal, idx) => (
                    <tr key={idx}>
                      <td className="deal-name">{deal.name}</td>
                      <td className="deal-amount">{formatCurrency(deal.amount)}</td>
                      <td><span className={`stage-badge ${getStageBadgeClass(deal.stage)}`}>{deal.stage}</span></td>
                      <td>{deal.probability}%</td>
                      <td><a href={`https://app.hubspot.com/contacts/8298615/record/0-3/${deal.id}`} target="_blank" rel="noopener noreferrer" className="hubspot-btn">Open Deal</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'chris' && (
          <div className="deals-section">
            <div className="section-header">
              <div className="section-title">Chris Isley - Active Deals</div>
              <div className="section-total">{formatCurrency(chrisTotal)}</div>
            </div>
            <div className="deals-table">
              <table>
                <thead><tr><th>Deal Name</th><th>Amount</th><th>Stage</th><th>Probability</th><th>View in HubSpot</th></tr></thead>
                <tbody>
                  {chrisDeals.map((deal, idx) => (
                    <tr key={idx}>
                      <td className="deal-name">{deal.name}</td>
                      <td className="deal-amount">{formatCurrency(deal.amount)}</td>
                      <td><span className={`stage-badge ${getStageBadgeClass(deal.stage)}`}>{deal.stage}</span></td>
                      <td>{deal.probability}%</td>
                      <td><a href={`https://app.hubspot.com/contacts/8298615/record/0-3/${deal.id}`} target="_blank" rel="noopener noreferrer" className="hubspot-btn">Open Deal</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'contacts' && (
          <>
            <div className="deals-section">
              <div className="section-header">
                <div className="section-title">Matt's Active Prospects</div>
                <div className="section-total">{mattContacts.length} Contacts</div>
              </div>
              <div className="contacts-grid">
                {mattContacts.map((contact, idx) => (
                  <div key={idx} className="contact-card">
                    <div className="contact-name">{contact.name}</div>
                    {contact.company && <div className="contact-company">{contact.company}</div>}
                    {contact.title && <div className="contact-title">{contact.title}</div>}
                    <div className="contact-status">{contact.status}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="deals-section" style={{ marginTop: '3rem' }}>
              <div className="section-header">
                <div className="section-title">Chris's Active Prospects</div>
                <div className="section-total">{chrisContacts.length} Contacts</div>
              </div>
              <div className="contacts-grid">
                {chrisContacts.map((contact, idx) => (
                  <div key={idx} className="contact-card">
                    <div className="contact-name">{contact.name}</div>
                    {contact.company && <div className="contact-company">{contact.company}</div>}
                    {contact.title && <div className="contact-title">{contact.title}</div>}
                    <div className="contact-status">{contact.status}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
