/**
 * One-off: replace stored plaintext passwords with bcrypt hashes.
 *
 *   node scripts/hashExistingPasswords.js          # report only
 *   node scripts/hashExistingPasswords.js --write  # apply
 *
 * Login also upgrades a row the first time that user signs in, so running this
 * is not strictly required — but it closes the window for accounts that are
 * dormant, and empties the column of readable secrets immediately.
 *
 * Safe to re-run: rows that already hold a hash are skipped.
 */
require('dotenv').config();

const connectDB = require('../src/config/db');
const { userRepository } = require('../src/repositories');
const { hash, isHashed } = require('../src/utils/password');

async function main() {
    const write = process.argv.includes('--write');
    connectDB();

    const users = await userRepository.find({});
    const plaintext = users.filter((u) => u.password && !isHashed(u.password));

    console.log(`${users.length} users — ${plaintext.length} with a plaintext password`);

    if (!plaintext.length) {
        console.log('Nothing to do.');
        return;
    }

    if (!write) {
        for (const user of plaintext) {
            console.log(`  would hash: ${user.phone} (${user.name || 'no name'})`);
        }
        console.log('\nDry run. Re-run with --write to apply.');
        return;
    }

    let done = 0;
    for (const user of plaintext) {
        await userRepository.update({ id: user.id }, { password: await hash(user.password) });
        done += 1;
        console.log(`  hashed: ${user.phone}`);
    }
    console.log(`\nDone — ${done} password(s) hashed.`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Failed:', error.message);
        process.exit(1);
    });
