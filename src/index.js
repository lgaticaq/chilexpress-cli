#!/usr/bin/env node

const program = require('commander')
const chilexpress = require('chilexpress')
const chalk = require('chalk')
const updateNotifier = require('update-notifier')
// @ts-ignore
const pkg = require('../package.json')
const ora = require('ora')
// eslint-disable-next-line no-console
const log = console.log

updateNotifier({ pkg }).notify()

/**
 * @typedef {import('commander').Command} Command
 */
/**
 * @param {Command} command -
 * @returns {void} -
 * @example
 * program.action(getOrder)
 */
const getOrder = command => {
  const orderId = command.args[0]
  const spinner = ora('Searching...')
  spinner.start()
  chilexpress(orderId)
    .then(data => {
      spinner.stop()
      log(chalk.green(`Order ID: ${orderId}`))
      log(chalk.green(`Product: ${data.shipping.product}`))
      log(chalk.green(`Service: ${data.shipping.service}`))
      log(chalk.green(`Status: ${data.status}`))
      const pattern = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):\d{2}\.\d+Z/
      if (data.status === 'Entregado') {
        /** @type {string|number} */
        let deliveryHour =
          parseInt(
            data.delivery.date.toISOString().replace(pattern, '$4'),
            10
          ) - 3
        if (deliveryHour < 10) deliveryHour = `0${deliveryHour}`
        const deliveryDate = data.delivery.date
          .toISOString()
          .replace(pattern, `$1-$2-$3 ${deliveryHour}:$5`)
        log(chalk.green(`Delivery: ${deliveryDate}`))
        log(
          chalk.green(`Receptor: ${data.delivery.name} (${data.delivery.rut})`)
        )
      }
      log(chalk.green('History:'))
      data.history.forEach(history => {
        /** @type {string|number} */
        let historyHour =
          parseInt(history.date.toISOString().replace(pattern, '$4'), 10) - 3
        if (historyHour < 10) historyHour = `0${historyHour}`
        const historyDate = history.date
          .toISOString()
          .replace(pattern, `$1-$2-$3 ${historyHour}:$5`)
        log(chalk.green(`${historyDate}: ${history.activity}`))
      })
      return true
    })
    .catch(err => {
      spinner.stop()
      log(chalk.red(`Error: ${err.message}`))
    })
}

program
  .version(pkg.version)
  .usage('<orderId>')
  .description('Check shipping status in chilexpress')
  .action(getOrder)
  .parse(process.argv)

if (program.args.length === 0) program.help()
