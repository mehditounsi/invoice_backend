const request = require('supertest')
let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEzLCJyb2xlIjoidXNlciIsImZpcmViYXNlVG9rZW4iOiJleUpoYkdjaU9pSlNVekkxTmlJc0ltdHBaQ0k2SW1ZNE1EbGpabVl4TVRabE5XSmhOelF3TnpRMVltWmxaR0UxT0dVeE5tVTRNbVl6Wm1RNE1EVWlMQ0owZVhBaU9pSktWMVFpZlEuZXlKdVlXMWxJam9pVFdWb1pHa2dWRzkxYm5OcElpd2ljR2xqZEhWeVpTSTZJbWgwZEhCek9pOHZiR2d6TG1kdmIyZHNaWFZ6WlhKamIyNTBaVzUwTG1OdmJTOWhMMEZNYlRWM2RUQjBOa1pXT1U5WU1USkVlVkpmTFhsRGJYSmlSMEpYWWpsV1YxRm1VRVZrU1dKNFdIaGhZVUU5Y3prMkxXTWlMQ0pwYzNNaU9pSm9kSFJ3Y3pvdkwzTmxZM1Z5WlhSdmEyVnVMbWR2YjJkc1pTNWpiMjB2Wm1GamRHRnlibWtpTENKaGRXUWlPaUptWVdOMFlYSnVhU0lzSW1GMWRHaGZkR2x0WlNJNk1UWTJPRGMyTmprME9Td2lkWE5sY2w5cFpDSTZJazQxV2xaSE5URk1kWGxNVmsxcWNrSkNabXBCTVZSeWJWTm9RVE1pTENKemRXSWlPaUpPTlZwV1J6VXhUSFY1VEZaTmFuSkNRbVpxUVRGVWNtMVRhRUV6SWl3aWFXRjBJam94TmpZNE56WTJPVFE1TENKbGVIQWlPakUyTmpnM056QTFORGtzSW1WdFlXbHNJam9pYldWb1pHbDBiM1Z1YzJreE9UazNRR2R0WVdsc0xtTnZiU0lzSW1WdFlXbHNYM1psY21sbWFXVmtJanAwY25WbExDSm1hWEpsWW1GelpTSTZleUpwWkdWdWRHbDBhV1Z6SWpwN0ltZHZiMmRzWlM1amIyMGlPbHNpTVRBMk1EZ3lPRFk0TWpNd056a3hNelU1T0RnNUlsMHNJbVZ0WVdsc0lqcGJJbTFsYUdScGRHOTFibk5wTVRrNU4wQm5iV0ZwYkM1amIyMGlYWDBzSW5OcFoyNWZhVzVmY0hKdmRtbGtaWElpT2lKbmIyOW5iR1V1WTI5dEluMTkuTDlfOVdHRmRXYmZ1M2dESS03c2FwZE5TUXNJNHQ1V25iaFJUZEFHZ0tzSGFnRlJHSEtjbWlDa1BmT1Q2OHJmdllWX1FsalZIS1pCQ2k0V1ZlV3hsd2htWGlfUmN2LW5pV09kSWhTQkRNWi1IXzQ0eWs0RmNGVnRJb3dkVE44cnZMdnVLaXdoeXc0Y0l0dDVmblJWaEZxdERIaXV3ektWZEdBVTQycUh6bWZ5VEZWV1hhbVZ2bHZIZk9WaGM0ckNyRUM5YlNMV1JsSk5HZmY4V1RYSVZFcmEwMk5sWFdVREpDWWVBbVZiNGdHdFJXX1Q4WUNmaWFNY19MWGZQU3pnU0p6ZXlEdjVMc2FIdnE1aV9VVlFsTzV6NXdTUTJMNWxLMHhSaUh0bWFWU0Y2V2R2aE9LMHp3dEVlRGJGWDV4ODhyaVFoYTFua25uQldwTDlaUFZqNUlBIiwidXNlclVJRCI6Ik41WlZHNTFMdXlMVk1qckJCZmpBMVRybVNoQTMiLCJjb21wYW55SWQiOjE5LCJsb2dpbiI6Im1laGRpdG91bnNpMTk5N0BnbWFpbC5jb20iLCJpYXQiOjE2Njg3NjY5NTEsImV4cCI6MTY3MzA4Njk1MX0.9bEq_SVuBDw6YGaB6ho4skWZz5x1Mew0cMn3ZUbSAGI"
let app = require('../index')


