const ExcelJS = require('exceljs');

/**
 * Excel Export Utility
 *
 * Builds an .xlsx workbook from an array of records and streams it to the Response.
 *
 * Usage:
 *   const columns = [
 *     { header: 'Name', key: 'name', width: 24 },
 *     { header: 'Email', key: 'email', width: 30 },
 *   ];
 *   await sendExcel(res, { filename: 'users', sheetName: 'Users', columns, rows });
 */

const HEADER_STYLE = {
  font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 },
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F6FED' } },
  alignment: { vertical: 'middle', horizontal: 'left' },
  border: {
    top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
    bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
    left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
    right: { style: 'thin', color: { argb: 'FFCCCCCC' } },
  },
};

/**
 * Build an .xlsx workbook buffer.
 *
 * @param {object}   opts
 * @param {string}   opts.sheetName  - Sheet tab name
 * @param {Array}    opts.columns    - [{ header, key, width? }]
 * @param {Array}    opts.rows       - Array of plain objects keyed by column.key
 * @returns {Promise<Buffer>}
 */
const buildWorkbookBuffer = async ({ sheetName = 'Sheet1', columns, rows }) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Bricks Admin';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(sheetName, {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  sheet.columns = columns.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width || 18,
  }));

  // Header row styling
  const headerRow = sheet.getRow(1);
  headerRow.height = 22;
  headerRow.eachCell((cell) => {
    cell.font = HEADER_STYLE.font;
    cell.fill = HEADER_STYLE.fill;
    cell.alignment = HEADER_STYLE.alignment;
    cell.border = HEADER_STYLE.border;
  });

  rows.forEach((row) => {
    sheet.addRow(row);
  });

  // Zebra striping for readability
  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;
    if (rowNumber % 2 === 0) {
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF7F9FC' },
        };
      });
    }
    row.alignment = { vertical: 'middle', wrapText: false };
  });

  return workbook.xlsx.writeBuffer();
};

/**
 * Stream an .xlsx file to the client with correct headers.
 *
 * @param {Response} res
 * @param {object}   opts
 * @param {string}   opts.filename  - Base filename without extension
 * @param {string}   opts.sheetName
 * @param {Array}    opts.columns
 * @param {Array}    opts.rows
 */
const sendExcel = async (res, { filename, sheetName, columns, rows }) => {
  const buffer = await buildWorkbookBuffer({ sheetName, columns, rows });

  const timestamp = new Date().toISOString().slice(0, 10);
  const safeName = (filename || 'export').replace(/[^a-z0-9_-]/gi, '_');
  const fullName = `${safeName}_${timestamp}.xlsx`;

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${fullName}"`
  );
  res.setHeader('Content-Length', buffer.byteLength);
  return res.status(200).end(Buffer.from(buffer));
};

/**
 * Format a date to a readable string for Excel cells.
 */
const formatDate = (value) => {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 19).replace('T', ' ');
};

/**
 * Flatten array values to a comma-separated string for Excel cells.
 */
const joinList = (value) => {
  if (!Array.isArray(value)) return '';
  return value.filter(Boolean).join(', ');
};

module.exports = {
  sendExcel,
  buildWorkbookBuffer,
  formatDate,
  joinList,
};
