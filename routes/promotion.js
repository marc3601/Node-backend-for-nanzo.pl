const Auction = require("../database/schemas/auctionSchema"); // Adjust path as needed

/**
 * Update promotion rankings for auctions
 * @param {Array} promotedIds - Array of auction IDs in promotion order
 * @returns {Object} Success message and updated count
 */
const promotion = async (req, res) => {
  try {
    const { promotedIds } = req.body;

    // Validate input
    if (!Array.isArray(promotedIds)) {
      return res.status(400).json({ 
        error: "promotedIds must be an array" 
      });
    }

    // Step 1: Reset all auctions to promotion = 0
    await Auction.updateMany({}, { promotion: 0 });

    // Step 2: Update promoted auctions with their position (1-indexed)
    const updatePromises = promotedIds.map((auctionId, index) => {
      const promotionRank = index + 1; // 1-based ranking
      return Auction.updateOne(
        { _id: auctionId },
        { promotion: promotionRank }
      );
    });

    const results = await Promise.all(updatePromises);
    
    // Count how many were actually updated
    const updatedCount = results.filter(r => r.modifiedCount > 0).length;

    return res.status(200).json({
      message: "Promowanie zostało zaktualizowane",
      promoted: updatedCount,
      total: promotedIds.length
    });

  } catch (error) {
    console.error("Error updating promotions:", error);
    return res.status(500).json({ 
      error: "Błąd podczas aktualizacji promocji",
      details: error.message 
    });
  }
};

module.exports = promotion;