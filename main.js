const calc = document.body.querySelector('.calc');
const metalType = calc.querySelector('.calcHeader__type');

const dn = calc.querySelector('.calcHeader__dn');
const thickness = calc.querySelector('.calcHeader__thickness');
const len = calc.querySelector('.calcHeader__len');
const rollWidth = calc.querySelector('.calcHeader__widthRoll');

const itemsTable = document.querySelector('.itemsTable__table');
const addBtn = document.querySelector('.calcHeader__add');

const amountGlueTotals = calc.querySelector('.amountGlue .calcResults__value');
const amountCleanerTotals = calc.querySelector('.amountCleaner .calcResults__value');
const amountTapeTotals = calc.querySelector('.amountTape .calcResults__value');
const amountRollMaterialTotals = calc.querySelector('.amountRollMaterial .calcResults__value');
const amountCoverMaterialTotals = calc.querySelector('.amountCoverMaterial .calcResults__value');


let tableId = 0;
let itemsPosition = [];

const { jsPDF } = window.jspdf;

addBtn.addEventListener('click',()=>{
    tableId++;
    
    let dnv = Number(dn.value);
    let tv = Number(thickness.value);
    let lnv = Number(len.value);
    let rw = Number(rollWidth.value);
    
    
   
    len.reportValidity();
    thickness.reportValidity();
    dn.reportValidity();

    if(!dnv||!tv||!lnv)
        return;
    itemsPosition.push({
        id: tableId,
        dn: dn.value,
        thickness: thickness.value,
        len: len.value,
        amountGlue: calcAmountGlue(dnv, tv, lnv, rw),
        amountCleaner: calcAmountCleaner(dnv, tv, lnv, rw),
        amountTape: calcAmountTape(dnv, tv, lnv, rw),
        amountRollMaterial: calcAmountRollMaterial(dnv, tv, lnv, rw),
        amountCoverMaterial: calcAmountCoverMaterial(dnv, tv, lnv)
    });
    
    let row = itemsTable.insertRow();
    row.insertCell().innerHTML = dn.value;
    row.insertCell().innerHTML = thickness.value;
    row.insertCell().innerHTML = len.value;
    row.insertCell().innerHTML = calcAmountGlue(dnv, tv, lnv, rw).toFixed(2);
    row.insertCell().innerHTML = calcAmountCleaner(dnv, tv, lnv, rw).toFixed(2);
    row.insertCell().innerHTML = calcAmountTape(dnv, tv, lnv, rw).toFixed(2);
    row.insertCell().innerHTML = calcAmountRollMaterial(dnv, tv, lnv, rw).toFixed(2);
    row.insertCell().innerHTML = calcAmountCoverMaterial(dnv, tv, lnv).toFixed(2);
    row.insertCell().innerHTML = `<a class="itemsTable__removeRow" href="javascript:void(0);"></a>`;

    //console.log(row);
    let tId = tableId;
    console.log(itemsPosition);
    row.querySelector('.itemsTable__removeRow').addEventListener('click',()=>{
        itemsTable.deleteRow(row.rowIndex);
        console.log(itemsPosition);
        itemsPosition = itemsPosition.filter(obj => obj.id !== tId);
        updateResults();
    });
    updateResults();
});


function generateItems(itemObj, placeholder){
    let html = `<option value="" disabled selected>${placeholder}</option>`;
    for(let [index, item] of itemObj.entries()) {
        html += `<option value="${item}">${item}</option>`
    }
    return html;
}



function calcAreaGluedSurface (dn, thickness, len, rollWidth) {
    //(((dn/1000+thickness*2/1000)*(dn/1000+thickness*2/1000))*3,1415926-(dn/1000*dn/1000)*3,1415926)*(len/widthRoll-1)+thickness/1000*len
    //return Number((((dn/1000+thickness*2/1000)*(dn/1000+thickness*2/1000))*3.1415926-(dn/1000*dn/1000)*3.1415926)*(len/2-1)+thickness/1000*len);
    return Number((((dn/1000+thickness*2/1000)*(dn/1000+thickness*2/1000))*3.1415926-(dn/1000*dn/1000)*3.1415926)*(len/rollWidth-1)+thickness/1000*len)
}

function calcAmountGlue (dn, thickness, len, rw) {
    return calcAreaGluedSurface(dn, thickness, len, rw)*0.3;
}

function calcAmountRollMaterial(dn, thickness, len) {
    return Math.ceil((dn+thickness*2)*3.1415926*len/1000);
}

function calcAmountCleaner (dn, thickness, len, rw) {
    return calcAmountGlue(dn, thickness, len, rw)*0.3;
}

function calcCirLen (dn, thickness) {
    return Number(3.1415926*(dn+thickness*2)/1000);
}

function calcAmountTapeLongitudinal (dn, thickness, len, rw) {
    return Number(calcCirLen(dn, thickness)*(len-1)/rw);
}

function calcAmountTapeCross (dn, thickness, len) {
    return Number(len);
}

function calcAmountTape(dn, thickness, len, rw) {
    return calcAmountTapeLongitudinal(dn, thickness, len, rw) + calcAmountTapeCross(dn, thickness, len);
}

