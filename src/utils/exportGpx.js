/**
 * Generates a GPX 1.1 file from an array of campsite objects.
 * Compatible with OsmAnd, Garmin, Google Maps import, Maps.me, etc.
 */
export function generateGpx(campsites, options = {}) {
  const {
    name = 'KenyaMotocamp Trip',
    description = 'Campsites exported from KenyaMotocamp',
  } = options;

  const now = new Date().toISOString();

  function escapeXml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  const waypoints = campsites
    .filter(s => s.lat && s.lng)
    .map(s => {
      const desc = [
        s.description,
        s.fee ? `Fee: ${s.fee}` : '',
        s.access ? `Access: ${s.access}` : '',
        s.region ? `Region: ${s.region}, ${s.county}` : '',
        s.sources?.length ? `Featured by: ${s.sources.join(', ')}` : '',
      ].filter(Boolean).join('\n');

      return `  <wpt lat="${s.lat}" lon="${s.lng}">
    <name>${escapeXml(s.name)}</name>
    <desc>${escapeXml(desc)}</desc>
    <type>Campsite</type>
    <sym>Campground</sym>
  </wpt>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1"
  creator="KenyaMotocamp — https://kenya-motocamp.web.app"
  xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${escapeXml(name)}</name>
    <desc>${escapeXml(description)}</desc>
    <time>${now}</time>
    <keywords>kenya, motocamping, camping, adventure</keywords>
  </metadata>
${waypoints}
</gpx>`;
}

/**
 * Triggers a GPX file download in the browser.
 */
export function downloadGpx(campsites, filename = 'motocamp-trip.gpx', options = {}) {
  const gpx = generateGpx(campsites, options);
  const blob = new Blob([gpx], { type: 'application/gpx+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
