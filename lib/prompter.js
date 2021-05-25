const ip = require('./ipFetcher');
const inquirer = require('inquirer');

exports.prompt = async (defaultIp = '127.0.0.1', port = 3000) => {

    let addr = [defaultIp];

    for (let [key, val] of Object.entries(ip.getIP())) {
        addr.push(...val);
    }

    let questions = [{
        type: 'list',
        name: 'ip',
        message: "Select IP to host server",
        choices: addr
    }];

    return (await inquirer.prompt(questions)).ip;
}