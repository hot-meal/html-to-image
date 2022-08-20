#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const signale = require('signale')
const ora = require('ora')
const htmlToImage = require('node-html-to-image')

const pkg = require('../package.json')

require('yargs')
  .command('$0 [html] [output]', 'start server',(yargs) => {
    yargs
      .positional('html', {
        describe: 'path to your html file',
      })
      .positional('output', {
        describe: 'where image should be saved',
      })
      .option('type', {
        alias: 't',
        type: 'string',
        default: 'png',
        description: 'image format to save (default:png, optional:jpeg)'
      })
      .option('transparent', {
        type: 'boolean',
        default: false,
        description: 'use a transparent background (default: true, optional: false}'
      })
  }, (argv) => {
    signale.start(`html-to-image v${pkg.version}`)
    if (!fs.existsSync(argv.html)) return signale.error('Please include path to an HTML file as the first parameter.')
    if (!argv.output) return signale.error('Please provide an output destination path as the second paramter.')
    if (!['png', 'jpeg'].includes(argv.type)) return signale.error('Available types: "png" or "jpeg".')

    let content
    if (argv.content) {
      try {
        content = require(path.resolve(argv.content))
      } catch (e) {
        if(e.code === 'MODULE_NOT_FOUND'){
          return signale.error(`Could not find the file ${argv.content}`)
        }
      }
    }

    const spinner = ora('Fetching HTML').start()
    const html = fs.readFileSync(argv.html).toString('utf8')
    spinner.text = 'Generating your image'
    htmlToImage({
      html,
      output: argv.output,
      content,
      type: argv.type,
      transparent: argv.transparent,
    })
      .then(() => {
        spinner.stop()
        signale.success('Image saved!')
      })
      .catch(e => signale.error(e))
  })
  .argv
