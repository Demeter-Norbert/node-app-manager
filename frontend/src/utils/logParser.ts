export interface ParsedLog {
  timeStr: string;
  showTime: boolean;
  messageStr: string;
  textColor: string;
}

export const parseLogs = (rawLogs: string[]): ParsedLog[] => {
  let isInErrorBlock = false;

  const filteredLogs = rawLogs.filter(log => {
    const regex = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})\.\d+Z\s?(.*)/;
    const match = log.match(regex);
    const msg = match ? match[2] : log;
    return msg.trim() !== "";
  });

  return filteredLogs.map((log, index) => {
    const regex = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})\.\d+Z\s?(.*)/;
    const match = log.match(regex);

    let timeStr = "";
    let messageStr = log;

    if (match) {
      timeStr = match[1].replace('T', ' ');
      messageStr = match[2];
    }

    let showTime = true;
    if (index > 0) {
      const prevMatch = filteredLogs[index - 1].match(regex);
      if (prevMatch && prevMatch[1].replace('T', ' ') === timeStr) {
        showTime = false;
      }
    }

    const lowerMsg = messageStr.toLowerCase();
    const isErrorKeyword = lowerMsg.includes("error") || lowerMsg.includes("err!") || lowerMsg.includes("failed") || lowerMsg.includes("exception");
    
    const isContinuation = 
      messageStr.startsWith(" ") || 
      messageStr.startsWith("}") || 
      messageStr.startsWith("]") || 
      messageStr.startsWith("/") || 
      messageStr.trim().startsWith("^") || 
      messageStr.trim().startsWith("throw ") || 
      messageStr.startsWith("at ");

    if (isErrorKeyword) {
      isInErrorBlock = true;
    } else if (!isContinuation) {
      isInErrorBlock = false;
    }

    let textColor = "text-green-400";
    if (isInErrorBlock) {
      textColor = isErrorKeyword ? "text-red-400 font-bold" : "text-red-400/80"; 
    } else if (lowerMsg.includes("warn")) {
      textColor = "text-yellow-400";
    }

    return { timeStr, showTime, messageStr, textColor };
  });
};