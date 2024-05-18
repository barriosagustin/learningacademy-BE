const express = require("express");
const multer = require("multer");
const connectDB = require("./db");
const cors = require("cors");
const bodyParser = require("body-parser");
const courses = require("./coursesModel");
const { ObjectId } = require("mongodb");

function setCommonHeaders(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
}

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const app = express();
app.use(express.json());
app.use(setCommonHeaders);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`server running in port ${PORT}`);
});

//internal courses
app.get("/api/courses", async (req, res) => {
  try {
    const courses = await courses.find();
    const coursesWithBase64Image = courses.map((course) => ({
      ...course,
      image: course.image ? course.image.toString("base64") : null,
    }));
    res.json(coursesWithBase64Image);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/course/:id", async (req, res) => {
  try {
    const courseId = req.params.id;

    const idConverted = new ObjectId(courseId);
    const course = await courses.findById(idConverted);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(course);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ mensaje: "Error trying to get the course" });
  }
});

app.post("/api/createcourse", upload.single("image"), async (req, res) => {
  try {
    const {
      title,
      description,
      instructor,
      category,
      duration,
      price,
      language,
      modules,
    } = req.body;

    const imageBuffer = req.file.buffer;

    const image = new Buffer.from(imageBuffer, "binary");

    const newCourse = new courses({
      title,
      description,
      instructor,
      category,
      duration,
      price,
      language,
      image,
      modules,
    });

    const savedCourse = await newCourse.save();

    res.status(201).json(savedCourse);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/update_value/:videoId", async (req, res) => {
  try {
    const { videoId } = req.params;
    const { completed } = req.body;

    if (!ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: "Invalid ObjectId" });
    }

    const course = await courses.findOne({ "modules.videos._id": videoId });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    let moduleIndex = -1;
    let videoIndex = -1;

    for (let i = 0; i < course.modules.length; i++) {
      const module = course.modules[i];
      const foundVideoIndex = module.videos.findIndex(
        (video) => video._id.toString() === videoId
      );
      if (foundVideoIndex !== -1) {
        moduleIndex = i;
        videoIndex = foundVideoIndex;
        break;
      }
    }

    if (moduleIndex === -1 || videoIndex === -1) {
      return res.status(404).json({ message: "Video not found" });
    }

    course.modules[moduleIndex].videos[videoIndex].completed = completed;

    await course.save();

    res.status(200).json({ message: "Video updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
