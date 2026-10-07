const fs=require('fs'),path=require('path');
const root='E:/dev/my_projects/Vibe Coding',temp='C:/Users/10524/AppData/Local/Temp';
const entries=[
 ['kindle_notes_exporter','9ec8bfa0-2810-4f10-a1b6-2f458fbe9e6b','Kindle 笔记导出工具界面','kindle-preview.png','kindle'],
 ['PC_System_Auto_Scripts','6ad8970b-8ee7-47ca-8243-881ef71dd053','电脑守护精灵：电源计划监控与启动项管理','pc-guardian-preview.png','pc-guardian'],
 ['youtube_unlike_delete_script','8fd591e6-a257-44a8-89c3-2ab9f22d462b','YouTube 取消点赞脚本：慢速与快速清理控制台','youtube-unlike-preview.png','youtube-unlike'],
 ['auto_clean-readme','c30dc131-9938-41bc-b623-07ed570c9344','AutoClean：清理项目、定时设置与运行记录','autoclean-preview.png','auto-clean'],
 ['SakuraLoveForever','87bfa8b1-60c2-49c4-ad92-6aaa21c87acc','SakuraLoveForever GitHub 个人主页预览','github-profile-preview.png','github-profile'],
];
for(const [repo,id,alt,image] of entries){
 const dir=path.join(root,repo),src=path.join(temp,`codex-clipboard-${id}.png`),dest=path.join(dir,'docs/images',image);
 fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(src,dest);
 const readme=path.join(dir,'README.md');let text=fs.readFileSync(readme,'utf8');
 const block=`## ${repo==='SakuraLoveForever'?'主页预览':'界面预览'}\n\n![${alt}](docs/images/${image})\n\n`;
 if(repo==='youtube_unlike_delete_script')text=text.replace('![截图](screenshot.png)',block.trim());
 else if(repo==='SakuraLoveForever')text=text.trimEnd()+'\n\n'+block+'截图为静态展示，实时统计以主页上的动态徽章为准。\n';
 else text=text.replace('## 功能',block+'## 功能');
 fs.writeFileSync(readme,text);
 fs.copyFileSync(src,path.join(__dirname,'../../assets/projects',image));
 console.log(repo+': '+image+' ('+fs.statSync(dest).size+' bytes)');
}
