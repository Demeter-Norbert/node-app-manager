import re

def extract_nodejs_error(logs: str) -> str:
    if not logs or not logs.strip():
        return "[No available logs]"

    lines = logs.splitlines()
    error_blocks = []
    current_block = []
    is_capturing = False
    
    error_patterns = [
        r"Error:", r"Exception", r"UnhandledPromiseRejection", 
        r"TypeError:", r"ReferenceError:", r"SyntaxError:", 
        r"EADDRINUSE", r"FATAL ERROR:"
    ]
    
    for line in lines:
        stripped = line.strip()
        
        if any(re.search(pattern, line, re.IGNORECASE) for pattern in error_patterns):
            if current_block:
                error_blocks.append("\n".join(current_block))
                
            current_block = [line] 
            is_capturing = True
            continue
            
        if is_capturing:
            if stripped in ["{", "}", "---", ""] or stripped.endswith("{"):
                continue
                
            if stripped.startswith("at "):
                current_block.append(line)
            elif line.startswith(" ") or line.startswith("\t"):
                current_block.append(line)
            else:
                is_capturing = False
                if current_block:
                    error_blocks.append("\n".join(current_block))
                    current_block = []

    if current_block:
        error_blocks.append("\n".join(current_block))
        
    unique_blocks = []
    for block in error_blocks:
        if block not in unique_blocks:
            unique_blocks.append(block)
            
    if unique_blocks:
        result = "\n\n".join(unique_blocks)
        return result if len(result) < 800 else result[:800] + "\n[...Truncated logs...]"
        
    fallback_logs = "\n".join(lines[-8:])
    return f"[Couldnt find errors, last few log lines:]\n{fallback_logs}"