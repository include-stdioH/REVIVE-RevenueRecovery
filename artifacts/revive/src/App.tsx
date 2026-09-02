import { type ComponentType, type ReactNode, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import {
  Activity as ActivityIcon,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Bot,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  CreditCard,
  Database,
  ExternalLink,
  FileCheck2,
  Filter,
  Gauge,
  GitBranch,
  History,
  LayoutDashboard,
  LifeBuoy,
  ListFilter,
  LockKeyhole,
  Menu,
  MoreHorizontal,
  Pause,
  Play,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  UsersRound,
  WalletCards,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import {
  getGetAuditQueryKey,
  getGetDashboardQueryKey,
  getGetCustomerQueryKey,
  getGetGuardrailsQueryKey,
  getGetOpportunitiesQueryKey,
  getGetOpportunityQueryKey,
  getGetWorkflowsQueryKey,
  getSearchQueryKey,
  useGetAnalytics,
  useGetAudit,
  useGetCustomer,
  useGetCustomers,
  useGetDashboard,
  useGetGuardrails,
  useGetOpportunities,
  useGetOpportunity,
  useGetWorkflows,
  useRunAgent,
  useRunDemo,
  useSearch,
  useUpdateGuardrails,
  type Analytics,
  type AuditEvent,
  type Customer,
  type Dashboard,
  type Guardrails,
  type Opportunity,
  type OpportunityDetail,
  type RunResult,
  type Workflow,
} from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Link, Route, Router as WouterRouter, Switch, useLocation, useRoute } from 'wouter';
import './index.css';

const queryClient = new QueryClient();

const navGroups = [
  {
    label: 'Control room',
    items: [
      { href: '/', label: 'Overview', icon: LayoutDashboard },
      { href: '/opportunities', label: 'Opportunities', icon: Target },
      { href: '/agent', label: 'REVIVE Agent', icon: Bot },
      { href: '/workflows', label: 'Workflows', icon: GitBranch },
    ],
  },
  {
    label: 'Recovery surfaces',
    items: [
      { href: '/payments', label: 'Payments', icon: CreditCard },
      { href: '/checkout', label: 'Checkout', icon: WalletCards },
      { href: '/subscriptions', label: 'Subscriptions', icon: RotateCcw },
      { href: '/receivables', label: 'Receivables', icon: BriefcaseBusiness },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { href: '/customers', label: 'Customers', icon: UsersRound },
      { href: '/analytics', label: 'Analytics', icon: BarChart3 },
      { href: '/audit', label: 'Audit trail', icon: History },
    ],
  },
];

const formatINR = (value = 0) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
const formatCompact = (value = 0) =>
  new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
const pretty = (value: unknown) => String(value || '').replace(/[-_]/g, ' ');
const cap = (value: unknown) => {
  const text = pretty(value);
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : '—';
};
const toneFor = (value: unknown) => {
  const text = String(value || '').toLowerCase();
  if (text.includes('success') || text.includes('recover') || text.includes('complete') || text === 'healthy') return 'success';
  if (text.includes('fail') || text.includes('risk') || text.includes('urgent') || text.includes('critical')) return 'danger';
  if (text.includes('wait') || text.includes('review') || text.includes('pending') || text.includes('medium')) return 'warning';
  return 'neutral';
};

const fallbackMetrics = {
  revenueAtRisk: 8425000,
  revenueRecovered: 3187500,
  recoveryRate: 37.8,
  activeOpportunities: 184,
  successfulInterventions: 126,
  preventedLoss: 5400000,
};

const fallbackOpportunities: Opportunity[] = [
  {
    id: 'opp_1048',
    customer: 'Northstar Logistics',
    customerId: 'cus_210',
    type: 'Payment degradation',
    amountAtRisk: 184000,
    riskScore: 91,
    urgency: 'urgent',
    confidence: 0.94,
    rootCause: 'Issuer soft decline',
    recommendedAction: 'Retry with network token',
    status: 'active',
    createdAt: '12 min ago',
    lastAction: 'Detected issuer decline',
    nextAction: 'Retry at optimal window',
    stoppingRule: 'Stop after success or 3 retries',
    recoveryProbability: 0.78,
  },
  {
    id: 'opp_1042',
    customer: 'Aster Health',
    customerId: 'cus_144',
    type: 'Checkout drop-off',
    amountAtRisk: 96500,
    riskScore: 78,
    urgency: 'high',
    confidence: 0.86,
    rootCause: '3DS challenge abandoned',
    recommendedAction: 'Send assisted checkout link',
    status: 'awaiting_action',
    createdAt: '38 min ago',
    lastAction: 'Diagnosed checkout friction',
    nextAction: 'Ask consent to recover',
    stoppingRule: 'No more than 1 contact in 24h',
    recoveryProbability: 0.64,
  },
  {
    id: 'opp_1029',
    customer: 'Kite & Co.',
    customerId: 'cus_108',
    type: 'Failed subscription',
    amountAtRisk: 52800,
    riskScore: 67,
    urgency: 'medium',
    confidence: 0.73,
    rootCause: 'Expired card',
    recommendedAction: 'Request payment method update',
    status: 'in_progress',
    createdAt: '2 hrs ago',
    lastAction: 'Reminder sent via email',
    nextAction: 'Wait for customer response',
    stoppingRule: 'Stop on opt-out',
    recoveryProbability: 0.51,
  },
];

const fallbackCustomers: Customer[] = [
  { id: 'cus_210', name: 'Meera Shah', company: 'Northstar Logistics', email: 'meera@northstar.in', segment: 'Enterprise', lifetimeValue: 1840000, health: 'healthy', lastPayment: 'Today, 09:42', openRisk: 184000 },
  { id: 'cus_144', name: 'Arjun Rao', company: 'Aster Health', email: 'arjun@aster.health', segment: 'Growth', lifetimeValue: 682000, health: 'at_risk', lastPayment: 'Yesterday, 16:12', openRisk: 96500 },
  { id: 'cus_108', name: 'Ishita Menon', company: 'Kite & Co.', email: 'ishita@kiteco.com', segment: 'Scale', lifetimeValue: 422000, health: 'watch', lastPayment: '08 Jun, 11:20', openRisk: 52800 },
];

function MetricCard({ label, value, delta, icon: Icon, accent = 'teal' }: { label: string; value: string; delta?: string; icon: typeof Target; accent?: string }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5" data-testid={`metric-card-${label.toLowerCase().replaceAll(' ', '-')}`}>
      <div className={`absolute right-0 top-0 h-20 w-20 translate-x-5 -translate-y-5 rounded-full opacity-10 blur-2xl ${accent === 'orange' ? 'bg-orange-500' : accent === 'blue' ? 'bg-blue-600' : 'bg-teal-500'}`} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-muted-foreground">{label}</p>
          <p className="mt-3 font-mono-ui text-[26px] font-medium tracking-[-0.04em] text-foreground">{value}</p>
          {delta && <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-primary"><ArrowUpRight className="h-3.5 w-3.5" />{delta}<span className="font-normal text-muted-foreground">vs last 30d</span></p>}
        </div>
        <div className="rounded-lg bg-secondary p-2.5 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"><Icon className="h-4 w-4" /></div>
      </div>
    </div>
  );
}

function StatusPill({ value }: { value: unknown }) {
  const tone = toneFor(value);
  return <span className={`status-pill status-${tone}`} data-testid={`status-${String(value).replaceAll(' ', '-')}`}><span className="status-dot" />{cap(value)}</span>;
}

function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-secondary ${className}`} aria-label="Loading" data-testid="loading-skeleton" />;
}

function PageHeader({ eyebrow, title, subtitle, action }: { eyebrow: string; title: string; subtitle: string; action?: ReactNode }) {
  return (
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4 animate-rise">
      <div>
        <p className="mb-2 font-mono-ui text-[10px] font-medium uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
        <h1 className="text-3xl font-extrabold tracking-[-0.055em] text-foreground md:text-[36px]">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{subtitle}</p>
      </div>
      {action}
    </header>
  );
}

function EmptyState({ title, message, icon: Icon = InboxIcon, action }: { title: string; message: string; icon?: ComponentType<{ className?: string }>; action?: ReactNode }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 text-center" data-testid="empty-state">
      <div className="mb-4 rounded-full bg-secondary p-3 text-muted-foreground"><Icon className="h-5 w-5" /></div>
      <h3 className="text-sm font-bold">{title}</h3>
      <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

function InboxIcon(props: { className?: string }) {
  return <Database {...props} />;
}

function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const activeLabel = navGroups.flatMap((group) => group.items).find((item) => item.href === location)?.label || 'Control room';
  return (
    <div className="grain min-h-[100dvh] bg-background">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[252px] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-[76px] items-center gap-3 border-b border-sidebar-border px-6">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-teal-950/30"><ActivityIcon className="h-[18px] w-[18px]" /><span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-orange-400" /></div>
          <div><p className="text-[18px] font-extrabold tracking-[-0.05em] text-white">REVIVE</p><p className="font-mono-ui text-[8px] uppercase tracking-[0.2em] text-sidebar-foreground/60">recovery control room</p></div>
          <button className="ml-auto rounded-md p-1 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-white lg:hidden" onClick={() => setMobileOpen(false)} data-testid="button-close-mobile-nav"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-5">
          {navGroups.map((group) => (
            <div className="mb-6" key={group.label}>
              <p className="mb-2 px-3 font-mono-ui text-[9px] font-medium uppercase tracking-[0.18em] text-sidebar-foreground/40">{group.label}</p>
              <nav className="space-y-0.5">
                {group.items.map((item) => {
                  const active = location === item.href || (item.href !== '/' && location.startsWith(item.href));
                  const Icon = item.icon;
                  return <Link href={item.href} key={item.href} onClick={() => setMobileOpen(false)} className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] font-semibold transition-all duration-200 ${active ? 'bg-sidebar-accent text-white shadow-sm' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-white'}`} data-testid={`link-nav-${item.label.toLowerCase().replaceAll(' ', '-')}`}><Icon className={`h-[15px] w-[15px] transition-transform group-hover:scale-110 ${active ? 'text-sidebar-primary' : ''}`} /><span>{item.label}</span>{item.label === 'Opportunities' && <span className="ml-auto rounded-full bg-orange-400/15 px-1.5 py-0.5 font-mono-ui text-[9px] text-orange-300">184</span>}</Link>;
                })}
              </nav>
            </div>
          ))}
          <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/60 p-3.5">
            <div className="flex items-center gap-2 text-[11px] font-bold text-white"><span className="h-2 w-2 animate-pulse rounded-full bg-sidebar-primary" />Simulation online</div>
            <p className="mt-2 text-[10px] leading-4 text-sidebar-foreground/55">All amounts are simulated INR data. No live payments are affected.</p>
            <Link href="/demo" className="mt-3 flex items-center gap-1 text-[10px] font-bold text-sidebar-primary hover:text-white" data-testid="link-sidebar-demo">Open Demo Center <ArrowRight className="h-3 w-3" /></Link>
          </div>
        </div>
        <div className="border-t border-sidebar-border p-3">
          <Link href="/settings" className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] font-semibold transition-colors ${location === '/settings' ? 'bg-sidebar-accent text-white' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-white'}`} data-testid="link-nav-settings"><Settings className="h-[15px] w-[15px]" />Settings</Link>
          <div className="mt-2 flex items-center gap-3 rounded-lg bg-sidebar-accent/50 px-3 py-2.5"><div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-400/20 text-[10px] font-bold text-orange-200">NP</div><div className="min-w-0"><p className="truncate text-[11px] font-bold text-white">Nikhil Prasad</p><p className="truncate text-[10px] text-sidebar-foreground/50">Ops lead</p></div><MoreHorizontal className="ml-auto h-4 w-4 text-sidebar-foreground/40" /></div>
        </div>
      </aside>
      {mobileOpen && <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden" onClick={() => setMobileOpen(false)} data-testid="button-mobile-overlay" />}
      <div className="lg:pl-[252px]">
        <div className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-border bg-background/90 px-5 backdrop-blur-md md:px-8">
          <div className="flex items-center gap-3"><button className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-card lg:hidden" onClick={() => setMobileOpen(true)} data-testid="button-open-mobile-nav"><Menu className="h-4 w-4" /></button><div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex"><span>Workspace</span><ChevronRight className="h-3 w-3" /><span className="font-semibold text-foreground">{activeLabel}</span></div></div>
          <div className="flex items-center gap-3"><div className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-[11px] text-muted-foreground md:flex"><span className="h-1.5 w-1.5 rounded-full bg-primary" />Last sync 2 min ago</div><button className="relative rounded-lg border border-border bg-card p-2.5 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary" onClick={() => setNoticeOpen((v) => !v)} data-testid="button-notifications"><Bell className="h-4 w-4" /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-orange-400" /></button><button className="hidden rounded-lg border border-border bg-card p-2.5 text-muted-foreground hover:text-primary sm:block" onClick={() => setNoticeOpen(true)} data-testid="button-help"><LifeBuoy className="h-4 w-4" /></button></div>
          {noticeOpen && <div className="absolute right-5 top-16 w-72 rounded-xl border border-border bg-card p-4 shadow-xl animate-rise" data-testid="panel-notifications"><div className="flex items-center justify-between"><p className="text-xs font-bold">Operations inbox</p><span className="font-mono-ui text-[10px] text-primary">3 new</span></div><div className="mt-3 space-y-3">{['Northstar recovery approved','Guardrail review due at 14:00','Simulation refresh completed'].map((item) => <div className="flex gap-2.5 text-[11px]" key={item}><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /><span className="text-muted-foreground">{item}</span></div>)}</div></div>}
        </div>
        <main className="mx-auto max-w-[1510px] px-5 py-7 md:px-8 md:py-9">{children}</main>
        <footer className="mx-auto max-w-[1510px] px-5 pb-8 md:px-8"><div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-5 text-[10px] text-muted-foreground"><span>REVIVE / Operations intelligence</span><span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-primary" />Bounded autonomy active · Simulation mode</span></div></footer>
      </div>
    </div>
  );
}

