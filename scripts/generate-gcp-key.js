const fs = require('fs');
const key = process.env.GCP_VISION_KEY;
if (key) {
  fs.writeFileSync('gcp-vision-key.json', key);
}
