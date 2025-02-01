const config = require('./src/config/appConfig') //don't remove this else app stop working
const connectDB = require('./src/config/db');
const figlet = require('figlet')
const app = require('./src/app')

const PORT = process.env.PORT || 5000;



connectDB().then(() => {
// set port, listen for requests
app.listen(PORT, () => {

    figlet.text(`A P P O I N T M E N T - B O O K I N G !`, { horizontalLayout: 'default', verticalLayout: 'default', width: 120, whitespaceBreak: true }, function (err, data) {
      if (err) {
        console.log('Something went wrong...');
        console.dir(err);
        return;
      }
      console.log(data);
  
      console.log(`Server is running on http://${process.env.HOST}:${process.env.PORT}.`);
      console.log(`-----------------------------------------------------------------------------------`);
      console.log(`Start Time  : ` + (new Date()).toUTCString());
      console.log(`Environment : ${process.env.NODE_ENV}`);
      console.log(`SERVER_PORT : ${process.env.PORT}`);
      console.log(`-----------------------------------------------------------------------------------`);
    });
  });
});