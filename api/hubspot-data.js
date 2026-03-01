// Vercel serverless function - fetches HubSpot deals and contacts
// Filters to active (open) deals only - matching HubSpot saved views
const HUBSPOT_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const HUBSPOT_BASE = 'https://api.hubapi.com';

// Known owner ID -> name mapping
const KNOWN_OWNERS = {
  '50294378': 'Matt Code',
  '52261992': 'Chris Isley',
};

// Active (open deal) stage IDs from the Temeka Pipeline
// These are the only stages shown in the Matt Code Pipeline and Chris Deals views
// Excludes: Closed & Completed (16051229), Deal Dead (16051230), and all OLD archived stages
const ACTIVE_STAGE_IDS = new Set([
  '964416851', // Prospecting (open deal)
  '26089121',  // LOI/Bid Stage (open deal)
  '13211382',  // Deal On Hold (open deal)
  '5909289',   // Exist Cust./New Opp. (open deal)
  '4358557',   // New Cust./New Opp (open deal)
  '5908905',   // Bid Approved - Shift to GS & QB
  '9827016',   // Completed - Invoiced Final
]);

async function fetchAllDeals() {
  const deals = [];
  let after = undefined;
  while (true) {
    const url = new URL(`${HUBSPOT_BASE}/crm/v3/objects/deals`);
    url.searchParams.set('limit', '100');
    url.searchParams.set('properties', 'dealname,amount,dealstage,hubspot_owner_id,hs_deal_stage_probability');
    if (after) url.searchParams.set('after', after);
    const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${HUBSPOT_TOKEN}` } });
    if (!res.ok) throw new Error(`Deals API error ${res.status}`);
    const data = await res.json();
    // Only include active/open stage deals
    const activeDeals = data.results.filter(d => ACTIVE_STAGE_IDS.has(d.properties.dealstage));
    deals.push(...activeDeals);
    if (data.paging?.next?.after) { after = data.paging.next.after; } else { break; }
  }
  return deals;
}

async function fetchAllContacts() {
  const contacts = [];
  let after = undefined;
  while (true) {
    const url = new URL(`${HUBSPOT_BASE}/crm/v3/objects/contacts`);
    url.searchParams.set('limit', '100');
    url.searchParams.set('properties', 'firstname,lastname,company,jobtitle,hs_lead_status,hubspot_owner_id');
    if (after) url.searchParams.set('after', after);
    const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${HUBSPOT_TOKEN}` } });
    if (!res.ok) throw new Error(`Contacts API error ${res.status}`);
    const data = await res.json();
    contacts.push(...data.results);
    if (data.paging?.next?.after) { after = data.paging.next.after; } else { break; }
  }
  return contacts;
}

async function fetchOwners() {
  const map = { ...KNOWN_OWNERS };
  try {
    const res = await fetch(`${HUBSPOT_BASE}/crm/v3/owners?limit=100`, {
      headers: { Authorization: `Bearer ${HUBSPOT_TOKEN}` }
    });
    if (res.ok) {
      const data = await res.json();
      for (const o of (data.results || [])) {
        const name = (`${o.firstName || ''} ${o.lastName || ''}`).trim() || o.email || null;
        if (name) map[String(o.id)] = name;
      }
    }
  } catch (e) {
    console.error('fetchOwners error:', e.message);
  }
  return map;
}

async function fetchStageLabels() {
  const stageMap = {};
  try {
    const res = await fetch(`${HUBSPOT_BASE}/crm/v3/pipelines/deals`, {
      headers: { Authorization: `Bearer ${HUBSPOT_TOKEN}` }
    });
    if (res.ok) {
      const data = await res.json();
      for (const pipeline of (data.results || [])) {
        for (const stage of (pipeline.stages || [])) {
          stageMap[stage.id] = stage.label;
        }
      }
    }
  } catch (e) {
    console.error('fetchStageLabels error:', e.message);
  }
  return stageMap;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!HUBSPOT_TOKEN) return res.status(500).json({ error: 'HUBSPOT_ACCESS_TOKEN not configured' });

  try {
    const [deals, contacts, ownerMap, stageMap] = await Promise.all([
      fetchAllDeals(),
      fetchAllContacts(),
      fetchOwners(),
      fetchStageLabels()
    ]);

    const normalizedDeals = deals.map(d => ({
      id: d.id,
      name: d.properties.dealname || 'Unnamed Deal',
      amount: parseFloat(d.properties.amount || '0') || 0,
      stage: d.properties.dealstage || 'Unknown',
      stageLabel: stageMap[d.properties.dealstage] || d.properties.dealstage || 'Unknown',
      probability: parseFloat(d.properties.hs_deal_stage_probability || '0') || 0,
      ownerId: d.properties.hubspot_owner_id || null,
      ownerName: ownerMap[String(d.properties.hubspot_owner_id)] || 'Unknown'
    }));

    const normalizedContacts = contacts.map(c => ({
      id: c.id,
      name: `${c.properties.firstname || ''} ${c.properties.lastname || ''}`.trim() || 'Unknown',
      company: c.properties.company || '',
      title: c.properties.jobtitle || '',
      status: c.properties.hs_lead_status || 'NEW',
      ownerId: c.properties.hubspot_owner_id || null,
      ownerName: ownerMap[String(c.properties.hubspot_owner_id)] || 'Unknown'
    }));

    const payload = {
      deals: normalizedDeals,
      contacts: normalizedContacts,
      owners: Object.entries(ownerMap).map(([id, name]) => ({ id, name })),
      stageLabels: stageMap,
      lastUpdated: new Date().toISOString(),
      totalDeals: normalizedDeals.length,
      totalContacts: normalizedContacts.length
    };

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).json(payload);
  } catch (error) {
    console.error('HubSpot API Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
