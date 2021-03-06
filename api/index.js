
/**
 * @Description This is the entry point file for the Wastee Recycling Information API
 * This API waits for HTTP POST requests on the /info endpoint and accepts
 * text based queries or image based queries
 * 
 * The bot uses Google Vision API to convert images into keywords and then does
 * a text based fuzzy text query on a recycling information database scraped
 * from the Victorian Can I Recycle this website
 */

// Initialize
console.log("Starting Facebook Waste Management API...")

// catches all uncaught errors so process never dies
process.on('uncaughtException', function (err) {
	console.log('Caught exception: ', err);
});

// import external packages
let express = require('express')
let smarts = require('smarts')()
let uuid = require('uuid').v4
let bodyParser = require('body-parser')
let app = express()
let config = require('config')

// import local packages containing modularised code
let handleAttachments = require('functions/handleAttachments')
let handleText = require('functions/handleText')

// create mongoDB connection for querying
let MongoClient = require('mongodb').MongoClient;

// create client
let client = new MongoClient(config.uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true
});

// connect to client
client.connect();

// store client globally for modular code access
global.client = client

// configure Express for JSON decoding
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(bodyParser.json({ limit: '100mb'}));

// start app listening on port defined in config file
app.listen(config.port, () => console.log(`Facebook Waste Management API listening on ${config.port}!`));

// basic get endpoint to easily check if bot is alive
app.get('/', (req, res) => res.send('Hello API World!'));

// Creates the endpoint for our recycling information API
// only responds to HTTP POST request types
app.post('/info', async (req, res) => {

	/**
	 * @Description Handles any Webhook HTTP POST messages sent by facebook to this bot
	 * we are expecting webhook messages containing either text messages, images attachments, 
	 * or quick_reply selections made by a user
	 * 
	 * @Params 
	 * 	@var req @type {Object} is an object with the request data of the get request
	 * 	@var res @type {Object} is an object with the response functions used to send a response
	 */
	
	// predefine reply so reply object can simply be modified down the line
	let returnMessage = "No info right now but we're working on it!";
	
	// wrap in try so API doesn't crash on error
	try {
		
		// generate random unique request UUID
		req.uuid = uuid()

		// create response object so it can easily be accessed in modularised code
		res.response = {}

		// log the request uuid
		console.log("new request, req.uuid: ", req.uuid)

		// if the request body contains images, pass the req and res objects
		// to the appropriate modularised functions
		if (smarts.getsmart(req, 'body.attachments', undefined) instanceof Array) {
			
			// handle image attachments
			await handleAttachments(req, res) 

		} 

		// always call handleText because the handleAttachments function
		// converts an image into text so we can run handleText whether there were images or only text
		await handleText(req, res)	
		
		// send the response object generated by handleText and handleAttachments
		res.status(200).send(res.response)
			

	} catch (err) {

		// if no response has already been sent, send the error generated
		if(!res._headerSent){
			console.error("err: ", err)
			// sends error
			res.status(500).send()
		}
	}

	// if no response has already been sent, send a status 200
	// with an error message
	if(!res._headerSent){
		res.status(200).send({
			info: returnMessage
		})
	}

})

// done initializing
console.log("Facebook Waste Management API started!")
