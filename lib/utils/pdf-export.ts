import jsPDF from 'jspdf';
import type { DayPlan } from '@/types/trip-planner';
import { calculateDayCost } from '@/types/trip-planner';
import type { ExpenseDisplay } from '@/lib/validations/expense';
import type { ItineraryItem } from '@/lib/types/itinerary';

interface WeatherDayData {
  date: string;
  tempMin: number;
  tempMax: number;
  weatherIcon: string;
  weatherDescription: string;
  precipitationProb: number;
}

interface PackingListData {
  name?: string;
  luggageType: string;
  weightLimit: number;
  totalWeight: number;
  items: Array<{
    category: string;
    name: string;
    quantity: number;
    weightPerItem: number;
    totalWeight: number;
    essential: boolean;
  }>;
  tips: string[];
  warnings: string[];
}

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
  isPremium?: boolean;
  weatherData?: {
    days: WeatherDayData[];
  };
  packingLists?: PackingListData[];
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
    // Premium translations (optional)
    pdfItinerary?: string;
    pdfWeather?: string;
    pdfPackingList?: string;
    pdfWeight?: string;
    pdfEssential?: string;
    pdfItems?: string;
    pdfTime?: string;
    pdfLocation?: string;
    pdfNotes?: string;
    pdfPremium?: string;
    pdfActivitiesPlanned?: string;
    pdfExpensesTracked?: string;
    pdfTemperature?: string;
    pdfPrecipitation?: string;
    pdfTips?: string;
    pdfWarnings?: string;
    pdfOf?: string;
    pdfTripStats?: string;
    pdfDaysPlanned?: string;
  };
}

// Category emoji map
const categoryEmoji: Record<string, string> = {
  ACCOMMODATION: '🏨',
  FOOD: '🍽️',
  TRANSPORT: '🚌',
  ACTIVITIES: '🎯',
  SHOPPING: '🛍️',
  OTHER: '📦',
};

