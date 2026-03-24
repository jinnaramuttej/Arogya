const fs = require('fs');
const path = require('path');
const https = require('https');

const modelsDir = path.join(__dirname, 'public', 'models');
const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';

const models = [
  'tiny_face_detector_model-shard1',
  'face_landmark_68_model-shard1',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2'
];

models.forEach(model => {
  const dest = path.join(modelsDir, model);
  const file = fs.createWriteStream(dest);
  https.get(baseUrl + model, function(response) {
    if (response.statusCode === 200) {
      response.pipe(file);
      file.on('finish', function() {
        file.close();
        console.log('Downloaded: ' + model);
      });
    } else {
      console.log('Failed to download ' + model + ' - status: ' + response.statusCode);
    }
  }).on('error', function(err) { 
    fs.unlink(dest, () => {}); 
    console.log('Error downloading ' + model + ': ' + err.message);
  });
});
