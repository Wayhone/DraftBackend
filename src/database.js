const mongoose = require('mongoose');
const uri = "mongodb+srv://rice_wx19:ne7wZ4DkjQXhIpeA@cluster0.ae38z.mongodb.net/ricebookFinal?retryWrites=true&w=majority";

// const connector =   
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// ************** connect status *********************
mongoose.connection.on('connected', function() {
	console.log('Mongoose connected to ' + uri)
})
mongoose.connection.on('error', function(err) {
	console.error('Mongoose connection error: ' + err)
})
mongoose.connection.on('disconnected', function() {
	console.log('Mongoose disconnected')
})