function DashboardPage() {
  const { data, isLoading, isError, refetch } = useGetDashboard();
  const dashboard = data as Dashboard | undefined;
  const metrics = dashboard?.metrics || fallbackMetrics;
  const ops = dashboard?.topOpportunities?.length ? dashboard.topOpportunities : fallbackOpportunities;
  const trend = dashboard?.trend || [];
  const activity = dashboard?.activity || [];
  return (
    <>
      <PageHeader eyebrow="Monday · 17 June 2024 / live simulation" title="Control room" subtitle="A high-signal view of money at risk, bounded decisions, and verified recovery across every surface." action={<Link href="/demo" className="primary-button" data-testid="link-run-demo"><Play className="h-3.5 w-3.5" />Run a scenario</Link>} />
      {isError && <div className="mb-5 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800" data-testid="status-dashboard-error"><span className="flex items-center gap-2"><AlertCircle className="h-4 w-4" />Unable to refresh live metrics. Showing the last simulation snapshot.</span><button className="font-bold underline" onClick={() => refetch()} data-testid="button-retry-dashboard">Retry</button></div>}
      {isLoading ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <SkeletonBlock className="h-[142px]" key={i} />)}</div> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><MetricCard label="Revenue at risk" value={formatINR(metrics.revenueAtRisk)} delta="+8.4%" icon={CircleDollarSign} accent="orange" /><MetricCard label="Revenue recovered" value={formatINR(metrics.revenueRecovered)} delta="+12.6%" icon={CheckCircle2} /><MetricCard label="Recovery rate" value={`${metrics.recoveryRate}%`} delta="+4.2 pts" icon={Gauge} accent="blue" /><MetricCard label="Active opportunities" value={String(metrics.activeOpportunities)} delta="+16 today" icon={Target} /><MetricCard label="Successful interventions" value={String(metrics.successfulInterventions)} delta="+9 this week" icon={Zap} accent="orange" /><MetricCard label="Prevented loss" value={formatINR(metrics.preventedLoss)} delta="+6.8%" icon={ShieldCheck} accent="blue" /></div>}
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.45fr_.8fr]">
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6" data-testid="section-recovery-trend"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="section-kicker">Recovery velocity</p><h2 className="section-title">Risk is converting into cash</h2></div><div className="flex items-center gap-4 text-[10px] text-muted-foreground"><span className="flex items-center gap-1.5"><i className="legend-dot bg-orange-400" />At risk</span><span className="flex items-center gap-1.5"><i className="legend-dot bg-primary" />Recovered</span></div></div><div className="relative mt-6 h-[210px] overflow-hidden rounded-lg bg-secondary/40 data-grid">{trend.length ? <div className="absolute inset-x-5 bottom-7 top-8 flex items-end gap-2 md:gap-4">{trend.map((point, i) => { const max = Math.max(...trend.map((p) => p.atRisk), 1); const a = Math.max(9, (point.atRisk / max) * 100); const r = Math.max(5, (point.recovered / max) * 100); return <div className="group flex h-full flex-1 flex-col justify-end gap-1" key={point.label}><div className="relative flex flex-1 items-end justify-center gap-1"><div className="w-2 rounded-t-sm bg-orange-300/70 transition-all duration-500 group-hover:bg-orange-400" style={{ height: `${a}%` }} /><div className="w-2 rounded-t-sm bg-primary transition-all duration-500 group-hover:bg-primary/70" style={{ height: `${r}%` }} /><span className="pointer-events-none absolute -top-7 rounded bg-sidebar px-2 py-1 font-mono-ui text-[9px] text-white opacity-0 transition-opacity group-hover:opacity-100">{formatINR(point.recovered)}</span></div><span className="text-center font-mono-ui text-[9px] text-muted-foreground">{point.label}</span></div> })}</div> : <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">Trend data will appear after the next simulation cycle.</div>}<div className="absolute left-3 top-3 font-mono-ui text-[9px] text-muted-foreground">INR / daily</div></div></section>
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6" data-testid="section-workflow-breakdown"><div className="flex items-start justify-between"><div><p className="section-kicker">Portfolio mix</p><h2 className="section-title">Recovery by surface</h2></div><Link href="/analytics" className="icon-link" data-testid="link-view-analytics"><ArrowUpRight className="h-4 w-4" /></Link></div><div className="mt-6 space-y-4">{(dashboard?.workflowBreakdown || [{ label: 'Payment recovery', amount: 1280000, count: 62, color: '#1ea889' }, { label: 'Checkout recovery', amount: 740000, count: 31, color: '#f59e45' }, { label: 'Subscription recovery', amount: 612000, count: 22, color: '#4774a7' }, { label: 'Receivables', amount: 555000, count: 11, color: '#9a80b4' }]).map((item) => <div key={item.label}><div className="mb-1.5 flex items-center justify-between text-xs"><span className="flex items-center gap-2 font-semibold"><i className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />{item.label}</span><span className="font-mono-ui text-[10px] text-muted-foreground">{formatINR(item.amount)}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full" style={{ width: `${Math.min(100, (item.amount / 1400000) * 100)}%`, backgroundColor: item.color }} /></div><p className="mt-1 text-[10px] text-muted-foreground">{item.count} recovered opportunities</p></div>)}</div></section>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_1fr_.85fr]">
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm" data-testid="section-top-opportunities"><div className="mb-4 flex items-center justify-between"><div><p className="section-kicker">Triage queue</p><h2 className="section-title">Top opportunities</h2></div><Link href="/opportunities" className="text-xs font-bold text-primary hover:underline" data-testid="link-all-opportunities">View queue</Link></div><div className="space-y-2">{ops.slice(0, 4).map((op) => <Link href={`/opportunities/${op.id}`} className="opportunity-row" key={op.id} data-testid={`link-opportunity-${op.id}`}><div className="flex min-w-0 items-center gap-3"><div className={`risk-mark ${op.riskScore > 85 ? 'risk-high' : 'risk-mid'}`}>{op.riskScore}</div><div className="min-w-0"><p className="truncate text-xs font-bold">{op.customer}</p><p className="truncate text-[10px] text-muted-foreground">{op.type} · {op.createdAt}</p></div></div><div className="text-right"><p className="font-mono-ui text-xs font-medium">{formatINR(op.amountAtRisk)}</p><p className="mt-1 text-[10px] text-primary">{Math.round((op.recoveryProbability || 0) * 100)}% likely</p></div></Link>)}</div></section>
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm" data-testid="section-activity"><div className="mb-4 flex items-center justify-between"><div><p className="section-kicker">Signal stream</p><h2 className="section-title">Recent activity</h2></div><Link href="/audit" className="icon-link" data-testid="link-view-audit"><History className="h-4 w-4" /></Link></div>{activity.length ? <div className="relative space-y-4 pl-1 before:absolute before:bottom-1 before:left-[7px] before:top-1 before:w-px before:bg-border">{activity.slice(0, 5).map((item) => <div className="relative flex gap-3" key={item.id}><span className="relative mt-1.5 h-2 w-2 shrink-0 rounded-full border-2 border-card bg-primary ring-1 ring-primary/30" /><div><p className="text-xs font-semibold">{item.title}</p><p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">{item.detail}</p><p className="mt-1 font-mono-ui text-[9px] uppercase text-muted-foreground/70">{item.timestamp} · {item.stage}</p></div></div>)}</div> : <EmptyState title="No new signals" message="Agent activity will appear here as opportunities move through the seven stages." />}</section>
        <section className="rounded-xl border border-sidebar bg-sidebar p-5 text-sidebar-foreground shadow-sm" data-testid="section-intelligence"><div className="flex items-center gap-2 text-sidebar-primary"><Sparkles className="h-4 w-4" /><p className="section-kicker text-sidebar-primary">Recovery intelligence</p></div><h2 className="mt-3 text-lg font-extrabold tracking-[-0.04em] text-white">The best next move is usually the quiet one.</h2><p className="mt-3 text-xs leading-5 text-sidebar-foreground/65">Low-friction retries are outperforming outreach by <span className="font-bold text-white">18.4%</span> this week. The agent is shifting allocation accordingly.</p><div className="mt-6 grid grid-cols-2 gap-3 border-t border-sidebar-border pt-4"><div><p className="font-mono-ui text-xl text-white">{formatINR(dashboard?.intelligence?.recovered || 2184000)}</p><p className="mt-1 text-[10px] text-sidebar-foreground/50">recovered by agent</p></div><div><p className="font-mono-ui text-xl text-white">{dashboard?.intelligence?.agentConfidence || '86.2'}%</p><p className="mt-1 text-[10px] text-sidebar-foreground/50">agent confidence</p></div></div><Link href="/agent" className="mt-5 flex items-center gap-2 text-xs font-bold text-sidebar-primary hover:text-white" data-testid="link-intelligence-agent">Inspect agent reasoning <ArrowRight className="h-3.5 w-3.5" /></Link></section>
      </div>
      <section className="mt-5 rounded-xl border border-border bg-card p-5 shadow-sm" data-testid="section-scorecard"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="section-kicker">Agent scorecard</p><h2 className="section-title">Bounded autonomy, measured</h2></div><div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-[10px] font-semibold text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5 text-primary" />Human approval required for high-value actions</div></div><div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-4 lg:grid-cols-7">{[['Detected', dashboard?.scorecard?.detected || 402], ['Recommendations', dashboard?.scorecard?.recommendationsAccepted || 286], ['Successful', dashboard?.scorecard?.successfulRecoveries || 126], ['Recovery rate', `${dashboard?.scorecard?.recoveryRate || 37.8}%`], ['Escalation', `${dashboard?.scorecard?.escalationRate || 8.6}%`], ['Avg confidence', `${dashboard?.scorecard?.avgConfidence || 86.2}%`], ['Avg recovery time', dashboard?.scorecard?.avgRecoveryTime || '6h 14m']].map(([label, value]) => <div className="bg-card px-4 py-4" key={label}><p className="font-mono-ui text-lg font-medium">{value}</p><p className="mt-1 text-[10px] text-muted-foreground">{label}</p></div>)}</div></section>
    </>
  );
}

