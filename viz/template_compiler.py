
from jinja2 import Environment, FileSystemLoader, TemplateNotFound
# import json
import yaml

'''
Quick python3 script to render HTML from a json file of slides
containing the data to be visualized, using the Jinja template engine
'''

env = Environment(loader=FileSystemLoader(""))
env.autoescape = False # allows HTML tags to be read in from strings
env.lstrip_blocks = True # strip the whitespace from jinja template lines
env.trim_blocks = True

templatefile = "viz_template.html"
# datafile = "viz.json"
datafile = "viz.yaml"
outfile = "viz.html"

try:
    with open(datafile,"r") as f:
        data = f.read()
    # data = json.loads(data)
    data = yaml.load(data)
    template = env.get_template(templatefile)
    html = template.render(data=data)
    with open(outfile,"w") as f:
        f.write(html)
    print("wrote %s" % outfile)
except Exception as e:
    print("couldn't save template")
    print(e)




