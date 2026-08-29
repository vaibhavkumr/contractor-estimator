import Link from 'next/link'
import { CheckCircle, Zap, FileText, DollarSign, Clock, Shield, ChevronRight, Star } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">QuoteKit</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 text-sm">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 text-sm">Pricing</a>
            <a href="#testimonials" className="text-gray-600 hover:text-gray-900 text-sm">Reviews</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
              Sign in
            </Link>
            <Link href="/signup" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              Start free trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-20 pb-24 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Zap className="w-4 h-4" />
            AI-powered estimates in 60 seconds
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Stop losing jobs because
            <span className="text-blue-600"> your quote took too long</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            QuoteKit uses AI to generate detailed, professional cost estimates for plumbers, electricians, and HVAC companies in under a minute. Win more jobs, get paid faster.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors flex items-center justify-center gap-2">
              Get your first quote free
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="w-full sm:w-auto border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold px-8 py-4 rounded-xl text-lg transition-colors">
              See a demo estimate
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">No credit card required · 14-day free trial</p>
        </div>
      </section>

      {/* Social proof strip */}
      <section className="border-y border-gray-100 py-8 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500 font-medium">
          <span>⭐️ Rated 4.9/5 by 200+ contractors</span>
          <span>📋 50,000+ estimates generated</span>
          <span>💰 Avg. $12,000 more revenue per month</span>
          <span>⚡️ 60 seconds average estimate time</span>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything you need to quote and win more jobs</h2>
            <p className="text-xl text-gray-600">From first contact to signed contract, QuoteKit handles the paperwork.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-6 h-6 text-blue-600" />,
                title: 'AI Estimate Generation',
                desc: 'Describe the job, pick your trade, and get a detailed line-item estimate with labor and materials broken down. Takes less than 60 seconds.',
              },
              {
                icon: <FileText className="w-6 h-6 text-blue-600" />,
                title: 'Professional PDF Quotes',
                desc: 'Send clients a branded PDF quote with your logo, license number, and payment terms. Looks like it came from a Fortune 500 company.',
              },
              {
                icon: <DollarSign className="w-6 h-6 text-blue-600" />,
                title: 'Accurate Pricing',
                desc: 'Prices are calibrated by trade type and location. No more guessing on materials or undercharging for labor.',
              },
              {
                icon: <Clock className="w-6 h-6 text-blue-600" />,
                title: 'Save Hours Every Week',
                desc: 'The average contractor spends 6+ hours per week on estimates. QuoteKit cuts that to under 30 minutes.',
              },
              {
                icon: <Shield className="w-6 h-6 text-blue-600" />,
                title: 'Customer Management',
                desc: 'Keep all your customers and their history in one place. Follow up on open quotes, track acceptance rates.',
              },
              {
                icon: <CheckCircle className="w-6 h-6 text-blue-600" />,
                title: 'Edit Before You Send',
                desc: 'The AI does the heavy lifting, but you stay in control. Edit any line item, add your markup, and send when ready.',
              },
            ].map((f) => (
              <div key={f.title} className="p-6 rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-sm transition-all">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Go from job description to signed quote in 3 steps</h2>
          <p className="text-xl text-gray-600 mb-16">No training required. If you can fill out a form, you can use QuoteKit.</p>

          <div className="grid md:grid-cols-3 gap-8 text-left">
            {[
              { step: '01', title: 'Describe the job', desc: 'Type what the customer needs — "replace water heater, 40 gallon, gas" or "install 200 amp panel upgrade."' },
              { step: '02', title: 'AI builds the estimate', desc: 'QuoteKit generates a full line-item breakdown with labor hours, material costs, and a professional total.' },
              { step: '03', title: 'Send the PDF', desc: 'Review, edit if needed, and email the branded PDF quote to your customer in one click.' },
            ].map((s) => (
              <div key={s.step} className="relative p-6 bg-white rounded-2xl border border-gray-100">
                <span className="text-5xl font-black text-blue-50 absolute top-4 right-6">{s.step}</span>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 relative">{s.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed relative">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">Contractors love QuoteKit</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Mike Torres',
                role: 'Owner, Torres Plumbing',
                quote: 'I was spending Sunday nights writing quotes. Now I do them on-site in 60 seconds. Closed 3 extra jobs last month alone.',
                stars: 5,
              },
              {
                name: 'Sarah Chen',
                role: 'CEO, Bright Electric LLC',
                quote: 'My quotes look more professional than companies with 10x my staff. Customers actually comment on how detailed they are.',
                stars: 5,
              },
              {
                name: 'James Williams',
                role: 'Owner, Cool Air HVAC',
                quote: 'Went from 2-day turnaround to same-day quotes. My close rate went from 40% to 68%. The math is obvious.',
                stars: 5,
              },
            ].map((t) => (
              <div key={t.name} className="p-6 rounded-2xl border border-gray-100">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{t.quote}"</p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-gray-500 text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-xl text-gray-600">One closed job pays for a whole year. Start free, no credit card needed.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Starter',
                price: 199,
                desc: 'Perfect for solo contractors',
                features: ['50 estimates/month', 'PDF export', 'Email quotes', 'Basic branding', 'Email support'],
                cta: 'Start free trial',
                highlight: false,
              },
              {
                name: 'Pro',
                price: 349,
                desc: 'For growing businesses',
                features: ['Unlimited estimates', 'Custom branding & logo', 'Customer management', 'Estimate analytics', 'Priority support'],
                cta: 'Start free trial',
                highlight: true,
              },
              {
                name: 'Enterprise',
                price: 599,
                desc: 'For teams & large operations',
                features: ['Everything in Pro', 'Multiple team members', 'White-label PDFs', 'API access', 'Dedicated account manager'],
                cta: 'Start free trial',
                highlight: false,
              },
            ].map((p) => (
              <div key={p.name} className={`p-8 rounded-2xl border-2 ${p.highlight ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-200 bg-white'}`}>
                {p.highlight && <div className="text-xs font-bold bg-white text-blue-600 px-3 py-1 rounded-full w-fit mb-4">MOST POPULAR</div>}
                <h3 className={`text-xl font-bold mb-1 ${p.highlight ? 'text-white' : 'text-gray-900'}`}>{p.name}</h3>
                <p className={`text-sm mb-4 ${p.highlight ? 'text-blue-100' : 'text-gray-500'}`}>{p.desc}</p>
                <div className="mb-6">
                  <span className={`text-4xl font-black ${p.highlight ? 'text-white' : 'text-gray-900'}`}>${p.price}</span>
                  <span className={`text-sm ${p.highlight ? 'text-blue-100' : 'text-gray-500'}`}>/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {p.features.map((f) => (
                    <li key={f} className={`flex items-center gap-2 text-sm ${p.highlight ? 'text-blue-50' : 'text-gray-600'}`}>
                      <CheckCircle className={`w-4 h-4 flex-shrink-0 ${p.highlight ? 'text-blue-200' : 'text-green-500'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className={`block text-center py-3 rounded-xl font-semibold text-sm transition-colors ${p.highlight ? 'bg-white text-blue-600 hover:bg-blue-50' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-500 text-sm mt-8">All plans include a 14-day free trial. Cancel anytime.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to win more jobs?</h2>
          <p className="text-xl text-gray-600 mb-10">Join 200+ contractors already using QuoteKit to close faster and earn more.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-10 py-4 rounded-xl text-lg transition-colors">
            Get started free
            <ChevronRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-gray-500 mt-4">No credit card required · Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">QuoteKit</span>
          </div>
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} QuoteKit. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-900">Privacy</a>
            <a href="#" className="hover:text-gray-900">Terms</a>
            <a href="mailto:support@quotekit.com" className="hover:text-gray-900">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
