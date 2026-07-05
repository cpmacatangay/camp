const ExcelJS = require('exceljs');

async function generateExcel(participants) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Participants');

  sheet.columns = [
    { header: 'Name', key: 'name', width: 25 },
    { header: 'Nickname', key: 'nickname', width: 20 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Contact Number', key: 'contactNumber', width: 20 },
    { header: 'Home Address', key: 'homeAddress', width: 35 },
    { header: 'Birth Date', key: 'birthDate', width: 15 },
    { header: 'Facebook Name', key: 'facebookName', width: 25 },
    { header: 'Father Name', key: 'fatherName', width: 25 },
    { header: 'Father Contact', key: 'fatherContact', width: 20 },
    { header: 'Mother Name', key: 'motherName', width: 25 },
    { header: 'Mother Contact', key: 'motherContact', width: 20 },
    { header: 'Existing Sickness', key: 'existingSickness', width: 30 },
    { header: 'Payment Status', key: 'paymentStatus', width: 15 },
    { header: 'Attendance', key: 'attendanceStatus', width: 15 },
    { header: 'Registered At', key: 'createdAt', width: 20 },
  ];

  participants.forEach((p) => {
    sheet.addRow({
      name: p.name,
      nickname: p.nickname,
      email: p.email,
      contactNumber: p.contactNumber,
      homeAddress: p.homeAddress,
      birthDate: p.birthDate,
      facebookName: p.facebookName,
      fatherName: p.fatherName,
      fatherContact: p.fatherContact,
      motherName: p.motherName,
      motherContact: p.motherContact,
      existingSickness: p.existingSickness || '',
      paymentStatus: p.paymentStatus,
      attendanceStatus: p.attendanceStatus,
      createdAt: p.createdAt ? p.createdAt.toISOString() : '',
    });
  });

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

module.exports = { generateExcel };
