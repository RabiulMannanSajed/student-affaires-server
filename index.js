const multer = require("multer");
const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/files", express.static("files"));
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { send } = require("process");
const mongoose = require("mongoose");

// this is use to connect the data base
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.z68se.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./files");
  },
  filename: function (res, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});
require("./pdfDetails");
const pdfSchema = mongoose.model("PdfDetails");
const upload = multer({ storage: storage });
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const userCollection = client.db("student-affairs").collection("user");
    const userInfosCollection = client
      .db("student-affairs")
      .collection("userInfos");
    const contentCollection = client
      .db("student-affairs")
      .collection("contents");
    const uploadFilesCollection = client
      .db("student-affairs")
      .collection("uploadFiles");

    const messagesCollection = client
      .db("student-affairs")
      .collection("messages");
    const commentsCollection = client
      .db("student-affairs")
      .collection("comments");
    const JobPdfFilesCollection = client
      .db("student-affairs")
      .collection("JobPdfFiles");

    app.get("/user", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.post("/user", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    //  this is for the like
    app.patch("/contents/:id/like", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $inc: { like: 1 },
      };
      const result = await contentCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    //  here take the value of the email,content id and the comment
    app.get("/comments", async (req, res) => {
      const result = await commentsCollection.find().toArray();
      res.send(result);
    });

    app.post("/comments", async (req, res) => {
      const comment = req.body;
      console.log(comment);
      const result = await commentsCollection.insertOne(comment);
      res.send(result);
    });

    //  this is to get the userInfo
    // app.get("/userInfos", async (req, res) => {
    //   const result = await userInfosCollection.find().toArray();
    //   res.send(result);
    // });
    app.get("/userInfos", async (req, res) => {
      const result = await userInfosCollection
        .aggregate([
          {
            $project: {
              _id: 1,
              companyName: 1,
              varsity: 1,
              school: 1,
              hometown: 1,
              currentCity: 1,
              relationship: 1,
              userEmail: 1,
            },
          },
        ])
        .toArray();
      res.send(result);
    });
    //  update an user with many data
    app.post("/userInfos", async (req, res) => {
      const userInfo = req.body;
      const result = await userInfosCollection.insertOne(userInfo);
      res.send(result);
    });
    app.get("/contents", async (req, res) => {
      const result = await contentCollection.find().toArray();
      res.send(result);
    });
    app.post("/contents", async (req, res) => {
      const contentData = req.body;
      const result = await contentCollection.insertOne(contentData);
      res.send(result);
    });

    app.get("/uploadFiles", async (req, res) => {
      const result = await uploadFilesCollection.find().toArray();
      res.send(result);
    });
    app.patch("/uploadFiles/:id/like", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $inc: { like: 1 },
      };
      const result = await uploadFilesCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    // this is for upload files
    app.post("/uploadFiles", upload.single("file"), async (req, res) => {
      console.log(req.file);
      const userEmail = req.body.email;
      console.log(userEmail);
      const originalname = req.file.originalname;
      const fileName = req.file.filename;
      try {
        const result = await uploadFilesCollection.insertOne({
          fileName: fileName,
          userEmail: userEmail,
          originalname: originalname,
        });
        res.send(result);
      } catch (error) {
        res.json({ status: error });
      }
    });
    // this is for job upload files
    app.get("/JobPdfFiles", async (req, res) => {
      const result = await JobPdfFilesCollection.find().toArray();
      res.send(result);
    });

    app.post("/JobPdfFiles", upload.single("file"), async (req, res) => {
      console.log(req.file);
      const userEmail = req.body.email;
      console.log(userEmail);
      const originalname = req.file.originalname;
      const fileName = req.file.filename;
      try {
        const result = await JobPdfFilesCollection.insertOne({
          fileName: fileName,
          userEmail: userEmail,
          originalname: originalname,
        });
        res.send(result);
      } catch (error) {
        res.json({ status: error });
      }
    });

    //  this is for message
    app.get("/messages", async (req, res) => {
      const result = await messagesCollection.find().toArray();
      res.send(result);
    });
    app.post("/messages", async (req, res) => {
      const messages = req.body;
      const result = await messagesCollection.insertOne(messages);
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("student affairs is open  ");
});

app.listen(port, () => {
  console.log(`Student affairs is running Port ${port}`);
});
