const got = require("got");

try {
    const response = await got.post("https://api.flutterwave.com/v3/payments", {
        headers: {
            Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`
        },
        json: {
            tx_ref: "hooli-tx-1920bbtytty",
            amount: "100",
            currency: "NGN",
            redirect_url: "https://webhook.site/9d0b00ba-9a69-44fa-a43d-a82c33c36fdc",
            meta: {
                consumer_id: 23,
                consumer_mac: "92a3-912ba-1192a"
            },
            customer: {
                email: "user@gmail.com",
                phonenumber: "080****4528",
                name: "Yemi Desola"
            },
            customizations: {
                title: "Pied Piper Payments",
                logo: "http://www.piedpiper.com/app/themes/joystick-v27/images/logo.png"
            }
        }
    }).json();
} catch (err) {
    console.log(err.code);
    console.log(err.response.body);
}
