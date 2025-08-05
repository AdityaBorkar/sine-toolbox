#!/usr/bin/env node

/**
 * Bump package versions using semver
 */

const fs = require('fs');
const path = require('path');

// Simple semver increment without external dependencies
function incrementVersion(version, bumpType) {
  const parts = version.split('.').map(Number);
  const [major, minor, patch] = parts;
  
  switch (bumpType) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      throw new Error(`Invalid bump type: ${bumpType}`);
  }
}

function updatePackageVersion(packagePath, newVersion) {
  const packageJsonPath = path.join(packagePath, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error(`package.json not found at: ${packageJsonPath}`);
  }
  
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const oldVersion = pkg.version;
  
  console.log(`📦 ${pkg.name}: ${oldVersion} → ${newVersion}`);
  
  pkg.version = newVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n');
  
  return { name: pkg.name, oldVersion, newVersion };
}

function setGitHubOutput(key, value) {
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
    console.log(`ℹ️  Set output: ${key}=${value}`);
  } else {
    console.log(`${key}=${value}`);
  }
}

function main() {
  const bumpType = process.argv[2];
  
  if (!bumpType || !['patch', 'minor', 'major'].includes(bumpType)) {
    console.error('❌ Usage: bump-versions.js <patch|minor|major>');
    process.exit(1);
  }
  
  console.log(`🚀 Bumping versions with type: ${bumpType}`);
  
  const packagesDir = path.join(process.cwd(), 'packages');
  const sineToolboxPath = path.join(packagesDir, 'sine-toolbox');
  const createSineModPath = path.join(packagesDir, 'create-sine-mod');
  
  try {
    // Get current versions
    const sinePackage = JSON.parse(fs.readFileSync(path.join(sineToolboxPath, 'package.json'), 'utf8'));
    const createPackage = JSON.parse(fs.readFileSync(path.join(createSineModPath, 'package.json'), 'utf8'));
    
    // Calculate new versions
    const newSineVersion = incrementVersion(sinePackage.version, bumpType);
    const newCreateVersion = incrementVersion(createPackage.version, bumpType);
    
    // Update packages
    updatePackageVersion(sineToolboxPath, newSineVersion);
    updatePackageVersion(createSineModPath, newCreateVersion);
    
    // Set outputs for GitHub Actions
    setGitHubOutput('sine_version', newSineVersion);
    setGitHubOutput('create_version', newCreateVersion);
    setGitHubOutput('release_date', new Date().toISOString().split('T')[0]);
    setGitHubOutput('bump_type', bumpType);
    
    console.log('✅ Version bump completed successfully');
    
  } catch (error) {
    console.error('❌ Error bumping versions:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { incrementVersion, updatePackageVersion };