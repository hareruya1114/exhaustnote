import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: { signIn: '/admin/login' },
});

// /admin と /api/admin を保護。/admin/login はログインページ自身なので除外。
export const config = {
  matcher: ['/admin', '/admin/((?!login).*)', '/api/admin/:path*'],
};
