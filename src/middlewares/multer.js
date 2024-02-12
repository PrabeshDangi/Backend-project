import multer from "multer";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp"); //Yo line le ahile ko working directory, i.e src vanney directory vanda ek mathi root directory then public/temp file ma upload gardinchha file lai.
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage: storage });
