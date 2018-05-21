const ghpages = require('gh-pages')
const chalk = require('chalk')
const ora = require('ora')
const path = require('path')
const config = require('../config')

const spinner = ora('building for production...')
spinner.start()
ghpages.publish(path.join(config.build.assetsRoot, config.build.assetsSubDirectory), function(err) {
  spinner.stop()
  if (err) throw err


  console.log(chalk.cyan('  Deployed to github pages.\n'))
});
