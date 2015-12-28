#!/usr/bin/env node

'use strict';

import program from 'commander';
import chilexpress from 'chilexpress';
import moment from 'moment';
import pkg from '../package.json';

const getOrder = (orderId) => {
  chilexpress(orderId, (err, data) => {
    if (err) console.log(err.message);
    console.log(`Order ID: ${data.orderId}`);
    console.log(`Product: ${data.product}`);
    console.log(`Service: ${data.service}`);
    console.log(`Status: ${data.status}`);
    if (data.isDeliveried) {
      console.log(`Delivery: ${moment(data.delivery).format('YYYY-MM-DD HH:mm')}`);
      console.log(`Receptor: ${data.receptor.name} (${data.receptor.rut})`);
    }
    console.log('History:');
    for (let i of data.history) {
      console.log(`${moment(i.datetime).format('YYYY-MM-DD HH:mm')}: ${i.activity}`);
    }
  });
};

program
  .version(pkg.version)
  .action(getOrder)
  .parse(process.argv);

if (program.args.length === 0) program.help();
