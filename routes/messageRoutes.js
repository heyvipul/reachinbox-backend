const express = require("express")
const app = express();
const router = express.Router();
const { getUser, sendMail, readMail, sendMailViaQueue, sendMultipleEmails } = require("../controllers/messageControler")

app.use(express.json());
app.use(express.urlencoded({extended : true}));

router.get("/user/:email",getUser)
router.get("/send",sendMail)
router.get("/read/:email/message/:message",readMail)
router.post("/readdata/:id",sendMailViaQueue);
router.post("/sendmulti/:id",sendMultipleEmails)

export default router;