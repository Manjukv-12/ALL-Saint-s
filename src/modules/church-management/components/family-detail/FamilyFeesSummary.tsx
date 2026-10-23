import type { Family } from '@/modules/church-management/api/types';

import { ui } from './familyDetailTheme';



function formatCurrency(amount: number): string {

  return new Intl.NumberFormat('en-IN', {

    minimumFractionDigits: 0,

    maximumFractionDigits: 0,

  }).format(amount);

}



export function FamilyFeesSummary({ family }: { family: Family }) {

  const fee = family.feeSummary;

  if (!fee) {

    return (

      <div className={`${ui.card} p-10 text-center text-base text-slate-500`}>

        No fee records for this family yet.

      </div>

    );

  }



  const year = new Date().getFullYear();

  const rate =

    fee.totalMembers > 0 ? Math.round((fee.membersPaid / fee.totalMembers) * 100) : 0;



  const items = [

    { label: 'Paid', value: `₹${formatCurrency(fee.totalPaid)}`, hint: `${fee.membersPaid} members` },

    { label: 'Unpaid', value: `₹${formatCurrency(fee.totalUnpaid)}`, hint: `${fee.membersUnpaid} members` },

    { label: 'Total', value: `₹${formatCurrency(fee.totalAmount)}`, hint: `Year ${year}` },

    { label: 'Collected', value: `${rate}%`, hint: 'Of all members' },

  ];



  return (

    <div className={ui.card}>

      <div className={ui.sectionHead}>

        <h2 className={ui.sectionTitle}>Membership fees — {year}</h2>

      </div>

      <div className="grid gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-4 dark:bg-zinc-700">

        {items.map((item) => (

          <div key={item.label} className="bg-white px-6 py-6 dark:bg-zinc-900">

            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>

            <p className="mt-2 font-serif text-3xl font-semibold text-slate-900 dark:text-white">{item.value}</p>

            <p className="mt-1 text-sm text-slate-400">{item.hint}</p>

          </div>

        ))}

      </div>

    </div>

  );

}


