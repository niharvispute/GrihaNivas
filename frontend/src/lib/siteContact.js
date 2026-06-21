// Single source of truth for company NAP (Name / Address / Phone) details.
// Keep this in sync with Google Business Profile and RERA records.
export const SITE_CONTACT = {
  addressLines: ['Heera Panna Shopping Complex,', 'Powai Hiranandani Garden, Mumbai – 400076'],
  addressOneLine: 'Heera Panna Shopping Complex, Powai Hiranandani Garden, Mumbai – 400076',
  phoneDisplay: '+91 91379 50050',
  phoneHref: 'tel:+919137950050',
  email: 'contact@grihanivas.in',
  rera: 'A51700000043',
  hours: [
    { day: 'Mon - Fri', time: '09:00 AM - 07:00 PM' },
    { day: 'Saturday', time: '10:00 AM - 05:00 PM' },
    { day: 'Sunday', time: 'By Appointment', special: true },
  ],
};
