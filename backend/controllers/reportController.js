import Sale from '../models/saleModel.js';
import Team from '../models/teamModel.js';
import { createObjectCsvStringifier } from 'csv-writer';
import PDFDocument from 'pdfkit';

// @desc    Export team sales as CSV
// @route   GET /api/reports/team-sales/csv
// @access  Private/Manager
const exportTeamSalesCSV = async (req, res) => {
    try {
        const { year, month, teamId } = req.query;
        if (!year || !month) return res.status(400).json({ message: 'Year and month are required.' });

        const startDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1));
        const endDate = new Date(Date.UTC(parseInt(year), parseInt(month), 1));
        const filter = { managerId: req.user._id, date: { $gte: startDate, $lt: endDate } };
        let teamName = 'All-Teams';

        // Apply team filter if a specific team is selected
        if (teamId && teamId !== 'all') {
            const team = await Team.findById(teamId);
            if (team && team.manager.equals(req.user._id)) {
                filter.executiveId = { $in: team.members };
                teamName = team.name.replace(/\s+/g, '-'); // Sanitize for filename
            }
        }

        const sales = await Sale.find(filter)
            .populate('executiveId', 'name team')
            .populate({
                path: 'executiveId',
                select: 'name',
                populate: { path: 'team', select: 'name' }
            })
            .populate('products.productId', 'name')
            .sort({ 'executiveId.team.name': 1, date: 'asc' }); // Sort by team, then date

        const csvStringifier = createObjectCsvStringifier({
            header: [
                { id: 'date', title: 'Date' },
                { id: 'teamName', title: 'Team' },
                { id: 'executiveName', title: 'Executive Name' },
                { id: 'location', title: 'Location' },
                { id: 'productName', title: 'Product' },
                { id: 'quantity', title: 'Quantity' },
                { id: 'pricePerUnit', title: 'Price/Unit (RS)' },
                { id: 'subtotal', title: 'Subtotal (RS)' },
            ],
        });

        const records = [];
        sales.forEach(sale => {
            sale.products.forEach(item => {
                records.push({
                    date: new Date(sale.date).toLocaleDateString(),
                    teamName: sale.executiveId.team ? sale.executiveId.team.name : 'No Team',
                    executiveName: sale.executiveId.name,
                    location: sale.location,
                    productName: item.productId ? item.productId.name : 'N/A',
                    quantity: item.quantity,
                    pricePerUnit: item.pricePerUnit,
                    subtotal: item.quantity * item.pricePerUnit,
                });
            });
        });

        const csvData = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="team-sales-${teamName}-${year}-${month}.csv"`);
        res.status(200).end(csvData);

    } catch (error) {
        console.error('Error exporting team CSV:', error);
        res.status(500).json({ message: 'Server error during CSV export.' });
    }
};

// @desc    Export team sales as PDF
// @route   GET /api/reports/team-sales/pdf
// @access  Private/Manager
const exportTeamSalesPDF = async (req, res) => {
    try {
        const { year, month, teamId } = req.query;
        if (!year || !month) return res.status(400).json({ message: 'Year and month are required.' });

        const startDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1));
        const endDate = new Date(Date.UTC(parseInt(year), parseInt(month), 1));
        const filter = { managerId: req.user._id, date: { $gte: startDate, $lt: endDate } };
        let reportTitle = 'All Teams Sales Report';
        let teamNameForFile = 'All-Teams';

        if (teamId && teamId !== 'all') {
            const team = await Team.findById(teamId);
            if (team && team.manager.equals(req.user._id)) {
                filter.executiveId = { $in: team.members };
                reportTitle = `Team Sales Report: ${team.name}`;
                teamNameForFile = team.name.replace(/\s+/g, '-');
            }
        }

        const sales = await Sale.find(filter)
            .populate({
                path: 'executiveId',
                select: 'name team',
                populate: { path: 'team', select: 'name' }
            })
            .populate('products.productId', 'name')
            .sort({ 'executiveId.team.name': 1, date: 'asc' });

        const doc = new PDFDocument({ margin: 30, size: 'A4' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="team-sales-${teamNameForFile}-${year}-${month}.pdf"`);
        
        doc.pipe(res);

        // --- Reusable Table Header Function ---
        const generateHeader = (doc) => {
            doc.fontSize(18).text(reportTitle, { align: 'center' }).moveDown(0.5);
            doc.fontSize(12).text(`Manager: ${req.user.name}`, { align: 'center' });
            const period = new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
            doc.fontSize(12).text(`Period: ${period}`, { align: 'center' });
            doc.moveDown(2);

            const tableTop = doc.y;
            const itemX = 30; const execX = 100; const productX = 200;
            const qtyX = 350; const priceX = 400; const subtotalX = 480;

            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('Date', itemX, tableTop)
               .text('Executive', execX, tableTop)
               .text('Product', productX, tableTop)
               .text('Qty', qtyX, tableTop, {width: 40, align: 'right'})
               .text('Price', priceX, tableTop, {width: 60, align: 'right'})
               .text('Subtotal', subtotalX, tableTop, {width: 70, align: 'right'});
            doc.moveTo(itemX, doc.y).lineTo(doc.page.width - itemX, doc.y).stroke();
            doc.font('Helvetica');
            doc.moveDown(0.5);
        };
        
        // Generate the first page header
        generateHeader(doc);

        // --- Reusable Row Generation Function ---
        const generateTableRow = (doc, y, date, executive, product, qty, price, subtotal) => {
            const itemX = 30; const execX = 100; const productX = 200;
            const qtyX = 350; const priceX = 400; const subtotalX = 480;
            doc.fontSize(9)
               .text(date, itemX, y)
               .text(executive, execX, y, {width: 100, ellipsis: true})
               .text(product, productX, y, {width: 150, ellipsis: true})
               .text(qty, qtyX, y, {width: 40, align: 'right'})
               .text(price, priceX, y, {width: 60, align: 'right'})
               .text(subtotal, subtotalX, y, {width: 70, align: 'right'});
        };

        // --- Table Body ---
        let grandTotal = 0;
        let currentTeamId = null;

        sales.forEach(sale => {
            const saleTeam = sale.executiveId.team;

            // Add a subheader if the team changes (for "All Teams" report)
            if (teamId === 'all' && saleTeam && saleTeam._id.toString() !== currentTeamId) {
                // Check if there's enough space for the subheader and at least one row, otherwise add new page
                if (doc.y > doc.page.height - 80) { doc.addPage(); generateHeader(doc); }
                doc.moveDown(1).fontSize(11).font('Helvetica-Bold').text(`Team: ${saleTeam.name}`, 30);
                doc.font('Helvetica').moveDown(0.5);
                currentTeamId = saleTeam._id.toString();
            }

            sale.products.forEach(item => {
                const subtotal = item.quantity * item.pricePerUnit;
                grandTotal += subtotal;
                
                // Check for page break before drawing a row
                if (doc.y > doc.page.height - 50) { doc.addPage(); generateHeader(doc); }

                generateTableRow(
                    doc, doc.y, new Date(sale.date).toLocaleDateString(),
                    sale.executiveId.name,
                    item.productId ? item.productId.name : 'N/A',
                    item.quantity,
                    item.pricePerUnit.toLocaleString(),
                    subtotal.toLocaleString()
                );
                doc.moveDown(0.5);
            });
        });
        
        // --- Grand Total ---
        const totalY = doc.y + 10;
        if (totalY > doc.page.height - 50) { doc.addPage(); } // Ensure total is not at the very bottom
        doc.moveTo(30, doc.y).lineTo(doc.page.width - 30, doc.y).stroke();
        doc.font('Helvetica-Bold').fontSize(11);
        doc.text('Grand Total:', 350, doc.y + 10, {align: 'right', width: 110});
        doc.text(`RS ${grandTotal.toLocaleString()}`, 480, doc.y - doc.currentLineHeight(), {align: 'right', width: 70});

        doc.end();

    } catch (error) {
        console.error('Error exporting team PDF:', error);
        res.status(500).json({ message: 'Server error during PDF export.' });
    }
};

