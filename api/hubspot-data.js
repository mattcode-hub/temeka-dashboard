// Vercel serverless function - fetches HubSpot deals and contacts
// Matt Code Pipeline: owner 83664939, Temeka Pipeline (4358556), active open stages
// Chris Deals: owner 52261992, Prospecting stage (964416851) only
const HUBSPOT_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const HUBSPOT_BASE = 'https://api.hubapi.com';

// Known owner ID -> name mapping (verified from actual deal records)
const KNOWN_OWNERS = {
    '83664939': 'Matt Code',
    '52261992': 'Chris Isley',
};

// Active (open deal) stage IDs for the Temeka Pipeline (Matt Code Pipeline view)
// Excludes: Didn't Get Deal (6078671), Closed & Completed (16051229), Deal Dead (16051230)
const MATT_ACTIVE_STAGE_IDS = new Set([
    '964416851', // Prospecting (open deal)
    '26089121',  // LOI/Bid Stage (open deal)
    '13211382',  // Deal On Hold (open deal)
    '5909289',   // Exist Cust./New Opp. (open deal)
    '4358557',   // New Cust./New Opp (open deal)
    '5908905',   // Bid Approved - Shift to GS & QB
    '9827016',   // Completed - Invoiced Final
  ]);

// Chris Deals view: ONLY Prospecting (open deal) stage
const CHRIS_STAGE_ID = '964416851';

// Temeka Pipeline ID
const TEMEKA_PIPELINE = '4358556';

// Matt Code owner ID
const MATT_OWNER_ID = '83664939';

// Chris Isley owner ID
const CHRIS_OWNER_ID = '52261992';

async function fetchOwners(token) {
    try {
          const url = `${HUBSPOT_BASE}/crm/v3/owners?limit=100`;
          const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
          if (!resp.ok) return { ...KNOWN_OWNERS };
          const data = await resp.json();
          const map = { ...KNOWN_OWNERS };
          (data.results || []).forEach(o => {
                  if (o.id && (o.firstName || o.lastName)) {
                            map[String(o.id)] = `${o.firstName || ''} ${o.lastName || ''}`.trim();
                  }
          });
          return map;
    } catch {
          return { ...KNOWN_OWNERS };
    }
}

async function fetchMattDeals(token) {
    // Matt Code Pipeline: owner=83664939, pipeline=Temeka Pipeline, active open stages
  const body = {
        filterGroups: [{
                filters: [
                  { propertyName: 'hubspot_owner_id', operator: 'EQ', value: MATT_OWNER_ID },
                  { propertyName: 'pipeline', operator: 'EQ', value: TEMEKA_PIPELINE }
                        ]
        }],
        properties: ['dealname', 'amount', 'dealstage', 'hubspot_owner_id', 'pipeline', 'closedate'],
        limit: 100,
        sorts: [{ propertyName: 'amount', direction: 'DESCENDING' }]
  };
    const resp = await fetch(`${HUBSPOT_BASE}/crm/v3/objects/deals/search`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
    });
    if (!resp.ok) return [];
    const data = await resp.json();
    // Filter to active stages only
  return (data.results || []).filter(d => MATT_ACTIVE_STAGE_IDS.has(d.properties.dealstage));
}

async function fetchChrisDeals(token) {
    // Chris Deals view: owner=52261992, stage=Prospecting (open deal) ONLY
  const body = {
        filterGroups: [{
                filters: [
                  { propertyName: 'hubspot_owner_id', operator: 'EQ', value: CHRIS_OWNER_ID },
                  { propertyName: 'dealstage', operator: 'EQ', value: CHRIS_STAGE_ID }
                        ]
        }],
        properties: ['dealname', 'amount', 'dealstage', 'hubspot_owner_id', 'pipeline', 'closedate'],
        limit: 100,
        sorts: [{ propertyName: 'amount', direction: 'DESCENDING' }]
  };
    const resp = await fetch(`${HUBSPOT_BASE}/crm/v3/objects/deals/search`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
    });
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.results || [];
}

async function fetchContacts(token) {
    // Fetch recent contacts for prospecting section
  const url = `${HUBSPOT_BASE}/crm/v3/objects/contacts?limit=50&properties=firstname,lastname,email,company,phone,jobtitle,hubspot_owner_id,hs_lead_status,createdate&sort=-createdate`;
    const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!resp.ok) return [];
    const data = await resp.json();
    return data.results || [];
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

  const token = HUBSPOT_TOKEN;
    if (!token) {
          return res.status(500).json({ error: 'Missing HUBSPOT_ACCESS_TOKEN env var' });
    }

  try {
        const [owners, mattDeals, chrisDeals, contacts] = await Promise.all([
                fetchOwners(token),
                fetchMattDeals(token),
                fetchChrisDeals(token),
                fetchContacts(token)
              ]);

      // Stage ID to label mapping
      const stageLabels = {
              '964416851': 'Prospecting (open deal)',
              '4358557':   'New Cust./New Opp (open deal)',
              '5909289':   'Exist Cust./New Opp. (open deal)',
              '26089121':  'LOI/Bid Stage (open deal)',
              '5908905':   'Bid Approved - Shift to GS & QB',
              '9827016':   'Completed - Invoiced Final',
              '13211382':  'Deal On Hold (open deal)',
              '6078671':   'Didn\'t Get Deal',
              '16051229':  'Closed & Completed',
              '16051230':  'Deal Dead',
      };

      function mapDeal(d) {
              const ownerId = String(d.properties.hubspot_owner_id || '');
              return {
                        id: d.id,
                        name: d.properties.dealname || 'Unnamed Deal',
                        amount: parseFloat(d.properties.amount) || 0,
                        stageId: d.properties.dealstage,
                        stageLabel: stageLabels[d.properties.dealstage] || d.properties.dealstage,
                        ownerName: owners[ownerId] || ownerId,
                        closeDate: d.properties.closedate || null,
              };
      }

      function mapContact(c) {
              const ownerId = String(c.properties.hubspot_owner_id || '');
              return {
                        id: c.id,
                        firstName: c.properties.firstname || '',
                        lastName: c.properties.lastname || '',
                        email: c.properties.email || '',
                        company: c.properties.company || '',
                        phone: c.properties.phone || '',
                        title: c.properties.jobtitle || '',
                        ownerName: owners[ownerId] || ownerId,
                        leadStatus: c.properties.hs_lead_status || '',
                        createDate: c.properties.createdate || null,
              };
      }

      const allDeals = [
              ...mattDeals.map(mapDeal),
              ...chrisDeals.map(mapDeal)
            ];

      return res.status(200).json({
              deals: allDeals,
              contacts: contacts.map(mapContact),
              lastUpdated: new Date().toISOString(),
              meta: {
                        mattDealCount: mattDeals.length,
                        chrisDealCount: chrisDeals.length,
                        mattTotal: mattDeals.reduce((s, d) => s + (parseFloat(d.properties.amount) || 0), 0),
                        chrisTotal: chrisDeals.reduce((s, d) => s + (parseFloat(d.properties.amount) || 0), 0),
              }
      });
  } catch (err) {
        console.error('HubSpot API error:', err);
        return res.status(500).json({ error: err.message });
  }
}