function calcAmountCoverMaterial (dn, thickness, len) {
    return calcAmountRollMaterial(dn, thickness, len)*1.15;
}



function getColumnSum(column) {
    return itemsPosition.reduce((acc, cur) => acc + cur[column], 0);
}

function updateResults() {
    amountGlueTotals.textContent = getColumnSum("amountGlue").toFixed(2);
    amountCleanerTotals.textContent = getColumnSum("amountCleaner").toFixed(2);
    amountTapeTotals.textContent = getColumnSum("amountTape").toFixed(2);
    amountRollMaterialTotals.textContent = getColumnSum("amountRollMaterial").toFixed(2);
    amountCoverMaterialTotals.textContent = getColumnSum("amountCoverMaterial").toFixed(2);
}



let pdfDoc = new jsPDF();

function headerPdf(title) {
    pdfDoc.addImage(document.querySelector('.pdfLogo'), 'PNG', 0, 5, 200, 20);
    pdfDoc.setFontSize(14);
    pdfDoc.text(5, 30, title);
}

function headerTable(h) {
    h+=8;
    pdfDoc.setFont("FuturaPT-Medium");

    pdfDoc.text(5, h, "DN трубы (мм)", {maxWidth:'12'});
    pdfDoc.text(25, h, "Толщина изоляции (мм)", {maxWidth:'20'});
    pdfDoc.text(45, h, "Длинна трубы (м/п)", {maxWidth:'15'});
    pdfDoc.text(70, h, "Кол-во клея (л)", {maxWidth:'13'});
    pdfDoc.text(90, h, "Кол-во очистителя (л)", {maxWidth:'20'});
    pdfDoc.text(110, h, "Лента (м)", {maxWidth:'20'});
    pdfDoc.text(135, h, "Руллоный материал (м²)", {maxWidth:'17'});
    pdfDoc.text(160, h, "Покрывной материал (м²)", {maxWidth:'17'});
    pdfDoc.setFont("FuturaPT-Book");
}

function rowPdf(el,h) {

    h+=8;
    pdfDoc.setFont("FuturaPT-Medium");
    pdfDoc.setFont("FuturaPT-Book");
    pdfDoc.text(5, h, String(el.dn));
    pdfDoc.text(25, h, el.thickness);
    pdfDoc.text(45, h, el.len);
    pdfDoc.text(70, h, el.amountGlue.toFixed(2));
    pdfDoc.text(90, h, el.amountCleaner.toFixed(2));
    pdfDoc.text(110, h, el.amountTape.toFixed(2));
    pdfDoc.text(135, h, el.amountRollMaterial.toFixed(2));
    pdfDoc.text(160, h, el.amountCoverMaterial.toFixed(2));
    
    
}

function totalPdf(caption, value, unit, x, y) {
    pdfDoc.text(x, y, String(caption), {maxWidth:'27'});
    pdfDoc.setFont("FuturaPT-Medium");
    pdfDoc.text(x, y+10, value + " " + unit);
    pdfDoc.setFont("FuturaPT-Book");
}

function generatePdf() {
    
    pdfDoc.addFileToVFS('FuturaPT-Book-normal.ttf', font);
    pdfDoc.addFont('FuturaPT-Book-normal.ttf', 'FuturaPT-Book', 'normal');

    pdfDoc.addFileToVFS('FuturaPT-Medium-normal.ttf', fontMed);
    pdfDoc.addFont('FuturaPT-Medium-normal.ttf', 'FuturaPT-Medium', 'normal');
    pdfDoc.setFont("FuturaPT-Book");

    pdfDoc.setFontSize(14);

    headerPdf("Расчет аксессуаров для рулонов K-FLEX");

    pdfDoc.setFontSize(8);

    let i = 0;

    headerTable(33);
    for(i=0; i<itemsPosition.length; i++){
        rowPdf(itemsPosition[i],47+i*12);
    }
    pdfDoc.setFontSize(14);
    pdfDoc.text(5, 50 + itemsPosition.length*17, "Итого вам понадобиться:");
    pdfDoc.setFontSize(8);
    totalPdf("Количество клея", getColumnSum("amountGlue").toFixed(2), " литров", 5, 60 + itemsPosition.length*17);
    totalPdf("Количество очистителя", getColumnSum("amountCleaner").toFixed(2), " литров", 35, 60 + itemsPosition.length*17);
    totalPdf("Количество ленты", getColumnSum("amountTape").toFixed(2), " метров", 65, 60 + itemsPosition.length*17);
    totalPdf("Количество рулонного материала", getColumnSum("amountRollMaterial").toFixed(2), " м²", 125, 60 + itemsPosition.length*17);
    totalPdf("Количество покрытия", getColumnSum("amountCoverMaterial").toFixed(2), " м²", 155, 60 + itemsPosition.length*17);
    //pdfDoc.text(160, 100+i*17, "Итого: " + document.querySelector('.products__total .num').textContent + "руб.") ;


    pdfDoc.save('output.pdf');
}

/* END PDF Generator */
document.querySelector('.calcGeneratePdf').addEventListener('click',()=>{
    generatePdf();
});

document.addEventListener("DOMContentLoaded",()=>{

});