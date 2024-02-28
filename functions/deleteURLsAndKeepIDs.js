function deleteURLsAndKeepIDs(url) {
  const regex =
    /https?:\/\/(?:admin\.noanzo\.pl|localhost:8080)\/images\/([^/]+)/g;
  return url.replace(regex, (match, group) => group);
}

module.exports = deleteURLsAndKeepIDs;
