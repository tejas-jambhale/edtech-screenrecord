const aws = require('aws-sdk');

require('dotenv').config();
aws.config.update({region: process.env.AWS_REGION});

var transcoder = new aws.ElasticTranscoder();

let transcodeVideo = function (key, outputDir, outputName, callback) {
    if (outputDir == undefined || outputDir == '') {
        throw new Error('Output directory of the video must be defined for HLS conversion')
    }
    if (outputName == undefined || outputName == '') {
        throw new Error('Output name of the video must be defined for HLS conversion')
    }
    if (key == undefined || key == '') {
        throw new Error('Key of the video must be defined for HLS conversion');
    }
    let outputFile = `${outputDir}/${outputName}.m3u8`

    let params = {
      PipelineId: process.env.AWS_PIPELINE_ID,
      Input: {
        Key: key,
      },
      Outputs: [
        {
            Key: outputFile,
            PresetId: "1351620000001-200010"
            /** Go to https://docs.aws.amazon.com/elastictranscoder/latest/developerguide/system-presets.html for presets */
        }, 
      ]
    };

    transcoder.createJob(params, function (err, data) {
      if (err) {
        callback(err, null);
        return;
      }
      let jobId = data.Job.Id;
      transcoder.waitFor('jobComplete', {Id: jobId}, callback);
    });
};

/** Example usage */
// transcodeVideo('source/file_example_MP4_480_1_5MG.mp4', 'converted', 'playback2' ,(err, data) => {
//     if (err) console.log(err);
//     console.log(data);
// })

module.exports = transcodeVideo;
