async function deleteManyImages(callback, ids) {
  for (let i = 0; i < ids.length; i++) {
    try {
      await callback(ids[i]);
    } catch (error) {
      console.error(`Error deleting file with ID ${ids[i]}:`, error);
    }
  }
}

module.exports = deleteManyImages;
