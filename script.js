function calculateEscrow() {
  const annualTax = parseFloat(annualTaxInput.value) || 0;
  const monthlyTax = annualTax / 12;
  monthlyTaxSpan.textContent = monthlyTax.toFixed(2);

  const closingDate = new Date(closingDateInput.value);
  if (isNaN(closingDate)) return;

  const closingMonth = closingDate.getMonth(); // 0-11
  const closingYear = closingDate.getFullYear();

  // Determine next due date (Jan or Jul)
  let nextTaxDue;
  if (closingMonth < 6) {
    nextTaxDue = new Date(closingYear, 6, 1); // July 1
  } else {
    nextTaxDue = new Date(closingYear + 1, 0, 1); // Jan 1 next year
  }

  // Months needed upfront (+1 cushion month)
  let monthsUpfront = (nextTaxDue.getMonth() - closingMonth + 12) % 12 + 1;
  monthsUpfrontSpan.textContent = monthsUpfront;

  // Seller credit calculation
  const halfYearTax = annualTax / 2;
  let periodStart, periodEnd;
  if (closingMonth < 6) {
    periodStart = new Date(closingYear, 0, 1); // Jan 1
    periodEnd = new Date(closingYear, 6, 1);   // Jul 1
  } else {
    periodStart = new Date(closingYear, 6, 1); // Jul 1
    periodEnd = new Date(closingYear + 1, 0, 1); // Jan 1 next year
  }

  const totalDaysInPeriod = Math.ceil((periodEnd - periodStart) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.ceil((periodEnd - closingDate) / (1000 * 60 * 60 * 24));
  const dailyRate = halfYearTax / totalDaysInPeriod;
  const sellerCredit = dailyRate * daysRemaining;
  sellerCreditSpan.textContent = sellerCredit.toFixed(2);

  const totalCollectedAdjusted = (monthlyTax * monthsUpfront) - sellerCredit;
  totalEscrowSpan.textContent = totalCollectedAdjusted.toFixed(2);

  // First payment assumed 2 months after closing
  const firstPaymentDate = new Date(closingDate);
  firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 2);
  firstPaymentDate.setDate(1);

  drawTimeline(closingDate, firstPaymentDate);
}
