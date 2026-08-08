import { Cairo } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const cairo = Cairo({
    variable: '--font-cairo',
    subsets: ['arabic', 'latin'],
    display: 'swap',
});

export const metadata = {
    title: 'بيتزا عزيز',
    description: 'بيتزا لذيذة وأكل شرقي — اطلب أونلاين من بيتزا عزيز بالزرقا',
    icons: { icon: '/favicon.png' },
};

export const viewport = {
    themeColor: '#1A1A2E',
    width: 'device-width',
    initialScale: 1,
};

export default function RootLayout({ children }) {
    return (
        <html lang="ar" dir="rtl" className={`${cairo.variable} h-full antialiased`}>
            <body className="min-h-full font-sans">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
