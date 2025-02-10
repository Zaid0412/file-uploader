const cloudinary = require("../config/cloudinaryConfig");
const moment = require("moment");

// Define the function to format bytes
const formatBytes = (bytes) => {
  const units = ["Bytes", "KB", "MB", "GB", "TB"];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return bytes.toFixed(2) + " " + units[i];
};

const indexControllers = {
  home: (req, res, next) => {
    try {
      res.render("pages/index", { user: req.user || null });
    } catch (error) {
      next(error);
    }
  },

  library: async (req, res, next) => {
    try {
      const folderData = await cloudinary.api.root_folders();

      // Map each folder to a promise that fetches its size
      const updatedFolders = await Promise.all(
        folderData.folders.map(async (f) => {
          let totalSizeBytes = 0;
          let nextCursor = null;
          do {
            // Fetch resources for the current folder
            const result = await cloudinary.api.resources({
              type: "upload",
              prefix: `${f.path}/`, // Folder path
              max_results: 100, // Adjust as needed
              next_cursor: nextCursor, // For pagination
            });

            // Add the size of each resource
            totalSizeBytes += result.resources.reduce(
              (sum, r) => sum + r.bytes,
              0,
            );

            // Check if there are more resources to fetch
            nextCursor = result.next_cursor;
          } while (nextCursor); // Repeat if there are more resources

          return {
            ...f, // Keep all existing folder info
            size: formatBytes(totalSizeBytes), // Add computed size
          };
        }),
      );

      // Render the updated folder list with sizes
      // console.log(updatedFolders);
      res.render("pages/library", {
        user: req.user || null,
        folders: updatedFolders,
      });
    } catch (error) {
      console.log("Error in library controller:", error);
      next(error);
    }
  },
};

module.exports = indexControllers;
