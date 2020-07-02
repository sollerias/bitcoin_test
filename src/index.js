const chalk = require('chalk');
const app = require('./app');

const port = process.env.PORT;
app.listen(port, () => {
  console.log(chalk.green.inverse(`\n***** Server is listen on port ${port} *****\n`));
});
