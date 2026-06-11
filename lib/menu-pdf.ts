import { jsPDF } from "jspdf";
import type { MenuCategory } from "@/lib/mockData";

export interface PDFRestaurantData {
  name: string;
  description: string;
  phone: string;
  city: string;
  address?: string;
  email?: string;
  currency?: string;
  slug: string;
}

const getCurrencySymbol = (currency?: string) => {
  switch (currency?.toUpperCase()) {
    case "USD":
      return "$";
    case "GBP":
      return "£";
    case "EUR":
      return "€";
    case "GHS":
      return "GH₵";
    case "KES":
      return "KSh";
    default:
      return "₦";
  }
};

export const generateMenuPDF = (
  restaurant: PDFRestaurantData,
  categories: MenuCategory[],
  template: "classic" | "modern" | "elegant",
) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageHeight = 297;
  const pageWidth = 210;
  const marginX = 20;
  const contentWidth = pageWidth - marginX * 2; // 170mm
  let y = 25;

  const currencySymbol = getCurrencySymbol(restaurant.currency);

  // Helper to check and handle page breaks
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 20) {
      drawFooter(doc.getNumberOfPages());
      doc.addPage();
      y = 25;
      drawRunningHeader();
    }
  };

  // Draw running header on subsequent pages
  const drawRunningHeader = () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);

    if (template === "classic") {
      doc.setTextColor(100, 100, 100);
      doc.text(restaurant.name.toUpperCase(), marginX, 15);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.line(marginX, 17, pageWidth - marginX, 17);
    } else if (template === "modern") {
      doc.setTextColor(17, 24, 39);
      doc.text(restaurant.name, marginX, 15);
      doc.setFillColor(13, 148, 136); // Teal bar accent
      doc.rect(marginX, 17, 12, 1.5, "F");
    } else {
      // Elegant
      doc.setTextColor(197, 160, 89); // Gold
      doc.text(restaurant.name, pageWidth / 2, 15, { align: "center" });
      doc.setDrawColor(197, 160, 89);
      doc.setLineWidth(0.15);
      doc.line(marginX, 17, pageWidth - marginX, 17);
    }
    y = 22;
  };

  // Draw footer with page number
  const drawFooter = (pageNum: number) => {
    const footerY = pageHeight - 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);

    // Main QR text footer
    const footerText = `Scan QR Code to Order Online • moji.diner/${restaurant.slug}`;
    doc.text(footerText, marginX, footerY);

    // Page number right aligned
    doc.text(`Page ${pageNum}`, pageWidth - marginX, footerY, {
      align: "right",
    });
  };

  // --- DRAW PAGE BACKGROUND OR SPECIAL LAYOUT BORDERS ---
  const drawPageBackground = () => {
    if (template === "elegant") {
      // Luxury gold double border
      doc.setDrawColor(197, 160, 89); // Gold
      doc.setLineWidth(0.4);
      doc.rect(8, 8, pageWidth - 16, pageHeight - 16);
      doc.setLineWidth(0.15);
      doc.rect(9.5, 9.5, pageWidth - 19, pageHeight - 19);
    }
  };

  drawPageBackground();

  // --- DRAW MAIN HEADER ---
  const drawMainHeader = () => {
    if (template === "classic") {
      // Centered traditional header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(26);
      doc.setTextColor(34, 34, 34); // Charcoal
      doc.text(restaurant.name, pageWidth / 2, y, { align: "center" });
      y += 8;

      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(restaurant.description, pageWidth / 2, y, { align: "center" });
      y += 6;

      // Contact details
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const contactInfo = [
        restaurant.address && `Address: ${restaurant.address}`,
        restaurant.phone && `Tel: ${restaurant.phone}`,
        restaurant.email && `Email: ${restaurant.email}`,
      ]
        .filter(Boolean)
        .join("   |   ");
      doc.text(contactInfo, pageWidth / 2, y, { align: "center" });
      y += 8;

      // Classy thick-thin rule
      doc.setDrawColor(34, 34, 34);
      doc.setLineWidth(0.6);
      doc.line(marginX, y, pageWidth - marginX, y);
      y += 1.5;
      doc.setLineWidth(0.2);
      doc.line(marginX, y, pageWidth - marginX, y);
      y += 10;
    } else if (template === "modern") {
      // Sleek modern header with left accent bar
      doc.setFillColor(249, 250, 251); // Off-white header bg card
      doc.rect(marginX, y - 5, contentWidth, 32, "F");

      // Teal block indicator
      doc.setFillColor(13, 148, 136); // Teal
      doc.rect(marginX, y - 5, 4, 32, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(17, 24, 39); // Gray-900
      doc.text(restaurant.name, marginX + 8, y + 4);
      y += 10;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(75, 85, 99); // Gray-600
      doc.text(restaurant.description, marginX + 8, y + 2);
      y += 6;

      // Phone and location
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128); // Gray-500
      const contactText = `${restaurant.city}   •   ${restaurant.phone}`;
      doc.text(contactText, marginX + 8, y + 1);
      y += 15;
    } else {
      // Elegant Lounge header
      doc.setFont("times", "bolditalic");
      doc.setFontSize(30);
      doc.setTextColor(15, 23, 42); // Deep navy
      doc.text(restaurant.name, pageWidth / 2, y, { align: "center" });
      y += 10;

      doc.setFont("times", "italic");
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139); // Slate
      doc.text(restaurant.description, pageWidth / 2, y, { align: "center" });
      y += 6;

      doc.setFont("times", "normal");
      doc.setFontSize(9.5);
      const contact = [restaurant.address, restaurant.phone]
        .filter(Boolean)
        .join("  *  ");
      doc.text(contact, pageWidth / 2, y, { align: "center" });
      y += 6;

      // Double gold lines with a centered ornament character
      doc.setDrawColor(197, 160, 89); // Gold
      doc.setLineWidth(0.2);
      doc.line(marginX, y, pageWidth / 2 - 10, y);
      doc.line(pageWidth / 2 + 10, y, pageWidth - marginX, y);

      doc.setFont("times", "bold");
      doc.setFontSize(12);
      doc.setTextColor(197, 160, 89);
      doc.text("~", pageWidth / 2, y + 1.2, { align: "center" });
      y += 10;
    }
  };

  drawMainHeader();

  // --- DRAW MENU CONTENT ---
  categories.forEach((category) => {
    // Only render categories that have items
    if (!category.items || category.items.length === 0) return;

    // Check category header height required (approx 20mm)
    checkPageBreak(20);

    // Category title
    if (template === "classic") {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(34, 34, 34);
      doc.text(category.name.toUpperCase(), marginX, y);
      y += 5;

      if (category.description) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text(category.description, marginX, y);
        y += 4;
      }
      // Simple separator rule
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(marginX, y, pageWidth - marginX, y);
      y += 8;
    } else if (template === "modern") {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(17, 24, 39);

      // Draw category title with left teal dot
      doc.setFillColor(13, 148, 136);
      doc.circle(marginX + 1.5, y - 1.5, 1.5, "F");
      doc.text(category.name, marginX + 6, y);
      y += 5;

      if (category.description) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(107, 114, 128);
        doc.text(category.description, marginX + 6, y);
        y += 5;
      }
      y += 4;
    } else {
      // Elegant
      doc.setFont("times", "bolditalic");
      doc.setFontSize(18);
      doc.setTextColor(197, 160, 89); // Gold
      doc.text(category.name, pageWidth / 2, y, { align: "center" });
      y += 6;

      if (category.description) {
        doc.setFont("times", "italic");
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(category.description, pageWidth / 2, y, { align: "center" });
        y += 5;
      }
      y += 5;
    }

    // Category items
    category.items.forEach((item) => {
      // Calculate dynamic text wrap for description
      const descWidth = contentWidth - 10;
      const descLines = item.description
        ? doc.splitTextToSize(item.description, descWidth)
        : [];

      // Calculate required height for this item
      // Title + price line: 6mm
      // Description: descLines * 4.5mm
      // Spacing: 5mm
      const itemHeightNeeded = 6 + descLines.length * 4.5 + 6;
      checkPageBreak(itemHeightNeeded);

      // --- Draw item title & price ---
      if (template === "classic") {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(34, 34, 34);
        doc.text(item.name, marginX, y);

        // Price right-aligned
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        const priceStr = `${currencySymbol}${item.price.toLocaleString()}`;
        doc.text(priceStr, pageWidth - marginX, y, { align: "right" });
        y += 5;

        // Description
        if (descLines.length > 0) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(100, 100, 100);
          descLines.forEach((line: string) => {
            doc.text(line, marginX, y);
            y += 4.5;
          });
        }
        y += 3; // Item bottom spacing
      } else if (template === "modern") {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11.5);
        doc.setTextColor(17, 24, 39);
        doc.text(item.name, marginX + 6, y);

        // Price badge style
        const priceStr = `${currencySymbol}${item.price.toLocaleString()}`;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(13, 148, 136); // Teal price
        doc.text(priceStr, pageWidth - marginX, y, { align: "right" });
        y += 4.5;

        // Description
        if (descLines.length > 0) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9.5);
          doc.setTextColor(75, 85, 99);
          descLines.forEach((line: string) => {
            doc.text(line, marginX + 6, y);
            y += 4.5;
          });
        }

        // Tags badges
        if (item.tags && item.tags.length > 0) {
          y += 1.5;
          doc.setFont("helvetica", "medium");
          doc.setFontSize(7.5);
          let tagX = marginX + 6;

          item.tags.forEach((tag) => {
            const tagWidth = doc.getTextWidth(tag) + 4;
            // Draw gray tag pill background
            doc.setFillColor(243, 244, 246);
            doc.rect(tagX, y - 2.5, tagWidth, 3.8, "F");
            doc.setTextColor(107, 114, 128);
            doc.text(tag, tagX + 2, y);
            tagX += tagWidth + 2;
          });
          y += 3;
        }

        y += 3;
      } else {
        // Elegant
        doc.setFont("times", "bold");
        doc.setFontSize(12);
        doc.setTextColor(15, 23, 42);

        // Centered Elegant layout
        doc.text(item.name, pageWidth / 2, y, { align: "center" });
        y += 4.5;

        // Elegant Price centered below title (or inline, centered is very elegant)
        doc.setFont("times", "bolditalic");
        doc.setFontSize(10.5);
        doc.setTextColor(197, 160, 89); // Gold
        const priceStr = `${currencySymbol}${item.price.toLocaleString()}`;
        doc.text(priceStr, pageWidth / 2, y, { align: "center" });
        y += 4.5;

        // Description centered
        if (descLines.length > 0) {
          doc.setFont("times", "italic");
          doc.setFontSize(9.5);
          doc.setTextColor(71, 85, 105);
          descLines.forEach((line: string) => {
            doc.text(line, pageWidth / 2, y, { align: "center" });
            y += 4.5;
          });
        }
        y += 4;
      }
    });

    y += 6; // Spacing after category
  });

  // Draw final page numbers and footer details
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(i);
  }

  // Trigger PDF file download
  doc.save(`${restaurant.slug}-menu.pdf`);
};
