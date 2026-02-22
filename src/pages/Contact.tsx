import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ScrollReveal from '@/components/common/ScrollReveal';
import SectionTitle from '@/components/common/SectionTitle';
import ChurchButton from '@/components/common/ChurchButton';

import stainedGlass from '@/assets/stained-glass.jpg';

// Formspree form ID – create a form at https://formspree.io and set the email to your church address.
// Add VITE_FORMSPREE_ID=your_form_id to .env to send messages to your email.
const FORMSPREE_ID = import.meta.env.VITE_FORMSPREE_ID || '';

const Contact = () => {
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('sending');

    if (FORMSPREE_ID) {
      try {
        const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            subject: formData.subject,
            message: formData.message,
          }),
        });
        if (res.ok) {
          setFormStatus('sent');
          setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
          setTimeout(() => setFormStatus('idle'), 5000);
        } else {
          setFormStatus('error');
          setTimeout(() => setFormStatus('idle'), 4000);
        }
      } catch {
        setFormStatus('error');
        setTimeout(() => setFormStatus('idle'), 4000);
      }
    } else {
      // No Formspree ID: simulate for demo
      await new Promise(resolve => setTimeout(resolve, 1500));
      setFormStatus('sent');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setFormStatus('idle'), 3000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const contactInfo: Array<{
    icon: React.ReactNode;
    title: string;
    lines: string[];
    links?: string[];
  }> = [
      {
        icon: <MapPin size={24} />,
        title: 'Address',
        lines: ['All Saints’ CSI Church', 'Mission Quarters, Thrissur', 'Kerala, India - 680001'],
        links: ['https://maps.app.goo.gl/iYnandY5qSTuWxfr8?g_st=iw'],
      },
      {
        icon: <Phone size={24} />,
        title: 'Phone',
        lines: ['Office 1: 6282303477', 'Office 2: 7994771842'],
        links: ['tel:+916282303477', 'tel:+917994771842'],
      },
      {
        icon: <Mail size={24} />,
        title: 'Email',
        lines: ['allsaintscsichurchtcr2020@gmail.com'],
        links: ['mailto:allsaintscsichurchtcr2020@gmail.com'],
      },
      {
        icon: <Clock size={24} />,
        title: 'Office Hours',
        lines: ['Monday - Saturday', '9:00 AM - 5:00 PM'],
      },
    ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 bg-primary overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src={stainedGlass} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <SectionTitle
              title="Contact Us"
              subtitle="We'd love to hear from you. Reach out with any questions or prayer requests."
              light
            />
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <ScrollReveal key={index} delay={index * 0.1}>
                <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50 text-center h-full">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary mb-4">
                    {info.icon}
                  </div>
                  <h3 className="text-h4 text-foreground mb-3 font-serif font-bold">
                    {info.title}
                  </h3>
                  <div className="space-y-2 font-sans text-sm text-foreground">
                    {info.title === 'Phone' && (
                      <p className="font-medium uppercase tracking-wide">Mission Quarters</p>
                    )}
                    {info.lines.map((line, i) => {
                      const isChurchName = line === 'All Saints’ CSI Church' || line === 'All Saints’ C.S.I. Church';
                      const lineContent = isChurchName ? (
                        <span className="font-old-english block">{line}</span>
                      ) : (
                        line
                      );

                      return info.links?.[i] ? (
                        <a
                          key={i}
                          href={info.links[i]}
                          className="text-foreground hover:text-primary hover:underline transition-colors block"
                        >
                          {lineContent}
                        </a>
                      ) : (
                        <p key={i} className={isChurchName ? 'font-normal' : ''}>
                          {lineContent}
                        </p>
                      );
                    })}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <ScrollReveal direction="left">
              <div className="bg-card rounded-2xl p-8 shadow-card border border-border/50">
                <h2 className="text-h2 text-foreground mb-6">
                  Send Us a Message
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all peer"
                        placeholder=" "
                      />
                      <label className="absolute left-4 top-3 text-muted-foreground transition-all peer-placeholder-shown:top-3 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-primary peer-focus:bg-card peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-card peer-[:not(:placeholder-shown)]:px-1">
                        Your Name *
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all peer"
                        placeholder=" "
                      />
                      <label className="absolute left-4 top-3 text-muted-foreground transition-all peer-placeholder-shown:top-3 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-primary peer-focus:bg-card peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-card peer-[:not(:placeholder-shown)]:px-1">
                        Email Address *
                      </label>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all peer"
                        placeholder=" "
                      />
                      <label className="absolute left-4 top-3 text-muted-foreground transition-all peer-placeholder-shown:top-3 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-primary peer-focus:bg-card peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-card peer-[:not(:placeholder-shown)]:px-1">
                        Phone Number
                      </label>
                    </div>
                    <div className="relative">
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                      >
                        <option value="">Select Subject *</option>
                        <option value="general">General Inquiry</option>
                        <option value="prayer">Prayer Request</option>
                        <option value="visit">Planning a Visit</option>
                        <option value="baptism">Baptism</option>
                        <option value="wedding">Wedding</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="relative">
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none peer"
                      placeholder=" "
                    />
                    <label className="absolute left-4 top-3 text-muted-foreground transition-all peer-placeholder-shown:top-3 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-primary peer-focus:bg-card peer-focus:px-1 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-card peer-[:not(:placeholder-shown)]:px-1">
                      Your Message *
                    </label>
                  </div>

                  <ChurchButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={formStatus === 'sending'}
                    className="w-full"
                    icon={
                      formStatus === 'sent' ? (
                        <CheckCircle size={20} />
                      ) : formStatus === 'sending' ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <Send size={20} />
                        </motion.div>
                      ) : (
                        <Send size={20} />
                      )
                    }
                  >
                    {formStatus === 'sent'
                      ? 'Message Sent!'
                      : formStatus === 'sending'
                        ? 'Sending...'
                        : 'Send Message'}
                  </ChurchButton>
                </form>

                {formStatus === 'sent' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-accent/20 rounded-xl text-center"
                  >
                    <p className="font-sans text-accent text-sm">
                      Thank you for your message! We'll get back to you soon.
                    </p>
                  </motion.div>
                )}
                {formStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-destructive/15 rounded-xl text-center"
                  >
                    <p className="font-sans text-destructive text-sm">
                      Something went wrong. Please try again or email us directly.
                    </p>
                  </motion.div>
                )}
              </div>
            </ScrollReveal>

            {/* Map */}
            <div className="bg-card rounded-2xl overflow-hidden shadow-card border border-border/50 h-full min-h-[400px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3922.839278!2d76.2199091!3d10.5147743!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba7ee3431dfade1%3A0xc33238453af6babb!2sAll%20Saints%27%20CSI%20Church%20Thrissur!5e0!3m2!1sen!2sin!4v1740065000000"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="All Saints’ CSI Church Location"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-24 bg-primary">
        <div className="container mx-auto px-4 lg:px-8">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-h2 text-primary-foreground italic leading-relaxed">
                "Ask and it will be given to you; seek and you will find;
                knock and the door will be opened to you."
              </p>
              <p className="font-sans text-secondary mt-6">
                — Matthew 7:7
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
