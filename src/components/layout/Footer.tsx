import { Link } from 'react-router-dom';
import { Cross, Mail, Phone, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Bible Verse Section */}
      <div className="border-b border-primary-foreground/10">
        <div className="container mx-auto px-4 lg:px-8 py-12 text-center">
          <p className="font-serif text-xl md:text-2xl italic max-w-3xl mx-auto opacity-90">
            "For where two or three gather in my name, there am I with them."
          </p>
          <p className="font-sans text-sm mt-4 opacity-70">— Matthew 18:20</p>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Church Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-full bg-secondary">
                <Cross className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold">All Saints' CSI Church</h3>
                <p className="text-xs opacity-70">Thrissur, Kerala</p>
              </div>
            </div>
            <p className="font-sans text-sm opacity-80 leading-relaxed mb-6">
              A welcoming community of faith, serving Thrissur with love, 
              compassion, and the teachings of Christ since our founding.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="p-2 rounded-full bg-primary-foreground/10 hover:bg-secondary hover:text-secondary-foreground transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-primary-foreground/10 hover:bg-secondary hover:text-secondary-foreground transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-primary-foreground/10 hover:bg-secondary hover:text-secondary-foreground transition-all duration-300"
                aria-label="Youtube"
              >
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3 font-sans text-sm">
              {[
                { name: 'About Us', path: '/about' },
                { name: 'Our Services', path: '/services' },
                { name: 'Upcoming Events', path: '/events' },
                { name: 'Photo Gallery', path: '/gallery' },
                { name: 'Contact Us', path: '/contact' },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="opacity-80 hover:opacity-100 hover:text-secondary transition-all duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Times */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-6">Service Times</h4>
            <ul className="space-y-4 font-sans text-sm">
              <li>
                <span className="block text-secondary font-medium">Sunday Worship</span>
                <span className="opacity-80">7:00 AM & 9:30 AM</span>
              </li>
              <li>
                <span className="block text-secondary font-medium">Sunday School</span>
                <span className="opacity-80">9:30 AM</span>
              </li>
              <li>
                <span className="block text-secondary font-medium">Prayer Meeting</span>
                <span className="opacity-80">Wednesday, 6:30 PM</span>
              </li>
              <li>
                <span className="block text-secondary font-medium">Youth Fellowship</span>
                <span className="opacity-80">Saturday, 5:00 PM</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-6">Contact Us</h4>
            <ul className="space-y-4 font-sans text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-secondary flex-shrink-0 mt-0.5" />
                <span className="opacity-80">
                  All Saints' CSI Church,<br />
                  Round North, Thrissur,<br />
                  Kerala, India - 680001
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-secondary flex-shrink-0" />
                <a href="tel:+914872422XXX" className="opacity-80 hover:opacity-100 transition-opacity">
                  +91 487 242 XXXX
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-secondary flex-shrink-0" />
                <a href="mailto:info@allsaintscsithrissur.org" className="opacity-80 hover:opacity-100 transition-opacity">
                  info@allsaintscsithrissur.org
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm opacity-70">
            <p>© {currentYear} All Saints' CSI Church Thrissur. All rights reserved.</p>
            <p className="font-serif italic text-xs">
              "Let all that you do be done in love" — 1 Corinthians 16:14
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
