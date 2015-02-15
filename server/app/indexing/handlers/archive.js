
function extractVideo(source, archive, index) {
  console.log("Extract ", archive);

  var rf = new rarfile(archive, {
    debugMode: true
  });
  console.log(rf.toString());
  // { names: [ '0.jpg', '2.jpg']}

////readFile function
//  rf.readFile('0.jpg', function(err, fdata) {
//    console.log("File 0.jpg is " + fdata.length + " bytes long.");
//  });

  return archive + ".test.mp4";
}

module.exports = {
  pattern: /\.(rar|001|zip)/,
  callback: extractVideo
};