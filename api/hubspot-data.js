// Vercel serverless function - fetches HubSpot deals and contacts
const HUBSPOT_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const HUBSPOT_BASE = 'https://api.hubapi.com';

async function fetchAllDeals() {
  const deals = [];
  let after = undefined;
  while (true) {
    const url = new URL(`${HUBSPOT_BASE}/crm/v3/objects/deals`);
    url.searchParams.set('limit', '100');
    url.searchParams.set('properties', 'dealname,amount,dealstage,hubspot_owner_id,hs_deal_stage_probability');
    if (after) url.searchParams.set('after', after);
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${HUBSPOT_TOKEN}` }
    });
    if (!res.ok) throw new Error(`Deals API error ${res.status}`);
    const data = await res.json();
    deals.push(...data.results);
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
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${HUBSPOT_TOKEN}` }
    });
    if (!res.ok) throw new Error(`Contacts API error ${res.status}`);
    const data = await res.json();
    contacts.push(...data.results);
    if (data.paging?.next?.after) { after = data.paging.next.after; } else { break; }
  }
  return contacts;
}

async function fetchOwnerById(ownerId) {
  try {
    const res = await fetch(`${HUBSPOT_BASE}/crm/v3/owners/${ownerId}`, {
      headers: { Authorization: `Bearer ${HUBSPOT_TOKEN}` }
    });
    if (!res.ok) return null;
    const o = await res.json();
    return { id: String(o.id), name: (`${o.firstName || ''} ${o.lastName || ''}`).trim() || o.email || 'Unknown' };
  } catch (e) { return null; }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!HUBSPOT_TOKEN) return res.status(500).json({ error: 'HUBSPOT_ACCESS_TOKEN not configured' });

  try {
    const [deals, contacts] = await Promise.all([fetchAllDeals(), fetchAllContacts()]);

    // Get unique owner IDs from deals and contacts
    const uniqueOwnerIds = [...new Set([
      ...deals.map(d => d.properties.hubspot_owner_id),
      ...contacts.map(c => c.properties.hubspot_owner_id)
    ].filter(Boolean))];

    // Fetch all unique owners in parallel (batched)
    const ownerResults = await Promise.all(uniqueOwnerIds.map(id => fetchOwnerById(id)));
    const ownerMap = {};
    ownerResults.forEach(o => { if (o) ownerMap[o.id] = o.name; });

    const normalizedDeals = deals.map(d => ({
      id: d.id,
      name: d.properties.dealname || 'Unnamed Deal',
      amount: parseFloat(d.properties.amount || '0') || 0,
      stage: d.properties.dealstage || 'Unknown',
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