//-------------------invoice--------------

describe("GET invoices", () => {
    it("should get all invoices", async () => {
        const res = await request(app).get("/invoice")
            .set('Authorization', `Bearer ${token}`);;
        expect(res.statusCode).toBe(200);
    })
})

describe("POST an invoice excel file", () => {
    it("should export an invoice to an excel file", async () => {
        const res = await request(app).post("/invoice/export")
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})

let invoice_id = 0
let invoice_line_id = 0

describe("POST an invoice", () => {
    it("should create an invoice", async () => {
        const res = await request(app).post("/invoice/create")
            .field('header', `{"client_id": "1032", "timbre": 0}`)
            .field('lines', `[{ "code": "123" }]`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
        invoice_id = res.body.header.id
        invoice_line_id = res.body.lines.id
    })
})

describe("GET invoice share url", () => {
    it("should print an invoice", async () => {
        const res = await request(app).get(`/invoice/${invoice_id}/share`)
        .query({ language: 'EN' })
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})

describe("GET monthly invoices", () => {
    it("should get all invoices of the months", async () => {
        const res = await request(app).get("/invoice/monthly")
            .query({ year: "2022" })
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200);
    })
});

describe("GET invoices years", () => {
    it("should get all invoices of the months", async () => {
        const res = await request(app).get("/invoice/year")
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200);
    })
});

describe("GET specific invoice", () => {
    it("should get a specific invoice", async () => {
        const res = await request(app).get(`/invoice/${invoice_id}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200);
    })
})

describe("GET specific invoice line", () => {
    it("should get a specific invoice line", async () => {
        const res = await request(app).get(`/invoiceline/${invoice_line_id}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200);
    });
});

describe("GET a hydrated invoice", () => {
    it("should get a hydrated invoice", async () => {
        const res = await request(app).get(`/hydratedinvoice/${invoice_id}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})


describe("PUT an invoice", () => {
    it("should edit an invoice", async () => {
        const res = await request(app).put(`/invoice/${invoice_id}`)
            .send({
                number: "IN-0001",
            })
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})

describe("PUT an invoice line", () => {
    it("should edit an invoice line", async () => {
        const res = await request(app).put(`/invoiceline/${invoice_line_id}`)
            .send({
                quantity: 5
            })
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})


describe("PUT an hydrated invoice", () => {
    it("should edit a hydrated invoice", async () => {
        const res = await request(app).put(`/hydratedinvoice/${invoice_id}`)
            .field('header', `{"client_id": "1032", "timbre": 1}`)
            .field('lines', `[{ "code": "new code" }]`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})

describe("PUT an invoice status to validated", () => {
    it("should edit an invoice status to validated", async () => {
        const res = await request(app).put(`/invoice/${invoice_id}/validate`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})

describe("PUT an invoice status to drafted", () => {
    it("should edit an invoice status to drafted", async () => {
        const res = await request(app).put(`/invoice/${invoice_id}/draft`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})

describe("POST an invoice print", () => {
    it("should print an invoice", async () => {
        const res = await request(app).post(`/invoice/${invoice_id}/print`)
            .query({ language: 'EN' })
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})

describe("DELETE an invoice", () => {
    it("should delete an invoice", async () => {
        const res = await request(app).delete(`/invoice/${invoice_id}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})




//---------------------- estimate -----------

describe("GET estimates", () => {
    it("should get all estimates", async () => {
        const res = await request(app).get("/estimate")
            .set('Authorization', `Bearer ${token}`);;
        expect(res.statusCode).toBe(200);
    });
});

let estimate_id = 0
let estimate_line_id = 0

describe("POST an estimate", () => {
    it("should create an estimate", async () => {
        const res = await request(app).post("/estimate/create")
            .field('header', `{"client_id": "1032", "timbre": 0}`)
            .field('lines', `[{ "code": "123" }]`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
        estimate_id = res.body.header.id
        estimate_line_id = res.body.lines.id
    })
})

let url_id = ""

describe("GET estimate share url", () => {
    it("should share an estimate", async () => {
        const res = await request(app).get(`/estimate/${estimate_id}/share`)
        .query({language : "EN"})
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
        url_id = res.body.url_id
    })
})

describe("GET an email with the share url", () => {
    it("should send an email with the share url", async () => {
        const res = await request(app).post(`/sendmail`)
        .send({
            id : url_id,
            email : ["mehditest1997@gmail.com"]
        })
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})


describe("GET hydrated estimate", () => {
    it("should get hydrated estimate", async () => {
        const res = await request(app).get(`/hydratedestimate/${estimate_id}`)
            .set('Authorization', `Bearer ${token}`);;
        expect(res.statusCode).toBe(200);
    });
});

describe("GET estimate line", () => {
    it("should get all estimates", async () => {
        const res = await request(app).get(`/estimateline/${estimate_line_id}`)
            .set('Authorization', `Bearer ${token}`);;
        expect(res.statusCode).toBe(200);
    });
});

describe("GET specific estimate", () => {
    it("should get a specific estimate", async () => {
        const res = await request(app).get(`/estimate/${estimate_id}`)
            .set('Authorization', `Bearer ${token}`);;
        expect(res.statusCode).toBe(200);
    });
});

describe("PUT an estimate", () => {
    it("should edit an estimate", async () => {
        const res = await request(app).put(`/estimate/${estimate_id}`)
            .send({
                timbre: 0
            })
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})

describe("PUT an estimate line", () => {
    it("should edit an estimate line", async () => {
        const res = await request(app).put(`/estimateline/${estimate_line_id}`)
            .send({
                quantity: 5
            })
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})

describe("PUT an hydrated estimate", () => {
    it("should edit a hydrated estimate", async () => {
        const res = await request(app).put(`/hydratedestimate/${estimate_id}`)
            .field('header', `{"client_id": "1032", "timbre": 1}`)
            .field('lines', `[{ "code": "new code" }]`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})


describe("PUT an estimate status to validated", () => {
    it("should edit an estimate status to validated", async () => {
        const res = await request(app).put(`/estimate/${estimate_id}/validate`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})

describe("PUT an estimate status to drafted", () => {
    it("should edit an estimate status to drafted", async () => {
        const res = await request(app).put(`/estimate/${estimate_id}/draft`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})

describe("POST an estimate print", () => {
    it("should print an estimate", async () => {
        const res = await request(app).post(`/estimate/${estimate_id}/print`)
            .query({ language: 'EN' })
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})

describe("DELETE an estimate", () => {
    it("should delete an estimate", async () => {
        const res = await request(app).delete(`/estimate/${estimate_id}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})


// //-------------------client----------------

describe("GET client total", () => {
    it("should get list of clients and the total paid", async () => {
        const res = await request(app).get("/client/total")
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})


describe("GET all clients", () => {
    it("should get a list of clients", async () => {
        const res = await request(app).get("/client")
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})


describe("GET a specific client", () => {
    it("should get a specific client", async () => {
        const res = await request(app).get("/client/1032")
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})

let client_id = 0

describe("POST a client", () => {
    it("should post a client", async () => {
        const res = await request(app).post("/client/create")
            .send({ name: "client", timbre: 1, vat: 1 })
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
        client_id = res.body.id
    })
})

describe("PUT a client", () => {
    it("should edit a client", async () => {
        const res = await request(app).put(`/client/${client_id}`)
            .send({ name: "new client", timbre: 0, vat: 0 })
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})

describe("DELETE a client", () => {
    it("should delete a client", async () => {
        const res = await request(app).delete(`/client/${client_id}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})

// //-------------------article----------------

describe("GET article total", () => {
    it("should get list of bought articles and the total revenue per article", async () => {
        const res = await request(app).get("/article/total")
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})

describe("GET all articles", () => {
    it("should get all articles", async () => {
        const res = await request(app).get("/article")
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})

describe("GET a specific article", () => {
    it("should get a specific article", async () => {
        const res = await request(app).get("/article/45")
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})

describe("GET verify article code", () => {
    it("should get a specific article", async () => {
        const res = await request(app).get("/article/verifycode")
            .query({ code: "2", id: 45 })
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})

let article_id = 0

describe("POST an article", () => {
    it("should post an article", async () => {
        const res = await request(app).post("/article/create")
            .send({ code: 1, article: "article", price: 20, vat: 18 })
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
        article_id = res.body.id
    })
})

describe("PUT an article", () => {
    it("should edit an article", async () => {
        const res = await request(app).put(`/article/${article_id}`)
            .send({ code: 1, article: "new article" })
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})

describe("PUT an article status to activate", () => {
    it("should edit an article status to activated", async () => {
        const res = await request(app).put(`/article/${article_id}/activate`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})

describe("PUT an article status to deactivated", () => {
    it("should edit an article status to deactivated", async () => {
        const res = await request(app).put(`/article/${article_id}/deactivate`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})

describe("PUT an article status to suspended", () => {
    it("should edit an article status to suspended", async () => {
        const res = await request(app).put(`/article/${article_id}/suspend`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})

describe("DELETE an article", () => {
    it("should delete an article", async () => {
        const res = await request(app).delete(`/article/${article_id}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})
//------------vat------------

describe("GET all vats", () => {
    it("should get all vats", async () => {
        const res = await request(app).get("/vat")
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})

let vat_id = 0

describe("POST a vat", () => {
    it("should post a vat", async () => {
        const res = await request(app).post("/vat/create")
            .send({ vat: 20 })
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
        vat_id = res.body.id
    })
})

describe("PUT a vat", () => {
    it("should edit a vat", async () => {
        const res = await request(app).put(`/vat/${vat_id}`)
            .send({ vat: 50 })
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})

describe("DELETE a vat", () => {
    it("should delete a vat", async () => {
        const res = await request(app).delete(`/vat/${vat_id}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})

//------------templates-----------

describe("GET all templates", () => {
    it("should get all templates", async () => {
        const res = await request(app).get("/template")
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})

describe("GET a specific template", () => {
    it("should get a specific template", async () => {
        const res = await request(app).get("/template/1")
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})

let template_id = 0

describe("POST a template", () => {
    it("should post a template", async () => {
        const res = await request(app).post("/template/create")
            .send({ type: "invoice", language: "FR", isDefault: 1 })
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
        template_id = res.body.id
    })
})

describe("PUT a template", () => {
    it("should put a template", async () => {
        const res = await request(app).put(`/template/${template_id}`)
            .send({ type: "invoice", language: "EN", isDefault: 1 })
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})

describe("DELETE a template", () => {
    it("should delete a template", async () => {
        const res = await request(app).delete(`/template/${template_id}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})




//------------contact-----------

describe("GET contact", () => {
    it("should get contact", async () => {
        const res = await request(app).get("/contact")
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})

let contact_id = 0

describe("POST contact", () => {
    it("should post a contact", async () => {
        const res = await request(app).post("/contact/create")
            .send({ title: "this is a title", message: 'this is a message' })
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
        contact_id = res.body.id
    })
})

describe("PUT contact", () => {
    it("should edit a contact", async () => {
        const res = await request(app).put(`/contact/${contact_id}`)
            .send({ status: 0 })
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})



//------------user-----------

describe("GET profile", () => {
    it("should get a profile", async () => {
        const res = await request(app).get("/profile")
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})


describe("PUT profile", () => {
    it("should edit a contact", async () => {
        const res = await request(app).put("/profile")
            .send({ name: "random_username" })
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})

describe("PUT company", () => {
    it("should edit a company", async () => {
        const res = await request(app).put("/company/19")
            .send({ name: "random_company" })
            .set('Authorization', `Bearer ${token}`)
        expect(res.statusCode).toBe(200)
    })
})