const { Invoice, Attachment, Estimate, Template } = require('../models')
const Mustache = require('mustache')
const configuration = require('../config/config')
const fs = require('fs')
const tools = require('../helpers/tools')

//amount to word english

exports.number2text = async (value) => {
    var fraction = Math.round(frac(value) * 1000);
    var f_text = "";

    if (fraction > 0) {
        f_text = "AND " + convert_number(fraction) + " Millimes";
    }

    return convert_number(value) + " Dinars " + f_text;
}

function frac(f) {
    return f % 1;
}

function convert_number(number) {
    if ((number < 0) || (number > 999999999)) {
        return "NUMBER OUT OF RANGE!";
    }
    var Gn = Math.floor(number / 10000000);  /* Million */
    number -= Gn * 10000000;
    var kn = Math.floor(number / 100000);     /* Hundred Thousand */
    number -= kn * 100000;
    var Hn = Math.floor(number / 1000);      /* thousand */
    number -= Hn * 1000;
    var Dn = Math.floor(number / 100);       /* Tens (deca) */
    number = number % 100;               /* Ones */
    var tn = Math.floor(number / 10);
    var one = Math.floor(number % 10);
    var res = "";

    if (Gn > 0) {
        res += (convert_number(Gn) + " MILLION");
    }
    if (kn > 0) {
        res += (((res == "") ? "" : " ") +
            convert_number(kn) + " HUNDRED THOUSAND");
    }
    if (Hn > 0) {
        res += (((res == "") ? "" : " ") +
            convert_number(Hn) + " THOUSAND");
    }

    if (Dn) {
        res += (((res == "") ? "" : " ") +
            convert_number(Dn) + " HUNDRED");
    }


    var ones = Array("", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN", "NINETEEN");
    var tens = Array("", "", "TWENTY", "THIRTY", "FOURTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY");

    if (tn > 0 || one > 0) {
        if (!(res == "")) {
            res += " AND ";
        }
        if (tn < 2) {
            res += ones[tn * 10 + one];
        }
        else {

            res += tens[tn];
            if (one > 0) {
                res += ("-" + ones[one]);
            }
        }
    }

    if (res == "") {
        res = "zero";
    }
    return res;
}

//amount to words french


exports.number2textfrench = async (value) => {
    var fraction = Math.round(frac(value) * 1000);
    var f_text = "";

    if (fraction > 0) {
        f_text = "ET " + convert_number_french(fraction) + " Millimes";
    }

    return convert_number_french(value) + " Dinars " + f_text;
}

function convert_number_french(number) {
    if ((number < 0) || (number > 999999999)) {
        return "NUMBER OUT OF RANGE!";
    }
    var Gn = Math.floor(number / 10000000);  /* Million */
    number -= Gn * 10000000;
    var kn = Math.floor(number / 100000);     /* Hundred Thousand */
    number -= kn * 100000;
    var Hn = Math.floor(number / 1000);      /* thousand */
    number -= Hn * 1000;
    var Dn = Math.floor(number / 100);       /* Tens (deca) */
    number = number % 100;               /* Ones */
    var tn = Math.floor(number / 10);
    var one = Math.floor(number % 10);
    var res = "";

    if (Gn > 0) {
        res += (convert_number_french(Gn) + " MILLION");
    }
    if (kn > 0) {
        res += (((res == "") ? "" : " ") +
            convert_number_french(kn) + " CENT MILLE");
    }
    if (Hn > 0) {
        res += (((res == "") ? "" : " ") +
            convert_number_french(Hn) + " MILLE");
    }

    if (Dn) {
        res += (((res == "") ? "" : " ") +
            convert_number_french(Dn) + " CENT");
    }


    var ones = Array("", "UN", "DEUX", "TROIS", "QUATRE", "CINQ", "SIX", "SEPT", "HUIT", "NEUF", "DIX", "ONZE", "DOUZE", "TREIZE", "QUATORZE", "QUINZE", "SEIZE", "DIX-SEPT", "DIX-HUIT", "DIX-NEUF");
    var tens = Array("", "", "VINGT", "TRENTE", "QUARANTE", "CINQUANTE", "SOIXANTE", "SOIXANTE-DIX", "QUATRE-VINGT", "QUATRE-VINGT-DIX");

    if (tn > 0 || one > 0) {
        if (!(res == "")) {
            res += " ET ";
        }
        if (tn < 2) {
            res += ones[tn * 10 + one];
        }
        else {

            res += tens[tn];
            if (one > 0) {
                res += ("-" + ones[one]);
            }
        }
    }

    if (res == "") {
        res = "zero";
    }
    return res;
}

//amount to words arabic

exports.number2textarabic = async (value) => {
    var fraction = Math.round(frac(value) * 1000);
    var f_text = "";

    if (fraction > 0) {
        f_text = "و " + convert_number_arabic(fraction) + " مليم";
    }

    return convert_number_arabic(value) + " دينار " + f_text;
}

function convert_number_arabic(number) {
    if ((number < 0) || (number > 999999999)) {
        return "NUMBER OUT OF RANGE!";
    }
    var Gn = Math.floor(number / 10000000);  /* Million */
    number -= Gn * 10000000;
    var kn = Math.floor(number / 100000);     /* Hundred Thousand */
    number -= kn * 100000;
    var Hn = Math.floor(number / 1000);      /* thousand */
    number -= Hn * 1000;
    var Dn = Math.floor(number / 100);       /* Tens (deca) */
    number = number % 100;               /* Ones */
    var tn = Math.floor(number / 10);
    var one = Math.floor(number % 10);
    var res = "";

    if (Gn > 0) {
        res += (convert_number_arabic(Gn) + " مليون");
    }
    if (kn > 0) {
        res += (((res == "") ? "" : " ") +
            convert_number_arabic(kn) + "مئة ألف ");
    }
    if (Hn > 0) {
        res += (((res == "") ? "" : " ") +
            convert_number_arabic(Hn) + "ألف ");
    }

    if (Dn) {
        res += (((res == "") ? "" : " ") +
            convert_number_arabic(Dn) + " مئة");
    }


    var ones = Array("", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة", "عشرة", "إحدى عشر", "إثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر");
    var tens = Array("", "", "عشرون", "ثلاثون", "أربعين", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون");

    if (tn > 0 || one > 0) {
        if (!(res == "")) {
            res += " و ";
        }
        if (tn < 2) {
            res += ones[tn * 10 + one];
        }
        else {
            res += tens[tn];
            if (one > 0) {
                res += ("-" + ones[one]);
            }
        }
    }

    if (res == "") {
        res = "صفر";
    }
    return res;
}



exports.getInvoiceFooter = async (id) => {
    let invoice = await Invoice.findHydratedInvoice(id)
    let company
    if (typeof invoice.header.company === 'string') {
        company = JSON.parse(invoice.header.company)
    } else {
        company = invoice.header.company
    } return {
        contents: {
            default: company.footer
        }
    }
}



exports.getInvoiceData = async (id, language) => {
    try {
        let signature_buffer, company_logo, logo, data, signature


        let invoice = await Invoice.findHydratedInvoice(id)

        let date = invoice.header.date.toISOString().split('T')[0]

        let amountInWords = await this.number2text(invoice.header.total_price)

        let amountInFrenchWords = await this.number2textfrench(invoice.header.total_price)

        let amountInArabicWords = await this.number2textarabic(invoice.header.total_price)

        let company
        if (typeof invoice.header.company === 'string') {
            company = JSON.parse(invoice.header.company)
        } else {
            company = invoice.header.company
        }

        if (company.logo) {
            company_logo = await Attachment.findById(company.logo)

        }

        if (invoice.header.signature) {
            signature = await Attachment.findById(invoice.header.signature)
        }



        if (company_logo) {
            logo = Buffer.from(company_logo.attachment).toString('base64')
        }


        if (signature) {
            signature_buffer = Buffer.from(signature.attachment).toString('base64')
        }


        let client
        if (typeof invoice.header.client === 'string') {
            client = JSON.parse(invoice.header.client)
        } else {
            client = invoice.header.client
        }

        ///dividing invoice lines into small arrays (array/page)

        let pages = []
        let startIndex = 0
        /// max lines for each page
        let pagesLength = [30, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38]

        /// number of arrays (number of pages which will contain invoice lines) 
        let pagesCount = 1

        /// count number of pages which will contain invoice lines
        if (invoice.lines.length > pagesLength[0]) {
            let div = (invoice.lines.length - pagesLength[0]) / pagesLength[1]
            /// we add the div as integer  which represent a full page
            pagesCount += (parseInt(div))
            /// we add page only if div > 0.0 (part page)
            if (div % 1 > 0) {
                pagesCount += 1
            }
        }



        let remainingLines = invoice.lines.length;
        let beforeFooterBreak = false

        //apply decimals to invoice_lines
        for (let i = 0; i < invoice.lines.length; i++) {
            invoice.lines[i].invoice_line_price = await tools.convertToDecimal(invoice.lines[i].invoice_line_price)
            invoice.lines[i].discount = await tools.convertToDecimal(invoice.lines[i].discount)
            invoice.lines[i].quantity = await tools.quantityDigits(invoice.lines[i].quantity)
            invoice.lines[i].total_line_ht = (await tools.convertToDecimal(invoice.lines[i].invoice_line_price) * await tools.quantityDigits(invoice.lines[i].quantity)) - await tools.convertToDecimal(invoice.lines[i].discount)
            invoice.lines[i].total_line_ttc = (await tools.convertToDecimal(invoice.lines[i].invoice_line_price) * await tools.quantityDigits(invoice.lines[i].quantity)) - await tools.convertToDecimal(invoice.lines[i].discount) * (1 + invoice.lines[i].vat)
        }

        ///dividing (slice && push)

        for (let i = 0; i < pagesCount; i++) {
            beforeFooterBreak = false
            let body = invoice.lines.slice(startIndex, (startIndex + Math.min(pagesLength[i], remainingLines)))
            remainingLines = Math.max(0, remainingLines - body.length)

            startIndex += pagesLength[i]
            pages.push({
                data: body
            })
        }

        /// force break before end of page if there isn't enough space
        /// if doc body is only on 1 page
        if (pagesCount == 1) {
            if (pages[0].data.length > 24 && pages[0].data.length < 29) {
                beforeFooterBreak = true
            }
        }
        /// we check last page if more than 1 page
        else {
            if (pages[pagesCount - 1].data.length > 34 && pages[pagesCount - 1].data.length < 38) {
                beforeFooterBreak = true
            }
        }

        invoice.header.timbre = await tools.convertToDecimal(invoice.header.timbre)
        invoice.header.total_ht = await tools.convertToDecimal(invoice.header.total_ht)
        invoice.header.total_vat = await tools.convertToDecimal(invoice.header.total_vat)

        invoice.header.total_price = await tools.convertToDecimal(invoice.header.total_price)



        data = {
            invoice: invoice.header ?? undefined,
            date: date ?? undefined,
            company: company ?? undefined,
            logo: logo ?? undefined,
            amountInWords: amountInWords ?? undefined,
            amountInFrenchWords: amountInFrenchWords ?? undefined,
            amountInArabicWords: amountInArabicWords ?? undefined,
            client: client ?? undefined,
            signature: signature_buffer ?? undefined,
            pages: pages ?? undefined,
            beforeFooterBreak: beforeFooterBreak ?? undefined
        }

        let filledTemplate

        if (language == "EN") {

            let invoice_template = await Template.findById(invoice.header.template_id)

            let template = invoice_template.template

            filledTemplate = Mustache.render(template, data)
        }

        if (language == "FR" || !language) {

            let invoice_template = await Template.findById(invoice.header.template_id_fr)

            let template = invoice_template.template

            filledTemplate = Mustache.render(template, data)
        }

        if (language == "AR") {

            let invoice_template = await Template.findById(invoice.header.template_id_ar)

            let template = invoice_template.template

            filledTemplate = Mustache.render(template, data)
        }

        return filledTemplate

    } catch (r) {
        throw (r)
    }
}



exports.getEstimateFooter = async (id) => {
    let estimate = await Estimate.findHydratedEstimate(id)
    let company
    if (typeof estimate.header.company === 'string') {
        company = JSON.parse(estimate.header.company)
    } else {
        company = estimate.header.company
    }
    return {
        contents: {
            default: company.footer
        }
    }
}



exports.getEstimateData = async (id, language) => {
    try {
        let signature_buffer, company_logo, logo, data, signature


        let estimate = await Estimate.findHydratedEstimate(id)

        let date = estimate.header.date.toISOString().split('T')[0]

        let amountInWords = await this.number2text(estimate.header.total_price)

        let amountInFrenchWords = await this.number2textfrench(estimate.header.total_price)

        let amountInArabicWords = await this.number2textarabic(estimate.header.total_price)

        let company
        if (typeof estimate.header.company === 'string') {
            company = JSON.parse(estimate.header.company)
        } else {
            company = estimate.header.company
        }

        if (company.logo) {
            company_logo = await Attachment.findById(company.logo)

        }

        if (estimate.header.signature) {
            signature = await Attachment.findById(estimate.header.signature)
        }



        if (company_logo) {
            logo = Buffer.from(company_logo.attachment).toString('base64')
        }


        if (signature) {
            signature_buffer = Buffer.from(signature.attachment).toString('base64')
        }

        let client
        if (typeof estimate.header.client === 'string') {
            client = JSON.parse(estimate.header.client)
        } else {
            client = estimate.header.client
        }


        let pagesLength = [30, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38]
        let pages = []
        let startIndex = 0
        let pagesCount = 1
        if (estimate.lines.length > pagesLength[0]) {
            let div = (estimate.lines.length - pagesLength[0]) / pagesLength[1]

            pagesCount += (parseInt(div))
            if (div % 1 > 0) {
                pagesCount += 1
            }
        }



        let remainingLines = estimate.lines.length;
        let beforeFooterBreak = false

        for (let i = 0; i < estimate.lines.length; i++) {
            estimate.lines[i].estimate_line_price = await tools.convertToDecimal(estimate.lines[i].estimate_line_price)
            estimate.lines[i].discount = await tools.convertToDecimal(estimate.lines[i].discount)
            estimate.lines[i].total_line_ht = (await tools.convertToDecimal(estimate.lines[i].estimate_line_price) * await tools.quantityDigits(estimate.lines[i].quantity)) - await tools.convertToDecimal(estimate.lines[i].discount)
            estimate.lines[i].total_line_ttc = (await tools.convertToDecimal(estimate.lines[i].estimate_line_price) * await tools.quantityDigits(estimate.lines[i].quantity)) - await tools.convertToDecimal(estimate.lines[i].discount) * (1 + estimate.lines[i].vat)
        }

        for (let i = 0; i < pagesCount; i++) {
            beforeFooterBreak = false
            let body = estimate.lines.slice(startIndex, (startIndex + Math.min(pagesLength[i], remainingLines)))
            remainingLines = Math.max(0, remainingLines - body.length)

            startIndex += pagesLength[i]
            pages.push({
                data: body
            })
        }
        if (pagesCount == 1) {
            if (pages[0].data.length > 24 && pages[0].data.length < 29) {
                beforeFooterBreak = true
            }
        } else {
            if (pages[pagesCount - 1].data.length > 34 && pages[pagesCount - 1].data.length < 38) {
                beforeFooterBreak = true
            }
        }


        estimate.header.total_ht = await tools.convertToDecimal(estimate.header.total_ht)
        estimate.header.total_vat = await tools.convertToDecimal(estimate.header.total_vat)
        estimate.header.total_price = await tools.convertToDecimal(estimate.header.total_price)


        data = {
            estimate: estimate.header,
            date: date,
            company: company,
            logo: logo,
            amountInWords: amountInWords,
            amountInFrenchWords: amountInFrenchWords ?? undefined,
            amountInArabicWords: amountInArabicWords ?? undefined,
            client: client,
            signature: signature_buffer,
            pages: pages,
            beforeFooterBreak: beforeFooterBreak
        }

        let filledTemplate

        if (language == "EN") {

            let estimate_template = await Template.findById(estimate.header.template_id)

            let template = estimate_template.template

            filledTemplate = Mustache.render(template, data)

        }

        if (language == "FR" || !language) {

            let estimate_template = await Template.findById(estimate.header.template_id_fr)

            let template = estimate_template.template

            filledTemplate = Mustache.render(template, data)

        }

        if (language == "AR") {

            let estimate_template = await Template.findById(estimate.header.template_id_ar)

            let template = estimate_template.template

            filledTemplate = Mustache.render(template, data)

        }

        return filledTemplate

    } catch (r) {
        throw (r)
    }
}