function OpportunitiesPage() {
  const [, detailParams] = useRoute('/opportunities/:id');
  const { data, isLoading, isError, refetch } = useGetOpportunities();
  const opportunities = (data as Opportunity[] | undefined)?.length ? (data as Opportunity[]) : fallbackOpportunities;
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const filtered = useMemo(() => opportunities.filter((op) => `${op.customer} ${op.type} ${op.rootCause}`.toLowerCase().includes(query.toLowerCase()) && (status === 'all' || op.status.toLowerCase() === status)), [opportunities, query, status]);
  const selectedId = detailParams?.id || filtered[0]?.id || opportunities[0]?.id || 'opp_1048';
  return (
    <>
      <PageHeader eyebrow="Recovery surfaces / queue" title="Opportunities" subtitle="Triage revenue risk with enough context to make a safe decision in one pass." action={<div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-[10px] text-muted-foreground"><LockKeyhole className="h-3.5 w-3.5 text-primary" />Decision log on</div>} />
      <div className="mb-5 flex flex-wrap items-center gap-2"><div className="relative min-w-[240px] flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search customer, cause, or type" className="control-input pl-9" data-testid="input-search-opportunities" /></div><div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs"><Filter className="h-3.5 w-3.5 text-muted-foreground" /><select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 bg-transparent pr-5 text-xs font-semibold outline-none" data-testid="select-opportunity-status"><option value="all">All statuses</option><option value="active">Active</option><option value="awaiting_action">Awaiting action</option><option value="in_progress">In progress</option></select></div><span className="rounded-full bg-secondary px-3 py-2 font-mono-ui text-[10px] text-muted-foreground" data-testid="text-opportunity-count">{filtered.length} visible</span></div>
      {isError && <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800" data-testid="status-opportunities-error"><span>Live queue unavailable. Showing a recent simulation snapshot.</span><button onClick={() => refetch()} className="font-bold underline" data-testid="button-retry-opportunities">Retry</button></div>}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,.95fr)]">
        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm" data-testid="section-opportunity-queue"><div className="border-b border-border px-5 py-4"><div className="flex items-center justify-between"><div><p className="section-kicker">Live queue</p><h2 className="section-title">Prioritized by recoverability</h2></div><SlidersHorizontal className="h-4 w-4 text-muted-foreground" /></div></div>{isLoading ? <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, i) => <SkeletonBlock className="h-20" key={i} />)}</div> : filtered.length ? <div className="divide-y divide-border">{filtered.map((op) => <Link href={`/opportunities/${op.id}`} className={`block p-4 transition-colors hover:bg-secondary/60 ${op.id === selectedId ? 'bg-secondary/70' : ''}`} key={op.id} data-testid={`row-opportunity-${op.id}`}><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-start gap-3"><div className={`risk-mark mt-0.5 ${op.riskScore > 85 ? 'risk-high' : op.riskScore > 70 ? 'risk-mid' : 'risk-low'}`}>{op.riskScore}</div><div className="min-w-0"><p className="truncate text-sm font-bold">{op.customer}</p><p className="mt-1 truncate text-[11px] text-muted-foreground">{op.type} <span className="mx-1 text-border">·</span>{op.rootCause}</p></div></div><div className="text-right"><p className="font-mono-ui text-sm">{formatINR(op.amountAtRisk)}</p><StatusPill value={op.status} /></div></div><div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground"><span className="flex items-center gap-1"><Clock3 className="h-3 w-3" />{op.createdAt}</span><span className="flex items-center gap-1 text-primary">{Math.round((op.confidence || 0) * 100)}% confidence <ChevronRight className="h-3 w-3" /></span></div></Link>)}</div> : <div className="p-4"><EmptyState title="No matching opportunities" message="Try a different search or clear the status filter." action={<button className="secondary-button" onClick={() => { setQuery(''); setStatus('all'); }} data-testid="button-clear-opportunity-filter">Clear filters</button>} /></div>}</section>
        <OpportunityDetailPanel id={selectedId} />
      </div>
    </>
  );
}

function OpportunityDetailPanel({ id }: { id: string }) {
  const { data, isLoading, isError, refetch } = useGetOpportunity(id, { query: { queryKey: getGetOpportunityQueryKey(id) } });
  const detail = (data as OpportunityDetail | undefined) || ({ ...fallbackOpportunities.find((op) => op.id === id) || fallbackOpportunities[0], whyAtRisk: 'Issuer response indicates a soft decline. Customer history and token health suggest a high probability of a quiet retry succeeding.', reasoning: 'The customer has paid reliably for 14 months. A retry using the network token at the next issuer window is the lowest-friction path.', timeline: [], agentActions: [] } as OpportunityDetail);
  const runAgent = useRunAgent();
  const queryClient = useQueryClient();
  const run = () => runAgent.mutate({ opportunityId: id }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetOpportunityQueryKey(id) }); queryClient.invalidateQueries({ queryKey: getGetOpportunitiesQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() }); } });
  return <section className="rounded-xl border border-border bg-card shadow-sm" data-testid="panel-opportunity-detail"><div className="border-b border-border bg-secondary/40 p-5 md:p-6"><div className="flex items-start justify-between gap-3"><div><p className="section-kicker">Selected opportunity</p><h2 className="mt-1 text-xl font-extrabold tracking-[-0.04em]">{detail.customer}</h2><p className="mt-1 text-xs text-muted-foreground">{detail.type} · {detail.id}</p></div><button className="icon-button" data-testid="button-more-opportunity"><MoreHorizontal className="h-4 w-4" /></button></div><div className="mt-5 grid grid-cols-2 gap-4"><div><p className="detail-label">Amount at risk</p><p className="mt-1 font-mono-ui text-xl">{formatINR(detail.amountAtRisk)}</p></div><div><p className="detail-label">Recovery probability</p><p className="mt-1 font-mono-ui text-xl text-primary">{Math.round((detail.recoveryProbability || .64) * 100)}%</p></div></div></div>{isLoading ? <div className="space-y-3 p-5"><SkeletonBlock className="h-20" /><SkeletonBlock className="h-28" /></div> : <div className="p-5 md:p-6"><div className="flex flex-wrap gap-2"><StatusPill value={detail.status} /><span className="status-pill status-neutral">Risk {detail.riskScore}/100</span><span className="status-pill status-neutral">Confidence {Math.round(detail.confidence * 100)}%</span></div><div className="mt-6 grid gap-5 md:grid-cols-2"><div><p className="detail-label">Why this is at risk</p><p className="mt-2 text-xs leading-5 text-muted-foreground">{detail.whyAtRisk}</p></div><div><p className="detail-label">Recommended action</p><div className="mt-2 rounded-lg border border-primary/20 bg-primary/5 p-3"><p className="text-xs font-bold">{detail.recommendedAction}</p><p className="mt-1 text-[10px] leading-4 text-muted-foreground">Stopping rule: {detail.stoppingRule}</p></div></div></div><div className="mt-5 rounded-lg border border-border p-3"><div className="flex items-center gap-2 text-xs font-bold"><Sparkles className="h-3.5 w-3.5 text-primary" />Agent reasoning</div><p className="mt-2 text-xs leading-5 text-muted-foreground">{detail.reasoning}</p></div><div className="mt-5 flex flex-wrap gap-2"><button className="primary-button" onClick={run} disabled={runAgent.isPending} data-testid="button-run-agent-opportunity">{runAgent.isPending ? <><ActivityIcon className="h-3.5 w-3.5 animate-pulse" />Agent is working</> : <><Bot className="h-3.5 w-3.5" />Run bounded agent</>}</button><button className="secondary-button" data-testid="button-review-opportunity"><ClipboardCheck className="h-3.5 w-3.5" />Review decision</button></div>{isError && <div className="mt-4 flex items-center justify-between rounded-lg bg-red-50 p-3 text-xs text-red-800" data-testid="status-opportunity-detail-error"><span>Detail refresh failed.</span><button className="font-bold underline" onClick={() => refetch()} data-testid="button-retry-opportunity-detail">Retry</button></div>}</div>}</section>;
}

