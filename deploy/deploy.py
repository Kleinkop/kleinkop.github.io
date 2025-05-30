import os
import re

import requests

SITE_NAME = "FLY.AI"
STEP_TEMPLATE_PATH = "../step_template.html"
TEMPLATE_PATH = "../template.html"

## PLACEHOLDERS
STEP_ID = "$STEP_ID"
STEP_SRC = "$STEP_SRC"
STEP_TEXT = "$STEP_TEXT"

TITLE = "$TITLE"
PROJECT_NAME = "$PROJECT_NAME"
PROJECT_TEXT = "$PROJECT_TEXT"
FINAL_SRC = "$FINAL_SRC"
STEPS = "$STEPS"


def read_datafile(path: str) -> list[tuple[str, str]]:
    ret = []
    path = path if os.path.exists(path) else os.path.join("deploy/", path)
    with open(path, mode="r") as fd:
        for line in fd:
            splits = line.split()
            if len(splits) != 2:
                print(f"Line could not be read: {line}")
                continue
            url, name = splits
            ret.append((url, name))
    return ret


def get_url(url: str) -> str:
    r = requests.get(url=url)
    html = r.text
    return html

text_pattern = re.compile(r"<p.*?>(?P<text>.*?)</p>")
img_url_pattern = re.compile(r"<p.*?<img.*?src=\"(?P<img_url>.*?)\".*?/>.*</p>")
def extract_information_from_webpage(site_text: str) -> tuple[str, str, list[str], list[str]]:
    m = re.search(r"<article.*itemtype=\"https://schema.org/Article\">.*class=\"td-post-content tagdiv-type\"(?P<article>.*)</article>", site_text, re.DOTALL)
    
    if m is None:
        raise ValueError("Site does not match pattern.")
    
    article = m.group("article")

    m = re.search(r"class=\"td-post-featured-image\">.*?<a.*?href=\"(?P<featured_url>.*?)\"", article, re.DOTALL)
    if m is None:
        raise ValueError("Thumbnail not found")
    main_image_url = m.group("featured_url")

    m = re.search(r"<!-- content -->.*?\n.*?<p>(?P<introduction>.*?)</p>", article)
    if m is None:
        raise ValueError("Introduction not found")
    introduction = m.group("introduction")

    m = re.search(r"^<h4.*?</h4>(?P<content>.*?)<div.*?class=\"snippet-type-10\"", article, re.DOTALL | re.MULTILINE)
    if m is None:
        raise ValueError("Main content not found")
      
    
    content = m.group("content")
    content_lines = filter(lambda x: len(x) > 0., map(str.strip, content.split("\n")))

    img_urls = []
    texts = []
    for l in content_lines:
        if (im := img_url_pattern.match(l)) is not None:
            img_urls.append(im.group("img_url"))
        elif (m := text_pattern.match(l)) is not None:
            texts.append(m.group("text"))

    return main_image_url, introduction, img_urls, texts


def load_image(img_url: str, path: str):
    r = requests.get(img_url)
    with open(path, mode="wb") as fdw:
        fdw.write(r.content)
        return path    
def load_images(img_list: list[str], parent_dir: str, base_name: str):
    new_paths = []
    for n, url in enumerate(img_list):
        cur_path = f"{parent_dir}/{base_name}_{n}.jpg"
        new_paths.append(cur_path)
        if os.path.exists(cur_path):
            continue
        load_image(url, cur_path)
    return new_paths

def build_step(step_imgs: list[str], step_txts: list[str], step_template_path: str = STEP_TEMPLATE_PATH) -> str:
    with open(step_template_path, mode="r", encoding="utf-8") as fd:
        template = fd.read()

    step_strs = []
    for n, (txt, img) in enumerate(zip(step_txts, step_imgs)):
        cur_step = template.replace(STEP_ID, str(n+1))
        cur_step = cur_step.replace(STEP_SRC, img)
        cur_step = cur_step.replace(STEP_TEXT, txt)
        step_strs.append(cur_step)

    return "".join(step_strs)

def build_page(name: str, thumbnail: str, intro: str, steps: str, template_path: str = TEMPLATE_PATH) -> str:
    with open(template_path, mode="r", encoding="utf-8") as fd:
        template = fd.read()

    var_mapping = {TITLE: SITE_NAME, PROJECT_NAME: name, FINAL_SRC: thumbnail, PROJECT_TEXT: intro, STEPS: steps}
    for k in var_mapping.keys():
        template = template.replace(k, var_mapping[k])
    return template

def save_page(path: str, site: str):
    with open(path, mode="w", encoding="utf-8") as fdw:
        fdw.write(site)

def process_page(url: str, name: str, base_dir: str):
    site = get_url(url)
    save_page(f"{base_dir}/debug_{name}.html", site)
    
    main_image_url, introduction, img_urls, texts = extract_information_from_webpage(site)
    img_urls = load_images(img_list=img_urls, parent_dir="../images", base_name=name)
    steps = build_step(step_imgs=img_urls, step_txts=texts)
    page = build_page(name=name, 
                      thumbnail=main_image_url,
                      intro=introduction,
                      steps=steps)
    save_page(f"{base_dir}/{name}.html", page)



if __name__ == "__main__":
    print(os.getcwd())
    sites = read_datafile("data.txt")
    for site in sites:
        process_page(site[0], site[1], "../pages")