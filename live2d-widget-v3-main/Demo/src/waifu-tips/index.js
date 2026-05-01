import Model from "./model.js";
import showMessage from "./message.js";
import { randomSelection } from "./utils.js";
import tools from "./tools.js";

function loadWidget(config) {
    const model = new Model(config);
    localStorage.removeItem("waifu-display");
    sessionStorage.removeItem("waifu-text");
    document.body.insertAdjacentHTML("beforeend", `<div id="waifu">
            <div id="waifu-tips"></div>
            <canvas id="live2d" width="800" height="800"></canvas>
            <div id="waifu-tool"></div>
        </div>`);
    // https://stackoverflow.com/questions/24148403/trigger-css-transition-on-appended-element
    setTimeout(() => {
        document.getElementById("waifu").style.bottom = 0;
    }, 0);

    (function registerTools() {
        tools["switch-model"].callback = () => model.switchModel();
        tools["switch-texture"].callback = () => model.switchTextures();
        if (!Array.isArray(config.tools)) {
            config.tools = Object.keys(tools);
        }
        for (let tool of config.tools) {
            if (tools[tool]) {
                const { icon, callback } = tools[tool];
                document.getElementById("waifu-tool").insertAdjacentHTML("beforeend", `<span id="waifu-tool-${tool}">${icon}</span>`);
                document.getElementById(`waifu-tool-${tool}`).addEventListener("click", callback);
            }
        }
    })();

    function registerEventListener(result) {
        jsonData = result;
        // 检测用户活动状态，并在空闲时显示消息
        let userAction = false,
            userActionTimer,
            messageArray = result.message.default;
        window.addEventListener("mousemove", () => userAction = true);
        window.addEventListener("keydown", () => userAction = true);
        setInterval(() => {
            if (userAction) {
                userAction = false;
                clearInterval(userActionTimer);
                userActionTimer = null;
            } else if (!userActionTimer) {
                userActionTimer = setInterval(() => {
                    showMessage(messageArray, 6000, 9);
                }, 20000);
            }
        }, 1000);
        showMessage(welcomeMessage(), 7000, 11);
        window.addEventListener("mouseover", event => {
            for (let { selector, text } of result.mouseover) {
                if (!event.target.closest(selector)) continue;
                text = randomSelection(text);
                text = text.replace("{text}", event.target.innerText);
                showMessage(text, 4000, 8);
                return;
            }
        });
        window.addEventListener("click", event => {
            for (let { selector, text } of result.click) {
                if (!event.target.closest(selector)) continue;
                text = randomSelection(text);
                text = text.replace("{text}", event.target.innerText);
                showMessage(text, 4000, 8);
                return;
            }
        });
        result.seasons.forEach(({ date, text }) => {
            const now = new Date(),
                after = date.split("-")[0],
                before = date.split("-")[1] || after;
            if ((after.split("/")[0] <= now.getMonth() + 1 && now.getMonth() + 1 <= before.split("/")[0]) && (after.split("/")[1] <= now.getDate() && now.getDate() <= before.split("/")[1])) {
                text = randomSelection(text);
                text = text.replace("{year}", now.getFullYear());
                messageArray.push(text);
            }
        });

        const devtools = () => { };
        console.log("%c", devtools);
        devtools.toString = () => {
            showMessage(result.message.console, 6000, 9);
        };
        window.addEventListener("copy", () => {
            showMessage(result.message.copy, 6000, 9);
        });
        window.addEventListener("visibilitychange", () => {
            if (!document.hidden) showMessage(result.message.visibilitychange, 6000, 9);
        });
    }

    /**
     * 注册移动事件
     */
    function registerMoveEventListener() {
        if (config.dragEnable === false) {
            return;
        }
        const waifu = document.getElementById("waifu");
        const live2d = document.getElementById("live2d")
        let isDown = false;
        let waifuLeft;
        let mouseLeft;
        let waifuTop;
        let mouseTop;
        // 鼠标点击监听
        waifu.onmousedown = function (e) {
            isDown = true;
            // 记录x轴
            waifuLeft = waifu.offsetLeft;
            mouseLeft = e.clientX;
            // 记录y轴
            waifuTop = waifu.offsetTop;
            mouseTop = e.clientY;
        }
        // 鼠标移动监听
        const isDirectionEmpty = !config.dragDirection || config.dragDirection.length === 0;
        window.onmousemove = function (e) {
            if (!isDown) {
                return;
            }
            // x轴移动
            if (isDirectionEmpty || config.dragDirection.includes("x")) {
                let currentLeft = waifuLeft + (e.clientX - mouseLeft);
                if (currentLeft < 0) {
                    currentLeft = 0;
                } else if (currentLeft > window.innerWidth - live2d.clientWidth) {
                    currentLeft = window.innerWidth - live2d.clientWidth;
                }
                waifu.style.left = currentLeft  + "px";
            }
            // y轴移动
            if (isDirectionEmpty || config.dragDirection.includes("y")) {
                let currentTop = waifuTop + (e.clientY - mouseTop);
                if (currentTop < 30) {
                    currentTop = 30
                } else if (currentTop > window.innerHeight - live2d.clientHeight + 10) {
                    currentTop = window.innerHeight - live2d.clientHeight + 10
                }
                waifu.style.top = currentTop + "px";
            }
        }
        // 鼠标点击松开监听
        window.onmouseup = function (e) {
            isDown = false;
        }
    }

    (function initModel() {
        let modelId = localStorage.getItem("modelId"),
            modelTexturesId = localStorage.getItem("modelTexturesId");
        if (modelId === null) {
            // 首次访问加载 指定模型 的 指定材质
            modelId = 0; // 模型 ID
            modelTexturesId = 0; // 材质 ID
        }
        new Promise((resolve, reject) => {
            // 初始化live2d
            window.live2d.init(config.cdnPath + "model/")
            resolve()
        }).then(() => {
            // 加载live2d模型
            model.loadModel(modelId, modelTexturesId);
        })
        fetch(config.waifuPath)
            .then(response => response.json())
            .then(registerEventListener)
            .then(registerMoveEventListener);
    })();
}

