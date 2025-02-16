const cloudinary = require("../config/cloudinaryConfig");
const moment = require("moment");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const formatBytes = (bytes) => {
  const units = ["Bytes", "KB", "MB", "GB", "TB"];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return bytes.toFixed(2) + " " + units[i];
};

module.exports.fileControllers = {
  upload: {
    post: async (req, res, next) => {
      try {
        // Ensure file was uploaded
        if (!req.file) {
          return res
            .status(400)
            .json({ success: false, message: "No file uploaded." });
        }

        // Get folder ID from request params
        const external_id = req.params.id;

        // Find the folder in Prisma
        const curFolder = await prisma.folder.findFirst({
          where: { id: external_id },
        });

        if (!curFolder) {
          return res
            .status(404)
            .json({ success: false, message: "Folder not found." });
        }

        // Upload file to Cloudinary inside the correct folder
        const cloudinaryResult = await cloudinary.uploader.upload(
          req.file.path,
          {
            folder: curFolder.name,
            public_id: req.file.originalname,
          },
        );
        // const prismaResult = await prisma.file.create({
        //   data: {
        //     name: req.file.originalname,
        //     assetId: cloudinaryResult.asset_id,
        //     folderId: external_id,
        //   },
        // });
        // Redirect to the folder page after upload
        return res.status(200).redirect(`/folder/${external_id}`);
      } catch (error) {
        console.error("Error:", error);
        next(error);
      }
    },
  },
  deleteFile: {
    get: async (req, res, next) => {
      try {
        const asset_id = req.params.id;
        const file = await cloudinary.api.resources_by_asset_ids(asset_id);
        await cloudinary.uploader.destroy(file.resources[0].public_id);

        const lastSlashIndex = file.resources[0].public_id.lastIndexOf("/");
        const parentFolder = file.resources[0].public_id.substring(
          0,
          lastSlashIndex,
        );
        const folders = await cloudinary.api.root_folders();

        folders.folders.map((folder) => {
          if (folder.path == parentFolder) {
            res.redirect(`/folder/${folder.external_id}`);
          }
        });

        // res.redirect('')
      } catch (error) {
        console.log(error);
        next(error);
      }
    },
  },
  downloadFile: {
    get: async (req, res, next) => {
      try {
        const asset_id = req.params.id;
        const file = await cloudinary.api.resources_by_asset_ids(asset_id);

        const url = await cloudinary.utils.download_archive_url({
          resource_type: "image",
          type: "upload",
          public_ids: [file.resources[0].public_id],
          format: "png", // or "jpg", "png", etc.
        });
        console.log(url);
        // cloudinary.utils.do

        const lastSlashIndex = file.resources[0].public_id.lastIndexOf("/");
        const parentFolder = file.resources[0].public_id.substring(
          0,
          lastSlashIndex,
        );
        const folders = await cloudinary.api.root_folders();

        // folders.folders.map((folder) => {
        //   if (folder.path == parentFolder) {
        //     res.redirect(`/folder/${folder.external_id}`);
        //   }
        // });
        res.redirect(url);
      } catch (error) {
        next(error);
      }
    },
  },
};

module.exports.folderControllers = {
  folder: {
    get: async (req, res, next) => {
      try {
        const external_id = req.params.id;
        // Getting the currnt folder that the user is in
        const curFolder = await prisma.folder.findFirst({
          where: { id: external_id },
        });

        // Getting all the files in the current folder
        const files = await cloudinary.api.resources({
          type: "upload",
          prefix: curFolder.name + "/",
          max_results: 500,
        });
        const updatedFiles = files.resources.map((file) => {
          const fileName = file.public_id.split("/").pop();
          return {
            ...file,
            fileName,
            size: formatBytes(file.bytes),
            createdAt: moment(file.created_at).format("MMM D, YYYY"),
          };
        });
        // console.log(updatedFiles[0].name);
        res.render("pages/folder", {
          user: req.user || null,
          curFolder,
          files: updatedFiles,
        });
      } catch (error) {
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
  deleteFolder: {
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
  updateFolder: {
    get: async (req, res, next) => {
      try {
        const { external_id } = req.params; // Get folder ID from URL
        const { newName } = req.body; // Get new name from form input

        if (!newName) {
          return res
            .status(400)
            .json({ success: false, message: "New folder name is required." });
        }

        // Find the current folder in Prisma
        const curFolder = await prisma.folder.findFirst({
          where: { id: external_id },
        });

        if (!curFolder) {
          return res
            .status(404)
            .json({ success: false, message: "Folder not found." });
        }

        // Rename folder in Cloudinary
        await cloudinary.api.rename(curFolder.name, newName);

        // Update the folder name in Prisma
        await prisma.folder.update({
          where: { id: external_id },
          data: { name: newName },
        });

        res.status(200).redirect("/library");
      } catch (error) {
        console.error("Error renaming folder:", error);
        next(error);
      }
    },
  },
  downloadFolder: {
    get: async (req, res, next) => {
      try {
        const external_id = req.params.id;
        console.log("External ID " + external_id);

        const folders = await cloudinary.api.root_folders();

        folders.folders.map((folder) => {
          if (folder.external_id == external_id) {
            const url = cloudinary.utils.download_folder(folder.path);
            res.redirect(url);
          }
        });
      } catch (error) {
        console.log(error);
        next(error);
      }
    },
  },
};
