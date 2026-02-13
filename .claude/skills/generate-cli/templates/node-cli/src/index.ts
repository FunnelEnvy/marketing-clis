import { Command } from 'commander';
// Import command groups here:
// import { registerFooCommands } from './commands/foo.js';

const program = new Command();

program
  .name('{{BINARY_NAME}}')
  .description('{{TOOL_DESCRIPTION}}')
  .version('0.1.0');

// Register command groups:
// registerFooCommands(program);

program.parse();
