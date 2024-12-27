const express = require('express');
const connection = require('../connection');
const router = express.Router();
let ejs = require('ejs');
let pdf = require('html-pdf');
let path = require('path');
var uuid = require('uuid');
var auth = require('../services/authentication');
const fs = require('fs');
const { json } = require('stream/consumers');

router.post('/generateReport', auth.authenticationToken, (req, res) => {
    const generateUuid = uuid.v1();
    const orderDetails = req.body;

    try {
        var productDetailsReport = JSON.parse(orderDetails.productDetails); // Ensure proper parsing
    } catch (err) {
        return res.status(400).json({ message: "Invalid productDetails format", error: err.message });
    }

    const query = "insert into bill (name, uuid, email, contactNumber, paymentMethod, total, productDetails, createdBy) values (?, ?, ?, ?, ?, ?, ?, ?)";
    connection.query(query, [
        orderDetails.name,
        generateUuid,
        orderDetails.email,
        orderDetails.contactNumber,
        orderDetails.paymentMethod,
        orderDetails.total,
        orderDetails.productDetails,
        res.locals.email
    ], (err, results) => {
        if (!err) {
            ejs.renderFile(path.join(__dirname, "report.ejs"), {
                productDetails: productDetailsReport,
                name: orderDetails.name,
                email: orderDetails.email,
                contactNumber: orderDetails.contactNumber,
                paymentMethod: orderDetails.paymentMethod,
                totalAmount: orderDetails.total
            }, (err, data) => {
                if (err) {
                    return res.status(500).json(err);
                } else {
                    pdf.create(data).toFile('./generated_pdf/' + generateUuid + ".pdf", function (err, data) {
                        if (err) {
                            console.log(err);
                            return res.status(500).json(err);
                        } else {
                            return res.status(200).json({ uuid: generateUuid });
                        }
                    });
                }
            });
        } else {
            return res.status(500).json(err);
        }
    });
});

router.post('/getPdf', auth.authenticationToken, function (req, res) {
    const orderDetails = req.body;
    const pdfPath = './generated_pdf/' + orderDetails.uuid + '.pdf';

    // Check if the PDF file exists
    if (fs.existsSync(pdfPath)) {
        res.contentType("application/pdf");
        fs.createReadStream(pdfPath).pipe(res);
    } else {
        try {
            var productDetailsReport = JSON.parse(orderDetails.productDetails); // Fixed JSON.parse
        } catch (err) {
            return res.status(400).json({ message: "Invalid productDetails format", error: err.message });
        }

        ejs.renderFile(path.join(__dirname, "report.ejs"), {
            productDetails: productDetailsReport,
            name: orderDetails.name,
            email: orderDetails.email,
            contactNumber: orderDetails.contactNumber,
            paymentMethod: orderDetails.paymentMethod,
            totalAmount: orderDetails.total
        }, (err, data) => {
            if (err) {
                return res.status(500).json(err);
            } else {
                pdf.create(data).toFile(pdfPath, function (err) {
                    if (err) {
                        console.log(err);
                        return res.status(500).json(err);
                    } else {
                        res.contentType("application/pdf");
                        fs.createReadStream(pdfPath).pipe(res);
                    }
                });
            }
        });
    }
});

router.get('/getBills', auth.authenticationToken, (req, res, next) => {
    var query = "select*from bill order by id Desc";
    connection.query(query, (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    })
})


router.delete('/delete/:id', auth.authenticationToken, (req, res, next) => {
    const id = req.params.id;
    var query = "delete from bill where id =?";
    connection.query(query, [id], (err, results) => {
        if (!err) {
            if (results.affectedRows == 0) {
                return res.status(404).json({ message: "Bill id does not found" })
            }
            return res.status(200).json({ message: "Bill deleted" })

        } else {
            return res.status(500).json(err)
        }
    })

})

module.exports = router;
