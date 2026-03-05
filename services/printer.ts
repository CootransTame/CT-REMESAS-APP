import { registerPlugin } from '@capacitor/core';

interface PrinterPlugin {
  print(options: { content: string; name?: string }): Promise<void>;
}

const Printer = registerPlugin<PrinterPlugin>('Printer');

export default Printer;
