#!/usr/bin/env node

const process = require('process');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

if (process.argv.length < 4) {
  console.error("Usage: thumber SRC_DIR DST_DIR");
  process.exit(1);
}

const rootSrcDir = process.argv[2];
const rootDstDir = process.argv[3];

if (rootSrcDir === rootDstDir) {
  console.error("SRC_DIR and DST_DIR can't be the same");
  process.exit(1);
}

async function thumbDir(srcDir, dstDir) {


  try {
    await fs.promises.mkdir(dstDir);
  }
  catch (e) {
    //console.error(e);
  }

  let childNames;
  try {
    childNames = await fs.promises.readdir(srcDir);
  }
  catch (e) {
    console.error(e);
    return;
  }

  for (const childName of childNames) {
    if (childName === 'thumbnails') {
      continue;
    }

    let stats;
    const srcChildPath = path.join(srcDir, childName);
    const dstChildPath = path.join(dstDir, childName);
    try {
      stats = await fs.promises.stat(srcChildPath);
    }
    catch (e) {
      console.error(e);
      return;
    }

    if (stats.isDirectory()) {
      await thumbDir(srcChildPath, dstChildPath);
    }
    else {
      if (!isImage(childName)) {
        continue;
      }

      console.log(srcChildPath, dstChildPath);

      const epeg = spawnSync('epeg', ['-p', '-h', '128', srcChildPath, dstChildPath]);
      console.log(epeg.stdout.toString('utf8'));
    }
  }
}

function isImage(filename) {
  return filename.endsWith('.jpg') || 
    filename.endsWith('.jpeg') ||
    filename.endsWith('JPG') ||
    filename.endsWith('JPEG');
}

thumbDir(rootSrcDir, rootDstDir);
