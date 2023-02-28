const UserService = require('../services/user')
const Logger = require("winston");
const jwtUtils = require('../helpers/jwt')
const fs = require("fs");




exports.register = async (req, res) => {
    try {
        // Logger.debug(req.body, req.file)
        let file
        let filename
        if (req.file) {
            req.file.originalname = req.file.originalname.split('.')[0] + '.PNG'
            file = fs.readFileSync(req.file.path)
            filename = req.file.originalname
        }
        let data = {
            user: {
                name: req.body.username,
                login: req.body.login,
                uid: req.body.uid,
                role: req.body.role
            },
            company: {
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
                invoice_template_id: req.body.invoice_template_id ?? undefined,
                estimate_template_id: req.body.estimate_template_id ?? undefined
            }
        }
        if (!data.user.login || !data.user.name || !data.user.uid) {
            res.status(420).send("missing credentials");
        } else {
            let user = await UserService.register(data, filename ?? undefined)
            if (req.headers.social == true && req.headers.authorization) {
                let token = await jwtUtils.generateTokenForUser(req.headers.authorization)
                user.token = token
            }
            res.status(200).send(user)
        }
    } catch (err) {
        console.error(err);
        Logger.error("Error" + err)
        res.status(420).send({ error: err.message, code: err.code });
    }
}

exports.login = async (req, res, next) => {
    try {
        if (req.headers.authorization) {
            let token = await jwtUtils.generateTokenForUser(req.headers.authorization)
            let user_auth = await UserService.login()
            if (user_auth) {
                user_auth.user.token = token
                res.status(200).send(user_auth)
            } else {
                res.status(401)
            }
        } else if (req.body.password && req.body.username) {
            let username = req.body.username
            let password = req.body.password
            let token

            let user = await UserService.adminLogin(username, password)

            if (user) {
                token = await jwtUtils.generateTokenForAdmin(username)
                user.token = token
            }

            res.status(200).send(user)
        } else {
            res.status(401).send("no token provided");
        }
    } catch (err) {
        console.error(err);
        Logger.error("Error" + err)
        res.status(420).send({ error: err.message, code: err.code });
    }
}

exports.profile = async (req, res) => {
    try {
        let user = await UserService.profile()
        res.status(200).send(user)
    } catch (err) {
        console.error(err);
        Logger.error("Error" + err)
        res.status(420).send({ error: err.message, code: err.code });
    }
}


exports.editProfile = async (req, res) => {
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
            name: req.body.name ?? undefined,
            signature: file ?? undefined
        }
        let company = await UserService.editProfile(data, filename ?? undefined)
        res.status(200).json(company)
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

exports.deleteUser = async (req, res) => {
    try {
        let remove = await UserService.deleteUser()
        res.status(200).json({ message: "user deleted succesfully" })
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}

exports.logout = async (req, res) => {
    try {
        let logout = await UserService.logout()
        res.status(200).json({ message: "User logged out" })
    } catch (error) {
        Logger.error(error)
        res.status(420).send(error);
    }
}