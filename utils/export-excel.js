const Excel = require('exceljs');
const path = require('path');
const moment = require('moment');

module.exports = {

    exportBill: async function (response, filename, bill, {dueMonth, dueYear }, dateIssued, vehicles, invoices){
        let template = path.join(process.cwd(), 'config', 'Template.xlsx');
        let outputFile = filename;
        let workbook = new Excel.Workbook();

        workbook.xlsx.readFile(template)
            .then((content) => {
        
                let workSheet = content.getWorksheet('Sheet1');

                workSheet.getCell('A9').value = `${bill?.Client?.name} Account`.toUpperCase()
                workSheet.getCell('G9').value = `${dateIssued}`.toUpperCase()
                workSheet.getCell('G10').value = `${bill?.number}`

                const writeIndex = writeApprovedVehicles(workSheet, vehicles);
                const writeRow = workSheet.getRow(writeIndex);

                writeRow.getCell(1).value = `${bill?.month} ${bill?.year} ACCOUNT`.toUpperCase();
                writeRow.getCell(4).value = `DUE: ${dueMonth} ${dueYear}`.toUpperCase();

                if(writeIndex > 16){
                    writeRow.getCell(1).font = { name: 'Arial Black',  size: 8,}
                    writeRow.getCell(1).alignment = { vertical: 'bottom'}
                    writeRow.getCell(4).font = { name: 'Arial Black',  size: 8,}
                    writeRow.getCell(4).alignment = { vertical: 'bottom'}
                }

                let startInvoiceIndex = writeIndex + 3;

                const lastInvvoiceIndex = writeInvoices(workSheet, startInvoiceIndex, invoices);
                
                let totalCell = workSheet.getCell(`G${lastInvvoiceIndex}`);
                let totalAmount = invoices.reduce((sum, invoice) => {
                    return sum + invoice.amount;
                }, 0);
                totalCell.value = totalAmount;
                
                response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                response.setHeader("Content-Disposition", "attachment; filename=" + outputFile);
                return content.xlsx.write(response).then(() => {
                    response.end();
                })
            })


    }


}

function writeApprovedVehicles(workSheet, vehicles){
    if(vehicles.length < 1) return;
    let startIndexRow = 13;
    let currentRow = workSheet.getRow(startIndexRow);
    let currentCell = 1;
    vehicles.forEach(v => {
        if(currentCell > 7){
            startIndexRow += 1;
            currentRow = workSheet.getRow(startIndexRow);
            currentCell = 1;
        }
        if(startIndexRow > 14 && currentCell == 1){
            workSheet.insertRow(startIndexRow - 1);
        }
        currentRow.getCell(currentCell).value = v?.license;
        currentRow.getCell(currentCell).font = { name: 'Century Gothic', fontSize: 9,};

        currentCell += 1;
    });
    switch(startIndexRow){
        case 13:
        case 14:
        case 15:
            return 16;
        default:
            return startIndexRow + 1;
    }   
}

function writeInvoices(workSheet, startInvoiceIndex, invoices){
    if(invoices.length < 1) return;
    if(invoices.length > 3){
        workSheet.duplicateRow(startInvoiceIndex, invoices.length - 3, true);
    }
    let counter = startInvoiceIndex;
    invoices.forEach(i => {
        let currentRow = workSheet.getRow(counter);
        currentRow.getCell(2).value = moment(i?.date).format("DD/MM/YYYY");
        currentRow.getCell(3).value = i?.number;
        currentRow.getCell(4).value = `${i?.saleType}`.toUpperCase();
        currentRow.getCell(5).value = i?.license;
        if(i?.purchaseOrder) currentRow.getCell(6).value = i?.purchaseOrder;
        currentRow.getCell(7).value = i?.amount;
        counter+=1;
    });
    return counter;
}