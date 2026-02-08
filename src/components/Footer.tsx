import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="bg-brand-blue text-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand Column */}
                    <div className="col-span-1 md:col-span-2">
                        <h2 className="text-2xl font-bold mb-4">PROMAX EDUCATION</h2>
                        <p className="text-blue-100 max-w-sm">
                            Empowering students to achieve their academic goals through expert preparation for national and international universities.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-brand-orange">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><Link href="/" className="text-blue-100 hover:text-white transition-colors">Home</Link></li>
                            <li><Link href="#about" className="text-blue-100 hover:text-white transition-colors">About Us</Link></li>
                            <li><Link href="#courses" className="text-blue-100 hover:text-white transition-colors">Our Courses</Link></li>
                            <li><Link href="#contact" className="text-blue-100 hover:text-white transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-brand-orange">Contact Us</h3>
                        <ul className="space-y-2 text-blue-100">
                            <li className="flex items-center gap-2">
                                <span>📍</span> Tashkent, Uzbekistan
                            </li>
                            <li className="flex items-center gap-2">
                                <span>📞</span> +998 90 123 45 67
                            </li>
                            <li className="flex items-center gap-2">
                                <span>✉️</span> info@promax.uz
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-blue-700 mt-12 pt-8 text-center text-blue-200 text-sm">
                    © {new Date().getFullYear()} Promax Education Center. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
