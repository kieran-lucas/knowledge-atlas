import re,json
text=open('docs/syllabus-extracted.txt',encoding='utf-8').read()
section=None; current=None; items={}
for line in text.splitlines():
 line=line.strip()
 if not line: continue
 m=re.match(r'^(XII|XI|VIII|VII|VI|IV|IX|III|II|V|X|I)\.\s*(.*)$',line)
 if m:
  section=m.group(1);current=None;continue
 m=re.match(r'^(\d+)\.\s*(.*)$',line)
 if m and section:
  current=f'{section}.{m.group(1)}';items[current]=m.group(2);continue
 if current and line!='2':items[current]+=' '+line
assert len(items)==64, len(items)
open('src/syllabus-original.json','w',encoding='utf-8').write(json.dumps(items,ensure_ascii=False,indent=2)+'\n')
