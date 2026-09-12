import Logo from '@/components/Logo';
import { MapPin, Phone, Clock, Mail, Instagram, Facebook, MessageCircle, Utensils } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="animate-fade-in pb-28 md:pb-12 touch-pan-y">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-4">
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-cream-50 mb-1">Get in Touch</h1>
        <p className="text-charcoal-400 text-sm mb-6">We'd love to hear from you</p>

        {/* Logo & tagline */}
        <div className="bg-charcoal-800 rounded-2xl p-6 border border-charcoal-700/30 mb-4 text-center">
          <div className="flex justify-center mb-3">
            <Logo size="lg" />
          </div>
          <p className="font-display text-cream-400 text-xl">Good Food. Good Mood.</p>
        </div>

        {/* Contact cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <a
            href="tel:+918544723922"
            className="bg-charcoal-800 rounded-2xl p-5 border border-charcoal-700/30 hover:border-cream-400/30 transition-all duration-200 group"
          >
            <div className="w-11 h-11 rounded-xl bg-cream-400/10 flex items-center justify-center mb-3 group-hover:bg-cream-400/20 transition-colors">
              <Phone size={22} className="text-cream-400" />
            </div>
            <h3 className="font-heading font-semibold text-cream-50 text-base mb-1">Call Us</h3>
            <p className="text-charcoal-300 text-sm">+91 85447 23922</p>
          </a>

          <a
            href="mailto:bhukkadcafeofficial@gmail.com"
            className="bg-charcoal-800 rounded-2xl p-5 border border-charcoal-700/30 hover:border-cream-400/30 transition-all duration-200 group"
          >
            <div className="w-11 h-11 rounded-xl bg-cream-400/10 flex items-center justify-center mb-3 group-hover:bg-cream-400/20 transition-colors">
              <Mail size={22} className="text-cream-400" />
            </div>
            <h3 className="font-heading font-semibold text-cream-50 text-base mb-1">Email Us</h3>
            <p className="text-charcoal-300 text-sm">bhukkadcafeofficial@gmail.com</p>
          </a>
        </div>

        {/* Location & hours */}
        <div className="bg-charcoal-800 rounded-2xl p-5 border border-charcoal-700/30 mb-4">
          <div className="flex items-start gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-cream-400/10 flex items-center justify-center flex-shrink-0">
              <MapPin size={22} className="text-cream-400" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-cream-50 text-base mb-1">Visit Our Cafe</h3>
              <p className="text-charcoal-300 text-sm leading-relaxed">
                Paraw, area main bazar kandaghat.<br />
                Kandaghat, Himachal Pradesh, India
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-cream-400/10 flex items-center justify-center flex-shrink-0">
              <Clock size={22} className="text-cream-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-heading font-semibold text-cream-50 text-base mb-1">Opening Hours</h3>
              <div className="text-charcoal-300 text-sm">
                Monday - Sunday: 10 AM - 11 PM
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-cream-400/10 flex items-center justify-center flex-shrink-0">
              <Utensils size={22} className="text-cream-400" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-cream-50 text-base mb-1">Order Options</h3>
              <p className="text-charcoal-300 text-sm">
                Dine In, Takeaway & Online Delivery
              </p>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="bg-charcoal-800 rounded-2xl overflow-hidden border border-charcoal-700/30 mb-4">
          <div className="aspect-[16/9] relative">
            <iframe
              title="Bhukkad Cafe Location"
              src="https://www.openstreetmap.org/export/embed.html?bbox=76.0,27.0,76.1,27.1&layer=mapnik"
              className="w-full h-full grayscale opacity-70"
              loading="lazy"
            />
          </div>
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-2 text-charcoal-300 text-xs sm:text-sm min-w-0">
              <MapPin size={16} className="text-cream-400 flex-shrink-0 mt-0.5 sm:mt-0" />
              <span className="break-words">Paraw, area main bazar kandaghat. Kandaghat, Himachal Pradesh</span>
            </div>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Paraw+area+main+bazar+kandaghat+Kandaghat+Himachal+Pradesh"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cream-400 text-xs sm:text-sm font-medium hover:text-cream-300 transition-colors flex-shrink-0"
            >
              Get Directions →
            </a>
          </div>
        </div>

        {/* Social */}
        <div className="bg-charcoal-800 rounded-2xl p-5 border border-charcoal-700/30">
          <h3 className="font-heading font-semibold text-cream-50 text-base mb-3 text-center">Follow Us</h3>
          <div className="flex items-center justify-center gap-4">
            <a
              href="#"
              className="w-11 h-11 rounded-full bg-charcoal-700 flex items-center justify-center text-charcoal-300 hover:bg-cream-400 hover:text-charcoal-900 transition-all duration-200"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
            <a
              href="#"
              className="w-11 h-11 rounded-full bg-charcoal-700 flex items-center justify-center text-charcoal-300 hover:bg-cream-400 hover:text-charcoal-900 transition-all duration-200"
              aria-label="Facebook"
            >
              <Facebook size={20} />
            </a>
            <a
              href="https://wa.me/918544723922"
              className="w-11 h-11 rounded-full bg-charcoal-700 flex items-center justify-center text-charcoal-300 hover:bg-cream-400 hover:text-charcoal-900 transition-all duration-200"
              aria-label="WhatsApp"
            >
              <MessageCircle size={20} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
