const cloudinary = require("../config/cloudinaryConfig");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const fileControllers = {
  upload: {
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
      // try {
      //   const external_id = req.params.id;

      //   // Step 3: Redirect to /library after deleting folder
      //   res.redirect("/library");
      // } catch (error) {
      //   next(error);
      // }
      try {
        const external_id = req.params.id;
        console.log(external_id);
        cloudinary.api.deleteres;

        // ✅ Ensure external_id is provided
        if (!external_id) {
          return res
            .status(400)
            .json({ error: "Folder external_id is required" });
        }

        // Step 1: Find the folder by external_id
        const folder = await prisma.folder.findUnique({
          where: { id: external_id },
        });

        if (!folder) {
          return res.status(404).json({ error: "Folder not found" });
        }

        // --------Deleting file from cloudinary-------
        // Delete the files from cloudinary
        const result = await cloudinary.api.resources({
          type: "upload",
          prefix: folder.name + "/",
          max_results: 500,
        });

        for (const file of result.resources) {
          await cloudinary.uploader.destroy(file.public_id);
        }

        // Delete the folder from cloudinary
        await cloudinary.api.delete_folder(folder.name);

        // --------Deleting file from prisma-------
        // Delete files from the database
        await prisma.file.deleteMany({ where: { folderId: folder.id } });

        // Delete the folder from the database
        await prisma.folder.delete({ where: { id: folder.id } });

        res.status(200).redirect("/library");
      } catch (error) {
        console.log(error);
        next(error);
      }
    },
  },
  createFolder: {
    post: async (req, res, next) => {
      const { folder } = req.body;
      console.log(folder);
      try {
        const newFolder = await cloudinary.api.create_folder(folder);
        console.log(newFolder);
        await prisma.folder.create({
          data: {
            id: newFolder.external_id,
            name: newFolder.name,
            userId: req.user.id,
          },
        });
        res.redirect("/library");
      } catch (error) {
        console.log(error);
        next(error);
      }
    },
  },
  folder: {
    get: async (req, res, next) => {
      try {
        res.render("pages/folder", { user: req.user || null });
      } catch (error) {
        next(error);
      }
    },
  },
};

module.exports = fileControllers;
