/**
 * Shop identity, in one place.
 *
 * Mirrors web/lib/restaurant.js — the two apps are separate npm projects with no
 * shared package, so this is a deliberate copy rather than an import. If the
 * address or phone changes, both files need it.
 *
 * AboutScreen still hardcodes the same strings inline; it can adopt these.
 */

/** The shop's trading name — what a customer-facing receipt is headed with. */
export const SHOP_NAME = 'بيتزا عزيز';

export const OWNER_INFO = {
    name: 'عزيز (Aziz)',
    phone: '01063411691',
    address: 'الزرقا - خلف مركز الشرطة - امتداد شارع البحر',
};
