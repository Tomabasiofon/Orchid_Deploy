const Contact = require('../models/contact.model');
const { sendEmail } = require('../utils');


const sendContactDetails = async (req,res,next) => {
    const {fullname, email, phonenumber, subject } = req.body;
    let message = req.body.message;

    try {
        const sent = await sendEmail(fullname, email, subject, phonenumber, message);

        message = [ message ];

        if (sent) {
            const contact = await Contact.findOne({ email: email })
            if(contact) {
                await Contact.updateOne({ email }, { $push: { message: message }}, {new: true})
                await contact.save();
                res.status(200).json({ sent, contact })
            } else{
                const newContact = new Contact(req.body);
                const savedContact = await newContact.save();
                res.status(201).json({ sent , contact: savedContact});
            }
        } else {
            res.status(200).json({ sent })
        }
    } catch (error) {
        next(error);
    }
}

const getContacts = async (req,res,next) => {
    try {
        const allcontacts = await Contact.find().sort({ updatedAt: -1 });
        res.status(200).json(allcontacts);
    } catch (error) {
        next(error);
    }
}

module.exports = { sendContactDetails, getContacts }
