/**
 * Strip the password hash before a user row leaves the API.
 *
 * Repositories deliberately return whole rows so auth can read the hash; every
 * path that hands a user back to a client runs it through here first.
 */
function sanitizeUser(user) {
    if (!user || typeof user !== 'object') return user;
    const { password, ...safe } = user;
    return safe;
}

const sanitizeUsers = (users) => (Array.isArray(users) ? users.map(sanitizeUser) : users);

module.exports = { sanitizeUser, sanitizeUsers };
