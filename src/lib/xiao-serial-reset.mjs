const wait = (duration) => new Promise((resolve) => setTimeout(resolve, duration));

/**
 * Pulse the transport control lines so the chip leaves the flasher stub and boots the application.
 * 通过串口控制线产生复位脉冲，让芯片退出烧录程序并启动用户程序。
 */
export async function pulseTransportReset(transport, waitFor = wait) {
  const port = transport.device;
  await port.setSignals({ dataTerminalReady: false, requestToSend: false });
  await waitFor(50);
  await port.setSignals({ dataTerminalReady: false, requestToSend: true });
  await waitFor(100);
  await port.setSignals({ dataTerminalReady: false, requestToSend: false });
}