function AgentPage() {
  const { data } = useGetDashboard();
  const opportunities = (data as Dashboard | undefined)?.topOpportunities?.length ? (data as Dashboard).topOpportunities : fallbackOpportunities;
  const runAgent = useRunAgent();
  const [selected, setSelected] = useState(opportunities[0]?.id || 'opp_1048');
  const selectedOp = opportunities.find((op) => op.id === selected) || opportunities[0];
  const handleRun = () => runAgent.mutate({ opportunityId: selectedOp.id });
  const stages = [{ key: 'detect', label: 'Detect', desc: 'Signal found', icon: Target }, { key: 'diagnose', label: 'Diagnose', desc: 'Cause isolated', icon: Search }, { key: 'decide', label: 'Decide', desc: 'Policy checked', icon: SlidersHorizontal }, { key: 'recover', label: 'Recover', desc: 'Action verified', icon: Zap }];
  const actionRows: Array<{ label: string; action: string; icon: typeof CheckCircle2 }> = [
    { label: 'Autonomous', action: 'Network-token retry', icon: CheckCircle2 },
    { label: 'Autonomous', action: 'Low-friction reminder', icon: CheckCircle2 },
    { label: 'Approval required', action: 'Discount above 10%', icon: LockKeyhole },
    { label: 'Approval required', action: 'Contact high-value account', icon: LockKeyhole },
  ];
  return <><PageHeader eyebrow="Bounded autonomy / agent" title="REVIVE Agent" subtitle="An explainable operator for revenue recovery. Every recommendation carries a reason, a confidence score, and a stopping rule." action={<button className="secondary-button" onClick={handleRun} disabled={runAgent.isPending} data-testid="button-run-agent-top">{runAgent.isPending ? 'Running…' : <><Play className="h-3.5 w-3.5" />Run on selected</>}</button>} /><div className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]"><section className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6" data-testid="section-agent-model"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="section-kicker">Operating model</p><h2 className="section-title">From signal to verified recovery</h2></div><span className="status-pill status-success"><span className="status-dot" />Online</span></div><div className="mt-8 grid gap-3 md:grid-cols-4">{stages.map((stage, i) => { const Icon = stage.icon; return <div className="relative" key={stage.key}><div className={`agent-stage ${i < 3 ? 'agent-stage-done' : 'agent-stage-current'}`}><div className="flex items-center justify-between"><span className="font-mono-ui text-[10px] text-muted-foreground">0{i + 1}</span><Icon className="h-4 w-4" /></div><p className="mt-6 text-sm font-extrabold">{stage.label}</p><p className="mt-1 text-[10px] text-muted-foreground">{stage.desc}</p></div>{i < stages.length - 1 && <ArrowRight className="absolute -right-3 top-12 z-10 hidden h-4 w-4 text-primary md:block" />}</div> })}</div><div className="mt-7 rounded-lg border border-border bg-secondary/40 p-4"><div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /><p className="text-xs font-bold">Current reasoning trace</p><span className="ml-auto font-mono-ui text-[10px] text-primary">live</span></div><div className="mt-4 space-y-3">{['Payment declined with soft issuer code 05; no fraud indicators present.', 'Customer has a 94% historical payment completion rate.', 'Retry within 6 hours; amount is below the approval threshold.', 'If unsuccessful, pause and request human review.'].map((line, i) => <div className="flex gap-3 text-xs" key={line}><span className="font-mono-ui text-[10px] text-muted-foreground">0{i + 1}</span><span className={i === 2 ? 'font-semibold text-foreground' : 'text-muted-foreground'}>{line}</span>{i === 2 && <Check className="ml-auto h-3.5 w-3.5 text-primary" />}</div>)}</div></div></section><section className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6" data-testid="section-agent-bounded-actions"><p className="section-kicker">Decision boundary</p><h2 className="section-title">What the agent can do</h2><div className="mt-5 space-y-2">{actionRows.map(({ label, action, icon: Icon }) => <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-3" key={action}><Icon className={`h-4 w-4 ${label === 'Autonomous' ? 'text-primary' : 'text-orange-500'}`} /><div className="min-w-0"><p className="text-xs font-semibold">{action}</p><p className="text-[10px] text-muted-foreground">{label}</p></div></div>)}</div><Link href="/guardrails" className="mt-5 flex items-center justify-between rounded-lg bg-secondary px-3 py-3 text-xs font-bold transition-colors hover:bg-primary/10" data-testid="link-agent-guardrails">Inspect guardrails <ArrowRight className="h-3.5 w-3.5 text-primary" /></Link></section></div><section className="mt-5 rounded-xl border border-border bg-card p-5 shadow-sm" data-testid="section-agent-workbench"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="section-kicker">Operator workbench</p><h2 className="section-title">Select an opportunity to simulate</h2></div><span className="font-mono-ui text-[10px] text-muted-foreground">Agent actions are logged automatically</span></div><div className="mt-5 grid gap-3 md:grid-cols-3">{opportunities.map((op) => <button className={`text-left ${selected === op.id ? 'ring-2 ring-primary/30' : ''} rounded-lg border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40`} onClick={() => setSelected(op.id)} key={op.id} data-testid={`button-select-agent-${op.id}`}><div className="flex items-center justify-between"><span className="risk-mark risk-mid">{op.riskScore}</span><span className="font-mono-ui text-[10px] text-muted-foreground">{op.id}</span></div><p className="mt-4 text-sm font-bold">{op.customer}</p><p className="mt-1 text-[10px] text-muted-foreground">{op.type}</p><div className="mt-3 flex items-center justify-between"><span className="font-mono-ui text-xs">{formatINR(op.amountAtRisk)}</span><span className="text-[10px] text-primary">{Math.round((op.confidence || 0) * 100)}% confidence</span></div></button>)}</div></section></>;
}

