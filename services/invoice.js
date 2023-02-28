const { Client, Article, Invoice, Estimate, Invoice_line, Estimate_line, Company, Vat, Attachment, Template, Contact, User } = require('../models')
const { getCompanyId, getUserId } = require('../helpers/context')
const tools = require('../helpers/tools')
const Errors = require('../helpers/errors');
const configuration = require('../config/config')
const Logger = require('winston')
var PdfTable = require('voilab-pdf-table');
const PDFDocument = require('pdfkit');
const numWords = require('num-words')
const multer = require('multer')
const excelJS = require("exceljs");
const fs = require('fs');
const minioClient = require('../config/minio')
const redis_client = require('../config/redis');
const { mailtemplate } = require('../config/constants');
let createAndSendEmail = require('../helpers/nodemailer')
//----------------- Invoice services ----------------

exports.createInvoice = async (data, file, filename) => {
    try {
        if (data) {
            let invoice_number = await tools.getNextCode(configuration.tablename.invoice)
            data.header["number"] = invoice_number.next
            data.header["num_interne"] = invoice_number.max
            let company = await Company.findById(getCompanyId())
            let client = await Client.findById(data.header.client_id)
            if (client) {
                data.header["client"] = {}
                for (var key in client) {
                    if (client[key] == null) {
                        client[key] = undefined
                    }
                }
                data.header["client"] = JSON.stringify(client)
            }

            if (company) {
                data.header["company"] = {}
                for (var key in company) {
                    if (company[key] == null) {
                        company[key] = undefined
                    }
                }
                data.header["company"] = JSON.stringify(company)
            }

            let attachment
            if (file && filename) {
                attachment = await Attachment.create({ attachment: file, filename: filename, company_id: getCompanyId() })
                data.header["signature"] = attachment.id
            } else {
                let user = await User.findById(getUserId())
                if (user.signature) {
                    data.header["signature"] = user.signature
                }
            }

            let total_vat = 0
            let total_ttc = 0
            let total_ht = 0
            let total_discount = 0

            for (let i = 0; i < data.lines.length; i++) {
                total_ht = total_ht + (parseFloat(data.lines[i].price) * parseFloat(data.lines[i].quantity))
                total_vat = total_vat + (parseFloat(data.lines[i].price) * parseFloat(data.lines[i].vat) * parseFloat(data.lines[i].quantity))
                total_discount = total_discount + parseFloat(data.lines[i].discount)
            }

            total_ht = total_ht - total_discount
            if (company.discount == 1) {
                total_ht = total_ht - parseFloat(data.header.discount)
            }
            if (client.vat == 1) {

                total_ttc = total_ht + total_vat
            } else {
                total_ttc = total_ht
                total_vat = 0
            }
            if (client.timbre == 1 && data.header.timbre != null) {
                total_ttc = total_ttc + parseFloat(data.header.timbre)
            } else {
                data.header.timbre = 0
            }


            data.header["total_vat"] = parseFloat(total_vat)
            data.header["total_ht"] = parseFloat(total_ht)
            data.header["total_price"] = parseFloat(total_ttc)

            data.header["template_id"] = company.invoice_template_id
            data.header["template_id_fr"] = company.invoice_template_id_fr
            data.header["template_id_ar"] = company.invoice_template_id_ar



            let invoice = await Invoice.create(data.header);

            let invoice_lines
            for (let i = 0; i < data.lines.length; i++) {
                data.lines[i]["invoice_id"] = invoice.id
                data.lines[i]["company_id"] = getCompanyId()
                if (client.vat == 1) {
                    data.lines[i]["total"] = (parseFloat(data.lines[i]["price"]) + (parseFloat(data.lines[i]["price"]) * parseFloat(data.lines[i]["vat"]))) * parseFloat(data.lines[i]["quantity"])
                } else {
                    data.lines[i]["total"] = parseFloat(data.lines[i]["price"]) * parseFloat(data.lines[i]["quantity"])
                }
                invoice_lines = await Invoice_line.create(data.lines[i])
            }
            Logger.info("Create invoice", invoice)
            Logger.info("Create invoice line", invoice_lines)

            io.to(getCompanyId()).emit('invoices-updated', 'invoices-updated')


            return {
                header: invoice,
                lines: invoice_lines
            }
        } else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

exports.createInvoiceLine = async (id, data) => {
    try {
        if (id, data) {
            data.invoice_id = id
            let invoice_lines = await Invoice_line.create(data)
            Logger.info("Create invoice line", invoice_lines)
            return invoice_lines
        }
        throw new Errors.InvalidDataError('missing data')
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }

}



exports.getInvoice = async (id) => {
    try {
        if (id) {
            let invoice = await Invoice.findById(id)
            if (invoice) {
                Logger.info('get invoice', invoice)
                return invoice
            } else {
                throw new Errors.NotFoundError('invoice not found')
            }
        } else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

exports.getInvoiceLine = async (id) => {
    try {
        if (id) {
            let invoice_lines = await Invoice_line.findById(id)
            if (invoice_lines) {
                Logger.info('get invoice line', invoice_lines)
                return invoice_lines
            } else {
                throw new Errors.NotFoundError('invoice line not found')
            }
        } else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }

}

exports.getHydratedInvoice = async (id) => {
    try {
        if (id) {
            let hydrated_invoice = await Invoice.findHydratedInvoice(id)
            if (hydrated_invoice) {
                let attachment = await Attachment.findById(hydrated_invoice.header.signature)
                hydrated_invoice.header.signature = attachment

                Logger.info('get hydrated invoice line', hydrated_invoice)
                return hydrated_invoice
            } else {
                throw new Errors.NotFoundError('invoice not found')
            }
        } else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }

}

exports.getAllInvoice = async (search, start_date, end_date, status) => {
    try {
        if (search || start_date || end_date || status) {
            let invoice = await Invoice.searchInvoice(search, start_date, end_date, status)
            if (invoice) {
                Logger.info("searched invoice", invoice)
                return invoice
            } else {
                throw new Errors.NotFoundError('invoice not found')
            }
        }
        else {
            let invoices = await Invoice.findAll()
            if (invoices) {
                Logger.info("get all invoices", invoices)
                return invoices
            }
            else {
                throw new Errors.NotFoundError('invoice not found')
            }
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }

}

exports.updateInvoice = async (id, update) => {
    try {
        if (id && update) {
            let invoice = await Invoice.update(id, update)
            if (invoice) {
                Logger.info("update invoice", invoice)
                return invoice
            } else {
                throw new Errors.InvalidDataError('missing data')
            }
        } else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }

}


exports.updateInvoiceLine = async (id, update) => {
    try {
        if (id && update) {
            let invoice_lines = await Invoice_line.update(id, update)
            if (invoice_lines) {
                Logger.info("update invoice line", invoice_lines)
                return invoice_lines
            } else {
                throw new Errors.InvalidDataError('missing data')
            }
        } else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

exports.updateHydratedInvoice = async (id, data, file, filename) => {
    try {
        if (id && data) {
            let attachment

            if (file && filename) {
                attachment = await Attachment.create({ attachment: file, filename: filename, company_id: getCompanyId() })
                data.header["signature"] = attachment.id
            } else {
                let user = await User.findById(getUserId())
                if (user.signature) {
                    data.header["signature"] = user.signature
                }
            }

            let client = await Client.findById(data.header.client_id)
            if (client) {
                data.header["client"] = {}
                for (var key in client) {
                    if (client[key] == null) {
                        client[key] = undefined
                    }
                }
                data.header["client"] = JSON.stringify(client)
            }

            let company = await Company.findById(getCompanyId())
            if (company) {
                data.header["company"] = {}
                for (var key in company) {
                    if (company[key] == null) {
                        company[key] = undefined
                    }
                }
                data.header["company"] = JSON.stringify(company)
            }

            let total_vat = 0
            let total_ttc = 0
            let total_ht = 0
            let total_discount = 0

            for (let i = 0; i < data.lines.length; i++) {
                total_ht = total_ht + (parseFloat(data.lines[i].price) * parseFloat(data.lines[i].quantity))
                total_vat = total_vat + (parseFloat(data.lines[i].price) * parseFloat(data.lines[i].vat) * parseFloat(data.lines[i].quantity))
                total_discount = total_discount + parseFloat(data.lines[i].discount)
                if (client.vat == 1) {
                    data.lines[i]["total"] = (parseFloat(data.lines[i]["price"]) + (parseFloat(data.lines[i]["price"]) * parseFloat(data.lines[i]["vat"]))) * parseFloat(data.lines[i]["quantity"])
                } else {
                    data.lines[i]["total"] = parseFloat(data.lines[i]["price"]) * parseFloat(data.lines[i]["quantity"])
                }
            }

            total_ht = total_ht - total_discount
            if (company.discount == 1) {
                total_ht = total_ht - parseFloat(data.header.discount)
            }

            if (client.vat == 1) {
                total_ttc = total_ht + total_vat
            } else {
                total_ttc = total_ht
                total_vat = 0

            }
            if (client.timbre == 1) {
                total_ttc = total_ttc + parseFloat(data.header.timbre)
            } else {
                data.header.timbre = 0
            }

            data.header["total_vat"] = parseFloat(total_vat)
            data.header["total_ht"] = parseFloat(total_ht)
            data.header["total_price"] = parseFloat(total_ttc)


            data.header["template_id"] = company.invoice_template_id
            data.header["template_id_fr"] = company.invoice_template_id_fr
            data.header["template_id_ar"] = company.invoice_template_id_ar


            let hydrated_invoice = await Invoice.updateHydratedInvoice(id, data)
            if (hydrated_invoice) {
                Logger.info('update hydrated invoice', hydrated_invoice)

                io.to(getCompanyId()).emit('invoices-updated', 'invoices-updated')

                return hydrated_invoice
            } else {
                throw new Errors.InvalidDataError('missing data')
            }
        } else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

exports.deleteInvoice = async (id) => {
    try {
        if (id) {
            let invoice = await Invoice.findById(id)
            if (invoice) {
                let deleted_invoice = await Invoice.destroy(id)
                let deleted_invoice_line = await Invoice_line.destroyByAttribute(id)
                Logger.info("delete invoice", { invoice: deleted_invoice, invoice_line: deleted_invoice_line })
                io.to(getCompanyId()).emit('invoices-updated', 'invoices-updated')
                return { invoice: deleted_invoice, invoice_line: deleted_invoice_line }
            } else {
                throw new Errors.NotFoundError('no invoice to delete')
            }
        }
        else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

exports.validateInvoice = async (id) => {
    try {
        if (id) {
            let invoice = await Invoice.findById(id)
            if (invoice) {
                if (invoice.status == 0) {
                    await Invoice.update(id, { status: 1 })
                } else {
                    throw new Errors.InvalidDataError('Invoice already validated')
                }
            } else {
                throw new Errors.NotFoundError('invoice not found')
            }
        } else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

exports.draftInvoice = async (id) => {
    try {
        if (id) {
            let invoice = await Invoice.findById(id)
            if (invoice) {
                if (invoice.status == 1) {
                    await Invoice.update(id, { status: 0 })
                } else {
                    throw new Errors.InvalidDataError('Invoice already drafted')
                }
            } else {
                throw new Errors.NotFoundError('invoice not found')
            }
        } else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }

}

exports.duplicateInvoice = async (id) => {
    try {
        if (id) {
            let invoice = await Invoice.findById(id)
            let invoice_lines = await Invoice_line.getInvoiceLineByInvoice(id)
            if (invoice && invoice_lines) {
                invoice.id = undefined
                invoice.number = undefined
                invoice.date = undefined
                invoice.num_interne = undefined
                invoice.signature_date = undefined
                for (let i = 0; i < invoice_lines.length; i++) {
                    invoice_lines[i].id = undefined
                }

                let duplicate = {
                    header: invoice,
                    lines: invoice_lines
                }

                let new_invoice = await this.createInvoice(duplicate)

                Logger.info('duplicate invoice', new_invoice)
                return new_invoice
            }
            throw new Errors.NotFoundError('invoice not found')
        }
        throw new Errors.InvalidDataError('missing data')
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }

}

exports.exportInvoice = async () => {
    try {
        let Allinvoices = await Invoice.getAllHydratedInvoices()
        if (Allinvoices) {
            const workbook = new excelJS.Workbook();  // Create a new workbook

            const worksheet = workbook.addWorksheet("My Invoices"); // New Worksheet

            const path = "./files";  // Path to download excel

            // Column for data in excel. key must match data key
            worksheet.columns = [
                { header: "Invoice n.", key: "number", width: 20 },
                { header: "date", key: "date", width: 20 },
                { header: "client", key: "client_name", width: 20 },
                { header: "address", key: "client_address", width: 20 },
                { header: "code", key: "invoice_line_code", width: 20 },
                { header: "article", key: "invoice_line_article", width: 20 },
                { header: "quantity", key: "quantity", width: 20 },
                { header: "price", key: "invoice_line_price", width: 20 },
                { header: "discount", key: "discount", width: 20 },
                { header: "vat", key: "invoice_line_vat", width: 20 },
                { header: "total", key: "total", width: 20 }
            ]

            for (let i = 0; i < Allinvoices.length; i++) {
                Allinvoices[i].date = Allinvoices[i].date.toISOString().split('T')[0]
                Allinvoices[i].quantity = await tools.quantityDigits(Allinvoices[i].quantity)
                if (typeof Allinvoices[i].client === "string") {
                    Allinvoices[i].client_name = JSON.parse(Allinvoices[i].client).name
                    Allinvoices[i].client_address = JSON.parse(Allinvoices[i].client).address
                } else {
                    Allinvoices[i].client_name = Allinvoices[i].client.name
                    Allinvoices[i].client_address = Allinvoices[i].client.address
                }
            }

            Allinvoices.forEach((invoice) => {
                worksheet.addRow(invoice); // Add data in worksheet
            });

            // Making first line in excel bold
            worksheet.getRow(1).eachCell((cell) => {
                cell.font = { bold: true };
            });

            return await workbook.xlsx.writeBuffer(`${path}/users.xlsx`)
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

exports.getInvoiceMonthly = async (year) => {
    try {
        if (year) {
            let months = await Invoice.getInvoiceMonthly(year)
            if (months) {
                Logger.info('Invoice months', months)
                for (let i = 1; i <= 12; i++) {
                    let mon
                    if (months.monthlySales.findIndex((monthly) => {
                        mon = i.toString().length == 1 ? '0' + i : i
                        if (monthly.month == mon)
                            return -1;
                    }) == -1) {
                        months.monthlySales.push({
                            month: mon.toString(),
                            client_count: "0",
                            invoice_count: "0",
                            total_ht: "0",
                            total_price: "0"
                        });
                    }
                }
                months.monthlySales.sort(function (a, b) { if (a.month > b.month) return -1 })
                return months
            } else {
                months = {
                    year: year,
                    clients: "0",
                    invoices: "0",
                    total_ht: "0",
                    total_price: "0",
                    monthlySales: []
                }
                for (let i = 1; i <= 12; i++) {
                    months.monthlySales.push({
                        month: i.toString(),
                        client_count: "0",
                        invoice_count: "0",
                        total_ht: "0",
                        total_price: "0"
                    });

                }
                return months
            }
        } else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

exports.getInvoiceYears = async () => {
    try {
        let years = await Invoice.getInvoiceYears()
        if (years.length > 0) {
            years = years.map(year => year.year)
            Logger.info('Invoice years', years)
            if (years.length >= 2) {
                let lastYear = parseInt(years[0])
                let firstYear = parseInt(years[years.length - 1])
                for (let i = firstYear + 1; i < lastYear; i++) {
                    let y
                    if (years.findIndex((yearly) => {
                        y = i
                        if (yearly == y)
                            return -1;
                    }) == -1) {
                        years.push(y.toString());
                    }
                }
                years.sort(function (a, b) { if (a > b) return -1 })
                return years
            } else {
                let uniqueYear = years[0]
                let yearsArray = [uniqueYear - 1, uniqueYear - 2]
                for (let i = 0; i < yearsArray.length; i++) {
                    years.push(yearsArray[i].toString());
                }
                years.sort(function (a, b) { if (a > b) return -1 })
                return years
            }
        } else {
            var currentTime = new Date()
            let currentYear = currentTime.getFullYear()
            let currentYears = [currentYear.toString()]
            let yearsArray = [currentYear - 1, currentYear - 2]
            for (let i = 0; i < yearsArray.length; i++) {
                currentYears.push(yearsArray[i].toString());
            }
            currentYears.sort(function (a, b) { if (a > b) return -1 })
            return currentYears
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}


//----------------- estimates services ----------------

exports.createEstimate = async (data, file, filename) => {
    try {
        if (data) {
            let estimate_number = await tools.getNextCode(configuration.tablename.estimate)

            data.header["number"] = estimate_number.next
            data.header["num_interne"] = estimate_number.max
            let attachment

            let company = await Company.findById(getCompanyId())
            let client = await Client.findById(data.header.client_id)
            if (client) {
                data.header["client"] = {}
                for (var key in client) {
                    if (client[key] == null) {
                        client[key] = undefined
                    }
                }
                data.header["client"] = JSON.stringify(client)
            }
            if (company) {
                data.header["company"] = {}
                for (var key in company) {
                    if (company[key] == null) {
                        company[key] = undefined
                    }
                }
                data.header["company"] = JSON.stringify(company)
            }

            if (file && filename) {
                attachment = await Attachment.create({ attachment: file, filename: filename, company_id: getCompanyId() })
                data.header["signature"] = attachment.id
            } else {
                let user = await User.findById(getUserId())
                if (user.signature) {
                    data.header["signature"] = user.signature
                }
            }

            let total_vat = 0
            let total_ttc = 0
            let total_ht = 0
            let total_discount = 0

            for (let i = 0; i < data.lines.length; i++) {
                total_ht = total_ht + (parseFloat(data.lines[i].price) * parseFloat(data.lines[i].quantity))
                total_vat = total_vat + (parseFloat(data.lines[i].price) * parseFloat(data.lines[i].vat) * parseFloat(data.lines[i].quantity))
                total_discount = total_discount + parseFloat(data.lines[i].discount)
            }

            total_ht = total_ht - total_discount
            if (company.discount == 1) {
                total_ht = total_ht - parseFloat(data.header.discount)
            }

            if (client.vat == 1) {
                total_ttc = total_ht + total_vat
            } else {
                total_ttc = total_ht
                total_vat = 0

            }

            data.header["total_vat"] = parseFloat(total_vat)
            data.header["total_ht"] = parseFloat(total_ht)
            data.header["total_price"] = parseFloat(total_ttc)


            data.header["template_id"] = company.estimate_template_id
            data.header["template_id_fr"] = company.estimate_template_id_fr
            data.header["template_id_ar"] = company.estimate_template_id_ar


            let estimate = await Estimate.create(data.header);

            let estimate_line
            for (let i = 0; i < data.lines.length; i++) {
                data.lines[i]["estimate_id"] = estimate.id

                if (client.vat == 1) {
                    data.lines[i]["total"] = (parseFloat(data.lines[i]["price"]) + (parseFloat(data.lines[i]["price"]) * parseFloat(data.lines[i]["vat"]))) * parseFloat(data.lines[i]["quantity"])
                } else {
                    data.lines[i]["total"] = parseFloat(data.lines[i]["price"]) * parseFloat(data.lines[i]["quantity"])
                }

                estimate_line = await Estimate_line.create(data.lines[i])
            }

            Logger.info("create estimate", estimate)
            Logger.info("create estimate line", estimate_line)
            io.to(getCompanyId()).emit('estimates-updated', 'estimates-updated')

            return {
                header: estimate,
                lines: estimate_line
            }
        } else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

exports.createEstimateLine = async (id, data) => {
    try {
        if (id, data) {
            data.estimate_id = id
            let estimate_line = await Estimate_line.create(data)
            Logger.info('create estimate line', estimate_line)
            return estimate_line
        }
        throw new Errors.InvalidDataError('missing data')
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

exports.getEstimate = async (id) => {
    try {
        if (id) {
            let estimate = await Estimate.findById(id)
            if (estimate) {
                Logger.info("get estimate", estimate)
                return estimate
            } else {
                throw new Errors.NotFoundError('estimate not found')
            }
        } else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

exports.getEstimateLine = async (id) => {
    try {
        if (id) {
            let estimate_line = await Estimate_line.findById(id)
            if (estimate_line) {
                Logger.info("get estimate line", estimate_line)
                return estimate_line
            } else {
                throw new Errors.NotFoundError('estimate not found')
            }
        } else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

exports.getHydratedEstimate = async (id) => {
    try {
        if (id) {
            let hydrated_estimate = await Estimate.findHydratedEstimate(id)
            if (hydrated_estimate) {
                let attachment = await Attachment.findById(hydrated_estimate.header.signature)
                hydrated_estimate.header.signature = attachment
                Logger.info('get hydrated estimate', hydrated_estimate)
                return hydrated_estimate
            } else {
                throw new Errors.NotFoundError('estimate not found')
            }
        } else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

exports.getAllEstimate = async (search, start_date, end_date, status) => {
    try {
        if (search || start_date || end_date || status) {
            let estimate = await Estimate.searchEstimate(search, start_date, end_date, status)
            if (estimate) {
                Logger.info("search estimate", estimate)
                return estimate
            } else {
                throw new Errors.NotFoundError('estimate not found')
            }
        }
        else {
            let estimates = await Estimate.findAll()
            if (estimates) {
                Logger.info("get all estimates ", estimates)
                return estimates
            }
            else {
                throw new Errors.NotFoundError('estimate not found')
            }
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

exports.updateEstimate = async (id, update) => {
    try {
        if (id && update) {
            let estimate = await Estimate.update(id, update)
            if (estimate) {
                Logger.info("update estimate", estimate)
                return estimate
            } else {
                throw new Errors.InvalidDataError('missing data')
            }
        } else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

exports.updateEstimateLine = async (id, update) => {
    try {
        if (id && update) {
            let estimate_line = await Estimate_line.update(id, update)
            if (estimate_line) {
                Logger.info("update estimate line", estimate_line)
                return estimate_line
            } else {
                throw new Errors.InvalidDataError('missing data')
            }
        } else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

exports.updateHydratedEstimate = async (id, data, file, filename) => {
    try {
        if (id && data) {
            let attachment
            if (file && filename) {
                attachment = await Attachment.create({ attachment: file, filename: filename, company_id: getCompanyId() })
                data.header["signature"] = attachment.id
            } else {
                let user = await User.findById(getUserId())
                if (user.signature) {
                    data.header["signature"] = user.signature
                }
            }

            let client = await Client.findById(data.header.client_id)
            if (client) {
                data.header["client"] = {}
                for (var key in client) {
                    if (client[key] == null) {
                        client[key] = undefined
                    }
                }
                data.header["client"] = JSON.stringify(client)
            }

            let company = await Company.findById(getCompanyId())
            if (company) {
                data.header["company"] = {}
                for (var key in company) {
                    if (company[key] == null) {
                        company[key] = undefined
                    }
                }
                data.header["company"] = JSON.stringify(company)
            }

            let total_vat = 0
            let total_ttc = 0
            let total_ht = 0
            let total_discount = 0

            for (let i = 0; i < data.lines.length; i++) {
                total_ht = total_ht + (parseFloat(data.lines[i].price) * parseFloat(data.lines[i].quantity))
                total_vat = total_vat + (parseFloat(data.lines[i].price) * parseFloat(data.lines[i].vat) * parseFloat(data.lines[i].quantity))
                total_discount = total_discount + parseFloat(data.lines[i].discount)
                if (client.vat == 1) {
                    data.lines[i]["total"] = (parseFloat(data.lines[i]["price"]) + (parseFloat(data.lines[i]["price"]) * parseFloat(data.lines[i]["vat"]))) * parseFloat(data.lines[i]["quantity"])
                } else {
                    data.lines[i]["total"] = parseFloat(data.lines[i]["price"]) * parseFloat(data.lines[i]["quantity"])
                }
            }

            total_ht = total_ht - total_discount
            if (company.discount == 1) {
                total_ht = total_ht - parseFloat(data.header.discount)
            }

            if (client.vat == 1) {
                total_ttc = total_ht + total_vat
            } else {
                total_ttc = total_ht
                total_vat = 0

            }

            data.header["total_vat"] = parseFloat(total_vat)
            data.header["total_ht"] = parseFloat(total_ht)
            data.header["total_price"] = parseFloat(total_ttc)

            data.header["template_id"] = company.estimate_template_id
            data.header["template_id_fr"] = company.estimate_template_id_fr
            data.header["template_id_ar"] = company.estimate_template_id_ar

            let hydrated_estimate = await Estimate.updateHydratedEstimate(id, data)
            if (hydrated_estimate) {
                Logger.info("update hydrated estimate", hydrated_estimate)
                io.to(getCompanyId()).emit('estimates-updated', 'estimates-updated')
                return hydrated_estimate
            } else {
                throw new Errors.InvalidDataError('missing data')
            }
        } else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

exports.deleteEstimate = async (id) => {
    try {
        if (id) {
            let estimate = await Estimate.findById(id)
            if (estimate) {
                let deleted_estimate = await Estimate.destroy(id)
                let deleted_estimate_line = await Estimate_line.destroyByAttribute(id)

                Logger.info("delete estimate", { estimate: deleted_estimate, estimate_line: deleted_estimate_line })
                io.to(getCompanyId()).emit('estimates-updated', 'estimates-updated')
                return { estimate: deleted_estimate, estimate_line: deleted_estimate }
            } else {
                throw new Errors.NotFoundError('no estimate to delete')
            }
        }
        else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }

}


exports.validateEstimate = async (id) => {
    try {
        if (id) {
            let estimate = await Estimate.findById(id)
            if (estimate) {
                if (estimate.status == 0) {
                    await Estimate.update(id, { status: 1 })
                } else {
                    throw new Errors.InvalidDataError('Estimate already validated')
                }
            } else {
                throw new Errors.NotFoundError('estimate not found')
            }
        } else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

exports.draftEstimate = async (id) => {
    try {
        if (id) {
            let estimate = await Estimate.findById(id)
            if (estimate) {
                if (estimate.status == 1) {
                    await Estimate.update(id, { status: 0 })
                } else {
                    throw new Errors.InvalidDataError('Estimate already drafted')
                }
            } else {
                throw new Errors.NotFoundError('estimate not found')
            }
        } else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}



exports.duplicateEstimate = async (id) => {
    try {
        if (id) {
            let estimate = await Estimate.findById(id)
            let estimate_line = await Estimate_line.getEstimatelineByEstimate(id)
            if (estimate && estimate_line) {
                estimate.id = undefined
                estimate.number = undefined
                estimate.date = undefined
                estimate.num_interne = undefined
                estimate.signature_date = undefined
                for (let i = 0; i < estimate_line.length; i++) {
                    estimate_line[i].id = undefined
                }

                let duplicate = {
                    header: estimate,
                    lines: estimate_line
                }

                let new_estimate = await this.createEstimate(duplicate)
                Logger.info("duplicate estimate", new_estimate)

                return new_estimate
            }
            throw new Errors.NotFoundError('estimate not found')
        }
        throw new Errors.InvalidDataError('missing data')
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}


exports.convertEstimateToInvoice = async (id) => {
    try {
        if (id) {
            let estimate = await Estimate.findById(id)
            let estimate_line = await Estimate_line.getEstimatelineByEstimate(id)
            if (estimate && estimate_line) {
                estimate.id = undefined
                estimate.number = undefined
                estimate.date = undefined
                estimate.num_interne = undefined
                estimate.signature_date = undefined
                let client
                if (typeof estimate.client == 'string') {
                    client = JSON.parse(estimate.client)
                } else {
                    client = estimate.client
                }

                if (client.timbre == 1) {
                    let company
                    if (typeof estimate.company == 'string') {
                        company = JSON.parse(estimate.company)
                    } else {
                        company = estimate.company
                    }
                    if (company.timbre) {
                        estimate.timbre = parseFloat(company.timbre)
                    }
                }

                delete estimate.validation_date
                for (let i = 0; i < estimate_line.length; i++) {
                    estimate_line[i].id = undefined
                    delete estimate_line[i].estimate_id
                }

                estimate.company = undefined
                estimate.client = undefined

                let duplicate = {
                    header: estimate,
                    lines: estimate_line
                }

                let invoice = await this.createInvoice(duplicate)
                if (invoice) {
                    Logger.info("convert estimate into an invoice", invoice)
                    io.to(getCompanyId()).emit('invoices-updated', 'invoices-updated')
                    return invoice
                } else {
                    throw new Errors.InvalidDataError('problem during invoice creation')
                }
            } else {
                throw new Errors.InvalidDataError('missing data')
            }
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}


//-----------------  client services ----------------


exports.createClient = async (data) => {
    try {
        if (data) {
            let client = await Client.create(data);
            Logger.info("create client", client)
            io.to(getCompanyId()).emit('clients-updated', 'clients-updated')
            return client
        } else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

exports.getClient = async (id) => {
    try {
        if (id) {
            let client = await Client.findById(id)
            if (client) {
                Logger.info("get client", client)
                return client
            } else {
                throw new Errors.NotFoundError('client not found')
            }
        } else {
            throw new Errors.InvalidDataError('missing data')
        }

    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

exports.getAllClient = async (search) => {
    try {
        if (search) {
            let client = await Client.searchClient(search)
            if (client) {
                Logger.info("search client", client)
                return client
            } else {
                throw new Errors.NotFoundError('client not found')
            }
        }
        else {
            let clients = await Client.findAll()
            if (clients) {
                Logger.info("get all client", clients)
                return clients
            }
            else {
                throw new Errors.NotFoundError('client not found')
            }
        }

    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }

}


exports.verifyTaxId = async (tax_identification, id) => {
    try {
        if (tax_identification && tax_identification.length == 7 ) {
            let verification = await Client.find(tax_identification)
            if (verification.length > 0) {
                if (!id) {
                    return false
                }
                else {
                    if (verification[0].id == id)
                        return true;
                    else
                        return false
                }
            } else {
                return true
            }
        } else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

exports.updateClient = async (id, update) => {
    try {
        if (id && update) {
            let client = await Client.update(id, update)
            if (client) {
                Logger.info("update client", client)
                io.to(getCompanyId()).emit('clients-updated', 'clients-updated')
                return client
            } else {
                throw new Errors.InvalidDataError('missing data')
            }
        } else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

exports.deleteClient = async (id) => {
    try {
        if (id) {
            let client = await Client.findById(id)
            if (client) {
                Logger.info("delete client", client)
                io.to(getCompanyId()).emit('clients-updated', 'clients-updated')
                return await Client.destroy(id)
            } else {
                throw new Errors.NotFoundError('no client to delete')
            }
        }
        else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.ForbiddenError('Forbidden action')
    }
}


//-----------------  article services ----------------


exports.createArticle = async (data) => {
    try {
        if (data) {
            if (data.code && data.price) {
                let code = await Article.find({ code: data.code })
                if (code.length > 0) {
                    throw new Errors.InvalidDataError('Code already attributed to an article')
                } else {
                    let article = await Article.create(data);
                    let vat = await Vat.findById(article.vat)
                    article = { ...article, tva: vat }

                    Logger.info('create article', article)
                    io.to(getCompanyId()).emit('articles-updated', 'articles-updated')
                    return article
                }
            } else {
                throw new Errors.InvalidDataError('missing data')
            }
        } else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}


exports.getArticle = async (id) => {
    try {
        if (id) {
            let article = await Article.findById(id)
            let vat = await Vat.findById(article.vat)
            article.vat = vat;
            if (article) {
                Logger.info("get article", article)
                return article
            } else {
                throw new Errors.NotFoundError('article not found')
            }
        } else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

exports.getAllArticle = async (search, status) => {
    try {
        if (search || status) {
            let articles = await Article.searchArticle(search, status)
            if (articles) {
                for (var i = 0; i < articles.length; i++) {
                    let vat = await Vat.findById(articles[i].vat)
                    articles[i].vat = vat;
                }

                Logger.info("search articles", articles)
                return articles
            } else {
                throw new Errors.NotFoundError('article not found')
            }
        }
        else {
            let articles = await Article.findAll()
            if (articles) {
                for (var i = 0; i < articles.length; i++) {
                    let vat = await Vat.findById(articles[i].vat)
                    articles[i].vat = vat;
                }
                Logger.info("get all articles", articles)
                return articles
            }
            else {
                throw new Errors.NotFoundError('article not found')
            }
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

exports.updateArticle = async (id, update) => {
    try {
        if (id && update) {
            let code = await Article.find({ code: update.code })
            if (code.length > 0 && code[0].id != id) {
                throw new Errors.InvalidDataError('Code already attributed to an Article')
            } else {
                let article = await Article.update(id, update)
                if (article) {
                    let vat = await Vat.findById(article.vat)
                    article = { ...article, tva: vat }
                    Logger.info("update article", article)
                    io.to(getCompanyId()).emit('articles-updated', 'articles-updated')
                    return article
                } else {
                    throw new Errors.InvalidDataError('missing data')
                }
            }
        } else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}


exports.deleteArticle = async (id) => {
    try {
        if (id) {
            let article = await Article.findById(id)
            if (article) {
                Logger.info("delete article", article)
                io.to(getCompanyId()).emit('articles-updated', 'articles-updated')
                return await Article.destroy(id)
            } else {
                throw new Errors.NotFoundError('article not found')
            }
        }
        else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.ForbiddenError('Forbidden action')
    }
}

exports.activateArticle = async (id) => {
    try {
        if (id) {
            let article = await Article.findById(id)
            if (article) {
                if (article.status != 1) {
                    await Article.update(id, { status: 1 })
                } else {
                    throw new Errors.InvalidDataError('article already activated')
                }
            } else {
                throw new Errors.NotFoundError('article not found')
            }
        } else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}


exports.deactivateArticle = async (id) => {
    try {
        if (id) {
            let article = await Article.findById(id)
            if (article) {
                if (article.status != 0) {
                    await Article.update(id, { status: 0 })
                } else {
                    throw new Errors.InvalidDataError('article already deactivated')
                }
            } else {
                throw new Errors.NotFoundError('article not found')
            }
        } else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}


exports.suspendArticle = async (id) => {
    try {
        if (id) {
            let article = await Article.findById(id)
            if (article) {
                if (article.status != 2) {
                    await Article.update(id, { status: 2 })
                } else {
                    throw new Errors.InvalidDataError('article already suspended')
                }
            } else {
                throw new Errors.NotFoundError('article not found')
            }
        } else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}


exports.verifyCode = async (code, id) => {
    try {
        if (code) {
            let verification = await Article.find(code)
            if (verification.length > 0) {
                if (!id) {
                    return false
                }
                else {
                    if (verification[0].id == id)
                        return true;
                    else
                        return false
                }
            } else {
                return true
            }
        } else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

//-----------------VAT

exports.createVat = async (data) => {
    try {
        if (data) {
            data.company_id = getCompanyId()
            let vat = await Vat.create(data)
            // io.to(getCompanyId()).emit('vats-updated','vats-updated')
            return vat
        } else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

exports.getVat = async () => {
    try {
        let vat = await Vat.findAll()
        if (vat) {
            Logger.info("get all Vat", vat)
            return vat
        } else {
            throw new Errors.NotFoundError('Vat not found')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

exports.updateVat = async (id, update) => {
    try {
        if (id && update) {
            let vat = await Vat.update(id, update)
            if (vat) {
                Logger.info("update vat", vat)
                // io.to(getCompanyId()).emit('vats-updated','vats-updated')
                return vat
            } else {
                throw new Errors.InvalidDataError('missing data')
            }
        } else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

exports.deleteVat = async (id) => {
    try {
        if (id) {
            let vat = await Vat.findById(id)
            if (vat) {
                // io.to(getCompanyId()).emit('vats-updated','vats-updated')
                return await Vat.destroy(id)
            } else {
                throw new Errors.NotFoundError('no vat to delete')
            }
        }
        else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.ForbiddenError('Forbidden action')
    }
}

//-----------------Company
exports.getCompany = async (id) => {
    try {
        if (id) {
            let company = await Company.findById(id)
            if (company) {
                return company
            } else {
                throw new Errors.NotFoundError('Company not found')
            }
        } else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}


exports.editCompany = async (id, update, filename) => {
    try {
        if (id && update) {
            if (update.config) {
                update.config = JSON.stringify(update.config)
            }
            if (update.logo) {
                let attachment = await Attachment.create({ attachment: update.logo, filename: filename, company_id: id })
                update.logo = attachment.id
            }


            let company = await Company.update(id, update)
            if (company) {
                Logger.info("update company", company)
                return company
            } else {
                throw new Errors.InvalidDataError('missing data')
            }
        } else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

//-----------------Total----------------------------------------------------

exports.totalByClient = async (start_date, end_date, search) => {
    try {
        let total = await Invoice.invoiceTotalByClient(start_date, end_date, search)
        if (total) {
            return total
        } else {
            return []
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

exports.totalByArticle = async (start_date, end_date, search) => {
    try {
        let total = await Invoice_line.invoicelineTotalByArticle(start_date, end_date, search)
        if (total) {
            return total
        } else {
            return []
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}


//-----------------contact-------------------------------


exports.postContact = async (data, file, filename) => {
    try {
        if (data.message && data.title) {
            data.user_id = getUserId()
            data.company_id = getCompanyId()
            let attachment
            if (file && filename) {
                attachment = await Attachment.create({ attachment: file, filename: filename, company_id: getCompanyId() })
                data.attachment = attachment.id
            }
            let contact = await Contact.create(data)
            if (contact) {
                Logger.info("Contact admin", contact)
                return contact
            } else {
                throw new Errors.InvalidDataError('error during contact creation')
            }
        } else {
            throw new Errors.InvalidDataError('missing data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}
//-----------------Share url------------------------------------------------

exports.createCompanyBucket = async () => {
    try {
        let company_id = getCompanyId()
        let bucket_name = `bucket${company_id}`

        let exist = await minioClient.bucketExists(bucket_name)
        if (!exist) {
            await minioClient.makeBucket(bucket_name)
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

exports.postInvoiceFile = async (file, filename, id) => {
    try {
        if (file && filename && id) {
            let invoice = await Invoice.findById(id)
            let name = invoice.number.replace(/-|_|:|,|;|=|#|'|"/g, ".").replace("/", ".").replace(String.fromCharCode(92), ".").replace(String.fromCharCode(42), ".").replace(String.fromCharCode(36), ".").replace(String.fromCharCode(179), ".")
            let company_id = getCompanyId()
            let bucket_name = `bucket${company_id}`
            if (minioClient) {
                await minioClient.fPutObject(bucket_name, filename, file, { 'Content-disposition': 'attachment; filename=' + `${name}` + '.pdf' })
            } else {
                throw new Errors.InvalidDataError('Invalid data')
            }
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}


exports.postEstimateFile = async (file, filename, id) => {
    try {
        if (file && filename && id) {
            let estimate = await Estimate.findById(id)
            let name = estimate.number.replace(/-|_|:|,|;|=|#|'|"/g, ".").replace("/", ".").replace(String.fromCharCode(92), ".").replace(String.fromCharCode(42), ".").replace(String.fromCharCode(36), ".").replace(String.fromCharCode(179), ".")
            let company_id = getCompanyId()
            let bucket_name = `bucket${company_id}`
            if (minioClient) {
                await minioClient.fPutObject(bucket_name, filename, file, { 'Content-disposition': 'attachment; filename=' + `${name}` + '.pdf' })
            } else {
                throw new Errors.InvalidDataError('Invalid data')
            }
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}


exports.getUrl = async (filename) => {
    try {
        let company_id = getCompanyId()
        let bucket_name = `bucket${company_id}`
        if (minioClient) {
            let url = await minioClient.presignedGetObject(bucket_name, filename, 1000)

            let url_id = await tools.randomAlphabetic(64)

            await redis_client.set(url_id, url, 'EX', 15);

            return {
                url_id: url_id,
                url: url
            }
        } else {
            throw new Errors.InvalidDataError('Invalid data')
        }
    } catch (error) {
        Logger.error(error)
        throw new Errors.InvalidDataError('Invalid data')
    }
}

exports.sendMail = async (data) => {
    try {
        if (data.email && data.id) {
            let url = await redis_client.get(data.id)

            let user = await User.findById(getUserId())

            let user_email = user.login

            let content = mailtemplate

            content = content.replace("%URL%", url)
            content = content.replace("%SENDER%", user_email)
            let mailOptions

            for (let i = 0; i < data.email.length; i++) {
                mailOptions = {
                    from: configuration.mailing.sender || 'Factarni',
                    to: data.email[i],
                    subject: `${user_email} shared an element with you`,
                    html: content
                }
                await createAndSendEmail(mailOptions)
            }
        } else {
            throw new Errors.InvalidDataError('Invalid data')
        }
    } catch (error) {
        Logger.error(error)
        throw error
    }
}

