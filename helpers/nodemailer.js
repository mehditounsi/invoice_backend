const nodemailer = require("nodemailer");
const Logger = require("winston");
const configuration = require("../config/config")
const Errors = require('../helpers/errors');



const createAndSendEmail = async (mailOptions) => {
    try {
        if (mailOptions) {
            let response = undefined;

            let transporter = nodemailer.createTransport({
                host: configuration.mailing.host,
                port: configuration.mailing.port,
                from: configuration.mailing.from,
                secure: true,
                auth: {
                    user: configuration.mailing.user,
                    pass: configuration.mailing.password
                },
                tls: {
                    rejectUnauthorized: false
                }
            })
            if (transporter) {

                response = await transporter.sendMail(mailOptions);

                return response;

            } else {
                throw new Errors.InvalidDataError('No transporter')
            }
        } else {
            throw new Errors.InvalidDataError('Invalid data')
        }
    } catch (error) {
        console.log(error);
        throw error
    }
};

module.exports = createAndSendEmail;