function WorkflowsPage() {
  const { data, isLoading } = useGetWorkflows();
  const workflows = (data as Workflow[] | undefined)?.length ? data as Workflow[] : [{ id: 'wf_payment', name: 'Payment recovery', category: 'Payment degradation', status: 'active', activeCount: 62, recovered: 1280000, successRate: 48.2, lastRun: '2 min ago', stages: ['Detect', 'Diagnose', 'Decide', 'Recover', 'Verify', 'Learn', 'Report'].map((name, i) => ({ name, status: i < 5 ? 'complete' : i === 5 ? 'active' : 'pending', result: i < 5 ? 'Passed' : i === 5 ? 'Learning from result' : 'Queued' })) }, { id: 'wf_checkout', name: 'Checkout recovery', category: 'Checkout drop-off', status: 'active', activeCount: 31, recovered: 740000, successRate: 41.6, lastRun: '8 min ago', stages: ['Detect', 'Diagnose', 'Decide', 'Recover', 'Verify', 'Learn', 'Report'].map((name, i) => ({ name, status: i < 4 ? 'complete' : i === 4 ? 'active' : 'pending', result: i < 4 ? 'Passed' : 'Queued' })) }] as Workflow[];
  const [expanded, setExpanded] = useState(workflows[0]?.id);
  return <><PageHeader eyebrow="Control room / orchestration" title="Workflows" subtitle="Seven-stage recovery programs with clear ownership at every handoff." action={<button className="secondary-button" data-testid="button-refresh-workflows"><RotateCcw className="h-3.5 w-3.5" />Refresh runs</button>} /><div className="space-y-3">{isLoading ? Array.from({ length: 3 }).map((_, i) => <SkeletonBlock className="h-28" key={i} />) : workflows.map((workflow) => <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm" key={workflow.id} data-testid={`card-workflow-${workflow.id}`}><button className="flex w-full items-center gap-4 p-5 text-left transition-colors hover:bg-secondary/40" onClick={() => setExpanded(expanded === workflow.id ? '' : workflow.id)} data-testid={`button-expand-workflow-${workflow.id}`}><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary"><GitBranch className="h-5 w-5" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-sm font-extrabold">{workflow.name}</h2><StatusPill value={workflow.status} /></div><p className="mt-1 text-[11px] text-muted-foreground">{workflow.category} · Last run {workflow.lastRun}</p></div><div className="hidden text-right sm:block"><p className="font-mono-ui text-sm">{formatINR(workflow.recovered)}</p><p className="text-[10px] text-muted-foreground">recovered</p></div><div className="hidden text-right sm:block"><p className="font-mono-ui text-sm text-primary">{workflow.successRate}%</p><p className="text-[10px] text-muted-foreground">success rate</p></div><div className="rounded-md p-1 text-muted-foreground">{expanded === workflow.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</div></button>{expanded === workflow.id && <div className="border-t border-border bg-secondary/20 px-5 pb-6 pt-5"><div className="mb-4 flex items-center justify-between"><p className="section-kicker">Execution path</p><span className="font-mono-ui text-[10px] text-muted-foreground">{workflow.activeCount} active instances</span></div><div className="grid gap-2 md:grid-cols-7">{workflow.stages.map((stage, i) => <div className={`rounded-lg border p-3 ${toneFor(stage.status) === 'success' ? 'border-primary/25 bg-primary/5' : toneFor(stage.status) === 'warning' ? 'border-orange-300 bg-orange-50' : 'border-border bg-card'}`} key={stage.name}><div className="flex items-center justify-between"><span className="font-mono-ui text-[9px] text-muted-foreground">0{i + 1}</span>{toneFor(stage.status) === 'success' ? <Check className="h-3.5 w-3.5 text-primary" /> : toneFor(stage.status) === 'warning' ? <ActivityIcon className="h-3.5 w-3.5 text-orange-500" /> : <Pause className="h-3.5 w-3.5 text-muted-foreground" />}</div><p className="mt-5 text-[11px] font-bold">{stage.name}</p><p className="mt-1 text-[9px] leading-3 text-muted-foreground">{stage.result}</p></div>)}</div></div>}</div>)}</div></>;
}

function SurfacePage({ kind, title, subtitle }: { kind: string; title: string; subtitle: string }) {
  const { data } = useGetOpportunities();
  const opportunities = ((data as Opportunity[] | undefined) || fallbackOpportunities).filter((op) => op.type.toLowerCase().includes(kind));
  const surfaceFallback: Opportunity = { ...fallbackOpportunities[0], id: `sim_${kind}`, customer: kind === 'receivable' ? 'BlueSail Manufacturing' : 'Northstar Logistics', type: title, amountAtRisk: kind === 'receivable' ? 246000 : fallbackOpportunities[0].amountAtRisk, rootCause: kind === 'receivable' ? 'Invoice 45 days overdue' : fallbackOpportunities[0].rootCause, recommendedAction: kind === 'receivable' ? 'Review promise-to-pay context' : fallbackOpportunities[0].recommendedAction, stoppingRule: kind === 'receivable' ? 'Stop after a confirmed promise to pay' : fallbackOpportunities[0].stoppingRule };
  const display = opportunities.length ? opportunities : fallbackOpportunities.filter((op) => op.type.toLowerCase().includes(kind.split(' ')[0])).length ? fallbackOpportunities.filter((op) => op.type.toLowerCase().includes(kind.split(' ')[0])) : [surfaceFallback];
  const [selected, setSelected] = useState(display[0]?.id || fallbackOpportunities[0].id);
  const runAgent = useRunAgent();
  const active = display.find((op) => op.id === selected) || display[0] || fallbackOpportunities[0];
  return <><PageHeader eyebrow={`Recovery surface / ${kind}`} title={title} subtitle={subtitle} action={<div className="status-pill status-success"><span className="status-dot" />Monitoring</div>} /><div className="grid gap-5 xl:grid-cols-[1fr_.72fr]"><section className="rounded-xl border border-border bg-card shadow-sm" data-testid={`section-${kind.replaceAll(' ', '-')}-records`}><div className="flex items-center justify-between border-b border-border px-5 py-4"><div><p className="section-kicker">Simulation records</p><h2 className="section-title">{display.length} open records</h2></div><button className="icon-button" data-testid={`button-filter-${kind}`}><ListFilter className="h-4 w-4" /></button></div><div className="divide-y divide-border">{display.map((op) => <button className={`block w-full p-4 text-left transition-colors hover:bg-secondary/60 ${selected === op.id ? 'bg-secondary/70' : ''}`} onClick={() => setSelected(op.id)} key={op.id} data-testid={`button-select-${kind}-${op.id}`}><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${op.riskScore > 85 ? 'bg-red-500' : 'bg-orange-400'}`} /><p className="text-sm font-bold">{op.customer}</p></div><p className="mt-1 text-[11px] text-muted-foreground">{op.rootCause} · {op.createdAt}</p></div><p className="font-mono-ui text-sm">{formatINR(op.amountAtRisk)}</p></div><div className="mt-3 flex items-center justify-between"><StatusPill value={op.status} /><span className="text-[10px] text-primary">{op.nextAction}</span></div></button>)}</div></section><section className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6" data-testid={`panel-${kind.replaceAll(' ', '-')}-detail`}><p className="section-kicker">Recovery action</p><h2 className="mt-1 text-xl font-extrabold tracking-[-0.04em]">{active.customer}</h2><p className="mt-1 text-xs text-muted-foreground">{active.type} · {active.id}</p><div className="mt-6 rounded-lg bg-sidebar p-4 text-sidebar-foreground"><p className="detail-label text-sidebar-foreground/50">Amount at risk</p><p className="mt-1 font-mono-ui text-2xl text-white">{formatINR(active.amountAtRisk)}</p><div className="mt-4 grid grid-cols-2 gap-3 border-t border-sidebar-border pt-3"><div><p className="detail-label text-sidebar-foreground/50">Risk score</p><p className="mt-1 font-mono-ui text-sm text-white">{active.riskScore}/100</p></div><div><p className="detail-label text-sidebar-foreground/50">Confidence</p><p className="mt-1 font-mono-ui text-sm text-sidebar-primary">{Math.round(active.confidence * 100)}%</p></div></div></div><div className="mt-5 space-y-4"><div><p className="detail-label">Root cause</p><p className="mt-1 text-xs font-semibold">{active.rootCause}</p></div><div><p className="detail-label">Next safe action</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{active.recommendedAction}. The agent will stop when {active.stoppingRule.toLowerCase()}.</p></div></div><button className="primary-button mt-6 w-full justify-center" onClick={() => runAgent.mutate({ opportunityId: active.id })} disabled={runAgent.isPending} data-testid={`button-recover-${kind}`}>{runAgent.isPending ? 'Running bounded action…' : <><Zap className="h-3.5 w-3.5" />Run recovery action</>}</button><p className="mt-3 text-center text-[10px] text-muted-foreground">Simulation only · no live customer contact</p></section></div></>;
}

function CustomersPage() {
  const [, detailParams] = useRoute('/customers/:id');
  const { data, isLoading } = useGetCustomers();
  const customers = (data as Customer[] | undefined)?.length ? data as Customer[] : fallbackCustomers;
  const [query, setQuery] = useState('');
  const filtered = customers.filter((c) => `${c.name} ${c.company} ${c.email}`.toLowerCase().includes(query.toLowerCase()));
  const selectedId = detailParams?.id || filtered[0]?.id || customers[0]?.id || 'cus_210';
  return <><PageHeader eyebrow="Intelligence / customer graph" title="Customers" subtitle="Customer 360 context for safer recovery decisions and better human handoffs." /><div className="mb-5 relative max-w-lg"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, company, or email" className="control-input pl-9" data-testid="input-search-customers" /></div><div className="grid gap-5 xl:grid-cols-[1fr_.78fr]"><section className="rounded-xl border border-border bg-card shadow-sm" data-testid="section-customer-list"><div className="border-b border-border px-5 py-4"><p className="section-kicker">Customer directory</p><h2 className="section-title">{filtered.length} accounts in view</h2></div>{isLoading ? <div className="space-y-2 p-4">{Array.from({ length: 4 }).map((_, i) => <SkeletonBlock className="h-16" key={i} />)}</div> : <div className="divide-y divide-border">{filtered.map((customer) => <Link href={`/customers/${customer.id}`} className={`flex items-center gap-3 p-4 transition-colors hover:bg-secondary/60 ${customer.id === selectedId ? 'bg-secondary/70' : ''}`} key={customer.id} data-testid={`link-customer-${customer.id}`}><div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-extrabold text-primary">{customer.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{customer.company}</p><p className="truncate text-[10px] text-muted-foreground">{customer.name} · {customer.segment}</p></div><div className="text-right"><p className="font-mono-ui text-xs">{formatINR(customer.openRisk)}</p><p className="text-[10px] text-muted-foreground">open risk</p></div><ChevronRight className="h-4 w-4 text-muted-foreground" /></Link>)}</div>}</section><CustomerDetail id={selectedId} /></div></>;
}

function CustomerDetail({ id }: { id: string }) {
  const { data, isError, refetch } = useGetCustomer(id, { query: { queryKey: getGetCustomerQueryKey(id) } });
  const customer = (data as Customer | undefined) || fallbackCustomers.find((c) => c.id === id) || fallbackCustomers[0];
  return <section className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6" data-testid="panel-customer-detail"><div className="flex items-start gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-extrabold text-primary">{customer.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}</div><div><p className="section-kicker">Customer 360</p><h2 className="mt-1 text-xl font-extrabold tracking-[-0.04em]">{customer.company}</h2><p className="mt-1 text-xs text-muted-foreground">{customer.name} · {customer.email}</p></div></div><div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-lg border border-border p-3"><p className="detail-label">Lifetime value</p><p className="mt-2 font-mono-ui text-lg">{formatINR(customer.lifetimeValue)}</p></div><div className="rounded-lg border border-border p-3"><p className="detail-label">Account health</p><div className="mt-2"><StatusPill value={customer.health} /></div></div><div className="rounded-lg border border-border p-3"><p className="detail-label">Last payment</p><p className="mt-2 text-xs font-semibold">{customer.lastPayment}</p></div><div className="rounded-lg border border-border p-3"><p className="detail-label">Open risk</p><p className="mt-2 font-mono-ui text-lg text-orange-600">{formatINR(customer.openRisk)}</p></div></div><div className="mt-6 border-t border-border pt-5"><p className="section-kicker">Recovery context</p><div className="mt-3 space-y-3">{['14 successful payments in the last 90 days', 'No communication opt-out on record', 'Preferred channel: transactional email'].map((item) => <div className="flex items-center gap-2 text-xs text-muted-foreground" key={item}><CheckCircle2 className="h-3.5 w-3.5 text-primary" />{item}</div>)}</div></div>{isError && <button className="mt-4 text-xs font-bold text-primary underline" onClick={() => refetch()} data-testid="button-retry-customer">Retry customer context</button>}</section>;
}

function AnalyticsPage() {
  const { data, isLoading, isError, refetch } = useGetAnalytics();
  const analytics = data as Analytics | undefined;
  const metric = analytics?.metrics || fallbackMetrics;
  const bars = analytics?.recoveryByWorkflow || [{ label: 'Payment recovery', value: 1280000, count: 62 }, { label: 'Checkout recovery', value: 740000, count: 31 }, { label: 'Subscriptions', value: 612000, count: 22 }, { label: 'Receivables', value: 555000, count: 11 }];
  const funnel = analytics?.funnel || [{ label: 'Detected', value: 402, color: '#4774a7' }, { label: 'Diagnosed', value: 346, color: '#5b88b6' }, { label: 'Actioned', value: 286, color: '#f59e45' }, { label: 'Recovered', value: 126, color: '#1ea889' }];
  return <><PageHeader eyebrow="Intelligence / performance" title="Analytics" subtitle="Understand which decisions turn risk into retained revenue, by workflow, reason, and segment." action={<button className="secondary-button" data-testid="button-export-analytics"><ExternalLink className="h-3.5 w-3.5" />Export snapshot</button>} />{isError && <div className="mb-5 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800" data-testid="status-analytics-error"><span>Analytics source is delayed; showing cached simulation data.</span><button onClick={() => refetch()} className="font-bold underline" data-testid="button-retry-analytics">Retry</button></div>}{isLoading ? <div className="grid gap-5 md:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <SkeletonBlock className="h-60" key={i} />)}</div> : <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Recovered this period" value={formatINR(metric.revenueRecovered)} delta="+12.6%" icon={CircleDollarSign} /><MetricCard label="Recovery rate" value={`${metric.recoveryRate}%`} delta="+4.2 pts" icon={Gauge} accent="blue" /><MetricCard label="Avg recovery time" value={analytics?.avgRecoveryTime || '6h 14m'} icon={Clock3} accent="orange" /><MetricCard label="Prevented loss" value={formatINR(metric.preventedLoss)} delta="+6.8%" icon={ShieldCheck} /></div><div className="mt-5 grid gap-5 lg:grid-cols-2"><section className="rounded-xl border border-border bg-card p-5 shadow-sm" data-testid="section-analytics-workflows"><p className="section-kicker">Recovered value</p><h2 className="section-title">By workflow</h2><div className="mt-6 space-y-5">{bars.map((item) => { const max = Math.max(...bars.map((b) => b.value), 1); return <div key={item.label}><div className="mb-2 flex items-center justify-between text-xs"><span className="font-semibold">{item.label}</span><span className="font-mono-ui text-[10px]">{formatINR(item.value)}</span></div><div className="h-3 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${(item.value / max) * 100}%` }} /></div><p className="mt-1 text-[10px] text-muted-foreground">{item.count} recovered instances</p></div> })}</div></section><section className="rounded-xl border border-border bg-card p-5 shadow-sm" data-testid="section-analytics-funnel"><p className="section-kicker">Conversion health</p><h2 className="section-title">Seven-stage funnel</h2><div className="mt-6 space-y-2">{funnel.map((item, i) => <div className="flex items-center gap-3" key={item.label}><span className="w-4 font-mono-ui text-[10px] text-muted-foreground">0{i + 1}</span><div className="flex-1"><div className="h-9 overflow-hidden rounded-md bg-secondary"><div className="flex h-full items-center rounded-md px-3 text-[10px] font-bold text-white transition-all duration-700" style={{ width: `${Math.max(28, (item.value / funnel[0].value) * 100)}%`, backgroundColor: item.color }}>{item.label}</div></div></div><span className="w-12 text-right font-mono-ui text-xs">{item.value}</span></div>)}</div><div className="mt-6 grid grid-cols-2 gap-3 border-t border-border pt-4"><div><p className="detail-label">Best intervention</p><p className="mt-1 text-xs font-bold">{analytics?.recoveryByIntervention?.[0]?.label || 'Network token retry'}</p></div><div><p className="detail-label">Best segment</p><p className="mt-1 text-xs font-bold">{analytics?.segments?.[0]?.label || 'Enterprise'}</p></div></div></section></div></>}</>;
}

