// Vercel Cron Job - runs at 07:00 UTC (midnight Pacific) every night
// Configured in vercel.json: schedule 0 7 * * *

export default async function handler(req, res) {
  try {
      const baseUrl = process.env.VERCEL_URL
            ? 'https://' + process.env.VERCEL_URL
                  : 'https://temeka-dashboard.vercel.app';

                      const response = await fetch(baseUrl + '/api/hubspot-data', {
                            headers: { 'User-Agent': 'Vercel-Cron/1.0' }
                                });

                                    if (!response.ok) {
                                          const errorText = await response.text();
                                                console.error('Cron refresh failed: ' + response.status + ' - ' + errorText);
                                                      return res.status(500).json({
                                                              success: false,
                                                                      error: 'HubSpot data fetch failed: ' + response.status,
                                                                              timestamp: new Date().toISOString()
                                                                                    });
                                                                                        }

                                                                                            const data = await response.json();
                                                                                                console.log('Cron refresh success at ' + new Date().toISOString() + ': ' + data.totalDeals + ' deals, ' + data.totalContacts + ' contacts');

                                                                                                    return res.status(200).json({
                                                                                                          success: true,
                                                                                                                timestamp: new Date().toISOString(),
                                                                                                                      lastUpdated: data.lastUpdated,
                                                                                                                            totalDeals: data.totalDeals,
                                                                                                                                  totalContacts: data.totalContacts,
                                                                                                                                        message: 'Dashboard data refreshed successfully'
                                                                                                                                            });

                                                                                                                                              } catch (error) {
                                                                                                                                                  console.error('Cron refresh error:', error.message);
                                                                                                                                                      return res.status(500).json({
                                                                                                                                                            success: false,
                                                                                                                                                                  error: error.message,
                                                                                                                                                                        timestamp: new Date().toISOString()
                                                                                                                                                                            });
                                                                                                                                                                              }
                                                                                                                                                                              }