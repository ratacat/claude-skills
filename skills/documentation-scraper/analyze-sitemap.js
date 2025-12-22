#!/usr/bin/env node
/**
 * Sitemap Analyzer for Documentation Scraping
 *
 * Fetches and analyzes a site's sitemap to help determine optimal slurp parameters.
 * Usage: node analyze-sitemap.js <base-url>
 *
 * Example: node analyze-sitemap.js https://docs.example.com
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

const SITEMAP_PATHS = [
  '/sitemap.xml',
  '/sitemap_index.xml',
  '/docs/sitemap.xml',
  '/en/sitemap.xml',
];

function fetch(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function extractUrls(xml) {
  const urls = [];
  // Match <loc> tags in sitemap
  const locMatches = xml.matchAll(/<loc>\s*(.*?)\s*<\/loc>/gi);
  for (const match of locMatches) {
    urls.push(match[1].trim());
  }
  return urls;
}

function analyzePaths(urls, baseUrl) {
  const base = new URL(baseUrl);
  const sections = {};
  const depths = {};

  for (const url of urls) {
    try {
      const parsed = new URL(url);
      if (parsed.host !== base.host) continue;

      const path = parsed.pathname;
      const parts = path.split('/').filter(Boolean);

      // Count by first path segment (section)
      const section = '/' + (parts[0] || '');
      sections[section] = (sections[section] || 0) + 1;

      // Count by depth
      const depth = parts.length;
      depths[depth] = (depths[depth] || 0) + 1;
    } catch (e) {
      // Skip malformed URLs
    }
  }

  return { sections, depths };
}

function findCommonPrefixes(urls, minCount = 3) {
  const prefixes = {};

  for (const url of urls) {
    try {
      const parsed = new URL(url);
      const parts = parsed.pathname.split('/').filter(Boolean);

      // Build progressive prefixes
      let prefix = '';
      for (let i = 0; i < Math.min(parts.length, 4); i++) {
        prefix += '/' + parts[i];
        prefixes[prefix] = (prefixes[prefix] || 0) + 1;
      }
    } catch (e) {}
  }

  // Filter to significant prefixes
  return Object.entries(prefixes)
    .filter(([_, count]) => count >= minCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);
}

async function checkRobotsTxt(baseUrl) {
  try {
    const robotsUrl = new URL('/robots.txt', baseUrl).href;
    const content = await fetch(robotsUrl);
    const sitemapMatch = content.match(/Sitemap:\s*(.+)/i);
    return sitemapMatch ? sitemapMatch[1].trim() : null;
  } catch (e) {
    return null;
  }
}

async function findSitemap(baseUrl) {
  // Check robots.txt first
  const robotsSitemap = await checkRobotsTxt(baseUrl);
  if (robotsSitemap) {
    try {
      const content = await fetch(robotsSitemap);
      return { url: robotsSitemap, content };
    } catch (e) {}
  }

  // Try common paths
  for (const path of SITEMAP_PATHS) {
    try {
      const url = new URL(path, baseUrl).href;
      const content = await fetch(url);
      if (content.includes('<urlset') || content.includes('<sitemapindex')) {
        return { url, content };
      }
    } catch (e) {}
  }

  return null;
}

async function main() {
  const baseUrl = process.argv[2];

  if (!baseUrl) {
    console.log('Usage: node analyze-sitemap.js <base-url>');
    console.log('Example: node analyze-sitemap.js https://docs.example.com');
    process.exit(1);
  }

  console.log(`\n🔍 Analyzing sitemap for: ${baseUrl}\n`);

  const sitemap = await findSitemap(baseUrl);

  if (!sitemap) {
    console.log('❌ No sitemap found. Checked:');
    console.log('   - robots.txt for Sitemap directive');
    SITEMAP_PATHS.forEach(p => console.log(`   - ${p}`));
    console.log('\n💡 Without a sitemap, try:');
    console.log(`   slurp ${baseUrl} --max 50`);
    console.log('   Then inspect slurp_partials/ to understand structure.\n');
    process.exit(0);
  }

  console.log(`✅ Found sitemap: ${sitemap.url}\n`);

  // Check for sitemap index
  if (sitemap.content.includes('<sitemapindex')) {
    console.log('📑 This is a sitemap index. Child sitemaps:');
    const childUrls = extractUrls(sitemap.content);
    childUrls.slice(0, 10).forEach(u => console.log(`   ${u}`));
    if (childUrls.length > 10) console.log(`   ... and ${childUrls.length - 10} more`);
    console.log('\n💡 Fetch a specific child sitemap for detailed analysis.\n');

    // Try to fetch first child for analysis
    if (childUrls.length > 0) {
      try {
        const childContent = await fetch(childUrls[0]);
        sitemap.content = childContent;
        console.log(`📄 Analyzing first child sitemap: ${childUrls[0]}\n`);
      } catch (e) {
        process.exit(0);
      }
    }
  }

  const urls = extractUrls(sitemap.content);
  console.log(`📊 Total URLs in sitemap: ${urls.length}\n`);

  if (urls.length === 0) {
    console.log('No URLs found in sitemap.');
    process.exit(0);
  }

  const { sections, depths } = analyzePaths(urls, baseUrl);

  console.log('📁 URLs by top-level section:');
  Object.entries(sections)
    .sort((a, b) => b[1] - a[1])
    .forEach(([section, count]) => {
      console.log(`   ${section.padEnd(30)} ${count} pages`);
    });

  console.log('\n📏 URLs by path depth:');
  Object.entries(depths)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .forEach(([depth, count]) => {
      console.log(`   Depth ${depth}: ${count} pages`);
    });

  const prefixes = findCommonPrefixes(urls);
  console.log('\n🎯 Suggested --base-path options:');
  prefixes.slice(0, 8).forEach(([prefix, count]) => {
    const fullPath = new URL(prefix, baseUrl).href;
    console.log(`   ${fullPath.padEnd(50)} (${count} pages)`);
  });

  console.log('\n💡 Recommended slurp commands:\n');

  // Full site recommendation
  if (urls.length <= 50) {
    console.log(`   # Full site (${urls.length} pages - manageable size)`);
    console.log(`   slurp ${baseUrl} --max ${Math.ceil(urls.length * 1.2)}\n`);
  } else {
    console.log(`   # Full site (${urls.length} pages - consider scoping down)`);
    console.log(`   slurp ${baseUrl} --max ${urls.length}\n`);
  }

  // Section-specific recommendations
  if (prefixes.length > 0) {
    const [topPrefix, topCount] = prefixes[0];
    const topPath = new URL(topPrefix, baseUrl).href;
    console.log(`   # Just "${topPrefix}" section (${topCount} pages)`);
    console.log(`   slurp ${topPath} --base-path ${topPath} --max ${Math.ceil(topCount * 1.2)}\n`);
  }

  // Sample URLs for context
  console.log('📝 Sample URLs from sitemap:');
  urls.slice(0, 8).forEach(u => console.log(`   ${u}`));
  if (urls.length > 8) console.log(`   ... and ${urls.length - 8} more\n`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
