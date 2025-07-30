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

  const closingMonth = closingDate.getMonth(); // 0-11
  const closingYear = closingDate.getFullYear();

  // Next tax due date
  let nextTaxDue;
  if (closingMonth >= 6) {
    nextTaxDue = new Date(closingYear + 1, 0, 1);
  } else {
    nextTaxDue = new Date(closingYear, 6, 1);
  }

  // Months lender needs upfront (+1 cushion)
  let monthsNeededUpfront;
  if (closingMonth >= 6) {
    monthsNeededUpfront = (12 - (closingMonth + 1)) + 1; 
  } else {
    monthsNeededUpfront = (6 - (closingMonth + 1)) + 1; 
  }
  monthsUpfrontSpan.textContent = monthsNeededUpfront;

  // Seller credit
  const halfYearTax = annualTax / 2;
  let periodStart, periodEnd;
  if (closingMonth >= 6) {
    periodStart = new Date(closingYear, 6, 1);
    periodEnd = new Date(closingYear + 1, 0, 1);
  } else {
    periodStart = new Date(closingYear, 0, 1);
    periodEnd = new Date(closingYear, 6, 1);
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const totalDaysInPeriod = Math.ceil((periodEnd - periodStart) / msPerDay);
  const daysRemaining = Math.ceil((periodEnd - closingDate) / msPerDay);
  const sellerCredit = (halfYearTax / totalDaysInPeriod) * daysRemaining;
  sellerCreditSpan.textContent = sellerCredit.toFixed(2);

  const totalCollectedAdjusted = (monthlyTax * monthsNeededUpfront) - sellerCredit;
  totalEscrowSpan.textContent = totalCollectedAdjusted.toFixed(2);

  // First payment month
  const firstPaymentDate = new Date(closingDate);
  firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 2);
  firstPaymentDate.setDate(1);

  drawTimeline(closingDate, firstPaymentDate);
}

annualTaxInput.addEventListener('input', calculateEscrow);
closingDateInput.addEventListener('change', calculateEscrow);

function drawTimeline(closingDate, firstPaymentDate) {
  const canvas = document.getElementById('monthTimeline');
  const ctx = canvas.getContext('2d');
  const allMonths = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const blockWidth = canvas.width / 12;
  const blockHeight = 40;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Rotate months to start from closing month
  const rotatedMonths = [];
  for (let i = 0; i < 12; i++) {
    rotatedMonths.push(allMonths[(closingDate.getMonth() + i) % 12]);
  }

  rotatedMonths.forEach((month, i) => {
    ctx.fillStyle = (i % 12 < 6) ? "#cccccc" : "#eeeeee";
    ctx.fillRect(i * blockWidth, 20, blockWidth - 2, blockHeight);

    if (i === 0) {
      ctx.fillStyle = "rgba(54, 162, 235, 0.3)";
      ctx.fillRect(i * blockWidth, 20, blockWidth - 2, blockHeight);

      const daysInMonth = new Date(closingDate.getFullYear(), closingDate.getMonth() + 1, 0).getDate();
      const fraction = closingDate.getDate() / daysInMonth;
      ctx.fillStyle = "blue";
      ctx.fillRect(i * blockWidth, 20, (blockWidth - 2) * fraction, blockHeight);
    }

    if (i === 2) {
      ctx.strokeStyle = "green";
      ctx.lineWidth = 3;
      ctx.strokeRect(i * blockWidth, 20, blockWidth - 2, blockHeight);
      ctx.fillStyle = "green";
      ctx.font = "10px Arial";
      ctx.fillText("1st Payment", i * blockWidth + 2, 70);
    }

    ctx.fillStyle = "black";
    ctx.font = "12px Arial";
    ctx.fillText(month, i * blockWidth + 5, 15);
  });
}
