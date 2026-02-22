import { Link } from 'react-router-dom';
import { Cross, Mail, Phone, MapPin, Facebook, Youtube } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Church Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-full bg-primary-foreground/15">
                <Cross className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-h4 font-old-english text-primary-foreground">All Saints’ C.S.I. Church</h3>
                <p className="text-xs text-primary-foreground/90">Thrissur, Kerala</p>
              </div>
            </div>
            <p className="font-sans text-sm text-primary-foreground leading-relaxed mb-6">
              A welcoming community of faith, serving Thrissur with love,
              compassion, and the teachings of Christ since our founding.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/share/1RcAhH6dEr/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25 transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://www.youtube.com/@allsaintscsichurchtcr75"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25 transition-all duration-300"
                aria-label="YouTube"
              >
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-h4 mb-6 text-primary-foreground">Quick Links</h4>
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
                    className="text-primary-foreground/90 hover:text-primary-foreground transition-all duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Times */}
          <div>
            <h4 className="text-h4 mb-6 text-primary-foreground">Service Times</h4>
            <ul className="space-y-4 font-sans text-sm">
              <li>
                <span className="block text-primary-foreground font-medium">Sunday — Malayalam Holy Communion</span>
                <span className="text-primary-foreground/90">9:00 AM (1st, 2nd, 3rd & 4th)</span>
              </li>
              <li>
                <span className="block text-primary-foreground font-medium">Sunday — English Holy Communion</span>
                <span className="text-primary-foreground/90">7:30 AM (2nd & 4th)</span>
              </li>
              <li>
                <span className="block text-primary-foreground font-medium">Sunday — Malayalam Matins</span>
                <span className="text-primary-foreground/90">9:00 AM (5th)</span>
              </li>
              <li>
                <span className="block text-primary-foreground font-medium">Friday — Fasting Prayer</span>
                <span className="text-primary-foreground/90">10:30 AM</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-h4 mb-6 text-primary-foreground">Contact Us</h4>
            <ul className="space-y-4 font-sans text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-primary-foreground flex-shrink-0 mt-0.5" />
                <a
                  href="https://maps.app.goo.gl/iYnandY5qSTuWxfr8?g_st=iw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground/90 hover:text-primary-foreground transition-all"
                >
                  All Saints’ CSI Church,<br />
                  Mission Quarters, Thrissur,<br />
                  Kerala, India - 680001
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={18} className="text-primary-foreground flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-primary-foreground font-medium">Mission Quarters</p>
                  <a href="tel:+916282303477" className="block text-primary-foreground/90 hover:text-primary-foreground transition-colors">
                    Office 1: 6282303477
                  </a>
                  <a href="tel:+917994771842" className="block text-primary-foreground/90 hover:text-primary-foreground transition-colors">
                    Office 2: 7994771842
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-primary-foreground flex-shrink-0" />
                <a href="mailto:allsaintscsichurchtcr2020@gmail.com" className="text-primary-foreground/90 hover:text-primary-foreground transition-colors">
                  allsaintscsichurchtcr2020@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/20">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <p className="font-sans font-medium text-white">© {currentYear} All Saints’ CSI Church. All rights reserved.</p>
            <p className="font-serif italic text-center md:text-right text-white">
              "Let all that you do be done in love" — 1 Corinthians 16:14
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
