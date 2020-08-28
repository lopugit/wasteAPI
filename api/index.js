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
let smarts = require('smarts')()

let handleAttachments = require('functions/handleAttachments')


// create mongoDB connection
let MongoClient = require('mongodb').MongoClient;
let uri = config.uri
let client = new MongoClient(uri, { 
	useNewUrlParser: true, 
	useUnifiedTopology: true 
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(config.port, () => console.log(`Facebook Waste Management API listening on ${config.port}!`));

app.get('/', (req, res) => res.send('Hello API World!'));

app.post('/info', async (req,res)=>{
	try {
		let keywords_included = false;
		var return_message = "No info right now but we're working on it!";
		let reqID = uuid()
		
		console.log("New req", req.body, reqID)

		if(req.body.attachments && req.body.attachments instanceof Array){
			await handleAttachments(req, res)
		}else if (typeof req.body.message == "string") {
			keywords_included = true;
			return_message = "Keyword input recieved: " + req.body.message;
			console.log("Querying the database with the following keyword(s): " + req.body.message);

			// connect to mongodb connection
			/*
			client.connect(async err => {
				if(err) console.error(err)
				
				let db = client.db("wastee");
				let items = db.collection("items")

				await asyncForEach(parsed, async item=>{
					let found = await items.query(
						// QUERY the db 
						).catch(console.error)
					console.log(found)
				})
				
				
				// close the connection
				client.close();
				*/
			};
		

	} catch(err){
		console.error(err)
	}
	
	res.status(200).send({
		info: return_message
	})
	
})

// done initializing
console.log("Facebook Waste Management API started!")

async function save(data, path){
	try {
		data.ext = (await FileType.fromBuffer(data.bin) || { ext: 'unknown' }).ext
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