const AdminService = require("../services/admin");
const Logger = require("winston");
const fs = require("fs");



exports.getAllCompany = async (req, res) => {
    try {
        let companies = await AdminService.getAllCompany()
        res.status(200).json(companies)
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}


exports.createCompany = async (req, res) => {
    try {
        Logger.debug(req.body, req.file)
        let data = {
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
            invoice_name: req.body.invoice_name ?? undefined,
            estimate_name: req.body.estimate_name ?? undefined,
            status: req.body.status ?? undefined,
            invoice_template_id: req.body.invoice_template_id ?? undefined,
            estimate_template_id: req.body.estimate_template_id ?? undefined,
            invoice_template_id_fr: req.body.invoice_template_id_fr ?? undefined,
            estimate_template_id_fr: req.body.estimate_template_id_fr ?? undefined,
            invoice_template_id_ar: req.body.invoice_template_id_ar ?? undefined,
            estimate_template_id_ar: req.body.estimate_template_id_ar ?? undefined,
            quantity_digits: req.body.quantity_digits ?? undefined,
        }
        let company = await AdminService.createCompany(data)
        res.status(200).json(company)
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}


exports.activateCompany = async (req, res) => {
    try {
        let id = req.params.id
        let activation = await AdminService.activateCompany(id)
        res.status(200).json(activation)
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

exports.deactivateCompany = async (req, res) => {
    try {
        let id = req.params.id
        let deactivation = await AdminService.deactivateCompany(id)
        res.status(200).json(deactivation)
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}



exports.suspendCompany = async (req, res) => {
    try {
        let id = req.params.id
        let suspension = await AdminService.suspendCompany(id)
        res.status(200).json(suspension)
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

exports.deleteCompany = async (req, res) => {
    try {
        let id = req.params.id
        let deletion = await AdminService.deleteCompany(id)
        res.status(200).json(deletion)
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}


exports.editCompany = async (req, res) => {
    try {
        Logger.debug(req.body)
        let id = req.params.id
        let data = {
            invoice_template_id: req.body.invoice_template_id ?? undefined,
            estimate_template_id: req.body.estimate_template_id ?? undefined,
            invoice_template_id_fr: req.body.invoice_template_id_fr ?? undefined,
            estimate_template_id_fr: req.body.estimate_template_id_fr ?? undefined,
            invoice_template_id_ar: req.body.invoice_template_id_ar ?? undefined,
            estimate_template_id_ar: req.body.estimate_template_id_ar ?? undefined,
        }
        let company = await AdminService.editCompany(id, data)
        res.status(200).json(company)
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}


//-----------------templates---------------------------

exports.createTemplate = async (req, res) => {
    try {
        let file
        if (req.file) {
            req.file.originalname = req.file.originalname.split('.')[0] + '.html'
            file = fs.readFileSync(req.file.path)
        }
        let template = await AdminService.createTemplate(req.body, file)
        res.status(200).json(template);
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

exports.getAllTemplates = async (req, res) => {
    try {
        let template = await AdminService.getAllTemplates()
        res.status(200).json(template);
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}


exports.getTemplate = async (req, res) => {
    try {
        Logger.debug(req.params)
        let id = req.params.id
        let template = await AdminService.getTemplate(id)
        res.status(200).json(template);
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}


exports.editTemplate = async (req, res) => {
    try {
        Logger.debug(req.params, req.body)
        let id = req.params.id
        let template = await AdminService.editTemplate(id, req.body)
        res.status(200).json(template);
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}


exports.deleteTemplate = async (req, res) => {
    try {
        Logger.debug(req.params)
        let id = req.params.id
        let template = await AdminService.deleteTemplate(id)
        res.status(200).json(template);
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}


// ------------- Contact------------------------


exports.getContact = async (req, res) => {
    try {
        let contact = await AdminService.getContact()
        res.status(200).json(contact);
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

exports.getOneContact = async (req, res) => {
    try {
        let id = req.params.id
        let contact = await AdminService.getOneContact(id)
        res.status(200).json(contact);
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

exports.contactStatus = async (req, res) => {
    try {
        let id = req.params.id
        await AdminService.contactStatus(id)
        res.status(200).json({ message: "Message status has been updated" });
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

// -----------------notifications ------------------------------

exports.createNotification = async (req, res) => {
    try {
        let notification = await AdminService.createNotification(req.body)
        res.status(200).json(notification)
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

exports.editNotification = async (req, res) => {
    try {
        let id = req.params.id
        let notification = await AdminService.editNotification(id, req.body)
        res.status(200).json(notification)
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

exports.activateNotification = async (req, res) => {
    try {
        let id = req.params.id
        activate = await AdminService.activateNotification(id)
        res.status(200).json(activate)
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

exports.deactivateNotification = async (req, res) => {
    try {
        let id = req.params.id
        let deactivate = await AdminService.deactivateNotification(id)
        res.status(200).json(deactivate)
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

exports.deleteNotification = async (req, res) => {
    try {
        let id = req.params.id
        await AdminService.deleteNotification(id)
        res.status(200).json({ message: "the notification has been deleted succesfully" })
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

exports.getAllNotifications = async (req, res) => {
    try {
        let notifications = await AdminService.getAllNotifications()
        res.status(200).json(notifications)
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}


// ----------------Users-------------


exports.getAdminProfile = async (req, res) => {
    try {
        let username = "root"
        let admin = await AdminService.getAdminProfile(username)
        res.status(200).json(admin)
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}


exports.getAllUsers = async (req, res) => {
    try {
        let users = await AdminService.getAllUsers()
        res.status(200).json(users)
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

exports.loginAsUser = async (req, res) => {
    try {
        let id = req.params.id
        let token = await AdminService.loginAsUser(id)
        res.status(200).json(token)
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}