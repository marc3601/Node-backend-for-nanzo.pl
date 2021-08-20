const express = require('express')
const multer = require('multer')
const mongoose = require('mongoose');
const upload = multer({ dest: 'upload/' })
const fs = require("fs")
const util = require('util')
const unlinkFile = util.promisify(fs.unlink)
const app = express();
const { v4: uuidv4 } = require('uuid');
const port = 8080
const sharp = require('sharp');
const cors = require('cors');
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
require('dotenv').config()
const DIR = '/upload';
app.use(cors());
app.options('*', cors());
app.use(express.json())
// haslo admin123
process.on('uncaughtException', (error, origin) => {
    console.log('----- Uncaught exception -----')
    console.log(error)
    console.log('----- Exception origin -----')
    console.log(origin)
})

process.on('unhandledRejection', (reason, promise) => {
    console.log('----- Unhandled Rejection at -----')
    console.log(promise)
    console.log('----- Reason -----')
    console.log(reason)
})
// Database
mongoose.connect('mongodb://localhost:27017/images', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Database connected");
});
const auctionSchema = new mongoose.Schema({
    image: [
        {
            width: Number,
            height: Number,
            url: String
        }
    ],
    description: String,
    title: String,
    price: Number,
    id: String
});
const Auction = mongoose.model('Auction', auctionSchema);
//Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        const fileName = req.body.title;
        cb(null, fileName)
    }
});
// Auction.deleteMany((err, auctions) => {
//     if (err) return console.error(err);
//     console.log(auctions)
// })
const { uploadFile, getFileStream, deleteFiles } = require("./s3");

const authenticateToken = (req, res, next) => {
    // const authHeader = req.headers['authorization']
    // const token = authHeader && authHeader.split(' ')[1]
    const token = req.query.id
    if (token == null) return res.redirect("/")
    jwt.verify(token, process.env.ACCES_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })

}
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/login.html")
})
app.post("/login", async (req, res) => {
    const user = req.body.username;
    const pass = req.body.password;
    console.log(user, pass);
    if (user === process.env.ADMIN_LOGIN) {
        try {
            if (await bcrypt.compare(pass, process.env.ADMIN_PASS)) {
                const authUser = {
                    user: user,
                    password: pass
                }
                const accessToken = jwt.sign(authUser, process.env.ACCES_TOKEN_SECRET)
                res.json({ accessToken: accessToken })
            } else {
                res.status(401).send("Login failed")
            }
        } catch {
            res.status(404).send("Server error")
        }
    } else {
        res.status(404).send("User not found")
    }
})
app.get('/admin', authenticateToken, (req, res) => {
    res.sendFile(__dirname + "/admin.html")
})
app.get("/api/auctions", (req, res) => {
    if (req.query.id) {
        const response = []
        Auction.findOne({ id: req.query.id }, (err, auction) => {
            if (err) return console.error(err);
            response.push(auction);
            res.send(response);
        });
    } else {
        Auction.find((err, auctions) => {
            if (err) return console.error(err);
            res.send(auctions)
        })
    }
})
app.get("/images/:key", (req, res) => {
    const key = req.params.key
    try {
        const readStream = getFileStream(key);
        readStream.pipe(res)
    } catch (err) {
        res.sendStatus(404)
    }
})
app.post('/upload', upload.array("image", 6), async (req, res, next) => {
    if (req.files.length !== 0) {
        console.log(req.files)
        const title = req.body.title
        const description = req.body.description
        const price = req.body.price
        let image = [];
        const handleImageResizing = async (req) => {
            if (!req.files) return next();
            await Promise.all(
                req.files.map(async (item, id) => {
                    await sharp(item.path, { failOnError: false })
                        .rotate()
                        .resize(550)
                        .jpeg({ mozjpeg: true })
                        .toFile(`upload/result${id}.jpeg`)
                        .then(async (data) => {
                            const result = await uploadFile(`upload/result${id}.jpeg`, item).catch((err) => console.log(err))
                            const url = `https://doge-memes.com/images/${item.filename}`;
                            image.push({
                                width: data.width,
                                height: data.height,
                                url: url
                            })
                            await unlinkFile(item.path);
                            await unlinkFile(`upload/result${id}.jpeg`);
                        })
                })
            ).then(() => {
                const auction = new Auction({ image: image, description: description, title: title, price: price, id: uuidv4() });
                auction.save((err, auction) => {
                    if (err) return console.error(err);
                    console.log("Saved: " + auction)
                });
                image = [];
                res.send("Pliki zostaly przeslane.")

            }).catch((err) => {
                res.send("Blad przesylania")
            })
        }
        handleImageResizing(req)
    } else {
        res.send("Wybierz pliki do wgrania")
    }
})
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})