export async function exportTripToPDF(data: PDFExportData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  const isPremium = data.isPremium === true;

  // Helper function to check if we need a new page
  const checkNewPage = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
      return true;
    }
    return false;
  };

  // Helper to draw section title
  const drawSectionTitle = (title: string) => {
    checkNewPage(20);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(title, 15, yPosition);
    yPosition += 10;
  };

  // ─────────────────────────────────────────────
  // HEADER
  // ─────────────────────────────────────────────
  if (data.logoDataUrl) {
    try {
      const logoWidth = 50;
      const logoHeight = 16.7;
      const logoX = isPremium ? (pageWidth - logoWidth) / 2 - 20 : (pageWidth - logoWidth) / 2;
      doc.addImage(
        data.logoDataUrl,
        'PNG',
        logoX,
        yPosition,
        logoWidth,
        logoHeight
      );

      // Premium badge next to logo
      if (isPremium) {
        const badgeX = logoX + logoWidth + 4;
        const badgeY = yPosition + 4;
        doc.setFillColor(234, 179, 8); // Gold
        doc.roundedRect(badgeX, badgeY, 28, 9, 2, 2, 'F');
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(data.translations.pdfPremium || 'PREMIUM', badgeX + 14, badgeY + 6.2, { align: 'center' });
      }
      yPosition += 22;
    } catch {
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text('TripCalc', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;
    }
  } else {
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text('TripCalc', pageWidth / 2, yPosition, { align: 'center' });
    if (isPremium) {
      doc.setFillColor(234, 179, 8);
      const badgeX = pageWidth / 2 + 28;
      doc.roundedRect(badgeX, yPosition - 8, 28, 9, 2, 2, 'F');
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.text(data.translations.pdfPremium || 'PREMIUM', badgeX + 14, yPosition - 1.8, { align: 'center' });
    }
    yPosition += 10;
  }

  // Trip Name
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text(data.tripName, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // ─────────────────────────────────────────────
  // TRIP DETAILS BOX
  // ─────────────────────────────────────────────
  doc.setFillColor(249, 250, 251);
  doc.rect(15, yPosition, pageWidth - 30, 35, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPosition += 8;

  doc.setFont('helvetica', 'bold');
  doc.text(`${data.translations.city}:`, 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(data.cityName, 45, yPosition);
  yPosition += 7;

  if (data.startDate) {
    doc.setFont('helvetica', 'bold');
    doc.text(`${data.translations.dates}:`, 20, yPosition);
    doc.setFont('helvetica', 'normal');
    const dateText = data.endDate ? `${data.startDate} - ${data.endDate}` : data.startDate;
    doc.text(dateText, 45, yPosition);
    yPosition += 7;
  }

  doc.setFont('helvetica', 'bold');
  doc.text(`${data.translations.duration}:`, 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.days} ${data.days === 1 ? data.translations.day : data.translations.days}`, 45, yPosition);
  yPosition += 7;

  doc.setFont('helvetica', 'bold');
  doc.text(`${data.translations.style}:`, 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(data.tripStyle, 45, yPosition);
  yPosition += 15;

  // ─────────────────────────────────────────────
  // BUDGET BREAKDOWN
  // ─────────────────────────────────────────────
  checkNewPage(50);
  drawSectionTitle(data.translations.budgetBreakdown);

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
    doc.setTextColor(0, 0, 0);
    doc.text(item.label, xPos, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `${data.currencySymbol}${item.value.toFixed(0)} ${data.translations.perDay}`,
      xPos,
      yPos + 5
    );
  });
  yPosition += 35;

  // ─────────────────────────────────────────────
  // DAILY BREAKDOWN
  // ─────────────────────────────────────────────
  checkNewPage(60);
  drawSectionTitle(data.translations.dailyBreakdown);

  doc.setFontSize(9);
  data.dailyPlans.forEach((day) => {
    checkNewPage(10);

    const dayCost = calculateDayCost(day, data.costs);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
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
  doc.setTextColor(0, 0, 0);
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

  // ─────────────────────────────────────────────
  // BUDGET VS ACTUAL (if expenses exist)
  // ─────────────────────────────────────────────
  if (data.expenses && data.expenses.length > 0) {
    checkNewPage(40);
    drawSectionTitle(data.translations.budgetVsActual);

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
    doc.setTextColor(0, 0, 0);
    doc.text(data.translations.budgeted, pageWidth / 2 - 10, yPosition, { align: 'right' });
    doc.text(data.translations.actual, pageWidth / 2 + 10, yPosition);
    yPosition += 6;

    Object.entries(budgetByCategory).forEach(([category, budgetAmount]) => {
      checkNewPage(8);

      const actualAmount = actualByCategory[category as keyof typeof actualByCategory];
      const categoryLabel = category.charAt(0) + category.slice(1).toLowerCase();

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(categoryLabel, 15, yPosition);

      doc.text(`${data.currencySymbol}${budgetAmount.toFixed(0)}`, pageWidth / 2 - 10, yPosition, { align: 'right' });

      doc.setFont('helvetica', 'bold');
      const isOver = actualAmount > budgetAmount;
      if (isOver) doc.setTextColor(220, 38, 38);
      doc.text(`${data.currencySymbol}${actualAmount.toFixed(0)}`, pageWidth / 2 + 10, yPosition);
      doc.setTextColor(0, 0, 0);

      yPosition += 6;
    });

    yPosition += 10;
  }

  // ═════════════════════════════════════════════
  // PREMIUM SECTIONS
  // ═════════════════════════════════════════════
  if (isPremium) {
    // ─────────────────────────────────────────
    // DETAILED ITINERARY (activities per day)
    // ─────────────────────────────────────────
    const hasAnyActivities = data.dailyPlans.some(d => d.customItems.length > 0);
    if (hasAnyActivities) {
      checkNewPage(30);
      drawSectionTitle(data.translations.pdfItinerary || 'Daily Itinerary');

      data.dailyPlans.forEach((day) => {
        const items = day.customItems as ItineraryItem[];
        if (items.length === 0) return;

        checkNewPage(20);

        // Day header
        const dayLabel = day.date || `${data.translations.day} ${day.dayNumber}`;
        const dayTitle = day.dayName ? `${dayLabel} - ${day.dayName}` : dayLabel;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(37, 99, 235);
        doc.text(dayTitle, 15, yPosition);
        yPosition += 7;

        // Sort by time if available
        const sortedItems = [...items].sort((a, b) => {
          if (!a.timeSlot?.startTime && !b.timeSlot?.startTime) return 0;
          if (!a.timeSlot?.startTime) return 1;
          if (!b.timeSlot?.startTime) return -1;
          return a.timeSlot.startTime.localeCompare(b.timeSlot.startTime);
        });

        sortedItems.forEach((item) => {
          if (item.isBaseEstimate) return; // Skip base estimate items

          checkNewPage(18);

          doc.setFontSize(9);
          doc.setTextColor(0, 0, 0);
          const emoji = categoryEmoji[item.category] || '';

          // Line 1: Name + category emoji + cost
          doc.setFont('helvetica', 'bold');
          const itemName = `${emoji} ${item.name}`;
          doc.text(itemName, 20, yPosition);

          const cost = (item.amount * item.visits) / 100;
          doc.text(`${data.currencySymbol}${cost.toFixed(2)}`, pageWidth - 25, yPosition, { align: 'right' });
          yPosition += 5;

          // Line 2: Time + Location (if available)
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(107, 114, 128);
          const details: string[] = [];

          if (item.timeSlot?.startTime) {
            const timeStr = item.timeSlot.endTime
              ? `${item.timeSlot.startTime} - ${item.timeSlot.endTime}`
              : item.timeSlot.startTime;
            details.push(timeStr);
          }

          if (item.location?.address) {
            details.push(item.location.address);
          }

          if (details.length > 0) {
            const detailText = details.join(' | ');
            // Truncate if too long
            const maxWidth = pageWidth - 40;
            const truncated = doc.getTextWidth(detailText) > maxWidth
              ? detailText.substring(0, 70) + '...'
              : detailText;
            doc.text(truncated, 20, yPosition);
            yPosition += 4;
          }

          // Line 3: Notes (if available)
          if (item.notes) {
            doc.setFontSize(8);
            doc.setTextColor(156, 163, 175);
            const noteText = item.notes.length > 80 ? item.notes.substring(0, 80) + '...' : item.notes;
            doc.text(noteText, 20, yPosition);
            yPosition += 4;
          }

          yPosition += 2;
        });

        yPosition += 4;
      });
    }

    // ─────────────────────────────────────────
    // WEATHER FORECAST
    // ─────────────────────────────────────────
    if (data.weatherData && data.weatherData.days.length > 0) {
      checkNewPage(40);
      drawSectionTitle(data.translations.pdfWeather || 'Weather Forecast');

      // Table header
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(107, 114, 128);

      const colDate = 15;
      const colWeather = 55;
      const colTemp = 120;
      const colRain = 165;

      doc.text(data.translations.dates || 'Date', colDate, yPosition);
      doc.text(data.translations.pdfWeather || 'Weather', colWeather, yPosition);
      doc.text(data.translations.pdfTemperature || 'Temperature', colTemp, yPosition);
      doc.text(data.translations.pdfPrecipitation || 'Rain %', colRain, yPosition);
      yPosition += 2;

      doc.setDrawColor(229, 231, 235);
      doc.line(15, yPosition, pageWidth - 15, yPosition);
      yPosition += 5;

      doc.setFontSize(8);
      data.weatherData.days.forEach((day) => {
        checkNewPage(8);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(day.date, colDate, yPosition);

        // Weather icon + description
        const weatherText = `${day.weatherIcon} ${day.weatherDescription}`;
        const truncWeather = weatherText.length > 30 ? weatherText.substring(0, 30) + '...' : weatherText;
        doc.text(truncWeather, colWeather, yPosition);

        // Temp
        doc.text(`${day.tempMin.toFixed(0)}° / ${day.tempMax.toFixed(0)}°`, colTemp, yPosition);

        // Rain %
        const rainColor = day.precipitationProb > 60 ? [220, 38, 38] : day.precipitationProb > 30 ? [234, 179, 8] : [34, 197, 94];
        doc.setTextColor(rainColor[0], rainColor[1], rainColor[2]);
        doc.text(`${day.precipitationProb}%`, colRain, yPosition);
        doc.setTextColor(0, 0, 0);

        yPosition += 6;
      });

      yPosition += 8;
    }

    // ─────────────────────────────────────────
    // PACKING LISTS
    // ─────────────────────────────────────────
    if (data.packingLists && data.packingLists.length > 0) {
      data.packingLists.forEach((list) => {
        checkNewPage(40);
        const listTitle = list.name
          ? `${data.translations.pdfPackingList || 'Packing List'}: ${list.name}`
          : `${data.translations.pdfPackingList || 'Packing List'} (${list.luggageType})`;
        drawSectionTitle(listTitle);

        // Weight summary bar
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(107, 114, 128);
        const weightKg = (list.totalWeight / 1000).toFixed(1);
        const limitKg = (list.weightLimit / 1000).toFixed(1);
        const isOverWeight = list.totalWeight > list.weightLimit;
        doc.text(
          `${data.translations.pdfWeight || 'Weight'}: ${weightKg} kg ${data.translations.pdfOf || 'of'} ${limitKg} kg`,
          15,
          yPosition
        );
        if (isOverWeight) {
          doc.setTextColor(220, 38, 38);
          doc.setFont('helvetica', 'bold');
          doc.text('!', 15 + doc.getTextWidth(`${data.translations.pdfWeight || 'Weight'}: ${weightKg} kg ${data.translations.pdfOf || 'of'} ${limitKg} kg`) + 3, yPosition);
        }
        yPosition += 7;

        // Group items by category
        const byCategory: Record<string, typeof list.items> = {};
        list.items.forEach((item) => {
          if (!byCategory[item.category]) byCategory[item.category] = [];
          byCategory[item.category].push(item);
        });

        Object.entries(byCategory).forEach(([category, items]) => {
          checkNewPage(15);

          // Category header
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(55, 65, 81);
          doc.text(category, 18, yPosition);
          yPosition += 5;

          // Items
          doc.setFontSize(8);
          items.forEach((item) => {
            checkNewPage(7);

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            const essentialMark = item.essential ? '* ' : '  ';
            const itemText = `${essentialMark}${item.name} (x${item.quantity})`;
            doc.text(itemText, 22, yPosition);

            doc.setTextColor(107, 114, 128);
            const weight = (item.totalWeight / 1000).toFixed(2);
            doc.text(`${weight} kg`, pageWidth - 30, yPosition, { align: 'right' });

            yPosition += 5;
          });

          yPosition += 2;
        });

        // Essential legend
        doc.setFontSize(7);
        doc.setTextColor(107, 114, 128);
        doc.setFont('helvetica', 'italic');
        doc.text(`* = ${data.translations.pdfEssential || 'Essential'}`, 18, yPosition);
        yPosition += 5;

        // Tips
        if (list.tips.length > 0) {
          checkNewPage(15);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(34, 197, 94);
          doc.text(data.translations.pdfTips || 'Tips', 18, yPosition);
          yPosition += 4;

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(55, 65, 81);
          list.tips.slice(0, 3).forEach((tip) => {
            checkNewPage(6);
            const truncTip = tip.length > 90 ? tip.substring(0, 90) + '...' : tip;
            doc.text(`- ${truncTip}`, 20, yPosition);
            yPosition += 4;
          });
          yPosition += 2;
        }

        // Warnings
        if (list.warnings.length > 0) {
          checkNewPage(15);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(220, 38, 38);
          doc.text(data.translations.pdfWarnings || 'Warnings', 18, yPosition);
          yPosition += 4;

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(55, 65, 81);
          list.warnings.slice(0, 3).forEach((warning) => {
            checkNewPage(6);
            const truncWarning = warning.length > 90 ? warning.substring(0, 90) + '...' : warning;
            doc.text(`- ${truncWarning}`, 20, yPosition);
            yPosition += 4;
          });
        }

        yPosition += 8;
      });
    }

    // ─────────────────────────────────────────
    // TRIP STATISTICS (Premium summary)
    // ─────────────────────────────────────────
    checkNewPage(40);
    drawSectionTitle(data.translations.pdfTripStats || 'Trip Statistics');

    const totalActivities = data.dailyPlans.reduce(
      (sum, day) => sum + day.customItems.filter(i => !(i as ItineraryItem).isBaseEstimate).length,
      0
    );
    const totalExpenses = data.expenses?.length || 0;

    doc.setFillColor(249, 250, 251);
    doc.rect(15, yPosition, pageWidth - 30, 28, 'F');

    doc.setFontSize(10);
    const statsY = yPosition + 10;
    const col1 = pageWidth / 4;
    const col2 = pageWidth / 2;
    const col3 = (pageWidth * 3) / 4;

    // Days planned
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text(String(data.days), col1, statsY, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(data.translations.pdfDaysPlanned || 'Days Planned', col1, statsY + 6, { align: 'center' });

    // Activities
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text(String(totalActivities), col2, statsY, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(data.translations.pdfActivitiesPlanned || 'Activities Planned', col2, statsY + 6, { align: 'center' });

    // Expenses tracked
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text(String(totalExpenses), col3, statsY, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(data.translations.pdfExpensesTracked || 'Expenses Tracked', col3, statsY + 6, { align: 'center' });

    yPosition += 35;
  }

  // ─────────────────────────────────────────────
  // FOOTER
  // ─────────────────────────────────────────────
  const footerText = isPremium
    ? `${data.translations.generatedBy} TripCalc Premium - tripcalc.site`
    : `${data.translations.generatedBy} TripCalc - tripcalc.site`;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(107, 114, 128);
  doc.text(
    footerText,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );

  // Save PDF
  const fileName = `${data.tripName.replace(/[^a-z0-9]/gi, '_')}_trip.pdf`;
  doc.save(fileName);
}
