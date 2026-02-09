import fs from 'fs';
import path from 'path';
import config from '../config/config.js';

/**
 * Create a backup of the SQLite database
 * @returns {Promise<object>} Backup info
 */
export async function createBackup() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `erp-backup-${timestamp}.db`;
    const backupPath = path.join(config.paths.backups, backupFileName);

    // Ensure backup directory exists
    if (!fs.existsSync(config.paths.backups)) {
      fs.mkdirSync(config.paths.backups, { recursive: true });
    }

    // Copy database file to backup location
    fs.copyFileSync(config.database.storage, backupPath);

    // Get file size
    const stats = fs.statSync(backupPath);
    const fileSizeInBytes = stats.size;
    const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);

    console.log(`✓ Backup created: ${backupFileName} (${fileSizeInMB} MB)`);

    return {
      success: true,
      fileName: backupFileName,
      filePath: backupPath,
      size: fileSizeInBytes,
      sizeFormatted: `${fileSizeInMB} MB`,
      createdAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Backup failed:', error);
    throw new Error(`Backup failed: ${error.message}`);
  }
}

/**
 * List all available backups
 * @returns {Array} List of backup files
 */
export function listBackups() {
  try {
    if (!fs.existsSync(config.paths.backups)) {
      return [];
    }

    const files = fs.readdirSync(config.paths.backups);
    const backups = files
      .filter(file => file.endsWith('.db'))
      .map(file => {
        const filePath = path.join(config.paths.backups, file);
        const stats = fs.statSync(filePath);

        return {
          fileName: file,
          filePath,
          size: stats.size,
          sizeFormatted: `${(stats.size / (1024 * 1024)).toFixed(2)} MB`,
          createdAt: stats.birthtime
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt); // Most recent first

    return backups;

  } catch (error) {
    console.error('List backups failed:', error);
    return [];
  }
}

/**
 * Restore database from backup
 * @param {string} backupFileName - Name of backup file
 * @returns {Promise<object>} Restore result
 */
export async function restoreBackup(backupFileName) {
  try {
    const backupPath = path.join(config.paths.backups, backupFileName);

    // Check if backup file exists
    if (!fs.existsSync(backupPath)) {
      throw new Error('Backup file not found');
    }

    // Create a backup of current database before restoring
    const currentBackupName = `pre-restore-${new Date().toISOString().replace(/[:.]/g, '-')}.db`;
    const currentBackupPath = path.join(config.paths.backups, currentBackupName);
    fs.copyFileSync(config.database.storage, currentBackupPath);

    // Restore the backup
    fs.copyFileSync(backupPath, config.database.storage);

    console.log(`✓ Database restored from: ${backupFileName}`);
    console.log(`✓ Previous database saved as: ${currentBackupName}`);

    return {
      success: true,
      message: 'Database restored successfully',
      restoredFrom: backupFileName,
      previousBackup: currentBackupName
    };

  } catch (error) {
    console.error('Restore failed:', error);
    throw new Error(`Restore failed: ${error.message}`);
  }
}

/**
 * Delete old backups (keep only last N backups)
 * @param {number} keepCount - Number of backups to keep
 */
export function cleanOldBackups(keepCount = 30) {
  try {
    const backups = listBackups();

    if (backups.length <= keepCount) {
      return { deleted: 0, kept: backups.length };
    }

    // Delete old backups
    const toDelete = backups.slice(keepCount);
    let deleted = 0;

    toDelete.forEach(backup => {
      // Don't delete pre-restore backups
      if (!backup.fileName.startsWith('pre-restore-')) {
        fs.unlinkSync(backup.filePath);
        deleted++;
      }
    });

    console.log(`✓ Cleaned ${deleted} old backup(s)`);

    return { deleted, kept: backups.length - deleted };

  } catch (error) {
    console.error('Clean backups failed:', error);
    return { deleted: 0, kept: 0 };
  }
}

export default {
  createBackup,
  listBackups,
  restoreBackup,
  cleanOldBackups
};
