var express = require('express'),
    url = 'mongodb://ohhcatfood:myNewCatFoodHere@15.207.37.189:53584/catfood';
    dbName = 'catfood',
    MongoClient = require('mongodb').MongoClient,
    objectId = require('mongodb').ObjectID,
    multer = require('multer'),
    upload = multer(),
    uniqid = require('randomatic'),
    app = express(),
    helmet = require('helmet'),
    version = 'v1',
    port = '3000';



app.use(helmet());


app.use(express.urlencoded({ extended: true }))
app.use(express.json())


var server = app.listen(port, () => {
    console.log("We Are Live On " + port)
})

MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
    if (err) throw err;
    const db = client.db(dbName);
    console.log("mongodb is connected with database =", dbName)



    app.post('/' + version + '/login', (req, res) => {
        sess = req.session;

        var data = req.body;
        var Mobile_no = data.Mobile_no;
        var password = data.password;

        if (Mobile_no && password) {
            db.collection('newuser').findOne({ Mobile_no: Mobile_no, password: password }, (err, result) => {

                if (err) {
                    console.log(err);
                }

                if (result) {

                    var datas = {
                        User_id: result._id,
                        name: result.name,
                        mobile: result.Mobile_no
                    }
                    res.send({ success: 1, data: datas });

                } else {
                    res.send({ data: 'mobile Number and password not metch', success: 0 });
                }

            })
        } else {
            res.send({ data: 'Please Enter mobile Number and Password', success: 0 });
        }
    })


















    app.post('/' + version + '/Forgot', (req, res) => {
        var data = req.body;

        if (!objectId.isValid(data.User_id)) {
            return res.send({ success: 0, data: 'UserId Not Valid' })
        }

        var query = {
            _id: objectId(data.User_id)
        }

        var updatedata = {
            Mobile_no: data.Mobile_no,
            _id: objectId(data.User_id),
            password: data.new_pass
        }

        db.collection('newuser').findOne(query, (err, findid) => {
            if (findid) {
                if (findid.Mobile_no == data.Mobile_no) {
                    db.collection('newuser').updateOne(query, { $set: updatedata }, (err, result) => {
                        res.send({ success: 1 })
                    })
                } else {
                    res.send({ success: 0, data: 'Mobile Number Not Available' })
                }
            } else {
                res.send({ success: 0, data: 'UserId Not Available' })
            }
        })
    })



















    app.post('/' + version + '/register', (req, res) => {
        var data = req.body;

        var register = {
            name: data.name,
            Mobile_no: data.Mobile_no,
            password: data.password,
            date: new Date()
        }

        db.collection('newuser').findOne({ Mobile_no: data.Mobile_no }, (err, result) => {
            if (result) {
              res.send({ success: 0, data: 'mobile already exist' })
            } else {
                db.collection('newuser').insertOne(register, (errs, response) => {
                    db.collection('newuser').findOne({ Mobile_no: data.Mobile_no }, (err, result2) => {

                        if (errs) {
                            return res.send({ success: 0, data: 'Database Error' });
                        }
                        res.send({ success: 1, User_id: result2._id, mobile: result2.Mobile_no, name: result2.name })

                    })

                })
            }
        })

    })









    app.get('/' + version + '/adid', (req, res) => {
        db.collection('adsid').find({}).toArray((err, result) => {
            res.send(result[0])
        })
    })

















    app.post('/' + version + '/user_request', (req, res) => {
        var data = req.body;

        if (!objectId.isValid(data.user_id)) {
            return res.send({ success: 0, data: 'UserId Not Valid' })
        }

        db.collection('newuser').findOne({ _id: objectId(data.user_id) }, (err, result) => {

            if (!result) {
                res.send({ success: 0, data: 'userid not found' })
            } else {

                var register = {
                    user_id: data.user_id,
                    Mobile_no: data.Mobile_no,
                    amount: data.amount,
                    cAcoins: data.current_available_coins,
                    paytm_Number: data.paytm_Number,
                    accept: 0,
                    date: new Date()
                }

                db.collection('mycoin').insertOne(register, (errs, result2) => {
                    if (errs) {
                        return res.send({ success: 0, data: 'Database Error' });
                    }
                    res.send({ success: 1, User_id: data.user_id })
                })
            }
        })
    })









})
