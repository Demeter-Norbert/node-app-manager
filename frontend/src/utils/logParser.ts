import { ParsedLog } from '../types';

export const parseLogs = (rawLogs: string[]): ParsedLog[] => {
  let isInErrorBlock = false;
  let lastTimeStr = ""; 

  const regex = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)\s?(.*)/;

  const filteredLogs = rawLogs.filter(log => {
    const match = log.match(regex);
    const msg = match ? match[2] : log;
    return msg.trim() !== "";
  });

  return filteredLogs.map((log) => {
    const match = log.match(regex);

    let timeStr = "";
    let messageStr = log;

    if (match) {
      const dateObj = new Date(match[1]);
      
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const hours = String(dateObj.getHours()).padStart(2, '0');
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');
      const seconds = String(dateObj.getSeconds()).padStart(2, '0');
      
      timeStr = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      messageStr = match[2];
    }

    let showTime = true;
    if (timeStr && timeStr === lastTimeStr) {
      showTime = false;
    }
    
    if (timeStr) {
      lastTimeStr = timeStr;
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