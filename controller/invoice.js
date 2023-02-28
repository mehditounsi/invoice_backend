const InvoiceService = require("../services/invoice");
const testService = require("../services/generate_pdf")
const Logger = require("winston");
const fs = require("fs");
let pdf = require('html-pdf');
const tools = require('../helpers/tools')
const { pipe } = require("pdfkit");
const { stream } = require("winston");




//-----------------INVOICES---------------------------


exports.createInvoice = async (req, res) => {
    try {
        Logger.debug(req.body)
        let file
        let filename
        if (req.file) {
            req.file.originalname = req.file.originalname.split('.')[0] + '.PNG'
            file = fs.readFileSync(req.file.path)
            filename = req.file.originalname
        }
        let data = {
            header: JSON.parse(req.body.header),
            lines: JSON.parse(req.body.lines)
        }
        let invoice = await InvoiceService.createInvoice(data, file ?? undefined, filename ?? undefined)
        res.status(200).json(invoice);
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

exports.createInvoiceLine = async (req, res) => {
    try {
        Logger.debug(req.params, req.body)
        //invoice id
        let id = req.params.id
        let invoice_line = await InvoiceService.createInvoiceLine(id, req.body)
        res.status(200).json(invoice_line)
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

exports.getInvoice = async (req, res) => {
    try {
        Logger.debug(req.params)
        let id = req.params.id
        let invoice = await InvoiceService.getInvoice(id)
        res.status(200).json(invoice);
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

exports.getInvoiceLine = async (req, res) => {
    try {
        Logger.debug(req.params)
        let id = req.params.id
        let invoice_line = await InvoiceService.getInvoiceLine(id)
        res.status(200).json(invoice_line)
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

exports.getHydratedInvoice = async (req, res) => {
    try {
        Logger.debug(req.params)
        let id = req.params.id
        let hydrated_invoice = await InvoiceService.getHydratedInvoice(id)
        res.status(200).json(hydrated_invoice)
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}



exports.getAllInvoice = async (req, res) => {
    try {
        Logger.debug(req.query.search, req.query.start_date, req.query.end_date, req.query.status)

        let search = req.query.search
        let start_date = req.query.start_date
        let end_date = req.query.end_date
        let status
        if (req.query.status) {
            status = req.query.status.split('+')
        }
        let invoice = await InvoiceService.getAllInvoice(search, start_date, end_date, status)
        res.status(200).json(invoice);
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

exports.updateInvoice = async (req, res) => {
    try {
        Logger.debug(req.params)
        let id = req.params.id
        let invoice = await InvoiceService.updateInvoice(id, req.body)
        res.status(200).json(invoice)
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);

    }
}

exports.updateInvoiceLine = async (req, res) => {
    try {
        Logger.debug(req.params, req.body)
        let id = req.params.id
        let line = await InvoiceService.updateInvoiceLine(id, req.body)
        res.status(200).json(line);
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}


exports.updateHydratedInvoice = async (req, res) => {
    try {
        Logger.debug(req.params, req.body)
        let id = req.params.id
        let file
        let filename
        if (req.file) {
            req.file.originalname = req.file.originalname.split('.')[0] + '.PNG'
            file = fs.readFileSync(req.file.path)
            filename = req.file.originalname
        }
        let data = {
            header: JSON.parse(req.body.header),
            lines: JSON.parse(req.body.lines)
        }

        let hydrated_invoice = await InvoiceService.updateHydratedInvoice(id, data, file ?? undefined, filename ?? undefined)
        res.status(200).json(hydrated_invoice);
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

exports.deleteInvoice = async (req, res) => {
    try {
        Logger.debug(req.params)
        let id = req.params.id
        let invoice = await InvoiceService.deleteInvoice(id)
        res.status(200).json(invoice);

    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);

    }
}

exports.validateInvoice = async (req, res) => {
    try {
        Logger.debug(req.params)
        let id = req.params.id
        let validation = await InvoiceService.validateInvoice(id)
        res.status(200).json({ message: "Invoice validated" })
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

exports.draftInvoice = async (req, res) => {
    try {
        Logger.debug(req.params)
        let id = req.params.id
        let draft = await InvoiceService.draftInvoice(id)
        res.status(200).json({ message: "Invoice drafted" })
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

exports.duplicateInvoice = async (req, res) => {
    try {
        Logger.debug(req.params)
        let id = req.params.id
        let invoice = await InvoiceService.duplicateInvoice(id)
        res.status(200).json(invoice);

    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);

    }
}

exports.printInvoice = async (req, res) => {
    try {
        Logger.debug(req.params)
        let language = req.query.language
        let id = req.params.id
        let html = await testService.getInvoiceData(id , language)
        let footer = await testService.getInvoiceFooter(id)

        var options = { format: 'A4', orientation: 'portrait', margin: '1in', footer: footer }
        pdf.create(html, options).toStream(function (err, stream) {
            if (err) return res.end(err.stack)
            res.setHeader('Content-type', 'application/pdf')
            stream.pipe(res)
        })
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

exports.exportInvoice = async (req, res) => {
    try {
        let filename = 'invoices.xlsx'
        let excel = await InvoiceService.exportInvoice()
        res.setHeader('Content-type', "application/octet-stream");
        res.setHeader('Content-disposition', 'attachment; filename=' + filename + ".xlsx");
        res.send(excel)
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

exports.getInvoiceMonthly = async (req, res) => {
    try {
        Logger.debug(req.query)
        let year = req.query.year
        let years = await InvoiceService.getInvoiceMonthly(year)
        res.status(200).json(years);
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

exports.getInvoiceYears = async (req, res) => {
    try {
        let years = await InvoiceService.getInvoiceYears()
        res.status(200).json(years);
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

//-----------------ESTIMATES---------------------------


exports.createEstimate = async (req, res) => {
    try {
        Logger.debug(req.body)
        let file
        let filename
        if (req.file) {
            req.file.originalname = req.file.originalname.split('.')[0] + '.PNG'
            file = fs.readFileSync(req.file.path)
            filename = req.file.originalname
        }
        let data = {
            header: JSON.parse(req.body.header),
            lines: JSON.parse(req.body.lines)
        }
        let estimate = await InvoiceService.createEstimate(data, file ?? undefined, filename ?? undefined)
        res.status(200).json(estimate);
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

exports.createEstimateLine = async (req, res) => {
    try {
        Logger.debug(req.params, req.body)
        //estimate id
        let id = req.params.id
        let estimate_line = await InvoiceService.createEstimateLine(id, req.body)
        res.status(200).json(estimate_line)
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

exports.getEstimate = async (req, res) => {
    try {
        Logger.debug(req.params)
        let id = req.params.id
        let estimate = await InvoiceService.getEstimate(id)
        res.status(200).json(estimate);
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

exports.getEstimateLine = async (req, res) => {
    try {
        Logger.debug(req.params)
        let id = req.params.id
        let estimate = await InvoiceService.getEstimateLine(id)
        res.status(200).json(estimate);
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

exports.getHydratedEstimate = async (req, res) => {
    try {
        Logger.debug(req.params)
        let id = req.params.id
        let hydrated_estimate = await InvoiceService.getHydratedEstimate(id)
        res.status(200).json(hydrated_estimate)
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

exports.getAllEstimate = async (req, res) => {
    try {
        Logger.debug(req.query.search, req.query.start_date, req.query.end_date, req.query.status)
        let search = req.query.search
        let start_date = req.query.start_date
        let end_date = req.query.end_date
        let status
        if (req.query.status) {
            status = req.query.status.split('+')
        }
        let estimate = await InvoiceService.getAllEstimate(search, start_date, end_date, status)
        res.status(200).json(estimate);
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

exports.updateEstimate = async (req, res) => {
    try {
        Logger.debug(req.params, req.body)
        let id = req.params.id
        let estimate = await InvoiceService.updateEstimate(id, req.body)
        res.status(200).json(estimate);

    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);

    }
}

exports.updateEstimateLine = async (req, res) => {
    try {
        Logger.debug(req.params, req.body)
        let id = req.params.id
        let estimate_line = await InvoiceService.updateEstimateLine(id, req.body)
        res.status(200).json(estimate_line);
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);

    }
}

exports.updateHydratedEstimate = async (req, res) => {
    try {
        Logger.debug(req.params, req.body)
        let id = req.params.id
        let file
        let filename
        if (req.file) {
            req.file.originalname = req.file.originalname.split('.')[0] + '.PNG'
            file = fs.readFileSync(req.file.path)
            filename = req.file.originalname
        }
        let data = {
            header: JSON.parse(req.body.header),
            lines: JSON.parse(req.body.lines)
        }

        let hydrated_estimate = await InvoiceService.updateHydratedEstimate(id, data, file ?? undefined, filename ?? undefined)
        res.status(200).json(hydrated_estimate);
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

exports.deleteEstimate = async (req, res) => {
    try {
        Logger.debug(req.params)
        let id = req.params.id
        let estimate = await InvoiceService.deleteEstimate(id)
        res.status(200).json(estimate);

    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);

    }
}

exports.validateEstimate = async (req, res) => {
    try {
        Logger.debug(req.params)
        let id = req.params.id
        let validation = await InvoiceService.validateEstimate(id)
        res.status(200).json({ message: "Estimate validated" })
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

exports.draftEstimate = async (req, res) => {
    try {
        Logger.debug(req.params)
        let id = req.params.id
        let draft = await InvoiceService.draftEstimate(id)
        res.status(200).json({ message: "Estimate drafted" })
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}



exports.duplicateEstimate = async (req, res) => {
    try {
        Logger.debug(req.params)
        let id = req.params.id
        let estimate = await InvoiceService.duplicateEstimate(id)
        res.status(200).json(estimate);

    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);

    }
}

exports.printEstimate = async (req, res) => {
    try {
        Logger.debug(req.params)
        let language = req.query.language
        let id = req.params.id
        let html = await testService.getEstimateData(id , language)
        let footer = await testService.getEstimateFooter(id)

        var options = { format: 'A4', orientation: 'portrait', margin: '1in', footer: footer }
        pdf.create(html, options).toStream(function (err, stream) {
            stream.pipe(res);
        })
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

exports.convertEstimateToInvoice = async (req, res) => {
    try {
        Logger.debug(req.params)
        let id = req.params.id
        let conversion = await InvoiceService.convertEstimateToInvoice(id)
        res.status(200).json(conversion)
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}


// --------------------------------CLIENTS ----------------------------


exports.createClient = async (req, res) => {
    try {
        Logger.debug(req.body)
        let client = await InvoiceService.createClient(req.body)
        res.status(200).json(client)
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error)
    }
}

exports.getClient = async (req, res) => {
    try {
        Logger.debug(req.params)
        let id = req.params.id
        let client = await InvoiceService.getClient(id)
        res.status(200).json(client)
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error)
    }
}

exports.getAllClient = async (req, res) => {
    try {
        Logger.debug(req.query.search)
        let search = req.query.search
        let client = await InvoiceService.getAllClient(search)
        res.status(200).json(client);
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

exports.verifyTaxId = async (req, res) => {
    try {
        Logger.debug(req.query)
        let tax_identification = req.query.tax_identification
        let id = req.query.id
        let verification = await InvoiceService.verifyTaxId(tax_identification, id)
        res.status(200).json({ result: verification });
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

exports.updateClient = async (req, res) => {
    try {
        Logger.debug(req.params)
        let id = req.params.id
        let client = await InvoiceService.updateClient(id, req.body)
        res.status(200).json(client);

    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);

    }
}

exports.deleteClient = async (req, res) => {
    try {
        Logger.debug(req.params)
        let id = req.params.id
        let client = await InvoiceService.deleteClient(id)
        res.status(200).json(client);

    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);

    }
}

// --------------------------------ARTICLES ----------------------------


exports.createArticle = async (req, res) => {
    try {
        Logger.debug(req.body)
        let article = await InvoiceService.createArticle(req.body)
        res.status(200).json(article)
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error)
    }
}

exports.getArticle = async (req, res) => {
    try {
        Logger.debug(req.params)
        let id = req.params.id
        let article = await InvoiceService.getArticle(id)
        res.status(200).json(article)
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error)
    }
}

exports.getAllArticle = async (req, res) => {
    try {
        Logger.debug(req.query.search)
        let search = req.query.search
        let status = req.query.status
        let article = await InvoiceService.getAllArticle(search, status)
        res.status(200).json(article);
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

exports.updateArticle = async (req, res) => {
    try {
        Logger.debug(req.params, req.body)
        let id = req.params.id
        let article = await InvoiceService.updateArticle(id, req.body)
        res.status(200).json(article);
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

exports.deleteArticle = async (req, res) => {
    try {
        Logger.debug(req.params)
        let id = req.params.id
        let article = await InvoiceService.deleteArticle(id)
        res.status(200).json(article);
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);

    }
}


exports.activateArticle = async (req, res) => {
    try {
        Logger.debug(req.params)
        let id = req.params.id
        let article = await InvoiceService.activateArticle(id)
        res.status(200).json({ message: "Article activated" });
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}


exports.deactivateArticle = async (req, res) => {
    try {
        Logger.debug(req.params)
        let id = req.params.id
        let status = await InvoiceService.deactivateArticle(id)
        res.status(200).json({ message: "Article deactivated" });
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}


exports.suspendArticle = async (req, res) => {
    try {
        Logger.debug(req.params)
        let id = req.params.id
        let status = await InvoiceService.suspendArticle(id)
        res.status(200).json({ message: "Article suspended" });

    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }

}


exports.verifyCode = async (req, res) => {
    try {
        Logger.debug(req.query)
        let code = req.query.code
        let id = req.query.id
        let verification = await InvoiceService.verifyCode(code, id)
        res.status(200).json({ result: verification });
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

//-----------------VAT---------------

exports.createVat = async (req, res) => {
    try {
        let vat = await InvoiceService.createVat(req.body)
        res.status(200).json(vat);
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

exports.getVat = async (req, res) => {
    try {
        let vat = await InvoiceService.getVat()
        res.status(200).json(vat);
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

exports.updateVat = async (req, res) => {
    try {
        Logger.debug(req.params, req.body)
        let id = req.params.id
        let vat = await InvoiceService.updateVat(id, req.body)
        res.status(200).json(vat);
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}
exports.deleteVat = async (req, res) => {
    try {
        let id = req.params.id
        let vat = await InvoiceService.deleteVat(id)
        res.status(200).json(vat);
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}


// -----------------Company



exports.getCompany = async (req, res) => {
    try {
        Logger.debug(req.params)
        let id = req.params.id
        let company = await InvoiceService.getCompany(id)
        res.status(200).json(company)
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

exports.editCompany = async (req, res) => {
    try {
        Logger.debug(req.body, req.file)
        let file
        let filename
        if (req.file) {
            req.file.originalname = req.file.originalname.split('.')[0] + '.PNG'
            file = fs.readFileSync(req.file.path)
            filename = req.file.originalname
        }
        let data = {
            logo: file ?? undefined,
            name: req.body.name ?? undefined,
            address: req.body.address ?? undefined,
            telephone: req.body.telephone ?? undefined,
            fax: req.body.fax ?? undefined,
            rib: req.body.rib ?? undefined,
            tax_identification: req.body.tax_identification ?? undefined,
            timbre: req.body.timbre ?? undefined,
            digits: req.body.digits ?? undefined,
            quantity_digits: req.body.quantity_digits ?? undefined,
            discount: req.body.discount ?? undefined,
            article_edition: req.body.article_edition ?? undefined,
            footer: req.body.footer ?? undefined,
            config: req.body.config ?? undefined,
        }
        let id = req.params.id
        let company = await InvoiceService.editCompany(id, data, filename ?? undefined)
        res.status(200).json(company)
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

exports.totalByClient = async (req, res) => {
    try {
        let start_date = req.query.start_date
        let end_date = req.query.end_date
        let search = req.query.search
        let total = await InvoiceService.totalByClient(start_date, end_date, search)
        res.status(200).json(total)
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

exports.totalByArticle = async (req, res) => {
    try {
        let start_date
        let end_date
        if (typeof req.query.start_date === 'string' && typeof req.query.end_date === 'string') {
            start_date = req.query.start_date.substring(0, 10)
            end_date = req.query.end_date.substring(0, 10)
        }
        let search = req.query.search
        let total = await InvoiceService.totalByArticle(start_date, end_date, search)
        res.status(200).json(total)
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}



// ---------------------------contact

exports.postContact = async (req, res) => {
    try {
        let file
        let filename
        if (req.file) {
            file = fs.readFileSync(req.file.path)
            filename = req.file.originalname
        }
        let contact = await InvoiceService.postContact(req.body, file, filename)
        res.status(200).json(contact);
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}




exports.getInvoiceShareUrl = async (req, res) => {
    try {
        let id = req.params.id
        let language = req.query.language
        let file
        let filename
        let date = Date.now()
        let random_alphanumeric = await tools.randomAlphabetic(64)
        var filename_code = date + id + random_alphanumeric

        let html = await testService.getInvoiceData(id,language)
        let footer = await testService.getInvoiceFooter(id)
        let pdfFilePath = "./invoice.pdf"

        var options = { format: 'A4', orientation: 'portrait', margin: '1in', footer: footer }
        pdf.create(html, options).toFile(pdfFilePath, function (err, file) {
        })

        file = pdfFilePath
        filename = `invoice_${filename_code}.pdf`


        await InvoiceService.createCompanyBucket()

        await InvoiceService.postInvoiceFile(file, filename , id)

        let url = await InvoiceService.getUrl(filename)

        res.status(200).json(url);

    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}


exports.getEstimateShareUrl = async (req, res) => {
    try {
        let id = req.params.id
        let language = req.query.language
        let file
        let filename
        let date = Date.now()
        let random_alphanumeric = await tools.randomAlphabetic(64)
        var filename_code = date + id + random_alphanumeric

        let html = await testService.getEstimateData(id,language)
        let footer = await testService.getEstimateFooter(id)

        let pdfFilePath = "./estimate.pdf"

        var options = { format: 'A4', orientation: 'portrait', margin: '1in', footer: footer }
        pdf.create(html, options).toFile(pdfFilePath, function (err, file) {
        })

        file = pdfFilePath
        filename = `estimate_${filename_code}.pdf`


        await InvoiceService.createCompanyBucket()

        await InvoiceService.postEstimateFile(file, filename , id)

        let url = await InvoiceService.getUrl(filename)

        res.status(200).json(url);

    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}


exports.sendMail = async (req,res) => {
    try {
        await InvoiceService.sendMail(req.body)
        res.status(200).json({message : 'mail has been sent with success'});
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}





