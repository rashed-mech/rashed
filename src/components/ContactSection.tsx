import React, { useState } from 'react';
import { Mail, Linkedin, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Profile } from '../types';
import { submitContactMessage } from '../api';

interface ContactSectionProps {
  profile: Profile;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ profile }) => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await submitContactMessage(formData);
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      setSubmitError('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative py-12 sm:py-16 border-t border-slate-200/80 dark:border-slate-800/80" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="space-y-2 mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
            Get in Touch &amp; Collaborate
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-normal leading-relaxed w-full max-w-none">
            Have a project, research inquiry, or technical challenge? Let&apos;s connect to discuss fluid analysis, thermo-fluid simulation, clean hydrogen energy, or mechanical engineering integration.
          </p>
        </div>

        {/* Contact Form & CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl p-6 md:p-8 flex flex-col justify-between shadow-xl border border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-mono font-semibold text-blue-400 mb-4">
                <span>OPEN FOR COLLABORATION</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Ready to collaborate &amp; build?
              </h3>
              <p className="text-slate-300 text-sm mb-8 leading-relaxed text-justify">
                Let&apos;s connect to discuss fluid analysis, mechanical design, renewable microgrid optimization, or your next complex engineering integration.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-800">
              <a 
                href={`mailto:${profile.email}`}
                className="inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-ibm text-xs font-bold uppercase tracking-widest transition-colors shadow-lg shadow-blue-600/20 cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Email Directly</span>
              </a>
              {profile.social?.linkedin && (
                <a 
                  href={profile.social.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-ibm text-xs font-bold uppercase tracking-widest transition-colors border border-slate-700 cursor-pointer"
                >
                  <Linkedin className="w-4 h-4" />
                  <span>LinkedIn</span>
                </a>
              )}
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200/80 dark:border-slate-800/80">
            <h3 className="text-xl font-space font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              Send a Message
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-xs font-ibm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Name</label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-sans text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-ibm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-sans text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label htmlFor="subject" className="text-xs font-ibm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Subject</label>
                <input
                  type="text"
                  id="subject"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-sans text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
                  placeholder="What is this regarding?"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="message" className="text-xs font-ibm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Message</label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-sans text-sm resize-none text-slate-900 dark:text-white placeholder:text-slate-400"
                  placeholder="Write your message here..."
                ></textarea>
              </div>

              {submitError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-center gap-2 border border-red-200 dark:border-red-800/50">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {submitError}
                </div>
              )}

              {submitSuccess && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl text-sm flex items-center gap-2 border border-blue-200 dark:border-blue-800/50">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  Message transmitted successfully.
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-ibm text-xs font-bold uppercase tracking-widest transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-md shadow-blue-600/20 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 dark:border-white/30 border-t-white dark:border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{isSubmitting ? 'Transmitting...' : 'Send Message'}</span>
              </button>
            </form>
          </div>
        </div>

      </div>
    </section>
  );
};

