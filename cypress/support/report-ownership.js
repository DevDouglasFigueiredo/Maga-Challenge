const fs = require('node:fs/promises');
const path = require('node:path');

async function changeOwnership(directory, uid, gid) {
  let entries;
  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') return;
    throw error;
  }

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await changeOwnership(entryPath, uid, gid);
    } else {
      await fs.lchown(entryPath, uid, gid);
    }
  }
  await fs.chown(directory, uid, gid);
}

async function restoreReportOwnership(config) {
  if (process.platform !== 'linux' || process.getuid() !== 0) return;

  const reportDir = path.resolve(config.projectRoot, config.reporterOptions.reportDir);
  const artifactsDir = path.dirname(reportDir);
  let owner;
  try {
    owner = await fs.stat(artifactsDir);
  } catch (error) {
    if (error.code === 'ENOENT') return;
    throw error;
  }

  try {
    owner = await fs.stat(path.join(config.projectRoot, 'cypress.env.json'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  if (owner.uid === 0 && owner.gid === process.getgid()) return;

  await changeOwnership(reportDir, owner.uid, owner.gid);
  await fs.chown(artifactsDir, owner.uid, owner.gid);
}

module.exports = { restoreReportOwnership };
