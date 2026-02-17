const Auction = require("../database/schemas/auctionSchema"); // adjust path as needed

async function getTitleFromLink(url) {
  // Handle base domain URL
  const urlObj = new URL(url);
  if (urlObj.pathname === "/" || urlObj.pathname === "") {
    return "Noanzo.pl - strona główna";
  }

  // Extract last path segment (UUID)
  const id = url.split("/").pop();

  // Search for auction by id field
  const auction = await Auction.findOne({ id });

  if (!auction) {
    throw new Error(`No auction found for id: ${id}`);
  }

  return auction.title;
}

module.exports = getTitleFromLink;