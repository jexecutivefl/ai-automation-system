import Link from 'next/link'

const features = [
  {
    title: 'AI Classification',
    description: 'Automatically categorize incoming requests using keyword analysis or GPT-4o-mini with confidence scoring and priority detection.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
  },
  {
    title: 'Smart Routing',
    description: 'Route classified requests to the right destination — Zendesk, Salesforce, Jira, Stripe, and more — with full audit trails.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
  },
  {
    title: 'Real-time Monitoring',
    description: 'Track every request through the pipeline with interactive dashboards, analytics charts, and a complete event timeline.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
]

const pipelineSteps = [
  { label: 'Incoming Request', sub: 'Email, Slack, API, Webhook' },
  { label: 'AI Classification', sub: 'Category & Priority' },
  { label: 'Workflow Routing', sub: 'Queue Assignment' },
  { label: 'Team Delivery', sub: 'Zendesk, Jira, Salesforce' },
]

const techStack = ['Next.js 15', 'React 19', 'TypeScript', 'SQLite', 'Tailwind CSS', 'OpenAI']

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-white">AutoFlow AI</span>
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            Enter Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-500 rounded-full blur-[128px]" />
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-violet-500 rounded-full blur-[128px]" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs text-blue-300 font-medium mb-6 border border-white/10">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Full-Stack AI Demo
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4 tracking-tight">
            Intelligent Workflow Automation,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
              Powered by AI
            </span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            A production-grade system that classifies incoming business requests, assigns priority,
            and routes them to the right team — automatically. Built with modern full-stack technologies.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="px-6 py-2.5 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/25"
            >
              View Dashboard
            </Link>
            <Link
              href="/demo"
              className="px-6 py-2.5 bg-white/10 text-white text-sm font-semibold rounded-lg hover:bg-white/20 transition-colors border border-white/10"
            >
              Try Live Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Pipeline Flow */}
      <section className="bg-white border-b border-slate-200 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-center text-sm font-semibold text-slate-400 uppercase tracking-widest mb-10">
            How It Works
          </h2>
          <div className="flex items-center justify-between">
            {pipelineSteps.map((step, i) => (
              <div key={step.label} className="flex items-center flex-1">
                <div className="text-center flex-1">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-sm">
                    {i + 1}
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{step.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{step.sub}</p>
                </div>
                {i < pipelineSteps.length - 1 && (
                  <div className="flex-shrink-0 w-12 flex items-center justify-center -mt-5">
                    <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-center text-2xl font-bold text-slate-900 mb-3">Core Capabilities</h2>
          <p className="text-center text-sm text-slate-500 mb-12 max-w-xl mx-auto">
            Every component is fully implemented — from the AI classification engine to the real-time analytics dashboard.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map(f => (
              <div key={f.title} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6">Built With</h2>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {techStack.map(t => (
              <span key={t} className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="bg-gradient-to-r from-slate-900 to-blue-900 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">See It In Action</h2>
          <p className="text-sm text-slate-300 mb-6">
            Submit a test request and watch the AI classify, prioritize, and route it in real time.
          </p>
          <Link
            href="/demo"
            className="inline-flex px-6 py-2.5 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/25"
          >
            Try the Demo
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-white/10 py-6">
        <div className="max-w-5xl mx-auto px-6 text-center text-xs text-slate-500">
          AI Automation Workflow System — Portfolio Demo
        </div>
      </footer>
    </div>
  )
}
