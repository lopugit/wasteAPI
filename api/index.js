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

global.client = client

client.connect();

app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(bodyParser.json({ limit: '100mb'}));

app.listen(config.port, () => console.log(`Facebook Waste Management API listening on ${config.port}!`));

app.get('/', (req, res) => res.send('Hello API World!'));


app.post('/info', async (req, res) => {
	let return_message = "No info right now but we're working on it!";
	
	try {
		
		req.uuid = uuid()
		res.response = {}

		console.log("new request, req:", req.body, req.uuid)

		if (req.body.attachments && req.body.attachments instanceof Array) {
			await handleAttachments(req, res) // handles image attachments
		} 

		await query(req, res) // queries the database with req.body.message	
		
		res.status(200).send(res.response)
			

	} catch (err) {
		if(!res._headerSent){
			console.error("err: ", err)
			// sends error
			res.status(500).send()
		}
	}
	
	if(!res._headerSent){
		res.status(200).send({
			info: return_message
		})
	}

})

// done initializing
console.log("Facebook Waste Management API started!")
