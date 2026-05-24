const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let targetUrl = process.argv[2];
if (!targetUrl) {
  console.log('Usage: node package-teams.js <your-selfhosted-url>');
  console.log('Example: node package-teams.js http://172.16.1.61');
  console.log('Defaulting to http://172.16.1.61 for placeholder generation...');
  targetUrl = 'http://172.16.1.61';
}

targetUrl = targetUrl.replace(/\/$/, '');

let domain = '';
try {
  const parsed = new URL(targetUrl);
  domain = parsed.hostname;
} catch (e) {
  domain = targetUrl.split('/')[0].split(':')[0];
  targetUrl = 'http://' + targetUrl;
}

console.log(`Compiling Teams App package for:`);
console.log(`- URL: ${targetUrl}`);
console.log(`- Domain: ${domain}`);

const templatePath = path.join(__dirname, 'manifest.template.json');
const manifestOutputPath = path.join(__dirname, 'manifest.json');
const zipOutputPath = path.join(__dirname, 'learnflow-teams-app.zip');

if (!fs.existsSync(templatePath)) {
  console.error(`Error: manifest.template.json not found at ${templatePath}`);
  process.exit(1);
}

let templateContent = fs.readFileSync(templatePath, 'utf8');
templateContent = templateContent.replace(/\{\{LEARNFLOW_URL\}\}/g, targetUrl);
templateContent = templateContent.replace(/\{\{LEARNFLOW_DOMAIN\}\}/g, domain);

fs.writeFileSync(manifestOutputPath, templateContent, 'utf8');
console.log('✔ Generated manifest.json successfully.');

const tinyPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
const tinyPngBuffer = Buffer.from(tinyPngBase64, 'base64');

const colorIconPath = path.join(__dirname, 'color.png');
const outlineIconPath = path.join(__dirname, 'outline.png');

if (!fs.existsSync(colorIconPath)) {
  fs.writeFileSync(colorIconPath, tinyPngBuffer);
  console.log('✔ Created fallback color.png (1x1 transparent icon)');
}
if (!fs.existsSync(outlineIconPath)) {
  fs.writeFileSync(outlineIconPath, tinyPngBuffer);
  console.log('✔ Created fallback outline.png (1x1 transparent icon)');
}

console.log('Compressing manifest and icons...');
const isWindows = process.platform === 'win32';

try {
  if (fs.existsSync(zipOutputPath)) {
    fs.unlinkSync(zipOutputPath);
  }

  if (isWindows) {
    const cmd = `powershell -Command "Compress-Archive -Path '${manifestOutputPath}', '${colorIconPath}', '${outlineIconPath}' -DestinationPath '${zipOutputPath}' -Force"`;
    execSync(cmd, { stdio: 'inherit' });
  } else {
    const cmd = `zip -j "${zipOutputPath}" "${manifestOutputPath}" "${colorIconPath}" "${outlineIconPath}"`;
    execSync(cmd, { stdio: 'inherit' });
  }
  console.log(`\n🎉 Success! Custom Teams App Package compiled successfully:`);
  console.log(`👉 ${zipOutputPath}`);
} catch (err) {
  console.error('\n❌ Error compressing files:');
  console.error(err.message);
  console.log('\nAlternative: Manually zip the following three files in the "teams-app" directory:');
  console.log('- manifest.json\n- color.png\n- outline.png');
}
