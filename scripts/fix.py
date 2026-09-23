import re
path = r'C:\Users\Benard\Downloads\Desktop\tkmaster\server\server.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()
content = re.sub(r"title: '.*? New Event Posted!'", "title: '?? New Event Posted!'", content)
content = re.sub(r"message: \$\{newEvent\.title\}.*?\$\{newEvent\.date\} at \$\{newEvent\.location\}", "message: ${newEvent.title} –  at ", content)
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
