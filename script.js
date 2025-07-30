const annualTaxInput = document.getElementById('annualTax');
const closingDateInput = document.getElementById('closingDate');
const monthlyTaxSpan = document.getElementById('monthlyTax');
const monthsUpfrontSpan = document.getElementById('monthsUpfront');
const sellerCreditSpan = document.getElementById('sellerCredit');
const totalEscrowSpan = document.getElementById('totalEscrow');

function calculateEscrow() {
  const annualTax = parseFloat(annualTaxInput.value) || 0;
  const monthlyTax = annualTax / 12;
  monthlyTaxSpan.textContent = monthlyTax.toFixed(2);

  const closingDate = new Date(closingDateInput.value);
  if (isNaN(closingDate)) return;

  const firstPaymentDate = new Date(closingDate);
  firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 2);
  firstPaymentDate.setDate(1);

  let nextTaxDue = new Date(closingDate.getFullYear(), 0, 1);
  if (closingDate > nextTaxDue) nextTaxDue = new Date(closingDate.getFullYear(), 6, 1);
  if (closingDate > nextTaxDue) nextTaxDue = new Date(closingDate.getFullYear() + 1, 0, 1);

  const monthsUntilDue = (nextTaxDue.getFullYear() - closingDate.getFullYear()) * 12 +
                         (nextTaxDue.getMonth() - closingDate.getMonth());

  const monthsBorrowerPays = (nextTaxDue.getFullYear() - firstPaymentDate.getFullYear()) * 12 +
                             (nextTaxDue.getMonth() - firstPaymentDate.getMonth());
  
  const monthsNeededUpfront = Math.max(0, monthsUntilDue - monthsBorrowerPays);
  monthsUpfrontSpan.textContent = monthsNeededUpfront;

  // Seller credit calculation
  const halfYearTax = annualTax / 2;
  const periodStart = closingDate.getMonth() >= 6 
    ? new Date(closingDate.getFullYear(), 6, 1) 
    : new Date(closingDate.getFullYear(), 0, 1);

  const nextPeriodStart = closingDate.getMonth() >= 6
    ? new Date(closingDate.getFullYear() + 1, 0, 1)
    : new Date(closingDate.getFullYear(), 6, 1);

  const totalDaysInPeriod = Math.ceil((nextPeriodStart - periodStart) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.ceil((nextPeriodStart - closingDate) / (1000 * 60 * 60 * 24));

  let sellerCredit = 0;
  if (closingDate > periodStart && closingDate < nextPeriodStart) {
    const dailyRate = halfYearTax / totalDaysInPeriod;
    sellerCredit = dailyRate * daysRemaining;
  }
  sellerCreditSpan.textContent = sellerCredit.toFixed(2);

  const totalCollectedAdjusted = (monthlyTax * monthsNeededUpfront) - sellerCredit;
  totalEscrowSpan.textContent = totalCollectedAdjusted.toFixed(2);

  drawTimeline(closingDate, firstPaymentDate);
}

annualTaxInput.addEventListener('input', calculateEscrow);
closingDateInput.addEventListener('change', calculateEscrow);

function drawTimeline(closingDate, firstPaymentDate) {
  const canvas = document.getElementById('monthTimeline');
  const ctx = canvas.getContext('2d');
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const blockWidth = canvas.width / 12;
  const blockHeight = 40;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  months.forEach((month, i) => {
    ctx.fillStyle = (i < 6) ? "#cccccc" : "#eeeeee";
    ctx.fillRect(i * blockWidth, 20, blockWidth - 2, blockHeight);
    
    if (closingDate.getMonth() === i) {
      ctx.fillStyle = "rgba(54, 162, 235, 0.3)";
      ctx.fillRect(i * blockWidth, 20, blockWidth - 2, blockHeight);

      const daysInMonth = new Date(closingDate.getFullYear(), i+1, 0).getDate();
      const fraction = closingDate.getDate() / daysInMonth;
      ctx.fillStyle = "blue";
      ctx.fillRect(i * blockWidth, 20, (blockWidth - 2) * fraction, blockHeight);
    }
    
    if (firstPaymentDate.getMonth() === i) {
      ctx.strokeStyle = "green";
      ctx.lineWidth = 3;
      ctx.strokeRect(i * blockWidth, 20, blockWidth - 2, blockHeight);
    }
    
    ctx.fillStyle = "black";
    ctx.font = "12px Arial";
    ctx.fillText(month, i * blockWidth + 5, 15);
  });
}
