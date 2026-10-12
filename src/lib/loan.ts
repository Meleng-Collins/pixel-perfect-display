import Decimal from 'decimal.js';

export function calculateLoan(principal: number, annualRate: number, months: number, fees = 0) {
  if (!Number.isFinite(principal) || principal <= 0 || !Number.isFinite(annualRate) || annualRate < 0 || !Number.isInteger(months) || months < 1 || months > 600 || !Number.isFinite(fees) || fees < 0) return null;
  const p = new Decimal(principal);
  const rate = new Decimal(annualRate).div(1200);
  const factor = rate.plus(1).pow(months);
  const payment = rate.isZero() ? p.div(months) : p.mul(rate).mul(factor).div(factor.minus(1));
  let balance = p;
  const rows = Array.from({ length: months }, (_, i) => {
    const interest = balance.mul(rate);
    const capital = i === months - 1 ? balance : Decimal.min(payment.minus(interest), balance);
    balance = balance.minus(capital);
    return { month: i + 1, payment: capital.plus(interest).toNumber(), principal: capital.toNumber(), interest: interest.toNumber(), balance: balance.toNumber() };
  });
  const total = rate.isZero() ? p : rows.reduce((sum, row) => sum.plus(row.payment), new Decimal(0));
  return { payment: payment.toNumber(), interest: total.minus(p).toNumber(), total: total.toNumber(), payable: total.plus(fees).toNumber(), rows };
}