// @desc    Export MY sales as CSV
// @route   GET /api/reports/my-sales/csv
// @access  Private/Executive
const exportMySalesCSV = async (req, res) => {
    const { year, month } = req.query;
    if (!year || !month) return res.status(400).json({ message: 'Year and month are required.' });

    const startDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1));
    const endDate = new Date(Date.UTC(parseInt(year), parseInt(month), 1));

    const sales = await Sale.find({ executiveId: req.user._id, date: { $gte: startDate, $lt: endDate }})
        .populate('products.productId', 'name')
        .sort({ date: 'asc' });

    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'date', title: 'Date' },
        { id: 'location', title: 'Location' },
        { id: 'productName', title: 'Product' },
        { id: 'quantity', title: 'Quantity' },
        { id: 'pricePerUnit', title: 'Price/Unit (RS)' },
        { id: 'subtotal', title: 'Subtotal (RS)' },
      ],
    });

    const records = [];
    sales.forEach(sale => {
        sale.products.forEach(item => {
            records.push({
                date: new Date(sale.date).toLocaleDateString(),
                location: sale.location,
                productName: item.productId ? item.productId.name : 'N/A',
                quantity: item.quantity,
                pricePerUnit: item.pricePerUnit,
                subtotal: item.quantity * item.pricePerUnit,
            });
        });
    });

    const csvData = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="my-sales-${year}-${month}.csv"`);
    res.status(200).end(csvData);
};


// @desc    Export MY sales as PDF
// @route   GET /api/reports/my-sales/pdf
// @access  Private/Executive
const exportMySalesPDF = async (req, res) => {
    const { year, month } = req.query;
    if (!year || !month) return res.status(400).json({ message: 'Year and month are required.' });

    try {
        const startDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1));
        const endDate = new Date(Date.UTC(parseInt(year), parseInt(month), 1));

        const sales = await Sale.find({ executiveId: req.user._id, date: { $gte: startDate, $lt: endDate }})
            .populate('products.productId', 'name')
            .sort({ date: 'asc' });
        
        const doc = new PDFDocument({ margin: 40, size: 'A4' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="my-sales-${year}-${month}.pdf"`);
        
        doc.pipe(res);

        // --- PDF Header ---
        doc.fontSize(18).text('Personal Sales Report', { align: 'center' });
        doc.fontSize(12).text(`For: ${req.user.name}`, { align: 'center' });
        const period = new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
        doc.text(`Period: ${period}`, { align: 'center' });
        doc.moveDown(2);

        // --- Table Header ---
        const tableTop = doc.y;
        const dateX = 40;
        const locationX = 120;
        const productX = 220;
        const qtyX = 370;
        const priceX = 420;
        const subtotalX = 490;
        
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Date', dateX, tableTop)
           .text('Location', locationX, tableTop)
           .text('Product', productX, tableTop)
           .text('Qty', qtyX, tableTop)
           .text('Price', priceX, tableTop)
           .text('Subtotal', subtotalX, tableTop, {align: 'right'});
        doc.moveTo(dateX, doc.y).lineTo(doc.page.width - dateX, doc.y).stroke();
        doc.font('Helvetica');
        doc.moveDown(0.5);

        // --- Table Body ---
        let grandTotal = 0;
        sales.forEach(sale => {
            sale.products.forEach(item => {
                const y = doc.y;
                const subtotal = item.quantity * item.pricePerUnit;
                grandTotal += subtotal;
                
                doc.fontSize(9)
                   .text(new Date(sale.date).toLocaleDateString(), dateX, y)
                   .text(sale.location, locationX, y, {width: 100, ellipsis: true})
                   .text(item.productId ? item.productId.name : 'N/A', productX, y, {width: 150, ellipsis: true})
                   .text(item.quantity, qtyX, y)
                   .text(item.pricePerUnit.toLocaleString(), priceX, y)
                   .text(subtotal.toLocaleString(), 0, y, {align: 'right'});
                doc.moveDown(0.5);
            });
        });
        
        // --- Grand Total ---
        const totalY = doc.y + 10;
        doc.moveTo(dateX, totalY).lineTo(doc.page.width - dateX, totalY).stroke();
        doc.font('Helvetica-Bold');
        doc.text('Grand Total:', priceX, totalY + 5);
        doc.text(`RS ${grandTotal.toLocaleString()}`, 0, totalY + 5, {align: 'right'});

        doc.end();

    } catch (error) {
        console.error('Error exporting PDF:', error);
        res.status(500).json({ message: 'Server error during PDF export.' });
    }
};

export { exportTeamSalesCSV, exportTeamSalesPDF, exportMySalesCSV, exportMySalesPDF };