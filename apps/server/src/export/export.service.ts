import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as ExcelJS from 'exceljs';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  constructor(private readonly prisma: PrismaService) {}

  private async getBusinessData(businessIds?: string[]) {
    const where = businessIds && businessIds.length > 0
      ? { id: { in: businessIds } }
      : {};

    return this.prisma.business.findMany({
      where,
      include: {
        analyses: {
          where: { status: 'COMPLETED' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        recommendations: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async exportCSV(businessIds?: string[]): Promise<Buffer> {
    const businesses = await this.getBusinessData(businessIds);

    const headers = [
      'ID', 'Name', 'Category', 'Address', 'City', 'State', 'Country',
      'Phone', 'Email', 'Website', 'Rating', 'Review Count',
      'Website Score', 'Automation Score', 'AI Score', 'Final Score',
      'Priority Level', 'Opportunity Types', 'Primary Recommendation',
      'Estimated Value', 'Created At',
    ];

    const rows = businesses.map(b => {
      const analysis = b.analyses[0];
      const recommendation = b.recommendations[0];
      return [
        b.id,
        b.name,
        b.category,
        b.address,
        b.city,
        b.state,
        b.country,
        b.phone || '',
        b.email || '',
        b.website || '',
        b.rating || '',
        b.reviewCount || '',
        analysis?.websiteScore || 0,
        analysis?.automationScore || 0,
        analysis?.aiScore || 0,
        analysis?.finalScore || 0,
        analysis?.priorityLevel || '',
        analysis?.opportunityTypes?.join(';') || '',
        recommendation?.primaryOpportunity || '',
        recommendation?.totalEstimatedValue || '',
        b.createdAt.toISOString(),
      ];
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return Buffer.from(csvContent, 'utf-8');
  }

  async exportExcel(businessIds?: string[]): Promise<Buffer> {
    const businesses = await this.getBusinessData(businessIds);
    
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'BizOptics';
    workbook.created = new Date();

    // Businesses Sheet
    const businessSheet = workbook.addWorksheet('Businesses', {
      pageSetup: { paperSize: 9, orientation: 'landscape' },
    });

    businessSheet.columns = [
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'City', key: 'city', width: 15 },
      { header: 'State', key: 'state', width: 10 },
      { header: 'Phone', key: 'phone', width: 18 },
      { header: 'Website', key: 'website', width: 30 },
      { header: 'Rating', key: 'rating', width: 10 },
      { header: 'Reviews', key: 'reviewCount', width: 10 },
      { header: 'Website Score', key: 'websiteScore', width: 15 },
      { header: 'Automation Score', key: 'automationScore', width: 18 },
      { header: 'AI Score', key: 'aiScore', width: 12 },
      { header: 'Final Score', key: 'finalScore', width: 13 },
      { header: 'Priority', key: 'priority', width: 12 },
      { header: 'Primary Opportunity', key: 'opportunity', width: 25 },
      { header: 'Est. Value', key: 'estimatedValue', width: 20 },
    ];

    // Style header row
    businessSheet.getRow(1).eachCell(cell => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF6366F1' },
      };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });
    businessSheet.getRow(1).height = 25;

    businesses.forEach(b => {
      const analysis = b.analyses[0];
      const recommendation = b.recommendations[0];
      const row = businessSheet.addRow({
        name: b.name,
        category: b.category.replace(/_/g, ' '),
        city: b.city,
        state: b.state,
        phone: b.phone || '-',
        website: b.website || 'No website',
        rating: b.rating || '-',
        reviewCount: b.reviewCount || 0,
        websiteScore: analysis?.websiteScore || 0,
        automationScore: analysis?.automationScore || 0,
        aiScore: analysis?.aiScore || 0,
        finalScore: analysis?.finalScore || 0,
        priority: analysis?.priorityLevel || '-',
        opportunity: recommendation?.primaryOpportunity?.replace(/_/g, ' ') || '-',
        estimatedValue: recommendation?.totalEstimatedValue || '-',
      });

      // Color code priority
      const finalScore = analysis?.finalScore || 0;
      let bgColor = 'FFffffff';
      if (finalScore >= 90) bgColor = 'FFFEE2E2';
      else if (finalScore >= 75) bgColor = 'FFFFF7ED';
      else if (finalScore >= 50) bgColor = 'FFFFFBEB';

      row.eachCell(cell => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: bgColor },
        };
      });
    });

    // Summary Sheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.addRow(['BizOptics Export Summary']);
    summarySheet.addRow(['Generated', new Date().toLocaleString()]);
    summarySheet.addRow(['Total Businesses', businesses.length]);
    summarySheet.addRow(['Businesses with Analysis', businesses.filter(b => b.analyses.length > 0).length]);
    summarySheet.addRow(['High Priority', businesses.filter(b => b.analyses[0]?.priorityLevel === 'HIGH' || b.analyses[0]?.priorityLevel === 'CRITICAL').length]);

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async exportPDF(businessIds?: string[]): Promise<Buffer> {
    const businesses = await this.getBusinessData(businessIds);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const chunks: Buffer[] = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(24).fillColor('#6366f1').text('BizOptics', 50, 50);
      doc.fontSize(12).fillColor('#666').text('Business Opportunity Intelligence Report', 50, 80);
      doc.fontSize(10).fillColor('#999').text(`Generated: ${new Date().toLocaleString()}`, 50, 100);
      doc.moveTo(50, 120).lineTo(545, 120).stroke('#e2e8f0');
      
      let y = 140;

      businesses.slice(0, 50).forEach((b, index) => {
        if (y > 700) {
          doc.addPage();
          y = 50;
        }

        const analysis = b.analyses[0];
        const recommendation = b.recommendations[0];

        doc.fontSize(14).fillColor('#1e293b').text(`${index + 1}. ${b.name}`, 50, y);
        y += 20;
        doc.fontSize(10).fillColor('#64748b').text(
          `${b.category.replace(/_/g, ' ')} | ${b.address}, ${b.city}, ${b.state}`,
          50, y,
        );
        y += 15;

        if (analysis) {
          doc.fontSize(10).fillColor('#374151').text(
            `Website: ${analysis.websiteScore}/100 | Automation: ${analysis.automationScore}/100 | AI: ${analysis.aiScore}/100 | Final: ${analysis.finalScore}/100`,
            50, y,
          );
          y += 15;
          doc.fontSize(10).fillColor(analysis.priorityLevel === 'CRITICAL' ? '#ef4444' : analysis.priorityLevel === 'HIGH' ? '#f97316' : '#6b7280')
            .text(`Priority: ${analysis.priorityLevel}`, 50, y);
          y += 15;
        }

        if (recommendation) {
          doc.fontSize(10).fillColor('#6366f1').text(
            `Opportunity: ${recommendation.primaryOpportunity?.replace(/_/g, ' ')} | Est. Value: ${recommendation.totalEstimatedValue}`,
            50, y,
          );
          y += 15;
        }

        doc.moveTo(50, y).lineTo(545, y).stroke('#f1f5f9');
        y += 15;
      });

      doc.end();
    });
  }
}
