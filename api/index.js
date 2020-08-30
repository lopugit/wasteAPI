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

app.use(bodyParser.urlencoded({ limit: '100mb', extended: false }));
app.use(bodyParser.json({ limit: '100mb'}));

app.listen(config.port, () => console.log(`Facebook Waste Management API listening on ${config.port}!`));

app.get('/', (req, res) => res.send('Hello API World!'));

app.post('/info', async (req,res)=>{
	try {
		
		req.uuid = uuid()
		
		console.log("new request, req:", req.body, req.uuid)

		if(req.body.attachments && req.body.attachments instanceof Array){
			await handleAttachments(req, res)
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
