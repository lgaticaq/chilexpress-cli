#!/usr/bin/env node

'use strict';

const program = require('commander');
const chilexpress = require('chilexpress');
const moment = require('moment');
const chalk = require('chalk');
const updateNotifier = require('update-notifier');
const pkg = require('../package.json');
const ora = require('ora');

updateNotifier({pkg}).notify();

const getOrder = orderId => {
  const spinner = ora('Searching...');
  spinner.start();
  chilexpress(orderId).then(data => {
    spinner.stop();
    console.log(chalk.green(`Order ID: ${data.orderId}`));
    console.log(chalk.green(`Transport ID: ${data.transportId}`));
    console.log(chalk.green(`Product: ${data.product}`));
    console.log(chalk.green(`Service: ${data.service}`));
    console.log(chalk.green(`Status: ${data.status}`));
    if (data.isDeliveried) {
      console.log(chalk.green(`Delivery: ${moment(data.delivery.datetime).format('YYYY-MM-DD HH:mm')}`));
      console.log(chalk.green(`Receptor: ${data.receptor.name} (${data.receptor.rut})`));
    }
    console.log(chalk.green('History:'));
    for (let i of data.history) {
      console.log(chalk.green(`${moment(i.datetime).format('YYYY-MM-DD HH:mm')}: ${i.activity}`));
    }
  }).catch(err => {
    spinner.stop();
    console.log(chalk.red(`Error: ${err.message}`));
  });
};

program
  .version(pkg.version)
  .usage('<orderId>')
  .description('Check shipping status in chilexpress')
  .action(getOrder)
  .parse(process.argv);

if (program.args.length === 0) program.help();
