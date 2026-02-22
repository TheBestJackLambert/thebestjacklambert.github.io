import os
import re

def highlight_python(code):
    # Escape HTML
    code = code.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

    # We can split by lines and tokens
    import tokenize
    from io import BytesIO

    tokens = []
    try:
        for tok in tokenize.tokenize(BytesIO(code.encode('utf-8')).readline):
            tokens.append(tok)
    except:
        pass

    import keyword
    
    out = []
    prev_end = (1, 0)
    lines = code.split('\n')
    
    
    highlighted_lines = []
    for line in lines:
        # separate comment from code
        comment_idx = line.find('#')
        if comment_idx != -1:
            code_part = line[:comment_idx]
            comment_part = line[comment_idx:]
        else:
            code_part = line
            comment_part = ''
            
        # process code_part
        # keywords
        for kw in ['def ', 'for ', 'in ', 'return', 'if ', 'elif ', 'else:', 'while ', 'import ']:
            code_part = re.sub(rf'\b({kw.strip()})\b', rf'<span class="keyword">\1</span>', code_part)
            
        # function names
        code_part = re.sub(r'<span class="keyword">def</span>\s+([a-zA-Z_]\w*)', r'<span class="keyword">def</span> <span class="function">\1</span>', code_part)
        
        # numbers
        # regex for numbers that are not inside HTML tags
        # a simple way is to tokenize by tags
        parts = re.split(r'(<[^>]+>)', code_part)
        for i in range(len(parts)):
            if not parts[i].startswith('<'):
                parts[i] = re.sub(r'\b(\d+(\.\d+)?)\b', r'<span class="number">\1</span>', parts[i])
        code_part = ''.join(parts)
        
        if comment_part:
            comment_part = f'<span class="comment">{comment_part}</span>'
            
        highlighted_lines.append(code_part + comment_part)
        
    return '\n'.join(highlighted_lines)

html_path = 'Project10.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# read python files
with open('../../DSP/trig.py', 'r', encoding='utf-8') as f:
    trig_code = f.read()
    
with open('../../DSP/signals.py', 'r', encoding='utf-8') as f:
    signals_code = f.read()

# highlight
trig_html = highlight_python(trig_code.strip())
signals_html = highlight_python(signals_code.strip())

# replace in HTML using regex matching the blocks
html = re.sub(r'(<code id="trig-code">)[\s\S]*?(</code>)', r'\1' + trig_html.replace('\\', '\\\\') + r'\2', html)
html = re.sub(r'(<code id="dft-code">)[\s\S]*?(</code>)', r'\1' + signals_html.replace('\\', '\\\\') + r'\2', html)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
    
print("Updated Project10.html")
