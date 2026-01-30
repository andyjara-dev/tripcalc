import jsPDF from 'jspdf';
import type { DayPlan } from '@/types/trip-planner';
import { calculateDayCost } from '@/types/trip-planner';
import type { ExpenseDisplay } from '@/lib/validations/expense';

interface PDFExportData {
  tripName: string;
  cityName: string;
  startDate: string | null;
  endDate: string | null;
  days: number;
  tripStyle: string;
  currencySymbol: string;
  costs: {
    accommodation: number;
    food: number;
    transport: number;
    activities: number;
  };
  dailyPlans: DayPlan[];
  tripTotal: number;
  expenses?: ExpenseDisplay[];
  logoDataUrl?: string;
  translations: {
    tripDetails: string;
    city: string;
    dates: string;
    duration: string;
    style: string;
    budgetBreakdown: string;
    accommodation: string;
    food: string;
    transport: string;
    activities: string;
    perDay: string;
    dailyBreakdown: string;
    day: string;
    days: string;
    totalTrip: string;
    averagePerDay: string;
    budgetVsActual: string;
    budgeted: string;
    actual: string;
    generatedBy: string;
  };
}

export async function exportTripToPDF(data: PDFExportData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Helper function to check if we need a new page
  const checkNewPage = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
      return true;
    }
    return false;
  };

  // Header - TripCalc Logo
  if (data.logoDataUrl) {
    try {
      // Add logo image centered - increased size for better visibility
      const logoWidth = 70; // Increased from 40
      const logoHeight = 23; // Maintain aspect ratio (800x267 = ~3:1)
      doc.addImage(
        data.logoDataUrl,
        'PNG',
        (pageWidth - logoWidth) / 2,
        yPosition,
        logoWidth,
        logoHeight
      );
      yPosition += 28;
    } catch (error) {
      console.error('Error adding logo to PDF:', error);
      // Fallback to text
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text('TripCalc', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;
    }
  } else {
    // Fallback to text if no logo
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text('TripCalc', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
  }

  // Trip Name
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text(data.tripName, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Trip Details Box
  doc.setFillColor(249, 250, 251); // Gray background
  doc.rect(15, yPosition, pageWidth - 30, 35, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPosition += 8;

  // City
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.translations.city}:`, 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(data.cityName, 45, yPosition);
  yPosition += 7;

  // Dates
  if (data.startDate) {
    doc.setFont('helvetica', 'bold');
    doc.text(`${data.translations.dates}:`, 20, yPosition);
    doc.setFont('helvetica', 'normal');
    const dateText = data.endDate ? `${data.startDate} - ${data.endDate}` : data.startDate;
    doc.text(dateText, 45, yPosition);
    yPosition += 7;
  }

  // Duration
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.translations.duration}:`, 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.days} ${data.days === 1 ? data.translations.day : data.translations.days}`, 45, yPosition);
  yPosition += 7;

  // Style
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.translations.style}:`, 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(data.tripStyle, 45, yPosition);
  yPosition += 15;

  // Budget Breakdown Section
  checkNewPage(50);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(data.translations.budgetBreakdown, 15, yPosition);
  yPosition += 10;

  // Budget items in a grid
  const budgetItems = [
    { label: data.translations.accommodation, value: data.costs.accommodation },
    { label: data.translations.food, value: data.costs.food },
    { label: data.translations.transport, value: data.costs.transport },
    { label: data.translations.activities, value: data.costs.activities },
  ];

  doc.setFontSize(10);
  budgetItems.forEach((item, index) => {
    const xPos = 15 + (index % 2) * (pageWidth / 2);
    const yPos = yPosition + Math.floor(index / 2) * 15;

    doc.setFont('helvetica', 'normal');
    doc.text(item.label, xPos, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `${data.currencySymbol}${item.value.toFixed(0)} ${data.translations.perDay}`,
      xPos,
      yPos + 5
    );
  });
  yPosition += 35;

  // Daily Breakdown Section
  checkNewPage(60);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(data.translations.dailyBreakdown, 15, yPosition);
  yPosition += 8;

  doc.setFontSize(9);
  data.dailyPlans.forEach((day) => {
    checkNewPage(10);

    const dayCost = calculateDayCost(day, data.costs);

    doc.setFont('helvetica', 'normal');
    const dayLabel = day.date || `${data.translations.day} ${day.dayNumber}`;
    doc.text(dayLabel, 15, yPosition);

    doc.setFont('helvetica', 'bold');
    doc.text(`${data.currencySymbol}${dayCost.toFixed(2)}`, pageWidth - 40, yPosition);

    yPosition += 6;
  });

  // Total
  yPosition += 5;
  checkNewPage(20);
  doc.setDrawColor(200, 200, 200);
  doc.line(15, yPosition, pageWidth - 15, yPosition);
  yPosition += 8;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(data.translations.totalTrip, 15, yPosition);
  doc.setFontSize(14);
  doc.text(`${data.currencySymbol}${data.tripTotal.toFixed(2)}`, pageWidth - 40, yPosition);
  yPosition += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `${data.translations.averagePerDay}: ${data.currencySymbol}${(data.tripTotal / data.days).toFixed(2)}`,
    15,
    yPosition
  );
  yPosition += 15;

  // Budget vs Actual (if expenses exist)
  if (data.expenses && data.expenses.length > 0) {
    checkNewPage(40);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(data.translations.budgetVsActual, 15, yPosition);
    yPosition += 10;

    // Calculate totals by category
    const actualByCategory = {
      ACCOMMODATION: 0,
      FOOD: 0,
      TRANSPORT: 0,
      ACTIVITIES: 0,
    };

    data.expenses.forEach((expense) => {
      if (expense.category in actualByCategory) {
        actualByCategory[expense.category as keyof typeof actualByCategory] += expense.amount / 100;
      }
    });

    const budgetByCategory = {
      ACCOMMODATION: data.costs.accommodation * data.days,
      FOOD: data.costs.food * data.days,
      TRANSPORT: data.costs.transport * data.days,
      ACTIVITIES: data.costs.activities * data.days,
    };

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(data.translations.budgeted, pageWidth / 2 - 10, yPosition, { align: 'right' });
    doc.text(data.translations.actual, pageWidth / 2 + 10, yPosition);
    yPosition += 6;

    Object.entries(budgetByCategory).forEach(([category, budgetAmount]) => {
      checkNewPage(8);

      const actualAmount = actualByCategory[category as keyof typeof actualByCategory];
      const categoryLabel = category.charAt(0) + category.slice(1).toLowerCase();

      doc.setFont('helvetica', 'normal');
      doc.text(categoryLabel, 15, yPosition);

      doc.text(`${data.currencySymbol}${budgetAmount.toFixed(0)}`, pageWidth / 2 - 10, yPosition, { align: 'right' });

      doc.setFont('helvetica', 'bold');
      const isOver = actualAmount > budgetAmount;
      if (isOver) doc.setTextColor(220, 38, 38); // Red
      doc.text(`${data.currencySymbol}${actualAmount.toFixed(0)}`, pageWidth / 2 + 10, yPosition);
      doc.setTextColor(0, 0, 0); // Reset to black

      yPosition += 6;
    });
  }

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(107, 114, 128); // Gray
  doc.text(
    `${data.translations.generatedBy} TripCalc - tripcalc.site`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );

  // Save PDF
  const fileName = `${data.tripName.replace(/[^a-z0-9]/gi, '_')}_trip.pdf`;
  doc.save(fileName);
}