function AuditPage() {
  const { data, isLoading, isError, refetch } = useGetAudit();
  const events = (data as AuditEvent[] | undefined)?.length ? data as AuditEvent[] : fallbackOpportunities.flatMap((op, i) => ['Detect', 'Diagnose', 'Decide', 'Recover'].map((stage, j) => ({ id: `${op.id}_${j}`, timestamp: `${i + 1}h ${j * 11}m ago`, opportunity: op.id, stage, action: j === 0 ? 'Signal classified' : j === 1 ? op.rootCause : j === 2 ? op.recommendedAction : 'Recovery verified', actor: j === 2 ? 'REVIVE Agent' : 'System', result: j === 3 ? 'Success' : 'Passed', confidence: op.confidence, status: j === 3 ? 'success' : 'complete' }))) as AuditEvent[];
  return <><PageHeader eyebrow="Governance / immutable record" title="Audit trail" subtitle="A complete decision record across detect, diagnose, decide, recover, verify, learn, and report." action={<div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-[10px] text-muted-foreground"><FileCheck2 className="h-3.5 w-3.5 text-primary" />Append-only log</div>} />{isError && <div className="mb-5 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800"><span>Audit service is delayed; showing local simulation events.</span><button onClick={() => refetch()} className="font-bold underline" data-testid="button-retry-audit">Retry</button></div>}<section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm" data-testid="section-audit-table"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4"><div><p className="section-kicker">Decision ledger</p><h2 className="section-title">{events.length} events indexed</h2></div><div className="flex items-center gap-2"><button className="secondary-button py-2 text-[10px]" data-testid="button-filter-audit"><Filter className="h-3.5 w-3.5" />Filter</button><button className="secondary-button py-2 text-[10px]" data-testid="button-download-audit"><ExternalLink className="h-3.5 w-3.5" />Download</button></div></div>{isLoading ? <div className="space-y-2 p-4">{Array.from({ length: 7 }).map((_, i) => <SkeletonBlock className="h-14" key={i} />)}</div> : <div className="overflow-x-auto"><table className="w-full min-w-[780px] text-left"><thead><tr className="border-b border-border bg-secondary/50 font-mono-ui text-[9px] uppercase tracking-[.12em] text-muted-foreground"><th className="px-5 py-3">Time</th><th className="px-3 py-3">Opportunity</th><th className="px-3 py-3">Stage / action</th><th className="px-3 py-3">Actor</th><th className="px-3 py-3">Result</th><th className="px-5 py-3 text-right">Confidence</th></tr></thead><tbody className="divide-y divide-border">{events.map((event) => <tr className="text-xs transition-colors hover:bg-secondary/40" key={event.id} data-testid={`row-audit-${event.id}`}><td className="px-5 py-4 font-mono-ui text-[10px] text-muted-foreground">{event.timestamp}</td><td className="px-3 py-4 font-mono-ui text-[10px]">{event.opportunity}</td><td className="px-3 py-4"><p className="font-semibold">{event.action}</p><p className="mt-1 text-[10px] text-muted-foreground">{event.stage}</p></td><td className="px-3 py-4 text-muted-foreground">{event.actor}</td><td className="px-3 py-4"><StatusPill value={event.result} /></td><td className="px-5 py-4 text-right font-mono-ui text-[10px] text-primary">{Math.round(event.confidence * 100)}%</td></tr>)}</tbody></table></div>}</section></>;
}

function GuardrailsPage() {
  const { data, isLoading } = useGetGuardrails();
  const defaults: Guardrails = { maxRetries: 3, minRetryIntervalHours: 6, maxContactsPerDay: 1, discountApprovalThreshold: 10, highValueThreshold: 100000, lowConfidenceThreshold: 65, autoApprove: false, stopAfterSuccess: true, stopAfterOptOut: true };
  const [form, setForm] = useState<Guardrails>((data as Guardrails | undefined) || defaults);
  const [saved, setSaved] = useState(false);
  const mutation = useUpdateGuardrails();
  const update = (key: keyof Guardrails, value: string | boolean) => setForm((current) => ({ ...current, [key]: typeof value === 'boolean' ? value : Number(value) }));
  const save = () => mutation.mutate({ data: form }, { onSuccess: () => { setSaved(true); queryClient.invalidateQueries({ queryKey: getGetGuardrailsQueryKey() }); setTimeout(() => setSaved(false), 2200); } });
  return <><PageHeader eyebrow="Governance / decision policy" title="Guardrails" subtitle="Set the operating envelope. These controls are checked before the agent proposes or takes any recovery action." action={<div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-[10px] font-semibold text-primary"><ShieldCheck className="h-3.5 w-3.5" />Policy active</div>} /><div className="grid gap-5 xl:grid-cols-[1fr_.65fr]"><section className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6" data-testid="section-guardrail-form"><div className="mb-6"><p className="section-kicker">Editable controls</p><h2 className="section-title">Keep decisions bounded</h2></div>{isLoading ? <div className="space-y-4">{Array.from({ length: 6 }).map((_, i) => <SkeletonBlock className="h-16" key={i} />)}</div> : <div className="grid gap-4 sm:grid-cols-2">{[['maxRetries', 'Maximum retries', 'Attempts before escalation'], ['minRetryIntervalHours', 'Retry interval', 'Hours between attempts'], ['maxContactsPerDay', 'Contacts per day', 'Maximum outbound touches'], ['discountApprovalThreshold', 'Discount approval threshold', 'Approval needed above this %'], ['highValueThreshold', 'High-value account threshold', 'INR amount needing review'], ['lowConfidenceThreshold', 'Low confidence threshold', 'Escalate below this %']].map(([key, label, help]) => <label className="block" key={key}><span className="detail-label">{label}</span><input type="number" value={Number(form[key as keyof Guardrails])} onChange={(e) => update(key as keyof Guardrails, e.target.value)} className="control-input mt-2" data-testid={`input-guardrail-${key}`} /><span className="mt-1 block text-[10px] text-muted-foreground">{help}</span></label>)}</div>}<div className="mt-6 space-y-2 border-t border-border pt-5">{[['autoApprove', 'Auto-approve low-risk actions', 'Only actions under every configured threshold'], ['stopAfterSuccess', 'Stop immediately after success', 'Never stack recovery attempts'], ['stopAfterOptOut', 'Honor opt-out as a hard stop', 'No further contact after a customer opts out']].map(([key, label, help]) => <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-border px-4 py-3 transition-colors hover:bg-secondary/50" key={key}><span><span className="block text-xs font-bold">{label}</span><span className="mt-1 block text-[10px] text-muted-foreground">{help}</span></span><input type="checkbox" checked={Boolean(form[key as keyof Guardrails])} onChange={(e) => update(key as keyof Guardrails, e.target.checked)} className="toggle-control" data-testid={`checkbox-guardrail-${key}`} /></label>)}</div><div className="mt-6 flex items-center justify-between gap-3"><span className="text-[10px] text-muted-foreground">{saved ? 'Policy saved and applied to new decisions.' : mutation.isError ? 'Save failed. Try again.' : 'Changes affect agent decisions after saving.'}</span><button className="primary-button" onClick={save} disabled={mutation.isPending} data-testid="button-save-guardrails">{mutation.isPending ? 'Saving…' : saved ? <><Check className="h-3.5 w-3.5" />Saved</> : 'Save policy'}</button></div></section><section className="rounded-xl border border-sidebar bg-sidebar p-5 text-sidebar-foreground shadow-sm md:p-6" data-testid="section-guardrail-preview"><p className="section-kicker text-sidebar-primary">Policy preview</p><h2 className="mt-1 text-xl font-extrabold tracking-[-0.04em] text-white">The agent will pause when certainty drops.</h2><p className="mt-3 text-xs leading-5 text-sidebar-foreground/65">Guardrails turn autonomy into something your team can trust. Every hard stop creates a visible review task, never a silent failure.</p><div className="mt-6 space-y-2">{[['Retry budget', `${form.maxRetries} attempts`], ['Contact budget', `${form.maxContactsPerDay} / day`], ['Review floor', `${form.lowConfidenceThreshold}% confidence`], ['Hard stops', `${form.stopAfterSuccess && form.stopAfterOptOut ? '2 enabled' : 'Review settings'}`]].map(([label, value]) => <div className="flex items-center justify-between border-b border-sidebar-border py-3 text-xs" key={label}><span className="text-sidebar-foreground/55">{label}</span><span className="font-mono-ui text-sidebar-primary">{value}</span></div>)}</div><div className="mt-6 flex gap-2 rounded-lg border border-orange-300/20 bg-orange-300/10 p-3 text-[10px] leading-4 text-orange-100"><AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-300" />High-value opportunities above {formatINR(form.highValueThreshold)} always surface for human approval.</div></section></div></>;
}

const scenarios = [
  ['payment-degradation', 'Payment degradation', 'Soft decline recovery', 'Issuer declines without fraud signal'],
  ['checkout', 'Checkout drop-off', 'Assisted completion', '3DS or payment friction'],
  ['subscription', 'Failed subscription', 'Payment method update', 'Recurring payment failure'],
  ['receivables', 'B2B receivables', 'Promise to pay', 'Overdue invoice with context'],
  ['mandate', 'Mandate failure', 'Mandate recovery', 'Recurring mandate rejected'],
  ['hinglish', 'Hinglish outreach', 'Language-aware recovery', 'Customer prefers Hinglish'],
  ['promise-to-pay', 'Promise to pay', 'Commitment tracking', 'Customer makes a payment promise'],
  ['full', 'Full control room', 'All seven stages', 'End-to-end simulation'],
] as const;

function DemoPage() {
  const runDemo = useRunDemo();
  const [result, setResult] = useState<RunResult | null>(null);
  const run = (scenario: (typeof scenarios)[number][0]) => runDemo.mutate({ scenario }, { onSuccess: (response) => { setResult(response); queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetOpportunitiesQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetAuditQueryKey() }); } });
  return <><PageHeader eyebrow="Simulation lab / demo center" title="Demo Center" subtitle="Walk through the seven-stage recovery model with safe, repeatable INR scenarios. Nothing here contacts a customer or moves money." action={<span className="status-pill status-warning"><span className="status-dot" />Simulation only</span>} /><div className="grid gap-5 xl:grid-cols-[1fr_.7fr]"><section className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6" data-testid="section-demo-scenarios"><div className="mb-5 flex items-center justify-between"><div><p className="section-kicker">Scenario library</p><h2 className="section-title">Choose a recovery story</h2></div><span className="font-mono-ui text-[10px] text-muted-foreground">8 scenarios</span></div><div className="grid gap-2 sm:grid-cols-2">{scenarios.map(([key, title, subtitle, description], i) => <button className="group rounded-lg border border-border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/5" onClick={() => run(key)} disabled={runDemo.isPending} key={key} data-testid={`button-demo-${key}`}><div className="flex items-start justify-between"><span className="font-mono-ui text-[10px] text-primary">0{i + 1}</span><Play className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" /></div><p className="mt-5 text-sm font-extrabold">{title}</p><p className="mt-1 text-[10px] font-semibold text-primary">{subtitle}</p><p className="mt-2 text-[10px] leading-4 text-muted-foreground">{description}</p></button>)}</div>{runDemo.isPending && <div className="mt-4 flex items-center gap-3 rounded-lg bg-secondary p-3 text-xs" data-testid="status-demo-running"><ActivityIcon className="h-4 w-4 animate-pulse text-primary" />Running stages and recording decisions…</div>}{runDemo.isError && <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-800" data-testid="status-demo-error">The simulation could not complete. Choose the scenario again to retry.</div>}</section><DemoResult result={result} /></div></>;
}

function DemoResult({ result }: { result: RunResult | null }) {
  if (!result) return <section className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-6 text-center" data-testid="empty-demo-result"><div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary"><Play className="h-6 w-6" /></div><p className="section-kicker">Run output</p><h2 className="mt-2 text-lg font-extrabold">Pick a scenario to see the agent work</h2><p className="mt-2 max-w-xs text-xs leading-5 text-muted-foreground">Each run returns stage results, audit events, and a simulated outcome you can inspect with your team.</p></section>;
  return <section className="rounded-xl border border-primary/25 bg-card p-5 shadow-sm md:p-6 animate-rise" data-testid="section-demo-result"><div className="flex items-start justify-between gap-3"><div><p className="section-kicker text-primary">Run complete</p><h2 className="mt-1 text-xl font-extrabold tracking-[-0.04em]">{result.title}</h2><p className="mt-2 text-xs leading-5 text-muted-foreground">{result.message}</p></div><StatusPill value={result.status} /></div><div className="mt-6 grid grid-cols-3 gap-2"><div className="rounded-lg bg-secondary p-3"><p className="detail-label">At risk</p><p className="mt-2 font-mono-ui text-sm">{formatINR(result.amountAtRisk)}</p></div><div className="rounded-lg bg-secondary p-3"><p className="detail-label">Expected</p><p className="mt-2 font-mono-ui text-sm">{formatINR(result.expectedRecovery)}</p></div><div className="rounded-lg bg-primary/10 p-3"><p className="detail-label text-primary">Actual</p><p className="mt-2 font-mono-ui text-sm text-primary">{formatINR(result.actualRecovery)}</p></div></div><div className="mt-6"><p className="section-kicker">Stage results</p><div className="mt-3 space-y-2">{result.stages.map((stage, i) => <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5" key={`${stage.name}-${i}`}><span className="font-mono-ui text-[9px] text-muted-foreground">0{i + 1}</span><CheckCircle2 className="h-4 w-4 text-primary" /><span className="text-xs font-semibold">{stage.name}</span><span className="ml-auto text-[10px] text-muted-foreground">{stage.result}</span></div>)}</div></div><div className="mt-5 flex items-center gap-2 text-[10px] text-muted-foreground"><FileCheck2 className="h-3.5 w-3.5 text-primary" />{result.auditEvents.length} audit events recorded</div></section>;
}

function SettingsPage() {
  const [saved, setSaved] = useState(false);
  return <><PageHeader eyebrow="Workspace / context" title="Settings" subtitle="Configure how your team reads the REVIVE control room and how simulation data is identified." /><div className="grid gap-5 lg:grid-cols-2"><section className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6" data-testid="section-settings-workspace"><p className="section-kicker">Workspace</p><h2 className="section-title">Ops context</h2><div className="mt-5 space-y-4"><label className="block"><span className="detail-label">Workspace name</span><input className="control-input mt-2" defaultValue="Northstar Fintech Ops" data-testid="input-workspace-name" /></label><label className="block"><span className="detail-label">Base currency</span><select className="control-input mt-2" defaultValue="INR" data-testid="select-base-currency"><option value="INR">INR · Indian Rupee</option></select></label><label className="flex items-center justify-between rounded-lg border border-border px-4 py-3"><span><span className="block text-xs font-bold">Show simulation labels</span><span className="mt-1 block text-[10px] text-muted-foreground">Keep demo context visible on every surface</span></span><input type="checkbox" defaultChecked className="toggle-control" data-testid="checkbox-simulation-labels" /></label></div><div className="mt-6 flex items-center gap-3"><button className="primary-button" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 1800); }} data-testid="button-save-settings"><Check className="h-3.5 w-3.5" />{saved ? 'Preferences saved' : 'Save preferences'}</button>{saved && <span className="text-[10px] font-semibold text-primary">Workspace context updated locally.</span>}</div></section><section className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-6" data-testid="section-settings-provider"><p className="section-kicker">Simulation / provider</p><h2 className="section-title">Connected context</h2><div className="mt-5 space-y-3">{[['Environment', 'Demo / sandbox'], ['Recovery provider', 'REVIVE simulation engine'], ['Last data refresh', '17 Jun 2024 · 11:42 IST'], ['API status', 'Healthy · 142ms']].map(([label, value]) => <div className="flex items-center justify-between border-b border-border py-3 text-xs" key={label}><span className="text-muted-foreground">{label}</span><span className="flex items-center gap-2 font-semibold"><span className="h-1.5 w-1.5 rounded-full bg-primary" />{value}</span></div>)}</div><div className="mt-5 rounded-lg border border-orange-200 bg-orange-50 p-3 text-[10px] leading-4 text-orange-900"><AlertCircle className="mr-1 inline h-3.5 w-3.5" />This workspace uses synthetic INR data. No live payment provider or customer channel is connected.</div></section></div></>;
}

function SearchPage() {
  const [query, setQuery] = useState('');
  const { data, isLoading } = useSearch({ q: query }, { query: { enabled: query.length > 1, queryKey: getSearchQueryKey({ q: query }) } });
  const results = data || [];
  return <><PageHeader eyebrow="Global search" title="Search records" subtitle="Find an opportunity, customer, workflow, or audit event across the control room." /><div className="max-w-2xl"><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} className="control-input pl-9" placeholder="Search by ID, name, or cause" data-testid="input-global-search" /></div><div className="mt-4 rounded-xl border border-border bg-card shadow-sm">{isLoading && <div className="p-4"><SkeletonBlock className="h-14" /></div>}{!isLoading && query.length > 1 && results.length === 0 && <EmptyState title="No records found" message="Try a shorter query or search for a customer company." />}{results.map((result) => <Link href={result.kind === 'opportunity' ? `/opportunities/${result.id}` : '/audit'} className="flex items-center justify-between border-b border-border p-4 text-xs last:border-0 hover:bg-secondary/50" key={result.id} data-testid={`link-search-result-${result.id}`}><div><p className="font-bold">{result.title}</p><p className="mt-1 text-[10px] text-muted-foreground">{result.subtitle}</p></div><span className="status-pill status-neutral">{result.kind}</span></Link>)}</div></div></>;
}

function NotFoundPage() {
  return <div className="flex min-h-[60vh] flex-col items-center justify-center text-center"><div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary"><AlertCircle className="h-6 w-6" /></div><p className="section-kicker">404 / route not found</p><h1 className="mt-2 text-3xl font-extrabold tracking-[-.05em]">This view is not in the control room.</h1><p className="mt-2 text-sm text-muted-foreground">The route may have moved, or the simulation has not exposed it yet.</p><Link href="/" className="primary-button mt-6" data-testid="link-back-control-room">Back to control room</Link></div>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function Router() {
  return <AppShell><RoutedErrorBoundary><Switch><Route path="/" component={DashboardPage} /><Route path="/opportunities" component={OpportunitiesPage} /><Route path="/opportunities/:id" component={OpportunitiesPage} /><Route path="/agent" component={AgentPage} /><Route path="/workflows" component={WorkflowsPage} /><Route path="/payments" component={() => <SurfacePage kind="payment" title="Payments" subtitle="Detect degraded payment performance before a soft decline becomes permanent churn." />} /><Route path="/checkout" component={() => <SurfacePage kind="checkout" title="Checkout" subtitle="Recover high-intent checkout sessions with a precise, consent-aware next action." />} /><Route path="/subscriptions" component={() => <SurfacePage kind="subscription" title="Subscriptions" subtitle="Protect recurring revenue when payment methods fail or renewal intent changes." />} /><Route path="/receivables" component={() => <SurfacePage kind="receivable" title="Receivables" subtitle="Bring B2B overdue invoices into a shared context with promise-to-pay signals." />} /><Route path="/customers" component={CustomersPage} /><Route path="/customers/:id" component={CustomersPage} /><Route path="/analytics" component={AnalyticsPage} /><Route path="/audit" component={AuditPage} /><Route path="/guardrails" component={GuardrailsPage} /><Route path="/demo" component={DemoPage} /><Route path="/settings" component={SettingsPage} /><Route path="/search" component={SearchPage} /><Route component={NotFoundPage} /></Switch></RoutedErrorBoundary></AppShell>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;