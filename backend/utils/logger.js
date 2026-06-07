const chalk = require('chalk');
const boxen = require('boxen');
const Table = require('cli-table3');

class Logger {
  constructor() {
    this.startTime = Date.now();
  }

  // Mensagem de sucesso
  success(message, data = null) {
    const output = chalk.green.bold('✅ ') + chalk.green(message);
    console.log(output);
    if (data) {
      console.log(chalk.gray(JSON.stringify(data, null, 2)));
    }
    return output;
  }

  // Mensagem de erro
  error(message, error = null) {
    const output = chalk.red.bold('❌ ') + chalk.red(message);
    console.log(output);
    if (error) {
      console.error(chalk.red(error.stack || error));
    }
    return output;
  }

  // Mensagem de aviso
  warning(message) {
    const output = chalk.yellow.bold('⚠️  ') + chalk.yellow(message);
    console.log(output);
    return output;
  }

  // Mensagem de informação
  info(message) {
    const output = chalk.blue.bold('ℹ️  ') + chalk.blue(message);
    console.log(output);
    return output;
  }

  // Mensagem de destaque
  highlight(message) {
    const boxed = boxen(chalk.cyan(message), {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan'
    });
    console.log(boxed);
    return boxed;
  }

  // Requisição HTTP
  request(method, url, status = null) {
    let methodColor;
    switch (method) {
      case 'GET': methodColor = chalk.green; break;
      case 'POST': methodColor = chalk.yellow; break;
      case 'PUT': methodColor = chalk.blue; break;
      case 'DELETE': methodColor = chalk.red; break;
      default: methodColor = chalk.white;
    }
    
    let statusColor = status >= 200 && status < 300 ? chalk.green :
                      status >= 400 ? chalk.red : chalk.yellow;
    
    const log = `${methodColor(method)} ${url} ${statusColor(status || '')}`;
    console.log(chalk.gray(`[${new Date().toLocaleTimeString()}] `) + log);
    return log;
  }

  // Tabela de dados
  table(headers, rows) {
    const table = new Table({
      head: headers.map(h => chalk.cyan(h)),
      style: { head: [], border: [] }
    });
    
    rows.forEach(row => table.push(row));
    console.log(table.toString());
    return table;
  }

  // Separador
  divider() {
    console.log(chalk.gray('─'.repeat(80)));
  }

  // Tempo de execução
  executionTime(label = 'Execução') {
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(2);
    console.log(chalk.magenta(`⏱️  ${label}: ${elapsed}s`));
    return elapsed;
  }

  // Banner de inicialização
  banner(title, subtitle = '') {
    const bannerText = `
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   ${chalk.bold.magenta(title)}${subtitle ? '\n   ' + chalk.gray(subtitle) : ''}
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    `;
    console.log(bannerText);
  }
}

module.exports = new Logger();