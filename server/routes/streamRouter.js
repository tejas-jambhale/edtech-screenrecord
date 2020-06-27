const express = require('express');
const router = express.Router();

const aws = require('aws-sdk');
const s3 = new aws.S3({});

/*** 
 * @desc Get file size
 ******/
function sizeOf(key, bucket) {
    return s3.headObject({ Key: key, Bucket: bucket })
        .promise()
        .then(res => {return res;});
}

/****
 * @desc Stream video from server
 */
router.get('/:id', async (req, res) => {

	/***** Fetch link from videoId  *********/
	
	var getParams = {
		Bucket: 'vatsalvideos',
		Key: 'converted/29880.m3u8'
	}
	let range = req.headers.range;
	let positions;
	if(range)
	{
		positions = range.replace(/bytes=/, '').split('-');
	} else {
		positions = [0,null]
	}	
	let start = parseInt(positions[0], 10);
	let fileMetaData = await sizeOf(getParams.Key,getParams.Bucket);
	let fileSize = fileMetaData.ContentLength;
	let end = positions[1] ? parseInt(positions[1], 10) : fileSize - 1;
	let chunksize = (end - start) + 1;
	res.writeHead(206, {
		'Content-Range'  : 'bytes ' + start + '-' + end + '/' + fileSize,
		'Accept-Ranges'  : 'bytes',
		'Content-Length' : chunksize,
		'Content-type': fileMetaData.ContentType
	});
	s3.getObject({...getParams, Range: 'bytes=' + start + '-' + end}).createReadStream().pipe(res).on('error', (err) => {
		res.status(500).send();
	});	
});

module.exports = router;