function initWidget(config, apiPath) {
    if (typeof config === "string") {
        config = {
            waifuPath: config,
            apiPath
        };
    }
    homePath = config.homePath;
    document.body.insertAdjacentHTML("beforeend", `<div id="waifu-toggle">
            <span>看板娘</span>
        </div>`);
    const toggle = document.getElementById("waifu-toggle");
    toggle.addEventListener("click", () => {
        toggle.classList.remove("waifu-toggle-active");
        if (toggle.getAttribute("first-time")) {
            loadWidget(config);
            toggle.removeAttribute("first-time");
        } else {
            localStorage.removeItem("waifu-display");
            document.getElementById("waifu").style.display = "";
            setTimeout(() => {
                document.getElementById("waifu").style.bottom = 0;
            }, 0);
        }
    });
    if (localStorage.getItem("waifu-display") && Date.now() - localStorage.getItem("waifu-display") <= 86400000) {
        toggle.setAttribute("first-time", true);
        setTimeout(() => {
            toggle.classList.add("waifu-toggle-active");
        }, 0);
    } else {
        loadWidget(config);
    }
}

let jsonData = null;
let homePath = '/';
function welcomeMessage() {
    if (location.pathname === homePath) { // 如果是主页
        for (let { hour, text } of jsonData.time) {
            const now = new Date(),
                after = hour.split("-")[0],
                before = hour.split("-")[1] || after;
            if (after <= now.getHours() && now.getHours() <= before) {
                return text;
            }
        }
    }
    const text = `欢迎阅读<span>「${document.title.split(" - ")[0]}」</span>`;
    let from;
    if (document.referrer !== "") {
        const referrer = new URL(document.referrer),
            domain = referrer.hostname.split(".")[1];
        const domains = {
            "baidu": "百度",
            "so": "360搜索",
            "google": "谷歌搜索"
        };
        if (location.hostname === referrer.hostname) return text;

        if (domain in domains) from = domains[domain];
        else from = referrer.hostname;
        return `Hello！来自 <span>${from}</span> 的朋友<br>${text}`;
    }
    return text;
}

function showWelcomeMessage() {
    showMessage(welcomeMessage(), 7000, 11);
}

export {initWidget, showWelcomeMessage};
