// Vercel serverless function - fetches HubSpot deals and contacts
// Called by the cron job nightly and directly by the dashboard on load

const HUBSPOT_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const HUBSPOT_BASE = 'https://api.hubapi.com';

async function fetchAllDeals() {
  const deals = [];
    let after = undefined;

      while (true) {
          const url = new URL(`${HUBSPOT_BASE}/crm/v3/objects/deals`);
              url.searchParams.set('limit', '100');
                  url.searchParams.set('properties', 'dealname,amount,dealstage,hubspot_owner_id,hs_deal_stage_probability');
                      url.searchParams.set('associations', 'contacts');
                          if (after) url.searchParams.set('after', after);

                              const res = await fetch(url.toString(), {
                                    headers: { Authorization: `Bearer ${HUBSPOT_TOKEN}` }
                                        });

                                            if (!res.ok) {
                                                  const err = await res.text();
                                                        throw new Error(`HubSpot deals API error ${res.status}: ${err}`);
                                                            }

                                                                const data = await res.json();
                                                                    deals.push(...data.results);

                                                                        if (data.paging?.next?.after) {
                                                                              after = data.paging.next.after;
                                                                                  } else {
                                                                                        break;
                                                                                            }
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

                                                                                                                                        if (!res.ok) {
                                                                                                                                              const err = await res.text();
                                                                                                                                                    throw new Error(`HubSpot contacts API error ${res.status}: ${err}`);
                                                                                                                                                        }

                                                                                                                                                            const data = await res.json();
                                                                                                                                                                contacts.push(...data.results);

                                                                                                                                                                    if (data.paging?.next?.after) {
                                                                                                                                                                          after = data.paging.next.after;
                                                                                                                                                                              } else {
                                                                                                                                                                                    break;
                                                                                                                                                                                        }
                                                                                                                                                                                          }

                                                                                                                                                                                            return contacts;
                                                                                                                                                                                            }

                                                                                                                                                                                            async function fetchOwners() {
                                                                                                                                                                                              const res = await fetch(`${HUBSPOT_BASE}/crm/v3/owners?limit=100`, {
                                                                                                                                                                                                  headers: { Authorization: `Bearer ${HUBSPOT_TOKEN}` }
                                                                                                                                                                                                    });
                                                                                                                                                                                                      if (!res.ok) return [];
                                                                                                                                                                                                        const data = await res.json();
                                                                                                                                                                                                          return data.results || [];
                                                                                                                                                                                                          }

                                                                                                                                                                                                          export default async function handler(req, res) {
                                                                                                                                                                                                            // Allow CORS for the dashboard
                                                                                                                                                                                                              res.setHeader('Access-Control-Allow-Origin', '*');
                                                                                                                                                                                                                res.setHeader('Access-Control-Allow-Methods', 'GET');

                                                                                                                                                                                                                  if (req.method === 'OPTIONS') {
                                                                                                                                                                                                                      return res.status(200).end();
                                                                                                                                                                                                                        }

                                                                                                                                                                                                                          if (!HUBSPOT_TOKEN) {
                                                                                                                                                                                                                              return res.status(500).json({ error: 'HUBSPOT_ACCESS_TOKEN not configured' });
                                                                                                                                                                                                                                }

                                                                                                                                                                                                                                  try {
                                                                                                                                                                                                                                      const [deals, contacts, owners] = await Promise.all([
                                                                                                                                                                                                                                            fetchAllDeals(),
                                                                                                                                                                                                                                                  fetchAllContacts(),
                                                                                                                                                                                                                                                        fetchOwners()
                                                                                                                                                                                                                                                            ]);

                                                                                                                                                                                                                                                                // Build owner lookup map: id -> full name
                                                                                                                                                                                                                                                                    const ownerMap = {};
                                                                                                                                                                                                                                                                        for (const owner of owners) {
                                                                                                                                                                                                                                                                              ownerMap[owner.id] = `${owner.firstName} ${owner.lastName}`.trim();
                                                                                                                                                                                                                                                                                  }

                                                                                                                                                                                                                                                                                      // Normalize deals
                                                                                                                                                                                                                                                                                          const normalizedDeals = deals.map(d => ({
                                                                                                                                                                                                                                                                                                id: d.id,
                                                                                                                                                                                                                                                                                                      name: d.properties.dealname || 'Unnamed Deal',
                                                                                                                                                                                                                                                                                                            amount: parseFloat(d.properties.amount || '0') || 0,
                                                                                                                                                                                                                                                                                                                  stage: d.properties.dealstage || 'Unknown',
                                                                                                                                                                                                                                                                                                                        probability: parseFloat(d.properties.hs_deal_stage_probability || '0') || 0,
                                                                                                                                                                                                                                                                                                                              ownerId: d.properties.hubspot_owner_id || null,
                                                                                                                                                                                                                                                                                                                                    ownerName: ownerMap[d.properties.hubspot_owner_id] || 'Unknown'
                                                                                                                                                                                                                                                                                                                                        }));

                                                                                                                                                                                                                                                                                                                                            // Normalize contacts
                                                                                                                                                                                                                                                                                                                                                const normalizedContacts = contacts.map(c => ({
                                                                                                                                                                                                                                                                                                                                                      id: c.id,
                                                                                                                                                                                                                                                                                                                                                            name: `${c.properties.firstname || ''} ${c.properties.lastname || ''}`.trim() || 'Unknown',
                                                                                                                                                                                                                                                                                                                                                                  company: c.properties.company || '',
                                                                                                                                                                                                                                                                                                                                                                        title: c.properties.jobtitle || '',
                                                                                                                                                                                                                                                                                                                                                                              status: c.properties.hs_lead_status || 'Unknown',
                                                                                                                                                                                                                                                                                                                                                                                    ownerId: c.properties.hubspot_owner_id || null,
                                                                                                                                                                                                                                                                                                                                                                                          ownerName: ownerMap[c.properties.hubspot_owner_id] || 'Unknown'
                                                                                                                                                                                                                                                                                                                                                                                              }));

                                                                                                                                                                                                                                                                                                                                                                                                  const payload = {
                                                                                                                                                                                                                                                                                                                                                                                                        deals: normalizedDeals,
                                                                                                                                                                                                                                                                                                                                                                                                              contacts: normalizedContacts,
                                                                                                                                                                                                                                                                                                                                                                                                                    owners: Object.entries(ownerMap).map(([id, name]) => ({ id, name })),
                                                                                                                                                                                                                                                                                                                                                                                                                          lastUpdated: new Date().toISOString(),
                                                                                                                                                                                                                                                                                                                                                                                                                                totalDeals: normalizedDeals.length,
                                                                                                                                                                                                                                                                                                                                                                                                                                      totalContacts: normalizedContacts.length
                                                                                                                                                                                                                                                                                                                                                                                                                                          };

                                                                                                                                                                                                                                                                                                                                                                                                                                              // Cache for 1 hour (but cron refreshes nightly)
                                                                                                                                                                                                                                                                                                                                                                                                                                                  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
                                                                                                                                                                                                                                                                                                                                                                                                                                                      return res.status(200).json(payload);

                                                                                                                                                                                                                                                                                                                                                                                                                                                        } catch (error) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                            console.error('HubSpot API Error:', error.message);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                return res.status(500).json({ error: error.message });
                                                                                                                                                                                                                                                                                                                                                                                                                                                                  }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                  }