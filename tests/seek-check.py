"""Seek check for the homepage replay: nothing from Sidd's signature may show before the stamp lands,
whichever direction the playhead arrives from. The clips and reduced motion both seek backward.
Run: python3 site/tests/seek-check.py   (needs Playwright with Chromium)"""
import json, pathlib, sys
from playwright.sync_api import sync_playwright
page = (pathlib.Path(__file__).resolve().parent.parent / 'index.html').as_uri()
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1280, 'height': 800})
    pg.goto(page); pg.wait_for_timeout(300)
    rows = json.loads(pg.evaluate('''(function(){var t=HLR.tl,L=HLR.labels,out=[];t.pause();
      var q=function(id){var n=document.getElementById(id);return n?+getComputedStyle(n).opacity:-1};
      var ks=Object.keys(L).sort(function(a,b){return L[a]-L[b]});
      [function(){t.progress(1)},function(){t.progress(0)}].forEach(function(from){ks.forEach(function(k){from();t.seek(L[k]-0.01,false);
        out.push([k,L[k]<L.hit,q('fx-ink'),q('fx-flecks'),q('fx-ring')]);});});
      t.seek(L.hit+0.3,false); out.push(['after-hit',false,q('fx-ink'),0,0]); return JSON.stringify(out)})()'''))
    b.close()
bad = [r for r in rows if r[1] and max(r[2:]) > 0]
ink_after = rows[-1][2]
print('labels checked:', len(rows) - 1, '| early signature marks:', len(bad), '| ink after the hit:', ink_after)
sys.exit(1 if bad or ink_after < 0.99 else 0)
