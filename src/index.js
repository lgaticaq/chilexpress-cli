#!/usr/bin/env node

'use strict';

const program = require('commander');
const chilexpress = require('chilexpress');
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
    const pattern = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):\d{2}\.\d+Z/;
    if (data.isDeliveried) {
      let deliveryHour = data.date.toISOString().replace(pattern, '$4') - 3;
      if (deliveryHour < 10) deliveryHour = `0${deliveryHour}`;
      const deliveryDate = data.date.toISOString().replace(pattern, `$1-$2-$3 ${deliveryHour}:$5`);
      console.log(chalk.green(`Delivery: ${deliveryDate}`));
      console.log(chalk.green(`Receptor: ${data.receptor.name} (${data.receptor.rut})`));
    }
    console.log(chalk.green('History:'));
    for (let i of data.history) {
      let historyHour = i.date.toISOString().replace(pattern, '$4') - 3;
      if (historyHour < 10) historyHour = `0${historyHour}`;
      let historyDate = i.date.toISOString().replace(pattern, `$1-$2-$3 ${historyHour}:$5`);
      console.log(chalk.green(`${historyDate}: ${i.activity}`));
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
