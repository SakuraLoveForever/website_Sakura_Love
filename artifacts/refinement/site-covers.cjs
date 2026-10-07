const fs=require('fs');
const entries=[
 ['Kindle Notes Exporter','Kindle笔记导出工具','kindle-preview.png'],
 ['PC Guardian','电脑守护精灵','pc-guardian-preview.png'],
 ['YouTube Unlike Helper','YouTube取消点赞脚本','youtube-unlike-preview.png'],
 ['auto_clean','AutoClean 定时清理工具','autoclean-preview.png'],
 ['GitHub Profile','GitHub个人首页','github-profile-preview.png'],
];
let html=fs.readFileSync('index.html','utf8');
for(const [label,alt,file] of entries){
 const pattern=new RegExp('(<a class="card-cover) card-cover--symbol("[^>]*aria-label="'+label+'"[^>]*>)[\\s\\S]*?</a>');
 if(!pattern.test(html))throw Error('Missing cover '+label);
 html=html.replace(pattern,`$1$2\n                  <img src="assets/projects/${file}" alt="${alt}界面截图" loading="lazy" decoding="async" />\n                </a>`);
}
fs.writeFileSync('index.html',html);
