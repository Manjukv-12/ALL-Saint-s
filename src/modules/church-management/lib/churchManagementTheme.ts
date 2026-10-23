/** Shared church management UI — clean, readable admin theme */

export const ui = {
  shell: 'min-h-screen bg-[hsl(var(--background))] dark:bg-zinc-950',
  shellFlex: 'flex h-[100dvh] max-h-[100dvh] overflow-hidden bg-[hsl(var(--background))] dark:bg-zinc-950',

  container: 'mx-auto w-full max-w-7xl px-3 py-4 sm:px-5 sm:py-5 lg:px-6',
  containerWide: 'mx-auto w-full max-w-7xl px-3 py-4 sm:px-5 lg:px-6',
  mainContent: 'flex min-h-0 min-w-0 flex-1 flex-col lg:pl-64',
  mainScroll: 'min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain bg-[hsl(var(--background))] dark:bg-zinc-950',
  /** Horizontal scroll for wide data tables on phones */
  tableScroll: 'overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]',
  /** Filter / search toolbars that wrap cleanly on small screens */
  toolbar: 'flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center',
  toolbarField: 'w-full min-w-0 sm:w-auto sm:min-w-[10rem] sm:flex-1',

  /** Classic navy sidebar — fixed on desktop so main content scrolls independently */
  sidebar:
    'flex w-64 shrink-0 flex-col border-r border-[hsl(214_53%_18%)] bg-[hsl(var(--primary))] text-white shadow-xl lg:fixed lg:inset-y-0 lg:left-0 lg:z-30',
  sidebarBrand:
    'border-b border-white/10 px-5 py-5 text-lg font-semibold leading-tight text-white',
  sidebarBrandSub: 'mt-0.5 block text-sm font-normal text-white/70',
  sidebarNav: 'flex-1 space-y-1 overflow-y-auto px-3 py-4',
  sidebarNavActive:
    'flex items-center gap-3 rounded-lg bg-white/15 px-3 py-2.5 text-sm font-medium text-white',
  sidebarNavIdle:
    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white',
  sidebarIconTile: 'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
  sidebarFooter: 'border-t border-white/10 p-4',
  sidebarUserEmail: 'truncate text-sm text-white/65',
  sidebarLogout:
    'mt-2 w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10',

  /** Mobile top bar */
  mobileBar:
    'flex items-center justify-between gap-2 border-b border-[hsl(var(--border))] bg-white px-3 py-3 dark:border-zinc-800 dark:bg-zinc-900 lg:hidden',
  mobileBarTitle:
    'min-w-0 flex-1 truncate text-center text-sm font-semibold text-[hsl(var(--primary))] sm:text-base dark:text-white',
  mobileMenuBtn:
    'flex shrink-0 items-center gap-2 rounded-lg px-2 py-2 text-[hsl(var(--primary))] transition hover:bg-[hsl(var(--muted))]',
  sidebarIconActive: 'bg-white/25 text-white',
  sidebarIconIdle: 'bg-white/12 text-white/90',

  card: 'rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] dark:border-zinc-800 dark:bg-zinc-900',
  cardHover:
    'rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] transition hover:border-[hsl(var(--primary))]/30 dark:border-zinc-800 dark:bg-zinc-900',

  pageHeader: 'flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4',
  pageHeaderActions: 'flex w-full flex-wrap items-center gap-2 sm:w-auto sm:gap-3',
  pageHeaderIcon:
    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--muted))] text-[hsl(var(--primary))] dark:bg-zinc-800 dark:text-white',
  title: 'text-xl font-semibold tracking-tight text-[hsl(var(--foreground))] sm:text-2xl dark:text-white',
  titleCompact: 'text-xl font-semibold tracking-tight text-[hsl(var(--foreground))] dark:text-white',
  subtitle: 'mt-0.5 text-[15px] leading-snug text-[hsl(var(--muted-foreground))] dark:text-zinc-400',
  subtitleCompact: 'mt-0.5 text-sm leading-snug text-[hsl(var(--muted-foreground))] dark:text-zinc-400',

  breadcrumb:
    'inline-flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--primary))] dark:text-zinc-400 dark:hover:text-white',
  breadcrumbCurrent: 'text-sm font-medium text-[hsl(var(--foreground))] dark:text-zinc-300',
  breadcrumbSep: 'h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]/50',

  meta: 'flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[hsl(var(--muted-foreground))] dark:text-zinc-400',
  metaIcon: 'h-4 w-4 shrink-0 text-[hsl(var(--link))]',

  badge:
    'rounded-md bg-[hsl(var(--primary))] px-2.5 py-0.5 text-xs font-medium text-white dark:bg-zinc-200 dark:text-zinc-900',

  btnPrimary:
    'cm-btn-primary inline-flex items-center justify-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[hsl(var(--primary-hover))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] disabled:opacity-50',
  btnOutline:
    'cm-btn-outline inline-flex items-center justify-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-white px-4 py-2.5 text-sm font-medium text-[hsl(var(--primary))] transition hover:bg-[hsl(var(--muted))] dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800',
  /** Use on primary actions in page headers so they fill width on phones */
  btnHeader: 'w-full justify-center sm:w-auto',
  btnGhost:
    'cm-btn-ghost inline-flex items-center justify-center gap-1.5 rounded-lg border border-[hsl(var(--border))] px-2.5 py-1.5 text-sm font-medium text-[hsl(var(--foreground))] transition hover:bg-[hsl(var(--muted))] dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800',
  btnDanger:
    'cm-btn-danger inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-800 transition hover:bg-red-100 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200 dark:hover:bg-red-950/60',
  btnSecondary:
    'cm-btn-secondary inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700',

  input:
    'w-full rounded-lg border border-[hsl(var(--input))] bg-white px-4 py-2.5 text-base text-[hsl(var(--foreground))] transition focus:border-[hsl(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200',
  select:
    'w-full rounded-lg border border-[hsl(var(--input))] bg-white px-3 py-2.5 text-base text-[hsl(var(--foreground))] sm:w-auto sm:px-4 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200',

  tabRow:
    'flex gap-1 overflow-x-auto overscroll-x-contain border-b border-[hsl(var(--border))] [-webkit-overflow-scrolling:touch] dark:border-zinc-700',
  tabActive:
    'inline-flex shrink-0 items-center gap-2 border-b-2 border-[hsl(var(--primary))] px-3 py-3 text-sm font-medium text-[hsl(var(--primary))] sm:px-4 dark:border-[hsl(var(--link))] dark:text-white',
  tabIdle:
    'inline-flex shrink-0 items-center gap-2 border-b-2 border-transparent px-3 py-3 text-sm font-medium text-slate-600 transition hover:text-[hsl(var(--primary))] sm:px-4 dark:text-zinc-400 dark:hover:text-zinc-200',
  tabIconActive: 'text-[hsl(var(--link))]',
  tabIconIdle: 'text-[hsl(var(--muted-foreground))]/70',

  sectionHead: 'mb-3',
  sectionTitle: 'text-base font-semibold text-[hsl(var(--foreground))] dark:text-zinc-100',
  sectionRow: 'mb-3 flex flex-wrap items-center justify-between gap-2',
  sectionBody: 'p-4',
  dashboardSection: 'space-y-3',

  tableHead:
    'border-b border-slate-200 bg-slate-100 text-left dark:border-zinc-700 dark:bg-zinc-800',
  th: 'whitespace-nowrap px-3 py-2.5 text-sm font-semibold text-slate-800 sm:px-4 sm:py-3 dark:text-zinc-200',
  thCompact: 'whitespace-nowrap px-2.5 py-2 text-sm font-semibold text-slate-800 sm:px-3 sm:py-2.5 dark:text-zinc-200',
  td: 'px-3 py-3 text-sm text-[hsl(var(--foreground))] sm:px-4 sm:py-3.5 sm:text-base dark:text-zinc-300',
  tdCompact: 'px-2.5 py-2.5 text-sm text-[hsl(var(--foreground))] sm:px-3 sm:py-3 sm:text-base dark:text-zinc-300',
  tableMin: 'min-w-full',
  row: 'border-b border-[hsl(var(--border))]/60 transition hover:bg-[hsl(var(--muted))]/40 dark:border-zinc-800 dark:hover:bg-zinc-800/50',
  link: 'text-sm font-medium text-[hsl(var(--primary))] transition hover:text-[hsl(var(--link))] dark:text-white dark:hover:text-[hsl(var(--link))]',

  alertError:
    'rounded-lg border border-red-200 bg-red-50 p-4 text-base text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300',
  alertInfo:
    'rounded-lg border border-amber-200 bg-amber-50 p-4 text-base text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200',

  statGrid: 'grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4',
  statCell:
    'rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3.5 py-3 sm:px-4 sm:py-3.5 dark:border-zinc-800 dark:bg-zinc-900',
  statLabel: 'text-[13px] font-medium leading-tight text-[hsl(var(--foreground))]/70 dark:text-zinc-400',
  statValue:
    'mt-1 text-2xl font-bold tabular-nums leading-none tracking-tight text-[hsl(var(--foreground))] sm:text-[1.65rem] dark:text-white',
  statHint: 'mt-1 text-xs leading-tight text-[hsl(var(--muted-foreground))] dark:text-zinc-500',
  statIcon:
    'mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--muted))] text-[hsl(var(--primary))] dark:bg-zinc-800 dark:text-white',

  actionCard:
    'group flex gap-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 transition hover:bg-[hsl(var(--muted))]/50 dark:border-zinc-800 dark:bg-zinc-900',
  actionIcon: 'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
  actionTitle: 'text-base font-medium text-[hsl(var(--foreground))] dark:text-zinc-100',
  actionDesc: 'mt-0.5 text-sm text-[hsl(var(--muted-foreground))] dark:text-zinc-400',
  actionArrow: 'ml-auto self-center text-[hsl(var(--muted-foreground))]/50',

  avatar:
    'flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))]/15 text-sm font-semibold text-[hsl(var(--primary))] dark:bg-white/15 dark:text-white',

  memberAvatar:
    'flex shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))]/15 text-sm font-semibold text-[hsl(var(--primary))] dark:bg-white/15 dark:text-white',

  /** High-contrast pill badges for family detail headers and tables */
  badgePill:
    'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold leading-snug',
  badgePillNeutral:
    'border-slate-300 bg-slate-100 text-slate-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100',
  badgePillInfo:
    'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-100',
  badgePillWarning:
    'border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100',

  rowActions: 'flex flex-wrap items-center gap-2',
  rowAction:
    'cm-row-action inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition',
  rowActionPrint:
    'cm-row-action-print border border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-200',
  rowActionDownload:
    'cm-row-action-download border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
  rowActionDelete:
    'cm-row-action-delete border border-red-200 bg-red-50 text-red-800 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200',
  rowActionEdit:
    'cm-row-action-edit border border-violet-200 bg-violet-50 text-violet-800 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-200',
  rowActionView:
    'cm-row-action-view border border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200',

  loginShell:
    'church-mgmt-login flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-100 via-white to-slate-100 px-4 py-10 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950',
  loginCard:
    'w-full max-w-[420px] rounded-2xl border border-[hsl(var(--border))] bg-white p-8 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.18)] dark:border-zinc-700 dark:bg-zinc-900 sm:p-10',
  loginLogo:
    'mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--primary))] text-white shadow-md',
  loginTitle:
    'mt-5 text-center text-2xl font-semibold tracking-tight text-[hsl(var(--foreground))] dark:text-white',
  loginSubtitle: 'mt-2 text-center text-sm leading-relaxed text-[hsl(var(--muted-foreground))]',
  loginFooter: 'mt-6 text-center text-xs text-slate-500 dark:text-zinc-500',
  loginDevNote:
    'rounded-lg border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted))]/60 px-3 py-2 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]',

  /** @deprecated use shellFlex + sidebar */
  navBar: 'border-b border-[hsl(var(--border))] bg-white dark:border-zinc-800 dark:bg-zinc-900',
  navBrand: 'text-lg font-semibold text-[hsl(var(--primary))] dark:text-white',
  navLinkActive: 'rounded-lg bg-[hsl(var(--primary))] px-3 py-2 text-sm font-medium text-white',
  navLinkIdle:
    'rounded-lg px-3 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--muted))]',
  page: 'min-h-screen bg-[hsl(var(--background))] dark:bg-zinc-950',
};
