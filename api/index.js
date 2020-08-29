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


// create mongoDB connection for querying
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


app.post('/info', async (req, res) => {
	let return_message = "No info right now but we're working on it!";
	try {
		let keywords_included = false;
		let reqID = uuid()

		console.log("New req", req.body, reqID)

		if (req.body.attachments && req.body.attachments instanceof Array) {
			await handleAttachments(req, res) // handles image attachments
		} else if (typeof req.body.message == "string") {

			keywords_included = true;
			console.log("Querying the database with the following keyword(s): " + req.body.message);

			// connect to mongodb connection
			await client.connect();

			let db = client.db("wastee");
			let items = db.collection("items");

			// query: 
			return_message = await items.aggregate([
				{
					$search: {
						"text": {
							"query": req.body.message,
							"path": "name"
						}
					}
				},
				{
					$limit: 2 // max number of items returned 
				},
				{
					// return the advice and if it is recyclable
					$project: {
						"_id": 0,
						"recyclable": 1,
						"advice": 1
					}
				}
			]).toArray()

			console.log(return_message)
			// close the connection
			client.close();
		}
	} catch (err) {
		console.error(err)
		// sends error
		res.status(500).send()
		return
	}

	res.status(200).send({
		info: return_message
	})

})

// done initializing
console.log("Facebook Waste Management API started!")

async function save(data, path) {
	try {
		data.ext = (await FileType.fromBuffer(data.bin) || { ext: 'unknown' }).ext
		fs.writeFileSync(path + "." + data.ext, data.bin)
	} catch (err) {
		console.error("Something went wrong saveing the file from data")
		console.error(err)
	}
}


async function asyncForEach(array, callback) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
}