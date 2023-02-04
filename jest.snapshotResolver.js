module.exports = {
  testPathForConsistencyCheck: "src/__tests__/common/navbar.test.tsx",

  resolveSnapshotPath: (testPath) => testPath + ".snap",

  resolveTestPath: (snapshotFilePath, snapshotExtension) =>
    snapshotFilePath.replace(snapshotExtension, ""),
};
