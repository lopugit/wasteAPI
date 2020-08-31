// Initialize
console.log("Starting Facebook Waste Management API...")


// so process never dies
process.on('uncaughtException', function (err) {
	console.log('Caught exception: ', err);
});

let express = require('express')
let uuid = require('uuid').v4
let bodyParser = require('body-parser')
let app = express()
let config = require('config')


let handleAttachments = require('functions/handleAttachments')
let query = require('functions/query')


// create mongoDB connection for querying
let MongoClient = require('mongodb').MongoClient;

let uri = config.uri

let client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true
});

client.connect();

app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(bodyParser.json({ limit: '100mb'}));

app.listen(config.port, () => console.log(`Facebook Waste Management API listening on ${config.port}!`));

app.get('/', (req, res) => res.send('Hello API World!'));


app.post('/info', async (req, res) => {
	let return_message = "No info right now but we're working on it!";
	
	try {
		
		req.uuid = uuid()
		
		let keywords_included = false;

		console.log("new request, req:", req.body, req.uuid)

		if (req.body.attachments && req.body.attachments instanceof Array) {
			await handleAttachments(req, res) // handles image attachments
		} else if (typeof req.body.message == "string") {
			let query_output = query(req, client) // queries the database with req.body.message
			
			if (!Array.isArray(query_output) || !query_output.length) { // checks if output array is empty
				return_message = "No output after querying the database."
		}
	}
	} catch (err) {
		console.error(err)
		// sends error
		res.status(500).send()
		return
	}
	
	if(!res._headerSent){
		res.status(200).send({
			info: return_message
		})
	}

})

// done initializing
console.log("Facebook Waste Management API started!")
