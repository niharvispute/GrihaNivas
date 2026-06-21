export const metadata = {
  title: 'Account Access',
  description:
    'Log in or create your GrihaNivas account to save properties, track enquiries, and manage your listings.',
  // Login should not be indexed by search engines.
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }) {
  return children;
}
