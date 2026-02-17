import { Link } from 'react-router-dom';
import { Cross, Mail, Phone, MapPin, Facebook, Youtube } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Bible Verse Section */}
      <div className="border-b border-primary-foreground/10">
        <div className="container mx-auto px-4 lg:px-8 py-12 text-center">
          <p className="font-serif text-xl md:text-2xl italic max-w-3xl mx-auto opacity-90">
            "God is Spirit, and those who worship Him must worship in spirit and truth."
          </p>
          <p className="font-sans text-sm mt-4 opacity-70">— John 4:24</p>
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
                <h3 className="font-serif text-lg font-semibold">All Saints’ CSI Church</h3>
                <p className="text-xs opacity-70">Thrissur, Kerala</p>
              </div>
            </div>
            <p className="font-sans text-sm opacity-80 leading-relaxed mb-6">
              A welcoming community of faith, serving Thrissur with love,
              compassion, and the teachings of Christ since our founding.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/share/1RcAhH6dEr/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-primary-foreground/10 hover:bg-secondary hover:text-secondary-foreground transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://www.youtube.com/@allsaintscsichurchtcr75"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-primary-foreground/10 hover:bg-secondary hover:text-secondary-foreground transition-all duration-300"
                aria-label="YouTube"
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
                <span className="block text-secondary font-medium">Sunday — Malayalam Holy Communion</span>
                <span className="opacity-80">9:00 AM (1st, 2nd, 3rd & 4th)</span>
              </li>
              <li>
                <span className="block text-secondary font-medium">Sunday — English Holy Communion</span>
                <span className="opacity-80">7:30 AM (2nd & 4th)</span>
              </li>
              <li>
                <span className="block text-secondary font-medium">Sunday — Malayalam Matins</span>
                <span className="opacity-80">9:00 AM (5th)</span>
              </li>
              <li>
                <span className="block text-secondary font-medium">Friday — Fasting Prayer</span>
                <span className="opacity-80">10:30 AM</span>
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
                  All Saints’ CSI Church,<br />
                  Round North, Thrissur,<br />
                  Kerala, India - 680001
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={18} className="text-secondary flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-secondary font-medium">Mission Quarters</p>
                  <a href="tel:+916282303477" className="block opacity-80 hover:opacity-100 hover:text-primary transition-colors">
                    Office 1: 6282303477
                  </a>
                  <a href="tel:+917994771842" className="block opacity-80 hover:opacity-100 hover:text-primary transition-colors">
                    Office 2: 7994771842
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-secondary flex-shrink-0" />
                <a href="mailto:allsaintscsichurchtcr2020@gmail.com" className="opacity-80 hover:opacity-100 transition-opacity">
                  allsaintscsichurchtcr2020@gmail.com
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
            <p>© {currentYear} All Saints’ CSI Church. All rights reserved.</p>
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
