// Initialize
console.log("Starting Facebook Waste Management API...")  


// so process never dies
process.on('uncaughtException', function (err) {
  console.log('Caught exception: ', err);
});


let express = require('express')
let request = require('request-promise')
let fs = require('fs')
let FileType = require('file-type')
let uuid = require('uuid').v4
let bodyParser = require('body-parser')
let app = express()
let config = require('config')

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(config.port, () => console.log(`Facebook Waste Management API listening on ${config.port}!`));

app.get('/', (req, res) => res.send('Hello API World!'));

app.post('/info', async (req,res)=>{
	try {
		
		let reqID = uuid()
		
		console.log("New req", req)

		if(req.body.attachments && req.body.attachments instanceof Array){

			// Save attachments to request ID based local directory database
			await asyncForEach(req.body.attachments, async attachment=>{
				if(attachment.type == 'image'){
					if(!(attachment.imageData.bin instanceof Buffer)){
						attachment.imageData.bin = new Buffer.from(attachment.imageData.bin.data)
					}
					let url = attachment.payload.url
					let dir = __dirname+"/../imageDB/"+reqID+"/"

					// create directory for sender
					if (!fs.existsSync(dir)){
						fs.mkdirSync(dir)
					}

					// add filename uuid to attachment object
					attachment.uuid = uuid()

					// create path out of local directory + sender facebook ID
					path = dir+attachment.uuid
					
					// download image to sender ID'd local folder DB
					attachment.imageData = await save(attachment.imageData, path)

				}
			})

		}

	} catch(err){
		console.error(err)
	}
	
	res.status(200).send({
		info: "No info right now but we're working on it!"
	})
	
})

// done initializing
console.log("Facebook Waste Management API started!")

async function save(data, path){
	try {
		fs.writeFileSync(path+"."+data.ext, data.bin)
	} catch(err){
		console.error("Something went wrong saveing the file from data")
		console.error(err)
	}
}


async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}