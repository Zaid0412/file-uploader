const cloudinary = require("../config/cloudinaryConfig");

const fileControllers = {
  upload: {
    get: (req, res) => {
      res.render("sda");
    },
    post: (req, res, next) => {
      try {
        cloudinary.uploader.upload(req.file.path, (err, result) => {
          if (err) {
            console.log("Error" + err);
            return res.status(500).json({
              success: false,
              message: "Error",
            });
          }

          res.status(200).json({
            success: true,
            message: "Uploaded!",
            data: result,
          });
        });
      } catch (error) {
        console.log("Error" + error);
        next(error);
      }
    },
  },
  deleteFile: {
    get: async (req, res, next) => {
      try {
        const external_id = req.params.id;

        // Step 1: Delete all assets inside the folder
        await cloudinary.api.delete_resources_by_prefix(external_id);

        // Step 2: Delete the empty folder
        await cloudinary.api.delete_folder(external_id);

        // Step 3: Redirect to /library after deleting folder
        res.redirect("/library");
      } catch (error) {
        next(error);
      }
    },
  },
  createFolder: {
    post: async (req, res, next) => {
      const { folder } = req.body;
      try {
        await cloudinary.api.create_folder(folder);
        res.redirect("/library");
      } catch (error) {
        next(error);
      }
    },
  },
};

module.exports = fileControllers;
